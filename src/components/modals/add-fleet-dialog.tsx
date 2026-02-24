import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  InputLabel,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { addFleetUser, editFleet } from '../../services/insurer/IdashboardService';
import { useSelector } from 'react-redux';

const insurerId = 'INS9999';

const schema = yup.object().shape({
  dotNumber: yup.string().notRequired(),
  fleetName: yup.string().required('Fleet Name is required'),
  garageAddress: yup.string().required('Garage Address is required'),
  mailingAddress: yup.string().required('Mailing Address is required'),
});

interface AddFleetDialogProps {
  open: boolean;
  fetchData: any;
  currentUserId: string;
  handleClose: () => void;
  mode: any;
  editFleetData?: any;
}

const AddFleetDialog: React.FC<AddFleetDialogProps> = ({
  open,
  handleClose,
  mode,
  fetchData,
  currentUserId,
  editFleetData,
}) => {
  //const currentUserId='US1000';
  const [isAddFleetLoading, setIsAddFleetLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      dotNumber: '',
      fleetName: '',
      garageAddress: '',
      mailingAddress: '',
    },
  });
  const resetForm = useCallback(() => {
    reset({
      dotNumber: editFleetData?.dotNumber || '',
      fleetName: editFleetData?.name,
      garageAddress: editFleetData?.garageAddress,
      mailingAddress: editFleetData?.mailingAddress,
    });
  }, [reset]);

  useEffect(() => {
    console.log('edit vehicle data :', editFleetData);
    if (mode === 'add') {
      reset({
        dotNumber: '',
        fleetName: '',
        garageAddress: '',
        mailingAddress: '',
      });
    } else if (mode == 'edit' && editFleetData) {
      reset({
        dotNumber: editFleetData?.dotNumber || '',
        fleetName: editFleetData?.name,
        garageAddress: editFleetData?.garageAddress,
        mailingAddress: editFleetData?.mailingAddress,
      });
    }
  }, [mode, open, editFleetData, reset]);

  const onSubmit = async (data: any) => {
    if (isAddFleetLoading) return;
    setIsAddFleetLoading(true);
    console.log('Form Data Submitted:', data);
    const formattedData: any = {
      insurerId,
      dotNumber: data.dotNumber,
      fleetName: data.fleetName,
      garageAddress: data.garageAddress,
      mailingAddress: data.mailingAddress,
      currentLoggedInUserId: currentUserId,
      fleetId: editFleetData?.lonestarId,
    };

    if (mode === 'add') {
      formattedData.isUninsuredFleet = true;
    }

    try {
      if (mode === 'add') {
        console.log('Calling addFleetUser API with:', formattedData);
        const { status, data } = await addFleetUser(formattedData);
        console.log('API Response:', data);
        if (status === 200) {
          toast.success(data?.message);
          resetForm();
          handleClose();
          fetchData(1);
        } else {
          toast.error(data?.details || 'An error occurred in Adding Fleet');
        }
      } else if (mode === 'edit' && editFleetData?.lonestarId) {
        const { status, data } = await editFleet(formattedData);
        console.log('API Response:', data);
        if (status === 200) {
          toast.success(data?.message);
          resetForm();
          handleClose();
          fetchData(1);
        } else {
          toast.error(data?.details || 'An error occurred in Editing Fleet');
        }
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      toast.error(error?.response?.data?.details || 'An error occurred in Adding Fleet');
    } finally {
      setIsAddFleetLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: '10px',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          padding: '16px',
          mb: '10px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            {mode === 'edit' ? 'Edit Fleet' : 'Add New Fleet'}
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: '2px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ padding: '0px 16px', paddingLeft: '30px' }}>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
              }}
            >
              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel htmlFor="dotNumber" sx={{ mb: '4px' }}>
                    DOT Number
                  </InputLabel>
                  <Controller
                    name="dotNumber"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'edit' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'edit',
                        }}
                        disabled={mode === 'edit'}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <InputLabel htmlFor="fleetName" sx={{ mb: '4px' }}>
                    Fleet Name{' '}
                    <Typography component="span" color="error">
                      *
                    </Typography>
                  </InputLabel>
                  <Controller
                    name="fleetName"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: 'transparent',
                          },
                        }}
                        error={!!errors.fleetName}
                        helperText={errors.fleetName ? errors.fleetName.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
              }}
            >
              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel htmlFor="garageAddress" sx={{ mb: '4px' }}>
                    Garage Address
                    <Typography component="span" color="error">
                      *
                    </Typography>
                  </InputLabel>
                  <Controller
                    name="garageAddress"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: 'transparent',
                          },
                        }}
                        error={!!errors.garageAddress}
                        helperText={errors.garageAddress ? errors.garageAddress.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <InputLabel htmlFor="mailingAddress" sx={{ mb: '4px' }}>
                    Mailing Address{' '}
                    <Typography component="span" color="error">
                      *
                    </Typography>
                  </InputLabel>
                  <Controller
                    name="mailingAddress"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: 'transparent',
                          },
                        }}
                        error={!!errors.mailingAddress}
                        helperText={errors.mailingAddress ? errors.mailingAddress.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          <DialogActions
            sx={{
              justifyContent: 'flex-end',
              px: 3,
              pb: 2,
              bgcolor: '#ECF0F1',
              borderTop: '2px solid #3F5C784D',
              pt: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableRipple
              sx={{
                borderRadius: 2,
                backgroundColor: '#2C3E50',
                '&:hover': {
                  backgroundColor: '#1A242F',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#2C3E50',
                  color: '#fff',
                  opacity: 1,
                },
              }}
              disabled={isAddFleetLoading}
            >
              {mode === 'edit' ? 'Update' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              disableRipple
              sx={{
                mr: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#1A242F',
                  color: '#1A242F',
                },
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: 'none',
                },
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFleetDialog;
