import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Container, Box, Divider } from '@mui/material';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../../redux/trips/tripsSlice';
import InsuranceTable from './insurance-list';
import EditInsuranceDialog from './edit-popup';
import { getAdminInsurance } from '../../../services/admin/adminInsuranceServices';

const InsuranceProvider: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [insuranceInformation, setInsuranceInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [isEditPopupOpen, setEditPopupOpen] = useState<any>(false);
  const [mode, setMode] = useState<any>('edit');
  const [editInsuranceData, setEditInsuranceData] = useState<any>(null);

  const itemsPerPage = 10;
  const lonestarId = useSelector((state: any) => state?.auth?.userData?.currentLonestarId);
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const requestBody: any = {
          currentLoggedInUserId: currentUserId,
          isInsured: 'true',
          ...params,
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && {
            ...searchParams,
          }),
        };

        const { data } = await getAdminInsurance(page, itemsPerPage, requestBody);
        setInsuranceInformation(data);
      } catch (error) {
        console.error('Error fetching user information:', error);
        setInsuranceInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, itemsPerPage, filterCriteria, sortParams, searchParams]
  );
  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

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
    // fetchData(1);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParams(searchQueries);
    setCurrentPage(1);
  };

  const handleCloseEditPopup = () => {
    setEditPopupOpen(false);
  };

  const handleEditInsurance = (user: any) => {
    setMode('edit');
    setEditInsuranceData(user);
    setEditPopupOpen(true);
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
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />

                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  leftText="Insurance Providers"
                  isInsurance={true}
                />

                {loading ? (
                  <LoadingScreen />
                ) : (
                  <InsuranceTable
                    insuranceInformation={insuranceInformation}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onSort={handleSort}
                    currentPage={currentPage}
                    filterCriteria={filterCriteria}
                    searchQueries={searchQueries}
                    setSearchQueries={setSearchQueries}
                    setSortColumn={setSortColumn}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    onEditInsurer={handleEditInsurance}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <EditInsuranceDialog
          open={isEditPopupOpen}
          handleClose={handleCloseEditPopup}
          mode={mode}
          currentUserId={currentUserId}
          editInsuranceData={editInsuranceData}
          fetchData={fetchData}
          setCurrentPage={setCurrentPage}
        />
      </Grid>
    </Container>
  );
};

export default InsuranceProvider;
