import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Button } from '@mui/material';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import { FilterDevicesDialog } from '../../../components/modals/filter-admin-devices';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import DevicesListTable from './devices-list-table';
import { getDevicesDetailsAdmin, deleteDevice } from '../../../services/admin/adminDevicesServices';
import AddInsuredDeviceDialog from '../../../components/modals/add-adminDevices-dialog';
import UnassignedListTable from './unassigned-list-table';
import { getFleetDetailsAdmin } from '../../../services/admin/fleetServices';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AddUninsuredDeviceDialog from '../../../components/modals/add-adminUninsuredDevices-dialog';
import { getOrganizations } from '../../../services/admin/userMangementService';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/admin/devices/devicesSlice';

const DeviceList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const filterCriteria = useSelector(selectFilterCriteria);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  const [searchParams, setSearchParams] = useSearchParams();
  const [deviceInformation, setDeviceInformation] = useState<any>(null);
  const [uninsuredDeviceInformation, setUninsuredDeviceInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [linkDeviceData, setLinkDeviceData] = useState<any>(null);
  const [deviceFootageData, setDeviceFootageData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'link' | 'footage'>('add');

  const [currentUninsuredPage, setCurrentUninsuredPage] = useState(1);
  const [uninsuredloading, setUninsuredLoading] = useState<boolean>(false);
  const [sortUninsuredParams, setSortUninsuredParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUninsuredParams, setSearchUninsuredParams] = useState<any>({});
  const [searchUninsuredQueries, setSearchUninsuredQueries] = useState<any>({});
  const [sortUninsuredColumn, setSortUninsuredColumn] = useState<string>('');
  const [sortUninsuredDirection, setSortUninsuredDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [fleetOptions, setFleetOptions] = useState<any[]>([]);
  const [insuredOptions, setInsuredOptions] = useState<any[]>([]);
  const [selectedButton, setSelectedButton] = useState<'InsuredDevices' | 'UninsuredDevices'>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'UninsuredDevices' || view === 'InsuredDevices') {
      return view;
    }
    return 'InsuredDevices';
  });
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Add refs to track if search is user-initiated
  const isUserSearchRef = useRef(false);
  const isUserUninsuredSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const itemsPerPage = 10;
  const subscriptionId = selectedButton === 'InsuredDevices' ? 'SUB0001' : 'SUB0002';
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);

      try {
        let updatedSortKey = sortParams.key;
        if (sortParams.key === 'lastStatusPing') {
          updatedSortKey = 'statusTsInMilliseconds';
        } else if (sortParams.key === 'lastLocationPing') {
          updatedSortKey = 'lastLiveTrack.tsInMilliSeconds';
        }

        const requestBody: any = {
          isInsured: true,
          currentLoggedInUserId: currentUserId,
          ...params,
          ...(filterCriteria?.status && {
            status: Object.entries(filterCriteria.status)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'online' ? 'Online' : 'Offline')),
          }),
          ...(filterCriteria?.assignmentStatus && {
            assignmentStatus: Object.entries(filterCriteria.assignmentStatus)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'assigned' ? 'assigned' : 'unassigned')),
          }),
          ...(filterCriteria?.isLastPingStatusFourteenDaysAgo !== null &&
            filterCriteria?.isLastPingStatusFourteenDaysAgo !== undefined && {
              isLastPingStatusFourteenDaysAgo: filterCriteria.isLastPingStatusFourteenDaysAgo,
            }),

          ...(updatedSortKey && {
            sortKey: updatedSortKey,
            sortOrder: sortParams.order,
          }),

          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState.lonestarId && { lonestarId: searchParamsState.lonestarId }),
        };

        const { data } = await getDevicesDetailsAdmin(requestBody, page, itemsPerPage);
        setDeviceInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDeviceInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, itemsPerPage, sortParams, searchParamsState, filterCriteria]
  );

  const fetchUnassignedDevices = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        let updatedSortKey = sortUninsuredParams.key;
        if (sortUninsuredParams.key === 'lastStatusPing') {
          updatedSortKey = 'statusTsInMilliseconds';
        } else if (sortUninsuredParams.key === 'lastLocationPing') {
          updatedSortKey = 'lastLiveTrack.tsInMilliSeconds';
        }

        const requestBody: any = {
          isInsured: false,
          currentLoggedInUserId: currentUserId,
          ...params,
          ...(filterCriteria.status && {
            status: Object.entries(filterCriteria.status)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'online' ? 'Online' : 'Offline')),
          }),
          ...(filterCriteria.assignmentStatus && {
            assignmentStatus: Object.entries(filterCriteria.assignmentStatus)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'assigned' ? 'assigned' : 'unassigned')),
          }),
          ...(filterCriteria?.isLastPingStatusFourteenDaysAgo !== null &&
            filterCriteria?.isLastPingStatusFourteenDaysAgo !== undefined && {
              isLastPingStatusFourteenDaysAgo: filterCriteria.isLastPingStatusFourteenDaysAgo,
            }),
          ...(updatedSortKey && {
            sortKey: updatedSortKey,
            sortOrder: sortUninsuredParams.order,
          }),
          ...(searchUninsuredParams && { ...searchUninsuredParams }),
          ...(searchUninsuredParams.lonestarId && { lonestarId: searchUninsuredParams.lonestarId }),
        };

        const response = await getDevicesDetailsAdmin(requestBody, page, itemsPerPage);
        setUninsuredDeviceInformation(response.data);
        console.log('uninsured', response);
      } catch (error) {
        console.error('Error fetching unassigned devices:', error);
        setUninsuredDeviceInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [currentUserId, searchUninsuredParams, sortUninsuredParams.order, sortUninsuredParams.key, filterCriteria]
  );

  const fetchFleetData = useCallback(async () => {
    try {
      const requestBody: any = {
        subscriptionId,
      };

      const { data } = await getFleetDetailsAdmin(requestBody, 1, 1000);
      if (Array.isArray(data?.fleetCompanies)) {
        const fleetData = data.fleetCompanies.flatMap((fleet: any) =>
          (fleet.lookup_FleetInsurers || []).map((insurer: any) => ({
            lonestarId: fleet.lonestarId,
            name: fleet.name,
            insuredId: fleet.insuredId,
            insurerId: insurer.insurerId,
          }))
        );
        setFleetOptions(fleetData);
        const insuredData = data.fleetCompanies.map((fleet: any) => ({
          insuredId: fleet.insuredId,
          insurerId: fleet.lookup_FleetInsurers?.[0]?.insurerId,
        }));
        setInsuredOptions(insuredData);
      } else {
        setFleetOptions([]);
        setInsuredOptions([]);
      }
    } catch (error) {
      setFleetOptions([]);
      setInsuredOptions([]);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

  // Main data fetching effect
  useEffect(() => {
    const view = searchParams.get('view') || 'InsuredDevices';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (view === 'InsuredDevices') {
      setSelectedButton('InsuredDevices');
      setCurrentPage(page);
      fetchData(page, searchParamsState);
    } else if (view === 'UninsuredDevices') {
      setSelectedButton('UninsuredDevices');
      setCurrentUninsuredPage(page);
      fetchUnassignedDevices(page, searchUninsuredParams);
    }

    // Mark initial load as complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [searchParams, fetchData, fetchUnassignedDevices]);

  //  Effect to handle search params changes for insured devices
  useEffect(() => {
    if (selectedButton === 'InsuredDevices' && !isInitialLoadRef.current) {
      // Only reset to page 1 if this is a user-initiated search
      if (isUserSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'InsuredDevices');
            return newParams;
          });
          isUserSearchRef.current = false; // Reset the flag
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParamsState, selectedButton]);

  // Effect to handle search params changes for uninsured devices
  useEffect(() => {
    if (selectedButton === 'UninsuredDevices' && !isInitialLoadRef.current) {
      // Only reset to page 1 if this is a user-initiated search
      if (isUserUninsuredSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentUninsuredPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'UninsuredDevices');
            return newParams;
          });
          isUserUninsuredSearchRef.current = false; // Reset the flag
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchUninsuredParams, selectedButton]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'InsuredDevices');
      return newParams;
    });
  };

  const handleUninsuredPageChange = (newPage: number) => {
    setCurrentUninsuredPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'UninsuredDevices');
      return newParams;
    });
  };

  // FIXED: Handle search with proper flag setting
  const handleSearch = (searchQueries: any) => {
    isUserSearchRef.current = true; // Mark as user-initiated search
    setSearchParamsState(searchQueries);
    setSearchQueries(searchQueries);
  };

  // FIXED: Handle uninsured search with proper flag setting
  const handleUninsuredSearch = (searchQueries: any) => {
    isUserUninsuredSearchRef.current = true; // Mark as user-initiated search
    setSearchUninsuredParams(searchQueries);
    setSearchUninsuredQueries(searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const handleUninsuredSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortUninsuredParams(newSortParams);
  };

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });

    setFilterPopupOpen(true);
  };
  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
    if (selectedButton === 'InsuredDevices') {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'InsuredDevices');
        return newParams;
      });
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'UninsuredDevices');
        return newParams;
      });
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    if (selectedButton === 'InsuredDevices') {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'InsuredDevices');
        return newParams;
      });
      fetchData(1, searchParamsState);
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'UninsuredDevices');
        return newParams;
      });
      fetchUnassignedDevices(1, searchUninsuredParams);
    }
  };

  const handleAddDeviceClick = () => {
    setMode('add');
    setOpenAddDevice(true);
    setLinkDeviceData(null);
  };

  const handleLinkDeviceClick = (deviceData: any) => {
    setMode('link');
    setLinkDeviceData(deviceData);
    setOpenAddDevice(true);
  };

  const handleDeviceVideoClick = (deviceData: any) => {
    setMode('footage');
    setDeviceFootageData(deviceData);
    if (deviceData && deviceData?.deviceId) {
      navigate(`/admin/devices/video-management/${deviceData.deviceId}`, { state: { deviceData } });
    } else {
      console.error('deviceId not found in deviceData');
    }
  };

  const handleAddDeviceClose = () => {
    setOpenAddDevice(false);
  };

  const handleUnassignedDevicesClick = () => {
    if (selectedButton !== 'UninsuredDevices') {
      dispatch(clearFilterCriteria());
      setSelectedButton('UninsuredDevices');
      setCurrentUninsuredPage(1);
      setSearchParams({ view: 'UninsuredDevices', page: '1' });
    }
  };

  const handleAllDevicesListClick = () => {
    if (selectedButton !== 'InsuredDevices') {
      dispatch(clearFilterCriteria());
      setSelectedButton('InsuredDevices');
      setCurrentPage(1);
      setSearchParams({ view: 'InsuredDevices', page: '1' });
    }
  };

  const handleDeleteDeviceClick = async (deviceId: string, fleetId: string) => {
    try {
      const deviceData = {
        deviceId,
        fleetId,
        currentLoggedInUserId: currentUserId,
        insurerId,
      };
      const { status, data } = await deleteDevice(deviceData);
      if (status === 200) {
        toast.success(data?.message);
        fetchData(currentPage);
        fetchUnassignedDevices(currentUninsuredPage);
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete device');
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data } = await getOrganizations();
      console.log('data', data);

      if (Array.isArray(data?.fleetCompanies)) {
        const insurerOrganizations = data.fleetCompanies
          .filter((org: any) => org.orgType === 'insurer')
          .map((org: any) => ({
            name: org.name,
            organizationId: org.insurerId,
          }));
        setOrganizations(insurerOrganizations);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const AddDeviceDialog = selectedButton === 'UninsuredDevices' ? AddUninsuredDeviceDialog : AddInsuredDeviceDialog;

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} sx={{ marginTop: 1 }}>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              borderRadius: '20px',
              backgroundColor: '#fff',
            }}
          >
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  onAddDeviceClick={handleAddDeviceClick}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'InsuredDevices' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        Devices (Insured Fleets)
                      </Button>
                      <Button
                        variant={selectedButton === 'UninsuredDevices' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Devices (Uninsured Fleets)
                      </Button>
                    </Box>
                  }
                  isAdminDevice={true}
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'InsuredDevices' && (
                      <DevicesListTable
                        deviceInformation={deviceInformation}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        onSort={handleSort}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchQueries}
                        setSearchQueries={setSearchQueries}
                        setSortColumn={setSortColumn}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        onLinkDevice={handleLinkDeviceClick}
                        onDeleteDevice={handleDeleteDeviceClick}
                        onDeviceVideo={handleDeviceVideoClick}
                      />
                    )}
                    {selectedButton === 'UninsuredDevices' && (
                      <UnassignedListTable
                        deviceInformation={uninsuredDeviceInformation}
                        onPageChange={handleUninsuredPageChange}
                        onSearch={handleUninsuredSearch}
                        onSort={handleUninsuredSort}
                        currentPage={currentUninsuredPage}
                        setCurrentPage={setCurrentUninsuredPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchUninsuredQueries}
                        setSearchQueries={setSearchUninsuredQueries}
                        setSortColumn={setSortUninsuredColumn}
                        sortColumn={sortUninsuredColumn}
                        sortDirection={sortUninsuredDirection}
                        setSortDirection={setSortUninsuredDirection}
                        fetchUnassignedDevices={fetchUnassignedDevices}
                        onLinkDevice={handleLinkDeviceClick}
                        onDeleteDevice={handleDeleteDeviceClick}
                        onDeviceVideo={handleDeviceVideoClick}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterDevicesDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
        <AddDeviceDialog
          open={openAddDevice}
          handleClose={handleAddDeviceClose}
          isMobile={false}
          fetchData={fetchData}
          fetchUnassignedDevices={fetchUnassignedDevices}
          lonestarId={insurerId}
          mode={mode}
          linkDeviceData={linkDeviceData}
          fleetOptions={fleetOptions}
          insuredOptions={selectedButton === 'InsuredDevices' ? insuredOptions : []}
          organizations={organizations}
          setCurrentPage={setCurrentPage}
          setCurrentUninsuredPage={setCurrentUninsuredPage}
        />
      </Grid>
    </Container>
  );
};

export default DeviceList;
