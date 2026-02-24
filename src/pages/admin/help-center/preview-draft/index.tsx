import { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton, Paper, CircularProgress, Button, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { RiCloseCircleFill } from '@remixicon/react';

import {
  getDraftById,
  publishDraft,
  updateDraft,
  createMediaUploadUrl,
} from '../../../../services/admin/helpCenterServices';
import { RootState } from '../../../../redux/store';
import CategoryIcon from '../landing/category-icon';
import PublishDialog from '../landing/publish-dialog';
import { selectAllTopics } from '../../../../redux/help-center/helpCenterSlice';
import EditorComponent from '../editor';
import ContentRenderer from '../content-render';
import NotificationSystem from '../notification-system';
import { getFileCategory, getMimeType, isFileTypeAllowed, validateFileSize } from '../create-draft/file-utilities';

// Define TypeScript interfaces
interface EditorBlock {
  id: string;
  type: string;
  data: any;
}

interface EditorContent {
  blocks: EditorBlock[];
  time?: number;
  version?: string;
}

interface DraftData {
  draftId?: string;
  title?: string;
  subTitle?: string;
  topicNames?: string[];
  content?: EditorContent;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  fileType: 'image' | 'video' | 'pdf' | 'other';
  fileName: string;
}

// Create styled text fields for edit mode
const StyledTextField = (props: any) => (
  <TextField
    {...props}
    variant="outlined"
    fullWidth
    sx={{
      mb: 2,
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#e0e0e0',
        },
        '&:hover fieldset': {
          borderColor: '#bdbdbd',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#2196f3',
        },
      },
      '& .MuiInputBase-input': {
        fontSize: props.title ? '24px' : '16px',
        fontWeight: props.title ? '500' : '400',
      },
      ...props.sx,
    }}
  />
);

// Upload to S3 function
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

