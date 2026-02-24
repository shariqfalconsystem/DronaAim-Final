// src/components/HelpCenter/BottomActions.tsx
import React from 'react';
import { Box, Button } from '@mui/material';
import { RiDraftLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import { MdAddBox } from 'react-icons/md';

const BottomActions: React.FC = () => {
  const navigate = useNavigate();

  const handleAddContent = () => {
    navigate('/admin/help-center/create-content');
  };

  const handleAllDrafts = () => {
    navigate('/admin/help-center/all-drafts');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        bgcolor: '#DFE8F0',
        borderRadius: 2,
        p: 2,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
        mt: 3,
      }}
    >
      <Button
        variant="contained"
        startIcon={<MdAddBox size={25} />}
        sx={{
          backgroundColor: '#83D860',
          color: '#000000',
          textTransform: 'none',
          justifyContent: 'flex-start',
          fontWeight: 500,
          width: '100%',
          p: 1.5,
          px: 3,
          borderRadius: 2,
          border: '1px solid rgb(202, 202, 202)',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#75c254',
            boxShadow: 'none',
          },
        }}
        onClick={handleAddContent}
      >
        Add Content
      </Button>

      <Button
        variant="text"
        startIcon={<RiDraftLine style={{ fontSize: '1.2rem' }} />}
        sx={{
          color: '#36454F',
          justifyContent: 'flex-start',
          textTransform: 'none',
          p: 1.5,
          px: 3,
          width: '100%',
          borderRadius: 1.5,
          fontWeight: 400,
          backgroundColor: 'transparent',
          border: '1px solid rgb(202, 202, 202)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
        onClick={handleAllDrafts}
      >
        All Drafts
      </Button>
    </Box>
  );
};

export default BottomActions;
