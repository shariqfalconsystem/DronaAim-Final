import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import notification from '../../../assets/icons/notification.png';
import { notifyDevice } from '../../../services/insurer/IdevicesService';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
  lonestarId: string;
  vehicleId: string;
  vin: string;
  deviceId: string;
  userId: string;
  insurerId: string;
}

const DeviceMountingNotification: React.FC<Props> = ({
  open,
  onClose,
  lonestarId,
  vehicleId,
  vin,
  deviceId,
  userId,
  insurerId,
}) => {
  const [inApp, setInApp] = useState(false);
  const [email, setEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    const notifyTypes = [];
    if (inApp) notifyTypes.push('inapp');
    if (email) notifyTypes.push('email');

    const requestBody = {
      lonestarId,
      message: vin
        ? `The device in vehicle with (${vin}, ${vehicleId}) is not correctly mounted/angled. Please adjust it to ensure proper functionality.`
        : `The device in vehicle with (NA) is not correctly mounted/angled. Please adjust it to ensure proper functionality.`,
      messageType: 'DEVICE_MOUNTING_ISSUE_DETECTED',
      notificationType: 'informative',
      metadata: {
        userId,
        vehicleId,
      },
      notify: notifyTypes,
      // notifyByEmail: email,
    };

    try {
      setLoading(true);
      const response = await notifyDevice(requestBody);
      if (response?.status === 200) {
        toast.success('Notification sent successfully');
        setInApp(false);
        setEmail(false);
        onClose();
      } else {
        toast.error(response?.data?.details || 'Failed to send notification');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error occurred while sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: '10px' } }}>
      <DialogTitle sx={{ bgcolor: (theme) => theme.palette.primary.main, mb: '25px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Device Mounting Notification
          </Typography>
          <IconButton onClick={onClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', mb: 3, p: 1 }}>
          <img src={notification} alt="Notification" style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Notify About Improper Device Mounting
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          You can send a notification to the Fleet Manager and Super FM to inform them about improper device mounting on
          the vehicle.
          <br />
          Please select how you would like to send the notification:
        </Typography>

        <Box display="flex" flexDirection="column" mb={2}>
          <FormControlLabel
            control={<Checkbox checked={inApp} onChange={(e) => setInApp(e.target.checked)} />}
            label="In-App Notification"
          />
          <FormControlLabel
            control={<Checkbox checked={email} onChange={(e) => setEmail(e.target.checked)} />}
            label="Email"
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button variant="outlined" color="primary" sx={{ mr: 1, borderRadius: 2 }} onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, background: '#2C3E50' }}
            onClick={handleSendNotification}
            disabled={loading || (!inApp && !email)}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceMountingNotification;
