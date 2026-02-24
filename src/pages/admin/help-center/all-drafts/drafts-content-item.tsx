import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { BsShare } from 'react-icons/bs';
import { FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { deleteDraft, publishDraft, updateDraft } from '../../../../services/admin/helpCenterServices';
import ItemFooter from '../landing/item-footer';
import CategoryIcon from '../landing/category-icon';
import PublishDialog from '../landing/publish-dialog';
import { selectAllTopics } from '../../../../redux/help-center/helpCenterSlice';

interface ContentItemProps {
  item: any;
  isLast: boolean;
  onDeleteSuccess?: () => void;
}

const DraftsContentItem: React.FC<ContentItemProps> = ({ item, isLast, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const allTopics = useSelector(selectAllTopics);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Publish dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [contentTypeError, setContentTypeError] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Format topics for the dialog
  const allContentTypes = allTopics
    .map((topic: any) => ({
      id: topic.topicName,
      name: topic.name,
    }))
    .filter((topic: any) => topic.id !== 'All Topics');

  // Initialize selected content type
  useEffect(() => {
    setSelectedContentType(item?.category);
  }, [item.category]);

  const handleItemClick = () => {
    navigate(`/admin/help-center/preview-content/${item.id}`);
  };

  const handlePublish = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    setPublishDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      await deleteDraft(item.id, currentUserId);

      // Close the dialog
      setShowDeleteConfirm(false);

      // Call the success callback to refresh the list
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete draft');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  // Handle content type selection in dialog - FIXED THIS FUNCTION
  const handleContentTypeChange = (event: any): void => {
    setSelectedContentType(event.target.value);
    setContentTypeError(false); // Clear any previous error
  };

  // Complete the publish process from the dialog
  const handleCompletePublish = async (): Promise<void> => {
    if (!selectedContentType) {
      setContentTypeError(true);
      return;
    }

    if (!item.id || !currentUserId) {
      console.error('Missing draft ID or user ID');
      setPublishDialogOpen(false);
      return;
    }

    try {
      setIsPublishing(true);

      // Update draft with the selected content type
      const draftData = {
        topicNames: [selectedContentType],
        title: item?.title,
        subTitle: item?.subtitle,
        content: item?.content,
      };

      // First update the draft with the selected content type
      await updateDraft(item.id, currentUserId, draftData);

      // Then publish the draft
      await publishDraft(item.id, currentUserId);

      // Close the dialog
      setPublishDialogOpen(false);

      // Call the success callback to refresh the list if needed
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error publishing content:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle preview button click in the dialog
  const handlePreview = (): void => {
    navigate(`/admin/help-center/preview-content/${item.id}`);
  };

  const handleDialogClose = (): void => {
    setPublishDialogOpen(false);
  };

  // Determine the primary category for icon selection
  const primaryCategory = item?.category?.split(',')[0]?.trim();

  return (
    <>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CategoryIcon type={getCategoryIcon(primaryCategory)} selected={false} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1, color: '#003350', fontSize: '0.7rem' }}>
            {item.category}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 500, color: '#003350', cursor: 'pointer' }}
          onClick={handleItemClick}
        >
          {item.title}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: '0.85rem', color: '#555' }}>
          {item.placeholder}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ItemFooter date={item.date} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handlePublish}
              sx={{
                bgcolor: '#5cc971',
                color: 'white',
                '&:hover': {
                  bgcolor: '#4caf50',
                },
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 2,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              Publish
            </Button>

            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{
                color: '#ff4d4f',
                p: 0.5,
              }}
            >
              <RiDeleteBinLine size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Delete Draft</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the draft "{item.title}"? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isDeleting} variant="contained">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
        onPreview={handlePreview}
      />
    </>
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

export default DraftsContentItem;
