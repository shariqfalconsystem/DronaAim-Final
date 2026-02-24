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
  useMediaQuery,
  TextField,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';

import { DatePicker } from 'antd';
import { formatScore } from '../../../utility/utilities';
import Pagination from '../../../components/molecules/pagination';
import debounce from 'lodash/debounce';

const FleetVehicles = ({
  vehiclesInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
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

  const { RangePicker } = DatePicker;

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});

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

    if (value === '') {
      delete newQueries[column];
    }
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const totalPages =
    Math.ceil(vehiclesInformation?.pageDetails?.totalRecords / vehiclesInformation?.pageDetails?.pageSize) || 1;

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
                  { label: 'Vehicle ID', key: 'vehicleId' },
                  { label: 'VIN', key: 'vin' },
                  { label: 'License plate ', key: 'tagLicencePlateNumber' },
                  { label: 'Vehicle Score', key: 'meanScore' },
                  { label: 'Total Miles', key: 'totalDistanceInMiles' },
                  { label: 'Total Events', key: 'totalIncidentCount' },
                  { label: 'Make', key: 'make' },
                  { label: 'Model', key: 'model' },
                  { label: 'Year', key: 'year' },
                  { label: 'Device Provider', key: 'partnerName' },
                  { label: 'Device ID', key: 'deviceId' },
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
                          justifyContent: 'center',
                        }}
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          <TbTriangleFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'ASC' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'ASC')}
                          />
                          <TbTriangleInvertedFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'DESC' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'DESC')}
                          />
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
              {vehiclesInformation?.vehicles?.length > 0 ? (
                vehiclesInformation?.vehicles?.map((vehicle: any, index: any) => (
                  <TableRow
                    key={vehicle?.vehicleId}
                    sx={
                      index % 2
                        ? {
                            background: '#BFD1D9',
                            color: vehicle.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: vehicle.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: vehicle.isOrphaned ? '#113f8a' : '#a8d1e3',
                            },
                            textAlign: 'center',
                          }
                        : {
                            background: '#fff',
                            color: vehicle.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: vehicle.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: vehicle.isOrphaned ? '#f0f0f0' : '#d9dbde',
                            },
                            textAlign: 'center',
                          }
                    }
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
                      {vehicle?.vehicleId || 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{vehicle?.vin || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {vehicle?.licencePlateNumber || 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {formatScore(vehicle?.meanScore)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {vehicle?.totalDistanceInMiles ? `${vehicle?.totalDistanceInMiles} Miles` : '0 Miles'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {vehicle?.totalIncidentCount || 0}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{vehicle?.make || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{vehicle?.model || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{vehicle?.year || 'NA'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {vehicle?.partnerName || 'NA'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{vehicle?.deviceId || 'NA'}</TableCell>{' '}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body1">No Vehicles Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 0}
        onPageChange={onPageChange}
        totalRecords={vehiclesInformation?.pageDetails?.totalRecords}
        pageSize={vehiclesInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </>
  );
};

export default FleetVehicles;
