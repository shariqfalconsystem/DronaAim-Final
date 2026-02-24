import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  MenuItem,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Link from '../../assets/icons/Linkb.png';
import Delink from '../../assets/icons/Delink.png';
import { assignVehicle, unassignVehicle, unlinkedVehicle } from '../../services/fleetManager/driverServices';
import { getVehicleDetails } from '../../services/fleetManager/vehiclesService';
import dayjs from 'dayjs';

const linkSchema = yup.object().shape({
  driverId: yup.string().required('Driver ID is required'),
  driverName: yup.string().required('Driver Name is required'),
  phone: yup.string().required('Phone is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  vehicleId: yup.string().required('Vehicle ID is required'),
  vin: yup.string().required('VIN is required'),
  customVehicleId: yup.string(),
});

interface Vehicle {
  vehicleId: string;
  customVehicleId?: string;
  vin?: string;
}

interface LinkDriverDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: boolean;
  fetchData: any;
  currentUserId: string;
  editDriverData?: any;
  vehicleId?: string;
}

const LinkDriverDialog: React.FC<LinkDriverDialogProps> = ({
  open,
  handleClose,
  isMobile,
  fetchData,
  currentUserId,
  editDriverData,
  vehicleId,
}) => {
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCustomVehicle, setSelectedCustomVehicle] = useState('');
  const [vin, setVin] = useState('');
  const [customVehicleId, setCustomVehicleId] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(linkSchema),
    defaultValues: {
      driverId: '',
      driverName: '',
      phone: '',
      email: '',
      vehicleId: '',
      vin: '',
      customVehicleId: '',
    },
  });

  const getRoleUidForCurrentDriver = (driver: any) => {
    if (!driver?.orgRoleAndScoreMapping || !Array.isArray(driver?.orgRoleAndScoreMapping)) {
      return 'NA';
    }
    const driverRole = driver.orgRoleAndScoreMapping.find(
      (mapping: any) => mapping.lonestarId === lonestarId && mapping.role === 'driver'
    );
    return driverRole?.roleUid || null;
  };

  const fetchUnlinkedVehicles = useCallback(async () => {
    try {
      const response = await unlinkedVehicle(lonestarId);
      if (Array.isArray(response?.data.vehicles)) {
        setVehicleOptions(response.data.vehicles);
      } else {
        console.error('Unexpected Response Format:', response);
        setVehicleOptions([]);
      }
    } catch (error) {
      console.error('Error fetching unlinked vehicles:', error);
      toast.error('Failed to load vehicle data');
      setVehicleOptions([]);
    }
  }, [lonestarId]);

  useEffect(() => {
    if (open && !vehicleId) {
      setVehicleOptions([]);
      fetchUnlinkedVehicles();
    }
  }, [open, fetchUnlinkedVehicles, vehicleId]);

  const resetForm = useCallback(() => {
    reset({
      driverId: '',
      driverName: '',
      phone: '',
      email: '',
      vehicleId: '',
      customVehicleId: '',
      vin: '',
    });
  }, [reset]);

  const fetchVehicleDetails = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return;
    try {
      const { data } = await getVehicleDetails(vehicleId);
      setVehicleDetails(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, []);

  useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleDetails(vehicleId);
    }
  }, [open, fetchVehicleDetails, vehicleId]);

  useEffect(() => {
    if (editDriverData && vehicleDetails) {
      setSelectedVehicle(vehicleDetails.vehicleId);
      setVin(vehicleDetails?.vin);
      setCustomVehicleId(vehicleDetails?.customVehicleId);
      setVehicleOptions([vehicleDetails]);
      reset({
        driverId: editDriverData.userId,
        driverName: `${editDriverData.firstName} ${editDriverData.lastName}`,
        phone: `${editDriverData.primaryPhoneCtryCd} ${editDriverData.primaryPhone}`,
        email: editDriverData.emailId,
        vehicleId: vehicleDetails.vehicleId,
        customVehicleId: vehicleDetails.customVehicleId,
        vin: vehicleDetails.vin,
      });
      setValue('customVehicleId', vehicleDetails.customVehicleId || '');
      setValue('vin', vehicleDetails.vin || '');
    }
  }, [editDriverData, vehicleDetails, reset, setValue]);

  const handleUnassign = async () => {
    try {
      const vehicleId = vehicleDetails?.vehicleId;
      const driverId = editDriverData?.userId;

      if (vehicleId && driverId) {
        const { status, data: delinkResponse } = await unassignVehicle(currentUserId, lonestarId, vehicleId, driverId);

        if (status === 200) {
          toast.success(delinkResponse?.message);
          handleClose();
          fetchData(1);
        } else {
          toast.error(delinkResponse?.details);
        }
      } else {
        toast.error('Vehicle ID or Driver ID not found');
      }
    } catch (error: any) {
      console.error('Error unlinking Vehicle:', error);
      toast.error(error?.response?.data?.details || 'An error occurred while unlinking the Vehicle');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (data.vehicleId) {
        const { status: linkStatus, data: linkResponse } = await assignVehicle(
          currentUserId,
          lonestarId,
          data.vehicleId,
          data.driverId
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
    } catch (error: any) {
      console.error('Error linking driver:', error);
      toast.error(error?.response?.data?.message || 'An error occurred while linking the driver');
    }
  };

  useEffect(() => {
    if (open === false) {
      resetForm();
      setSelectedVehicle('');
      setVehicleDetails([]);
    }
  }, [open, resetForm]);

  const handleVehicleChange = (event: any) => {
    const selectedId = event.target.value;
    setSelectedVehicle(selectedId);
    const vehicle = vehicleOptions.find((v) => v.vehicleId === selectedId);
    if (vehicle) {
      setSelectedCustomVehicle(vehicle.customVehicleId ?? '');
      setVin(vehicle.vin || '');
      setCustomVehicleId(vehicle.customVehicleId || '');
      setValue('vin', vehicle.vin || '');
      setValue('customVehicleId', vehicle.customVehicleId ?? '');
    } else {
      setSelectedCustomVehicle('');
      setVin('');
      setCustomVehicleId('');
      setValue('vin', '');
      setValue('customVehicleId', '');
    }
  };

  const handleCustomVehicleChange = (event: any) => {
    const selectedId = event.target.value;
    setSelectedCustomVehicle(selectedId);
    const vehicle = vehicleOptions.find((v) => v.customVehicleId === selectedId);
    if (vehicle) {
      setSelectedVehicle(vehicle.vehicleId || '');
      setVin(vehicle.vin || '');
      setCustomVehicleId(vehicle.customVehicleId || '');
      setValue('vin', vehicle.vin || '');
      setValue('customVehicleId', vehicle.customVehicleId ?? '');
      setValue('vehicleId', vehicle.vehicleId || '');
    } else {
      setSelectedVehicle('');
      setVin('');
      setValue('vin', '');
      setCustomVehicleId('');
      setValue('customVehicleId', '');
      setValue('vehicleId', '');
    }
  };

  useEffect(() => {
    setValue('customVehicleId', selectedCustomVehicle);
  }, [selectedCustomVehicle, setValue]);

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
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          mb: '25px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Link Driver
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ padding: '0px 16px', paddingLeft: '30px' }}>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#D9E2EA',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
              }}
            >
              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="driverId">
                  Driver ID <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="driverId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      disabled
                      error={!!errors.driverId}
                      helperText={typeof errors.driverId?.message === 'string' ? errors.driverId?.message : ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="driverName">
                  Driver Name <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="driverName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      disabled
                      error={!!errors.driverName}
                      helperText={typeof errors.driverName?.message === 'string' ? errors.driverName?.message : ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="phone">
                  Phone <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      disabled
                      error={!!errors.phone}
                      helperText={typeof errors.phone?.message === 'string' ? errors.phone?.message : ''}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#D9E2EA',
                padding: '7px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
              }}
            >
              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="email">
                  Email <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }: any) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      id="email"
                      variant="outlined"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: vehicleId ? '#D9E2EA' : '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
              }}
            >
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="normal">
                  Please select Vehicle ID / Custom Vehicle ID
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <InputLabel sx={{ mb: '4px' }}>
                  Vehicle ID <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="vehicleId"
                  control={control}
                  render={({ field }: any) => (
                    <FormControl fullWidth error={!!errors.vehicleId}>
                      <Select
                        {...field}
                        value={selectedVehicle || ''}
                        onChange={(e) => {
                          handleVehicleChange(e);
                          field.onChange(e);
                        }}
                        fullWidth
                        variant="outlined"
                        displayEmpty
                        sx={{
                          '& .MuiSelect-icon': { color: '#000' },
                          '& .MuiOutlinedInput-root': {
                            height: 40,
                            padding: '0px 14px',
                          },
                          '& .MuiInputBase-root': { height: 40 },
                          '& .MuiSelect-select': {
                            padding: '9px 14px',
                          },
                        }}
                        disabled={!!vehicleId}
                      >
                        {vehicleOptions.map((vehicle) => (
                          <MenuItem
                            key={vehicle.vehicleId}
                            value={vehicle.vehicleId}
                            sx={{
                              ':hover': {
                                backgroundColor: '#2c3e50',
                                color: '#fff',
                              },
                            }}
                          >
                            {vehicle.vehicleId}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vehicleId && (
                        <FormHelperText>
                          {typeof errors.vehicleId.message === 'string' ? errors.vehicleId.message : ''}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InputLabel sx={{ mb: '4px' }}>Custom Vehicle ID</InputLabel>
                <Controller
                  name="customVehicleId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCustomVehicleChange(e);
                        }}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiSelect-icon': { color: '#000' },
                          '& .MuiOutlinedInput-root': {
                            height: 40,
                            padding: '0px 14px',
                          },
                          '& .MuiInputBase-root': { height: 40 },
                          '& .MuiSelect-select': {
                            padding: '9px 14px',
                          },
                        }}
                        disabled={!!vehicleId}
                      >
                        {vehicleOptions.map((vehicle) => (
                          <MenuItem
                            key={vehicle.customVehicleId}
                            value={vehicle.customVehicleId}
                            sx={{
                              ':hover': {
                                backgroundColor: '#2c3e50',
                                color: '#fff',
                              },
                            }}
                          >
                            {vehicle.customVehicleId}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputLabel sx={{ mb: '4px' }}>
                  VIN <span style={{ color: 'red' }}>*</span>
                </InputLabel>
                <Controller
                  name="vin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      value={vin}
                      size="small"
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 40,
                          backgroundColor: '#D9E2EA',
                        },
                      }}
                      disabled
                      error={!!errors.vin}
                      helperText={typeof errors.vin?.message === 'string' ? errors.vin?.message : ''}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableRipple
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                background: !vehicleId ? '#2C3E50' : 'transparent',
                color: !vehicleId ? '#fff' : '#2C3E50',
                '&:hover': {
                  background: !vehicleId ? '#1F2D3D' : 'transparent',
                },
              }}
              startIcon={<img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />}
              disabled={!!vehicleId}
            >
              Assign
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (vehicleId) {
                  handleUnassign();
                } else {
                  reset();
                  handleClose();
                }
              }}
              color="primary"
              disableRipple
              sx={{
                mr: 1,
                borderRadius: 1,
                ml: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                background: vehicleId ? '#2C3E50' : 'transparent',
                color: vehicleId ? '#fff !important' : '#2C3E50',
                '&:hover': {
                  background: vehicleId ? '#1F2D3D' : 'transparent',
                },
              }}
              startIcon={
                <img
                  src={Delink}
                  alt="Delink Icon"
                  style={{
                    width: 20,
                    height: 20,
                    filter: vehicleId ? 'invert(1) brightness(2)' : 'none',
                  }}
                />
              }
              disabled={!vehicleId}
            >
              {vehicleId ? 'Unassign' : 'Cancel'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDriverDialog;
