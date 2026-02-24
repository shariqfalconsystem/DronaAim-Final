import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  InputLabel,
  Select,
  DialogActions,
  MenuItem,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import Delink from '../../../assets/icons/Delink.png';
import Link from '../../../assets/icons/Linkb.png';
import { useSelector } from 'react-redux';
import { editVehicleUser } from '../../../services/fleetManager/vehiclesService';
import ReactSelect from 'react-select';

const schema = yup.object().shape({
  vin: yup.string().required('VIN number is required').length(17, 'VIN must be exactly 17 characters long '),
  licensePlate: yup.string().notRequired(),
  customVehicleId: yup.string().nullable().notRequired(),
  make: yup
    .string()
    .required('Make is required')
    .matches(/^[A-Za-z\s]+$/, 'Make must contain only letters and spaces'),
  model: yup.string().required('Model is required'),
  year: yup
    .string()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .typeError('Year must be a valid number')
    .matches(/^\d{4}$/, 'Year must be exactly 4 digits')
    .required('Year is required'),
});

interface EditVehicleDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
  mode: any;
  fetchData: any;
  currentUserId: string;
  editVehicleData?: any;
  fleetOptions: any;
  isUnInsuredFleet: boolean;
  currentUnassignedPage: number;
}

const EditVehicleDialog: React.FC<EditVehicleDialogProps> = ({
  open,
  handleClose,
  isMobile,
  mode,
  fetchData,
  currentUserId,
  editVehicleData,
  fleetOptions,
  isUnInsuredFleet,
  currentUnassignedPage,
}) => {
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
      vin: '',
      licensePlate: '',
      customVehicleId: '',
      make: '',
      model: '',
      year: '',
    },
  });
  console.log('editdtaa', editVehicleData);

  const resetForm = useCallback(() => {
    reset({
      vin: editVehicleData?.vin || '',
      licensePlate: '',
      customVehicleId: '',
      make: '',
      model: '',
      year: '',
    });
  }, [reset]);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'link') && editVehicleData) {
      const imei = editVehicleData?.lookup_devices?.[0]?.imei;
      reset({
        vin: editVehicleData.vin,
        licensePlate: editVehicleData.tagLicencePlateNumber,
        customVehicleId: editVehicleData.customVehicleId,
        make: editVehicleData.make,
        model: editVehicleData.model,
        year: editVehicleData.year,
      });
    }
  }, [mode, open, editVehicleData, reset]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      lonestarId: data.lonestarId,
      vin: data.vin,
      licensePlate: data.licensePlate,
      customVehicleId: data.customVehicleId,
      make: data.make,
      model: data.model,
      year: data.year,
    };
    try {
      if (mode === 'edit') {
        const vehicleId = editVehicleData?.vehicleId;

        const { status, data: responseData } = await editVehicleUser(
          editVehicleData.lonestarId,
          vehicleId,
          currentUserId,
          formattedData
        );
        if (status === 200) {
          toast.success(responseData?.message);
          reset();
          handleClose();
          fetchData(currentUnassignedPage);
        } else {
          toast.error(responseData?.details);
        }
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      toast.error(error?.response?.data?.details || 'An error occurred while processing the IMEI linking');
    }
  };

  useEffect(() => {
    if (open === false) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: '10px',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          padding: '16px',
          mb: '10px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            {mode === 'edit' ? 'Edit Vehicle' : mode === 'link' ? 'Link Vehicle' : 'Add New Vehicle'}
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ padding: '2px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* First Grid */}
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
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel htmlFor="vin" sx={{ mb: '4px' }}>
                    VIN <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="vin"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'edit' || mode === 'link' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'edit' || mode === 'link',
                        }}
                        disabled={mode === 'link' || mode === 'edit'}
                        error={!!errors.vin}
                        helperText={errors.vin ? errors.vin.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>License Plate</InputLabel>
                  <Controller
                    name="licensePlate"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'link' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link',
                        }}
                        error={!!errors.licensePlate}
                        helperText={errors.licensePlate ? errors.licensePlate.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>Custom Vehicle ID </InputLabel>
                  <Controller
                    name="customVehicleId"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'link' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link',
                        }}
                        error={!!errors.customVehicleId}
                        helperText={errors.customVehicleId ? errors.customVehicleId.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Second Grid */}
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
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Make <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="make"
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
                        error={!!errors.make}
                        helperText={errors.make ? errors.make.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Model <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="model"
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
                        error={!!errors.model}
                        helperText={errors.model ? errors.model.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Year <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="year"
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
                        error={!!errors.year}
                        helperText={errors.year ? errors.year.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Buttons */}
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
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                // background: '#2C3E50',
                display: 'flex',
                alignItems: 'center',
                background:
                  mode === 'edit' || mode === 'add'
                    ? '#2C3E50'
                    : mode === 'link' &&
                      !(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                    ? '#2C3E50'
                    : 'transparent',
                color:
                  mode === 'edit' || mode === 'add'
                    ? '#fff'
                    : mode === 'link' &&
                      !(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                    ? '#fff'
                    : '#2C3E50',
                '&:hover': {
                  background:
                    mode === 'edit' || mode === 'add'
                      ? '#1F2D3D'
                      : mode === 'link' &&
                        !(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                      ? '#1F2D3D'
                      : 'transparent',
                },
              }}
              startIcon={mode === 'link' && <img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />}
              disabled={
                mode === 'link' &&
                !!(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
              }
            >
              {mode === 'edit' ? 'Update' : mode === 'link' ? 'Assign' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                if (mode === 'edit' && editVehicleData) {
                  const imei = editVehicleData?.lookup_devices?.[0]?.imei;
                  reset({
                    vin: editVehicleData.vin,
                    licensePlate: '',
                    customVehicleId: '',
                    make: '',
                    model: '',
                    year: '',
                    imei: imei,
                    deviceProvider: editVehicleData?.lookup_devices?.[0]?.deviceProvider,
                  });
                  handleClose();
                } else {
                  reset();
                  handleClose();
                }
              }}
              variant="outlined"
              color="primary"
              sx={{
                mr: 1,
                borderRadius: 1,
                ml: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                background:
                  mode === 'link' &&
                  (editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                    ? '#2C3E50'
                    : 'transparent',
                color:
                  mode === 'link' &&
                  (editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                    ? '#fff'
                    : '#2C3E50',
                '&:hover': {
                  background:
                    mode === 'link' &&
                    (editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                      ? '#1F2D3D'
                      : 'transparent',
                },
              }}
              startIcon={
                mode === 'link' && (
                  <img
                    src={Delink}
                    alt="Delink Icon"
                    style={{
                      width: 20,
                      height: 20,
                      filter:
                        mode === 'link' &&
                        (editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                          ? 'invert(1) brightness(2)'
                          : 'none',
                    }}
                  />
                )
              }
              disabled={
                mode === 'link' &&
                !(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
              }
            >
              {mode === 'link' ? 'Unassign' : 'Cancel'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;
