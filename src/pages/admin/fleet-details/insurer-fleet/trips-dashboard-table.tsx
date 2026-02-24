import { useEffect, useRef, useState } from 'react';
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
  Paper,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../components/molecules/pagination';
import Loader from '../../../../components/molecules/loader';
import useTableFilter from '../../../../common/hooks/useTableFilters';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import {
  convertKmToMiles,
  formatDate,
  formatDateTimeAlpha,
  formatLocalizedDateTime,
  formatScore,
  formatTime,
  formatUserDateTime,
  splitAddressInTwoLines,
  trimLocation,
  formatTotalDistance,
} from '../../../../utility/utilities';
import { DatePicker } from 'antd';
import { Dayjs } from 'dayjs';
import { PiCalendarDotsDuotone } from 'react-icons/pi';
import { MdWarning } from 'react-icons/md';
import { paths } from '../../../../common/constants/routes';

interface Trip {
  id: string;
  vehicleId: string;
  driverName: string;
  driverId: string;
  status: 'Completed' | 'Scheduled' | 'Pending' | 'In Progress';
  startLocation: string;
  endLocation: string;
  startDate: string;
  endDate: string;
  distance: string;
}

const TripsDashboard = ({ tripsInformation, onPageChange, allTrips, fetchData }: any) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [addresses, setAddresses] = useState<any>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<any>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const { RangePicker } = DatePicker;

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };
  const handleColumnSearch = (column: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [column]: value }));
  };

  const handleFilterChange = (filter: any) => {
    setSelectedFilter(filter);
  };

  const {
    displayedItems: displayedTrips,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords,
  } = useTableFilter<any>({
    data: processedTrips,
    itemsPerPage: 6,
    totalRecords: tripsInformation?.pageDetails?.totalRecords,
    onPageChange,
    searchQueries,
    fetchData,
    filterCriteria,
  });

  useEffect(() => {
    const setTableData = async () => {
      const processedData: any[] = [];
      for (const trip of allTrips) {
        processedData.push({
          ...trip,
          formattedStartDateTime: formatDateTimeAlpha(trip.startDate),
          formattedEndDateTime: formatDateTimeAlpha(trip.endDate),
          formattedDistance: convertKmToMiles(trip.tripDistance),
          formattedDriverName: trip?.driverFirstName ? `${trip.driverFirstName}  ${trip.driverLastName}` : 'NA',
          phoneNumber: trip?.primaryPhone ? `${trip.primaryPhoneCtryCd} ${trip.primaryPhone}` : 'NA',
        });
      }
      setProcessedTrips(processedData);
    };

    if (allTrips?.length) {
      setTableData();
    }
  }, [allTrips]);

  const totalPages = Math.ceil(totalFilteredRecords / 6) || 1;

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setFilterCriteria((prev: any) => ({
        ...prev,
        fromDate: dates[0]?.startOf('day').valueOf(),
        toDate: dates[1]?.endOf('day').valueOf(),
      }));
    } else {
      setFilterCriteria({});
    }
  };

  if (!tripsInformation) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        borderTop: '1px solid #ccc',
        marginTop: 1,
        backgroundColor: '#fff',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        width: '100%',
      }}
    >
      <Grid container sx={{ height: '40px' }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="body1">COMPLETED TRIPS</Typography>
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
          <Box sx={{ mr: 1 }}>
            <RangePicker
              onChange={handleDateRangeChange}
              allowClear={true}
              format="MM/DD/YYYY"
              suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
            />
          </Box>
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
          <Table ref={tableRef}>
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
              <TableRow>
                {[
                  { label: 'Trip ID', key: 'tripId' },
                  { label: 'Driver', key: 'formattedDriverName' },
                  { label: 'Phone Number', key: 'phoneNumber' },
                  { label: 'Vehicle ID', key: 'vehicleId' },
                  { label: 'Start Date', key: 'formattedStartDateTime' },
                  { label: 'End Date', key: 'formattedEndDateTime' },
                  { label: 'Start Location', key: 'startAddress' },
                  { label: 'End Location', key: 'endAddress' },
                  { label: 'Trip Distance', key: 'formattedDistance' },
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
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          <TbTriangleFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'asc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'asc')}
                          />
                          <TbTriangleInvertedFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'desc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'desc')}
                          />
                        </Box>
                      </Typography>

                      <TextField
                        size="small"
                        variant="outlined"
                        value={searchQueries[key] || ''}
                        onChange={(e) => handleColumnSearch(key, e.target.value)}
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            width: 'auto',
                            height: '30px',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedTrips?.map((row: any, index: any) => (
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
                        }
                      : {
                          background: '#fff',
                          color: row.isOrphaned ? '#a1a1a1' : 'inherit',
                          cursor: row.isOrphaned ? 'default' : 'pointer',
                          '&:hover': {
                            backgroundColor: row.isOrphaned ? '#f0f0f0' : '#d9dbde',
                          },
                        }
                  }
                  onClick={() => {
                    if (!row.isOrphaned) {
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
                    {row?.tripId}
                  </TableCell>
                  <TableCell width="5%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.formattedDriverName || 'NA'}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.vehicleId || 'NA'}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row.startLocalizedTsInMilliSeconds
                      ? formatLocalizedDateTime(row.startLocalizedTsInMilliSeconds, row.startTzAbbreviation)
                          ?.dateWithTmz
                      : formatUserDateTime(row.startDate)?.date}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row.endLocalizedTsInMilliSeconds
                      ? formatLocalizedDateTime(row.endLocalizedTsInMilliSeconds, row.endTzAbbreviation)?.dateWithTmz
                      : formatUserDateTime(row.endDate)?.date}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.startAddress ? (
                      splitAddressInTwoLines(row.startAddress).map((line: any, index: any) => (
                        <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {line}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        NA
                      </Typography>
                    )}
                    {row?.startLocationEstimated && (
                      <Tooltip title="Start location estimated">
                        <span>
                          <MdWarning color="orange" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.endAddress ? (
                      splitAddressInTwoLines(row.endAddress).map((line: any, index: any) => (
                        <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {line}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        NA
                      </Typography>
                    )}
                    {row?.endLocationEstimated && (
                      <Tooltip title="End location estimated">
                        <span>
                          <MdWarning color="orange" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {formatTotalDistance(row?.formattedDistance)} Miles
                  </TableCell>
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.incidentCount}
                  </TableCell>
                  <TableCell width="8%" sx={{ textAlign: 'center' }}>
                    {formatScore(row?.tripScore)}
                  </TableCell>{' '}
                  <TableCell width="8%" sx={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.8rem' }}>
                    {row?.phoneNumber || 'NA'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalRecords={totalFilteredRecords}
        pageSize={tripsInformation?.pageDetails?.pageSize}
        isDefaultList={false}
      />
    </Box>
  );
};

export default TripsDashboard;
