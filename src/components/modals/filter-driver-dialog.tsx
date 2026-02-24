import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Slider, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../redux/vehicles/vehicleSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';

export const FilterDriverDialog = ({
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
  const [activeChecked, setActiveChecked] = useState(filterCriteria?.active || false);
  const [inactiveChecked, setInactiveChecked] = useState(filterCriteria?.inactive || false);

  
  useEffect(() => {
    setScoreRange(filterCriteria?.scoreRange || [0, 100]);
    setActiveChecked(filterCriteria?.active || false);
    setInactiveChecked(filterCriteria?.inactive || false);
  }, [filterCriteria]);

  const handleApplyFilter = () => {
    const filters = {
      scoreRange,
      active: activeChecked,
      inactive: inactiveChecked,
    };
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setScoreRange([0, 100]);
    setActiveChecked(false);
    setInactiveChecked(false);
    onClearFilter();
    handleFilterPopupClose();
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
                onChange={(e, newValue) => setScoreRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                getAriaLabel={() => 'Driver score range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>

          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Vehicle
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={activeChecked}
                  onChange={(e) => {
                    setActiveChecked(e.target.checked);
                    if (e.target.checked) setInactiveChecked(false);
                  }}
                />
              }
              label="Assigned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={inactiveChecked}
                  onChange={(e) => {
                    setInactiveChecked(e.target.checked);
                    if (e.target.checked) setActiveChecked(false);
                  }}
                />
              }
              label="Unassigned"
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