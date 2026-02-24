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
import {
  getUnlinkedIMEIs,
  delinkImei,
  addVehicleUser,
  editVehicleUser,
  linkImei,
} from '../../../services/fleetManager/vehiclesService';
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
  name: yup.string().nullable(),
  lonestarId: yup.string().nullable(),
  imei: yup.string().nullable(),
  deviceProvider: yup.string().nullable(),
});

interface AddVehicleDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
  mode: any;
  fetchData: any;
  fetchUnassignedVehicles: any;
  currentUserId: string;
  editVehicleData?: any;
  fleetOptions: any;
  isUnInsuredFleet: boolean;
  isAssigned: boolean;
  currentPage: number;
  currentUnassignedPage: number;
}

const LinkVehicleDialog: React.FC<AddVehicleDialogProps> = ({
  open,
  handleClose,
  isMobile,
  mode,
  fetchData,
  fetchUnassignedVehicles,
  editVehicleData,
  currentUserId,
  fleetOptions,
  isUnInsuredFleet,
  isAssigned,
  currentPage,
  currentUnassignedPage,
}) => {
  const lonestarId = useSelector((state: any) => state?.auth?.userData?.currentLonestarId);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const subscriptionId = isAssigned ? 'SUB0001' : 'SUB0002';

  const [imeiList, setImeiList] = useState<string[]>([]);
  const [isDeviceProviderDisabled, setDeviceProviderDisabled] = useState(true);
  console.log('editdtaa', editVehicleData);

  const fetchIMEIs = useCallback(async () => {
    try {
      const response = await getUnlinkedIMEIs(editVehicleData?.lonestarId);
      console.log('lonestarID', lonestarId);
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
  }, [editVehicleData?.lonestarId]);

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
      name: '',
      lonestarId: '',
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
      name: '',
      lonestarId: '',
      imei: editVehicleData?.lookup_devices?.[0]?.imei || '',
      partnerName: editVehicleData?.lookup_devices?.[0]?.deviceProvider || '',
    });
    setDeviceProviderDisabled(true);
  }, [reset]);

  useEffect(() => {
    if (mode === 'link' && editVehicleData) {
      const imei = editVehicleData?.lookup_devices?.[0]?.imei;
      reset({
        vin: editVehicleData.vin,
        licensePlate: editVehicleData.tagLicencePlateNumber,
        customVehicleId: editVehicleData.customVehicleId,
        make: editVehicleData.make,
        model: editVehicleData.model,
        year: editVehicleData.year,
        name: editVehicleData.name,
        lonestarId: editVehicleData.lonestarId,
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
    if (open === false) {
      resetForm();
    }
  }, [open, resetForm]);

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
        const { status, data: delinkResponse } = await delinkImei(
          editVehicleData?.lonestarId,
          vehicleId,
          currentUserId,
          imei
        );

        if (status === 200) {
          toast.success(delinkResponse?.message);
          setValue('imei', '');
          fetchIMEIs();
          handleClose();
          fetchData(currentPage);
          fetchUnassignedVehicles(currentUnassignedPage);
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
      subscriptionId,
      vin: data.vin,
      licensePlate: data.tagLicensePlate,
      customVehicleId: data.customVehicleId,
      make: data.make,
      model: data.model,
      year: data.year,
      name: data.year,
      lonestarId: data.year,
      imei: data.imei,
      partnerName: data.deviceProvider,
    };
    try {
      if (mode === 'link') {
        const vehicleId = editVehicleData?.vehicleId;

        if (formattedData.imei) {
          const { status: linkStatus, data: linkResponse } = await linkImei(
            editVehicleData?.lonestarId,
            vehicleId,
            currentUserId,
            formattedData.imei
          );

          if (linkStatus === 200) {
            toast.success(linkResponse?.message);
            reset();
            handleClose();
            fetchData(currentPage);
            fetchUnassignedVehicles(currentUnassignedPage);
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
      backgroundColor:
        (mode === 'link' && !!editVehicleData?.insuredId) || !!editVehicleData?.lonestarId ? '#D9E2EA' : 'white',
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
            {/* {!isAssigned && (
              <>
                <Box
                  sx={{
                    pointerEvents: isAssigned ? 'none' : 'auto',
                    opacity: isAssigned ? 0.6 : 1,
                  }}
                >
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      border: '1px solid #DFE7EE',
                      backgroundColor: mode === 'link' && !!editVehicleData?.lonestarId ? '#D9E2EA' : '#F7FAFC',
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
                                  setValue('lonestarId', selectedOption ? selectedOption.lonestarId : '');
                                  // clearErrors(['insuredId', 'lonestarId']);
                                }}
                                styles={customStyles}
                                placeholder=""
                                isDisabled={
                                  (mode === 'link' && !!editVehicleData?.insuredId) || !!editVehicleData?.lonestarId
                                }
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
                                disabled={mode === 'link' && !!editVehicleData?.lonestarId}
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

                    <Grid item xs={12}>
                      <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 1 }}>
                        <Grid item>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                              borderRadius: 1,
                              textTransform: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              background:
                                mode === 'edit' || mode === 'add'
                                  ? '#2C3E50'
                                  : mode === 'link' &&
                                    !(
                                      editVehicleData?.lookup_devices?.[0]?.imei ||
                                      editVehicleData?.lookup_devices?.[0]?.deviceId
                                    )
                                  ? '#2C3E50'
                                  : 'transparent',
                              color:
                                mode === 'edit' || mode === 'add'
                                  ? '#fff'
                                  : mode === 'link' &&
                                    !(
                                      editVehicleData?.lookup_devices?.[0]?.imei ||
                                      editVehicleData?.lookup_devices?.[0]?.deviceId
                                    )
                                  ? '#fff'
                                  : '#2C3E50',
                              '&:hover': {
                                background:
                                  mode === 'edit' || mode === 'add'
                                    ? '#1F2D3D'
                                    : mode === 'link' &&
                                      !(
                                        editVehicleData?.lookup_devices?.[0]?.imei ||
                                        editVehicleData?.lookup_devices?.[0]?.deviceId
                                      )
                                    ? '#1F2D3D'
                                    : 'transparent',
                              },
                            }}
                            startIcon={
                              mode === 'link' && <img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />
                            }
                            disabled={
                              mode === 'link' &&
                              !!(
                                editVehicleData?.lookup_devices?.[0]?.imei ||
                                editVehicleData?.lookup_devices?.[0]?.deviceId
                              )
                            }
                          >
                            Assign
                          </Button>
                        </Grid>
                        <Grid item>
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
                              borderRadius: 1,
                              textTransform: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              background:
                                mode === 'link' &&
                                (editVehicleData?.lookup_devices?.[0]?.imei ||
                                  editVehicleData?.lookup_devices?.[0]?.deviceId)
                                  ? '#2C3E50'
                                  : 'transparent',
                              color:
                                mode === 'link' &&
                                (editVehicleData?.lookup_devices?.[0]?.imei ||
                                  editVehicleData?.lookup_devices?.[0]?.deviceId)
                                  ? '#fff'
                                  : '#2C3E50',
                              '&:hover': {
                                background:
                                  mode === 'link' &&
                                  (editVehicleData?.lookup_devices?.[0]?.imei ||
                                    editVehicleData?.lookup_devices?.[0]?.deviceId)
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
                                      (editVehicleData?.lookup_devices?.[0]?.imei ||
                                        editVehicleData?.lookup_devices?.[0]?.deviceId)
                                        ? 'invert(1) brightness(2)'
                                        : 'none',
                                  }}
                                />
                              )
                            }
                            disabled={
                              mode === 'link' &&
                              !(
                                editVehicleData?.lookup_devices?.[0]?.imei ||
                                editVehicleData?.lookup_devices?.[0]?.deviceId
                              )
                            }
                          >
                            Unassign
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )} */}

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
              <Grid item xs={12}>
                <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 1 }}>
                  <Grid item>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        background:
                          mode === 'edit' || mode === 'add'
                            ? '#2C3E50'
                            : mode === 'link' &&
                              !(
                                editVehicleData?.lookup_devices?.[0]?.imei ||
                                editVehicleData?.lookup_devices?.[0]?.deviceId
                              )
                            ? '#2C3E50'
                            : 'transparent',
                        color:
                          mode === 'edit' || mode === 'add'
                            ? '#fff'
                            : mode === 'link' &&
                              !(
                                editVehicleData?.lookup_devices?.[0]?.imei ||
                                editVehicleData?.lookup_devices?.[0]?.deviceId
                              )
                            ? '#fff'
                            : '#2C3E50',
                        '&:hover': {
                          background:
                            mode === 'edit' || mode === 'add'
                              ? '#1F2D3D'
                              : mode === 'link' &&
                                !(
                                  editVehicleData?.lookup_devices?.[0]?.imei ||
                                  editVehicleData?.lookup_devices?.[0]?.deviceId
                                )
                              ? '#1F2D3D'
                              : 'transparent',
                        },
                      }}
                      startIcon={
                        mode === 'link' && <img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />
                      }
                      disabled={
                        mode === 'link' &&
                        !!(editVehicleData?.lookup_devices?.[0]?.imei || editVehicleData?.lookup_devices?.[0]?.deviceId)
                      }
                    >
                      Assign
                    </Button>
                  </Grid>
                  <Grid item>
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
                        borderRadius: 1,
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
                            (editVehicleData?.lookup_devices?.[0]?.imei ||
                              editVehicleData?.lookup_devices?.[0]?.deviceId)
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
                                (editVehicleData?.lookup_devices?.[0]?.imei ||
                                  editVehicleData?.lookup_devices?.[0]?.deviceId)
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
                      Unassign
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkVehicleDialog;