const ContentPreview = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state?.auth?.currentUserId);
  const allTopics = useSelector(selectAllTopics);

  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubTitle, setEditSubTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileType: 'other',
    fileName: '',
  });

  // Track the current editor content to preserve media references
  const [currentEditorContent, setCurrentEditorContent] = useState<EditorContent | null>(null);

  // Publish dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [contentTypeError, setContentTypeError] = useState<boolean>(false);

  // Editor ref
  const editorRef = useRef<any>(null);

  // Timer ref for debouncing
  const updateDraftTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format topics for the dialog
  const allContentTypes = allTopics
    ? allTopics
        .map((topic: any) => ({
          id: topic.topicName,
          name: topic.name,
        }))
        .filter((topic: any) => topic.id !== 'All Topics')
    : [];

  const transformContentData = (data: any): any => {
    if (!data || !data.content || !data.content.blocks) {
      return data;
    }
    const transformedData = JSON.parse(JSON.stringify(data));

    transformedData.content.blocks = transformedData.content.blocks.map((block: any) => {
      if (block.type === 'image' && block.data?.file?.signedUrl) {
        block.data.file = {
          ...block.data.file,
          url: block.data.file.signedUrl,
        };

        delete block.data.file.signedUrl;
      }
      return block;
    });

    return transformedData;
  };

  useEffect(() => {
    const fetchDraftData = async () => {
      if (!draftId || !currentUserId) {
        setError('Missing draft ID or user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await getDraftById(draftId, currentUserId);

        const transformedData = transformContentData(data);

        setDraftData(transformedData);
        setEditTitle(transformedData?.title || '');
        setEditSubTitle(transformedData?.subTitle || '');
        setCurrentEditorContent(transformedData?.content || null);
        if (transformedData?.topicNames && transformedData.topicNames.length > 0) {
          setSelectedContentType(transformedData.topicNames[0]);
        }
      } catch (error) {
        console.error('Error fetching draft:', error);
        setError('Failed to load draft');
      } finally {
        setLoading(false);
      }
    };

    fetchDraftData();
  }, [draftId, currentUserId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handlePublish = () => {
    if (!draftId || !currentUserId) {
      showNotification('No draft to publish', 'error');
      return;
    }

    // Open the publish dialog instead of immediately publishing
    setPublishDialogOpen(true);
  };

  // Handle content type selection in dialog
  const handleContentTypeChange = (event: any) => {
    setSelectedContentType(event.target.value);
    setContentTypeError(false); // Clear any previous error
  };

  // Complete the publish process from the dialog
  const handleCompletePublish = async () => {
    if (!selectedContentType) {
      setContentTypeError(true);
      return;
    }

    if (!draftId || !currentUserId) {
      showNotification('No draft to publish', 'error');
      setPublishDialogOpen(false);
      return;
    }

    try {
      setIsPublishing(true);

      // Update draft with the selected content type
      const updatedDraftData = {
        title: draftData?.title || editTitle,
        subTitle: draftData?.subTitle || editSubTitle,
        topicNames: [selectedContentType],
        content: draftData?.content,
      };

      // First update the draft with the selected content type
      await updateDraft(draftId, currentUserId, updatedDraftData);

      // Then publish the draft
      await publishDraft(draftId, currentUserId);

      showNotification('Content published successfully', 'success');

      // Close the dialog
      setPublishDialogOpen(false);

      // Redirect to drafts page after a short delay
      setTimeout(() => {
        navigate('/admin/help-center/all-drafts');
      }, 1500);
    } catch (error) {
      console.error('Error publishing content:', error);
      showNotification('Failed to publish content', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Toggle between preview and edit mode
  const toggleEditMode = async () => {
    if (isEditMode) {
      // Save changes before exiting edit mode
      await saveChanges();
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  const debounceSave = () => {
    if (updateDraftTimerRef.current) {
      clearTimeout(updateDraftTimerRef.current);
    }
    updateDraftTimerRef.current = setTimeout(() => {
      saveChanges();
    }, 20000); // Autosave after 20 seconds of inactivity
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

  // Helper function to check if a file already exists in editor content
  const fileExistsInContent = (fileUrl: string) => {
    if (!currentEditorContent?.blocks) return false;

    return currentEditorContent.blocks.some((block) => {
      if (block.type === 'image' && block.data?.file?.signedUrl === fileUrl) return true;
      if (block.type === 'video' && block.data?.file?.signedUrl === fileUrl) return true;
      if (block.type === 'pdf' && block.data?.file?.signedUrl === fileUrl) return true;
      return false;
    });
  };

  // Handle file upload
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

  // Save all changes
  const saveChanges = async () => {
    if (!draftId || !currentUserId || isSaving) return Promise.resolve();

    try {
      setIsSaving(true);

      // Get editor content
      let editorContent: EditorContent | null = null;

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
        editorContent = draftData?.content || null;
      }

      // Prepare updated draft data
      const updatedDraftData: any = {
        title: editTitle,
        subTitle: editSubTitle,
        topicNames: draftData?.topicNames || [],
        content: editorContent || draftData?.content,
      };

      // Update draft
      await updateDraft(draftId, currentUserId, updatedDraftData);

      // Update local state with the new content
      setDraftData((prev) => ({
        ...prev,
        ...updatedDraftData,
      }));

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

  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setPublishDialogOpen(false);
  };

  // Handle preview button click in the dialog (just keep it open in this case)
  const handlePreviewInDialog = () => {
    setPublishDialogOpen(false);
  };

  // Get file display type for UI
  const getFileDisplayType = (fileType: string) => {
    return fileType.charAt(0).toUpperCase() + fileType.slice(1);
  };

  // Find image in content if it exists
  const findImageInContent = (): string | null => {
    if (!draftData || !draftData.content || !draftData.content.blocks) {
      return null;
    }

    const imageBlock = draftData.content.blocks.find((block) => block.type === 'image');
    return imageBlock && imageBlock.data && imageBlock.data.file ? imageBlock.data.file.url : null;
  };

  const imageUrl = findImageInContent();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      {/* Header bar */}
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
        <Typography variant="body2">{isEditMode ? 'Edit' : 'Preview'}</Typography>
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
            {/* Edit/Save button */}
            <Button
              variant="outlined"
              startIcon={isEditMode ? <SaveIcon /> : <EditIcon />}
              onClick={toggleEditMode}
              disabled={isPublishing || uploadState.isUploading}
              sx={{ borderRadius: '4px' }}
            >
              {isEditMode ? 'Save' : 'Edit'}
            </Button>

            {/* Publish button */}
            <Button
              variant="contained"
              sx={{
                bgcolor: '#4CAF50',
                color: 'white',
                borderRadius: '4px',
                py: 0.5,
                px: 2,
                cursor: 'pointer',
                opacity: isPublishing || uploadState.isUploading ? 0.7 : 1,
                pointerEvents: isPublishing || uploadState.isUploading ? 'none' : 'auto',
              }}
              onClick={handlePublish}
              disabled={isEditMode || isPublishing || uploadState.isUploading}
            >
              <Typography variant="body2">{isPublishing ? 'Publishing...' : 'Publish'}</Typography>
            </Button>

            {/* Close button */}
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                cursor: 'pointer',
              }}
              disabled={isPublishing || uploadState.isUploading}
            >
              <RiCloseCircleFill size={25} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content container */}
      <Box
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          mt: 3,
          bgcolor: 'white',
          borderRadius: 1,
          p: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {!isEditMode ? (
          // PREVIEW MODE
          <>
            {draftData && draftData.topicNames && draftData.topicNames.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon type={getCategoryIcon(draftData.topicNames[0] || 'User Manuals')} selected={false} />
                <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                  {draftData.topicNames[0]}
                </Typography>
              </Box>
            )}

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                mb: 1,
                color: '#003350',
              }}
            >
              {draftData && draftData.title ? draftData.title : 'Untitled'}
            </Typography>

            {/* Subtitle */}
            {draftData && draftData.subTitle && (
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  mb: 3,
                }}
              >
                {draftData.subTitle}
              </Typography>
            )}

            {/* Content */}
            <Box
              sx={{
                mt: 4,
                '& img': {
                  maxWidth: '100%',
                  borderRadius: 1,
                  mb: 2,
                },
              }}
            >
              {/* Use ContentRenderer component here */}
              <ContentRenderer content={draftData?.content} />
            </Box>
          </>
        ) : (
          // EDIT MODE
          <>
            {/* Topic label */}
            {draftData && draftData.topicNames && draftData.topicNames.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon type={getCategoryIcon(draftData.topicNames[0] || 'User Manuals')} selected={false} />
                <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                  {draftData.topicNames[0]}
                </Typography>
              </Box>
            )}

            {/* Editable Title */}
            <StyledTextField
              placeholder="Title"
              value={editTitle}
              onChange={handleTitleChange}
              title={true}
              sx={{ mb: 2 }}
              disabled={isSaving || uploadState.isUploading}
              inputProps={{
                onFocus: (e: any) => e.target.select(),
              }}
            />

            {/* Editable Subtitle */}
            <StyledTextField
              placeholder="Sub-Title"
              value={editSubTitle}
              onChange={handleSubTitleChange}
              sx={{ mb: 3 }}
              disabled={isSaving || uploadState.isUploading}
              inputProps={{
                onFocus: (e: any) => e.target.select(),
              }}
            />

            <Box sx={{ position: 'relative' }}>
              <EditorComponent
                content={draftData?.content}
                readOnly={false}
                onChange={handleEditorChange}
                minHeight="300px"
                uploadFileCallback={handleFileUpload}
                ref={(el) => {
                  editorRef.current = el;
                }}
              />

              {/* Upload overlay */}
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
          </>
        )}
      </Box>

      {/* Publish Dialog */}
      <PublishDialog
        open={publishDialogOpen}
        selectedContentType={selectedContentType}
        availableContentTypes={allContentTypes}
        contentTypeError={contentTypeError}
        isPublishing={isPublishing}
        onClose={handleDialogClose}
        onContentTypeChange={handleContentTypeChange}
        onPublish={handleCompletePublish}
        onPreview={handlePreviewInDialog}
        fromPreview={true}
      />

      {/* Use NotificationSystem component */}
      <NotificationSystem
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
};

const getCategoryIcon = (category: string): string => {
  if (category.includes('Manual')) return 'file';
  if (category.includes('Troubleshooting')) return 'tools';
  if (category.includes('Support')) return 'headset';
  if (category.includes('FAQ')) return 'question';
  return 'list';
};

export default ContentPreview;
