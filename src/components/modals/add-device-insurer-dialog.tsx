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
import Delink from '../../assets/icons/Delink.png';
import Link from '../../assets/icons/Linkb.png';
import { addDevice, delinkDevice, linkDevice, getShippingProviders } from '../../services/insurer/IdevicesService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector } from 'react-redux';
import ReactSelect from 'react-select';
import dayjs from 'dayjs';

const schema = yup.object().shape({
  imei: yup.string().required('IMEI Number is required').max(15, 'IMEI Number must be at most 15 characters.'),
  deviceProvider: yup.string().nullable(),
  insuredId: yup.string().when('$insurerId', {
    is: (insurerId: string) => insurerId !== 'INS9999',
    then: (schema) => schema,
    otherwise: (schema) => schema.nullable(),
  }),
  name: yup.string(),
  lonestarId: yup.string(),
  shippingProviderName: yup.string().nullable(),
  trackingNumber: yup
    .string()
    .nullable()
    .max(25, 'Tracking Number must be at most 25 characters.')
    .matches(/^[a-zA-Z0-9]*$/, 'Tracking Number cannot contain special characters.'),
  shipmentDate: yup.date().nullable(),
});

interface AddDeviceDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
  mode: any;
  fetchData: any;
  fetchUnassignedDevices: any;
  lonestarId: string;
  linkDeviceData?: any;
  fleetOptions: any;
  insuredOptions: any;
  setCurrentPage: any;
}

const AddVehicleDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  handleClose,
  isMobile,
  mode,
  fetchData,
  linkDeviceData,
  fetchUnassignedDevices,
  fleetOptions,
  insuredOptions,
  setCurrentPage,
}) => {
  const insurerId: any = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const [isAddDeviceLoading, setIsAddDeviceLoading] = useState<boolean>(false);
  const [shippingProviders, setShippingProviders] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<any>({
    resolver: yupResolver(schema),
    context: { insurerId },
    defaultValues: {
      imei: '',
      partnerName: '',
      insuredId: '',
      name: '',
      lonestarId: '',
      shippingProviderName: '',
      trackingNumber: '',
      shipmentDate: null,
    },
  });

  const selectedInsuredId = watch('insuredId');
  const selectedFleetName = watch('name');

  const resetForm = useCallback(() => {
    reset({
      imei: '',
      partnerName: 'DronaAIm',
      insuredId: '',
      name: '',
      lonestarId: '',
      shippingProviderName: '',
      trackingNumber: '',
      shipmentDate: null,
    });
  }, [reset]);

  const selectedImei = useWatch({
    control,
    name: 'imei',
  });

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if (mode === 'link' && linkDeviceData) {
      reset({
        imei: linkDeviceData?.imei || '',
        partnerName: linkDeviceData?.partnerName || '',
        insuredId: linkDeviceData?.insuredId || '',
        name:
          linkDeviceData?.name ||
          (Array.isArray(linkDeviceData?.lookup_fleetcompanies) && linkDeviceData.lookup_fleetcompanies[0]?.name) ||
          '',
        lonestarId: linkDeviceData?.lonestarId || '',
      });
    } else {
      reset({
        imei: '',
        partnerName: 'DronaAIm',
        insuredId: '',
        name: '',
        lonestarId: '',
        shippingProviderName: '',
        trackingNumber: '',
        shipmentDate: null,
      });
    }
  }, [mode, open, linkDeviceData, reset, resetForm]);

  useEffect(() => {
    if (selectedInsuredId) {
      const matchedFleet = fleetOptions.find((fleet: any) => fleet.insuredId === selectedInsuredId);
      if (matchedFleet) {
        setValue('name', matchedFleet.name);
        setValue('lonestarId', matchedFleet.lonestarId || '');
        setValue('insuredId', selectedInsuredId);
      }
    }
  }, [selectedInsuredId, setValue, fleetOptions]);

  useEffect(() => {
    if (selectedFleetName) {
      const matchedInsured = fleetOptions.find((fleet: any) => fleet.name === selectedFleetName);
      if (matchedInsured) {
        setValue('insuredId', matchedInsured.insuredId, { shouldValidate: true });
        setValue('lonestarId', matchedInsured.lonestarId || '', { shouldValidate: true });
      }
    }
  }, [selectedFleetName, setValue, fleetOptions]);

  useEffect(() => {
    if (selectedImei) {
      setValue('deviceProvider', 'DronaAIm');
    } else {
      setValue('deviceProvider', '');
    }
  }, [selectedImei, setValue]);

  const onSubmit = async (data: any) => {
    if (isAddDeviceLoading) return;
    setIsAddDeviceLoading(true);
    const formattedShipmentDate = data.shipmentDate ? dayjs(data.shipmentDate).format('MM/DD/YYYY') : '';

    const shippingProviderNameToUse =
      data.shippingProviderName === 'Other' ? data.otherProvider : data.shippingProviderName;

    const formattedData = {
      imei: data.imei,
      partnerName: data.partnerName,
      insuredId: data.insuredId,
      name: data.name,
      lonestarId: data.lonestarId,
      shippingProviderName: shippingProviderNameToUse,
      trackingNumber: data.trackingNumber,
      shipmentDate: formattedShipmentDate,
      insurerId,
    };

    try {
      if (mode === 'add') {
        const { status, data: apiResponseData } = await addDevice(
          currentUserId,
          formattedData.imei,
          formattedData.partnerName,
          formattedData.lonestarId,
          formattedData.name,
          formattedData.insuredId,
          formattedData.shippingProviderName,
          formattedData.trackingNumber,
          formattedData.shipmentDate,
          insurerId
        );
        if (status === 200) {
          toast.success(apiResponseData?.message);
          resetForm();
          handleClose();
          fetchData(1);
          setCurrentPage(1);
          fetchUnassignedDevices();
        } else {
          toast.error(apiResponseData?.details);
        }
      }

      if (mode === 'link') {
        const { status, data: apiResponseData } = await linkDevice(
          linkDeviceData?.lonestarId || formattedData?.lonestarId,
          linkDeviceData?.deviceId,
          currentUserId,
          insurerId
        );
        if (status === 200) {
          toast.success(apiResponseData?.message);
          resetForm();
          handleClose();
          fetchData(1);
          setCurrentPage(1);
          fetchUnassignedDevices();
        } else {
          toast.error(apiResponseData?.details);
        }
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      if (mode === 'link') {
        toast.error(error?.response?.data?.details || 'An error occurred while processing the IMEI linking');
      } else {
        toast.error(error?.response?.data?.details || 'An error occurred while Adding device');
      }
    } finally {
      setIsAddDeviceLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (isAddDeviceLoading) return;
    setIsAddDeviceLoading(true);
    try {
      const { status, data: apiResponseData } = await delinkDevice(
        linkDeviceData?.lonestarId,
        linkDeviceData?.deviceId,
        currentUserId,
        insurerId
      );
      if (status === 200) {
        toast.success(apiResponseData?.message);
        resetForm();
        handleClose();
        fetchData(1);
        setCurrentPage(1);
        fetchUnassignedDevices();
      } else {
        toast.error(apiResponseData?.details);
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      toast.error(error?.response?.data?.details || 'An error occurred while processing the IMEI linking');
    } finally {
      setIsAddDeviceLoading(false);
    }
  };

  // Convert fleetOptions to the format expected by react-select
  const selectFleetOptions = fleetOptions.map((fleet: any) => ({
    value: fleet.name,
    label: fleet.name,
    insuredId: fleet.insuredId,
    lonestarId: fleet.lonestarId,
  }));

  // Custom styles for react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      height: '40px',
      minHeight: '40px',
      backgroundColor:
        (mode === 'link' && !!linkDeviceData?.insuredId) || !!linkDeviceData?.lonestarId ? '#D9E2EA' : 'white',
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
  useEffect(() => {
    if (insurerId === 'INS9999') {
      setValue('insuredId', '');
      clearErrors('insuredId');
    }
  }, [insurerId, setValue, clearErrors]);

  useEffect(() => {
    async function fetchShippingProviders() {
      try {
        const response = await getShippingProviders();
        if (response?.data?.deviceShippingProviders) {
          setShippingProviders(response.data.deviceShippingProviders);
        }
      } catch (error) {
        console.error('Failed to fetch shipping providers:', error);
      }
    }

    fetchShippingProviders();
  }, []);

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
            {mode === 'link' ? 'Link Device' : 'Add New Device'}
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ padding: '2px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ padding: '0px 16px', paddingLeft: '30px' }}>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#F7FAFC',
                mb: 2,
                mt: 2,
              }}
            >
              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    IMEI Number <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="imei"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyDown={(e: any) => {
                          if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 40,
                            padding: '0px 14px',
                          },
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'link' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        InputProps={{
                          readOnly: mode === 'link',
                        }}
                        disabled={mode === 'link'}
                        error={!!errors.imei}
                        helperText={errors.imei?.message}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Device Provider <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="partnerName"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        value={field.value || 'DronaAIm'}
                        disabled
                        sx={{
                          '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: '#D9E2EA',
                          },
                          '& .MuiInputBase-root': {
                            height: 40,
                          },
                        }}
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
                backgroundColor: mode === 'link' && !!linkDeviceData?.lonestarId ? '#D9E2EA' : '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
              }}
            >
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="normal">
                  Please select Insured ID / Fleet Name
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>Fleet Name</InputLabel>
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
                            clearErrors(['insuredId', 'lonestarId']);
                          }}
                          styles={customStyles}
                          placeholder=""
                          isDisabled={(mode === 'link' && !!linkDeviceData?.insuredId) || !!linkDeviceData?.lonestarId}
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
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>Insured ID</InputLabel>
                  <Controller
                    name="insuredId"
                    control={control}
                    render={({ field }: any) => (
                      <FormControl fullWidth error={!!errors.insuredId}>
                        <Select
                          {...field}
                          value={field.value || ''}
                          fullWidth
                          variant="outlined"
                          displayEmpty
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            const matchedFleet = fleetOptions.find((fleet: any) => fleet.insuredId === e.target.value);
                            setValue('name', matchedFleet ? matchedFleet.name : '');
                            setValue('lonestarId', matchedFleet ? matchedFleet.lonestarId : '');
                            clearErrors(['name', 'lonestarId']);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 40,
                              padding: '0px 14px',
                              backgroundColor:
                                (mode === 'link' && !!linkDeviceData?.insuredId) || insurerId === 'INS9999'
                                  ? '#D9E2EA'
                                  : 'transparent',
                            },
                            '& .MuiSelect-select': {
                              padding: '9px 14px',
                              backgroundColor:
                                (mode === 'link' && !!linkDeviceData?.insuredId) || insurerId === 'INS9999'
                                  ? '#D9E2EA'
                                  : 'transparent',
                            },
                          }}
                          disabled={(mode === 'link' && !!linkDeviceData?.insuredId) || insurerId === 'INS9999'}
                          error={!!errors.insuredId}
                        >
                          {insuredOptions.map((device: any) => (
                            <MenuItem
                              key={device.insuredId}
                              value={device.insuredId}
                              sx={{
                                ':hover': {
                                  backgroundColor: '#2c3e50',
                                  color: '#fff',
                                },
                              }}
                            >
                              {device.insuredId}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.insuredId && (
                          <FormHelperText>
                            {typeof errors.insuredId.message === 'string' ? errors.insuredId.message : ''}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>Fleet ID</InputLabel>
                  <Controller
                    name="lonestarId"
                    control={control}
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: mode === 'link' || mode === 'add' ? '#D9E2EA' : 'transparent',
                          },
                        }}
                        disabled={mode === 'link' || mode === 'add'}
                        error={!!errors.lonestarId}
                        helperText={errors.lonestarId ? errors.lonestarId.message : ''}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
            {mode === 'add' && (
              <>
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
                      <InputLabel sx={{ mb: '4px' }}>Shipping Provider</InputLabel>
                      <Controller
                        name="shippingProviderName"
                        control={control}
                        render={({ field }: any) => (
                          <FormControl fullWidth error={!!errors.shippingProvider}>
                            <Select
                              {...field}
                              value={field.value || ''}
                              fullWidth
                              variant="outlined"
                              displayEmpty
                              onChange={(event) => {
                                field.onChange(event);
                                setValue('otherProvider', '');
                              }}
                              sx={{
                                '& .MuiSelect-icon': {
                                  color: '#000',
                                },
                                '& .MuiOutlinedInput-root': {
                                  height: 40,
                                  padding: '0px 14px',
                                  backgroundColor: '#F7FAFC',
                                },
                                '& .MuiInputBase-root': {
                                  height: 40,
                                },
                                '& .MuiSelect-select': {
                                  padding: '9px 14px',
                                  backgroundColor: '#F7FAFC',
                                },
                              }}
                              error={!!errors.shippingProvider}
                            >
                              {shippingProviders
                                .filter((provider: any) => provider.enabled)
                                .map((provider: any) => (
                                  <MenuItem
                                    key={provider.providerName}
                                    value={provider.providerName}
                                    sx={{
                                      ':hover': {
                                        backgroundColor: '#2c3e50',
                                        color: '#fff',
                                      },
                                    }}
                                  >
                                    {provider.uiDisplayText}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Grid>

                  {watch('shippingProviderName') === 'Other' && (
                    <Grid item xs={12} md={6}>
                      <Box>
                        <InputLabel sx={{ mb: '4px' }}>Provider Name</InputLabel>
                        <Controller
                          name="otherProvider"
                          control={control}
                          render={({ field }: any) => (
                            <TextField
                              {...field}
                              fullWidth
                              variant="outlined"
                              placeholder="Enter provider name"
                              error={!!errors.otherProvider}
                              helperText={errors.otherProvider?.message || ''}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  height: 40,
                                  padding: '0px 14px',
                                  backgroundColor: '#F7FAFC',
                                },
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    border: '1px solid #DFE7EE',
                    padding: '8px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#F7FAFC',
                    mb: 2,
                    mt: 2,
                  }}
                >
                  <Grid item xs={12} md={6}>
                    <Box>
                      <InputLabel sx={{ mb: '4px' }}>Tracking Number</InputLabel>
                      <Controller
                        name="trackingNumber"
                        control={control}
                        render={({ field }: any) => (
                          <TextField
                            {...field}
                            fullWidth
                            variant="outlined"
                            onChange={(e) => field.onChange(e.target.value)}
                            error={!!errors.trackingNumber}
                            helperText={errors.trackingNumber?.message || ''}
                            sx={{
                              '& .MuiInputBase-root.Mui-disabled': {
                                backgroundColor: '#D9E2EA',
                              },
                              '& .MuiInputBase-root': {
                                height: 40,
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <InputLabel sx={{ mb: '4px' }}>Date of Shipment</InputLabel>
                      <Controller
                        name="shipmentDate"
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
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
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
              disableRipple
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                background: mode === 'link' || isAddDeviceLoading || mode === 'add' ? '#2C3E50' : 'transparent',
                color: mode === 'link' || isAddDeviceLoading || mode == 'add' ? '#fff' : '#2C3E50',
                '&:hover': {
                  background: mode === 'link' || isAddDeviceLoading || mode == 'add' ? '#1F2D3D' : 'transparent',
                },
              }}
              startIcon={mode === 'link' && <img src={Link} alt="Link Icon" style={{ width: 20, height: 20 }} />}
              disabled={
                isAddDeviceLoading ||
                (mode === 'link' &&
                  ((insurerId !== 'INS9999' && linkDeviceData?.insuredId) ||
                    (insurerId === 'INS9999' && linkDeviceData?.lonestarId)))
              }
            >
              {mode === 'link' ? 'Assign' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                if (mode === 'edit') {
                  reset({});
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
              disableRipple
              sx={{
                mr: 1,
                borderRadius: 1,
                ml: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                background:
                  mode === 'link' &&
                  ((insurerId !== 'INS9999' && linkDeviceData?.insuredId) ||
                    (insurerId === 'INS9999' && linkDeviceData?.lonestarId))
                    ? '#2C3E50'
                    : 'transparent',
                color:
                  mode === 'link' &&
                  ((insurerId !== 'INS9999' && linkDeviceData?.insuredId) ||
                    (insurerId === 'INS9999' && linkDeviceData?.lonestarId))
                    ? '#fff'
                    : '#2C3E50',
                '&:hover': {
                  background:
                    mode === 'link' &&
                    ((insurerId !== 'INS9999' && linkDeviceData?.insuredId) ||
                      (insurerId === 'INS9999' && linkDeviceData?.lonestarId))
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
                      filter: mode === 'link' && linkDeviceData?.insuredId ? 'invert(1) brightness(2)' : 'none',
                    }}
                  />
                )
              }
              disabled={
                (mode === 'link' &&
                  ((insurerId !== 'INS9999' && !linkDeviceData?.insuredId) ||
                    (insurerId === 'INS9999' && !linkDeviceData?.lonestarId))) ||
                isAddDeviceLoading
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
