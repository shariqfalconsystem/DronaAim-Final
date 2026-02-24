import { TextField, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { MdSave } from 'react-icons/md';
import { updateDraft, publishDraft, createMediaUploadUrl } from '../../../../services/admin/helpCenterServices';
import EditorComponent, { EditorComponentRef } from '../editor';
import { getFileCategory, getMimeType, isFileTypeAllowed, validateFileSize } from '../create-draft/file-utilities';

async function uploadToS3(file: File, presignedURL: string, mimeType: string): Promise<boolean> {
  try {
    const fileData = await file.arrayBuffer();
    const response = await fetch(presignedURL, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: fileData,
    });
    return response.ok;
  } catch (error) {
    console.error('Error during S3 upload:', error);
    return false;
  }
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  fileType: 'image' | 'video' | 'pdf' | 'other';
  fileName: string;
}

const StyledTextField = (props: any) => (
  <TextField
    {...props}
    variant="outlined"
    fullWidth
    inputRef={props.inputRef}
    sx={{
      mb: 2,
      '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#e0e0e0' },
        '&:hover fieldset': { borderColor: '#bdbdbd' },
        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
      },
      '& .MuiInputBase-input': {
        fontSize: props.title ? '24px' : '16px',
        fontWeight: props.title ? '500' : '400',
      },
      ...props.sx,
    }}
  />
);

