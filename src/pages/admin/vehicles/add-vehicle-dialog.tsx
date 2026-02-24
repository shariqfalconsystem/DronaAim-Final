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
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import Delink from '../../../assets/icons/Delink.png';
import Link from '../../../assets/icons/Linkb.png';
import { useSelector } from 'react-redux';
import {
  getUnlinkedIMEIs,
  delinkImei,
  addVehicleUser,
  editVehicleUser,
  linkImei,
} from '../../../services/fleetManager/vehiclesService';

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
  imei: yup.string().nullable(),
  deviceProvider: yup.string().nullable(),
});

interface AddVehicleDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
  mode: any;
  fetchData: any;
  currentUserId: string;
  editVehicleData?: any;
  isUnInsuredFleet: boolean;
}

const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({
  open,
  handleClose,
  isMobile,
  mode,
  fetchData,
  currentUserId,
  editVehicleData,
  isUnInsuredFleet,
}) => {
  const lonestarId = useSelector((state: any) => state?.auth?.userData?.currentLonestarId);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  const [imeiList, setImeiList] = useState<string[]>([]);
  const [isDeviceProviderDisabled, setDeviceProviderDisabled] = useState(true);

  const fetchIMEIs = useCallback(async () => {
    try {
      const response = await getUnlinkedIMEIs(lonestarId);
      if (Array.isArray(response?.data)) {
        setImeiList(response?.data);
      } else {
        console.error('Unexpected Response Format:', response);
        setImeiList([]);
      }
    } catch (error) {
      console.error('Error fetching IMEI numbers:', error);
      toast.error('Failed to load IMEI numbers');
      setImeiList([]);
    }
  }, [lonestarId]);

  useEffect(() => {
    if (open && (mode === 'add' || mode === 'link')) {
      setImeiList([]);
      fetchIMEIs();
    }
  }, [open, mode, fetchIMEIs]);

  useEffect(() => {
    if (mode === 'edit' && editVehicleData) {
      const imei = editVehicleData?.lookup_devices?.[0]?.imei;
      if (imei && !imeiList.includes(imei)) {
        setImeiList((prevImeiList) => [...prevImeiList, imei]);
      }
    }
  }, [mode, editVehicleData, imeiList]);

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
      imei: '',
      deviceProvider: '',
    },
  });
  const resetForm = useCallback(() => {
    reset({
      vin: editVehicleData?.vin || '',
      licensePlate: '',
      customVehicleId: '',
      make: '',
      model: '',
      year: '',
      imei: editVehicleData?.lookup_devices?.[0]?.imei || '',
      partnerName: editVehicleData?.lookup_devices?.[0]?.deviceProvider || '',
    });
    setDeviceProviderDisabled(true);
  }, [reset]);

  useEffect(() => {
    if (mode === 'add') {
      reset({
        vin: '',
        licensePlate: '',
        customVehicleId: '',
        make: '',
        model: '',
        year: '',
        imei: '',
        partnerName: '',
      });
    } else if ((mode === 'edit' || mode === 'link') && editVehicleData) {
      const imei = editVehicleData?.lookup_devices?.[0]?.imei;
      reset({
        vin: editVehicleData.vin,
        licensePlate: editVehicleData.tagLicencePlateNumber,
        customVehicleId: editVehicleData.customVehicleId,
        make: editVehicleData.make,
        model: editVehicleData.model,
        year: editVehicleData.year,
        imei: imei,
        partnerName: editVehicleData?.lookup_devices?.[0]?.deviceProvider || 'DronaAIm',
      });

      if (imei && !imeiList.includes(imei)) {
        setImeiList((prevImeiList) => [...prevImeiList, imei]);
      }
    }
  }, [mode, open, editVehicleData, reset, imeiList]);

  const selectedImei = useWatch({
    control,
    name: 'imei',
  });

  useEffect(() => {
    if (selectedImei) {
      setValue('deviceProvider', 'DronaAIm');
      setDeviceProviderDisabled(true);
    } else {
      setValue('deviceProvider', '');
      setDeviceProviderDisabled(true);
    }
  }, [selectedImei, setValue]);

  const handleUnassign = async () => {
    try {
      const vehicleId = editVehicleData?.vehicleId;
      const imei = editVehicleData?.lookup_devices?.[0]?.imei;

      if (vehicleId && imei) {
        const { status, data: delinkResponse } = await delinkImei(lonestarId, vehicleId, currentUserId, imei);

        if (status === 200) {
          toast.success(delinkResponse?.message);
          setValue('imei', '');
          fetchIMEIs();
          handleClose();
          fetchData(1);
        } else {
          toast.error(delinkResponse?.details);
        }
      } else {
        toast.error('Vehicle ID or IMEI not found');
      }
    } catch (error: any) {
      console.error('Error unlinking IMEI:', error);
      toast.error(error?.response?.data?.details || 'An error occurred while unlinking the IMEI');
    }
  };

  const onSubmit = async (data: any) => {
    const formattedData = {
      lonestarId,
      vin: data.vin,
      licensePlate: data.tagLicensePlate,
      customVehicleId: data.customVehicleId,
      make: data.make,
      model: data.model,
      year: data.year,
      imei: data.imei,
      partnerName: data.deviceProvider,
    };
    try {
      if (mode === 'add') {
        const { status, data } = await addVehicleUser(lonestarId, currentUserId, formattedData);
        if (status === 200) {
          toast.success(data?.message);
          resetForm();
          handleClose();
          fetchData(1);
        } else {
          toast.error(data?.details);
        }
      }

      if (mode === 'edit') {
        const vehicleId = editVehicleData?.vehicleId;

        const { status, data: responseData } = await editVehicleUser(
          lonestarId,
          vehicleId,
          currentUserId,
          formattedData
        );
        if (status === 200) {
          toast.success(responseData?.message);
          reset();
          handleClose();
          fetchData(1);
        } else {
          toast.error(responseData?.details);
        }
      }

      if (mode === 'link') {
        const vehicleId = editVehicleData?.vehicleId;

        if (formattedData.imei) {
          const { status: linkStatus, data: linkResponse } = await linkImei(
            lonestarId,
            vehicleId,
            currentUserId,
            formattedData.imei
          );

          if (linkStatus === 200) {
            toast.success(linkResponse?.message);
            reset();
            handleClose();
            fetchData(1);
          } else {
            toast.error(linkResponse?.details);
          }
        } else {
          toast.error('Please select an IMEI to assign');
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
                        disabled={mode === 'link'}
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
                        disabled={mode === 'link'}
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
                            backgroundColor: mode === 'link' || !isUnInsuredFleet ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link' || !isUnInsuredFleet,
                        }}
                        disabled={mode === 'link' || !isUnInsuredFleet}
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
                            backgroundColor: mode === 'link' || !isUnInsuredFleet ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link' || !isUnInsuredFleet,
                        }}
                        disabled={mode === 'link' || !isUnInsuredFleet}
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
                            backgroundColor: mode === 'link' || !isUnInsuredFleet ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link' || !isUnInsuredFleet,
                        }}
                        disabled={mode === 'link' || !isUnInsuredFleet}
                        error={!!errors.year}
                        helperText={errors.year ? errors.year.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Third Grid */}
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor:
                  mode === 'edit' ||
                  !!(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                    ? '#E8EEF3'
                    : '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: 2,
              }}
            >
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="normal">
                  Please select IMEI Number
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>IMEI Number</InputLabel>
                  <Controller
                    name="imei"
                    control={control}
                    render={({ field }: any) => (
                      <Select
                        {...field}
                        fullWidth
                        variant="outlined"
                        displayEmpty
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={
                          !!(
                            editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId
                          ) || mode === 'edit'
                        }
                        sx={{
                          '& .MuiSelect-icon': {
                            color: '#000',
                          },
                          '& .MuiOutlinedInput-root': {
                            height: 40,
                            padding: '0px 14px',
                            backgroundColor: mode === 'edit' ? '#D9E2EA' : 'transparent',
                          },
                          '& .MuiInputBase-root': {
                            height: 40,
                            // backgroundColor: mode === 'edit' ? '#D9E2EA' : 'transparent',
                          },
                          '& .MuiSelect-select': {
                            padding: '9px 14px',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'edit' || !isUnInsuredFleet,
                        }}
                        error={!!errors.imei}
                      >
                        {imeiList.map((imei) => (
                          <MenuItem
                            key={imei}
                            value={imei}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'transparent',
                              },
                            }}
                          >
                            {imei}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>Device Provider </InputLabel>
                  <Controller
                    name="partnerName"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        disabled={isDeviceProviderDisabled}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: isDeviceProviderDisabled ? '#D9E2EA' : 'transparent',
                          },
                        }}
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
                } else if (mode === 'link') {
                  handleUnassign();
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

export default AddVehicleDialog;
