import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import { VehicleStatus } from '../../components/atoms/chip-with-icon';
import debounce from 'lodash/debounce';
import Edit from '../../assets/icons/edit.png';
import Delete from '../../assets/icons/delete.png';
import Link from '../../assets/icons/link.png';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import { useSelector } from 'react-redux';
import { normalizeStatus } from '../../utility/utilities';

const UnassignedListTable: React.FC<any> = ({
  vehicleInformation,
  onEditVehicle,
  onLinkVehicle,
  onDeleteVehicle,
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
  isUnInsuredFleet,
  role,
}) => {
  const navigate = useNavigate();
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  //const insurerId = 'INS9999';

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const columns = [
    { label: 'Vehicle ID', key: 'vehicleId' },
    { label: 'Vehicle Status', key: 'status' },
    { label: 'Vehicle Score', key: 'meanScore' },
    { label: 'VIN', key: 'vin' },
    { label: 'License plate ', key: 'tagLicencePlateNumber' },
    { label: 'Make', key: 'make' },
    { label: 'Model', key: 'model' },
    { label: 'Year', key: 'year' },
    { label: 'Device ID', key: 'deviceId' },
    { label: 'Device Provider', key: 'partnerName' },
    { label: 'Custom Vehicle ID', key: 'customVehicleId' },
    { label: 'IMEI Number', key: 'imeiByDevice' },
    { label: 'Actions', key: 'actions' },
  ];

  const handleLinkClick = (e: any, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkVehicle(vehicle);
  };

  const handleEditClick = (e: any, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    onEditVehicle(vehicle);
  };

  const handleDeleteClick = (e: React.MouseEvent, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    setVehicleToDelete(vehicle);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      onDeleteVehicle(vehicleToDelete.vehicleId);
    }
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  const totalPages = Math.ceil(vehicleInformation?.pageDetails?.totalRecords / 10) || 1;

  useEffect(() => {
    console.log('Vehicles Information2:', vehicleInformation?.vehicles);
  }, [vehicleInformation]);

  return (
    <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
      <TableContainer
        ref={containerRef}
        component={Paper}
        onScroll={handleScroll}
        sx={{
          overflowX: 'auto',
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
        <Table
          ref={tableRef}
          sx={{
            width: '120%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map(({ label, key }, index) => (
                <StyledHeadCell
                  key={key}
                  sx={{
                    position: index === 0 || index === columns.length - 1 ? 'sticky' : 'static',
                    left: index === 0 ? 0 : 'auto',
                    right: index === columns.length - 1 ? 0 : 'auto',
                    zIndex: index === 0 || index === columns.length - 1 ? 2 : 'auto',
                    backdropFilter: 'blur(50px)',
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
                      onClick={() => {
                        key !== 'startLocation' && key !== 'endLocation';
                      }}
                      component={'span'}
                    >
                      {label}
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && (
                          <>
                            <TbTriangleFilled
                              size={8}
                              color={
                                sortColumn === key && sortDirection === (key === 'tripStatus' ? 'DESC' : 'ASC')
                                  ? '#000'
                                  : 'rgba(0,0,0,0.5)'
                              }
                              onClick={() => handleSort(key, key === 'tripStatus' ? 'DESC' : 'ASC')}
                            />
                            <TbTriangleInvertedFilled
                              size={8}
                              color={
                                sortColumn === key && sortDirection === (key === 'tripStatus' ? 'ASC' : 'DESC')
                                  ? '#000'
                                  : 'rgba(0,0,0,0.5)'
                              }
                              onClick={() => handleSort(key, key === 'tripStatus' ? 'ASC' : 'DESC')}
                            />
                          </>
                        )}
                      </Box>
                    </Typography>
                    {key !== 'actions' && (
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
            {vehicleInformation?.vehicles && vehicleInformation?.vehicles.length > 0 ? (
              vehicleInformation?.vehicles.map((vehicle: any) => {
                const formattedVehicleStatus: VehicleStatus = normalizeStatus(vehicle?.vehicleStatus);
                return (
                  <TableRow
                    key={vehicle?.vehicleId}
                    onClick={() => {
                      navigate(`/vehicles-details/${vehicle?.vin}/`, {
                        state: vehicle,
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
                        background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {vehicle?.vehicleId || 'NA'}
                        </Typography>
                      </Box>
                    </StyledDataCell>
                    <StyledDataCell>
                      <ChipWithIcon status={formattedVehicleStatus} />
                    </StyledDataCell>
                    <StyledDataCell width={25}>
                      <VehicleSafetyScoreBox
                        score={Number(vehicle?.meanScore || 0).toFixed(1)}
                        label=""
                        width={100}
                        height={35}
                        imageHeight={15}
                        textSize="0.85rem"
                        textColored={true}
                      />
                    </StyledDataCell>
                    <StyledDataCell>{vehicle?.vin || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.tagLicencePlateNumber || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.make || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.model || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.year || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.lookup_devices?.[0]?.deviceId || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.lookup_devices?.[0]?.deviceProvider || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.customVehicleId || 'NA'}</StyledDataCell>
                    <StyledDataCell>{vehicle?.lookup_devices?.[0]?.imei ?? 'NA'}</StyledDataCell>
                    <StyledDataCell
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton onClick={(e: any) => handleLinkClick(e, vehicle)}>
                          <img src={Link} alt="Link" width={20} height={20} />
                        </IconButton>
                        <IconButton onClick={(e: any) => handleEditClick(e, vehicle)}>
                          <img src={Edit} alt="Edit" width={20} height={20} />
                        </IconButton>
                        {isUnInsuredFleet && role === 'fleetManagerSuperUser' && (
                          <IconButton onClick={(e) => handleDeleteClick(e, vehicle)}>
                            <img src={Delete} alt="Delete" width={20} height={20} />
                          </IconButton>
                        )}
                      </Box>
                    </StyledDataCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length} sx={{ textAlign: 'center', padding: '20px' }}>
                  <Typography variant="body1">No Vehicles Found</Typography>
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
        totalRecords={vehicleInformation?.pageDetails?.totalRecords}
        pageSize={vehicleInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
      {vehicleToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          //driverName={vehicleToDelete.formattedDriverName}
          vehicleId={vehicleToDelete.vehicleId}
        />
      )}
    </Box>
  );
};

export default UnassignedListTable;
