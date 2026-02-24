import React from 'react';
import { Box, Grid, Typography, Pagination, PaginationItem } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  pageSize: number;
  isDefaultList: boolean;
  isPage?: boolean;
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

const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
  isDefaultList,
  isPage = true,
}) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      sx={{ padding: 2, paddingRight: isDefaultList ? 4 : 2 }}
    >
      {isPage && (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          Page {currentPage} of {totalPages}
        </Typography>
      )}
      <Box>
        <StyledPagination
          count={totalPages}
          page={currentPage}
          onChange={(event, newPage) => onPageChange(newPage)}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          size="small"
          renderItem={(item) => <PaginationItem {...item} />}
        />
      </Box>
    </Grid>
  );
};

export default PaginationComponent;
