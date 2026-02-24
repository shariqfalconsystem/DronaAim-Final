import React from 'react';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { RiRefreshLine } from 'react-icons/ri';
import SearchInput from '../../../../components/atoms/search-input';

interface HelpCenterHeaderProps {
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchText?: string;
  isLanding?: boolean;
}

const HelpCenterHeader: React.FC<HelpCenterHeaderProps> = ({ onSearchChange, searchText, isLanding }) => {
  return (
    <Box
      sx={{
        boxShadow: '0px 4px 4px 0px #00000040',
        bgcolor: '#fff',
        py: 2,
        px: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6" sx={{ ml: 3 }}>
            Help Center
          </Typography>
          <IconButton onClick={() => window.location.reload()}>
            <RiRefreshLine />
          </IconButton>
        </Grid>
        <Grid item sx={{ width: '350px', mr: 3 }}>
          {isLanding && (
            <SearchInput
              placeholder="Search"
              onChange={onSearchChange}
              value={searchText}
              fullWidth
              size="small"
              sx={{
                backgroundColor: '#f5f7fa',
                borderRadius: '20px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                },
              }}
            />
          )}
        </Grid>
        <Grid></Grid>
      </Grid>
    </Box>
  );
};

export default HelpCenterHeader;