const EditModeComponent = ({
  publishedData,
  draftId,
  onExitEditMode,
  currentUserId,
  showNotification,
  navigate,
}: any) => {
  const [editTitle, setEditTitle] = useState(publishedData?.title || '');
  const [editSubTitle, setEditSubTitle] = useState(publishedData?.subTitle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileType: 'other',
    fileName: '',
  });
  // Track the current editor content to preserve media references
  const [currentEditorContent, setCurrentEditorContent] = useState(publishedData?.content || null);

  const editorRef = useRef<EditorComponentRef>(null);
  const updateDraftTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(publishedData?.title || '');
    setEditSubTitle(publishedData?.subTitle || '');
    setCurrentEditorContent(publishedData?.content || null);
  }, [publishedData]);

  const handleFileUpload = async (file: File) => {
    if (!currentUserId || !draftId) {
      showNotification('Missing user ID or draft ID', 'error');
      throw new Error('Missing user ID or draft ID');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!isFileTypeAllowed(fileExt)) {
      showNotification('Unsupported file type. Please upload an image, PDF, or supported video format.', 'error');
      return {
        success: 0,
        error: 'Unsupported file type. Please upload an image, PDF, or supported video format.',
      };
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      showNotification(sizeValidation.message, 'error');
      return { success: 0, error: sizeValidation.message };
    }

    const mimeType = getMimeType(fileExt);
    const fileCategory = getFileCategory(mimeType);
    const contentType = fileExt === 'pdf' ? 'application/pdf' : mimeType;

    setUploadState({
      isUploading: true,
      progress: 10,
      fileType: fileCategory as 'image' | 'video' | 'pdf' | 'other',
      fileName: file.name,
    });

    try {
      setUploadState((prev) => ({ ...prev, progress: 30 }));

      const response = await createMediaUploadUrl(currentUserId, {
        draftId: draftId,
        fileName: file.name,
        contentType: contentType,
        type: 'HelpCenterMediaUpload',
      });

      setUploadState((prev) => ({ ...prev, progress: 50 }));

      const uploadSuccess = await uploadToS3(file, response.data.putUrl, contentType);
      setUploadState((prev) => ({ ...prev, progress: 90 }));

      if (!uploadSuccess) {
        throw new Error(`Failed to upload ${fileCategory} to S3`);
      }

      const localBlobUrl = URL.createObjectURL(file);

      setUploadState((prev) => ({ ...prev, progress: 100 }));

      return {
        success: 1,
        file: {
          url: localBlobUrl,
          docRef: response.data.docRef,
          contentType: mimeType,
          fileName: file.name,
          extension: fileExt,
          fileCategory: fileCategory,
        },
      };
    } catch (error) {
      console.error(`Error uploading ${fileCategory}:`, error);
      showNotification(`Failed to upload ${fileCategory}`, 'error');
      return { success: 0, error: `${fileCategory.charAt(0).toUpperCase() + fileCategory.slice(1)} upload failed` };
    } finally {
      setUploadState({
        isUploading: false,
        progress: 0,
        fileType: 'other',
        fileName: '',
      });
      setHasChanges(true);
    }
  };

  const debounceSave = () => {
    if (updateDraftTimerRef.current) {
      clearTimeout(updateDraftTimerRef.current);
    }
    updateDraftTimerRef.current = setTimeout(() => {
      saveChanges();
    }, 5000);
  };

  const handleEditorChange = () => {
    setHasChanges(true);
    debounceSave();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
    setHasChanges(true);
    debounceSave();
  };

  const handleSubTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditSubTitle(e.target.value);
    setHasChanges(true);
    debounceSave();
  };

  // Process editor content before saving to preserve media references
  const processEditorContent = (content: any) => {
    if (!content || !content.blocks) return content;

    // Make a deep copy to avoid mutations
    const processedContent = JSON.parse(JSON.stringify(content));

    processedContent.blocks = processedContent.blocks.map((block: any) => {
      // For existing image blocks
      if (block.type === 'image' && block.data && block.data.file) {
        // Ensure the original signedUrl is maintained
        if (!block.data.file.signedUrl && block.data.file.url) {
          // Find the matching block in the original content
          const originalBlock = currentEditorContent?.blocks?.find((origBlock: any) => {
            return (
              origBlock.type === 'image' &&
              origBlock.data &&
              origBlock.data.file &&
              // Match based on file properties like name, size, etc.
              (origBlock.data.file.fileName === block.data.file.fileName ||
                origBlock.data.file.docRef === block.data.file.docRef)
            );
          });

          if (originalBlock?.data?.file?.signedUrl) {
            block.data.file.signedUrl = originalBlock.data.file.signedUrl;
          }
        }
      }

      // For video blocks
      if (block.type === 'video' && block.data && block.data.file) {
        if (!block.data.file.signedUrl && block.data.file.url) {
          const originalBlock = currentEditorContent?.blocks?.find((origBlock: any) => {
            return (
              origBlock.type === 'video' &&
              origBlock.data &&
              origBlock.data.file &&
              (origBlock.data.file.fileName === block.data.file.fileName ||
                origBlock.data.file.docRef === block.data.file.docRef)
            );
          });

          if (originalBlock?.data?.file?.signedUrl) {
            block.data.file.signedUrl = originalBlock.data.file.signedUrl;
          }
        }
      }

      // For PDF blocks
      if (block.type === 'pdf' && block.data && block.data.file) {
        if (!block.data.file.signedUrl && block.data.file.url) {
          const originalBlock = currentEditorContent?.blocks?.find((origBlock: any) => {
            return (
              origBlock.type === 'pdf' &&
              origBlock.data &&
              origBlock.data.file &&
              (origBlock.data.file.fileName === block.data.file.fileName ||
                origBlock.data.file.docRef === block.data.file.docRef)
            );
          });

          if (originalBlock?.data?.file?.signedUrl) {
            block.data.file.signedUrl = originalBlock.data.file.signedUrl;
          }
        }
      }

      return block;
    });

    return processedContent;
  };

  const saveChanges = async () => {
    if (!draftId || !currentUserId || isSaving) return Promise.resolve();

    try {
      setIsSaving(true);

      let editorContent = null;
      if (editorRef.current && typeof editorRef.current.save === 'function') {
        try {
          const rawEditorContent = await editorRef.current.save();
          // Process content to preserve media references
          editorContent = processEditorContent(rawEditorContent);
          // Update our tracked content state
          setCurrentEditorContent(editorContent);
        } catch (err) {
          console.error('Error saving editor content:', err);
        }
      } else {
        console.log('Editor ref not available or save method not found');
        editorContent = publishedData?.content || null;
      }

      const updatedDraftData = {
        title: editTitle,
        subTitle: editSubTitle,
        topicNames: publishedData?.topicNames || [],
        content: editorContent || publishedData?.content,
        activePersonas: publishedData?.activePersonas || [],
      };

      await updateDraft(draftId, currentUserId, updatedDraftData);
      setHasChanges(false);
      showNotification('Draft saved successfully', 'success');
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotification('Failed to save changes', 'error');
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!draftId || !currentUserId) {
      showNotification('No draft to publish', 'error');
      return;
    }

    try {
      setIsPublishing(true);
      await saveChanges();
      await publishDraft(draftId, currentUserId);
      showNotification('Content published successfully', 'success');
      navigate('/admin/help-center');
    } catch (error) {
      console.error('Error publishing content:', error);
      showNotification('Failed to publish content', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const getFileDisplayType = (fileType: string) => {
    return fileType.charAt(0).toUpperCase() + fileType.slice(1);
  };

  const handleManualSave = () => {
    if (updateDraftTimerRef.current) {
      clearTimeout(updateDraftTimerRef.current);
    }
    saveChanges();
  };

  console.log('published data : ', publishedData);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="body2">Edit Mode</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {uploadState.isUploading
              ? `Uploading ${getFileDisplayType(uploadState.fileType).toLowerCase()}... ${uploadState.progress}%`
              : isSaving
              ? 'Saving...'
              : hasChanges
              ? 'Unsaved changes'
              : 'Saved in Draft'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={isSaving ? <CircularProgress size={16} /> : <MdSave />}
              onClick={handleManualSave}
              disabled={isSaving || uploadState.isUploading || !hasChanges}
              sx={{ borderRadius: '4px' }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={onExitEditMode}
              disabled={uploadState.isUploading || isSaving}
              sx={{ borderRadius: '4px' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#4CAF50',
                color: 'white',
                borderRadius: '4px',
                py: 0.5,
                px: 2,
                opacity: isPublishing || uploadState.isUploading ? 0.7 : 1,
                pointerEvents: isPublishing || uploadState.isUploading ? 'none' : 'auto',
              }}
              onClick={handlePublishDraft}
              disabled={isPublishing || uploadState.isUploading || isSaving}
              startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : null}
            >
              <Typography variant="body2">{isPublishing ? 'Publishing...' : 'Publish'}</Typography>
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3, position: 'relative' }}>
        {publishedData?.topicNames?.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
              {publishedData.topicNames[0]}
            </Typography>
          </Box>
        )}

        <StyledTextField
          placeholder="Title"
          value={editTitle}
          onChange={handleTitleChange}
          title={true}
          sx={{ mb: 2 }}
          disabled={isSaving || uploadState.isUploading}
          inputRef={titleInputRef}
          inputProps={{
            onFocus: (e: any) => e.target.select(),
          }}
        />

        <StyledTextField
          placeholder="Sub-Title"
          value={editSubTitle}
          onChange={handleSubTitleChange}
          sx={{ mb: 3 }}
          disabled={isSaving || uploadState.isUploading}
          inputRef={subtitleInputRef}
          inputProps={{
            onFocus: (e: any) => e.target.select(),
          }}
        />

        <Box sx={{ position: 'relative' }}>
          <EditorComponent
            content={publishedData?.content}
            readOnly={false}
            onChange={handleEditorChange}
            minHeight="300px"
            uploadFileCallback={handleFileUpload}
            ref={editorRef}
          />

          {uploadState.isUploading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 999,
                minWidth: '200px',
              }}
            >
              <CircularProgress size={40} variant="determinate" value={uploadState.progress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading {getFileDisplayType(uploadState.fileType)}... {uploadState.progress}%
              </Typography>
              {uploadState.fileName && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {uploadState.fileName}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EditModeComponent;
