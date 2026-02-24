import { useCallback, useState, useEffect } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { paths } from '../../common/constants/routes';
import { roleLabels } from '../../common/constants/general';
import { loginSuccess, refreshUserInfo, updateProfilePicUrl } from '../../redux/auth/authSlice';
import DriverRoleRestrictionDialog from '../../components/modals/driver-restriction-dialog';
import PolicyExpirationDialog from '../../common/components/login-restriction';
import Loader from '../../components/molecules/loader';
import {
  getUserById,
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateUserProfileDetails,
} from '../../services/fleetManager/driverServices';
import ChangePasswordForm from './change-password-form';
import ChangePasswordHeader from './chnage-password-header';
import EditProfileForm from './edit-profile-form';
import PhotoUploadPopup from './photo-upload-popup';
import Logo from '../../assets/img/logo.png';
import restrictDriverLogin from '../../assets/img/driver-restrict.png';
import ProfileSidebar from './profile-sidebar';
import ProfileIndexPage from './profile-index-page';
import SwitchRoleDialog from './switch-role-dialog';
import ProfilePhotoPopup from './profile-photo-popup';

interface OrgRoleMapping {
  role: string;
  lonestarId?: string;
  insurerId?: string;
  dronaaimId?: string;
  name?: string;
  orgName?: string;
  policyDetails?: any[];
}

interface PolicyDetail {
  isActive: boolean;
  message?: string;
  warning?: string;
}

interface PolicyDetail {
  isActive: boolean;
}

