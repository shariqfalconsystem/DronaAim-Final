import { useCallback, useEffect, useRef, useState } from 'react';
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

import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';

import { DatePicker } from 'antd';
import { Dayjs } from 'dayjs';
import { MdWarning } from 'react-icons/md';
import useTableFilter from '../../../common/hooks/useTableFilters';
import { formatScore } from '../../../utility/utilities';
import Loader from '../../../components/molecules/loader';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import Pagination from '../../../components/molecules/pagination';
import debounce from 'lodash/debounce';

const FleetDrivers = ({
  driversInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
}: any) => {
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  //const [processedDrivers, setProcessedDrivers] = useState<any[]>([]);

  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const totalPages =
    Math.ceil(driversInformation?.pageDetails?.totalRecords / driversInformation?.pageDetails?.pageSize) || 1;

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

  if (!driversInformation) {
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
          <Table ref={tableRef}>
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
              <TableRow>
                {[
                  { label: 'Driver ID', key: 'userId' },
                  { label: 'Driver Name', key: 'driverName' },
                  { label: 'Driver Score', key: 'driverScore' },
                  { label: 'Total Events', key: 'totalIncidentCount' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Email', key: 'emailId' },
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
              {driversInformation?.users?.length > 0 ? (
                driversInformation?.users?.map((drivers: any, index: any) => (
                  <TableRow
                    key={index}
                    sx={
                      index % 2
                        ? {
                            background: '#BFD1D9',
                            color: drivers.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: drivers.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: drivers.isOrphaned ? '#113f8a' : '#a8d1e3',
                            },
                            textAlign: 'center',
                          }
                        : {
                            background: '#fff',
                            color: drivers.isOrphaned ? '#a1a1a1' : 'inherit',
                            cursor: drivers.isOrphaned ? 'default' : 'pointer',
                            '&:hover': {
                              backgroundColor: drivers.isOrphaned ? '#f0f0f0' : '#d9dbde',
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
                      {drivers?.userId || 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {drivers.firstName || drivers.lastName
                        ? `${drivers.firstName || 'NA'}  ${drivers.lastName || 'NA'}`
                        : 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }} width="10%">
                      {formatScore(drivers?.orgRoleAndScoreMapping?.[0]?.meanScore)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {drivers?.orgRoleAndScoreMapping?.[0]?.totalIncidentCount || 0}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {drivers.primaryPhone ? `${drivers.primaryPhoneCtryCd} ${drivers.primaryPhone}` : 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{drivers?.emailId || 'NA'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body1">No Drivers found</Typography>
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
        totalRecords={driversInformation?.pageDetails?.totalRecords}
        pageSize={driversInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </>
  );
};

export default FleetDrivers;
