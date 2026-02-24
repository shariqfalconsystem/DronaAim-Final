import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ActiveNavigation from '../../../assets/icons/active-navigation.png';
import CompletedNavigation from '../../../assets/icons/completed-box.png';
import Orphan from '../../../assets/icons/orphan.png';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { DatePicker } from 'antd';
import {
  splitAddressInTwoLines,
  formatScore,
  formatLocalizedDateTime,
  formatUserDateTime,
  getLocalDateFromUtc,
} from '../../../utility/utilities';
import Loader from '../../../components/molecules/loader';
import Pagination from '../../../components/molecules/pagination';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { paths } from '../../../common/constants/routes';

const FleetTrips = ({
  tripsInformation,
  onPageChange,
  onSearch,
  onSort,
  allTrips,
  currentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  setFilterCriteria,
  fleetName,
  fleetId,
  insuredId,
}: any) => {
  const navigate = useNavigate();
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [dateFilters, setDateFilters] = useState<any>({});

  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const { RangePicker } = DatePicker;
  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setSearchQueries(queries);
    }, 1000),
    [onSearch, setSearchQueries]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: any) => {
    const newQueries = { ...localSearchQueries, [column]: value };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    let utcTimestamp;
    if (key === 'startDate') {
      utcTimestamp = Date.UTC(date.year(), date.month(), date.date(), 0, 0, 0, 0);
    } else {
      utcTimestamp = Date.UTC(date.year(), date.month(), date.date(), 23, 59, 59, 999);
    }

    const newQueries = {
      ...localSearchQueries,
      [key]: utcTimestamp,
    };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const totalPages = Math.ceil(
    tripsInformation?.pageDetails?.totalRecords / tripsInformation?.pageDetails?.pageSize || 1
  );

  if (!tripsInformation) {
    return <Loader />;
  }

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <TableContainer
          component={Paper}
          onScroll={handleScroll}
          sx={{
            marginTop: 2,
            width: '100%',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '14px',
              cursor: 'pointer',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#5B7C9D',
              borderRadius: '5px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#4a5c72',
            },
          }}
        >
          {' '}
          <Table ref={tableRef}>
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
              <TableRow>
                {[
                  { label: 'Trip ID', key: 'tripId' },
                  { label: 'Driver', key: 'driverName' },
                  { label: 'Phone', key: 'phoneNumber' },
                  { label: 'Vehicle ID', key: 'vehicleId' },
                  { label: 'VIN', key: 'vin' },
                  { label: 'IMEI Number', key: 'imei' },
                  { label: 'Start Date', key: 'startDate' },
                  { label: 'End Date', key: 'endDate' },
                  { label: 'Start Location', key: 'startAddress' },
                  { label: 'End Location', key: 'endAddress' },
                  { label: 'Trip Distance', key: 'tripDistance' },
                  { label: 'Events', key: 'incidentCount' },
                  { label: 'Trip Score', key: 'tripScore' },
                ].map(({ label, key }, index) => (
                  <TableCell
                    key={key}
                    sx={{
                      position: index === 0 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      zIndex: index === 0 ? 2 : 'auto',
                      backdropFilter: index === 0 && applyBackdropFilter ? 'blur(50px)' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {key === 'startAddress' || key === 'endAddress' ? (
                        <Tooltip title="Location is calculated based on available GPS data." arrow>
                          <Typography
                            sx={{
                              whiteSpace: 'nowrap',
                              color: '#fff!important',
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
                              <>
                                <TbTriangleFilled
                                  size={8}
                                  color={
                                    sortColumn === key && sortDirection === 'ASC' ? '#fff' : 'rgba(255,255,255,0.5)'
                                  }
                                  onClick={() => handleSort(key, 'ASC')}
                                />
                                <TbTriangleInvertedFilled
                                  size={8}
                                  color={
                                    sortColumn === key && sortDirection === 'DESC' ? '#fff' : 'rgba(255,255,255,0.5)'
                                  }
                                  onClick={() => handleSort(key, 'DESC')}
                                />
                              </>
                            </Box>
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            color: '#fff!important',
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
                            <>
                              <TbTriangleFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#fff' : 'rgba(255,255,255,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={8}
                                color={
                                  sortColumn === key && sortDirection === 'DESC' ? '#fff' : 'rgba(255,255,255,0.5)'
                                }
                                onClick={() => handleSort(key, 'DESC')}
                              />
                            </>
                          </Box>
                        </Typography>
                      )}
                      {['startDate', 'endDate'].includes(key) ? (
                        <DatePicker
                          value={localSearchQueries[key] ? getLocalDateFromUtc(localSearchQueries[key]) : null}
                          onChange={(date) => handleDateChange(date, key)}
                          placeholder={``}
                          format="MM-DD-YYYY"
                          style={{ marginTop: 8, width: '100%' }}
                          showTime={false}
                        />
                      ) : (
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
                            },
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tripsInformation?.trips?.length > 0 ? (
                tripsInformation?.trips?.map((row: any, index: any) => (
                  <TableRow
                    key={index}
                    sx={
                      index % 2
                        ? {
                            background: '#BFD1D9',
                            color: row.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: row.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: row.isOrphaned ? '#a2a2a2ff' : '#a8d1e3',
                            },
                            textAlign: 'center',
                          }
                        : {
                            background: '#fff',
                            color: row.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: row.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: row.isOrphaned ? '#f0f0f0' : '#d9dbde',
                            },
                            textAlign: 'center',
                          }
                    }
                    onClick={() => {
                      if (row.isOrphaned) {
                        toast.warning('This is a truncated trip');
                      } else {
                        navigate(`${paths.ADMINTRIPDETAILS}/${row.tripId}?vin=${row.vin}`, {
                          state: { ...row, fleetId, insuredId, fleetName },
                        });
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell
                      width="10%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 100,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {row?.tripId}
                        &nbsp; &nbsp;
                        {row?.isOrphaned ? (
                          <img src={Orphan} alt="orphaned-trip" width={20} height={20} />
                        ) : row?.tripStatus === 'Started' ? (
                          <img src={ActiveNavigation} alt="in-progress-trip" width={20} height={20} />
                        ) : (
                          <img src={CompletedNavigation} alt="completed-trip" width={20} height={20} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row.driverFirstName ? `${row.driverFirstName} ${row?.driverLastName}` : 'NA'}
                    </TableCell>
                    <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                      {row?.lookup_users?.[0]?.primaryPhone
                        ? `${row?.lookup_users?.[0]?.primaryPhoneCtryCd} ${row?.lookup_users?.[0]?.primaryPhone}`
                        : 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.vehicleId || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.vin || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.imei || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row.startLocalizedTsInMilliSeconds
                        ? formatLocalizedDateTime(row.startLocalizedTsInMilliSeconds, row.startTzAbbreviation)
                            ?.dateWithTmz
                        : formatUserDateTime(row.startDate)?.date}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row.endLocalizedTsInMilliSeconds
                        ? formatLocalizedDateTime(row.endLocalizedTsInMilliSeconds, row.endTzAbbreviation)?.dateWithTmz
                        : formatUserDateTime(row.endDate)?.date}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {row?.startAddress && row?.startAddress !== 'NA' ? (
                          splitAddressInTwoLines(row.startAddress).map((line: any, index: any) => (
                            <Typography key={index} variant="body2">
                              {line}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#9CACBA' }}>
                            GPS Location Not Available
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {row?.endAddress && row?.endAddress !== 'NA' ? (
                          splitAddressInTwoLines(row.endAddress).map((line: any, index: any) => (
                            <Typography key={index} variant="body2">
                              {line}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#9CACBA' }}>
                            GPS Location Not Available
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row?.totalDistanceInMiles ? `${row?.totalDistanceInMiles} Miles` : '0 Miles'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.incidentCount || 0}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{formatScore(row?.tripScore)}</TableCell>{' '}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body1">No Trips found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalRecords={tripsInformation?.pageDetails?.totalRecords}
        pageSize={tripsInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </>
  );
};

export default FleetTrips;
