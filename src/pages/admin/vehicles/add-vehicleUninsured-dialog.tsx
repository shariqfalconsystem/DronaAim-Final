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
  name: yup.string().required('Fleet Name is required'),
  lonestarId: yup.string().required('Fleet ID is required'),
});

interface AddVehicleDialogProps {
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

const AddUninsuredVehicleDialog: React.FC<AddVehicleDialogProps> = ({
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
      name: '',
      lonestarId: '',
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
    });
  }, [reset]);

  const onSubmit = async (data: any) => {
    const lonestarId = data.lonestarId;
    const formattedData = {
      vin: data.vin,
      licensePlate: data.licensePlate,
      customVehicleId: data.customVehicleId,
      make: data.make,
      model: data.model,
      year: data.year,
      name: data.name,
      lonestarId: data.lonestarId,
    };
    try {
      if (mode === 'add') {
        const { status, data } = await addVehicleUser(lonestarId, currentUserId, formattedData);
        if (status === 200) {
          toast.success(data?.message);
          resetForm();
          handleClose();
          fetchData(currentUnassignedPage);
        } else {
          toast.error(data?.details);
        }
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      toast.error(error?.response?.data?.message || 'An error occurred while processing the IMEI linking');
    }
  };

  useEffect(() => {
    if (open === false) {
      resetForm();
    }
  }, [open, resetForm]);

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
            Add New Vehicle
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

            <Typography variant="subtitle1" fontWeight="normal" sx={{ mt: 1, ml: 1 }}>
              Associated Fleet
            </Typography>
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
                            setValue('lonestarId', selectedOption ? selectedOption.lonestarId : '', {
                              shouldValidate: true,
                            });
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
                background: '#2C3E50',
                color: '#fff',
                '&:hover': {
                  background: '#2C3E50',
                },
              }}
            >
              Save
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
                    name: '',
                    lonestarId: '',
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
                background: 'transparent',
                color: '#2C3E50',
                '&:hover': {
                  background: 'transparent',
                },
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUninsuredVehicleDialog;
