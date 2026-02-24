import React, { useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { getDefaultDateRange } from '../../utility/utilities';

const schema = yup.object().shape({
  fromDate: yup.date().nullable(),
  toDate: yup
    .date()
    .nullable()
    .when('fromDate', {
      is: (fromDate: any) => fromDate != null,
      then: (schema) =>
        schema.required('Please select To Date').min(yup.ref('fromDate'), 'To date must be after From date'),
      otherwise: (schema) => schema,
    }),
});

interface FormValues {
  fromDate: Date | null;
  toDate: Date | null;
  statusYes?: boolean;
  statusNo?: boolean;
  statusNotReviewed?: boolean;
}

interface Props {
  filterPopupOpen: boolean;
  handleFilterPopupClose: () => void;
  filterButtonPosition?: any;
  onApplyFilter: (data: FormValues) => void;
  onClearFilter: () => void;
}

const FilterFnolDialog: React.FC<Props> = ({
  filterPopupOpen,
  handleFilterPopupClose,
  onApplyFilter,
  onClearFilter,
}) => {
  const defaultDates = getDefaultDateRange();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      fromDate: new Date(defaultDates.fromDate),
      toDate: new Date(defaultDates.toDate),
      statusYes: false,
      statusNo: false,
      statusNotReviewed: false,
    },
  });

  const resetForm = useCallback(() => {
    const defaultDates = getDefaultDateRange();
    reset({
      fromDate: new Date(defaultDates.fromDate),
      toDate: new Date(defaultDates.toDate),
      statusYes: false,
      statusNo: false,
      statusNotReviewed: false,
    });
  }, [reset]);

  const onSubmit = (data: FormValues) => {
    const payload: any = {};

    if (data.fromDate) payload.fromDate = dayjs(data.fromDate).utc().valueOf();
    if (data.toDate) payload.toDate = dayjs(data.toDate).utc().valueOf();

    const sendClaims: string[] = [];
    if (data.statusYes) sendClaims.push('YES');
    if (data.statusNo) sendClaims.push('NO');
    if (data.statusNotReviewed) sendClaims.push('PENDING');

    if (sendClaims.length > 0) {
      payload.sendClaims = sendClaims;
    }

    onApplyFilter(payload);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    resetForm();
    onClearFilter();
    handleFilterPopupClose();
  };

  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const isToDateBeforeFromDate = fromDate && toDate && toDate.getTime() <= fromDate.getTime();
  const durationInDays =
    fromDate && toDate ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isDateRangeExceeded = durationInDays > 90;

  return (
    <Dialog
      open={filterPopupOpen}
      onClose={handleFilterPopupClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ style: { borderRadius: '10px' } }}
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
            Filter by
          </Typography>
          <IconButton onClick={handleFilterPopupClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: '16px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', p: 2 }}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Date Range
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: '8px', color: '#247FAD' }}>
              * Select date range (maximum 90 days)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Typography variant="body1">From</Typography>
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <Box sx={{ width: '100%' }}>
                    <DatePicker
                      showTime
                      format="MM/DD/YYYY hh:mm a"
                      placeholder="Select From Date & Time"
                      onChange={(date) => field.onChange(date ? date.toDate() : null)}
                      value={field.value ? dayjs(field.value) : null}
                      style={{ width: '100%', height: '40px' }}
                      disabledDate={(current) => current && current > dayjs()}
                      popupStyle={{ zIndex: 1500 }}
                    />
                    {errors.fromDate && (
                      <Typography variant="caption" color="error">
                        {errors.fromDate.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Typography variant="body1">To</Typography>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <Box sx={{ width: '100%' }}>
                    <DatePicker
                      showTime
                      format="MM/DD/YYYY hh:mm a"
                      placeholder="Select To Date & Time"
                      onChange={(date) => field.onChange(date ? date.toDate() : null)}
                      value={field.value ? dayjs(field.value) : null}
                      style={{ width: '100%', height: '40px' }}
                      disabledDate={(current) => current && current > dayjs()}
                      popupStyle={{ zIndex: 1500 }}
                    />
                    {errors.toDate && (
                      <Typography variant="caption" color="error">
                        {errors.toDate.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            {fromDate && toDate && !isToDateBeforeFromDate && (
              <Typography variant="body2" color={durationInDays <= 90 ? 'primary' : 'error'}>
                {durationInDays <= 90
                  ? `Selected range: ${durationInDays} ${durationInDays === 1 ? 'day' : 'days'}`
                  : `Date Range Limit Exceeded (selected a date range of ${durationInDays} days)`}
              </Typography>
            )}

            {/* Status Type Section */}
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
                Status Type
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Controller
                  name="statusYes"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Yes" />
                  )}
                />
                <Controller
                  name="statusNo"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="No" />
                  )}
                />
                <Controller
                  name="statusNotReviewed"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Not reviewed" />
                  )}
                />
              </Box>
            </Box>
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
              disabled={!!isToDateBeforeFromDate || isDateRangeExceeded}
            >
              Search
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              disableRipple
              sx={{ mr: 1, borderRadius: 2 }}
              onClick={handleClearFilter}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FilterFnolDialog;
