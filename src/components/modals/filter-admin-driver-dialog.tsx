import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Slider, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../redux/admin/drivers/driverSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';

export const FilterAdminDriverDialog = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
  onApplyFilter,
  onClearFilter,
}: any) => {
  const modalRef = useRef<any>(null);
  const datePickerRef = useRef<any>(null);
  const filterCriteria = useSelector(selectFilterCriteria);

  const [scoreRange, setScoreRange] = useState<number[]>(filterCriteria?.scoreRange || [0, 100]);
  const [scoreRangeChanged, setScoreRangeChanged] = useState(!!filterCriteria?.scoreRange);
  const [eventsCountRange, setEventsCountRange] = useState<number[]>(filterCriteria?.eventsCountRange || [0, 5000]);
   const [scoreEventChanged, setEventRangeChanged] = useState(!!filterCriteria?.eventRange);
  const [assignmentStatus, setAssignmentStatus] = useState<Record<string, boolean>>({
    assigned: filterCriteria?.assignmentStatus?.assigned || false,
    unassigned: filterCriteria?.assignmentStatus?.unassigned || false,
  });

  useEffect(() => {
  setScoreRange(filterCriteria?.scoreRange || [0, 100]);
  setScoreRangeChanged(!!filterCriteria?.scoreRange);
  setEventsCountRange(filterCriteria?.eventsCountRange || [0, 5000]);
  setEventRangeChanged(!!filterCriteria?.eventsCountRange);
  setAssignmentStatus({
    assigned: filterCriteria?.assignmentStatus?.assigned || false,
    unassigned: filterCriteria?.assignmentStatus?.unassigned || false,
  });
}, [filterCriteria]);

  const handleApplyFilter = () => {
  const filters: {
    scoreRange?: number[];
    eventsCountRange?: number[];
    assignmentStatus: Record<string, boolean> | null;
  } = {
    assignmentStatus: null,
  };

  const isDefaultScoreRange = scoreRange[0] === 0 && scoreRange[1] === 100;
  const isDefaultEventRange = eventsCountRange[0] === 0 && eventsCountRange[1] === 5000;

  if (scoreRangeChanged && !isDefaultScoreRange) {
    filters.scoreRange = scoreRange;
  }

  if (!isDefaultEventRange) {
    filters.eventsCountRange = eventsCountRange;
  }

  const hasAssignmentSelected = Object.values(assignmentStatus).some(Boolean);
  if (hasAssignmentSelected) {
    filters.assignmentStatus = assignmentStatus;
  }

  onApplyFilter(filters);
  handleFilterPopupClose();
};
  const handleClearFilter = () => {
    setEventsCountRange([0, 5000]);
    setScoreRange([0, 100]);
    setAssignmentStatus({ assigned: false, unassigned: false });
    setScoreRangeChanged(false);
    setEventRangeChanged(false);
    onClearFilter();
  };

  const handleScoreRangeChange = (e: any, newValue: number[] | number) => {
    setScoreRange(newValue as number[]);
    setScoreRangeChanged(true);
  };

  const handleAssignmentStatusChange = (key: string) => {
    setAssignmentStatus((prev) => {
      const isCurrentlySelected = prev[key];
      return {
        assigned: false,
        unassigned: false,
        [key]: !isCurrentlySelected,
      };
    });
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
              Driver Score
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={scoreRange}
                onChange={(e, newValue) => {
                  setScoreRange(newValue as number[]);
                  setScoreRangeChanged(true);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                getAriaLabel={() => 'Driver score range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Events Count
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={eventsCountRange}
                onChange={(e, newValue) => setEventsCountRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                getAriaLabel={() => 'Events Count range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>

          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Drivers
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignmentStatus.assigned}
                  onChange={() => handleAssignmentStatusChange('assigned')}
                />
              }
              label="Assigned Drivers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignmentStatus.unassigned}
                  onChange={() => handleAssignmentStatusChange('unassigned')}
                />
              }
              label="Unassigned Drivers"
            />
          </Box>
        </Box>
        <Box
          sx={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-around',
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
