import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterCriteria, setFilterCriteria, clearFilterCriteria } from '../../redux/events/eventsSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { PiCalendarDotsDuotone } from 'react-icons/pi';
import { SouthEastSharp } from '@mui/icons-material';

export const FilterEventsDialog = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
  onApplyFilter,
  onClearFilter,
}: any) => {
  const dispatch = useDispatch();
  const modalRef = useRef<any>(null);
  const datePickerRef = useRef<any>(null);
  const filterCriteria = useSelector(selectFilterCriteria);

  const [fromDate, setFromDate] = useState<any>(filterCriteria.fromDate ? dayjs(filterCriteria.fromDate) : null);
  const [toDate, setToDate] = useState<any>(filterCriteria.toDate ? dayjs(filterCriteria.toDate) : null);
  const [harshBraking, setHarshBraking] = useState(filterCriteria.harshBraking);
  const [speeding, setSpeeding] = useState(filterCriteria.speeding);
  const [harshCornering, setHarshCornering] = useState(filterCriteria.harshCornering);
  const [harshAcceleration, setHarshAcceleration] = useState(filterCriteria.harshAcceleration);
  const [shock, setShock] = useState(filterCriteria.shock);
  const [severeShock, setSevereShock] = useState(filterCriteria.severeShock);
  const [sos, setSos] = useState(filterCriteria.SOS);
  const onChangeFrom: any = (date: any) => {
    setFromDate(date);
  };

  const onChangeTo: any = (date: any) => {
    setToDate(date);
  };

  const handleApplyFilter = () => {
    const filters = {
      fromDate: fromDate ? fromDate.startOf('day').valueOf() : null,
      toDate: toDate ? toDate.endOf('day').valueOf() : null,
      harshBraking,
      speeding,
      harshCornering,
      harshAcceleration,
      shock,
      severeShock,
      sos,
    };
    dispatch(setFilterCriteria(filters));
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setHarshBraking(false);
    setSpeeding(false);
    setHarshCornering(false);
    setHarshAcceleration(false);
    setShock(false);
    setSevereShock(false);
    setSos(false);
    dispatch(clearFilterCriteria());
    onClearFilter();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modalRef.current && !modalRef.current.contains(target) && !datePickerRef.current?.contains(target)) {
        handleFilterPopupClose();
      }
    };

    if (filterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterPopupOpen, handleFilterPopupClose]);

  if (!filterPopupOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        ref={modalRef}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '300px',
          position: 'absolute',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          top: filterButtonPosition ? `${filterButtonPosition.top}px` : 'auto',
          left: filterButtonPosition ? `${filterButtonPosition.left - 200}px` : 'auto',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: 'normal',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <Typography>Filter By</Typography>
          <IconButton size="small" sx={{ color: 'white', padding: 0 }} onClick={handleFilterPopupClose}>
            <RiCloseCircleFill />
          </IconButton>
        </Box>
        <Box sx={{ padding: '16px' }}>
          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Date
            </Typography>
            <Box sx={{ width: '100%' }}>
              <DatePicker
                ref={datePickerRef}
                onChange={onChangeFrom}
                value={fromDate}
                size="middle"
                placeholder="From"
                style={{ width: '100%' }}
                suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
              />
            </Box>
            <Box sx={{ width: '100%', mt: 2 }}>
              <DatePicker
                ref={datePickerRef}
                onChange={onChangeTo}
                value={toDate}
                size="middle"
                placeholder="To"
                style={{ width: '100%' }}
                suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
              />
            </Box>
          </Box>
          <Box sx={{ display: ' flex', flexDirection: 'column' }}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Event Type
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={harshBraking}
                  onChange={(e) => setHarshBraking(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Harsh Braking</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={speeding}
                  onChange={(e) => setSpeeding(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Speeding</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={harshCornering}
                  onChange={(e) => setHarshCornering(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Harsh Cornering</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={harshAcceleration}
                  onChange={(e) => setHarshAcceleration(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Harsh Acceleration</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shock}
                  onChange={(e) => setShock(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Impact</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={severeShock}
                  onChange={(e) => setSevereShock(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>Severe Impact</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sos}
                  onChange={(e) => setSos(e.target.checked)}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <span>SOS</span>
                </Box>
              }
            />
          </Box>
        </Box>
        <Box
          sx={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disableRipple
            sx={{ textTransform: 'none', backgroundColor: '#003350' }}
            onClick={handleApplyFilter}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            disableRipple
            sx={{ textTransform: 'none', color: '#003350', borderColor: '#003350' }}
            onClick={handleClearFilter}
          >
            Clear Filter
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const checkboxStyles = {
  unchecked: {
    border: '2px solid #757575',
    width: '18px',
    height: '18px',
    display: 'inline-block',
    borderRadius: '2px',
  },
  checked: {
    backgroundColor: '#1976d2',
    width: '18px',
    height: '18px',
    display: 'inline-block',
    borderRadius: '2px',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '6px',
      top: '2px',
      width: '5px',
      height: '10px',
      border: 'solid white',
      borderWidth: '0 2px 2px 0',
      transform: 'rotate(45deg)',
    },
  },
};
