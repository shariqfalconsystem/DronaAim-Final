import { useEffect, useRef, useState } from 'react';
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
  Paper,
} from '@mui/material';

import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';

import useTableFilter from '../../../common/hooks/useTableFilters';
import Loader from '../../../components/molecules/loader';
import Pagination from '../../../components/molecules/pagination';
import { formatPhoneNumberForFleetPersonal } from '../../../utility/utilities';

const FleetPersonnel = ({ personnelInformation, onPageChange, fetchData }: any) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);

  const [filterCriteria, setFilterCriteria] = useState<any>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const handleColumnSearch = (column: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [column]: value }));
  };

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
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
    totalRecords: personnelInformation?.length || 6,
    onPageChange,
    searchQueries,
    fetchData,
    filterCriteria,
  });

  const totalPages = Math.ceil(totalFilteredRecords / 6) || 1;

  useEffect(() => {
    const setTableData = async () => {
      const processedData: any[] = [];
      for (const person of personnelInformation) {
        processedData.push({
          ...person,
          formattedName: person?.firstName ? `${person.firstName}  ${person.lastName}` : 'NA',
          formattedId: person?.userId ? person?.userId : 'NA',
          phone: formatPhoneNumberForFleetPersonal(person?.primaryPhone, person?.primaryPhoneCtryCd),
        });
      }
      setProcessedTrips(processedData);
    };

    if (personnelInformation?.length) {
      setTableData();
    }
  }, [personnelInformation]);

  if (!personnelInformation) {
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
                  { label: 'Fleet Personnel ID', key: 'formattedId' },
                  { label: 'Fleet Personnel', key: 'formattedName' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Email', key: 'emailId' },
                ].map(({ label, key }, index) => (
                  <TableCell
                    key={key}
                    sx={{
                      position: index === 0 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      zIndex: index === 0 ? 2 : 'auto',
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
              {displayedTrips?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body1">No Fleet Personnel found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedTrips?.map((row: any, index: any) => (
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
                      {row?.formattedId}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {row?.formattedName || 'NA'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.phone}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row?.emailId || 'NA'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 0}
        onPageChange={handlePageChange}
        totalRecords={totalFilteredRecords}
        pageSize={10}
        isDefaultList={true}
      />
    </>
  );
};

export default FleetPersonnel;
