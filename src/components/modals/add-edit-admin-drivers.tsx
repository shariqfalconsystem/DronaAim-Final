import React, { useCallback, useEffect, useState } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RiCloseCircleFill } from '@remixicon/react';
import { countryCodes, LICENSE_TYPES, nameTitles, US_STATES } from '../../common/constants/general';
import { unassignVehicle, assignVehicle, unlinkedVehicle } from '../../services/fleetManager/driverServices';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Link from '../../assets/icons/Linkb.png';
import Delink from '../../assets/icons/Delink.png';
import { getVehicleDetails } from '../../services/fleetManager/vehiclesService';
import ReactSelect from 'react-select';
import { addUserFromAdmin, editUserFromAdmin } from '../../services/admin/userMangementService';
import ValidationErrorModal from './driver-validation-erros';

const phoneRegExp = /^[0-9]{10}$/;
const nameRegExp = /^[a-zA-Z]+$/;

const addEditSchema = yup.object().shape({
  title: yup.string(),
  firstName: yup
    .string()
    .matches(nameRegExp, 'First name must only contain letters')
    .required('First name is required'),
  lastName: yup.string().matches(nameRegExp, 'Last name must only contain letters').required('Last name is required'),
  licenseId: yup.string(),
  licenseExpiryDate: yup.date().nullable(),
  licenseType: yup.string(),
  licenseIssuedState: yup.string(),
  primaryPhoneCountryCode: yup.string(),
  primaryPhoneNumber: yup
    .string()
    .required('Primary phone number is required')
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  alternativePhoneCountryCode: yup.string(),
  alternativePhoneNumber: yup
    .string()
    .nullable()
    .notRequired()
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  email: yup
    .string()
    .email('Invalid email format')
    .matches(/^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain')
    .required('Email is required'),
  address: yup.string(),
  employmentStartDate: yup.date().nullable(),
  dateOfBirth: yup.date().nullable(),
});
const linkSchema = yup.object().shape({
  driverId: yup.string().required('Driver ID is required'),
  driverName: yup.string().required('Driver Name is required'),
  phone: yup.string().required('Phone is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  vehicleId: yup.string().required('Vehicle ID is required'),
  vin: yup.string().required('VIN is required'),
  customVehicleId: yup.string(),
});

interface AddDriverDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: boolean;
  fetchData: any;
  fetchUninsuredData: any;
  currentUserId: string;
  mode: any;
  editDriverData?: any;
  fleetOptions: any;
  currentPage: number;
  currentUninsuredPage: number;
}
interface Vehicle {
  vehicleId: string;
  customVehicleId?: string;
  vin?: string;
}
const AddEditAdminDriverDialog: React.FC<AddDriverDialogProps> = ({
  open,
  handleClose,
  isMobile,
  fetchData,
  fetchUninsuredData,
  currentUserId,
  mode,
  editDriverData,
  fleetOptions,
  currentPage,
  currentUninsuredPage,
}) => {
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCustomVehicle, setSelectedCustomVehicle] = useState('');
  const [vin, setVin] = useState('');
  const [customVehicleId, setCustomVehicleId] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [isSubmiting, setIsSubmitting] = useState<any>(false);

  const schema = mode === 'link' ? (linkSchema as yup.ObjectSchema<any>) : (addEditSchema as yup.ObjectSchema<any>);
  const lonestarId = editDriverData?.lonestarId;

  console.log('mode : ', mode);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(mode === 'link'
        ? {
            driverId: '',
            driverName: '',
            phone: '',
            email: '',
            vehicleId: '',
            vin: '',
            customVehicleId: '',
          }
        : {
            title: 'Mr',
            firstName: '',
            lastName: '',
            licenseId: '',
            licenseExpiryDate: null,
            licenseType: '',
            licenseIssuedState: '',
            primaryPhoneCountryCode: '+1',
            primaryPhoneNumber: '',
            alternativePhoneCountryCode: '+1',
            alternativePhoneNumber: '',
            email: '',
            address: '',
            employmentStartDate: null,
            dateOfBirth: null,
            lonestarId: null,
            name: '',
          }),
    },
  });

  // unlinked vehicle data

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
    if (open && mode === 'link' && !editDriverData?.vehicleId) {
      setVehicleOptions([]);
      fetchUnlinkedVehicles();
    }
  }, [open, mode, fetchUnlinkedVehicles, editDriverData?.vehicleId]);

  const resetForm = useCallback(() => {
    if (mode === 'link') {
      reset({
        driverId: '',
        driverName: '',
        phone: '',
        email: '',
        vehicleId: '',
        customVehicleId: '',
        vin: '',
      });
    } else {
      reset({
        title: 'Mr.',
        firstName: '',
        lastName: '',
        licenseId: '',
        licenseExpiryDate: null,
        licenseType: '',
        licenseIssuedState: '',
        primaryPhoneCountryCode: '+1',
        primaryPhoneNumber: '',
        alternativePhoneCountryCode: '+1',
        alternativePhoneNumber: '',
        email: '',
        address: '',
        employmentStartDate: null,
        dateOfBirth: null,
        vehicleId: '',
        customVehicleId: '',
        vin: '',
        lonestarId: null,
        name: '',
      });
    }
  }, [reset, mode]);

  useEffect(() => {
    if (mode === 'edit' && editDriverData) {
      reset({
        title: editDriverData.initials || 'Mr.',
        firstName: editDriverData.firstName,
        lastName: editDriverData.lastName,
        licenseId: editDriverData.licenseId,
        licenseExpiryDate: editDriverData.licenseExpDt ? dayjs(editDriverData.licenseExpDt) : null,
        licenseType: editDriverData.licenseType,
        licenseIssuedState: editDriverData.licenseIssuedState,
        primaryPhoneCountryCode: editDriverData.primaryPhoneCtryCd,
        primaryPhoneNumber: editDriverData.primaryPhone,
        alternativePhoneCountryCode: editDriverData.altPhoneCtryCd,
        alternativePhoneNumber: editDriverData.altPhone,
        email: editDriverData.emailId,
        address: editDriverData.address,
        employmentStartDate: editDriverData.empStartDt ? dayjs(editDriverData.empStartDt) : null,
        dateOfBirth: editDriverData.dob ? dayjs(editDriverData.dob) : null,
        lonestarId: editDriverData?.roleAndScoreMapping?.lonestarId,
        name: editDriverData?.roleAndScoreMapping?.orgName,
      });
    }
    if (mode === 'link' && editDriverData && vehicleDetails) {
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
  }, [mode, open, editDriverData, vehicleDetails, reset]);

  const handleUnassign = async () => {
    try {
      const vehicleId = vehicleDetails?.vehicleId;
      const driverId = editDriverData?.userId;

      if (vehicleId && driverId) {
        const { status, data: delinkResponse } = await unassignVehicle(currentUserId, lonestarId, vehicleId, driverId);

        if (status === 200) {
          toast.success(delinkResponse?.message);
          handleClose();
          fetchData(currentPage);
          fetchUninsuredData(currentUninsuredPage);
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
    if (open && mode === 'link' && editDriverData?.vehicleId) {
      fetchVehicleDetails(editDriverData?.vehicleId);
    }
  }, [open, mode, editDriverData?.vehicleId, fetchVehicleDetails]);

  const onSubmit = async (data: any) => {
    const fleetId = data?.lonestarId;

    const orgRoleMappings =
      mode === 'edit'
        ? [
            {
              roleUid: editDriverData?.roleAndScoreMapping?.roleUid,
              role: 'driver',
              lonestarId: fleetId,
              action: 'update',
            },
          ]
        : [
            {
              role: 'driver',
              lonestarId: fleetId,
              action: 'insert',
            },
          ];

    console.log('data', data);
    const formattedData: any = {
      initials: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      primaryPhone: data.primaryPhoneNumber,
      primaryPhoneCtryCd: data.primaryPhoneCountryCode,
      emailId: data.email,
      activeStatus: 'active',
      licenseId: data.licenseId,
      licenseExpDt: data.licenseExpiryDate ? dayjs(data.licenseExpiryDate)?.format('MMMM D, YYYY') : null,
      licenseType: data.licenseType,
      licenseIssuedState: data.licenseIssuedState,
      altPhoneCtryCd: data.alternativePhoneCountryCode,
      altPhone: data.alternativePhoneNumber,
      address: data.address,
      empStartDt: data.employmentStartDate ? dayjs(data.employmentStartDate)?.format('MMMM D, YYYY') : null,
      dob: data.dateOfBirth ? dayjs(data.dateOfBirth)?.format('MMMM D, YYYY') : null,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      vin: data.vin,
      customVehicleId: data.customVehicleId,
      orgRoleMappings,
    };

    if (mode === 'edit' && editDriverData?.userId) {
      formattedData.userId = editDriverData.userId;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        const { status, data: responseData } = await addUserFromAdmin(currentUserId, formattedData);
        if (status === 200) {
          toast.success(responseData?.message);
          reset();
          handleClose();
          fetchData(currentPage);
          fetchUninsuredData(currentUninsuredPage);
        } else {
          toast.error(responseData?.message);
        }
      }

      if (mode === 'edit') {
        const userId = editDriverData?.userId;
        const { status, data: responseData } = await editUserFromAdmin(currentUserId, formattedData);
        if (status === 200) {
          toast.success(responseData?.message);
          reset();
          handleClose();
          fetchData(currentPage);
          fetchUninsuredData(currentUninsuredPage);
        } else {
          toast.error(responseData?.message);
        }
      }

      if (mode === 'link') {
        if (formattedData.vehicleId) {
          const { status: linkStatus, data: linkResponse } = await assignVehicle(
            currentUserId,
            fleetId,
            formattedData.vehicleId,
            formattedData.driverId
          );
          if (linkStatus === 200) {
            toast.success(linkResponse?.message);
            reset();
            handleClose();
            fetchData(currentPage);
            fetchUninsuredData(currentUninsuredPage);
          } else {
            toast.error(linkResponse?.details);
          }
        } else {
          toast.error('Please select an IMEI to assign');
        }
      }
    } catch (error: any) {
      if (mode === 'add' || mode === 'edit') {
        if (
          error?.response?.data?.userValidationErrorMap &&
          Object.keys(error?.response?.data?.userValidationErrorMap).length > 0
        ) {
          setValidationErrors(error?.response?.data?.userValidationErrorMap);
          setValidationErrorModalOpen(true);
        }
      } else {
        console.error('Error posting data: ', error);
        toast.error(error?.response?.data?.message || 'An error occurred while Adding the driver');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open === false) {
      resetForm();
      setSelectedVehicle('');
      setVehicleDetails([]);
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (mode === 'add') {
      resetForm();
    }
  }, [mode, resetForm]);

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
  }, [selectedCustomVehicle]);

  const selectFleetOptions = fleetOptions.map((fleet: any) => ({
    value: fleet.name,
    label: fleet.name,
    insuredId: fleet.insuredId,
    lonestarId: fleet.lonestarId,
  }));

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      height: '40px',
      minHeight: '40px',
      backgroundColor: '#F7FAFC',
      borderColor: state.isFocused ? '#2c3e50' : '#969696',
      boxShadow: state.isFocused ? '0 0 0 1px #2c3e50' : 'none',
      '&:hover': {
        borderColor: '#2c3e50',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2c3e50' : state.isFocused ? '#2c3e50' : 'white',
      color: state.isSelected || state.isFocused ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#2c3e50',
        color: 'white',
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: '38px',
      padding: '0 6px',
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: '38px',
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <>
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
            mb: '10px',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="#fff" variant="h6">
              {mode === 'edit' ? 'Edit Driver' : mode === 'link' ? 'Link Driver' : 'Add New Driver'}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseCircleFill color="#fff" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ padding: '0px 16px', paddingLeft: '30px' }}>
              {mode === 'link' ? (
                <>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      border: '1px solid #DFE7EE',
                      backgroundColor: mode === 'link' ? '#D9E2EA' : '#F7FAFC',
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
                            disabled={mode === 'link'}
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
                            disabled={mode === 'link'}
                            error={!!errors.driverName}
                            helperText={
                              typeof errors.driverName?.message === 'string' ? errors.driverName?.message : ''
                            }
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
                            disabled={mode === 'link'}
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
                      backgroundColor: mode === 'link' ? '#D9E2EA' : '#F7FAFC',
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
                            disabled={mode === 'link'}
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
                      backgroundColor: mode === 'link' && editDriverData.vehicleId ? '#D9E2EA' : '#F7FAFC',
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
                              disabled={mode === 'link' && editDriverData.vehicleId}
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
                              disabled={mode === 'link' && !!editDriverData.vehicleId}
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
                                backgroundColor: mode === 'link' ? '#D9E2EA' : 'transparent',
                              },
                            }}
                            disabled={mode === 'link'}
                            error={!!errors.vin}
                            helperText={typeof errors.vin?.message === 'string' ? errors.vin?.message : ''}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      border: '1px solid #DFE7EE',
                      padding: '2px',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                      mb: '28px',
                      mt: '9px',
                    }}
                  >
                    <Grid item xs={12} sm={8}>
                      <InputLabel htmlFor="driverName">
                        Driver Name <span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <Box display="flex">
                        <Controller
                          name="title"
                          control={control}
                          defaultValue="Mr."
                          render={({ field }: any) => (
                            <Select
                              {...field}
                              variant="outlined"
                              sx={{ width: '90px', mr: 1, height: '40px' }}
                              size="small"
                            >
                              {nameTitles?.map((state: any) => (
                                <MenuItem
                                  key={state.value}
                                  value={state.value}
                                  sx={{
                                    ':hover': {
                                      backgroundColor: '#2c3e50',
                                      color: '#fff',
                                    },
                                  }}
                                >
                                  {state.label}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <Controller
                          name="firstName"
                          control={control}
                          defaultValue=""
                          render={({ field }: any) => (
                            <TextField
                              {...field}
                              placeholder="First Name"
                              size="small"
                              sx={{ mr: 1, flex: 1 }}
                              error={!!errors.firstName}
                              helperText={errors.firstName?.message}
                            />
                          )}
                        />
                        <Controller
                          name="lastName"
                          control={control}
                          defaultValue=""
                          render={({ field }: any) => (
                            <TextField
                              {...field}
                              placeholder="Last Name"
                              size="small"
                              sx={{ flex: 1 }}
                              error={!!errors.lastName}
                              helperText={errors.lastName?.message}
                            />
                          )}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="licenseId">License No.</InputLabel>
                      <Controller
                        name="licenseId"
                        control={control}
                        defaultValue=""
                        render={({ field }: any) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            id="licenseId"
                            variant="outlined"
                            error={!!errors.licenseId}
                            helperText={errors.licenseId?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="licenseExpiryDate">License Expiry Date</InputLabel>
                      <Controller
                        name="licenseExpiryDate"
                        control={control}
                        render={({ field }: any) => (
                          <DatePicker
                            {...field}
                            sx={{
                              width: '100%',
                              '.MuiInputBase-root': {
                                height: '40px',
                              },
                            }}
                          />
                        )}
                      />
                      {errors.licenseExpiryDate && (
                        <FormHelperText error>
                          {typeof errors.licenseExpiryDate.message === 'string' ? errors.licenseExpiryDate.message : ''}
                        </FormHelperText>
                      )}{' '}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="licenseType">License Type</InputLabel>
                      <Controller
                        name="licenseType"
                        control={control}
                        defaultValue=""
                        render={({ field }: any) => (
                          <Select {...field} fullWidth variant="outlined" size="small" error={!!errors.licenseType}>
                            {LICENSE_TYPES.map((type: any) => (
                              <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{
                                  ':hover': {
                                    backgroundColor: '#2c3e50',
                                    color: '#fff',
                                  },
                                }}
                              >
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.licenseType && (
                        <FormHelperText error>
                          {typeof errors.licenseType.message === 'string' ? errors.licenseType.message : ''}
                        </FormHelperText>
                      )}{' '}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="licenseIssuedState">License Issued State</InputLabel>
                      <Controller
                        name="licenseIssuedState"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Select
                            {...field}
                            fullWidth
                            variant="outlined"
                            size="small"
                            error={!!errors.licenseIssuedState}
                          >
                            {US_STATES?.map((state: any) => (
                              <MenuItem
                                key={state.value}
                                value={state.value}
                                sx={{
                                  ':hover': {
                                    backgroundColor: '#2c3e50',
                                    color: '#fff',
                                  },
                                }}
                              >
                                {state.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.licenseIssuedState && (
                        <FormHelperText error>
                          {typeof errors.licenseIssuedState.message === 'string'
                            ? errors.licenseIssuedState.message
                            : ''}
                        </FormHelperText>
                      )}{' '}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="primaryPhoneNumber">
                        Primary Phone Number <span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <Box display="flex">
                        <Controller
                          name="primaryPhoneCountryCode"
                          control={control}
                          defaultValue="+1"
                          render={({ field }: any) => (
                            <Select
                              {...field}
                              variant="outlined"
                              size="small"
                              sx={{ width: '100px', mr: 1, height: '40px' }}
                            >
                              {countryCodes.map((country: any) => (
                                <MenuItem
                                  key={country.code}
                                  value={country.code}
                                  sx={{
                                    ':hover': {
                                      backgroundColor: '#2c3e50',
                                      color: '#fff',
                                    },
                                  }}
                                >
                                  {country.code}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <Controller
                          name="primaryPhoneNumber"
                          control={control}
                          defaultValue=""
                          render={({ field }: any) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              error={!!errors.primaryPhoneNumber}
                              helperText={errors.primaryPhoneNumber?.message}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 10) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="alternativePhoneNumber">Alternative Phone Number</InputLabel>
                      <Box display="flex">
                        <Controller
                          name="alternativePhoneCountryCode"
                          control={control}
                          defaultValue="+1"
                          render={({ field }: any) => (
                            <Select
                              {...field}
                              variant="outlined"
                              size="small"
                              sx={{ width: '100px', mr: 1, height: '40px' }}
                            >
                              {countryCodes.map((country: any) => (
                                <MenuItem
                                  key={country.code}
                                  value={country.code}
                                  sx={{
                                    ':hover': {
                                      backgroundColor: '#2c3e50',
                                      color: '#fff',
                                    },
                                  }}
                                >
                                  {country.code}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <Controller
                          name="alternativePhoneNumber"
                          control={control}
                          defaultValue=""
                          render={({ field }: any) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              error={!!errors.alternativePhoneNumber}
                              helperText={errors.alternativePhoneNumber?.message}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 10) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>

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
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="address">Address</InputLabel>
                      <Controller
                        name="address"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            fullWidth
                            id="address"
                            variant="outlined"
                            error={!!errors.address}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="employmentStartDate">Employment Start Date</InputLabel>
                      <Controller
                        name="employmentStartDate"
                        control={control}
                        render={({ field }: any) => (
                          <DatePicker
                            {...field}
                            sx={{
                              width: '100%',
                              '.MuiInputBase-root': {
                                height: '40px',
                              },
                            }}
                          />
                        )}
                      />
                      {errors.employmentStartDate && (
                        <FormHelperText error>
                          {typeof errors.employmentStartDate.message === 'string'
                            ? errors.employmentStartDate.message
                            : ''}
                        </FormHelperText>
                      )}{' '}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <InputLabel htmlFor="dateOfBirth">Date of Birth</InputLabel>
                      <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field }: any) => (
                          <DatePicker
                            {...field}
                            sx={{
                              width: '100%',
                              '.MuiInputBase-root': {
                                height: '40px',
                              },
                            }}
                          />
                        )}
                      />
                      {errors.dateOfBirth && (
                        <FormHelperText error>
                          {typeof errors.dateOfBirth.message === 'string' ? errors.dateOfBirth.message : ''}
                        </FormHelperText>
                      )}{' '}
                    </Grid>
                  </Grid>

                  <>
                    <Typography variant="subtitle1" fontWeight="normal" sx={{ mt: 1, ml: 1 }}>
                      Associated Fleet
                    </Typography>
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        border: '1px solid #DFE7EE',
                        backgroundColor: mode === 'link' && !!editDriverData?.lonestarId ? '#D9E2EA' : '#F7FAFC',
                        padding: '8px',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        mb: '28px',
                        mt: '9px',
                      }}
                    >
                      <Grid item xs={12}>
                        <Typography variant="body1" fontWeight="normal">
                          Please select Fleet Name / Fleet ID
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <InputLabel sx={{ mb: '4px' }}>
                            Fleet Name <span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.name}>
                                <ReactSelect
                                  inputId="fleet-select"
                                  options={selectFleetOptions}
                                  value={selectFleetOptions.find((option: any) => option.value === field.value) || null}
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    setValue('insuredId', selectedOption ? selectedOption.insuredId : '');
                                    setValue('lonestarId', selectedOption ? selectedOption.lonestarId : '', {
                                      shouldValidate: true,
                                    });
                                  }}
                                  styles={customStyles}
                                  placeholder=""
                                  isClearable={false}
                                  filterOption={(option, inputValue) =>
                                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                                  }
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                />
                                {errors.name && (
                                  <FormHelperText>
                                    {typeof errors.name.message === 'string' ? errors.name.message : ''}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box>
                          <InputLabel sx={{ mb: '4px' }}>
                            Fleet ID <span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <Controller
                            name="lonestarId"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth error={!!errors.lonestarId}>
                                <Select
                                  {...field}
                                  value={field.value || ''}
                                  fullWidth
                                  variant="outlined"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    const selectedFleet = fleetOptions.find(
                                      (fleet: any) => fleet.lonestarId === e.target.value
                                    );
                                    if (selectedFleet) {
                                      setValue('name', selectedFleet.name);
                                    }
                                  }}
                                  sx={{
                                    '& .MuiSelect-icon': {
                                      color: '#000',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                      height: 40,
                                      padding: '0px 14px',
                                    },
                                    '& .MuiInputBase-root': {
                                      height: 40,
                                    },
                                    '& .MuiSelect-select': {
                                      padding: '9px 14px',
                                    },
                                  }}
                                  disabled={mode === 'link' && !!editDriverData?.lonestarId}
                                >
                                  {fleetOptions.map((fleet: any) => (
                                    <MenuItem key={fleet.lonestarId} value={fleet.lonestarId}>
                                      {fleet.lonestarId}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {errors.lonestarId && (
                                  <FormHelperText>
                                    {typeof errors.lonestarId.message === 'string' ? errors.lonestarId.message : ''}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            )}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                </>
              )}
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
                  background:
                    (mode === 'link' && !editDriverData.vehicleId) || mode === 'add' ? '#2C3E50' : 'transparent',
                  color: (mode === 'link' && !editDriverData.vehicleId) || mode === 'add' ? '#fff' : '#2C3E50',
                  '&:hover': {
                    background:
                      (mode === 'link' && !editDriverData.vehicleId) || mode === 'add' ? '#1F2D3D' : 'transparent',
                  },
                }}
                startIcon={mode === 'link' && <img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />}
                disabled={isSubmiting || (mode === 'link' && !!editDriverData.vehicleId)}
              >
                {mode === 'link' ? 'Assign' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (mode === 'link' && editDriverData.vehicleId) {
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
                  background: mode === 'link' && editDriverData.vehicleId ? '#2C3E50' : 'transparent',
                  color: mode === 'link' && editDriverData.vehicleId ? '#fff !important' : '#2C3E50',
                  '&:hover': {
                    background: mode === 'link' && editDriverData.vehicleId ? '#1F2D3D' : 'transparent',
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
                        filter: mode === 'link' && editDriverData.vehicleId ? 'invert(1) brightness(2)' : 'none',
                      }}
                    />
                  )
                }
                disabled={mode === 'link' && !editDriverData.vehicleId}
              >
                {mode === 'link' ? 'Unassign' : 'Cancel'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      <ValidationErrorModal
        open={validationErrorModalOpen}
        onClose={() => setValidationErrorModalOpen(false)}
        validationErrors={validationErrors}
      />
    </>
  );
};

export default AddEditAdminDriverDialog;
