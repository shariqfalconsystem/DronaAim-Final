import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Popover, Paper, Switch, CircularProgress } from '@mui/material';
import { BsShare } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { PiDotsThreeCircle } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { PublishedContentItemType } from '../types';
import { useSelector } from 'react-redux';
import { updatePublishedVisibility, getPublishedContentById } from '../../../../services/admin/helpCenterServices';
import CategoryIcon from './category-icon';
import ShareDialog from '../../../../components/modals/share-dialog';
import jsPDF from 'jspdf';

interface ContentItemProps {
  item: PublishedContentItemType;
  isLast: boolean;
}

interface Block {
  id: string;
  type: 'paragraph' | 'image' | 'video' | 'header';
  data: {
    text?: string;
    caption?: string;
    file?: {
      signedUrl?: string;
      contentType: string;
    };
  };
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

const ContentItem: React.FC<ContentItemProps> = ({ item, isLast }) => {
  const navigate = useNavigate();
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareDocumentName, setShareDocumentName] = useState('');

  // Initialize visibility states based on the activePersonas from the item
  const [personaVisibility, setPersonaVisibility] = useState({
    insurer: item.activePersonas?.includes('insurer') || false,
    fleetManager: item.activePersonas?.includes('fleetManager') || false,
  });

  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleItemClick = () => {
    // Navigate with the content ID to view the specific content
    navigate(`/admin/help-center/view-content/${item.id}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);

    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotificationMessage(null);
    }, 5000);
  };

  const handleVisibilityChange = async (persona: 'insurer' | 'fleetManager', checked: boolean) => {
    setPersonaVisibility((prev) => ({
      ...prev,
      [persona]: checked,
    }));

    const activePersonas: string[] = [];

    if (persona === 'insurer' ? checked : personaVisibility.insurer) {
      activePersonas.push('insurer');
      activePersonas.push('insurerSuperUser');
    }
    if (persona === 'fleetManager' ? checked : personaVisibility.fleetManager) {
      activePersonas.push('fleetManager');
      activePersonas.push('fleetManagerSuperUser');
    }

    try {
      const visibilitySettings = [
        {
          publishedId: item.id,
          activePersonas: activePersonas,
        },
      ];

      await updatePublishedVisibility(currentUserId, visibilitySettings);
      showNotification('Visibility updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update visibility:', error);
      showNotification('Failed to update visibility', 'error');
      setPersonaVisibility((prev: any) => ({
        insurer: item.activePersonas?.includes('insurer') || false,
        fleetManager: item.activePersonas?.includes('fleetManager') || false,
      }));
    }
  };

  const handleDownloadPDF = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setDownloading(true);

      // Get the full content data
      const { data } = await getPublishedContentById(item.id, currentUserId);
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
        data.content.blocks.forEach((block: Block) => {
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

  const handleSharePDF = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setSharing(true);

      // Create the share URL - direct link to view the content
      const viewContentUrl = `${window.location.origin}/admin/help-center/view-content/${item.id}`;

      // Set the values for the ShareDialog
      setShareUrl(viewContentUrl);
      setShareDocumentName(item.title || 'Help Center Article');

      // Open the dialog
      setShareDialogOpen(true);

      showNotification('Ready to share content', 'success');
    } catch (error: any) {
      console.error('Error preparing share:', error);
      showNotification(`Failed to prepare share: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? `visibility-popover-${item.id}` : undefined;

  // Determine the primary category for icon selection
  const primaryCategory = item.category.split(',')[0].trim();

  return (
    <Box
      sx={{
        p: 3,
        borderBottom: isLast ? 'none' : '1px solid #eee',
        position: 'relative',
        '&:hover': {
          bgcolor: '#fafafa',
        },
      }}
    >
      {notificationMessage && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '300px',
            bgcolor: notificationType === 'success' ? '#4caf50' : notificationType === 'error' ? '#f44336' : '#2196f3',
            color: 'white',
            p: 2,
            borderRadius: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          <Typography variant="body2">{notificationMessage}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CategoryIcon type={getCategoryIcon(primaryCategory)} selected={false} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1, color: '#003350', fontSize: '0.7rem' }}>
            {item.category}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Share">
            <span>
              <IconButton
                size="small"
                sx={{ mr: 1, color: sharing ? '#2196f3' : '#247FAD' }}
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
                sx={{ mr: 1, color: downloading ? '#2196f3' : '#247FAD' }}
                onClick={handleDownloadPDF}
                disabled={downloading || sharing}
              >
                {downloading ? <CircularProgress size={16} /> : <FiDownload size={16} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 500, color: '#003350', cursor: 'pointer' }}
        onClick={handleItemClick}
      >
        {item.title}
      </Typography>

      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ mb: 1, fontSize: '0.85rem', color: '#003350' }}
        component="div"
        dangerouslySetInnerHTML={{ __html: item.placeholder || '' }}
      />

      {/* Modified footer with date and dots icon positioned correctly */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, color: '#003350' }}>
            {item.date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Manage visibility">
            <IconButton size="small" sx={{ color: '#000' }} onClick={handleMenuClick} aria-describedby={popoverId}>
              <PiDotsThreeCircle size={22} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Visibility Settings Popover */}
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClick={(e) => e.stopPropagation()}
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
    </Box>
  );
};

// Helper function to get category icon
const getCategoryIcon = (category: string): string => {
  if (category.includes('Manual')) return 'file';
  if (category.includes('Troubleshooting')) return 'tools';
  if (category.includes('Support')) return 'headset';
  if (category.includes('FAQ')) return 'question';
  return 'list';
};

export default ContentItem;
