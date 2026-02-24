import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/insurer/fleet-list/iFleetListSlice';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import FleetListTable from './fleet-list-table';
import UnassignedFleetListTable from './unassigned-fleet-list';
import { getFleetDetailsAdmin, deleteFleetAdmin } from '../../../services/admin/fleetServices';
import { FilterFleetListDialog } from '../../../components/modals/filter-adminfleet';
import { FilterFleetListUninsuredDialog } from '../../../components/modals/filter-admin-uninsured-fleet';
import TotalFleet from '../../../assets/icons/totalFleet.png';
import AddFleetDialog from '../../../components/modals/add-adminFleet-dialog';
import { toast } from 'react-toastify';
import { unInsuredId } from '../../../common/constants/general';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const FleetList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const filterCriteria = useSelector(selectFilterCriteria);
  const [searchParams, setSearchParams] = useSearchParams();

  const [fleetInformation, setFleetInformation] = useState<any>(null);
  const [uninsuredFleetInformation, setUninsuredFleetInformation] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState<any>(1);
  const [currentUninsuredPage, setCurrentUninsuredPage] = useState(1);

  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);

  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [searchQuery, setSearchQuery] = useState('');
  const [processedVehicles, setProcessedVehicles] = useState<any[]>([]);

  const [openAddFleet, setOpenAddFleet] = useState(false);
  const [editFleetData, setEditFleetData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  const getInitialSelectedButton = (): 'insuredFleet' | 'uninsuredFleet' => {
    const view = searchParams.get('view');
    return view === 'uninsuredFleet' || view === 'insuredFleet' ? view : 'insuredFleet';
  };

  const [selectedButton, setSelectedButton] = useState<'insuredFleet' | 'uninsuredFleet'>(getInitialSelectedButton);

  const [sortUninsuredParams, setSortUninsuredParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUninsuredParams, setSearchUninsuredParams] = useState<any>({});
  const [searchUninsuredQueries, setSearchUninsuredQueries] = useState<any>({});
  const [sortUninsuredColumn, setSortUninsuredColumn] = useState<string>('');
  const [sortUninsuredDirection, setSortUninsuredDirection] = useState<'ASC' | 'DESC'>('ASC');

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const itemsPerPage = 10;

  const subscriptionId = selectedButton === 'insuredFleet' ? 'SUB0001' : 'SUB0002';

  const fetchUninsuredData = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);
      try {
        const policyStatus: string[] = [];
        const tripStatusInput = params?.policyStatus?.toLowerCase() || '';
        const isPartialActive = 'active'.startsWith(tripStatusInput) && tripStatusInput?.length <= 'active'.length;
        const isPartialInactive =
          'inactive'.startsWith(tripStatusInput) && tripStatusInput?.length <= 'inactive'.length;

        const dynamicStatus = isPartialActive ? 'true' : isPartialInactive ? 'false' : params?.policyStatus;
        const requestBody: any = {
          subscriptionId,
          ...params,
          ...(filterCriteria && {
            lastThirtyDayTotalDistanceInMilesRange: filterCriteria?.milesRange,
            fleetScoreRange: filterCriteria?.scoreRange,
            ...(filterCriteria.contractEffectiveDate && {
              contractEffectiveFromDate: filterCriteria.contractEffectiveDate.from?.valueOf(),
              contractEffectiveToDate: filterCriteria.contractEffectiveDate.to?.valueOf(),
            }),
            ...(filterCriteria.contractExpiryDate && {
              contractExpiryFromDate: filterCriteria.contractExpiryDate.from?.valueOf(),
              contractExpiryToDate: filterCriteria.contractExpiryDate.to?.valueOf(),
            }),
            ...(filterCriteria.contractStatus && {
              dronaAImContractStatuses: Object.entries(filterCriteria.contractStatus)
                .filter(([_, isChecked]) => isChecked)
                .map(([key]) => (key === 'active' ? 'Active' : 'Expired')),
            }),
          }),
          ...(sortUninsuredParams.key && {
            sortKey: sortUninsuredParams.key,
            sortOrder: sortUninsuredParams.order,
          }),
          ...(params && { ...params }),
          ...(params.name && { fleetName: params.name }),
          ...(params.organizationName && { organizationName: params.organizationName }),
          ...(params?.policyStatus && { policyStatus: dynamicStatus }),
        };

        const { data } = await getFleetDetailsAdmin(requestBody, page, itemsPerPage);
        setUninsuredFleetInformation(data);
      } catch (error) {
        console.error('Error fetching uninsured fleet information:', error);
        setUninsuredFleetInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [filterCriteria, sortUninsuredParams, itemsPerPage, subscriptionId]
  );

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);
      try {
        const cleanedSearchParams = { ...params };

        if (cleanedSearchParams['users.0.email']) {
          cleanedSearchParams.email = cleanedSearchParams['users.0.email'];
          delete cleanedSearchParams['users.0.email'];
        }

        if (cleanedSearchParams['users.0.phone']) {
          cleanedSearchParams.phone = cleanedSearchParams['users.0.phone'];
          delete cleanedSearchParams['users.0.phone'];
        }

        const tripStatusInput = params?.policyStatus?.toLowerCase() || '';
        const isPartialActive = 'active'.startsWith(tripStatusInput) && tripStatusInput?.length <= 'active'.length;
        const isPartialInactive =
          'inactive'.startsWith(tripStatusInput) && tripStatusInput?.length <= 'inactive'.length;

        const dynamicStatus = isPartialActive ? 'true' : isPartialInactive ? 'false' : params?.policyStatus;

        const requestBody: any = {
          subscriptionId,
          ...params,
          ...(filterCriteria && {
            lastThirtyDayTotalDistanceInMilesRange: filterCriteria?.milesRange,
            fleetScoreRange: filterCriteria?.scoreRange,
            ...(filterCriteria.policyEffectiveDate && {
              policyEffectiveFromDate: filterCriteria.policyEffectiveDate.from?.valueOf(),
              policyEffectiveToDate: filterCriteria.policyEffectiveDate.to?.valueOf(),
            }),
            ...(filterCriteria.policyExpiryDate && {
              policyExpiryFromDate: filterCriteria.policyExpiryDate.from?.valueOf(),
              policyExpiryToDate: filterCriteria.policyExpiryDate.to?.valueOf(),
            }),
            ...(filterCriteria.policyStatus && {
              policyStatus: Object.entries(filterCriteria.policyStatus)
                .filter(([_, isChecked]) => isChecked)
                .map(([key]) => (key === 'active' ? 'Active' : 'Expired')),
            }),
            ...(filterCriteria.contractStatus && {
              dronaAImContractStatuses: Object.entries(filterCriteria.contractStatus)
                .filter(([_, isChecked]) => isChecked)
                .map(([key]) => (key === 'active' ? 'Active' : 'Expired')),
            }),
          }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...cleanedSearchParams,
          ...(params.name && { fleetName: params.name }),
          ...(params.organizationName && { organizationName: params.organizationName }),
        };

        const { data } = await getFleetDetailsAdmin(requestBody, page, itemsPerPage);
        setFleetInformation(data);
      } catch (error) {
        console.error('Error fetching insured fleet information:', error);
        setFleetInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [filterCriteria, sortParams, itemsPerPage, subscriptionId]
  );

  useEffect(() => {
    const view = searchParams.get('view') || 'insuredFleet';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (view === 'insuredFleet') {
      setSelectedButton('insuredFleet');
      setCurrentPage(page);
      fetchData(page, searchParamsState);
    } else if (view === 'uninsuredFleet') {
      setSelectedButton('uninsuredFleet');
      setCurrentUninsuredPage(page);
      fetchUninsuredData(page, searchUninsuredParams);
    }
  }, [searchParams, fetchData, fetchUninsuredData, searchParamsState, searchUninsuredParams]);

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1', view: 'insuredFleet' });
    fetchData(1, searchQueries);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), view: 'insuredFleet' });
  };

  const handleUnassignedPageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), view: 'uninsuredFleet' });
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortParams({ key: column, order: direction });
  };

  const handleUnassignedSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortUninsuredParams({ key: column, order: direction });
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
    if (selectedButton === 'insuredFleet') {
      setCurrentPage(1);
      setSearchParams({ page: '1', view: 'insuredFleet' });
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams({ page: '1', view: 'uninsuredFleet' });
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    if (selectedButton === 'insuredFleet') {
      setCurrentPage(1);
      setSearchParams({ page: '1', view: 'insuredFleet' });
      fetchData(1, searchParamsState);
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams({ page: '1', view: 'uninsuredFleet' });
      fetchUninsuredData(1, searchUninsuredParams);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleUnassignedSearch = (searchQueries: any) => {
    setSearchUninsuredParams(searchQueries);
    setCurrentUninsuredPage(1);
    setSearchParams({ page: '1', view: 'uninsuredFleet' });
    fetchUninsuredData(1, searchQueries);
  };

  const handleAddFleetClick = () => {
    setMode('add');
    setOpenAddFleet(true);
    setEditFleetData(null);
  };

  const handleEditFleetClick = (vehicleData: any) => {
    setMode('edit');
    setEditFleetData(vehicleData);
    setOpenAddFleet(true);
  };

  const handleAddFleetPopupClose = () => {
    setOpenAddFleet(false);
  };

  const handleUnassignedDevicesClick = () => {
    if (selectedButton !== 'uninsuredFleet') {
      dispatch(clearFilterCriteria());
      setSelectedButton('uninsuredFleet');
      setCurrentUninsuredPage(1);
      setSearchParams({ view: 'uninsuredFleet', page: '1' });
    }
  };

  const handleAllDevicesListClick = () => {
    if (selectedButton !== 'insuredFleet') {
      dispatch(clearFilterCriteria());
      setSelectedButton('insuredFleet');
      setCurrentPage(1);
      setSearchParams({ view: 'insuredFleet', page: '1' });
    }
  };

  const handleDeleteFleetClick = async (fleetId: string) => {
    if (!fleetId) return;

    try {
      const fleetData = {
        insurerId: unInsuredId,
        fleetId,
        currentLoggedInUserId: currentUserId,
      };

      const { status, data } = await deleteFleetAdmin(fleetData);

      if (status === 200) {
        toast.success(data?.message || 'Fleet deleted successfully');
        fetchUninsuredData(currentUninsuredPage);
      } else {
        toast.error(data?.message || 'Failed to delete fleet');
      }
    } catch (error: any) {
      console.error('Error deleting fleet:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
    }
  };

  const FilterDialogComponent =
    selectedButton === 'insuredFleet' ? FilterFleetListDialog : FilterFleetListUninsuredDialog;

  const isLoading = selectedButton === 'insuredFleet' ? insuredLoading : uninsuredLoading;

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
                  handleSearchChange={handleSearchChange}
                  addFleet={true}
                  handleAddFleet={handleAddFleetClick}
                  isUnInsuredFleetAdmin={selectedButton === 'uninsuredFleet'}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'insuredFleet' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        Insured Fleets
                      </Button>
                      <Button
                        variant={selectedButton === 'uninsuredFleet' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Uninsured Fleets
                      </Button>
                    </Box>
                  }
                />

                {isLoading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'insuredFleet' && (
                      <FleetListTable
                        fleetInformation={fleetInformation}
                        onPageChange={handlePageChange}
                        onSort={handleSort}
                        onSearch={handleSearch}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchQueries={searchQueries}
                        filterCriteria={filterCriteria}
                        setSearchQueries={setSearchQueries}
                        setSortColumn={setSortColumn}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        onEditFleet={handleEditFleetClick}
                        isUnInsuredFleet={false}
                      />
                    )}
                    {selectedButton === 'uninsuredFleet' && (
                      <UnassignedFleetListTable
                        fleetInformation={uninsuredFleetInformation}
                        onPageChange={handleUnassignedPageChange}
                        onSearch={handleUnassignedSearch}
                        onSort={handleUnassignedSort}
                        currentPage={currentUninsuredPage}
                        setCurrentPage={setCurrentUninsuredPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchUninsuredQueries}
                        setSearchQueries={setSearchUninsuredQueries}
                        setSortColumn={setSortUninsuredColumn}
                        sortColumn={sortUninsuredColumn}
                        sortDirection={sortUninsuredDirection}
                        setSortDirection={setSortUninsuredDirection}
                        onEditFleet={handleEditFleetClick}
                        onDeleteFleet={handleDeleteFleetClick}
                        isUnInsuredFleet={true}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterDialogComponent
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
        <AddFleetDialog
          open={openAddFleet}
          handleClose={handleAddFleetPopupClose}
          fetchData={fetchUninsuredData}
          currentUserId={currentUserId}
          mode={mode}
          editFleetData={editFleetData}
          currentUninsuredPage={currentUninsuredPage}
        />
      </Grid>
    </Container>
  );
};

export default FleetList;
