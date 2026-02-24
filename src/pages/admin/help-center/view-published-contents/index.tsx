import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Popover,
  Paper,
  Switch,
} from '@mui/material';
import { IoArrowBack } from 'react-icons/io5';
import { BsShare } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import {
  getPublishedContentById,
  deletePublishedContent,
  createDraftFromPublishedContent,
  updatePublishedVisibility,
} from '../../../../services/admin/helpCenterServices';
import HelpCenterHeader from '../landing/help-center-header';
import CategorySidebar from '../landing/category-sidebar';
import ContentRenderer from '../content-render';
import { PiDotsThreeCircle } from 'react-icons/pi';
import { FaEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import ShareDialog from '../../../../components/modals/share-dialog';
import EditModeComponent from './edit-mode';
import jsPDF from 'jspdf';
import { NotificationState, PublishedData } from '../types';

// Define TypeScript interfaces for the data

const ViewPublishedContent = () => {
  const { publishedId } = useParams<{ publishedId: string }>();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state?.auth?.currentUserId);
  const contentRef = useRef<HTMLDivElement>(null);

  // Core state
  const [publishedData, setPublishedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareDocumentName, setShareDocumentName] = useState('');

  // Edit state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Visibility state
  const [personaVisibility, setPersonaVisibility] = useState({
    insurer: false,
    fleetManager: false,
  });
  const [updatingVisibility, setUpdatingVisibility] = useState<boolean>(false);

  const categories: any = [
    { id: 'all', name: 'All Topics', icon: 'list' },
    { id: 'manuals', name: 'User Manuals', icon: 'file' },
    { id: 'troubleshooting', name: 'Troubleshooting Guides', icon: 'tools' },
    { id: 'support', name: 'Support Resources', icon: 'headset' },
    { id: 'faqs', name: 'FAQs', icon: 'question' },
  ];

  // Initial data fetch
  useEffect(() => {
    const fetchPublishedContent = async () => {
      if (!publishedId || !currentUserId) {
        setError('Missing content ID or user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await getPublishedContentById(publishedId, currentUserId);
        setPublishedData(data);

        // Initialize visibility states
        if (data?.activePersonas) {
          setPersonaVisibility({
            insurer: data.activePersonas.includes('insurer'),
            fleetManager: data.activePersonas.includes('fleetManager'),
          });
        }

        // Set category if available
        if (data?.topicNames?.length > 0) {
          setSelectedCategory(data.topicNames[0]);
        }
      } catch (error) {
        console.error('Error fetching published content:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedContent();
  }, [publishedId, currentUserId]);

  // Navigation handlers
  const handleGoBack = () => navigate(-1);

  const handleDownloadPDF = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setDownloading(true);

      // Get the full content data
      const data = publishedData;

      if (!data) {
        throw new Error('Content not found');
      }

      // Create PDF using the same logic as in HelpCenter
      const doc = new jsPDF();
      let y = 10;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Title :', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(data.title || '', 25, y);
      y += 10;

      if (data.subTitle) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Subtitle :', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(data.subTitle, 30, y);
        y += 10;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Date :', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(data.createdAt || Date.now()), 23, y);
      y += 10;

      if (data.content?.blocks) {
        data.content.blocks.forEach((block: any) => {
          y += 10;
          switch (block.type) {
            case 'header':
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(block.data.text || '', 10, y);
              break;

            case 'paragraph':
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(block.data.text || '', 10, y);
              break;

            case 'image':
            case 'video': {
              const label = block.type === 'image' ? 'Image' : 'Video';
              const mediaUrl = block.data.file?.signedUrl;
              if (mediaUrl) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 255);
                const linkText = `${label}: ${block.data.caption || 'View media'}`;
                doc.textWithLink(linkText, 10, y, { url: mediaUrl });
              }
              break;
            }

            default:
              if (block.data.file?.contentType === 'application/pdf') {
                const pdfUrl = block.data.file?.signedUrl;
                if (pdfUrl) {
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(12);
                  doc.setTextColor(0, 0, 255);
                  const pdfText = `PDF: ${block.data.caption || 'View PDF'}`;
                  doc.textWithLink(pdfText, 10, y, { url: pdfUrl });
                }
              }
              break;
          }
        });
      }

      doc.save(`${data.title || 'document'}.pdf`);
      showNotification('PDF downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      showNotification(`Failed to download: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleSharePDF = async () => {
    try {
      setSharing(true);
      const viewContentUrl = `${window.location.origin}/admin/help-center/view-content/${publishedId}`;
      setShareUrl(viewContentUrl);
      setShareDocumentName(publishedData?.title || 'Help Center Article');
      setShareDialogOpen(true);
      showNotification('Ready to share content', 'success');
    } catch (error: any) {
      console.error('Error preparing share:', error);
      showNotification(`Failed to prepare share: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  // Delete handlers
  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
  const handleDeleteContent = async () => {
    if (!publishedId || !currentUserId) {
      setError('Missing content ID or user ID');
      return;
    }

    try {
      setDeleteLoading(true);
      await deletePublishedContent(publishedId, currentUserId);
      setDeleteDialogOpen(false);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('Failed to delete content');
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Visibility handlers
  const handleVisibilityMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleVisibilityMenuClose = () => setAnchorEl(null);
  const handleVisibilityChange = async (persona: 'insurer' | 'fleetManager', checked: boolean) => {
    if (!publishedId || !currentUserId) {
      showNotification('Missing content ID or user ID', 'error');
      return;
    }

    setPersonaVisibility((prev) => ({ ...prev, [persona]: checked }));

    const activePersonas: string[] = [];
    if (persona === 'insurer' ? checked : personaVisibility.insurer) {
      activePersonas.push('insurer', 'insurerSuperUser');
    }
    if (persona === 'fleetManager' ? checked : personaVisibility.fleetManager) {
      activePersonas.push('fleetManager', 'fleetManagerSuperUser');
    }

    try {
      setUpdatingVisibility(true);
      const visibilitySettings = [{ publishedId, activePersonas }];
      await updatePublishedVisibility(currentUserId, visibilitySettings);
      showNotification('Visibility updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update visibility:', error);
      showNotification('Failed to update visibility settings', 'error');

      // Reset on error
      if (publishedData?.activePersonas) {
        setPersonaVisibility({
          insurer: publishedData.activePersonas.includes('insurer'),
          fleetManager: publishedData.activePersonas.includes('fleetManager'),
        });
      }
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // Edit mode toggle
  const toggleEditMode = async () => {
    if (isEditMode) {
      await exitEditMode();
    } else {
      await createDraftFromPublished();
    }
  };

  // Edit mode exit handler
  const exitEditMode = async () => {
    setIsEditMode(false);

    // Refresh published content
    if (publishedId && currentUserId) {
      try {
        const { data } = await getPublishedContentById(publishedId, currentUserId);
        setPublishedData(data);
      } catch (error) {
        console.error('Error refreshing published content:', error);
      }
    }
  };

  // Draft creation
  const createDraftFromPublished = async () => {
    if (!publishedId || !currentUserId) {
      showNotification('Missing content ID or user ID', 'error');
      return;
    }

    try {
      setIsCreatingDraft(true);
      const { data } = await createDraftFromPublishedContent(publishedId, currentUserId);
      setDraftId(data.draftId);
      setIsEditMode(true);
      showNotification('Draft created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating draft:', error);

      // Handle existing draft case
      if (error.response?.data?.details?.includes('already exists for publishedId')) {
        const match = error.response.data.details.match(/id:([^,]+),/);
        if (match && match[1]) {
          setDraftId(match[1].trim());
          setIsEditMode(true);
          showNotification('Using existing draft', 'info');
        } else {
          showNotification('Failed to create draft', 'error');
        }
      } else {
        showNotification('Failed to create draft', 'error');
      }
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Notification helper
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({ open: true, message, severity });
  };
  const closeNotification = () => setNotification((prev) => ({ ...prev, open: false }));

  // Helper to format date string
  const formatDate = (dateString?: any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Find image in content if it exists
  const findImageInContent = (): string | null => {
    if (!publishedData?.content?.blocks) return null;
    const imageBlock = publishedData.content.blocks.find((block: any) => block.type === 'image');
    return imageBlock?.data?.file?.signedUrl || null;
  };

  const imageUrl = findImageInContent();
  const open = Boolean(anchorEl);
  const popoverId = open ? `visibility-popover-${publishedId}` : undefined;

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Search */}
      <HelpCenterHeader />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, p: 2, gap: 1 }}>
        {/* Left Sidebar */}
        <Box sx={{ width: '320px', bgcolor: '#F5FAFF', borderRadius: 2, p: 1 }}>
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {isEditMode ? (
              <EditModeComponent
                publishedData={publishedData}
                draftId={draftId}
                onExitEditMode={exitEditMode}
                currentUserId={currentUserId}
                showNotification={showNotification}
                navigate={navigate}
              />
            ) : (
              <>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" sx={{ mr: 1, color: '#333' }} onClick={handleGoBack}>
                      <IoArrowBack />
                    </IconButton>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      {publishedData?.topicNames?.[0] || 'Content'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Share content">
                      <span>
                        <IconButton
                          size="small"
                          sx={{ color: sharing ? '#2196f3' : '#333' }}
                          onClick={handleSharePDF}
                          disabled={sharing || downloading}
                        >
                          {sharing ? <CircularProgress size={16} /> : <BsShare size={16} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Download as PDF">
                      <span>
                        <IconButton
                          size="small"
                          sx={{ color: downloading ? '#2196f3' : '#333', ml: 1 }}
                          onClick={handleDownloadPDF}
                          disabled={downloading}
                        >
                          {downloading ? <CircularProgress size={16} /> : <FiDownload size={16} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ p: 0 }}>
                  <Box sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(publishedData?.createdAt)}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit content">
                        <span>
                          <IconButton
                            size="small"
                            sx={{ p: 1, mr: 1, color: '#247FAD', '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' } }}
                            onClick={toggleEditMode}
                            disabled={isCreatingDraft}
                          >
                            {isCreatingDraft ? <CircularProgress size={20} /> : <FaEdit size={20} />}
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Delete content">
                        <span>
                          <IconButton
                            size="small"
                            sx={{ p: 1, mr: 1, color: '#D24537', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.08)' } }}
                            onClick={handleOpenDeleteDialog}
                          >
                            <RiDeleteBin6Line size={20} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Manage visibility">
                        <span>
                          <IconButton
                            size="small"
                            sx={{ borderRadius: '50%', p: 1, color: '#003350', '&:hover': { bgcolor: '#e3f2fd' } }}
                            onClick={handleVisibilityMenuClick}
                            aria-describedby={popoverId}
                            disabled={updatingVisibility}
                          >
                            {updatingVisibility ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <PiDotsThreeCircle size={24} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box ref={contentRef}>
                    {/* Title */}
                    <Box sx={{ px: 3, pt: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#003350' }}>
                        {publishedData?.title || 'Untitled'}
                      </Typography>
                    </Box>

                    {/* Section title (if exists in content) */}
                    {publishedData?.subTitle && (
                      <Box sx={{ px: 3, pt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#003350', mb: 2, mt: 2 }}>
                          {publishedData.subTitle}
                        </Typography>
                      </Box>
                    )}

                    {/* Content rendered using shared ContentRenderer component */}
                    <Box sx={{ px: 3, py: 2 }}>
                      <ContentRenderer content={publishedData?.content} />
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} aria-labelledby="delete-dialog-title">
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this content? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteContent}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visibility Settings Popover */}
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleVisibilityMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Paper sx={{ width: 250, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
            Publish to:
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2">Insurer Persona</Typography>
            <Switch
              checked={personaVisibility.insurer}
              onChange={(_, checked) => handleVisibilityChange('insurer', checked)}
              color="primary"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Fleet Manager Persona</Typography>
            <Switch
              checked={personaVisibility.fleetManager}
              onChange={(_, checked) => handleVisibilityChange('fleetManager', checked)}
              color="primary"
              size="small"
            />
          </Box>
        </Paper>
      </Popover>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setShareUrl('');
          setShareDocumentName('');
        }}
        documentUrl={shareUrl}
        documentName={shareDocumentName}
      />

      {/* Notification */}
      <Snackbar open={notification.open} autoHideDuration={5000} onClose={closeNotification}>
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewPublishedContent;
