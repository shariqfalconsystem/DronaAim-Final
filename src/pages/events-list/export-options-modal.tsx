import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import Loader from '../../components/molecules/loader';

interface ExportOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onExportAsCsv: () => void;
  onExportAsPdf: () => void;
  exportLoading: any;
}

const ExportOptionsDialog: React.FC<ExportOptionsDialogProps> = ({
  open,
  onClose,
  onExportAsCsv,
  onExportAsPdf,
  exportLoading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: '#3F5C78',
          color: 'white',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: 'normal',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Export Options
        </Typography>
        <IconButton size="small" sx={{ color: 'white', padding: 0 }} onClick={onClose}>
          <RiCloseCircleFill />
        </IconButton>
      </DialogTitle>
      {!exportLoading ? (
        <>
          <DialogContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mt: 2 }}>
              <Typography fontSize="1rem" variant="body1" textAlign="center">
                Select the format you want to export the data
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-around', p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', minWidth: 120 }}
              onClick={onExportAsPdf}
            >
              Export as PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', minWidth: 120 }}
              onClick={onExportAsCsv}
            >
              Export as CSV
            </Button>
          </DialogActions>
        </>
      ) : (
        <Loader height={100} />
      )}
    </Dialog>
  );
};

export default ExportOptionsDialog;
