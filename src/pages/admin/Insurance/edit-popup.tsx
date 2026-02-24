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
  MenuItem,
  Select,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { countryCodes, nameRegExp, nameTitles, phoneRegExp } from '../../../common/constants/general';
import { editInsurer } from '../../../services/admin/adminInsuranceServices';

const schema = yup.object().shape({
  name: yup.string().notRequired(),
  initials: yup.string(),
  firstName: yup
    .string()
    .matches(nameRegExp, 'First name must only contain letters')
    .required('First name is required'),
  lastName: yup.string().matches(nameRegExp, 'Last name must only contain letters').required('Last name is required'),
  phoneCtryCd: yup.string(),
  phone: yup
    .string()
    .required('Primary phone number is required')
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  emailId: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .matches(/^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain'),
  address: yup.string(),
});

interface EditInsuranceDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile?: boolean;
  fetchData?: any;
  currentUserId: string;
  mode: any;
  editInsuranceData?: any;
  setCurrentPage: any;
}

const EditInsuranceDialog: React.FC<EditInsuranceDialogProps> = ({
  open,
  handleClose,
  mode,
  fetchData,
  currentUserId,
  editInsuranceData,
}) => {
  const [isAddInsuranceLoading, setIsAddInsuranceLoading] = useState<boolean>(false);

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
      name: '',
      initials: 'Mr.',
      firstName: '',
      lastName: '',
      phoneCtryCd: '+1',
      phone: '',
      emailId: '',
      address: '',
    },
  });

  const resetForm = useCallback(() => {
    const contactList = editInsuranceData?.primaryContact;
    const primaryContact = Array.isArray(contactList) && contactList.length > 0 ? contactList[0] : undefined;

    reset({
      name: editInsuranceData?.name || '',
      initials: primaryContact?.initials || 'Mr.',
      firstName: primaryContact?.firstName || '',
      lastName: primaryContact?.lastName || '',
      phoneCtryCd: primaryContact?.phoneCtryCd || '+1',
      phone: primaryContact?.phone || '',
      emailId: primaryContact?.emailId || '',
      address: primaryContact?.address || '',
    });
  }, [editInsuranceData, reset]);

  useEffect(() => {
    if (open && mode === 'edit' && editInsuranceData) {
      resetForm();
    }
  }, [mode, open, editInsuranceData, resetForm]);

  const onSubmit = async (data: any) => {
    if (isAddInsuranceLoading) return;
    setIsAddInsuranceLoading(true);
    console.log('Form Data Submitted:', data);

    const primaryContacts = editInsuranceData?.contacts?.filter((c: any) => c.isPrimary) || [];
    const lastPrimaryContact = primaryContacts.length > 0 ? primaryContacts[primaryContacts.length - 1] : null;

    const formattedData = {
      insurerId: editInsuranceData?.insurerId,
      currentLoggedInUserId: currentUserId,
      contactUid: lastPrimaryContact?.contactUid,
      initials: data.initials,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneCtryCd: data.phoneCtryCd,
      phone: data.phone,
      emailId: data.emailId,
      address: data.address,
      isPrimary: true,
    };

    try {
      const { status, data: response } = await editInsurer(formattedData);
      if (status === 200) {
        toast.success(response?.message || 'Insurer updated successfully');
        resetForm();
        handleClose();
        fetchData(1);
      } else {
        toast.error(response?.details || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      toast.error(error?.response?.data?.details || 'An error occurred');
    } finally {
      setIsAddInsuranceLoading(false);
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
            {mode === 'edit' ? `Edit Organization: ${editInsuranceData?.insurerId}` : 'Add New Organization'}
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
                <InputLabel sx={{ mb: '4px' }}>Organization Name</InputLabel>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  render={({ field }: any) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      id="name"
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
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ mb: '4px' }}>Primary Contact</InputLabel>
                <Box display="flex">
                  <Controller
                    name="initials"
                    control={control}
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
              <Grid item xs={12} md={4}>
                <InputLabel sx={{ mb: '4px' }}>Phone</InputLabel>
                <Box display="flex">
                  <Controller
                    name="phoneCtryCd"
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
                    name="phone"
                    control={control}
                    defaultValue=""
                    render={({ field }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
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
              <Grid item xs={12} md={4}>
                <InputLabel htmlFor="emailId" sx={{ mb: '4px' }}>
                  Email
                </InputLabel>
                <Controller
                  name="emailId"
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
                      error={!!errors.emailId}
                      helperText={errors.emailId ? errors.emailId.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <InputLabel htmlFor="address" sx={{ mb: '4px' }}>
                  Address
                </InputLabel>
                <Controller
                  name="address"
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
                      error={!!errors.address}
                      helperText={errors.address ? errors.address.message : ''}
                    />
                  )}
                />
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
              sx={{ borderRadius: 2, background: '#2C3E50' }}
              disabled={isAddInsuranceLoading}
            >
              {mode === 'edit' ? 'Update' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              sx={{ mr: 1, borderRadius: 2 }}
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

export default EditInsuranceDialog;
