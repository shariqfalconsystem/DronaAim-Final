import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  IconButton,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  useTheme,
  InputAdornment,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AddFleetProps {
  open: boolean;
  onClose: () => void;
}

const AddFleet: React.FC<AddFleetProps> = ({ open, onClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const inputHeight = 40;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add New Vehicle
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: theme.spacing(1), top: theme.spacing(1), color: theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          {[
            { label: 'Company Name', xs: 12, md: 4 },
            { label: 'Contact Information', xs: 12, md: 4 },
            { label: 'Company Type', xs: 12, md: 4, select: true, options: ['Type 1', 'Type 2'] },
            { label: 'Fleet Size', xs: 12, md: 4 },
            { label: 'Fleet Composition', xs: 12, md: 4 },
            { label: 'Operating Regions', xs: 12, md: 4 },
            { label: 'Telematics Provider', xs: 12, md: 4, select: true, options: ['Provider 1', 'Provider 2'] },
            { label: 'Telematics Integration Status', xs: 12, md: 4 },
            { label: 'Insurance Provider', xs: 12, md: 4, select: true, options: ['Provider 1', 'Provider 2'] },
            { label: 'Insurance Policy Plan', xs: 12, md: 4, select: true, options: ['Policy 1', 'Policy 2'] },
            { label: 'Maintenance Schedule', xs: 12, md: 4, select: true, options: ['Schedule 1', 'Schedule 2'] },
            { label: 'Driver Training Records', xs: 12, md: 4, browse: true },
            { label: 'Safety Records', xs: 12, md: 4, browse: true },
            { label: 'Compliance Documentation', xs: 12, md: 4, browse: true },
          ].map((field, index) => (
            <Grid item xs={field.xs} md={field.md} key={index}>
              <Box display="flex" flexDirection="column">
                <InputLabel sx={{ fontSize: '0.75rem', color: 'black' }}>{field.label}</InputLabel>
                {field.select ? (
                  <FormControl fullWidth sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px` } }}>
                    <Select displayEmpty>
                      {field.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : field.browse ? (
                  <TextField
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px` } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Divider orientation="vertical" sx={{ height: 30, marginRight: 1 }} />
                          <Button
                            variant="text"
                            size="small"
                            sx={{
                              fontSize: '0.8rem',
                              backgroundColor: 'white',
                              color: 'black',
                              boxShadow: 'none',
                              textTransform: 'none',
                            }}
                          >
                            Browse
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px`, fontSize: '0.875rem' } }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <Divider sx={{ marginBottom: 1.5 }} />
      <DialogActions sx={{ marginBottom: 2 }}>
        <Button
          variant="text"
          size="small"
          onClick={onClose}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            boxShadow: 'none',
            border: '1px solid gray',
            textTransform: 'none',
          }}
        >
          Clear
        </Button>
        <Button
          variant="text"
          size="small"
          sx={{
            backgroundColor: 'white',
            color: 'black',
            boxShadow: 'none',
            border: '1px solid gray',
            textTransform: 'none',
          }}
        >
          CSV Import
        </Button>
        <Button
          variant="text"
          size="small"
          sx={{
            backgroundColor: 'gray',
            color: 'white',
            boxShadow: 'none',
            border: '1px solid gray',
            textTransform: 'none',
          }}
        >
          Add Fleet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFleet;
