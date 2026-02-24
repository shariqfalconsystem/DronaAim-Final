import { useEffect, useRef, useState } from 'react';
import { Box, Button, FormControlLabel, IconButton, Slider, Typography, Checkbox } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { selectFilterCriteria } from '../../redux/insurer/fleet-list/iFleetListSlice';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';

export const FilterFleetListUninsuredDialog = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
  onApplyFilter,
  onClearFilter,
}: any) => {
  const modalRef = useRef<any>(null);
  const datePickerRef = useRef<any>(null);
  const filterCriteria = useSelector(selectFilterCriteria) || {};

  // Initialize state from existing filter criteria or defaults
  const [scoreRange, setScoreRange] = useState<number[]>(filterCriteria?.scoreRange || [0, 100]);
  const [milesRange, setMilesRange] = useState<number[]>(filterCriteria?.milesRange || [0, 100000]);

  const [effectiveFrom, setEffectiveFrom] = useState<Dayjs | null>(
    filterCriteria?.contractEffectiveDate?.from ? dayjs(filterCriteria.contractEffectiveDate.from) : null
  );
  const [effectiveTo, setEffectiveTo] = useState<Dayjs | null>(
    filterCriteria?.contractEffectiveDate?.to ? dayjs(filterCriteria.contractEffectiveDate.to) : null
  );
  const [expiryFrom, setExpiryFrom] = useState<Dayjs | null>(
    filterCriteria?.contractExpiryDate?.from ? dayjs(filterCriteria.contractExpiryDate.from) : null
  );
  const [expiryTo, setExpiryTo] = useState<Dayjs | null>(
    filterCriteria?.contractExpiryDate?.to ? dayjs(filterCriteria.contractExpiryDate.to) : null
  );

  const [contractStatus, setContractStatus] = useState<Record<string, boolean>>({
    active: filterCriteria?.contractStatus?.active || false,
    expired: filterCriteria?.contractStatus?.expired || false,
  });

  const handleApplyFilter = () => {
    const filters: any = {};

    // Only add filters that differ from defaults
    if (scoreRange[0] !== 0 || scoreRange[1] !== 100) {
      filters.scoreRange = scoreRange;
    }

    if (milesRange[0] !== 0 || milesRange[1] !== 100000) {
      filters.milesRange = milesRange;
    }

    // Add date filters if they exist
    if (effectiveFrom || effectiveTo) {
      filters.contractEffectiveDate = {
        from: effectiveFrom,
        to: effectiveTo,
      };
    }

    if (expiryFrom || expiryTo) {
      filters.contractExpiryDate = {
        from: expiryFrom,
        to: expiryTo,
      };
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
    // Reset all filter states to defaults
    setScoreRange([0, 100]);
    setMilesRange([0, 100000]);
    setEffectiveFrom(null);
    setEffectiveTo(null);
    setExpiryFrom(null);
    setExpiryTo(null);
    setContractStatus({
      active: false,
      expired: false,
    });

    onClearFilter();
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

      const isInsideModal = modalRef.current && modalRef.current.contains(target);
      const isInsideDatePickerPopper = !!document.querySelector('.MuiPickersPopper')?.contains(target);

      if (!isInsideModal && !isInsideDatePickerPopper) {
        handleFilterPopupClose();
      }
    };
  }, [filterPopupOpen, handleFilterPopupClose]);
  if (!filterPopupOpen) return null;

  if (!filterPopupOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
    >
      <Box
        ref={modalRef}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '320px',
          maxHeight: '75vh',
          position: 'absolute',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          top: filterButtonPosition ? `${Math.min(filterButtonPosition.top, window.innerHeight - 500)}px` : 'auto',
          left: filterButtonPosition
            ? `${Math.min(filterButtonPosition.left - 200, window.innerWidth - 340)}px`
            : 'auto',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            padding: '12px 16px',
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
          {/* Effective Date */}
          <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
            Contract Effective Date
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <DatePicker
              placeholder="From"
              value={effectiveFrom}
              onChange={(date) => setEffectiveFrom(date)}
              style={{ width: '100%' }}
            />
            <DatePicker
              placeholder="To"
              value={effectiveTo}
              onChange={(date) => setEffectiveTo(date)}
              style={{ width: '100%' }}
            />
          </Box>

          {/* Expiry Date */}
          <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
            Contract Expiry Date
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <DatePicker
              placeholder="From"
              value={expiryFrom}
              onChange={(date) => setExpiryFrom(date)}
              style={{ width: '100%' }}
            />
            <DatePicker
              placeholder="To"
              value={expiryTo}
              onChange={(date) => setExpiryTo(date)}
              style={{ width: '100%' }}
            />
          </Box>

          {/* Fleet Score */}
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
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{scoreRange[0]}</Typography>
              <Typography variant="caption">{scoreRange[1]}</Typography>
            </Box>
          </Box>

          {/* Miles */}
          <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
            Miles – Last 30 Days
          </Typography>
          <Box sx={{ p: 2 }}>
            <Slider
              value={milesRange}
              onChange={(e, newValue) => setMilesRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={1000}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">{milesRange[0]}</Typography>
              <Typography variant="caption">{milesRange[1]}</Typography>
            </Box>
          </Box>
          <Box mb={1}>
            {/* Contract Status */}

            <Typography fontWeight="500" mb={1} sx={{ underlinedTypographyStyle }}>
              DronaAim Contract Status
            </Typography>
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractStatus.active}
                    onChange={(e) => handleContractStatusChange('active')}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractStatus.expired}
                    onChange={(e) => handleContractStatusChange('expired')}
                    icon={<Box sx={checkboxStyles.unchecked} />}
                    checkedIcon={<Box sx={checkboxStyles.checked} />}
                  />
                }
                label="Expired"
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
