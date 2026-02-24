import React from 'react';
import { Box, Typography, Pagination, PaginationItem } from '@mui/material';
import { PublishedContentItemType } from '../types';
import ContentItem from './content-item';
import { styled } from '@mui/material/styles';

interface ContentListProps {
  selectedCategory: string;
  contentItems: PublishedContentItemType[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxHeight?: string | number;
}

const StyledPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-page:hover': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-previousNext:hover': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-ellipsis': {
    color: theme.palette.primary.main,
  },
}));

const ContentList: React.FC<ContentListProps> = ({
  selectedCategory,
  contentItems,
  totalRecords,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #eee', px: 3, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ color: '#003350', fontSize: '1.2rem' }}>
          {selectedCategory} {totalRecords > 0 && `(${totalRecords})`}
        </Typography>
      </Box>

      {contentItems?.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>No content found for this category.</Typography>
        </Box>
      ) : (
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', flexGrow: 1 }}>
          {contentItems?.map((item, index) => (
            <ContentItem key={item.id} item={item} isLast={index === contentItems?.length - 1} />
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #eee', flexShrink: 0 }}>
          <StyledPagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
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
        </Box>
      )}
    </Box>
  );
};

export default ContentList;
