import { Box, Typography, Avatar, Divider } from '@mui/material';
import InfoItem from '../vehicle-details/info-item';
import { RiDashboard2Line } from '@remixicon/react';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import { calculateAge, formatScore, getLabel } from '../../utility/utilities';
import { LICENSE_TYPES } from '../../common/constants/general';
import TotalTripsIcon from '../../assets/icons/total-trips.png';

const DriverOverview = ({ tripsData, height, userInfo, totalDriverTrips }: any) => {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        height: height ? height : 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src="/path/to/robert_larrick_image.jpg"
            alt="driver-name"
            sx={{ width: 60, height: 60, mr: 2 }}
            variant="square"
          />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
              {userInfo?.firstName ? `${userInfo?.firstName} ${userInfo?.lastName}` : 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {tripsData?.driverId || 'NA'}
            </Typography>
          </Box>
        </Box>
        <VehicleSafetyScoreBox score={formatScore(tripsData?.driverScore)} label="Driver Score" />
      </Box>
      <Divider variant="fullWidth" sx={{ borderBottomWidth: '2px' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Phone Number : {userInfo?.primaryPhone ? `${userInfo?.primaryPhoneCtryCd} ${userInfo?.primaryPhone}` : 'NA'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Age : {userInfo?.dob ? calculateAge(userInfo.dob) : 'NA'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Email ID : {userInfo?.emailId || 'NA'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            License Type : {userInfo?.licenseType ? getLabel(userInfo.licenseType, LICENSE_TYPES) : 'NA'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            License ID : {userInfo?.licenseId || 'NA'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Total Driving Time : NA
          </Typography>
        </Box>
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minWidth: '150px',
          }}
        >
          <Box>
            <InfoItem
              icon={<img src={TotalTripsIcon} />}
              value={totalDriverTrips || '0'}
              label="Total Trips"
              styles={{ marginX: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DriverOverview;
