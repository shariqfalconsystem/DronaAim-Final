import React from 'react';
import { CircularProgress, Dialog, DialogContent, Typography } from '@mui/material';

interface LoaderProps {
  open: boolean;
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ open, message }) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={24} />
          <Typography style={{ marginLeft: 10 }}>{message}</Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Loader;
