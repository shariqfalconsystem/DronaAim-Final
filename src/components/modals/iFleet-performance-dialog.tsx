import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Slider, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../redux/insurer/dashboard/idashboardSlice';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';

export const FleetPerformanceModal = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
  onApplyFilter,
  onClearFilter,
}: any) => {
  const modalRef = useRef<any>(null);
  const filterCriteria = useSelector(selectFilterCriteria);

  const [scoreRange, setScoreRange] = useState<number[]>(filterCriteria?.scoreRange || [0, 100]);
  const [milesRange, setMilesRange] = useState<number[]>(filterCriteria?.milesRange || [0, 100000]);
  const [eventsPerMile, setEventsPerMile] = useState<number[]>(filterCriteria?.eventsPerMile || [0, 20]);

  const handleApplyFilter = () => {
    const filters: any = {};

    if (scoreRange[0] !== 0 || scoreRange[1] !== 100) {
      filters.scoreRange = scoreRange;
    }

    if (milesRange[0] !== 0 || milesRange[1] !== 100000) {
      filters.milesRange = milesRange;
    }

    if (eventsPerMile[0] !== 0 || eventsPerMile[1] !== 20) {
      filters.eventsPerMile = eventsPerMile;
    }

    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setScoreRange([0, 100]);
    setMilesRange([0, 100000]);
    setEventsPerMile([0, 20]);
    onClearFilter();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modalRef.current && !modalRef.current.contains(target)) {
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
          width: '600px',
          position: 'absolute',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          top: filterButtonPosition ? `${filterButtonPosition.top}px` : 'auto',
          left: filterButtonPosition ? `${filterButtonPosition.left - 500}px` : 'auto',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Typography>Filter By</Typography>
          <IconButton size="small" sx={{ color: 'white' }} onClick={handleFilterPopupClose}>
            <RiCloseCircleFill />
          </IconButton>
        </Box>

        <Box sx={{ padding: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
            }}
          >
            {/* Left Section: Fleet Score and Miles */}
            <Box sx={{ flex: 1 }}>
              <Box mb={3}>
                <Typography fontWeight="500" sx={{ fontSize: '0.9rem', mb: 1, ...underlinedTypographyStyle }}>
                  Fleet Score
                </Typography>
                <Slider
                  value={scoreRange}
                  onChange={(e, newValue) => setScoreRange(newValue as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  sx={{
                    '& .MuiSlider-thumb': {
                      bgcolor: '#3F5C78',
                    },
                  }}
                />
              </Box>

              <Box mb={3}>
                <Typography fontWeight="500" sx={{ fontSize: '0.9rem', mb: 1, ...underlinedTypographyStyle }}>
                  Miles (Last 30 Days)
                </Typography>
                <Slider
                  value={milesRange}
                  onChange={(e, newValue) => setMilesRange(newValue as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  getAriaValueText={(value) => value.toLocaleString()}
                  valueLabelFormat={(value) => (value === 100000 ? '100,000+' : value.toLocaleString())}
                  sx={{
                    '& .MuiSlider-thumb': {
                      bgcolor: '#3F5C78',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Divider */}
            <Box
              sx={{
                width: '3px',
                height: 'auto',
                bgcolor: '#3F5C7899',
                alignSelf: 'stretch',
              }}
            />

            {/* Right Section: Events / Mile */}
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight="500" sx={{ fontSize: '0.9rem', mb: 1, ...underlinedTypographyStyle }}>
                Events / Mile
              </Typography>
              <Slider
                value={eventsPerMile}
                onChange={(e, newValue) => setEventsPerMile(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                sx={{
                  '& .MuiSlider-thumb': {
                    bgcolor: '#3F5C78',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Button
            variant="contained"
            disableRipple
            sx={{
              textTransform: 'none',
              backgroundColor: '#003350',
              '&:hover': {
                backgroundColor: '#32475b',
              },
            }}
            onClick={handleApplyFilter}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            disableRipple
            sx={{
              textTransform: 'none',
              borderColor: '#003350',
              color: '#003350',
              '&:hover': {
                borderColor: '#3F5C78',
              },
              ml: 2,
            }}
            onClick={handleClearFilter}
          >
            Clear Filter
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
