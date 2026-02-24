import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Button } from '@mui/material';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import { FilterDevicesDialog } from '../../../components/modals/filter-admin-devices';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/admin/devices/devicesSlice';
import DevicesListTable from './devices-list-table';
import {
  getIDeviceList,
  getUnassignedDevices,
  deleteDevice,
  getBulkUploadTemplateUrl,
  uploadDeviceFile,
  getUninsuredBulkUploadTemplateUrl,
} from '../../../services/insurer/IdevicesService';
import AddDeviceDialog from '../../../components/modals/add-device-insurer-dialog';
import UnassignedListTable from './unassigned-list-table';
import { getFleetDetails } from '../../../services/insurer/IdashboardService';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FileUploadDialog from '../../../components/modals/file-upload-dialog-driver';
import ValidationErrorModal from '../../../components/modals/driver-validation-erros';
import { paths } from '../../../common/constants/routes';

const DeviceList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const filterCriteria = useSelector(selectFilterCriteria);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentLoggedInUserId = useSelector((state: any) => state.auth.currentUserId);
  const [searchParams, setSearchParams] = useSearchParams();

  const [deviceInformation, setDeviceInformation] = useState<any>(null);
  const [unAssignedDeviceInformation, setUnAssignedDeviceInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);

  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [linkDeviceData, setLinkDeviceData] = useState<any>(null);
  const [deviceFootageData, setDeviceFootageData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'link' | 'footage'>('add');

  const [currentUnassignedPage, setCurrentUnassignedPage] = useState(1);
  const [sortUnassignedParams, setSortUnassignedParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUnassignedParams, setSearchUnassignedParams] = useState<any>({});
  const [searchUnassignedQueries, setSearchUnassignedQueries] = useState<any>({});
  const [sortUnassignedColumn, setSortUnassignedColumn] = useState<string>('');
  const [sortUnassignedDirection, setSortUnassignedDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [fleetOptions, setFleetOptions] = useState<any[]>([]);
  const [insuredOptions, setInsuredOptions] = useState<any[]>([]);

  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Add refs to track if search is user-initiated
  const isUserSearchRef = useRef(false);
  const isUserUnassignedSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const getInitialSelectedButton = (): 'all' | 'unassigned' => {
    const view = searchParams.get('view');
    return view === 'unassigned' || view === 'all' ? view : 'all';
  };

  const [selectedButton, setSelectedButton] = useState<'all' | 'unassigned'>(getInitialSelectedButton);
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const currentInsurerId = useSelector((state: any) => state.auth.userData.currentInsurerId);
  const itemsPerPage = 10;

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);

      try {
        let updatedSortKey = sortParams.key;
        if (sortParams.key === 'lastStatusPing') {
          updatedSortKey = 'statusTsInMilliseconds';
        } else if (sortParams.key === 'lastLocationPing') {
          updatedSortKey = 'lastLiveTrack.tsInMilliSeconds';
        }

        const requestBody: any = {
          ...params,
         ...(filterCriteria && filterCriteria.status && {
            status: Object.entries(filterCriteria.status)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'online' ? 'Online' : 'Offline')),
          }),
          ...(filterCriteria && filterCriteria?.isLastPingStatusFourteenDaysAgo !== null &&
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

        const { data } = await getIDeviceList(insurerId, page, itemsPerPage, requestBody);
        setDeviceInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDeviceInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [insurerId, itemsPerPage, sortParams, searchParamsState,filterCriteria]
  );

  const fetchUnassignedDevices = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        let updatedSortKey = sortUnassignedParams.key;
        if (sortUnassignedParams.key === 'lastStatusPing') {
          updatedSortKey = 'statusTsInMilliseconds';
        } else if (sortUnassignedParams.key === 'lastLocationPing') {
          updatedSortKey = 'lastLiveTrack.tsInMilliSeconds';
        }

        const requestBody: any = {
          currentLoggedInUserId: currentLoggedInUserId,
          insurerId,
          ...(filterCriteria?.status && {
            status: Object.entries(filterCriteria.status)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'online' ? 'Online' : 'Offline')),
          }),
          ...(filterCriteria?.isLastPingStatusFourteenDaysAgo !== null &&
            filterCriteria?.isLastPingStatusFourteenDaysAgo !== undefined && {
              isLastPingStatusFourteenDaysAgo: filterCriteria.isLastPingStatusFourteenDaysAgo,
            }),
          ...(updatedSortKey && {
            sortKey: updatedSortKey,
            sortOrder: sortUnassignedParams.order,
          }),
          ...(searchUnassignedParams && { ...searchUnassignedParams }),
          ...(searchUnassignedParams.lonestarId && { lonestarId: searchUnassignedParams.lonestarId }),
        };

        const response = await getUnassignedDevices(currentUnassignedPage, itemsPerPage, requestBody);
        setUnAssignedDeviceInformation(response.data);
      } catch (error) {
        console.error('Error fetching unassigned devices:', error);
        setUnAssignedDeviceInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [
      currentLoggedInUserId,
      currentUnassignedPage,
      searchUnassignedParams,
      sortUnassignedParams.order,
      sortUnassignedParams.key,
      filterCriteria
    ]
  );

  const fetchFleetData = useCallback(async () => {
    setLoading(true);
    try {
      const requestBody: any = {
        insurerId,
      };

      const { data } = await getFleetDetails(requestBody, 1, 100);
      if (Array.isArray(data?.fleetCompanies)) {
        const fleetData = data.fleetCompanies.map((fleet: any) => ({
          lonestarId: fleet.lonestarId,
          name: fleet.name,
          insuredId: fleet.insuredId,
        }));
        setFleetOptions(fleetData);
        const insuredData = data.fleetCompanies.map((fleet: any) => ({
          insuredId: fleet.insuredId,
          insurerId: fleet.insurerId,
        }));
        setInsuredOptions(insuredData);
      } else {
        setFleetOptions([]);
        setInsuredOptions([]);
      }
    } catch (error) {
      setFleetOptions([]);
      setInsuredOptions([]);
    } finally {
      setLoading(false);
    }
  }, [insurerId]);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

  // Main data fetching effect
  useEffect(() => {
    const view = searchParams.get('view') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (view === 'all') {
      setSelectedButton('all');
      setCurrentPage(page);
      fetchData(page, searchParamsState);
    } else if (view === 'unassigned') {
      setSelectedButton('unassigned');
      setCurrentUnassignedPage(page);
      fetchUnassignedDevices(page, searchUnassignedParams);
    }

    // Mark initial load as complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [searchParams, fetchData, fetchUnassignedDevices]);

  useEffect(() => {
    if (selectedButton === 'all' && !isInitialLoadRef.current) {
      if (isUserSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'all');
            return newParams;
          });
          isUserSearchRef.current = false;
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParamsState, selectedButton]);

  useEffect(() => {
    if (selectedButton === 'unassigned' && !isInitialLoadRef.current) {
      if (isUserUnassignedSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentUnassignedPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'unassigned');
            return newParams;
          });
          isUserUnassignedSearchRef.current = false;
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchUnassignedParams, selectedButton]);

  const handleUnassignedPageChange = (newPage: number) => {
    setCurrentUnassignedPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'unassigned');
      return newParams;
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'all');
      return newParams;
    });
  };

  const handleSearch = (searchQueries: any) => {
    isUserSearchRef.current = true;
    setSearchParamsState(searchQueries);
    setSearchQueries(searchQueries);
  };

  const handleUnassignedSearch = (searchQueries: any) => {
    isUserUnassignedSearchRef.current = true;
    setSearchUnassignedParams(searchQueries);
    setSearchQueries(searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const handleUnassignedSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortUnassignedParams(newSortParams);
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
    if (selectedButton === 'all') {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'all');
        return newParams;
      });
    } else {
      setCurrentUnassignedPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'unassigned');
        return newParams;
      });
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    if (selectedButton === 'all') {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'all');
        return newParams;
      });
      fetchData(1, searchParamsState);
    } else {
      setCurrentUnassignedPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'unassigned');
        return newParams;
      });
      fetchUnassignedDevices(1, searchUnassignedParams);
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
      navigate(`${paths.INSURERVIDEOMANAGEMENT}/${deviceData.deviceId}`, { state: { deviceData } });
    } else {
      console.error('deviceId not found in deviceData');
    }
  };

  const handleAddDeviceClose = () => {
    setOpenAddDevice(false);
  };

  const handleUnassignedDevicesClick = () => {
    if (selectedButton !== 'unassigned') {
      dispatch(clearFilterCriteria());
      setSelectedButton('unassigned');
      setCurrentUnassignedPage(1);
      setSearchParams({ view: 'unassigned', page: '1' });
    }
  };

  const handleAllDevicesListClick = () => {
    if (selectedButton !== 'all') {
      dispatch(clearFilterCriteria());
      setSelectedButton('all');
      setCurrentPage(1);
      setSearchParams({ view: 'all', page: '1' });
    }
  };

  const handleDeleteDeviceClick = async (deviceId: string, fleetId: string) => {
    try {
      const deviceData = {
        deviceId,
        fleetId,
        currentLoggedInUserId: currentUserId,
      };
      console.log('deviceID,fleetId', deviceId, fleetId);
      const { status, data } = await deleteDevice(deviceData);
      if (status === 200) {
        toast.success(data?.message);
        fetchData(currentPage);
        fetchUnassignedDevices(currentUnassignedPage);
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleOpenFileUpload = () => setFileUploadDialogOpen(true);
  const handleCloseFileUpload = () => setFileUploadDialogOpen(false);

  const handleFileUpload = async (files: File[]) => {
    if (!insurerId) {
      toast.error('Lonestar ID not found');
      return;
    }
    setIsUploading(true);

    try {
      for (const file of files) {
        const documentType = 'BulkUploadDriverDetails';
        const response = await uploadDeviceFile(insurerId, file, documentType, currentUserId);

        if (response.status === 202) {
          // Check if userValidationErrorMap is not empty
          if (
            response.data.deviceValidationsErrorMap &&
            Object.keys(response.data.deviceValidationsErrorMap).length > 0
          ) {
            setValidationErrors(response.data.deviceValidationsErrorMap);
            setValidationErrorModalOpen(true); // Open validation popup only if there are validation errors
          }

          if (response.data.deviceExceptionMap && Object.keys(response.data.deviceExceptionMap).length > 0) {
            setValidationErrors(response.data.deviceExceptionMap);
            setValidationErrorModalOpen(true); // Open validation popup only if there are user exceptions
          }

          // Show toast notifications for created users
          if (response?.data?.createdDevices && response?.data?.createdDevices.length > 0) {
            response.data.createdDevices.forEach((user: string) => {
              toast.success(user); // Show success toast for each created user
            });
          }
        } else if (response.status === 200) {
          toast.success('File uploaded successfully');
        }
      }
      fetchData(currentPage, searchParamsState);
      setFileUploadDialogOpen(false);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false); // Stop loading
    }
  };
  console.log('currentisurerID', currentInsurerId);

  const handleFileDownload = async (fileType: string) => {
    try {
      let response;

      if (currentInsurerId === 'INS9999') {
        response = await getUninsuredBulkUploadTemplateUrl(fileType);
      } else {
        response = await getBulkUploadTemplateUrl(fileType);
      }

      const { status, data } = response;
      window.open(data?.getUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(error.message || 'Failed to download file');
    }
  };

  const isLoading = selectedButton === 'all' ? insuredLoading : uninsuredLoading;

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
                  onFileUploadClick={handleOpenFileUpload}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'all' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        All Devices
                      </Button>
                      <Button
                        variant={selectedButton === 'unassigned' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Unassigned Devices
                      </Button>
                    </Box>
                  }
                  isDevice={true}
                />
                {isLoading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'all' && (
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
                        fetchData={fetchData}
                        onLinkDevice={handleLinkDeviceClick}
                        onDeleteDevice={handleDeleteDeviceClick}
                        onDeviceVideo={handleDeviceVideoClick}
                      />
                    )}
                    {selectedButton === 'unassigned' && (
                      <UnassignedListTable
                        deviceInformation={unAssignedDeviceInformation}
                        onPageChange={handleUnassignedPageChange}
                        onSearch={handleUnassignedSearch}
                        onSort={handleUnassignedSort}
                        currentPage={currentUnassignedPage}
                        setCurrentPage={setCurrentUnassignedPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchUnassignedQueries}
                        setSearchQueries={setSearchUnassignedQueries}
                        setSortColumn={setSortUnassignedColumn}
                        sortColumn={sortUnassignedColumn}
                        sortDirection={sortUnassignedDirection}
                        setSortDirection={setSortUnassignedDirection}
                        fetchData={fetchUnassignedDevices}
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
        <FileUploadDialog
          open={fileUploadDialogOpen}
          handleClose={handleCloseFileUpload}
          onUpload={handleFileUpload}
          handleDownload={handleFileDownload}
          loading={isUploading}
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
          insuredOptions={insuredOptions}
          setCurrentPage={setCurrentPage}
        />
        <ValidationErrorModal
          open={validationErrorModalOpen}
          onClose={() => setValidationErrorModalOpen(false)}
          validationErrors={validationErrors}
        />
      </Grid>
    </Container>
  );
};

export default DeviceList;
