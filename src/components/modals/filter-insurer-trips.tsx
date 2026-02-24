import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Slider, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterCriteria, setFilterCriteria, clearFilterCriteria } from '../../redux/trips/tripsSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { PiCalendarDotsDuotone } from 'react-icons/pi';
import ActiveNavigation from '../../assets/icons/active-navigation.png';
import CompletedNavigation from '../../assets/icons/completed-box.png';

export const FilterListDialog = ({
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
  const [completedChecked, setCompletedChecked] = useState(filterCriteria.completed);
  const [inProgressChecked, setInProgressChecked] = useState(filterCriteria.inProgress);
  const [scoreRange, setScoreRange] = useState<number[]>(filterCriteria?.scoreRange || [0, 100]);

  const onChangeFrom: any = (date: any) => {
    setFromDate(date);
  };

  const onChangeTo: any = (date: any) => {
    setToDate(date);
  };

  const handleApplyFilter = () => {
    const filters = {
      scoreRange,
      fromDate: fromDate ? fromDate.startOf('day').valueOf() : null,
      toDate: toDate ? toDate.endOf('day').valueOf() : null,
      completed: completedChecked,
      inProgress: inProgressChecked,
    };
    dispatch(setFilterCriteria(filters));
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setScoreRange([0, 100]);
    setFromDate(null);
    setToDate(null);
    setCompletedChecked(false);
    setInProgressChecked(false);
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
          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Trip Score
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={scoreRange}
                onChange={(e, newValue) => setScoreRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                getAriaLabel={() => 'Trip score range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="contained" color="primary" disableRipple sx={{ textTransform: 'none',backgroundColor:'#003350' }} onClick={handleApplyFilter}>
            Search
          </Button>
          <Button variant="outlined" disableRipple sx={{ textTransform: 'none',color:'#003350',borderColor: '#003350' }} onClick={handleClearFilter}>
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
