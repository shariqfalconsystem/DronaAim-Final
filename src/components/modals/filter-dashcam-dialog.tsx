import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterCriteria, setFilterCriteria, clearFilterCriteria } from '../../redux/insurer/dashcam/dashcamSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';

export const FilterDashcamDialog = ({
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

  const [completedChecked, setCompletedChecked] = useState(filterCriteria.completed);
  const [inProgressChecked, setInProgressChecked] = useState(filterCriteria.inProgress);
  const [notFoundChecked, setNotFoundChecked] = useState(filterCriteria.isNotFound);

  const handleApplyFilter = () => {
    const filters = {
      completed: completedChecked,
      inProgress: inProgressChecked,
      isNotFound: notFoundChecked,
    };
    dispatch(setFilterCriteria(filters));
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setCompletedChecked(false);
    setInProgressChecked(false);
    setNotFoundChecked(false);
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
          <Box>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Report Type
            </Typography>
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={completedChecked}
                    onChange={(e) => {
                      setCompletedChecked(e.target.checked);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <span>Completed</span>
                    <span
                      style={{
                        marginLeft: '8px',
                        color: '#4CAF50',
                        fontSize: '18px',
                      }}
                    ></span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inProgressChecked}
                    onChange={(e) => {
                      setInProgressChecked(e.target.checked);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <span>In Progress</span>
                    <span
                      style={{
                        marginLeft: '8px',
                        color: 'red',
                        fontSize: '10px',
                      }}
                    ></span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notFoundChecked}
                    onChange={(e) => {
                      setNotFoundChecked(e.target.checked);
                    }}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <span>Not Found</span>
                    <span
                      style={{
                        marginLeft: '8px',
                        color: '#4CAF50',
                        fontSize: '18px',
                      }}
                    ></span>
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
