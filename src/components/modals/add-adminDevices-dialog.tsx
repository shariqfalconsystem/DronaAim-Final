import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Delink from '../../assets/icons/Delink.png';
import Link from '../../assets/icons/Linkb.png';
import { addDevice, delinkDevice, linkDevice } from '../../services/admin/adminDevicesServices';
import { useSelector } from 'react-redux';
import ReactSelect from 'react-select';

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
  organizationName: yup.string().required('Organization Name is required'),
  organizationType: yup.string(),
  organizationId: yup.string().required('Organization ID is required'),
});

interface AddDeviceDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
  mode: any;
  fetchData: any;
  lonestarId: string;
  linkDeviceData?: any;
  fleetOptions: any;
  insuredOptions: any;
  organizations: any;
  setCurrentPage: any;
}

const AddVehicleDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  handleClose,
  isMobile,
  mode,
  fetchData,
  linkDeviceData,
  fleetOptions,
  insuredOptions,
  organizations,
  setCurrentPage,
}) => {
  const insurerId: any = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const [isAddDeviceLoading, setIsAddDeviceLoading] = useState<boolean>(false);
  const [filteredInsuredOptions, setFilteredInsuredOptions] = useState([]);
  const [filteredFleetOptions, setFilteredFleetOptions] = useState([]);
  const hasOrgIdChangedRef = useRef(false);

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
      organizationType: '',
      organizationId: '',
      organizationName: '',
    },
  });

  const selectedInsuredId = watch('insuredId');
  const selectedFleetName = watch('name');
  const selectedOrganizationName = watch('organizationName');
  const selectedOrganizationId = watch('organizationId');

  const resetForm = useCallback(() => {
    reset({
      imei: '',
      partnerName: 'DronaAIm',
      insuredId: '',
      name: '',
      lonestarId: '',
      organizationType: 'Insurance Provider',
      organizationId: '',
      organizationName: '',
    });
    setValue('organizationId', '');
    setValue('organizationName', '');
  }, [reset, setValue]);

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if (mode === 'link' && linkDeviceData) {
      reset({
        imei: linkDeviceData?.imei || '',
        partnerName: linkDeviceData?.partnerName || '',
        insuredId: linkDeviceData?.lookup_fleetcompanies[0]?.insuredId || '',
        name: linkDeviceData?.lookup_fleetcompanies[0]
          ? `${linkDeviceData.lookup_fleetcompanies[0].insuredId}|${linkDeviceData.lookup_fleetcompanies[0].name}`
          : '',
        lonestarId: linkDeviceData?.lookup_fleetcompanies[0]?.lonestarId || '',
        organizationType: linkDeviceData?.organizationType || 'Insurance Provider',
        organizationId: linkDeviceData?.lookup_FleetInsurers?.[0]?.insurerId || '',
      });
    } else {
      reset({
        imei: '',
        partnerName: 'DronaAIm',
        insuredId: '',
        name: '',
        lonestarId: '',
        organizationType: 'Insurance Provider',
        organizationId: '',
        organizationName: '',
      });
    }
  }, [mode, open, linkDeviceData, reset, resetForm]);

  useEffect(() => {
    const selectedValue = watch('name');
    if (selectedValue && selectedOrganizationId) {
      const [insuredId, fleetName] = selectedValue.split('|');
      const matchedFleet = fleetOptions.find(
        (fleet: any) =>
          fleet.insuredId === insuredId && fleet.name === fleetName && fleet.insurerId === selectedOrganizationId
      );
      if (matchedFleet) {
        setValue('insuredId', matchedFleet.insuredId, { shouldValidate: true });
        setValue('lonestarId', matchedFleet.lonestarId || '', { shouldValidate: true });
      }
    }
  }, [watch('name'), selectedOrganizationId, fleetOptions, setValue]);

  useEffect(() => {
    if (!selectedOrganizationId || !selectedInsuredId || !fleetOptions.length) return;

    const matchedFleet = fleetOptions.find(
      (fleet: any) => fleet.insurerId === selectedOrganizationId && fleet.insuredId === selectedInsuredId
    );

    if (matchedFleet) {
      setValue('name', `${matchedFleet.insuredId}|${matchedFleet.name}`, { shouldValidate: true });
      setValue('lonestarId', matchedFleet.lonestarId || '', { shouldValidate: true });
    }
  }, [selectedInsuredId, selectedOrganizationId, fleetOptions, setValue]);

  useEffect(() => {
    if (selectedOrganizationName) {
      const matchedOrg = organizations.find((org: any) => org.name === selectedOrganizationName);
      if (matchedOrg) {
        setValue('organizationId', matchedOrg.organizationId, { shouldValidate: true });
      }
    }
  }, [selectedOrganizationName, organizations, setValue]);

  useEffect(() => {
    if (selectedOrganizationId) {
      const matchedOrg = organizations.find((org: any) => org.organizationId === selectedOrganizationId);
      if (matchedOrg) {
        setValue('organizationName', matchedOrg.name, { shouldValidate: true });
      }
    }
  }, [selectedOrganizationId, organizations, setValue]);

  useEffect(() => {
    if (!selectedOrganizationId || !fleetOptions) return;

    const filtered = fleetOptions.filter((fleet: any) => fleet.insurerId === selectedOrganizationId);
    setFilteredFleetOptions(filtered);
    if (filtered.length === 1) {
      setValue('name', `${filtered[0].insuredId}|${filtered[0].name}`, { shouldValidate: true });
      setValue('insuredId', filtered[0].insuredId, { shouldValidate: true });
      setValue('lonestarId', filtered[0].lonestarId || '', { shouldValidate: true });
    } else {
      if (hasOrgIdChangedRef.current) {
        setValue('name', '');
        setValue('insuredId', '');
        setValue('lonestarId', '');
      }
    }
  }, [selectedOrganizationId, fleetOptions, setValue]);

  useEffect(() => {
    if (!selectedOrganizationId || !insuredOptions) return;

    const filtered = insuredOptions.filter(
      (insured: any) => insured.insurerId === selectedOrganizationId && insured.insuredId
    );

    setFilteredInsuredOptions(filtered);
  }, [selectedOrganizationId, insuredOptions]);

  useEffect(() => {
    if (open) {
      hasOrgIdChangedRef.current = false;
      const subscription = watch((value, { name }) => {
        if (name === 'organizationId') {
          hasOrgIdChangedRef.current = true;
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, open]);

  useEffect(() => {
    if (hasOrgIdChangedRef.current) {
      setValue('insuredId', '');
    }
  }, [selectedOrganizationId, setValue]);

  const onSubmit = async (data: any) => {
    if (isAddDeviceLoading) return;
    setIsAddDeviceLoading(true);
    const formattedData = {
      imei: data.imei,
      partnerName: data.partnerName,
      insuredId: data.insuredId,
      name: data.name?.split('|')[1] || '',
      lonestarId: data.lonestarId,
      insurerId: data.organizationId,
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
          formattedData.insurerId
        );
        if (status === 200) {
          toast.success(apiResponseData?.message);
          resetForm();
          handleClose();
          fetchData(1);
          setCurrentPage(1);
        } else {
          toast.error(apiResponseData?.details);
        }
      }

      if (mode === 'link') {
        const { status, data: apiResponseData } = await linkDevice(
          linkDeviceData?.lonestarId || formattedData?.lonestarId,
          linkDeviceData?.deviceId,
          currentUserId,
          formattedData?.insurerId
        );
        if (status === 200) {
          toast.success(apiResponseData?.message);
          resetForm();
          handleClose();
          fetchData(1);
          setCurrentPage(1);
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
        linkDeviceData?.insurerId
      );
      if (status === 200) {
        toast.success(apiResponseData?.message);
        resetForm();
        handleClose();
        fetchData(1);
        setCurrentPage(1);
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
  const selectFleetOptions = filteredFleetOptions.map((fleet: any) => ({
    value: `${fleet.insuredId}|${fleet.name}`,
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

  const selectedOrgId = watch('organizationId');
  const selectedOrgName = watch('organizationName');
  const isOrgSelected = !!selectedOrgId || !!selectedOrgName;

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
            <Typography variant="subtitle1" fontWeight="normal" sx={{ mt: 2, ml: 1 }}>
              Associated Organization
            </Typography>

            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: mode === 'link' && !!linkDeviceData?.lonestarId ? '#D9E2EA' : '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '18px',
                mt: '9px',
              }}
            >
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="normal">
                  Please select Organization ID / Organization Name
                </Typography>
              </Grid>

              {/* Organization Type */}
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Organization Type <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="organizationType"
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
                        error={!!errors.organizationType}
                        helperText={errors.organizationType?.message || ''}
                      />
                    )}
                  />
                </Box>
              </Grid>

              {/* Organization ID */}
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Organization ID <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="organizationId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.organizationId}>
                        <Select
                          {...field}
                          value={field.value || ''}
                          fullWidth
                          variant="outlined"
                          displayEmpty
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            const selectedOrgId = e.target.value;
                            if (selectedOrgId === 'INS9999') {
                              setValue('organizationName', '');
                              clearErrors(['organizationName']);
                            } else {
                              const matchedOrg = organizations.find((org: any) => org.organizationId === selectedOrgId);
                              setValue('organizationName', matchedOrg ? matchedOrg.name : '');
                            }
                            clearErrors(['organizationId', 'organizationName']);
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
                          disabled={mode === 'link' && !!linkDeviceData?.insuredId}
                        >
                          {organizations
                            .filter((org: any) => org.organizationId !== 'INS9999')
                            .map((device: any) => (
                              <MenuItem
                                key={device.organizationId}
                                value={device.organizationId}
                                sx={{
                                  ':hover': {
                                    backgroundColor: '#2c3e50',
                                    color: '#fff',
                                  },
                                }}
                              >
                                {device.organizationId}
                              </MenuItem>
                            ))}
                        </Select>
                        {errors.organizationId && (
                          <FormHelperText>
                            {typeof errors.organizationId.message === 'string' ? errors.organizationId.message : ''}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Organization Name <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="organizationName"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.organizationName}>
                        <Select
                          {...field}
                          value={field.value || ''}
                          fullWidth
                          variant="outlined"
                          displayEmpty
                          onChange={(e) => {
                            const selectedOrgName = e.target.value;
                            field.onChange(selectedOrgName);
                            const matchedOrg = organizations.find((org: any) => org.name === selectedOrgName);
                            if (matchedOrg) {
                              setValue('organizationId', matchedOrg.organizationId);
                              clearErrors('organizationId');
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
                          disabled={(mode === 'link' && !!linkDeviceData?.insuredId) || insurerId === 'INS9999'}
                        >
                          {organizations
                            .filter((org: any) => org.name !== 'DronaAIm-Uninsured')
                            .map((org: any) => (
                              <MenuItem
                                key={org.organizationId}
                                value={org.name}
                                sx={{
                                  ':hover': {
                                    backgroundColor: '#2c3e50',
                                    color: '#fff',
                                  },
                                }}
                              >
                                {org.name}
                              </MenuItem>
                            ))}
                        </Select>
                        {errors.organizationName && (
                          <FormHelperText>
                            {typeof errors.organizationName.message === 'string' ? errors.organizationName.message : ''}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight="normal" sx={{ mt: 1, ml: 1 }}>
              Associated Fleet
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor:
                  !isOrgSelected || (mode === 'link' && !!linkDeviceData?.lonestarId) ? '#D9E2EA' : '#F7FAFC',
                padding: '8px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                mb: '28px',
                mt: '9px',
                pointerEvents: !isOrgSelected ? 'none' : 'auto',
                opacity: !isOrgSelected ? 0.6 : 1,
              }}
            >
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight="normal">
                  Please select Insured ID / Fleet Name
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <InputLabel sx={{ mb: '4px' }}>
                    Fleet Name 
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
                  <InputLabel sx={{ mb: '4px' }}>
                    Insured ID 
                  </InputLabel>
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
                            '& .MuiSelect-icon': {
                              color: '#000',
                            },
                            '& .MuiOutlinedInput-root': {
                              height: 40,
                              padding: '0px 14px',
                              backgroundColor: insurerId === 'INS9999' ? '#D9E2EA' : 'transparent',
                            },
                            '& .MuiInputBase-root': {
                              height: 40,
                            },
                            '& .MuiSelect-select': {
                              padding: '9px 14px',
                              backgroundColor: insurerId === 'INS9999' ? '#D9E2EA' : 'transparent',
                            },
                          }}
                          disabled={(mode === 'link' && !!linkDeviceData?.insuredId) || insurerId === 'INS9999'}
                          error={!!errors.insuredId}
                        >
                          {filteredInsuredOptions.map((device: any) => (
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
                  <InputLabel sx={{ mb: '4px' }}>
                    Fleet ID
                  </InputLabel>
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
                color: mode === 'link' || isAddDeviceLoading || mode === 'add' ? '#fff' : '#2C3E50',
                '&:hover': {
                  background: mode === 'link' || isAddDeviceLoading || mode === 'add' ? '#1F2D3D' : 'transparent',
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
                  reset({
                    imei: '',
                    partnerName: 'DronaAIm',
                    organizationType: 'Insurance Provider',
                    organizationId: '',
                    organizationName: '',
                    name: '',
                    insuredId: '',
                    lonestarId: '',
                  });
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
