import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { formatDateTimeAlpha } from '../../../utility/utilities';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import Link from '../../../assets/icons/link.png';
import Delete from '../../../assets/icons/delete.png';
import Video from '../../../assets/icons/video.png';
import { useSelector } from 'react-redux';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import { useSearchParams } from 'react-router-dom';
import SnapshotImageDisplay from './snapshot';
import environment from '../../../environments/environment';
import LastPing from '../../../assets/icons/lastping.png';

const DevicesListTable: React.FC<any> = ({
  deviceInformation,
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
  onLinkDevice,
  onDeleteDevice,
  onDeviceVideo,
}) => {
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const role = useSelector((state: any) => state.auth.currentUserRole);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
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

    let formattedValue;

    if (key === 'shipmentDate') {
      formattedValue = date.format('MM/DD/YYYY');
    } else {
      formattedValue = date.startOf('day').valueOf();
    }

    const newQueries = { ...localSearchQueries, [key]: formattedValue };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const handleLinkClick = (e: any, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkDevice(device);
  };

  const handleVideoClick = (e: any, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    onDeviceVideo(device);
  };

  const handleDeleteClick = (e: React.MouseEvent, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    setDeviceToDelete({ device });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('deviceId', deviceToDelete);
    if (deviceToDelete) {
      onDeleteDevice(deviceToDelete?.device?.deviceId, deviceToDelete?.device?.lonestarId);
    }
    setDeleteConfirmOpen(false);
    setDeviceToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeviceToDelete(null);
  };

  const columns = [
    { label: 'Insured ID', key: 'insuredId' },
    { label: 'Fleet Name', key: 'name' },
    { label: 'Fleet ID', key: 'lonestarId' },
    { label: 'Device Provider', key: 'partnerName' },
    { label: 'Device ID', key: 'deviceId' },
    { label: 'Device Status', key: 'status' },
    { label: 'IMEI Number', key: 'imei' },
    { label: 'Last Status Ping', key: 'lastStatusPing' },
    { label: 'Last Location Ping', key: 'lastLocationPing' },
    { label: 'Vehicle ID', key: 'vehicleId' },
    { label: 'VIN', key: 'vin' },
    { label: 'Shipping Provider', key: 'shippingProviderName' },
    { label: 'Tracking Number', key: 'trackingNumber' },
    { label: 'Date of Shipment', key: 'shipmentDate' },
    { label: 'Device Snapshots', key: 'snapshot' },
    { label: 'Action', key: 'actions' },
  ];

  const totalPages =
    Math.ceil(deviceInformation?.pageDetails?.totalRecords / deviceInformation?.pageDetails?.pageSize) || 1;

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
        <Table ref={tableRef} sx={{ width: '120%' }}>
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
                      component={'span'}
                    >
                      {label}
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && key != 'snapshot' && (
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

                    {['lastStatusPing', 'lastLocationPing', 'shipmentDate']?.includes(key) ? (
                      <DatePicker
                        value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                        onChange={(date) => handleDateChange(date, key)}
                        placeholder={``}
                        format="MM-DD-YYYY"
                        style={{ marginTop: 8, width: '100%' }}
                      />
                    ) : (
                      key !== 'actions' && (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={localSearchQueries[key] || ''}
                          onChange={(e) => handleColumnSearch(key, e.target.value)}
                          disabled={key === 'snapshot'}
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              width: '100%',
                              height: '30px',
                              backgroundColor: key === 'snapshot' ? '#f0f0f0' : 'white',
                            },
                            '& .MuiOutlinedInput-root.Mui-disabled': {
                              backgroundColor: '#f0f0f0',
                            },
                          }}
                        />
                      )
                    )}
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deviceInformation?.devices && deviceInformation?.devices?.length > 0 ? (
              deviceInformation?.devices?.map((device: any) => (
                <TableRow
                  key={device.deviceId}
                  sx={{
                    backgroundColor:
                      device.isLastPingStatusFourteenDaysAgo === 'inactive'
                        ? '#FFF8ED'
                        : device.isOrphaned
                        ? '#f0f0f0'
                        : 'transparent',
                    color: device.isOrphaned ? '#a1a1a1' : 'inherit',
                    cursor: device.isOrphaned ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor:
                        device.isLastPingStatusFourteenDaysAgo === 'inactive'
                          ? '#FFF8ED'
                          : device.isOrphaned
                          ? '#f0f0f0'
                          : '#f5f5f5',
                    },
                  }}
                >
                  <StyledDataCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      whiteSpace: 'nowrap',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background:
                        device.isLastPingStatusFourteenDaysAgo === 'inactive'
                          ? '#FFF8ED'
                          : applyBackdropFilter
                          ? '#f5f5f5'
                          : 'inherit',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                      {device.isLastPingStatusFourteenDaysAgo === 'inactive' && (
                        <img
                          src={LastPing}
                          alt="Last Ping Alert"
                          width={16}
                          height={16}
                          title='"Last Status Ping" was more than 14 days ago'
                        />
                      )}
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {device.insuredId || 'NA'}
                      </Typography>{' '}
                    </Box>
                  </StyledDataCell>
                  <StyledDataCell>{device?.lookup_fleetcompanies[0]?.name || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.lonestarId || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.deviceProvider || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.deviceId || 'NA'}</StyledDataCell>
                  <StyledDataCell>
                    <ChipWithIcon
                      status={
                        device?.status === 'DeviceOffline'
                          ? 'Offline'
                          : device?.status === 'DeviceOnline'
                          ? 'Online'
                          : 'NA'
                      }
                    />
                  </StyledDataCell>
                  <StyledDataCell>{device?.imei || 'NA'}</StyledDataCell>
                  <StyledDataCell>{formatDateTimeAlpha(device?.statusTsInMilliseconds) || 'NA'}</StyledDataCell>
                  <StyledDataCell>
                    {formatDateTimeAlpha(device?.lastLiveTrack?.tsInMilliSeconds) || 'NA'}
                  </StyledDataCell>
                  <StyledDataCell>{device?.lookup_vehicles[0]?.vehicleId || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.lookup_vehicles[0]?.vin || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.shippingProviderName || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.trackingNumber || 'NA'}</StyledDataCell>
                  <StyledDataCell>{device?.shipmentDate || 'NA'}</StyledDataCell>
                  <StyledDataCell>
                    <SnapshotImageDisplay
                      snapshots={device?.snapshot}
                      mediaBaseUrl={environment.mediaBaseUrl}
                      lonestarId={device?.lonestarId}
                      vehicleId={device?.lookup_vehicles[0]?.vehicleId}
                      vin={device?.lookup_vehicles[0]?.vin}
                      deviceId={device?.deviceId}
                    />
                  </StyledDataCell>
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
                      <IconButton onClick={(e: any) => handleLinkClick(e, device)}>
                        <img src={Link} alt="Link" width={20} height={20} />
                      </IconButton>
                      {role === 'insurerSuperUser' && (
                        <IconButton onClick={(e) => handleDeleteClick(e, device)}>
                          <img src={Delete} alt="Delete" width={20} height={20} />
                        </IconButton>
                      )}
                      <IconButton onClick={(e: any) => handleVideoClick(e, device)}>
                        <img src={Video} alt="Link" width={20} height={20} />
                      </IconButton>
                    </Box>
                  </StyledDataCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography> No Devices Found</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={deviceInformation?.pageDetails?.totalRecords}
        pageSize={deviceInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
      {deviceToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          //driverName={vehicleToDelete.formattedDriverName}
          deviceId={deviceToDelete?.device?.deviceId}
        />
      )}
    </Box>
  );
};

export default DevicesListTable;
