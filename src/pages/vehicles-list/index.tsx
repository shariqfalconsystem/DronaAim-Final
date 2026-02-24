import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography, Button } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import VehicleListTable from './vehicle-list-table';
import {
  getVehiclesList,
  postVehicleList,
  deleteVehicle,
  getUnassignedVehicles,
} from '../../services/fleetManager/vehiclesService';
import { FilterVehicleDialog } from '../../components/modals/filter-vehicle-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/vehicles/vehicleSlice';
import LoadingScreen from '../../components/molecules/loading-screen';
import AddVehicleDialog from '../../components/modals/add-vehicle-dialog';
import { toast } from 'react-toastify';
import UnassignedListTable from './unassigned-list-table';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const VehicleList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehiclesInformation, setVehiclesInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({
    key: 'meanScore',
    order: 'DESC',
  });
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [openAddVehicle, setOpenAddVehicle] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'edit' | 'link'>('add');

  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);

  const getInitialSelectedButton = (): 'all' | 'unassigned' => {
    const view = searchParams.get('view');
    return view === 'unassigned' || view === 'all' ? view : 'all';
  };
  const [selectedButton, setSelectedButton] = useState<'all' | 'unassigned'>(getInitialSelectedButton);

  const [currentUnassignedPage, setCurrentUnassignedPage] = useState(1);
  const [sortUnassignedParams, setSortUnassignedParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUnassignedParams, setSearchUnassignedParams] = useState<any>({});
  const [searchUnassignedQueries, setSearchUnassignedQueries] = useState<any>({});
  const [sortUnassignedColumn, setSortUnassignedColumn] = useState<string>('');
  const [sortUnassignedDirection, setSortUnassignedDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [unAssignedVehicleInformation, setUnAssignedVehicleInformation] = useState<any>(null);

  // Add refs to track if search is user-initiated
  const isUserSearchRef = useRef(false);
  const isUserUnassignedSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const itemsPerPage = 10;
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const role = useSelector((state: any) => state.auth.currentUserRole);

  const isUnInsuredFleet = insurerId === 'INS9999';

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);
      try {
        const tripStatus: string[] = [];
        if (filterCriteria?.active) tripStatus.push('Started');
        if (filterCriteria?.inactive) tripStatus.push('Completed');

        const requestBody: any = {
          ...params,
          ...(filterCriteria?.scoreRange && { vehicleScoreRange: filterCriteria?.scoreRange }),
          ...(tripStatus?.length > 0 && { tripStatus }),
          ...(sortParams.key && {
            sortKey: sortParams.key === 'imeiByDevice' ? 'imei' : sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState?.meanScore && { safetyScore: searchParamsState?.meanScore }),
          ...(searchParamsState.tagLicencePlateNumber && {
            licencePlateNumber: searchParamsState.tagLicencePlateNumber,
          }),
          ...(searchParamsState.imeiByDevice && { imei: searchParamsState.imeiByDevice }),
        };

        if (searchParamsState?.meanScore) {
          delete requestBody.meanScore;
        }

        const { data } = await postVehicleList(lonestarId, page, itemsPerPage, requestBody);
        setVehiclesInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setVehiclesInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [lonestarId, itemsPerPage, filterCriteria, sortParams, searchParamsState]
  );

  const fetchUnassignedVehicles = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        const tripStatus: string[] = [];
        if (filterCriteria?.active) tripStatus.push('Started');
        if (filterCriteria?.inactive) tripStatus.push('Completed');

        const requestBody: any = {
          lonestarId,
          ...(filterCriteria?.scoreRange && { vehicleScoreRange: filterCriteria?.scoreRange }),
          ...(tripStatus?.length > 0 && { tripStatus }),
          ...(sortUnassignedParams.key && {
            sortKey: sortUnassignedParams.key === 'imeiByDevice' ? 'imei' : sortUnassignedParams.key,
            sortOrder: sortUnassignedParams.order,
          }),
          ...(searchUnassignedParams && { ...searchUnassignedParams }),
          ...(searchUnassignedParams?.meanScore && { safetyScore: searchUnassignedParams?.meanScore }),
          ...(searchUnassignedParams.tagLicencePlateNumber && {
            licencePlateNumber: searchUnassignedParams.tagLicencePlateNumber,
          }),
          ...(searchUnassignedParams.imeiByDevice && { imei: searchUnassignedParams.imeiByDevice }),
        };
        if (searchUnassignedParams?.meanScore) {
          delete requestBody.meanScore;
        }

        const { data } = await getUnassignedVehicles(lonestarId, requestBody);
        setUnAssignedVehicleInformation(data);
      } catch (error) {
        console.error('Error fetching unassigned devices:', error);
        setUnAssignedVehicleInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [lonestarId, filterCriteria, searchUnassignedParams, sortUnassignedParams]
  );

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
      fetchUnassignedVehicles(page, searchUnassignedParams);
    }

    // Mark initial load as complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [searchParams, fetchData, fetchUnassignedVehicles]);

  //  Effect to handle search params changes for all vehicles
  useEffect(() => {
    if (selectedButton === 'all' && !isInitialLoadRef.current) {
      // Only reset to page 1 if this is a user-initiated search
      if (isUserSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'all');
            return newParams;
          });
          isUserSearchRef.current = false; // Reset the flag
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParamsState, selectedButton]);

  //  Effect to handle search params changes for unassigned vehicles
  useEffect(() => {
    if (selectedButton === 'unassigned' && !isInitialLoadRef.current) {
      // Only reset to page 1 if this is a user-initiated search
      if (isUserUnassignedSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentUnassignedPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'unassigned');
            return newParams;
          });
          isUserUnassignedSearchRef.current = false; // Reset the flag
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchUnassignedParams, selectedButton]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'all');
      return newParams;
    });
  };

  const handleUnassignedPageChange = (newPage: number) => {
    setCurrentUnassignedPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'unassigned');
      return newParams;
    });
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
      fetchUnassignedVehicles(1, searchUnassignedParams);
    }
  };

  // FIXED: Handle search with proper flag setting
  const handleSearch = (searchQueries: any) => {
    isUserSearchRef.current = true; // Mark as user-initiated search
    setSearchQueries(searchQueries);
    setSearchParamsState(searchQueries);
  };

  // FIXED: Handle unassigned search with proper flag setting
  const handleUnassignedSearch = (searchQueries: any) => {
    isUserUnassignedSearchRef.current = true; // Mark as user-initiated search
    setSearchUnassignedQueries(searchQueries);
    setSearchUnassignedParams(searchQueries);
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

  const handleAddVehicleClick = () => {
    setMode('add');
    setOpenAddVehicle(true);
    setEditVehicleData(null);
  };
  const handleEditVehicleClick = (vehicleData: any) => {
    setMode('edit');
    setEditVehicleData(vehicleData);
    setOpenAddVehicle(true);
  };

  const handleLinkVehicleClick = (vehicleData: any) => {
    setMode('link');
    setEditVehicleData(vehicleData);
    setOpenAddVehicle(true);
  };

  const handleAddVehicleClose = () => {
    setOpenAddVehicle(false);
  };
  const handleDeleteVehicleClick = async (vehicleId: any) => {
    try {
      const { status, data } = await deleteVehicle(vehicleId, lonestarId, currentUserId);
      if (status === 200) {
        toast.success(data?.message);
        fetchData(currentPage);
        fetchUnassignedVehicles(currentUnassignedPage);
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
    }
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
            <Card sx={{ borderRadius: '10px', overflowX: 'auto' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  isVehicle={true}
                  onAddVehicleClick={handleAddVehicleClick}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'all' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        All Vehicles
                      </Button>
                      <Button
                        variant={selectedButton === 'unassigned' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Unassigned Vehicles
                      </Button>
                    </Box>
                  }
                  isUnInsuredFleet={isUnInsuredFleet}
                  role={role}
                />
                {isLoading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'all' && (
                      <VehicleListTable
                        vehiclesInformation={vehiclesInformation}
                        filterCriteria={filterCriteria}
                        fetchData={fetchData}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        onSort={handleSort}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchQueries={searchQueries}
                        setSearchQueries={setSearchQueries}
                        setSortColumn={setSortColumn}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        onEditVehicle={handleEditVehicleClick}
                        onDeleteVehicle={handleDeleteVehicleClick}
                        onLinkVehicle={handleLinkVehicleClick}
                        isUnInsuredFleet={isUnInsuredFleet}
                        role={role}
                      />
                    )}
                    {selectedButton === 'unassigned' && (
                      <UnassignedListTable
                        vehicleInformation={unAssignedVehicleInformation}
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
                        fetchData={fetchData}
                        onEditVehicle={handleEditVehicleClick}
                        onDeleteVehicle={handleDeleteVehicleClick}
                        onLinkVehicle={handleLinkVehicleClick}
                        isUnInsuredFleet={isUnInsuredFleet}
                        role={role}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterVehicleDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
        <AddVehicleDialog
          open={openAddVehicle}
          handleClose={handleAddVehicleClose}
          isMobile={false}
          fetchData={fetchData}
          fetchUnassignedVehicles={fetchUnassignedVehicles}
          currentUserId={currentUserId}
          mode={mode}
          editVehicleData={editVehicleData}
          isUnInsuredFleet={isUnInsuredFleet}
          currentPage={currentPage}
          currentUnassignedPage={currentUnassignedPage}
        />
      </Grid>
    </Container>
  );
};

export default VehicleList;
