// CreateDraft.tsx
import { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import {
  createNewDraft,
  updateDraft,
  publishDraft,
  createMediaUploadUrl,
} from '../../../../services/admin/helpCenterServices';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import PublishDialog from '../landing/publish-dialog';
import { RiCloseCircleFill } from '@remixicon/react';
import { fetchHelpCenterTopics, selectAllTopics } from '../../../../redux/help-center/helpCenterSlice';
import VideoTool from '../video-tool';

import {
  getMimeType,
  getFileCategory,
  validateFileSize,
  isFileTypeAllowed,
  uploadToS3,
  getUploadingFileInfo,
} from './file-utilities';
import {
  ContentPaper,
  StyledTextField,
  SubtitleTextField,
  SaveButton,
  PublishButton,
  EditorContainer,
} from './styled-components';
import { initializeEditorJS } from './editor-config';
import { NotificationState, UploadState } from './types';
import { MdSave } from 'react-icons/md';

const CreateDraft = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state?.auth?.currentUserId);
  const allTopics = useSelector(selectAllTopics);

  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ open: false, message: '', severity: 'info' });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState<boolean>(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [contentTypeError, setContentTypeError] = useState<boolean>(false);
  const [isSubtitleActive, setIsSubtitleActive] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileType: 'other',
    fileName: '',
  });
  const [editorInitFailed, setEditorInitFailed] = useState<boolean>(false);
  // New state to track if user has fully completed the subtitle field interaction
  const [subtitleInteractionComplete, setSubtitleInteractionComplete] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstance = useRef<EditorJS | null>(null);
  const createDraftTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTimestampRef = useRef<number>(0);
  const currentDraftIdRef = useRef<string | null>(null);
  const draftCreationPromiseRef = useRef<Promise<string | null> | null>(null);
  const subtitleInputRef = useRef<HTMLInputElement | null>(null);
  const shouldCreateDraftRef = useRef<boolean>(false);
  const isUserInteractingRef = useRef<boolean>(false);
  // Remove pendingEditorInitialization ref and replace with a deliberate approach
  const editorInitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const contentConditionsMet = title.trim() !== '' && subtitle.trim() !== '';
  const allContentTypes = allTopics
    ? allTopics
        .map((topic: any) => ({
          id: topic.topicName,
          name: topic.name,
        }))
        .filter((topic: any) => topic.id !== 'All Topics')
    : [];

  const isLoadingTopics = !allTopics;

  // Effect to handle editor initialization only after subtitle interaction is fully complete
  useEffect(() => {
    if (contentConditionsMet && subtitleInteractionComplete && !showEditor && !isEditorInitialized) {
      // Use a timeout to delay the editor initialization to ensure focus transitions are complete
      if (editorInitTimeoutRef.current) {
        clearTimeout(editorInitTimeoutRef.current);
      }

      editorInitTimeoutRef.current = setTimeout(() => {
        // Only show editor if user is not actively interacting with input fields
        if (!isUserInteractingRef.current) {
          setShowEditor(true);
        }
      }, 500); // Use a longer delay to ensure all focus interactions are complete
    }

    return () => {
      if (editorInitTimeoutRef.current) {
        clearTimeout(editorInitTimeoutRef.current);
      }
    };
  }, [contentConditionsMet, subtitleInteractionComplete, showEditor, isEditorInitialized]);

  // Effect to initialize editor when showEditor is true
  useEffect(() => {
    if (showEditor && !isEditorInitialized && !editorInitFailed) {
      setTimeout(() => {
        initializeEditor();
      }, 300);
    }
  }, [showEditor, isEditorInitialized, editorInitFailed]);

  // Update the ref whenever draftId changes
  useEffect(() => {
    currentDraftIdRef.current = draftId;
  }, [draftId]);

  // Effect to create draft after a delay when conditions are met
  useEffect(() => {
    // Only set up the draft creation when both fields are filled
    // AND user has stopped typing for at least 2 seconds
    // AND user has completed subtitle interaction
    if (
      contentConditionsMet &&
      !draftId &&
      !isCreatingDraft &&
      shouldCreateDraftRef.current &&
      subtitleInteractionComplete
    ) {
      if (createDraftTimerRef.current) {
        clearTimeout(createDraftTimerRef.current);
      }

      createDraftTimerRef.current = setTimeout(() => {
        if (!draftId && !isCreatingDraft && !isUserInteractingRef.current) {
          createInitialDraft();
        }
      }, 2000);
    }

    return () => {
      if (createDraftTimerRef.current) {
        clearTimeout(createDraftTimerRef.current);
      }
    };
  }, [title, subtitle, draftId, isCreatingDraft, contentConditionsMet, subtitleInteractionComplete]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
        } catch (error) {
          console.error('Error during editor cleanup:', error);
        }
      }
      if (createDraftTimerRef.current) clearTimeout(createDraftTimerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (editorInitTimeoutRef.current) clearTimeout(editorInitTimeoutRef.current);
    };
  }, []);

  // Fetch topics on mount
  useEffect(() => {
    dispatch(fetchHelpCenterTopics());
  }, [dispatch]);

  // Generic file upload handler for any supported file type
  const handleFileUpload = async (file: File): Promise<any> => {
    const fileExt: any = file.name.split('.').pop()?.toLowerCase();

    // Validate file type
    if (!isFileTypeAllowed(fileExt)) {
      return {
        success: 0,
        error: 'Unsupported file type. Please upload an image, PDF, or supported video format.',
      };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      showNotification(sizeValidation.message, 'error');
      return { success: 0, error: sizeValidation.message };
    }

    const mimeType = getMimeType(fileExt);
    const fileCategory = getFileCategory(mimeType);

    const contentType = fileExt === 'pdf' ? 'application/pdf' : fileExt;

    // Set upload state with file type
    setUploadState({
      isUploading: true,
      progress: 10,
      fileType: fileCategory as 'image' | 'video' | 'pdf' | 'other',
      fileName: file.name,
    });

    try {
      // Ensure we have a draft ID before uploading
      let uploadDraftId = currentDraftIdRef.current;
      if (!uploadDraftId) {
        if (draftCreationPromiseRef.current) {
          uploadDraftId = await draftCreationPromiseRef.current;
        } else {
          uploadDraftId = await createInitialDraft();
        }
        if (!uploadDraftId) {
          throw new Error(`Failed to create draft for ${fileCategory} upload`);
        }
      }

      setUploadState((prev) => ({ ...prev, progress: 30 }));

      // Get pre-signed URL for upload
      const response = await createMediaUploadUrl(currentUserId!, {
        draftId: uploadDraftId,
        fileName: file.name,
        contentType: mimeType,
        type: 'HelpCenterMediaUpload',
      });

      setUploadState((prev) => ({ ...prev, progress: 50 }));

      // Upload file to S3
      const uploadSuccess = await uploadToS3(file, response.data.putUrl, mimeType);
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

  const initializeEditor = (): void => {
    if (!editorRef.current) {
      setEditorInitFailed(true);
      return;
    }

    if (editorInstance.current) return;

    try {
      setIsEditorInitialized(true);
      editorInstance.current = initializeEditorJS({
        holder: editorRef.current,
        handleFileUpload,
        handleEditorChange,
        onReady: () => setIsEditorInitialized(true),
        VideoTool,
      });
    } catch (error) {
      console.error('Error initializing Editor.js:', error);
      setIsEditorInitialized(false);
      setEditorInitFailed(true);
    }
  };

  const createInitialDraft = async (): Promise<string | null> => {
    if (currentDraftIdRef.current) return currentDraftIdRef.current;
    if (draftCreationPromiseRef.current) return draftCreationPromiseRef.current;
    if (isLoadingTopics) return null;

    draftCreationPromiseRef.current = (async () => {
      try {
        if (!currentUserId) throw new Error('User ID not available');
        setIsCreatingDraft(true);

        const defaultTopic = allContentTypes.length > 0 ? [allContentTypes[0].id] : ['Troubleshooting Guides'];

        const { data } = await createNewDraft(currentUserId, {
          topicNames: defaultTopic,
          title: title.trim() || 'Untitled',
          subTitle: subtitle.trim() || '',
          content: {},
        });

        if (data?.draftId) {
          const newDraftId = data.draftId;
          setDraftId(newDraftId);
          currentDraftIdRef.current = newDraftId;
          showNotification('Draft created successfully', 'success');
          return newDraftId;
        } else {
          throw new Error('Invalid response from API');
        }
      } catch (error) {
        console.error('Error creating draft:', error);
        showNotification('Failed to create draft', 'error');
        return null;
      } finally {
        setIsCreatingDraft(false);
        draftCreationPromiseRef.current = null;
      }
    })();

    return draftCreationPromiseRef.current;
  };

  const handleEditorChange = (): void => {
    if (!currentDraftIdRef.current) return;
    setHasChanges(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(saveDraft, 2000);
  };

  const handleInputChange =
    (field: 'title' | 'subtitle') =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      if (field === 'title') {
        setTitle(value);
      } else {
        setSubtitle(value);
      }

      // Mark that we should create a draft (but don't do it immediately)
      if (
        contentConditionsMet ||
        (field === 'title' && value.trim() !== '' && subtitle.trim() !== '') ||
        (field === 'subtitle' && value.trim() !== '' && title.trim() !== '')
      ) {
        shouldCreateDraftRef.current = true;
      }

      // If editing subtitle, reset the interaction complete flag
      if (field === 'subtitle') {
        setSubtitleInteractionComplete(false);
      }

      lastTypingTimestampRef.current = Date.now();
      setHasChanges(true);
    };

  const handleSubtitleFocus = (): void => {
    isUserInteractingRef.current = true;
    setIsSubtitleActive(true);
    setSubtitleInteractionComplete(false);
  };

  const handleSubtitleBlur = (): void => {
    setIsSubtitleActive(false);

    // Delay setting the interaction flag to false to prevent immediate focus loss
    setTimeout(() => {
      isUserInteractingRef.current = false;

      // Mark that subtitle interaction is complete, which will trigger the editor initialization
      // in the effect hook, but only after the focus/blur events are fully processed
      if (contentConditionsMet) {
        setSubtitleInteractionComplete(true);
      }
    }, 200); // Slightly longer delay to ensure all focus transitions are complete
  };

  const saveDraft = async (): Promise<void> => {
    const saveDraftId = currentDraftIdRef.current;
    if (!saveDraftId || !currentUserId || isSaving) return;

    try {
      setIsSaving(true);
      if (!editorInstance.current) {
        throw new Error('Editor instance not available');
      }

      const editorData = await editorInstance.current.save();
      const topicToUse = selectedContentType
        ? [selectedContentType]
        : allContentTypes.length > 0
        ? [allContentTypes[0].id]
        : ['Troubleshooting Guides'];

      await updateDraft(saveDraftId, currentUserId, {
        topicNames: topicToUse,
        title: title.trim() || 'Untitled',
        subTitle: subtitle.trim() || '',
        content: editorData,
      });

      showNotification('Draft saved', 'success');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      showNotification('Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = (): void => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    saveDraft();
  };

  const handlePublishButtonClick = async (): Promise<void> => {
    if (hasChanges && currentDraftIdRef.current) {
      await saveDraft().catch((error) => {
        console.error('Error saving draft before publishing:', error);
        showNotification('Failed to save changes before publishing', 'error');
        return;
      });
    }
    setPublishDialogOpen(true);
  };

  const handleContentTypeChange = (event: SelectChangeEvent): void => {
    setSelectedContentType(event.target.value);
    setContentTypeError(false);
    setHasChanges(true);
  };

  const handleCompletePublish = async (): Promise<void> => {
    if (!selectedContentType) {
      setContentTypeError(true);
      return;
    }

    const publishDraftId = currentDraftIdRef.current;
    if (!publishDraftId || !currentUserId) {
      showNotification('No draft to publish', 'error');
      setPublishDialogOpen(false);
      return;
    }

    try {
      setIsPublishing(true);
      if (editorInstance.current) {
        const editorData = await editorInstance.current.save();
        await updateDraft(publishDraftId, currentUserId, {
          topicNames: [selectedContentType],
          title: title.trim() || 'Untitled',
          subTitle: subtitle.trim() || '',
          content: editorData,
        });
      }

      await publishDraft(publishDraftId, currentUserId);
      showNotification('Content published successfully', 'success');
      setHasChanges(false);
      setPublishDialogOpen(false);
      setTimeout(() => {
        navigate('/admin/help-center');
      }, 1000);
    } catch (error) {
      console.error('Error publishing content:', error);
      showNotification('Failed to publish content', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = (): void => {
    const previewDraftId = currentDraftIdRef.current;
    if (previewDraftId) {
      saveDraft().then(() => {
        navigate(`/admin/help-center/preview-content/${previewDraftId}`);
      });
    }
  };

  const handleClose = async (): Promise<void> => {
    if (isSaving) {
      showNotification('Please wait while your draft is being saved...', 'info');
      return;
    }

    const closeDraftId = currentDraftIdRef.current;
    if (closeDraftId && hasChanges) {
      try {
        setIsSaving(true);
        await saveDraft();
        setTimeout(() => navigate(-1), 500);
      } catch (error) {
        console.error('Error saving draft on close:', error);
        showNotification('Failed to save draft before closing', 'error');
        setIsSaving(false);
      }
    } else {
      navigate(-1);
    }
  };

  const showNotification = (message: string, severity: NotificationState['severity']): void => {
    setNotification({ open: true, message, severity });
  };

  const forceInitEditor = () => {
    setEditorInitFailed(false);
    setIsEditorInitialized(false);
    setShowEditor(true);
    setTimeout(() => {
      initializeEditor();
    }, 300);
  };

  const fileInfo = getUploadingFileInfo(uploadState.fileType, uploadState.fileName);

  return (
    <Box sx={{ p: 2, height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center' }}>
      <ContentPaper elevation={1} sx={{ maxWidth: '1250px', width: '100%', p: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography variant="h6">
            Add Content
            {isSaving && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                Saving...
              </Typography>
            )}
            {isCreatingDraft && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                Creating draft...
              </Typography>
            )}
            {isLoadingTopics && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                Loading topics...
              </Typography>
            )}
            {uploadState.isUploading && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                Uploading {fileInfo.displayType.toLowerCase()}... {uploadState.progress}%
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentDraftIdRef.current && (
              <Button
                variant="outlined"
                startIcon={isSaving ? <CircularProgress size={16} /> : <MdSave />}
                onClick={handleManualSave}
                disabled={isSaving || isPublishing || !hasChanges || uploadState.isUploading}
                sx={{ borderRadius: '4px' }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
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
                ml: 1,
              }}
              onClick={handlePublishButtonClick}
              disabled={
                isPublishing ||
                !currentDraftIdRef.current ||
                isSaving ||
                isCreatingDraft ||
                isLoadingTopics ||
                uploadState.isUploading
              }
              startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>

            <IconButton
              size="small"
              sx={{ ml: 1 }}
              onClick={handleClose}
              disabled={isSaving || isPublishing || uploadState.isUploading}
            >
              <RiCloseCircleFill size={25} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
          <StyledTextField
            fullWidth
            placeholder="Title"
            variant="outlined"
            value={title}
            onChange={handleInputChange('title')}
            onFocus={() => {
              isUserInteractingRef.current = true;
            }}
            onBlur={() => {
              setTimeout(() => {
                isUserInteractingRef.current = false;
              }, 100);
            }}
            disabled={isCreatingDraft || isLoadingTopics}
          />

          <SubtitleTextField
            fullWidth
            placeholder="Subtitle"
            variant="outlined"
            value={subtitle}
            onChange={handleInputChange('subtitle')}
            onFocus={handleSubtitleFocus}
            onBlur={handleSubtitleBlur}
            inputRef={subtitleInputRef}
            sx={{ mt: 1 }}
            disabled={isCreatingDraft || isLoadingTopics}
          />

          {isLoadingTopics ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {contentConditionsMet && showEditor ? (
                <EditorContainer>
                  <div ref={editorRef} id="editorjs" style={{ minHeight: '300px' }} />

                  {!isEditorInitialized && !editorInitFailed && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="textSecondary">Initializing editor...</Typography>
                      <CircularProgress size={24} sx={{ mt: 2 }} />
                    </Box>
                  )}

                  {editorInitFailed && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="error">Editor initialization failed</Typography>
                      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={forceInitEditor}>
                        Retry Loading Editor
                      </Button>
                    </Box>
                  )}

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
                        Uploading {fileInfo.displayType}... {uploadState.progress}%
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
                </EditorContainer>
              ) : (
                contentConditionsMet && (
                  <Box mt={2}>
                    <Typography color="textSecondary" variant="body2">
                      {isSubtitleActive
                        ? "Finish editing the subtitle first. Editor will initialize after you're done."
                        : subtitleInteractionComplete
                        ? 'Initializing Editor...'
                        : 'Please click outside the subtitle field to continue.'}
                    </Typography>
                  </Box>
                )
              )}

              {!contentConditionsMet && (
                <Box mt={2}>
                  <Typography color="textSecondary" variant="body2">
                    Please fill the Title and Subtitle to start creating content.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </ContentPaper>

      <PublishDialog
        open={publishDialogOpen}
        selectedContentType={selectedContentType}
        availableContentTypes={allContentTypes}
        contentTypeError={contentTypeError}
        isPublishing={isPublishing}
        onClose={() => setPublishDialogOpen(false)}
        onContentTypeChange={handleContentTypeChange}
        onPublish={handleCompletePublish}
        onPreview={handlePreview}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateDraft;
