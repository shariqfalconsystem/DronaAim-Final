import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../molecules/pagination';
import Loader from '../../molecules/loader';
import useTableFilter from '../../../common/hooks/useTableFilters';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import {
  calculateDuration,
  calculateTotalSeconds,
  formatDate,
  formatScore,
  trimLocation,
} from '../../../utility/utilities';
import { paths } from '../../../common/constants/routes';

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

const TripDetails = ({ tripsInformation, onPageChange, onSearch, searchQuery, allTrips, fetchData }: any) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [addresses, setAddresses] = useState<any>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<any>(null);

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

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
    itemsPerPage: 10,
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
          formattedStartDate: formatDate(trip.startDate),
          formattedEndDate: formatDate(trip.endDate),
          duration: calculateTotalSeconds(trip.startDate, trip.endDate),
        });
      }
      setProcessedTrips(processedData);
    };

    if (allTrips?.length) {
      setTableData();
    }
  }, [allTrips]);

  const totalPages = Math.ceil(totalFilteredRecords / 10) || 1;

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
            <Box sx={{ mr: 1 }}></Box>
          )}
        </Grid>
      </Grid>

      <TableContainer sx={{ marginTop: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
            <TableRow>
              {[
                { label: 'Trip ID', key: 'tripId' },
                { label: 'Vehicle ID', key: 'vehicleId' },
                { label: 'Start Location', key: 'startLocation' },
                { label: 'Start Date', key: 'startDate' },
                { label: 'End Location', key: 'endLocation' },
                { label: 'End Date', key: 'endDate' },
                { label: 'Trip Duration', key: 'duration' },
                { label: 'Events', key: 'incidentCount' },
                { label: 'Trip Score', key: 'tripScore' },
              ].map(({ label, key }) => (
                <TableCell key={key}>
                  <Box>
                    <Typography
                      sx={{
                        whiteSpace: 'nowrap',
                        color: '#fff!important',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {label}
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        <TbTriangleFilled
                          size={8}
                          color={sortColumn === key && sortDirection === 'asc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                        />
                        <TbTriangleInvertedFilled
                          size={8}
                          color={sortColumn === key && sortDirection === 'desc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                        />
                      </Box>
                    </Typography>

                    {key === 'startLocation' || key === 'endLocation' || key === 'duration' ? (
                      <TextField
                        size="small"
                        variant="outlined"
                        disabled
                        value={searchQueries[key] || ''}
                        onChange={(e) => handleColumnSearch(key, e.target.value)}
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#e1e1e1',
                            width: '100%',
                            height: '30px',
                          },
                        }}
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
                            backgroundColor: 'white',
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
            {displayedTrips?.map((row: any, index: any) => (
              <TableRow
                key={index}
                sx={index % 2 ? { background: '#BFD1D9' } : { background: '#fff' }}
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.tripId}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.vehicleId || 'NA'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {addresses[row.tripId]?.start ? trimLocation(addresses[row.tripId]?.start) : 'NA'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.startDate)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {addresses[row.tripId]?.end ? trimLocation(addresses[row.tripId]?.end) : 'NA'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.endDate)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{calculateDuration(row.startDate, row.endDate)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.incidentCount}</TableCell>
                <TableCell>{formatScore(row?.tripScore)}</TableCell>{' '}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={totalFilteredRecords}
          pageSize={tripsInformation?.pageDetails?.pageSize}
          isDefaultList={false}
        />
      </TableContainer>
    </Box>
  );
};

export default TripDetails;