interface OrgRoleMapping {
  role: string;
  lonestarId?: string;
  insurerId?: string;
  dronaaimId?: string;
  name?: string;
  orgName?: string;
  policyDetails?: PolicyDetail[];
}

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [roleConfirmDialog, setRoleConfirmDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrgRoleMapping | null>(null);
  const [showDriverRestriction, setShowDriverRestriction] = useState(false);
  const [policyBlockerDialog, setPolicyBlockerDialog] = useState(false);
  const [blockedRole, setBlockedRole] = useState<OrgRoleMapping | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [photoPopupOpen, setPhotoPopupOpen] = useState(false);
  const [photoUploadPopupOpen, setPhotoUploadPopupOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState<boolean>(false);

  const [userDetails, setUserDetails] = useState<any>({
    name: '',
    email: '',
    phone: '',
    image: '',
    orgRoleAndScoreMapping: [],
    fullName: '',
    signedUrl: '',
    profilePhoto: {},
    countryCode: '',
    primaryPhone: '',
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
  });

  const role = useSelector((state: any) => state.auth.currentUserRole);
  const driverId = useSelector((state: any) => state.auth.currentUserId);
  const userData = useSelector((state: any) => state.auth.userData);
  const currentOrganization = useSelector((state: any) => state.auth.userData?.currentOrganization);
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const currentUserRole = useSelector((state: any) => state.auth.currentUserRole);
  const currentLonestarId = useSelector((state: any) => state.auth.userData?.currentLonestarId);
  const currentInsurerId = useSelector((state: any) => state.auth.userData?.currentInsurerId);
  const currentDronaaimId = useSelector((state: any) => state.auth.userData?.currentDronaaimId);
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  const fetchUserInfo = useCallback(async () => {
    setFetching(true);
    if (!driverId) return;
    try {
      const { data } = await getUserById(driverId);
      setUserDetails({
        name: data.firstName || data.lastName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : 'NA',
        email: data.emailId || 'NA',
        phone: data?.primaryPhone ? `(${data?.primaryPhoneCtryCd || ''}) ${data?.primaryPhone || ''}` : 'NA',
        image: data.profileImage || '',
        orgRoleAndScoreMapping: data?.orgRoleAndScoreMapping || [],
        fullName: data.fullName || 'NA',
        signedUrl: data?.signedUrl,
        profilePhoto: data?.profilePhoto || {},
        countryCode: data?.primaryPhoneCtryCd,
        primaryPhone: data?.primaryPhone,
      });
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setFetching(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (isEditing && userDetails) {
      const nameParts = userDetails.name.split(' ');

      setEditFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts?.slice(1).join(' ') || '',
        email: userDetails?.email === 'NA' ? '' : userDetails?.email,
        phone: userDetails?.primaryPhone,
        countryCode: userDetails?.countryCode,
      });
    }
  }, [isEditing, userDetails]);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async () => {
    setLoading(true);

    try {
      const profilePayload = {
        primaryPhoneCtryCd: editFormData.countryCode,
        primaryPhone: editFormData.phone,
        userId: currentUserId,
      };

      const response = await updateUserProfileDetails(currentUserId, profilePayload);

      if (response.status === 200 || response.status === 201) {
        setUserDetails((prev: any) => ({
          ...prev,
          phone: `${editFormData.countryCode} ${editFormData.phone}`,
        }));

        setIsEditing(false);
        toast.success('Contact number updated successfully!');

        await fetchUserInfo();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check if policy is active
  const checkPolicyStatus = useCallback(
    (orgRole: OrgRoleMapping): { hasInactive: boolean; inactivePolicies: PolicyDetail[] } => {
      if (!userInfo?.orgRoleAndScoreMapping?.length) return { hasInactive: false, inactivePolicies: [] };

      // Find the matching role in userInfo
      const matchingRole = userInfo.orgRoleAndScoreMapping.find(
        (role: any) =>
          role.role === orgRole.role &&
          (role.lonestarId === orgRole.lonestarId ||
            role.insurerId === orgRole.insurerId ||
            role.dronaaimId === orgRole.dronaaimId)
      );

      if (!matchingRole || !matchingRole.policyDetails?.length) return { hasInactive: false, inactivePolicies: [] };

      const inactivePolicies = matchingRole.policyDetails.filter((p: any) => !p.isActive);

      return {
        hasInactive: inactivePolicies.length > 0,
        inactivePolicies,
      };
    },
    [userInfo]
  );

  const handleRoleSelection = (orgRole: OrgRoleMapping) => {
    if (isRoleActive(orgRole)) return;

    if (orgRole.role === 'driver') {
      setShowDriverRestriction(true);
      return;
    }

    // Check policy status before allowing role switch
    const { hasInactive } = checkPolicyStatus(orgRole);

    if (hasInactive) {
      setBlockedRole(orgRole);
      setPolicyBlockerDialog(true);
      return;
    }

    setSelectedRole(orgRole);
    setRoleConfirmDialog(true);
  };

  const confirmRoleSwitch = () => {
    if (!selectedRole) return;
    const userDataWithSelectedRole = {
      ...userData,
      selectedRole: selectedRole,
      currentUserRole: selectedRole.role,
      currentOrganization:
        selectedRole.name ||
        selectedRole.orgName ||
        selectedRole.lonestarId ||
        selectedRole.insurerId ||
        selectedRole.dronaaimId,
      currentLonestarId: selectedRole.lonestarId,
      currentInsurerId: selectedRole.insurerId,
      currentDronaaimId: selectedRole.dronaaimId,
    };
    dispatch(loginSuccess(userDataWithSelectedRole));
    const { role: newRole } = selectedRole;
    if (newRole === 'fleetManager' || newRole === 'fleetManagerSuperUser') {
      navigate(paths.DASHBOARD);
    } else if (newRole === 'insurer' || newRole === 'insurerSuperUser') {
      navigate(paths.INSURERDASHBOARD);
    } else if (newRole === 'admin') {
      navigate(paths.ADMIN);
    }
    setRoleConfirmDialog(false);
    setSelectedRole(null);
    toast.success(`Successfully switched to ${roleLabels[newRole] || newRole} role`);
  };

  const cancelRoleSwitch = () => {
    setRoleConfirmDialog(false);
    setSelectedRole(null);
  };

  const handlePolicyBlockerClose = () => {
    setPolicyBlockerDialog(false);
    setBlockedRole(null);
  };

  const isRoleActive = (orgRole: OrgRoleMapping) => {
    const roleMatches = orgRole.role === currentUserRole;
    let organizationMatches = false;

    if (orgRole.role === 'admin') {
      organizationMatches = true;
    } else if (orgRole.lonestarId && currentLonestarId) {
      organizationMatches = orgRole.lonestarId === currentLonestarId;
    } else if (orgRole.insurerId && currentInsurerId) {
      organizationMatches = orgRole.insurerId === currentInsurerId;
    } else if (orgRole.dronaaimId && currentDronaaimId) {
      organizationMatches = orgRole.dronaaimId === currentDronaaimId;
    }
    return roleMatches && organizationMatches;
  };

  const handlePhotoClick = () => {
    setPhotoPopupOpen(true);
  };

  const handleClosePhotoPopup = () => {
    setPhotoPopupOpen(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!currentUserId) {
      toast.error('User ID not found');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadProfilePhoto(currentUserId, file);

      if (response.status === 202 || response.status === 200) {
        toast.success('Profile photo uploaded successfully');

        await fetchUserInfo();

        const { data: updatedUserData } = await getUserById(currentUserId);
        dispatch(updateProfilePicUrl(updatedUserData?.signedUrl || null));

        dispatch(refreshUserInfo() as any);

        setPhotoUploadPopupOpen(false);
        setPhotoPopupOpen(false);
      } else {
        toast.error('Failed to upload profile photo');
      }
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast.error(error.message || 'Failed to upload profile photo');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleEditPhoto = () => {
    setIsEditingPhoto(true);
    setPhotoPopupOpen(false);
    setPhotoUploadPopupOpen(true);
  };

  const handleAddPhoto = () => {
    setIsEditingPhoto(false);
    setPhotoPopupOpen(false);
    setPhotoUploadPopupOpen(true);
  };

  const handleDeletePhoto = async () => {
    if (!currentUserId) {
      toast.error('User ID not found');
      return;
    }
    const docRef = userDetails.profilePhoto?.docRef;

    if (!docRef) {
      toast.error('Document reference not found');
      return;
    }

    setIsDeletingPhoto(true);

    try {
      const response = await deleteProfilePhoto(currentUserId, docRef);

      if (response.status === 200 || response.status === 202) {
        setUserDetails((prev: any) => ({
          ...prev,
          image: '',
          signedUrl: '',
          profilePhoto: {},
        }));

        setPhotoPopupOpen(false);

        dispatch(updateProfilePicUrl(null));

        dispatch(refreshUserInfo() as any);

        toast.success(response.data.message);
        await fetchUserInfo();
      } else {
        toast.error('Failed to delete profile photo');
      }
    } catch (error: any) {
      console.error('Error deleting profile photo:', error);
      toast.error(error.message || 'Failed to delete profile photo');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleClosePhotoUploadPopup = () => {
    setPhotoUploadPopupOpen(false);
    setIsEditingPhoto(false);
  };

  return (
    <Box>
      <ChangePasswordHeader />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5', alignItems: 'flex-start', mt: 1 }}>
        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Paper
          sx={{
            position: 'relative',
            width: '960px',
            borderRadius: 4,
            boxShadow: 1,
            borderRight: '1px solid',
            borderColor: 'grey.200',
            height: '680px',
            ml: 4,
            mr: 2,
            mt: 4,
            mb: 4,
          }}
        >
          <Box sx={{ my: 8, ml: 8, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {activeTab === 'Profile' &&
              (!fetching ? (
                !isEditing ? (
                  <ProfileIndexPage
                    userDetails={userDetails}
                    isRoleActive={isRoleActive}
                    handleRoleSelection={handleRoleSelection}
                    handleEditClick={handleEditClick}
                    onPhotoClick={handlePhotoClick}
                    currentUserRole={currentUserRole}
                  />
                ) : (
                  <EditProfileForm
                    editFormData={editFormData}
                    userDetails={userDetails}
                    onInputChange={handleInputChange}
                    onCancel={handleCancelEdit}
                    onSave={handleSaveEdit}
                    onPhotoUpload={handlePhotoUpload}
                    isUploading={isUploading}
                    onDeletePhoto={handleDeletePhoto}
                    isSaving={loading}
                  />
                )
              ) : (
                <Loader />
              ))}
            {activeTab === 'Change password' && <ChangePasswordForm />}
          </Box>
        </Paper>
      </Box>

      <SwitchRoleDialog
        open={roleConfirmDialog}
        selectedRole={selectedRole}
        onCancel={cancelRoleSwitch}
        onConfirm={confirmRoleSwitch}
      />

      <DriverRoleRestrictionDialog
        open={showDriverRestriction}
        onClose={() => setShowDriverRestriction(false)}
        onOtherRolesClick={() => setShowDriverRestriction(false)}
        logoSrc={Logo}
        restrictionImageSrc={restrictDriverLogin}
      />

      {/* Use PolicyExpirationDialog component */}
      <PolicyExpirationDialog
        userInfo={userInfo}
        isOpen={policyBlockerDialog}
        message={blockedRole?.policyDetails?.[0]?.message}
        warning={blockedRole?.policyDetails?.[0]?.warning}
        showOtherRolesButton={true}
        onOtherRolesClick={handlePolicyBlockerClose}
      />

      <ProfilePhotoPopup
        open={photoPopupOpen}
        onClose={handleClosePhotoPopup}
        userPhoto={userDetails.signedUrl}
        userName={userDetails.name}
        onEditPhoto={handleEditPhoto}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
        isDeletingPhoto={isDeletingPhoto}
      />

      <PhotoUploadPopup
        open={photoUploadPopupOpen}
        onClose={handleClosePhotoUploadPopup}
        onPhotoUpload={handlePhotoUpload}
        isUploading={isUploading}
        userPhoto={userDetails.signedUrl}
        isEditing={isEditingPhoto}
      />
    </Box>
  );
};

export default Profile;
