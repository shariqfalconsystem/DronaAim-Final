import React, { useCallback, useMemo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import { RiFilter3Line, RiRefreshLine } from '@remixicon/react';
import { FiNavigation2 } from 'react-icons/fi';
import { IoMdCloseCircle } from 'react-icons/io';
import SearchInput from '../../components/atoms/search-input';
import { splitAddressInTwoLinesLiveTrack, convertSpeedToMph } from '../../utility/utilities';
import Pagination from '../../components/molecules/pagination';

interface LiveTrackingListProps {
  onVehicleSelect: (vehicle: any) => void;
  highlightedVehicle: any | null;
  liveTrackingListData: any;
  addresses: any;
  setHighlightedVehicle: any;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  searchQuery: string;
  selectedFilters: string[];
  onRefresh: () => void;
}

const MAX_VISIBLE_LENGTH = 70;

const LiveTrackingList: React.FC<LiveTrackingListProps> = ({
  onVehicleSelect,
  highlightedVehicle,
  liveTrackingListData,
  addresses,
  onRefresh,
  setHighlightedVehicle,
  currentPage,
  onPageChange,
  onSearch,
  onFilterChange,
  searchQuery,
  selectedFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleShowDetails = useCallback(
    (vehicle: any) => {
      onVehicleSelect(vehicle);
    },
    [onVehicleSelect]
  );

  const handleFilterToggle = useCallback(
    (filter: string) => {
      const newFilters = selectedFilters.includes(filter) ? [] : [filter];
      onFilterChange(newFilters);
    },
    [selectedFilters, onFilterChange]
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(event.target.value);
    },
    [onSearch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      onPageChange(page);
    },
    [onPageChange]
  );

  const FilterRow = useMemo(
    () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
        }}
      >
        {['Active', 'Inactive'].map((filter) => (
          <Chip
            key={filter}
            label={filter}
            variant={selectedFilters?.includes(filter) ? 'filled' : 'outlined'}
            onClick={() => handleFilterToggle(filter)}
            sx={{
              borderRadius: 4,
              borderColor: '#9CACBA',
              bgcolor: selectedFilters?.includes(filter)
                ? filter === 'Active'
                  ? '#388E3C'
                  : '#D32F2F'
                : filter === 'Active'
                ? '#F6FFF9'
                : '#FFF7F6',
              color: selectedFilters?.includes(filter) ? '#fff' : '#000',
              width: '45%',
              marginX: 0.5,
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': {
                color: '#fff',
              },
            }}
          />
        ))}
      </Box>
    ),
    [selectedFilters, handleFilterToggle]
  );

  const sortedVehicles = useMemo(() => {
    if (!liveTrackingListData?.devices) return [];

    return [...liveTrackingListData.devices].sort((a: any, b: any) =>
      a?.lookup_vehicles[0]?.vehicleId?.localeCompare(b?.lookup_vehicles[0]?.vehicleId, undefined, {
        sensitivity: 'base',
      })
    );
  }, [liveTrackingListData]);

  const totalPages =
    Math.ceil(liveTrackingListData?.pageDetails?.totalRecords / liveTrackingListData?.pageDetails?.pageSize) || 1;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#ECF0F1',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Fleet Tracking
        </Typography>
        <IconButton aria-label="refresh" onClick={onRefresh} sx={{ ml: 1 }}>
          <RiRefreshLine color="#247FAD" />
        </IconButton>
      </Box>

      <Box sx={{ px: 1, pb: 1, position: 'relative' }}>
        <SearchInput
          placeholder="Search ID"
          size="small"
          sx={{
            width: '100%',
            border: '1px solid #9CACBA',
            borderRadius: '8px',
            background: '#fff',
            fontSize: '0.75rem',
          }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <IconButton
          sx={{
            p: '4px',
            borderLeft: '1px solid #2C3E5080',
            background: '#fff',
            borderRadius: '1px',
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-60%)',
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <RiFilter3Line />
        </IconButton>
      </Box>

      {showFilters && FilterRow}

      <Box sx={{ flex: 1, overflowY: 'auto', px: '5px' }}>
        <List>
          {sortedVehicles && sortedVehicles.length > 0 ? (
            sortedVehicles.map((vehicle: any) => (
              <ListItem
                key={vehicle.deviceId}
                onClick={() => handleShowDetails(vehicle)}
                onMouseEnter={() => setHighlightedVehicle(vehicle)}
                onMouseLeave={() => setHighlightedVehicle(null)}
                sx={{
                  mt: 1,
                  borderRadius: '8px',
                  border: '1px solid #9CACBA',
                  bgcolor: highlightedVehicle?.deviceId === vehicle.deviceId ? '#5B7C9D' : '#fff',
                  cursor: 'pointer',
                  py: 1,
                }}
              >
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {vehicle.vehicleStatus === 'active' ? (
                    <FiNavigation2 size={24} color="#4CAF50" />
                  ) : (
                    <IoMdCloseCircle size={24} color="#D24537" />
                  )}
                </Box>
                <ListItemText
                  primary={vehicle.lookup_vehicles[0]?.vehicleId}
                  secondary={
                    addresses[vehicle.deviceId] ? (
                      <Box
                        sx={{
                          position: 'relative',
                          maxHeight: '40px',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          transition: 'max-height 0.3s ease-in-out',
                          '&:hover': {
                            whiteSpace: 'normal',
                            maxHeight: 'none',
                            overflow: 'visible',
                          },
                        }}
                      >
                        {splitAddressInTwoLinesLiveTrack(addresses[vehicle.deviceId], MAX_VISIBLE_LENGTH)?.map(
                          (line: string, index: number) => (
                            <Typography key={index} variant="body2" sx={{ fontSize: '0.7rem' }}>
                              {line}
                            </Typography>
                          )
                        )}
                      </Box>
                    ) : (
                      'Loading...'
                    )
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'medium',
                    color: highlightedVehicle?.deviceId === vehicle.deviceId ? '#fff' : '#757575',
                    fontSize: '0.75rem',
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: {
                      fontSize: '0.625rem',
                      color: highlightedVehicle?.deviceId === vehicle.deviceId ? '#fff' : '#757575',
                    },
                  }}
                />

                <Box
                  sx={{
                    ml: 'auto',
                    bgcolor: highlightedVehicle?.deviceId === vehicle.deviceId ? '#2C3E50' : '#5B7C9D',
                    borderRadius: '4px',
                    p: '4px 6px',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      lineHeight: 1,
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  >
                    {convertSpeedToMph(vehicle.lastLiveTrack?.gnssInfo?.speed)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      lineHeight: 1,
                      color: 'white',
                      fontSize: '0.625rem',
                    }}
                  >
                    mph
                  </Typography>
                </Box>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No vehicles found
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      <Box sx={{ p: 1, borderTop: '1px solid #ccc' }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={liveTrackingListData?.pageDetails?.totalRecords}
          pageSize={liveTrackingListData?.pageDetails?.pageSize}
          isDefaultList={true}
          isPage={false}
        />
      </Box>
    </Box>
  );
};

export default LiveTrackingList;
