import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import Pagination from '../../../components/molecules/pagination';
import { formatScore, formatTotalDistance } from '../../../utility/utilities';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import debounce from 'lodash/debounce';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { paths } from '../../../common/constants/routes';
import { StyledHeadCell } from '../trip-list/table-row-cell';

const FleetPerformanceTable = ({
  fleets,
  searchQueries,
  setSearchQueries,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
}: any) => {
  const totalPages = Math.ceil(fleets?.pageDetails?.totalRecords / fleets?.pageDetails?.pageSize) || 1;

  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      setSearchQueries(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
      onSearch(queries);
    }, 1000),
    [onSearch, setSearchQueries, setCurrentPage, setSearchParams]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: any) => {
    const newQueries = { ...localSearchQueries, [column]: value };

    if (value === '') {
      delete newQueries[column];
    }

    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  // Check if policy is expiring in the next 30 days
  const isPolicyExpiringIn30Days = (fleet: any) => {
    if (!fleet?.lookup_Policies || fleet.lookup_Policies.length === 0) {
      return false;
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Check if any policy is expiring in the next 30 days
    return fleet.lookup_Policies.some((policy: any) => {
      if (!policy.termExpiryDate) return false;

      const expiryDate = new Date(policy.termExpiryDate);

      // Ensure expiryDate is a valid date
      if (isNaN(expiryDate.getTime())) return false;

      // Check if the expiry date is within the next 30 days (inclusive)
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    });
  };

  const getDeviceCountInfo = (fleet: any) => {
    const devices = parseInt(fleet?.numberOfDevices, 10) || 0;
    const vehicles = parseInt(fleet?.numberOfVehicles, 10) || 0;
    const hasActivePolicy = fleet?.lookup_Policies?.some((policy: any) => policy.active === true);
    const falconStatusDNOC = fleet?.lookup_Policies?.some(
      (policy: any) => policy.falconPolicyStatus === 'DNOC/PENDING CANCELLATION'
    );
    const policyExpiringSoon = isPolicyExpiringIn30Days(fleet);

    if (devices < vehicles) {
      if (!hasActivePolicy) {
        return {
          color: '#FF9800', // Amber
          tooltipMessage: 'No devices need to be provisioned because there is no active policy',
        };
      }
      if (falconStatusDNOC) {
        return {
          color: '#FF9800', // Amber
          tooltipMessage: 'No devices need to be provisioned because policy status is DNOC/PENDING CANCELLATION',
        };
      }

      if (policyExpiringSoon) {
        return {
          color: '#FF9800', // Amber
          tooltipMessage: 'No devices need to be provisioned because Policy will expire in 30 days',
        };
      }

      return {
        color: '#D24537', // Red
        tooltipMessage: 'New devices need to be provisioned',
      };
    }

    if (devices >= vehicles) {
      return {
        color: '#008334', // Green
        tooltipMessage: 'No devices need to be provisioned',
      };
    }

    return {
      color: '#FF9800', // Default to Amber
      tooltipMessage: 'No devices need to be provisioned',
    };
  };

  const columns = [
    { label: 'Fleet', key: 'name' },
    { label: 'Fleet Score', key: 'meanScore' },
    { label: 'Miles (Last 30 Days)', key: 'lastThirtyDayTotalDistanceInMiles' },
    { label: 'Events / Mile', key: 'eventsPerMile' },
    { label: 'No. of Devices', key: 'numberOfDevices' },
    { label: 'Connected Devices', key: 'numberOfConnectedDevices' },
    { label: 'Devices to be Provisioned', key: 'devicesToBeProvisioned' },
    { label: 'No. of Vehicles', key: 'numberOfVehicles' },
    { label: 'No. of Drivers', key: 'numberOfDrivers' },
  ];
  return (
    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(({ label, key }, index) => (
              <StyledHeadCell
                key={key}
                sx={{
                  position: index === 0 ? 'sticky' : 'static',
                  left: index === 0 ? 0 : 'auto',
                  zIndex: index === 0 ? 2 : 'auto',
                  backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography
                    sx={{
                      whiteSpace: 'nowrap',
                      color: '#000!important',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                    component={'span'}
                  >
                    {label}
                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                      {key !== 'startLocation' && key !== 'endLocation' && (
                        <>
                          <TbTriangleFilled
                            size={9}
                            color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                            onClick={() => handleSort(key, 'ASC')}
                          />
                          <TbTriangleInvertedFilled
                            size={9}
                            color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                            onClick={() => handleSort(key, 'DESC')}
                          />
                        </>
                      )}
                    </Box>
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={localSearchQueries[key] || ''}
                    onChange={(e) => handleColumnSearch(key, e.target.value)}
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        width: '100%',
                        height: '30px',
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                </Box>
              </StyledHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fleets?.fleetCompanies?.length > 0 ? (
            fleets.fleetCompanies.map((fleet: any, index: any) => {
              const deviceCount = fleet?.numberOfDevices || 0;
              const vehicleCount = fleet?.numberOfVehicles || 0;
              const deviceInfo = getDeviceCountInfo(fleet);

              return (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                    },
                  }}
                >
                  <StyledDataCell sx={{ fontSize: '0.75rem', textAlign: 'left' }}>
                    <a
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`${paths.FLEETDETAILS}/${fleet?.lonestarId}/`, {
                          state: fleet,
                        });
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget.style.textDecoration = 'underline'), (e.currentTarget.style.color = 'blue');
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget.style.color = 'inherit'), (e.currentTarget.style.textDecoration = 'none');
                      }}
                    >
                      {fleet?.name || 'NA'}
                    </a>
                  </StyledDataCell>
                  <StyledDataCell width={25}>
                    <VehicleSafetyScoreBox
                      score={formatScore(fleet?.meanScore)}
                      label=""
                      width={100}
                      height={35}
                      imageHeight={15}
                      textSize="0.85rem"
                      textColored={true}
                    />
                  </StyledDataCell>
                  <StyledDataCell>
                    {fleet?.lastThirtyDayTotalDistanceInMiles
                      ? formatTotalDistance(fleet?.lastThirtyDayTotalDistanceInMiles)
                      : '0'}
                  </StyledDataCell>
                  <StyledDataCell sx={{ fontSize: '0.75rem' }}>{fleet?.eventsPerMile || '0.00'}</StyledDataCell>
                  <StyledDataCell>
                    <Tooltip title={deviceInfo.tooltipMessage} arrow>
                      <Box
                        component="span"
                        sx={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                          display: 'inline-block',
                          color: deviceInfo.color,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: `${deviceInfo.color}10`,
                            border: `1px solid ${deviceInfo.color}`,
                          },
                        }}
                      >
                        {deviceCount}
                      </Box>
                    </Tooltip>
                  </StyledDataCell>
                  <StyledDataCell sx={{ fontSize: '0.75rem' }}>{fleet?.numberOfConnectedDevices || '0'}</StyledDataCell>
                  <StyledDataCell sx={{ fontSize: '0.75rem' }}>{fleet?.devicesToBeProvisioned || '0'}</StyledDataCell>
                  <StyledDataCell sx={{ fontSize: '0.75rem' }}>{vehicleCount}</StyledDataCell>
                  <StyledDataCell sx={{ fontSize: '0.75rem' }}>{fleet?.numberOfDrivers || '0'}</StyledDataCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <StyledDataCell colSpan={columns.length} align="center">
                <Typography variant="body1">No Fleets Found</Typography>
              </StyledDataCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={fleets?.pageDetails?.totalRecords}
        pageSize={fleets?.pageDetails?.pageSize}
        isDefaultList={false}
      />
    </TableContainer>
  );
};

export default FleetPerformanceTable;
