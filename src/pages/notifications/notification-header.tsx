import { Grid, Typography, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { LuRefreshCcw } from 'react-icons/lu';

const NotificationsHeader: any = ({}) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-between">
      <Grid item display="flex" alignItems="center">
        <Box ml={4} flexDirection="row" display="flex" alignItems="center">
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontSize: '1.4rem',
              fontWeight: 600,
              lineHeight: '32px',
              textAlign: 'left',
            }}
          >
            Notifications
          </Typography>
        </Box>
        <Box sx={{ alignItems: 'center', ml: 1 }}>
          <IconButton onClick={() => window.location.reload()}>
            <LuRefreshCcw color="#247FAD" size={20} />
          </IconButton>{' '}
        </Box>
      </Grid>
      <Grid item display="flex" alignItems="center"></Grid>
    </Grid>
  );
};

export default NotificationsHeader;
