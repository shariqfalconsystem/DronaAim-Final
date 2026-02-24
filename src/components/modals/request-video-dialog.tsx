import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Button } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { postVideoRequest } from '../../services/insurer/IdevicesService';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { paths } from '../../common/constants/routes';

const schema = yup.object().shape({
  startDateTime: yup.date().required('Start date and time is required'),
  endDateTime: yup
    .date()
    .required('End date and time is required')
    .min(yup.ref('startDateTime'), 'End time must be after start time')
    .test('duration-limit', 'Video duration cannot exceed 20 minutes', function (endDate, context) {
      const startDate = context.parent.startDateTime;
      if (!startDate || !endDate) return true;

      // Calculate the difference in minutes
      const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      return diffInMinutes <= 20;
    }),
});

interface FormValues {
  startDateTime: Date | null;
  endDateTime: Date | null;
}

const RequestVideoDialog: React.FC<any> = ({ open, handleClose, fleetId, deviceId, imeiNumber }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDownloadLimitModal, setShowDownloadLimitModal] = useState<boolean>(false);
  const currentUserRole = useSelector((state: any) => state.auth.currentUserRole);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      startDateTime: null,
      endDateTime: null,
    },
  });

  const resetForm = useCallback(() => {
    reset({
      startDateTime: null,
      endDateTime: null,
    });
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    if (isLoading) return;
    setIsLoading(true);

    // Format dates to proper ISO 8601 format with UTC timezone (Z)
    const startDateTime = dayjs(data.startDateTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const endDateTime = dayjs(data.endDateTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    const formattedData = {
      imei: imeiNumber,
      deviceId: deviceId,
      fleetId: fleetId,
      startTime: startDateTime,
      endTime: endDateTime,
      currentLoggedInUserRole: currentUserRole,
    };

    console.log('formatted data : ', formattedData);

    try {
      const { status, data: responseData } = await postVideoRequest(formattedData);
      if (status === 200) {
        toast.success('Video request submitted successfully');
        resetForm();
        handleClose();
      } else {
        toast.error(responseData?.details || 'Failed to submit video request');
      }
    } catch (error: any) {
      console.error('Error posting data: ', error);
      if (error?.response?.status === 400 && error?.response?.data?.details?.includes('monthly download limit')) {
        setShowDownloadLimitModal(true);
      } else {
        toast.error(error?.response?.data?.details || 'An error occurred while submitting video request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadLimitModalClose = () => {
    setShowDownloadLimitModal(false);
  };
  const handleSupportClick = () => {
    setShowDownloadLimitModal(false);
    navigate(paths.SUPPORTSCREEN);
  };

  // Watch the start and end date time values
  const startDateTime = watch('startDateTime');
  const endDateTime = watch('endDateTime');

  // Calculate duration in minutes if both dates are selected
  const durationInMinutes =
    startDateTime && endDateTime ? Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)) : 0;

  // Check if end time is less than start time
  const isEndTimeLessThanStartTime = startDateTime && endDateTime && endDateTime.getTime() <= startDateTime.getTime();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
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
              Request Video (IMEI Number: {imeiNumber})
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseCircleFill color="#fff" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: '16px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {currentUserRole === 'fleetManagerSuperUser' || currentUserRole === 'fleetManager' ? (
                <Typography variant="body2" color="error" sx={{ marginBottom: '8px' }}>
                  * Dashcam footage is retained for approximately 40 hours only. Video requests are limited 20 minutes
                  per request - for longer durations. Please submit multiple requests.
                </Typography>
              ) : (
                <Typography variant="body2" color="error" sx={{ marginBottom: '8px' }}>
                  * Dashcam footage is retained for approximately 40 hours only. Footage exceeding this period will not be available.
                </Typography>
              )}
              {currentUserRole === 'fleetManagerSuperUser' || currentUserRole === 'fleetManager' ? (
                <Typography variant="body2" color="error" sx={{ marginBottom: '16px' }}>
                  * If the monthly download limit of 60 minutes for this device is reached, please contact DronaAIm
                  Support for further assistance.
                </Typography>
              ) : (
                <Typography variant="body2" color="error" sx={{ marginBottom: '16px' }}>
                  * Video requests are limited to 20 minutes per request. For longer durations, please submit multiple
                  requests.
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Typography variant="body1">
                  From <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Controller
                  name="startDateTime"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ width: '100%' }}>
                      <DatePicker
                        showTime
                        format="MM/DD/YY hh:mm a"
                        placeholder="Start Date & Time"
                        onChange={(date) => field.onChange(date ? date.toDate() : null)}
                        value={field.value ? dayjs(field.value) : null}
                        style={{ width: '100%', height: '40px' }}
                        disabledDate={(current) => {
                          // Can't select dates in the future
                          const maxDate = dayjs();
                          return current && current > maxDate;
                        }}
                        popupStyle={{ zIndex: 1500 }}
                      />
                      {errors.startDateTime && (
                        <Typography variant="caption" color="error">
                          {errors.startDateTime.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Typography variant="body1">
                  To <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Controller
                  name="endDateTime"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ width: '100%' }}>
                      <DatePicker
                        showTime
                        format="MM/DD/YY hh:mm a"
                        placeholder="End Date & Time"
                        onChange={(date) => field.onChange(date ? date.toDate() : null)}
                        value={field.value ? dayjs(field.value) : null}
                        style={{ width: '100%', height: '40px' }}
                        disabledDate={(current) => {
                          const maxDate = dayjs();
                          return current && current > maxDate;
                        }}
                        popupStyle={{ zIndex: 1500 }}
                        disabled={!startDateTime}
                      />
                      {errors.endDateTime && (
                        <Typography variant="caption" color="error">
                          {errors.endDateTime.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Box>

              {isEndTimeLessThanStartTime && (
                <Typography variant="body2" color="error">
                  End time must be after start time
                </Typography>
              )}

              {startDateTime && endDateTime && durationInMinutes > 0 && !isEndTimeLessThanStartTime && (
                <Typography variant="body2" color={durationInMinutes <= 20 ? 'primary' : 'error'}>
                  Selected duration: {durationInMinutes} minutes
                  {durationInMinutes > 20 && ' (exceeds 20 minute limit)'}
                </Typography>
              )}
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
                disableRipple
                sx={{ borderRadius: 2, background: '#2C3E50' }}
                disabled={
                  isLoading ||
                  isEndTimeLessThanStartTime ||
                  (startDateTime && endDateTime && durationInMinutes > 20) ||
                  !startDateTime ||
                  !endDateTime
                }
              >
                Request Video
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                disableRipple
                sx={{ mr: 1, borderRadius: 2 }}
                onClick={() => {
                  resetForm();
                  handleClose();
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Download Limit Exceeded Modal */}
      <Dialog
        open={showDownloadLimitModal}
        onClose={handleDownloadLimitModalClose}
        maxWidth="xs"
        PaperProps={{
          style: {
            borderRadius: '10px',
            padding: '16px',
          },
        }}
      >
        <DialogContent sx={{ padding: '16px', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
              The monthly download limit of 60 minutes for this device has been reached.
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              Please contact DronaAim Support for further assistance
            </Typography>
            <Box sx={{ width: '100%', height: '1px', backgroundColor: '#e0e0e0', margin: '8px 0' }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: '14px', 
                color: 'primary.main', 
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={handleSupportClick}
            >
              Support
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestVideoDialog;
