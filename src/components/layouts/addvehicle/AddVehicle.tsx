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
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Padding, SpaceBar } from '@mui/icons-material';

interface AddVehicleProps {
  open: boolean;
  onClose: () => void;
}

const AddVehicle: React.FC<AddVehicleProps> = ({ open, onClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const inputHeight = 40;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add New Fleet
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
            { label: 'Vehicle Name' },
            { label: 'Vehicle Identification Number' },
            { label: 'Fuel Type', select: true, options: ['Gasoline', 'Diesel', 'Electric'] },
            { label: 'Manufactured Year' },
            { label: 'Vehicle Manufacturer' },
            { label: 'Model of Vehicle' },
            { label: 'License Issuing State/Province' },
            { label: 'License Number' },
            { label: 'License Expiry Date', type: 'date' },
            { label: 'Fuel Tank Capacity - Primary & Secondary', isCustom: true },
            { label: 'Insurance Policy Number' },
            { label: 'Inspection Form', select: true, options: ['Form 1', 'Form 2'] },
            { label: 'Attach Device', select: true, options: ['Device 1', 'Device 2'] },
            { label: 'Assign Driver', select: true, options: ['Driver 1', 'Driver 2'] },
          ].map((field, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box display="flex" flexDirection="column">
                <Typography variant="caption" sx={{ marginBottom: '4px', color: 'black' }}>
                  {field.label}
                </Typography>
                {field.isCustom ? (
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      fullWidth
                      sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px`, fontSize: '0.875rem' } }}
                    />
                    <Typography variant="caption" sx={{ color: 'black' }}>
                      Gallons
                    </Typography>
                    <TextField
                      fullWidth
                      sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px`, fontSize: '0.875rem' } }}
                    />
                    <Typography variant="caption" sx={{ color: 'black' }}>
                      Gallons
                    </Typography>
                  </Box>
                ) : field.select ? (
                  <FormControl fullWidth sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px` } }}>
                    <Select displayEmpty>
                      {field.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : field.type === 'date' ? (
                  <TextField
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiInputBase-root': { height: `${inputHeight}px` } }}
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
export default AddVehicle;
