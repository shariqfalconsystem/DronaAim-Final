import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useDispatch, useSelector } from 'react-redux';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import Online from '../../assets/icons/online.png';
import Offline from '../../assets/icons/offline.png';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../redux/admin/usermanagement/usersSlice';

export const FilterUserManagementDialog = ({
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

  const [activeChecked, setActiveChecked] = useState(filterCriteria.active);
  const [inactiveChecked, setInactiveChecked] = useState(filterCriteria.inactive);

  useEffect(() => {
    setActiveChecked(filterCriteria?.active || false);
    setInactiveChecked(filterCriteria?.inactive || false);
  }, [filterCriteria]);

  const handleApplyFilter = () => {
    const filters: any = {
      active: activeChecked,
      inactive: inactiveChecked,
    };

    dispatch(setFilterCriteria(filters));
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    // Reset to default state: only active checked
    setActiveChecked(true);
    setInactiveChecked(false);
    
    const defaultFilters = {
      active: true,
      inactive: false,
    };
    
    dispatch(setFilterCriteria(defaultFilters));
    onClearFilter(defaultFilters); // Pass the default filters to parent
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
          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Status
            </Typography>

            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeChecked}
                    onChange={(e) => {
                      if (!e.target.checked && !inactiveChecked) {
                        return; 
                      }
                      setActiveChecked(e.target.checked);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <span>Active</span>
                    <img src={Online} alt="online" width={18} height={18} style={{ marginLeft: '8px' }} />
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={inactiveChecked}
                    onChange={(e) => {
                      if (!e.target.checked && !activeChecked) {
                        return; 
                      }
                      setInactiveChecked(e.target.checked);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <span>Inactive</span>
                    <img src={Offline} alt="offline" width={18} height={18} style={{ marginLeft: '8px' }} />
                  </Box>
                }
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