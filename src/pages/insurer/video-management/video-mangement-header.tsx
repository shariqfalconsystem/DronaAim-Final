import React from 'react';
import { Grid, Typography, IconButton, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { RiRefreshLine } from '@remixicon/react';

const VideoManagementHeader: React.FC<any> = ({ onRequestVideoClick, onRefresh }: any) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item container display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box display="flex" flexDirection="row" alignItems="center">
          <IconButton onClick={() => navigate(-1)}>
            <IoArrowBack />
          </IconButton>
          <Typography>Video Management</Typography> &nbsp;
          <IconButton onClick={onRefresh}>
            <RiRefreshLine />
          </IconButton>
        </Box>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center"></Box>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center" justifyContent="flex-end">
          <Button
            onClick={onRequestVideoClick}
            sx={{ backgroundColor: '#83D860', color: '#000', textTransform: 'none' }}
            variant="contained"
            size="small"
          >
            Request Video{' '}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default VideoManagementHeader;
