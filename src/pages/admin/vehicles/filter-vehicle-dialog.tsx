import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Slider, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../../redux/admin/vehicles/vehcileSlice';
import { underlinedTypographyStyle } from '../../../components/atoms/underlined-typography';

export const FilterVehicleDialog = ({
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
  const [activeChecked, setActiveChecked] = useState(filterCriteria?.active || false);
  const [inactiveChecked, setInactiveChecked] = useState(filterCriteria?.inactive || false);
  const [assignmentStatus, setAssignmentStatus] = useState<Record<string, boolean>>({
    assigned: filterCriteria?.assignmentStatus?.assigned || false,
    unassigned: filterCriteria?.assignmentStatus?.unassigned || false,
  });

  useEffect(() => {
  setScoreRange(filterCriteria?.scoreRange || [0, 100]);
  setScoreRangeChanged(!!filterCriteria?.scoreRange);
  setActiveChecked(filterCriteria?.active || false);
  setInactiveChecked(filterCriteria?.inactive || false);
  setAssignmentStatus({
    assigned: filterCriteria?.assignmentStatus?.assigned || false,
    unassigned: filterCriteria?.assignmentStatus?.unassigned || false,
  });
}, [filterCriteria]);

  const handleApplyFilter = () => {
    const filters = {
      active: activeChecked,
      inactive: inactiveChecked,
    } as {
      scoreRange?: number[];
      active: boolean;
      inactive: boolean;
      assignmentStatus: Record<string, boolean> | null;
    };

    const isDefaultScoreRange = scoreRange[0] === 0 && scoreRange[1] === 100;
    if (scoreRangeChanged && !isDefaultScoreRange) {
      filters.scoreRange = scoreRange;
    }

    const hasAssignmentSelected = Object.values(assignmentStatus).some((val) => val);
    if (hasAssignmentSelected) {
      filters.assignmentStatus = assignmentStatus;
    } else {
      filters.assignmentStatus = null;
    }
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setScoreRange([0, 100]);
    setScoreRangeChanged(false);
    setActiveChecked(false);
    setInactiveChecked(false);
    setAssignmentStatus({ assigned: false, unassigned: false });
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
              Vehicle Score
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={scoreRange}
                onChange={handleScoreRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                getAriaLabel={() => 'Vehicle score range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>

          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Vehicle Status
            </Typography>
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeChecked}
                    onChange={(e) => {
                      setActiveChecked(e.target.checked);
                      if (e.target.checked) setInactiveChecked(false);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inactiveChecked}
                    onChange={(e) => {
                      setInactiveChecked(e.target.checked);
                      if (e.target.checked) setActiveChecked(false);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Inactive"
              />
            </Box>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Vehicles
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignmentStatus.assigned}
                  onChange={() => handleAssignmentStatusChange('assigned')}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label="Assigned Vehicles"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignmentStatus.unassigned}
                  onChange={() => handleAssignmentStatusChange('unassigned')}
                  icon={<Box sx={checkboxStyles.unchecked} />}
                  checkedIcon={<Box sx={checkboxStyles.checked} />}
                />
              }
              label="Unassigned Vehicles"
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
            sx={{ textTransform: 'none', backgroundColor: '#003350' }}
            onClick={handleApplyFilter}
          >
            Search
          </Button>
          <Button
            variant="outlined"
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
