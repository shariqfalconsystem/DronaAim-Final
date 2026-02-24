import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography, Button } from '@mui/material';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import VehicleListTable from './vehicle-list-table';
import { postVehicleList, deleteVehicle } from '../../../services/admin/adminVehiceServices';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/admin/vehicles/vehcileSlice';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { toast } from 'react-toastify';
import UnassignedListTable from './unassigned-list-table';
import { FilterVehicleDialog } from './filter-vehicle-dialog';
import AddUninsuredVehicleDialog from './add-vehicleUninsured-dialog';
import { getFleetDetailsAdmin } from '../../../services/admin/fleetServices';
import EditVehicleDialog from './edit-vehicleUninsured';
import LinkVehicleDialog from './link-vehicle-dialog';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const VehicleList: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehiclesInformation, setVehiclesInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);

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

  const [currentUnassignedPage, setCurrentUnassignedPage] = useState(1);
  const [sortUnassignedParams, setSortUnassignedParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUnassignedParams, setSearchUnassignedParams] = useState<any>({});
  const [searchUnassignedQueries, setSearchUnassignedQueries] = useState<any>({});
  const [sortUnassignedColumn, setSortUnassignedColumn] = useState<string>('');
  const [sortUnassignedDirection, setSortUnassignedDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [unAssignedVehicleInformation, setUnAssignedVehicleInformation] = useState<any>(null);

  const [fleetOptions, setFleetOptions] = useState<any[]>([]);
  const [insuredOptions, setInsuredOptions] = useState<any[]>([]);

  // Add refs to track if search is user-initiated
  const isUserSearchRef = useRef(false);
  const isUserUnassignedSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const itemsPerPage = 10;
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const role = useSelector((state: any) => state.auth.currentUserRole);
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialSelectedButton = (): 'all' | 'unassigned' => {
    const view = searchParams.get('view');
    return view === 'unassigned' || view === 'all' ? view : 'all';
  };
  const [selectedButton, setSelectedButton] = useState<'all' | 'unassigned'>(getInitialSelectedButton);

  const isUnInsuredFleet = insurerId === 'INS9999';
  const subscriptionId = selectedButton === 'all' ? 'SUB0001' : 'SUB0002';

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);
      try {
        const vehicleStatuses: string[] = [];
        if (filterCriteria?.active) vehicleStatuses.push('active');
        if (filterCriteria?.inactive) vehicleStatuses.push('inactive');
        const requestBody: any = {
          subscriptionId,
          ...params,
          ...(filterCriteria?.scoreRange && { vehicleScoreRange: filterCriteria?.scoreRange }),
          ...(filterCriteria?.assignmentStatus && {
            assignmentStatus: Object.entries(filterCriteria.assignmentStatus)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'assigned' ? 'assigned' : 'unassigned')),
          }),
          ...(vehicleStatuses.length > 0 && { vehicleStatuses }),
          ...(sortParams.key && {
            sortKey: sortParams.key === 'imeiByDevice' ? 'imei' : sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState?.meanScore && { safetyScore: searchParamsState.meanScore }),
          ...(searchParamsState.tagLicencePlateNumber && {
            licencePlateNumber: searchParamsState.tagLicencePlateNumber,
          }),
          ...(searchParamsState.imeiByDevice && { imei: searchParamsState.imeiByDevice }),
        };

        if (searchParamsState?.meanScore) {
          delete requestBody.meanScore;
        }

        const { data } = await postVehicleList(requestBody, page, itemsPerPage);
        setVehiclesInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setVehiclesInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [subscriptionId, itemsPerPage, filterCriteria, sortParams, searchParamsState]
  );

  const fetchUnassignedVehicles = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        const vehicleStatuses: string[] = [];
        if (filterCriteria?.active) vehicleStatuses.push('active');
        if (filterCriteria?.inactive) vehicleStatuses.push('inactive');

        const requestBody: any = {
          subscriptionId,
          ...(filterCriteria?.scoreRange && { vehicleScoreRange: filterCriteria?.scoreRange }),
          ...(filterCriteria?.assignmentStatus && {
            assignmentStatus: Object.entries(filterCriteria.assignmentStatus)
              .filter(([_, isChecked]) => isChecked)
              .map(([key]) => (key === 'assigned' ? 'assigned' : 'unassigned')),
          }),
          ...(vehicleStatuses.length > 0 && { vehicleStatuses }),
          ...(sortUnassignedParams.key && {
            sortKey: sortUnassignedParams.key === 'imeiByDevice' ? 'imei' : sortUnassignedParams.key,
            sortOrder: sortUnassignedParams.order,
          }),
          ...(searchUnassignedParams && { ...searchUnassignedParams }),
          ...(searchUnassignedParams?.meanScore && { safetyScore: searchUnassignedParams.meanScore }),
          ...(searchUnassignedParams.tagLicencePlateNumber && {
            licencePlateNumber: searchUnassignedParams.tagLicencePlateNumber,
          }),
          ...(searchUnassignedParams.imeiByDevice && { imei: searchUnassignedParams.imeiByDevice }),
        };
        if (searchUnassignedParams?.meanScore) {
          delete requestBody.meanScore;
        }

        const { data } = await postVehicleList(requestBody, page, itemsPerPage);
        setUnAssignedVehicleInformation(data);
        console.log('unassigned vehicles', data);
      } catch (error) {
        console.error('Error fetching unassigned devices:', error);
        setUnAssignedVehicleInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [subscriptionId, filterCriteria, searchUnassignedParams, sortUnassignedParams]
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
    setSearchUnassignedParams(searchQueries);
    setSearchUnassignedQueries(searchQueries);
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
  const handleDeleteVehicleClick = async (vehicleId: any, lonestarId: string) => {
    console.log('vehicleId : ', vehicleId);
    try {
      const { status, data } = await deleteVehicle(vehicleId, lonestarId, currentUserId);
      fetchUnassignedVehicles(currentUnassignedPage);
      if (status === 200) {
        toast.success(data?.message);
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
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

  const handleUnassignedDevicesClick = () => {
    if (selectedButton !== 'unassigned') {
      dispatch(clearFilterCriteria());
      setSelectedButton('unassigned');
      setCurrentUnassignedPage(1);
      setSearchParams({ view: 'unassigned', page: '1' });
    }
  };

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
                  onAddVehicleClick={handleAddVehicleClick}
                  isUnInsuredVehicle={selectedButton === 'unassigned'}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'all' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        Insured Vehicles
                      </Button>
                      <Button
                        variant={selectedButton === 'unassigned' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Uninsured Vehicles
                      </Button>
                    </Box>
                  }
                  role={role}
                />
                {insuredLoading || uninsuredLoading ? (
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
        {openAddVehicle && mode === 'add' && (
          <AddUninsuredVehicleDialog
            open={openAddVehicle}
            handleClose={handleAddVehicleClose}
            isMobile={false}
            mode={mode}
            fetchData={fetchUnassignedVehicles}
            currentUserId={currentUserId}
            fleetOptions={fleetOptions}
            isUnInsuredFleet={isUnInsuredFleet}
            currentUnassignedPage={currentUnassignedPage}
          />
        )}
        {openAddVehicle && mode === 'edit' && (
          <EditVehicleDialog
            open={openAddVehicle}
            handleClose={handleAddVehicleClose}
            isMobile={false}
            mode={mode}
            fetchData={fetchUnassignedVehicles}
            editVehicleData={editVehicleData}
            currentUserId={currentUserId}
            fleetOptions={fleetOptions}
            isUnInsuredFleet={isUnInsuredFleet}
            currentUnassignedPage={currentUnassignedPage}
          />
        )}
        {openAddVehicle && mode === 'link' && (
          <LinkVehicleDialog
            open={openAddVehicle}
            handleClose={handleAddVehicleClose}
            isMobile={false}
            mode={mode}
            fetchData={fetchData}
            fetchUnassignedVehicles={fetchUnassignedVehicles}
            editVehicleData={editVehicleData}
            currentUserId={currentUserId}
            fleetOptions={fleetOptions}
            isUnInsuredFleet={isUnInsuredFleet}
            isAssigned={selectedButton === 'all'}
            currentPage={currentPage}
            currentUnassignedPage={currentUnassignedPage}
          />
        )}
      </Grid>
    </Container>
  );
};

export default VehicleList;
