import React, { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { countryCodes, LICENSE_TYPES, nameTitles, US_STATES } from '../../../common/constants/general';
import dayjs from 'dayjs';
import ReactSelect from 'react-select';
import { AddEditDriverModalProps, customStyles, schema } from './static-data';

const AddEditDriverModal: React.FC<AddEditDriverModalProps> = ({
  open,
  handleClose,
  isMobile,
  onSubmit,
  mode,
  editDriverData,
  fleetOptions,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
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
      lonestarId: null,
      name: '',
    },
  });

  const selectFleetOptions = fleetOptions.map((fleet: any) => ({
    value: fleet.name,
    label: fleet.name,
    insuredId: fleet.insuredId,
    lonestarId: fleet.lonestarId,
  }));

  const resetForm = useCallback(() => {
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
    });
  }, [reset]);

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
    } else if (mode === 'add') {
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
        lonestarId: null,
        name: '',
      });
    }
  }, [mode, editDriverData, reset]);

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
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          mb: '10px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            {mode === 'edit' ? 'Edit Driver' : 'Add New Driver'}
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ padding: '0px 16px', paddingLeft: '30px' }}>
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
                      <Select {...field} variant="outlined" sx={{ width: '90px', mr: 1, height: '40px' }} size="small">
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
                )}
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
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="licenseIssuedState">License Issued State</InputLabel>
                <Controller
                  name="licenseIssuedState"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} fullWidth variant="outlined" size="small" error={!!errors.licenseIssuedState}>
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
                    {typeof errors.licenseIssuedState.message === 'string' ? errors.licenseIssuedState.message : ''}
                  </FormHelperText>
                )}
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
                      <Select {...field} variant="outlined" size="small" sx={{ width: '100px', mr: 1, height: '40px' }}>
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
                      <Select {...field} variant="outlined" size="small" sx={{ width: '100px', mr: 1, height: '40px' }}>
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
                    {typeof errors.employmentStartDate.message === 'string' ? errors.employmentStartDate.message : ''}
                  </FormHelperText>
                )}
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
                )}
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
                backgroundColor: '#F7FAFC',
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
                background: '#2C3E50',
                color: '#fff',
                '&:hover': {
                  background: '#1F2D3D',
                },
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose}
              color="primary"
              disableRipple
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
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditDriverModal;
