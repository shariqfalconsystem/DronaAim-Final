import React from 'react';
import { Box, Typography, CircularProgress, IconButton, Pagination, PaginationItem } from '@mui/material';
import DraftsContentItem from './drafts-content-item';
import { RiCloseCircleFill } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';

interface DraftsContentListProps {
  drafts: any[];
  loading: boolean;
  error: string | null;
  pageDetails: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
  };
  formatDate: (timestamp: number) => string;
  getPlaceholderText: (content: any) => string;
  onDeleteSuccess: () => void;
  onPageChange: (newPage: number) => void;
}

const DraftsContentList: React.FC<DraftsContentListProps> = ({
  drafts,
  loading,
  error,
  pageDetails,
  formatDate,
  getPlaceholderText,
  onDeleteSuccess,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin/help-center');
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    onPageChange(newPage);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        bgcolor: 'white',
        height: 'calc(100vh - 100px)',
        borderRadius: 4,
        overflow: 'hidden', // Prevent content from overflowing the container
      }}
    >
      {/* Header - Fixed */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #eee',
          bgcolor: 'white',
        }}
      >
        <Typography variant="h6" sx={{ color: '#003350', fontSize: '1.2rem', ml: 1 }}>
          All Drafts
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            cursor: 'pointer',
          }}
        >
          <RiCloseCircleFill size={25} />
        </IconButton>
      </Box>

      {/* Content - Scrollable */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
              p: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : drafts?.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography>No drafts found.</Typography>
          </Box>
        ) : (
          <Box>
            {drafts?.map((draft, index) => (
              <DraftsContentItem
                key={draft?.draftId}
                item={{
                  id: draft?.draftId,
                  category: draft?.topicNames[0],
                  title: draft?.title,
                  subtitle: draft?.subTitle,
                  date: formatDate(draft?.createdAt),
                  placeholder: getPlaceholderText(draft?.content),
                  content: draft?.content,
                }}
                isLast={index === drafts.length - 1}
                onDeleteSuccess={onDeleteSuccess}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Pagination - Fixed at bottom */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          borderTop: '1px solid #eee',
          bgcolor: 'white',
        }}
      >
        {pageDetails.totalRecords > pageDetails.pageSize ? (
          <Pagination
            count={Math.ceil(pageDetails.totalRecords / pageDetails.pageSize)}
            page={pageDetails.currentPage}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
            renderItem={(item) => (
              <PaginationItem
                {...item}
                sx={{
                  '&:hover': {
                    color: 'white',
                    backgroundColor: item.type === 'page' ? 'primary.main' : 'transparent',
                    borderRadius: '4px',
                  },
                }}
              />
            )}
          />
        ) : (
          <Box sx={{ height: '32px' }} />
        )}
      </Box>
    </Box>
  );
};

export default DraftsContentList;
