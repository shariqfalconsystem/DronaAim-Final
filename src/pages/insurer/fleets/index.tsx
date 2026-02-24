import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/insurer/fleet-list/iFleetListSlice';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import FleetListTable from './fleet-list-table';
import { getFleetDetails, deleteFleet } from '../../../services/insurer/IdashboardService';
import { FilterFleetListDialog } from '../../../components/modals/filiter-fleetlist-dialog';
import TotalFleet from '../../../assets/icons/totalFleet.png';
import AddFleetDialog from '../../../components/modals/add-fleet-dialog';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FleetList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterCriteria = useSelector(selectFilterCriteria);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);

  const itemsPerPage = 10;

  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [fleetInformation, setFleetInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
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

        const dynamicStatus = isPartialActive ? 'true' : isPartialInactive ? 'false' : params?.policytatus;
        const requestBody: any = {
          insurerId: insurerId,
          ...params,
          ...(filterCriteria && {
          lastThirtyDayTotalDistanceInMilesRange: filterCriteria?.milesRange,
            fleetScoreRange: filterCriteria?.scoreRange,

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
        };

        const { data } = await getFleetDetails(requestBody, page, itemsPerPage);
        setFleetInformation(data);
      } catch (error) {
        console.error('Error fetching fleet information:', error);
        setFleetInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [filterCriteria, sortParams, itemsPerPage, insurerId]
  );

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchParamsState);
  }, [currentPage, filterCriteria, sortParams]);

  const handleSearch = (queries: any) => {
    setSearchParamsState(queries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchData(1, queries);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortParams({ key: column, order: direction });
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
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
    fetchData(1, searchParamsState);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
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

  const handleDeleteFleetClick = async (fleetId: string) => {
    if (!fleetId) return;

    try {
      const fleetData = {
        insurerId,
        fleetId,
        currentLoggedInUserId: currentUserId,
      };

      const { status, data } = await deleteFleet(fleetData);

      if (status === 200) {
        toast.success(data?.message || 'Fleet deleted successfully');
        fetchData(currentPage, searchParamsState);
      } else {
        toast.error(data?.message || 'Failed to delete fleet');
      }
    } catch (error: any) {
      console.error('Error deleting fleet:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
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
                  handleSearchChange={handleSearchChange}
                  addFleet={true}
                  handleAddFleet={handleAddFleetClick}
                  leftText={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={TotalFleet} alt="total-fleet" width={48} height={24} />
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: '500', ml: 1 }}>
                        {fleetInformation?.pageDetails?.totalRecords} Fleets
                      </Typography>
                    </Box>
                  }
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
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
                    onDeleteFleet={handleDeleteFleetClick}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterFleetListDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
        <AddFleetDialog
          open={openAddFleet}
          handleClose={handleAddFleetPopupClose}
          fetchData={fetchData}
          currentUserId={currentUserId}
          mode={mode}
          editFleetData={editFleetData}
        />
      </Grid>
    </Container>
  );
};

export default FleetList;
