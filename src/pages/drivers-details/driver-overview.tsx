import { Box, Typography, Grid } from '@mui/material';
import DriverIcon from '../../assets/img/sample-driver.png';
import { LICENSE_TYPES, US_STATES } from '../../common/constants/general';
import { calculateAge, getLabel } from '../../utility/utilities';

const DriverOverview = ({ userInfo }: any) => {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={DriverIcon} alt="Truck" style={{ width: '100px', height: '80px', marginRight: '20px' }} />

            <Box>
              <Typography variant="body2" color="text.secondary">
                Phone Number:{' '}
                {userInfo?.primaryPhone ? `${userInfo?.primaryPhoneCtryCd} ${userInfo?.primaryPhone}` : 'NA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {userInfo?.dob ? calculateAge(userInfo.dob) : 'NA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address : {userInfo?.address || 'NA'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email : {userInfo?.emailId || 'NA'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'left', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              License ID: {userInfo?.licenseId || 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              License Type : {userInfo?.licenseType ? getLabel(userInfo.licenseType, LICENSE_TYPES) : 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              License Expiry Date: {userInfo?.licenseExpDt || 'NA'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              License Issued State:{' '}
              {userInfo?.licenseIssuedState ? getLabel(userInfo.licenseIssuedState, US_STATES) : 'NA'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverOverview;
