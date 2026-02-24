import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DriversListTable from './drivers-list-table';
import { toast } from 'react-toastify';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../../redux/admin/drivers/driverSlice';
import { deleteDriver } from '../../../services/fleetManager/driverServices';
import SegmentControlDesktop from '../../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../../components/molecules/loading-screen';
import { getDriverList } from '../../../services/admin/adminDriversService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DriversUninsuredListTable from './drivers-uninsured-table';
import { FilterAdminDriverDialog } from '../../../components/modals/filter-admin-driver-dialog';
import {
  addUserFromAdmin,
  deleteUserFromAdmin,
  editUserFromAdmin,
  getOrganizations,
} from '../../../services/admin/userMangementService';
import AddEditDriverModal from './add-drivers-admin';
import dayjs from 'dayjs';
import LinkDriverModal from './link-driver-modal';
import ValidationErrorModal from '../../../components/modals/driver-validation-erros';
import { getFleetDetailsAdmin } from '../../../services/admin/fleetServices';

const DriversList: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const getInitialSelectedButton = (): 'insuredFleet' | 'uninsuredFleet' => {
    const view = searchParams.get('view');
    return view === 'uninsuredFleet' || view === 'insuredFleet' ? view : 'insuredFleet';
  };
  const [selectedButton, setSelectedButton] = useState<'insuredFleet' | 'uninsuredFleet'>(getInitialSelectedButton);

  const subscriptionId = selectedButton === 'insuredFleet' ? 'SUB0001' : 'SUB0002';
  const itemsPerPage = 10;
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const [fleetOptions, setFleetOptions] = useState<any[]>([]);
  const [insurerOptions, setInsurerOptions] = useState<any[]>([]);

  const [driversInformation, setDriversInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddDriver, setOpenAddDriver] = useState(false);
  const [editDriverData, setEditDriverData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'edit' | 'link'>('add');

  const [insuredLoading, setInsuredLoading] = useState<boolean>(false);
  const [uninsuredLoading, setUninsuredLoading] = useState<boolean>(false);

  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [uninsuredDriversInformation, setUninsuredDriversInformation] = useState<any>(null);
  const [currentUninsuredPage, setCurrentUninsuredPage] = useState(1);
  const [sortUninsuredParams, setSortUninsuredParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchUninsuredParams, setSearchUninsuredParams] = useState<any>({});
  const [searchUninsuredQueries, setSearchUninsuredQueries] = useState<any>({});
  const [sortUninsuredColumn, setSortUninsuredColumn] = useState<string>('');
  const [sortUninsuredDirection, setSortUninsuredDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});

  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openLinkModal, setOpenLinkModal] = useState(false);

  // Add refs to track if search is user-initiated
  const isUserSearchRef = useRef(false);
  const isUserUninsuredSearchRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const fetchInsuredData = useCallback(
    async (page: number, params: any = {}) => {
      setInsuredLoading(true);

      try {
        const vehicleStatus =
          filterCriteria?.assignmentStatus?.assigned && !filterCriteria?.assignmentStatus?.unassigned
            ? 'assigned'
            : !filterCriteria?.assignmentStatus?.assigned && filterCriteria?.assignmentStatus?.unassigned
            ? 'unassigned'
            : undefined;

        const requestBody: any = {
          subscriptionId,
          ...params,
          ...(filterCriteria?.scoreRange &&
            (filterCriteria?.scoreRange[0] !== 0 || filterCriteria?.scoreRange[1] !== 100) && {
              driverScoreRange: filterCriteria?.scoreRange,
            }),
          ...(filterCriteria?.eventsCountRange &&
            (filterCriteria?.eventsCountRange[0] !== 0 || filterCriteria?.eventsCountRange[1] !== 5000) && {
              eventsCountRange: filterCriteria?.eventsCountRange,
            }),
          ...(vehicleStatus && { vehicleStatus }),

          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState.meanScore && { driverScore: searchParamsState.meanScore }),
        };

        const { data, status } = await getDriverList(page, itemsPerPage, requestBody);
        setDriversInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDriversInformation([]);
      } finally {
        setInsuredLoading(false);
      }
    },
    [itemsPerPage, filterCriteria, sortParams, searchParamsState, subscriptionId]
  );

  const fetchUninsuredData = useCallback(
    async (page: number, params: any = {}) => {
      setUninsuredLoading(true);

      try {
        const vehicleStatus =
          filterCriteria?.assignmentStatus?.assigned && !filterCriteria?.assignmentStatus?.unassigned
            ? 'assigned'
            : !filterCriteria?.assignmentStatus?.assigned && filterCriteria?.assignmentStatus?.unassigned
            ? 'unassigned'
            : undefined;

        const requestBody: any = {
          subscriptionId,
          ...params,
          ...(filterCriteria?.scoreRange &&
            (filterCriteria?.scoreRange[0] !== 0 || filterCriteria?.scoreRange[1] !== 100) && {
              driverScoreRange: filterCriteria?.scoreRange,
            }),
          ...(filterCriteria?.eventsCountRange &&
            (filterCriteria?.eventsCountRange[0] !== 0 || filterCriteria?.eventsCountRange[1] !== 5000) && {
              eventsCountRange: filterCriteria?.eventsCountRange,
            }),
          ...(vehicleStatus && { vehicleStatus }),
          ...(sortUninsuredParams.key && {
            sortKey: sortUninsuredParams.key,
            sortOrder: sortUninsuredParams.order,
          }),
          ...(searchUninsuredParams && { ...searchUninsuredParams }),
          ...(searchUninsuredParams.meanScore && { driverScore: searchUninsuredParams.meanScore }),
        };

        const { data, status } = await getDriverList(page, itemsPerPage, requestBody);
        setUninsuredDriversInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setUninsuredDriversInformation([]);
      } finally {
        setUninsuredLoading(false);
      }
    },
    [itemsPerPage, filterCriteria, sortUninsuredParams, searchUninsuredParams, subscriptionId]
  );

  useEffect(() => {
    const view = searchParams.get('view') || 'insuredFleet';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (view === 'insuredFleet') {
      setSelectedButton('insuredFleet');
      setCurrentPage(page);
      fetchInsuredData(page, searchParamsState);
    } else if (view === 'uninsuredFleet') {
      setSelectedButton('uninsuredFleet');
      setCurrentUninsuredPage(page);
      fetchUninsuredData(page, searchUninsuredParams);
    }

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [searchParams, fetchInsuredData, fetchUninsuredData]);

  useEffect(() => {
    if (selectedButton === 'insuredFleet' && !isInitialLoadRef.current) {
      if (isUserSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'insuredFleet');
            return newParams;
          });
          isUserSearchRef.current = false;
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParamsState, selectedButton]);

  useEffect(() => {
    if (selectedButton === 'uninsuredFleet' && !isInitialLoadRef.current) {
      if (isUserUninsuredSearchRef.current) {
        const timer = setTimeout(() => {
          setCurrentUninsuredPage(1);
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('view', 'uninsuredFleet');
            return newParams;
          });
          isUserUninsuredSearchRef.current = false;
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
      newParams.set('view', 'insuredFleet');
      return newParams;
    });
  };

  const handleUninsuredPageChange = (newPage: number) => {
    setCurrentUninsuredPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      newParams.set('view', 'uninsuredFleet');
      return newParams;
    });
  };

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const fetchFleetData = useCallback(async () => {
    try {
      const requestBody: any = {
        subscriptionId,
      };

      const { data } = await getFleetDetailsAdmin(requestBody, 1, 1000);
      if (Array.isArray(data?.fleetCompanies)) {
        const fleetData = data.fleetCompanies.flatMap((fleet: any) => ({
          lonestarId: fleet.lonestarId,
          name: fleet.name,
        }));
        setFleetOptions(fleetData);
      } else {
        setFleetOptions([]);
      }
    } catch (error) {
      setFleetOptions([]);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

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
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'insuredFleet');
        return newParams;
      });
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'uninsuredFleet');
        return newParams;
      });
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    if (selectedButton === 'insuredFleet') {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'insuredFleet');
        return newParams;
      });
      fetchInsuredData(1, searchParamsState);
    } else {
      setCurrentUninsuredPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        newParams.set('view', 'uninsuredFleet');
        return newParams;
      });
      fetchUninsuredData(1, searchUninsuredParams);
    }
  };

  const handleDeleteDriverClick = async (driverData: any) => {
    try {
      const getDriverRoleMapping = (driverData: any) => {
        if (!driverData?.orgRoleAndScoreMapping || !Array.isArray(driverData?.orgRoleAndScoreMapping)) {
          return null;
        }
        return driverData.orgRoleAndScoreMapping.find((mapping: any) => mapping.role === 'driver');
      };

      const driverRoleMapping = getDriverRoleMapping(driverData);
      

      const formattedData = {
        userId: driverData?.userId,
        initials: driverData?.initials,
        firstName: driverData?.firstName,
        lastName: driverData?.lastName,
        primaryPhone: driverData?.primaryPhone,
        primaryPhoneCtryCd: driverData?.primaryPhoneCtryCd,
        emailId: driverData?.emailId,
        activeStatus: driverData?.activeStatus,
        orgRoleMappings: [
          {
            role: 'driver',
            lonestarId: driverRoleMapping?.lonestarId,
            roleUid: driverRoleMapping?.roleUid,
            action: 'delete',
          },
        ],
      };

      const { status, data } = await editUserFromAdmin(currentUserId, formattedData);

      fetchInsuredData(currentPage);
      fetchUninsuredData(currentUninsuredPage);

      if (status === 200) {
        toast.success('Driver deleted successfully');
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleSubmitDriver = async (data: any) => {
    const fleetId = data?.lonestarId;
    const orgRoleMappings =
      mode === 'edit'
        ? [
            {
              roleUid: editDriverData?.roleAndScoreMapping?.roleUid,
              role: 'driver',
              lonestarId: fleetId,
              action: 'update',
            },
          ]
        : [
            {
              role: 'driver',
              lonestarId: fleetId,
              action: 'insert',
            },
          ];

    const formattedData: any = {
      initials: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      primaryPhone: data.primaryPhoneNumber,
      primaryPhoneCtryCd: data.primaryPhoneCountryCode,
      emailId: data.email,
      activeStatus: mode === 'add' ? 'active' : data.activeStatus,
      licenseId: data.licenseId,
      licenseExpDt: data.licenseExpiryDate ? dayjs(data.licenseExpiryDate)?.format('MMMM D, YYYY') : null,
      licenseType: data.licenseType,
      licenseIssuedState: data.licenseIssuedState,
      altPhoneCtryCd: data.alternativePhoneCountryCode,
      altPhone: data.alternativePhoneNumber,
      address: data.address,
      empStartDt: data.employmentStartDate ? dayjs(data.employmentStartDate)?.format('MMMM D, YYYY') : null,
      dob: data.dateOfBirth ? dayjs(data.dateOfBirth)?.format('MMMM D, YYYY') : null,
      orgRoleMappings,
    };

    if (mode === 'edit' && editDriverData?.userId) {
      formattedData.userId = editDriverData.userId;
    }

    try {
      if (mode === 'add') {
        const { status, data: responseData } = await addUserFromAdmin(currentUserId, formattedData);
        if (status === 200) {
          toast.success(responseData?.createdUserIds[0]);
          handleAddDriverClose();
          fetchInsuredData(currentPage);
          fetchUninsuredData(currentUninsuredPage);
        } else {
          toast.error(responseData?.message);
        }
      } else if (mode === 'edit') {
        const { status, data: responseData } = await editUserFromAdmin(currentUserId, formattedData);
        if (status === 200) {
          toast.success(responseData?.createdUserIds[0]);
          handleAddDriverClose();
          fetchInsuredData(currentPage);
          fetchUninsuredData(currentUninsuredPage);
        } else {
          toast.error(responseData?.message);
        }
      }
    } catch (error: any) {
      if (
        error?.response?.data?.userValidationErrorMap &&
        Object.keys(error?.response?.data?.userValidationErrorMap).length > 0
      ) {
        setValidationErrors(error?.response?.data?.userValidationErrorMap);
        setValidationErrorModalOpen(true);
      } else {
        console.error('Error posting data: ', error);
        toast.error(error?.response?.data?.message || 'An error occurred while Adding the driver');
      }
    }
  };

  const handleUninsuredDriversClick = () => {
    if (selectedButton !== 'uninsuredFleet') {
      dispatch(clearFilterCriteria());
      setSelectedButton('uninsuredFleet');
      setCurrentUninsuredPage(1);
      setSearchParams({ view: 'uninsuredFleet', page: '1' });
    }
  };

  const handleInsuredDriversClick = () => {
    if (selectedButton !== 'insuredFleet') {
      dispatch(clearFilterCriteria());
      setSelectedButton('insuredFleet');
      setCurrentPage(1);
      setSearchParams({ view: 'insuredFleet', page: '1' });
    }
  };

  const handleAddDriverClick = () => {
    setEditDriverData(null);
    setMode('add');
    setOpenAddEditModal(true);
  };

  const handleEditDriverClick = (driverData: any) => {
    setMode('edit');
    setEditDriverData(driverData);
    setOpenAddEditModal(true);
  };

  const handleLinkDriverClick = (driverData: any) => {
    setMode('link');
    setEditDriverData(driverData);
    setOpenLinkModal(true);
  };

  const handleAddDriverClose = () => {
    setOpenAddEditModal(false);
  };

  const handleLinkDriverClose = () => {
    setOpenLinkModal(false);
  };

  const handleSearch = (searchQueries: any) => {
    isUserSearchRef.current = true;
    setSearchQueries(searchQueries);
    setSearchParamsState(searchQueries);
  };

  const handleUninsuredSearch = (searchQueries: any) => {
    isUserUninsuredSearchRef.current = true;
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
                  isAdminDriver={true}
                  onAddDriverClick={handleAddDriverClick}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'insuredFleet' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleInsuredDriversClick}
                      >
                        Drivers (Insured Fleets)
                      </Button>
                      <Button
                        variant={selectedButton === 'uninsuredFleet' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleUninsuredDriversClick}
                      >
                        Drivers (Uninsured Fleets)
                      </Button>
                    </Box>
                  }
                />
                {isLoading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'insuredFleet' && (
                      <DriversListTable
                        driversInformation={driversInformation}
                        onPageChange={handlePageChange}
                        filterCriteria={filterCriteria}
                        fetchData={fetchInsuredData}
                        onEditDriver={handleEditDriverClick}
                        onDeleteDriver={handleDeleteDriverClick}
                        onLinkDriver={handleLinkDriverClick}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchQueries={searchQueries}
                        setSearchQueries={setSearchQueries}
                        setSortColumn={setSortColumn}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        onSearch={handleSearch}
                        onSort={handleSort}
                      />
                    )}

                    {selectedButton === 'uninsuredFleet' && (
                      <DriversUninsuredListTable
                        driversInformation={uninsuredDriversInformation}
                        onPageChange={handleUninsuredPageChange}
                        filterCriteria={filterCriteria}
                        fetchData={fetchUninsuredData}
                        onEditDriver={handleEditDriverClick}
                        onDeleteDriver={handleDeleteDriverClick}
                        onLinkDriver={handleLinkDriverClick}
                        currentPage={currentUninsuredPage}
                        setCurrentPage={setCurrentUninsuredPage}
                        searchQueries={searchUninsuredQueries}
                        setSearchQueries={setSearchUninsuredQueries}
                        setSortColumn={setSortUninsuredColumn}
                        sortColumn={sortUninsuredColumn}
                        sortDirection={sortUninsuredDirection}
                        setSortDirection={setSortUninsuredDirection}
                        onSearch={handleUninsuredSearch}
                        onSort={handleUninsuredSort}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterAdminDriverDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />

        <AddEditDriverModal
          open={openAddEditModal}
          handleClose={handleAddDriverClose}
          isMobile={false}
          onSubmit={handleSubmitDriver}
          mode={mode}
          editDriverData={editDriverData}
          fleetOptions={fleetOptions}
          insurerOptions={insurerOptions}
        />

        <LinkDriverModal
          open={openLinkModal}
          handleClose={handleLinkDriverClose}
          editDriverData={editDriverData}
          fetchInsuredData={fetchInsuredData}
          fetchUninsuredData={fetchUninsuredData}
          currentPage={currentPage}
          currentUninsuredPage={currentUninsuredPage}
          currentUserId={currentUserId}
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

export default DriversList;
