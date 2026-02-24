import React from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import {
  EmailOutlined,
  PhoneOutlined,
  CameraAltOutlined,
  ArrowBackIos,
  ArrowForwardIos,
  Edit,
} from '@mui/icons-material';
import OrganizationCard from './organization-card';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { roleLabels } from '../../common/constants/general';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  image: string;
  orgRoleAndScoreMapping: any[];
  fullName: string;
  signedUrl?: string;
  profilePhoto?: any;
  countryCode: string;
  primaryPhone: string;
}

interface ProfileIndexPageProps {
  userDetails: UserDetails;
  isRoleActive: (orgRole: any) => boolean;
  handleRoleSelection: (orgRole: any) => void;
  handleEditClick: () => void;
  onPhotoClick: () => void;
  currentUserRole: any;
}

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      left: -50,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      bgcolor: '#C8D6E5',
      width: 32,
      height: 32,
      '&:hover': {
        bgcolor: '#B8C8D8',
      },
      '& .MuiSvgIcon-root': {
        fontSize: '16px',
        color: '#666',
      },
    }}
  >
    <ArrowBackIos />
  </IconButton>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      right: -50,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      bgcolor: '#C8D6E5',
      width: 32,
      height: 32,
      '&:hover': {
        bgcolor: '#B8C8D8',
      },
      '& .MuiSvgIcon-root': {
        fontSize: '16px',
        color: '#666',
      },
    }}
  >
    <ArrowForwardIos />
  </IconButton>
);

const ProfileIndexPage: React.FC<ProfileIndexPageProps> = ({
  userDetails,
  isRoleActive,
  handleRoleSelection,
  handleEditClick,
  onPhotoClick,
  currentUserRole,
}) => {
  const sliderSettings = {
    dots: false,
    infinite: userDetails.orgRoleAndScoreMapping.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, userDetails.orgRoleAndScoreMapping.length),
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    centerMode: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, userDetails.orgRoleAndScoreMapping.length),
          slidesToScroll: 1,
          infinite: userDetails.orgRoleAndScoreMapping.length > 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: userDetails.orgRoleAndScoreMapping.length > 1,
        },
      },
    ],
  };

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
      <Box sx={{ position: 'relative', mb: 1 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          alt={userDetails?.name}
          src={userDetails?.signedUrl}
          onClick={onPhotoClick}
        />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(50%, -50%)',
            bgcolor: 'grey.300',
            color: 'black',
            p: 0.5,
            '&:hover': { bgcolor: 'grey.400' },
          }}
          onClick={onPhotoClick}
        >
          <CameraAltOutlined fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {userDetails?.name || 'NA'}
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {roleLabels[currentUserRole] || ''}
      </Typography>

      {userDetails.orgRoleAndScoreMapping && userDetails.orgRoleAndScoreMapping.length > 0 && (
        <Box sx={{ mb: 2, position: 'relative', width: '100%', maxWidth: 800 }}>
          {userDetails.orgRoleAndScoreMapping.length > 3 ? (
            <Box
              sx={{
                '& .slick-slider': {
                  margin: '0 20px',
                },
                '& .slick-track': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .slick-slide': {
                  padding: '0 8px',
                },
                '& .slick-slide > div': {
                  height: '100%',
                },
              }}
            >
              <Slider {...sliderSettings}>
                {userDetails.orgRoleAndScoreMapping.map((orgRole, index) => (
                  <div key={index}>
                    <OrganizationCard
                      orgRole={orgRole}
                      isActive={isRoleActive(orgRole)}
                      onSelect={handleRoleSelection}
                    />
                  </div>
                ))}
              </Slider>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {userDetails.orgRoleAndScoreMapping.map((orgRole, index) => (
                <OrganizationCard
                  key={index}
                  orgRole={orgRole}
                  isActive={isRoleActive(orgRole)}
                  onSelect={handleRoleSelection}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <EmailOutlined sx={{ color: 'black', mr: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Email ID :
        </Typography>
        <Typography variant="body2">{userDetails?.email || 'NA'}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PhoneOutlined sx={{ color: 'black', mr: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Phone Number :
        </Typography>
        <Typography variant="body2">{userDetails?.phone}</Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          right: 16,
          zIndex: 1,
        }}
      >
        {/* Edit Profile Button */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            '&:hover .edit-text': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          }}
        >
          <Box
            className="edit-text"
            sx={{
              position: 'absolute',
              right: 0,
              opacity: 0,
              transform: 'translateX(20px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              color: 'white',
              fontWeight: 400,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#247FAD',
              borderRadius: '24px',
              height: 48,
              padding: '0 16px',
              minWidth: 220,
              boxShadow: 1,
            }}
          >
            Edit your Profile
          </Box>

          <IconButton
            onClick={handleEditClick}
            sx={{
              bgcolor: '#247FAD',
              color: 'black',
              width: 48,
              height: 48,
              borderRadius: '50%',
              transition: 'background-color 0.3s',
              '&:hover': {
                bgcolor: '#247FAD',
              },
            }}
          >
            <Edit />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileIndexPage;
