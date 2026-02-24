import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Slider, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { selectFilterCriteria } from '../../redux/insurer/fleet-list/iFleetListSlice';

export const FilterFleetListDialog = ({
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
  const [milesRange, setMilesRange] = useState<number[]>(filterCriteria?.milesRange || [0, 100000]);

  const [policyStatus, setPolicyStatus] = useState<Record<string, boolean>>({
    active: filterCriteria?.policyStatus?.active || false,
  });

  const [contractStatus, setContractStatus] = useState<Record<string, boolean>>({
    active: filterCriteria?.contractStatus?.active || false,
  });

  const handleApplyFilter = () => {
    const filters: any = {};

    if (scoreRange[0] !== 0 || scoreRange[1] !== 100) {
      filters.scoreRange = scoreRange;
    }

    if (milesRange[0] !== 0 || milesRange[1] !== 100000) {
      filters.milesRange = milesRange;
    }

    const activePolicyStatuses = Object.entries(policyStatus)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => key);

    if (activePolicyStatuses.length > 0) {
      filters.policyStatus = policyStatus;
    }

    // Add contract status checkboxes if any are checked
    const activeContractStatuses = Object.entries(contractStatus)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => key);

    if (activeContractStatuses.length > 0) {
      filters.contractStatus = contractStatus;
    }

    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setScoreRange([0, 100]);
    setMilesRange([0, 100000]);
    setPolicyStatus({
      active: false,
    });
    setContractStatus({
      active: false,
    });
    onClearFilter();
  };

  // Handle checkbox changes for policy status
  const handlePolicyStatusChange = (key: string) => {
    setPolicyStatus((prev) => {
      const isCurrentlySelected = prev[key];
      return {
        active: false,
        expired: false,
        [key]: !isCurrentlySelected,
      };
    });
  };

  const handleContractStatusChange = (key: string) => {
    setContractStatus((prev) => {
      const isCurrentlySelected = prev[key];
      return {
        active: false,
        expired: false,
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
              Fleet Score
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={scoreRange}
                onChange={(e, newValue) => setScoreRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                getAriaLabel={() => 'Fleet score range'}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Miles - Last 30 Days
            </Typography>
            <Box sx={{ p: 2 }}>
              <Slider
                value={milesRange}
                onChange={(e, newValue) => setMilesRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100000}
                getAriaValueText={(value) => value.toLocaleString()}
                valueLabelFormat={(value) => (value === 100000 ? '100,000+' : value.toLocaleString())}
                getAriaLabel={() => 'Miles score range'}
              />
            </Box>

            <Box mb={2}>
              <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
                Hide "Expired" Status Fleets
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={policyStatus.active}
                    onChange={() => handlePolicyStatusChange('active')}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Policy Status Expired"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractStatus.active}
                    onChange={(e) => handleContractStatusChange('active')}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Contract Status Expired"
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
