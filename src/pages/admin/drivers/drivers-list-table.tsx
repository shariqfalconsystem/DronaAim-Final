import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { RiCloseCircleLine } from '@remixicon/react';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import Link from '../../../assets/icons/link.png';
import Edit from '../../../assets/icons/edit.png';
import { useSelector } from 'react-redux';
import { paths } from '../../../common/constants/routes';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { formatScore } from '../../../utility/utilities';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import { StyledHeadCell } from '../user-management/table-row-cell';
import Pagination from '../../../components/molecules/pagination';

const DriversListTable: React.FC<any> = ({
  driversInformation,
  onEditDriver,
  onLinkDriver,
  onDeleteDriver,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
}) => {
  const navigate = useNavigate();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<any>(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const role = useSelector((state: any) => state.auth.currentUserRole);
  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleDeleteClick = (e: React.MouseEvent, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (driverToDelete) {
      onDeleteDriver( driverToDelete);
    }
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const columns = [
    { label: 'Organization ID', key: 'insurerId' },
    { label: 'Organization Name', key: 'organizationName' },
    { label: 'Insured ID', key: 'insuredId' },
    { label: 'Fleet ID', key: 'lonestarId' },
    { label: 'Fleet Name', key: 'name' },
    { label: 'Driver ID', key: 'userId' },
    { label: 'Driver Name', key: 'driverName' },
    { label: 'Driver Score', key: 'meanScore' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'emailId' },
    { label: 'VIN', key: 'vin' },
    { label: 'Events Count', key: 'incidentCount' },
    { label: 'Actions', key: 'actions' },
  ];

  const totalPages =
    Math.ceil(driversInformation?.pageDetails?.totalRecords / driversInformation?.pageDetails?.pageSize) || 1;

  const handleLinkClick = (e: any, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkDriver(driver);
  };

  const handleEditClick = (e: any, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    onEditDriver(driver);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
      setSearchQueries(queries);
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
  const getTextColor = (incidentCount: number) => {
    if (incidentCount >= 90) return '#1C7C44';
    if (incidentCount >= 80) return '#FF9800';
    return '#D24537';
  };

  return (
    <>
      <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
        <TableContainer
          component={Paper}
          style={{ boxShadow: 'none' }}
          onScroll={handleScroll}
          sx={{
            borderCollapse: 'separate',
            '&::-webkit-scrollbar': {
              width: '8px',
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
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(({ label, key }, index) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      position: index === 0 || key === 'actions' ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: key === 'actions' ? 0 : 'auto',
                      zIndex: index === 0 || key === 'actions' ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: key === 'actions' ? '#EDF0F5' : 'auto',
                    }}
                  >
                    <Box>
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
                        onClick={() => {}}
                        component={'span'}
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {key !== 'actions' && (
                            <>
                              <TbTriangleFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'DESC')}
                              />
                            </>
                          )}
                        </Box>
                      </Typography>
                      {key === 'actions' ? (
                        <></>
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
                  </StyledHeadCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {driversInformation?.users && driversInformation?.users?.length > 0 ? (
                driversInformation?.users?.map((drivers: any) => (
                  <TableRow
                    key={drivers?.userId}
                    onClick={() => {
                      navigate(`${paths.ADMINDRIVERSDETAILS}/${drivers?.userId}/`, {
                        state: drivers,
                      });
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <StyledDataCell
                      width="8%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.lookup_fleet_insurers_aslist[0]?.insurerId || 'NA'}
                      </Typography>
                    </StyledDataCell>
                    <StyledDataCell>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.lookup_fleet_insurers_aslist[0]?.name || 'NA'}
                      </Typography>
                    </StyledDataCell>{' '}
                    <StyledDataCell>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.lookup_fleetcompanies_aslist[0]?.insuredId || 'NA'}
                      </Typography>
                    </StyledDataCell>{' '}
                    <StyledDataCell>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.roleAndScoreMapping?.lonestarId || 'NA'}
                      </Typography>
                    </StyledDataCell>{' '}
                    <StyledDataCell>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.roleAndScoreMapping?.orgName || 'NA'}
                      </Typography>
                    </StyledDataCell>{' '}
                    <StyledDataCell>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {drivers?.userId || 'NA'}
                      </Typography>
                    </StyledDataCell>
                    <StyledDataCell>
                      {drivers.firstName || drivers.lastName
                        ? `${drivers.firstName || 'NA'}  ${drivers.lastName || 'NA'}`
                        : 'NA'}
                    </StyledDataCell>
                    <StyledDataCell width={10}>
                      <VehicleSafetyScoreBox
                        score={formatScore(drivers?.roleAndScoreMapping?.meanScore)}
                        label=""
                        width={100}
                        height={35}
                        imageHeight={15}
                        textSize="0.85rem"
                        textColored={true}
                      />
                    </StyledDataCell>
                    <StyledDataCell>
                      {drivers.primaryPhone ? `${drivers.primaryPhoneCtryCd} ${drivers.primaryPhone}` : 'NA'}
                    </StyledDataCell>
                    <StyledDataCell>{drivers?.emailId || 'NA'}</StyledDataCell>
                    <StyledDataCell>{drivers?.lookup_vehicles[0]?.vin || 'NA'}</StyledDataCell>
                    <StyledDataCell>
                      <Typography
                        variant="h6"
                        lineHeight={0.5}
                        fontSize="0.85rem"
                        color={getTextColor(drivers?.roleAndScoreMapping?.meanScore)}
                      >
                        {drivers?.roleAndScoreMapping?.totalIncidentCount ?? 'NA'}
                      </Typography>
                    </StyledDataCell>
                    <StyledDataCell
                      width="10%"
                      sx={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(50px)',
                        background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                        padding: '10px',
                      }}
                    >
                      <Box display="flex" gap={0}>
                        <IconButton onClick={(e: any) => handleLinkClick(e, drivers)}>
                          <img src={Link} alt="Link" width={20} height={20} />
                        </IconButton>
                        <IconButton onClick={(e: any) => handleEditClick(e, drivers)}>
                          <img src={Edit} alt="Link" width={20} height={20} />
                        </IconButton>
                        <IconButton onClick={(e) => handleDeleteClick(e, drivers)}>
                          <RiCloseCircleLine size={20} color="red" />
                        </IconButton>
                      </Box>
                    </StyledDataCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledDataCell colSpan={columns.length}>
                    <Typography variant="body1"> No Drivers Found</Typography>
                  </StyledDataCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 0}
          onPageChange={(page) => {
            setCurrentPage(page);
            setSearchParams({ page: page.toString() });
            onPageChange(page);
          }}
          totalRecords={driversInformation?.pageDetails?.totalRecords}
          pageSize={driversInformation?.pageDetails?.pageSize}
          isDefaultList={true}
        />
      </Box>
      {driverToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          driverName={driverToDelete.formattedDriverName}
          driverId={driverToDelete.userId}
        />
      )}
    </>
  );
};

export default DriversListTable;
