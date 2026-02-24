import React, { useCallback, useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
} from '@mui/material';
import { RiAddLine, RiCloseCircleFill, RiSubtractLine } from '@remixicon/react';
import { countryCodes, nameTitles } from '../../../common/constants/general';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import ValidationErrorModal from '../../../components/modals/driver-validation-erros';
import { addInsurerUser, editInsurerUser } from '../../../services/insurer/IUserMangtService';
import { DeleteConfirmationDialog } from '../../../components/modals/user-delete-role-dialog';
import { ErrorConfirmationDialog } from '../../../components/modals/only-superuser-delete-dialog';

const phoneRegExp = /^[0-9]{10}$/;
const nameRegExp = /^[a-zA-Z]+$/;

const schema: any = yup.object().shape({
  title: yup.string(),
  firstName: yup
    .string()
    .matches(nameRegExp, 'First name must only contain letters')
    .required('First name is required'),
  lastName: yup.string().matches(nameRegExp, 'Last name must only contain letters').required('Last name is required'),
  primaryPhoneCountryCode: yup.string(),
  primaryPhoneNumber: yup
    .string()
    .required('Primary phone number is required')
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .matches(/^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain'),
  orgRoleMappings: yup
    .array()
    .of(
      yup.object().shape({
        organizationType: yup.string().required('Organization Type is required'),
        organization: yup.string().required('Organization is required'),
        userRole: yup.string().required('User Role is required'),
      })
    )
    .min(1, 'At least one organization mapping is required')
    .test('unique-mappings', 'Duplicate organization and role combination found', function (value) {
      if (!value) return true;

      const seen = new Set();
      for (const mapping of value) {
        if (!mapping.organization || !mapping.userRole) continue;

        const key = `${mapping.organization}-${mapping.userRole}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
      }
      return true;
    }),
});

interface AddUserDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile?: boolean;
  fetchData?: any;
  currentUserId: string;
  mode: any;
  editUserData?: any;
  organizations: any;
  roles: any;
  setCurrentPage: any;
  insurerId?: any;
  organizationsTypes: any;
  currentPage: number;
}

interface OrgRoleMapping {
  organizationType: string;
  organization: string;
  userRole: string;
  roleUid?: string;
  isNew?: boolean;
  isModified?: boolean;
}

interface FormValues {
  title: string;
  firstName: string;
  lastName: string;
  primaryPhoneCountryCode: string;
  primaryPhoneNumber: string;
  email: string;
  status: string;
  orgRoleMappings: OrgRoleMapping[];
}

const organizationTypes = [{ value: 'insurerCompany', label: 'Insurer' }];

const AddEditUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  handleClose,
  isMobile,
  fetchData,
  currentUserId,
  mode,
  editUserData,
  organizations,
  roles,
  setCurrentPage,
  insurerId,
  organizationsTypes,
  currentPage,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [errorConfirmationOpen, setErrorConfirmationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [originalMappings, setOriginalMappings] = useState<OrgRoleMapping[]>([]);
  const [removedMappings, setRemovedMappings] = useState<OrgRoleMapping[]>([]);
  const isUninsured = insurerId === 'INS9999' ? true : false;

  console.log('insurer id : ', insurerId);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: 'Mr',
      firstName: '',
      lastName: '',
      primaryPhoneCountryCode: '+1',
      primaryPhoneNumber: '',
      email: '',
      status: 'active',
      orgRoleMappings: [
        {
          organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
          organization: insurerId,
          userRole: '',
          isNew: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'orgRoleMappings',
  });

  const watchedMappings = watch('orgRoleMappings');

  const getRolesByOrgType = (orgType: string) => {
    switch (orgType) {
      case 'host':
        return roles.filter((role: any) => ['admin'].includes(role.value));
      case 'fleetcompany':
        return roles.filter((role: any) => ['fleetManager', 'fleetManagerSuperUser', 'driver'].includes(role.value));
      case 'insurer':
        return roles.filter((role: any) => ['insurer', 'insurerSuperUser'].includes(role.value));
      case 'uninsuredfleetaggregator':
        return roles.filter((role: any) => ['insurer', 'insurerSuperUser'].includes(role.value));
      case 'others':
        return roles;
      default:
        return [];
    }
  };

  const getOrganizationId = (org: any) => {
    switch (org.orgType) {
      case 'fleetcompany':
        return org.lonestarId;
      case 'host':
        return org.dronaaimId;
      case 'insurer':
        return org.insurerId;
      case 'uninsuredfleetaggregator':
        return org.insurerId;
      default:
        return org.lonestarId || org.id;
    }
  };

  const getOrganizationsByType = (orgType: string) => {
    if (!organizations || !Array.isArray(organizations)) return [];

    let filteredOrgs;

    if (orgType === 'fleetcompany') {
      filteredOrgs = organizations.filter((org: any) => org.orgType === orgType && org.policyStatus === 'Active');
    } else {
      filteredOrgs = organizations.filter((org: any) => org.orgType === orgType);
    }

    return filteredOrgs.map((org: any) => ({
      id: getOrganizationId(org),
      name: org.name,
      type: org.orgType,
      orgType: org.orgType,
    }));
  };

  const resetForm = useCallback(() => {
    reset({
      title: 'Mr.',
      firstName: '',
      lastName: '',
      primaryPhoneCountryCode: '+1',
      primaryPhoneNumber: '',
      email: '',
      status: 'active',
      orgRoleMappings: [
        {
          organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
          organization: insurerId,
          userRole: '',
          isNew: true,
        },
      ],
    });
    setRemovedMappings([]);
  }, [insurerId, isUninsured, reset]);

  // Helper function to filter current organization mappings only
  const filterCurrentOrgMappings = (mappings: any[]) => {
    return mappings.filter((roleMapping: any) => {
      if (['insurer', 'insurerSuperUser'].includes(roleMapping.role)) {
        return roleMapping.insurerId === insurerId;
      }

      return false;
    });
  };

  useEffect(() => {
    const organizationType = 'insurerCompany';

    if (mode === 'edit' && editUserData) {
      if (editUserData.orgRoleAndScoreMapping && editUserData.orgRoleAndScoreMapping.length > 0) {
        const mappings = editUserData.orgRoleAndScoreMapping.map((roleMapping: any) => {
          let organizationType = '';
          let organizationValue = '';

          if (editUserData.role === 'insurer' || editUserData.role === 'insurerSuperUser') {
            organizationValue = editUserData?.insurerId;
            organizationType = 'insurer';
            if (organizationValue === 'INS9999') {
              organizationType = 'uninsuredfleetaggregator';
            }
          }
          return {
            organizationType,
            organization: organizationValue,
            userRole: roleMapping.role,
            roleUid: roleMapping.roleUid,
            isNew: false,
            isModified: false,
          };
        });

        reset({
          title: editUserData.initials || 'Mr.',
          firstName: editUserData.firstName,
          lastName: editUserData.lastName,
          primaryPhoneCountryCode: editUserData.primaryPhoneCtryCd,
          primaryPhoneNumber: editUserData.primaryPhone,
          email: editUserData.emailId,
          status: editUserData.activeStatus,
          orgRoleMappings: mappings,
        });
      } else {
        let organizationValue;
        let organizationType;
        let roleUid;

        if (editUserData.role === 'insurer' || editUserData.role === 'insurerSuperUser') {
          organizationValue = editUserData?.lookup_fleet_insurers_aslist?.[0]?.insurerId;
          organizationType = 'insurer';
          if (organizationValue === 'INS9999') {
            organizationType = 'uninsuredfleetaggregator';
          }
        }
        const initialMapping: any = {
          organizationType: organizationType,
          organization: organizationValue,
          userRole: editUserData.role,
          roleUid: roleUid,
          isNew: false,
          isModified: false,
        };

        reset({
          title: editUserData.initials || 'Mr.',
          firstName: editUserData.firstName,
          lastName: editUserData.lastName,
          primaryPhoneCountryCode: editUserData.primaryPhoneCtryCd,
          primaryPhoneNumber: editUserData.primaryPhone,
          email: editUserData.emailId,
          status: editUserData.activeStatus,
          orgRoleMappings: [initialMapping],
        });
      }
    }
    if (mode === 'add') {
      reset({
        orgRoleMappings: [
          {
            organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
            organization: insurerId,
          },
        ],
      });
    }
  }, [mode, open, editUserData, reset, isUninsured, insurerId]);

  useEffect(() => {
    if (mode === 'edit' && editUserData) {
      if (editUserData.orgRoleAndScoreMapping && editUserData.orgRoleAndScoreMapping.length > 0) {
        // Filter mappings to show only current organization mappings
        const filteredMappings = filterCurrentOrgMappings(editUserData.orgRoleAndScoreMapping);

        const mappings = filteredMappings.map((roleMapping: any) => {
          let organizationType = '';
          let organizationValue = '';

          if (['insurer', 'insurerSuperUser'].includes(roleMapping.role)) {
            organizationType = 'insurer';
            organizationValue = roleMapping.insurerId || editUserData?.lookup_fleet_insurers_aslist?.[0]?.insurerId;
            if (organizationValue === 'INS9999') {
              organizationType = 'uninsuredfleetaggregator';
            }
          }

          return {
            organizationType,
            organization: organizationValue,
            userRole: roleMapping.role,
            roleUid: roleMapping.roleUid,
            isNew: false,
            isModified: false,
          };
        });

        setOriginalMappings(mappings);

        // If no mappings for current organization, create a default one
        const finalMappings =
          mappings.length > 0
            ? mappings
            : [
                {
                  organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
                  organization: insurerId,
                  userRole: '',
                  isNew: true,
                  isModified: false,
                },
              ];

        reset({
          title: editUserData.initials || 'Mr.',
          firstName: editUserData.firstName,
          lastName: editUserData.lastName,
          primaryPhoneCountryCode: editUserData.primaryPhoneCtryCd,
          primaryPhoneNumber: editUserData.primaryPhone,
          email: editUserData.emailId,
          status: editUserData.activeStatus,
          orgRoleMappings: finalMappings,
        });
      } else {
        let organizationValue;
        let organizationType;
        let roleUid;

        // Check if the user belongs to current organization
        if (
          (editUserData.role === 'insurer' || editUserData.role === 'insurerSuperUser') &&
          editUserData.insurerId === insurerId
        ) {
          organizationValue = editUserData.insurerId;
          organizationType = 'insurer';
          if (organizationValue === 'INS9999') {
            organizationType = 'uninsuredfleetaggregator';
          }
        }

        // If user doesn't belong to current organization, create empty mapping
        const initialMapping: any = organizationValue
          ? {
              organizationType: organizationType,
              organization: organizationValue,
              userRole: editUserData.role,
              roleUid: roleUid,
              isNew: false,
              isModified: false,
            }
          : {
              organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
              organization: insurerId,
              userRole: '',
              isNew: true,
              isModified: false,
            };

        setOriginalMappings(organizationValue ? [initialMapping] : []);

        reset({
          title: editUserData.initials || 'Mr.',
          firstName: editUserData.firstName,
          lastName: editUserData.lastName,
          primaryPhoneCountryCode: editUserData.primaryPhoneCtryCd,
          primaryPhoneNumber: editUserData.primaryPhone,
          email: editUserData.emailId,
          status: editUserData.activeStatus,
          orgRoleMappings: [initialMapping],
        });
      }
    }
    if (mode === 'add') {
      reset({
        title: 'Mr.',
        firstName: '',
        lastName: '',
        primaryPhoneCountryCode: '+1',
        primaryPhoneNumber: '',
        email: '',
        status: 'active',
        orgRoleMappings: [
          {
            organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
            organization: insurerId,
            userRole: '',
            isNew: true,
          },
        ],
      });
    }
  }, [mode, open, editUserData, reset, insurerId, isUninsured]);

  const handleOrganizationTypeChange = (index: number, value: string) => {
    setValue(`orgRoleMappings.${index}.organizationType`, value);
    setValue(`orgRoleMappings.${index}.organization`, '');
    setValue(`orgRoleMappings.${index}.userRole`, '');

    const currentMapping = watchedMappings[index];
    if (!currentMapping?.isNew) {
      setValue(`orgRoleMappings.${index}.isModified`, true);
    }
  };

  const getFilteredOrganizations = (orgType: string) => {
    return getOrganizationsByType(orgType);
  };

  const getFilteredRoles = (orgType: string) => {
    return getRolesByOrgType(orgType);
  };

  const handleDeleteClick = (index: number) => {
    if (fields.length === 1) {
      // Show confirmation popup for last role
      setDeleteConfirmationOpen(true);
    } else {
      // Proceed with normal delete
      removeMapping(index);
    }
  };

  const handleErrorConfirmation = () => {
    setErrorConfirmationOpen(false);
    setErrorMessage('');
  };

  const addNewMapping = () => {
    append({
      organizationType: isUninsured ? 'uninsuredfleetaggregator' : 'insurer',
      organization: insurerId,
      userRole: '',
      isNew: true,
      isModified: false,
    });
  };

  const removeMapping = (index: number) => {
    const mappingToRemove = watchedMappings[index];
    if (mappingToRemove?.roleUid && !mappingToRemove.isNew) {
      setRemovedMappings((prev) => [...prev, mappingToRemove]);
    }

    remove(index);
  };

  const handleDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  const formatOrgRoleMappings = (mappings: any[], mode: string) => {
    const formattedMappings: any[] = [];

    // Filter mappings to include only current organization mappings
    const currentOrgMappings = mappings.filter((mapping) => {
      return mapping.organization === insurerId;
    });

    currentOrgMappings.forEach((mapping) => {
      const org = organizations?.find((o: any) => getOrganizationId(o) === mapping.organization);

      let action = 'insert';
      if (mode === 'edit') {
        if (mapping.isNew) {
          action = 'insert';
        } else if (mapping.isModified) {
          action = 'update';
        } else {
          action = 'update';
        }
      }

      const roleMapping: any = {
        role: mapping.userRole,
        action: action,
      };

      if (action === 'update' && mapping.roleUid) {
        roleMapping.roleUid = mapping.roleUid;
      }

      if (org?.orgType === 'fleetcompany') {
        roleMapping.lonestarId = mapping.organization;
      } else if (org?.orgType === 'insurer') {
        roleMapping.insurerId = mapping.organization;
      } else if (org?.orgType === 'host') {
        roleMapping.dronaaimId = mapping.organization;
      } else if (org?.orgType === 'uninsuredfleetaggregator') {
        roleMapping.insurerId = mapping.organization;
      } else {
        roleMapping.lonestarId = '';
        roleMapping.insurerId = '';
        roleMapping.dronaaimId = '';
        roleMapping.vehicleId = '';
      }

      formattedMappings.push(roleMapping);
    });

    if (mode === 'edit') {
      // Filter removed mappings to include only current organization mappings
      const currentOrgRemovedMappings = removedMappings.filter((removedMapping) => {
        return removedMapping.organization === insurerId;
      });

      currentOrgRemovedMappings.forEach((removedMapping) => {
        const org = organizations?.find((o: any) => getOrganizationId(o) === removedMapping.organization);

        const roleMapping: any = {
          role: removedMapping.userRole,
          action: 'delete',
          roleUid: removedMapping.roleUid,
        };

        if (org?.orgType === 'fleetcompany') {
          roleMapping.lonestarId = removedMapping.organization;
        } else if (org?.orgType === 'insurer') {
          roleMapping.insurerId = removedMapping.organization;
        } else if (org?.orgType === 'uninsuredfleetaggregator') {
          roleMapping.insurerId = removedMapping.organization;
        } else if (org?.orgType === 'host') {
          roleMapping.dronaaimId = removedMapping.organization;
        } else {
          roleMapping.lonestarId = '';
          roleMapping.insurerId = '';
          roleMapping.dronaaimId = '';
          roleMapping.vehicleId = '';
        }

        formattedMappings.push(roleMapping);
      });
    }

    return formattedMappings;
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    console.log('data: ', data);

    let formattedData: any = {
      initials: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      emailId: data.email,
      primaryPhoneCtryCd: data.primaryPhoneCountryCode,
      primaryPhone: data.primaryPhoneNumber,
      activeStatus: 'active',
      orgRoleMappings: formatOrgRoleMappings(data.orgRoleMappings, mode),
    };

    if (mode === 'add') {
      try {
        const { status, data: responseData } = await addInsurerUser(currentUserId, formattedData);
        console.log('status : ', status);
        console.log('data : ', responseData);
        if (status === 200) {
          toast.success(responseData?.createdUserIds[0]);
          reset();
          handleClose();
          fetchData(currentPage);
          setCurrentPage(1);
        } else {
          toast.error(responseData?.message);
        }
      } catch (error: any) {
        console.error('Error posting data: ', error);

        if (
          error?.response?.data?.userValidationErrorMap &&
          Object.keys(error?.response?.data?.userValidationErrorMap).length > 0
        ) {
          setValidationErrors(error?.response?.data?.userValidationErrorMap);
          setValidationErrorModalOpen(true);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    if (mode === 'edit') {
      formattedData = {
        ...formattedData,
        userId: editUserData?.userId,
        activeStatus: data.status.toLowerCase() === 'active' ? 'active' : 'inactive',
        uiRequest: true,
      };

      try {
        const { status, data: responseData } = await editInsurerUser(currentUserId, formattedData);

        if (status === 200) {
          toast.success(responseData?.createdUserIds[0]);
          reset();
          handleClose();
          fetchData(currentPage);
        } else {
          toast.error(responseData?.message);
        }
      } catch (error: any) {
        console.error('Error posting data: ', error);
        if (
          error?.response?.data?.userValidationErrorMap &&
          Object.keys(error?.response?.data?.userValidationErrorMap).length > 0
        ) {
          setValidationErrors(error?.response?.data?.userValidationErrorMap);
          setValidationErrorModalOpen(true);
        }

        if (error?.status == 400) {
          const errorDetails = error?.response?.data?.details;
          setErrorMessage(errorDetails);
          setErrorConfirmationOpen(true);

          if (editUserData?.orgRoleAndScoreMapping) {
            const mappings = editUserData.orgRoleAndScoreMapping.map((roleMapping: any) => {
              let organizationType = '';
              let organizationValue = '';

              if (['fleetManager', 'fleetManagerSuperUser', 'driver'].includes(roleMapping.role)) {
                organizationType = 'fleetcompany';
                organizationValue = roleMapping.lonestarId;
              } else if (roleMapping.role === 'admin') {
                organizationType = 'host';
                organizationValue =
                  roleMapping.dronaaimId || editUserData?.lookup_dronaaim_subscription_type_aslist?.[0]?.dronaaimId;
              } else if (['insurer', 'insurerSuperUser'].includes(roleMapping.role)) {
                organizationType = 'insurer';
                organizationValue = roleMapping.insurerId || editUserData?.lookup_fleet_insurers_aslist?.[0]?.insurerId;
                if (organizationValue === 'INS9999') {
                  organizationType = 'uninsuredfleetaggregator';
                }
              } else {
                organizationType = 'others';
                organizationValue = roleMapping.organizationId || editUserData.organizationId;
              }

              return {
                organizationType,
                organization: organizationValue,
                userRole: roleMapping.role,
                roleUid: roleMapping.roleUid,
                isNew: false,
                isModified: false,
              };
            });

            setOriginalMappings(mappings);
            setRemovedMappings([]);

            reset({
              title: editUserData.initials || 'Mr.',
              firstName: editUserData.firstName,
              lastName: editUserData.lastName,
              primaryPhoneCountryCode: editUserData.primaryPhoneCtryCd,
              primaryPhoneNumber: editUserData.primaryPhone,
              email: editUserData.emailId,
              status: editUserData.activeStatus,
              orgRoleMappings: mappings,
            });
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (open === false) {
      resetForm();
    }
  }, [open, resetForm]);

  const enabledOrgTypes =
    organizationsTypes?.filter(
      (type: any) => (type.enabled && type.orgType === 'insurer') || type.orgType === 'uninsuredfleetaggregator'
    ) || [];

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
            mb: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="#fff" variant="h6">
              {mode === 'edit' ? `Edit User (User ID - ${editUserData?.userId} )` : 'Add User'}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseCircleFill color="#fff" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid
              container
              spacing={1}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#F7FAFC',
                padding: 1,
                borderRadius: 1,
                boxSizing: 'border-box',
                mb: 2,
                mt: 1,
              }}
            >
              <Grid item xs={12} sm={12}>
                <InputLabel htmlFor="driverName">
                  Name <span style={{ color: 'red' }}>*</span>
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
            </Grid>

            <Grid
              container
              spacing={1}
              sx={{
                border: '1px solid #DFE7EE',
                backgroundColor: '#F7FAFC',
                padding: 1,
                borderRadius: 1,
                boxSizing: 'border-box',
                mb: 2,
                mt: 1,
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
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputLabel htmlFor="primaryPhoneNumber">
                  Phone Number <span style={{ color: 'red' }}>*</span>
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
              {mode === 'edit' && (
                <Grid item xs={12} sm={4}>
                  <InputLabel htmlFor="status">
                    User Status <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    defaultValue="active"
                    render={({ field }) => (
                      <ToggleButtonGroup
                        {...field}
                        exclusive
                        onChange={(_event, newValue) => {
                          if (newValue !== null) {
                            field.onChange(newValue);
                          }
                        }}
                        sx={{
                          backgroundColor: '#3F5C78',
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid #E2E8F0',
                          gap: '4px',
                          '& .MuiToggleButtonGroup-grouped': {
                            border: 'none',
                            '&:not(:first-of-type)': {
                              borderRadius: '4px',
                            },
                            '&:first-of-type': {
                              borderRadius: '4px',
                            },
                          },
                        }}
                      >
                        <ToggleButton
                          value="active"
                          sx={{
                            height: '32px',
                            minWidth: '80px',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#fff',
                            backgroundColor: 'transparent',
                            '&.Mui-selected': {
                              color: '#383E4B',
                              backgroundColor: '#fff',
                            },
                            '&:hover': {
                              backgroundColor: '#EDF2F7',
                              color: '#000',
                            },
                          }}
                        >
                          Active
                        </ToggleButton>
                        <ToggleButton
                          value="inactive"
                          sx={{
                            height: '32px',
                            minWidth: '80px',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#fff',
                            backgroundColor: 'transparent',
                            '&.Mui-selected': {
                              color: '#383E4B',
                              backgroundColor: '#fff',
                            },
                            '&:hover': {
                              backgroundColor: '#EDF2F7',
                              color: '#000',
                            },
                          }}
                        >
                          Inactive
                        </ToggleButton>
                      </ToggleButtonGroup>
                    )}
                  />
                  {errors.status && (
                    <FormHelperText error>
                      {typeof errors.status.message === 'string' ? errors.status.message : ''}
                    </FormHelperText>
                  )}
                </Grid>
              )}
            </Grid>

            {fields.map((field, index) => (
              <Grid
                key={field.id}
                container
                spacing={1}
                sx={{
                  border: '1px solid #DFE7EE',
                  backgroundColor: '#F7FAFC',
                  padding: 1,
                  borderRadius: 1,
                  boxSizing: 'border-box',
                  mb: 2,
                  mt: 1,
                }}
              >
                <Grid item container sm={12} sx={{ display: 'flex' }} spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <InputLabel htmlFor={`organizationType-${index}`}>
                      Organization Type <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Controller
                      name={`orgRoleMappings.${index}.organizationType`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.orgRoleMappings?.[index]?.organizationType}>
                          <Select
                            {...field}
                            size="small"
                            disabled={true}
                            sx={{
                              '& .MuiSelect-select': {
                                backgroundColor: '#D9E2EA',
                              },
                            }}
                            onChange={(e) => {
                              field.onChange(e);
                              handleOrganizationTypeChange(index, e.target.value);
                            }}
                          >
                            {enabledOrgTypes.map((type: any) => (
                              <MenuItem
                                key={type.orgType}
                                value={type.orgType}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#3F5C78',
                                    color: 'white',
                                  },
                                }}
                              >
                                {type.displayText}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.orgRoleMappings?.[index]?.organizationType && (
                            <FormHelperText>{errors?.orgRoleMappings[index]?.organizationType?.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <InputLabel htmlFor={`organization-${index}`}>
                      Organization <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Controller
                      name={`orgRoleMappings.${index}.organization`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.orgRoleMappings?.[index]?.organization}>
                          <Select
                            {...field}
                            size="small"
                            disabled={true}
                            sx={{
                              '& .MuiSelect-select': {
                                backgroundColor: '#D9E2EA',
                              },
                            }}
                          >
                            {getFilteredOrganizations(watchedMappings?.[index]?.organizationType)?.map((org: any) => (
                              <MenuItem
                                key={org.id}
                                value={org.id}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#3F5C78',
                                    color: 'white',
                                  },
                                }}
                              >
                                {org.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.orgRoleMappings?.[index]?.organization && (
                            <FormHelperText>{errors?.orgRoleMappings[index]?.organization?.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <InputLabel htmlFor={`userRole-${index}`}>
                      User Role <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Controller
                      name={`orgRoleMappings.${index}.userRole`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.orgRoleMappings?.[index]?.userRole}>
                          <Select
                            {...field}
                            size="small"
                            disabled={!watchedMappings?.[index]?.organization}
                            sx={{
                              '& .MuiSelect-select': {
                                padding: '9px 14px',
                                backgroundColor: !watchedMappings?.[index]?.organization ? '#D9E2EA' : 'transparent',
                              },
                            }}
                          >
                            {getFilteredRoles(watchedMappings?.[index]?.organizationType)?.map(
                              ({ value, label }: any) => (
                                <MenuItem
                                  key={value}
                                  value={value}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: '#3F5C78',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  {label}
                                </MenuItem>
                              )
                            )}
                          </Select>
                          {errors.orgRoleMappings?.[index]?.userRole && (
                            <FormHelperText>{errors?.orgRoleMappings[index]?.userRole?.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid item container sm={12}>
                  <Grid item sm={11}></Grid>

                  <Grid item sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {index === fields.length - 1 && (
                      <IconButton
                        onClick={addNewMapping}
                        sx={{
                          backgroundColor: '#3F5C78',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#2c3e50',
                          },
                        }}
                        size="small"
                      >
                        <RiAddLine />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDeleteClick(index)}
                      sx={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#c82333',
                        },
                      }}
                      size="small"
                    >
                      <RiSubtractLine />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            ))}

            {errors?.orgRoleMappings && typeof errors?.orgRoleMappings?.root?.message === 'string' && (
              <FormHelperText error sx={{ mb: 2 }}>
                {errors?.orgRoleMappings?.root?.message}
              </FormHelperText>
            )}

            <Box display="flex" justifyContent="flex-end" mt={5}>
              <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#3F5C78' }} disabled={isSubmitting}>
                Save
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteConfirmation}
      />

      <ErrorConfirmationDialog
        open={errorConfirmationOpen}
        onClose={handleErrorConfirmation}
        onConfirm={handleErrorConfirmation}
        errorMessage={errorMessage}
      />

      <ValidationErrorModal
        open={validationErrorModalOpen}
        onClose={() => setValidationErrorModalOpen(false)}
        validationErrors={validationErrors}
      />
    </>
  );
};

export default AddEditUserDialog;
