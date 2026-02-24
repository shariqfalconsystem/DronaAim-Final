import React from 'react';
import { Grid, Typography, IconButton, Box, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { RiRefreshLine } from '@remixicon/react';
import { Button } from 'antd';

const DashcamFootageHeader: React.FC<any> = ({ activeRequestId }: any) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item container display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box display="flex" flexDirection="row" alignItems="center">
          <IconButton onClick={() => navigate(-1)}>
            <IoArrowBack />
          </IconButton>
          <Typography>Dashcam Footage- Video ID: {activeRequestId}</Typography> &nbsp;
        </Box>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center"></Box>
        <Box ml={2} flexDirection="row" display="flex" alignItems="center" justifyContent="flex-end">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f0f7ea',
              padding: '4px 12px',
              borderRadius: '16px',
              border: '1px solid #90c44a',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#90c44a',
                display: 'inline-block',
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: '#4a7834', fontWeight: 'medium' }}>
              Completed
            </Typography>
            {/* <Typography variant="body2" sx={{ color: '#666', ml: 1, fontSize: '0.75rem' }}>
              "Video footage sourced partially corrupted. Some views from the selected date and time range are
              unavailable."
            </Typography> */}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashcamFootageHeader;
