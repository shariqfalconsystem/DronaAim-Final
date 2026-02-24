import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import Loader from '../../components/molecules/loader';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import {
  formatLocalizedDateTime,
  formatScore,
  formatUserDateTime,
  getLocalDateFromUtc,
  splitAddressInTwoLines,
} from '../../utility/utilities';
import { DatePicker } from 'antd';
import { Dayjs } from 'dayjs';
import { MdWarning } from 'react-icons/md';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { paths } from '../../common/constants/routes';

const VehicleTripsTable = ({
  tripsInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  filterCriteria,
  setFilterCriteria,
}: any) => {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [dateFilters, setDateFilters] = useState<any>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});

  const { RangePicker } = DatePicker;

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries) => {
      onSearch(queries);
    }, 3000),
    [onSearch]
  );

  const handleColumnSearch = (column: any, value: any) => {
    const newQueries = { ...searchQueries, [column]: value };
    setSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleFilterChange = (filter: any) => {
    setSelectedFilter(filter);
  };

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const totalPages =
    Math.ceil(tripsInformation?.pageDetails?.totalRecords / tripsInformation?.pageDetails?.pageSize) || 1;

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates) {
      setFilterCriteria({});
      return;
    }

    const [startDate, endDate]: any = dates;

    let fromDateUtc: any = null;
    let toDateUtc: any = null;

    if (startDate) {
      fromDateUtc = Date.UTC(startDate.year(), startDate.month(), startDate.date(), 0, 0, 0, 0);
    }

    if (endDate) {
      toDateUtc = Date.UTC(endDate.year(), endDate.month(), endDate.date(), 23, 59, 59, 999);
    }

    setFilterCriteria((prev: any) => ({
      ...prev,
      fromDate: fromDateUtc,
      toDate: toDateUtc,
    }));
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

  if (!tripsInformation) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        borderTop: '1px solid #ccc',
        marginTop: 0.5,
        marginBottom: 2,
        backgroundColor: '#fff',
        borderRadius: '10px',
        width: '100%',
      }}
    >
      <Grid container sx={{ height: '40px' }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="body1">Completed Trips</Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            padding: isMobile ? 1 : 2,
            justifyContent: 'flex-end',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isMobile ? (
            <Select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ marginBottom: 1 }}
            >
              {['Today', 'Yesterday', '1 Week', '1 Month'].map((filter) => (
                <MenuItem key={filter} value={filter}>
                  {filter}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Box sx={{ mr: 1 }}>
              {' '}
              <RangePicker onChange={handleDateRangeChange} allowClear={true} format="MM/DD/YYYY" />
            </Box>
          )}
        </Grid>
      </Grid>

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
                  { label: 'Start Date', key: 'startDate' },
                  { label: 'End Date', key: 'endDate' },
                  { label: 'Start Location', key: 'startAddress' },
                  { label: 'End Location', key: 'endAddress' },
                  { label: 'Trip Distance', key: 'totalDistanceInMiles' },
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
                            fontSize: '0.8rem',
                            justifyContent: 'center',
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
                          value={searchQueries[key] || ''}
                          onChange={(e) => handleColumnSearch(key, e.target.value)}
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: key === 'tripDistance' ? '#f0f0f0' : '#fff',
                              width: 'auto',
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
                              backgroundColor: row.isOrphaned ? '#113f8a' : '#a8d1e3',
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
                        return;
                      } else {
                        navigate(`${paths.TRIPDETAILS}/${row.tripId}?vin=${row.vin}`, {
                          state: row,
                        });
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell
                      width="5%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 100,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                      }}
                    >
                      {row?.tripId || 'NA'}
                    </TableCell>
                    <TableCell width="5%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                      {row.driverFirstName ? `${row.driverFirstName} ${row?.driverLastName}` : 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row?.primaryPhoneCtryCd && row?.primaryPhone
                        ? `${row.primaryPhoneCtryCd} ${row.primaryPhone}`
                        : 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row.startLocalizedTsInMilliSeconds
                        ? formatLocalizedDateTime(row.startLocalizedTsInMilliSeconds, row.startTzAbbreviation)
                            ?.dateWithTmz
                        : formatUserDateTime(row.startDate)?.date || 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row.endLocalizedTsInMilliSeconds
                        ? formatLocalizedDateTime(row.endLocalizedTsInMilliSeconds, row.endTzAbbreviation)?.dateWithTmz
                        : formatUserDateTime(row.endDate)?.date || 'NA'}
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
                    <Typography variant="body1">No Trips Found</Typography>
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
        isDefaultList={false}
      />
    </Box>
  );
};

export default VehicleTripsTable;
