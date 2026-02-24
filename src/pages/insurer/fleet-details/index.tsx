import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Container, Grid } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import FleetDetailsHeader from './fleet-details-header';
import { FilterList } from '@mui/icons-material';
import { getFleetDetailsByLonestarId, getFleetStatsByLonestarId } from '../../../services/insurer/IdashboardService';
import InsurerFleet from './insurer-fleet';
import FleetOverview from './fleet-overview-card';
import FleetVehicles from './fleet-vehicles';
import FleetDocuments from './fleet-documents';
import { getVehiclesList } from '../../../services/fleetManager/vehiclesService';
import FleetTrips from './fleet-trips';
import { getDriverList } from '../../../services/fleetManager/driverServices';
import FleetDrivers from './fleet-drivers';
import { FilterVehicleDialog } from '../../../components/modals/filter-insurer-vehicle';
import { useDispatch, useSelector } from 'react-redux';
import { FilterListDialog } from '../../../components/modals/filter-insurer-trips';
import { FilterDriverDialog } from '../../../components/modals/filter-insurer-driver';
import { getFleetTrips } from '../../../services/fleetManager/tripsService';
import UploadDocumentModal from './upload-document';
import { getDocuments } from '../../../services/fleetManager/documentServices';

import {
  clearFilterCriteria as clearVehicleFilterCriteria,
  selectFilterCriteria as selectVehicleFilterCriteria,
  setFilterCriteria as setVehicleFilterCriteria,
} from '../../../redux/vehicles/vehicleSlice';

import {
  clearFilterCriteria as clearDriverFilterCriteria,
  selectFilterCriteria as selectDriverFilterCriteria,
  setFilterCriteria as setDriverFilterCriteria,
} from '../../../redux/drivers/driversSlice';

import {
  clearFilterCriteria as clearTripFilterCriteria,
  selectFilterCriteria as selectTripFilterCriteria,
  setFilterCriteria as setTripFilterCriteria,
} from '../../../redux/trips/tripsSlice';
import FleetPersonnel from './fleet-personnel';
import UPLOAD from '../../../assets/icons/upload.png';

const itemsPerPage = 6;
const MAX_RECORDS = 50000;

interface DocumentData {
  documentName: string;
  documentType: string;
  documentLink: string;
  file?: File;
}

const FleetDetails: React.FC = () => {
  const dispatch = useDispatch();

  const TripFilterCriteria = useSelector(selectTripFilterCriteria);
  const VehicleFilterCriteria = useSelector(selectVehicleFilterCriteria);
  const DriverFilterCriteria = useSelector(selectDriverFilterCriteria);

  const [TripsInformation, setTripsInformation] = useState<any>([]);
  const [vehiclesInformation, setVehiclesInformation] = useState<any>([]);
  const [driversInformation, setDriversInformation] = useState<any>([]);
  const [documentsInformation, setDocumentsInformation] = useState<any>([]);
  const [allDocuments, setAllDocuments] = useState<any>([]);

  const [FleetPersonnelData, setFleetPersonnelData] = useState<any>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const { fleetId } = useParams<{ fleetId: string }>();

  const [FleetDetails, setFleetDetails] = useState<any>([]);
  const [lonestarId, setLonestarId] = useState<any>('');
  const [fleetStats, setFleetStats] = useState<any>([]);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterCriteria, setFilterCriteria] = useState<any>(null);

  const { state } = useLocation();

  const getStorageKey = () => `activeTab_${fleetId}`;
  const initialTab = fleetId ? sessionStorage.getItem(getStorageKey()) || 'vehicles' : 'vehicles';

  const [activeTab, setActiveTab] = useState<'trips' | 'drivers' | 'vehicles' | 'personnel' | 'documents'>(
    initialTab as any
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (fleetId) {
      sessionStorage.setItem(getStorageKey(), activeTab);
    }
  }, [activeTab, fleetId]);

  useEffect(() => {
    if (fleetId) {
      const savedTab = sessionStorage.getItem(getStorageKey());
      if (savedTab) {
        setActiveTab(savedTab as any);
      } else {
        setActiveTab('vehicles');
      }
    }
  }, [fleetId]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParams(searchQueries);
    setCurrentPage(1);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  //vehicle
  const fetchVehicleData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const vehicleStatuses: string[] = [];
        if (VehicleFilterCriteria?.active) vehicleStatuses.push('Started');
        if (VehicleFilterCriteria?.inactive) vehicleStatuses.push('Completed');

        const requestBody: any = {
          ...params,
          ...(VehicleFilterCriteria?.scoreRange && { vehicleScoreRange: VehicleFilterCriteria?.scoreRange }),
          ...(vehicleStatuses?.length > 0 && { vehicleStatuses }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && { ...searchParams }),
          ...(searchParams?.meanScore && { safetyScore: searchParams?.meanScore }),
          ...(searchParams.tagLicencePlateNumber && { licencePlateNumber: searchParams.tagLicencePlateNumber }),
        };
        if (searchParams?.meanScore) {
          delete requestBody.meanScore;
        }

        const { data } = await getVehiclesList(lonestarId, page, itemsPerPage, requestBody);
        setVehiclesInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setVehiclesInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, VehicleFilterCriteria, sortParams, searchParams]
  );

  useEffect(() => {
    if (lonestarId) {
      fetchVehicleData(currentPage);
    }
  }, [currentPage, fetchVehicleData, lonestarId]);

  const fetchDriversData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);

      try {
        const vehicleStatus = DriverFilterCriteria?.active
          ? 'assigned'
          : DriverFilterCriteria?.inactive
          ? 'unassigned'
          : undefined;

        const requestBody: any = {
          ...params,
          ...(DriverFilterCriteria?.scoreRange && { driverScoreRange: DriverFilterCriteria?.scoreRange }),
          ...(vehicleStatus && { vehicleStatus }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && { ...searchParams }),
        };

        const { data, status } = await getDriverList(lonestarId, page, itemsPerPage, requestBody);
        setDriversInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setDriversInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, itemsPerPage, DriverFilterCriteria, sortParams, searchParams]
  );

  useEffect(() => {
    if (lonestarId) {
      fetchDriversData(currentPage);
    }
  }, [currentPage, fetchDriversData, lonestarId]);

  const fetchFleetDetails = useCallback(async () => {
    try {
      const { data } = await getFleetDetailsByLonestarId(fleetId);
      setFleetDetails(data);
      setLonestarId(data?.lonestarId);
      setFleetPersonnelData(data?.lookup_users);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, [fleetId]);

  const fetchFleetStats = useCallback(async () => {
    try {
      const { data } = await getFleetStatsByLonestarId(fleetId);
      setFleetStats(data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  }, [fleetId]);

  useEffect(() => {
    fetchFleetDetails();
  }, [fetchFleetDetails]);

  useEffect(() => {
    fetchFleetStats();
  }, [fetchFleetStats]);

  ////trips

  console.log('Trips filter criteria : ', TripFilterCriteria);

  const fetchTripData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const convertedTripDistance = searchParams.tripDistance
          ? parseFloat((searchParams.tripDistance * 1.609344).toString())
          : undefined;

        const requestBody: any = {
          ...params,
          ...(TripFilterCriteria?.toDate && { toDate: TripFilterCriteria?.toDate }),
          ...(TripFilterCriteria?.fromDate && { fromDate: TripFilterCriteria?.fromDate }),
          ...(TripFilterCriteria.scoreRange && { tripScoreRange: TripFilterCriteria.scoreRange }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && { ...searchParams }),
          ...(searchParams.tripDistance && { tripDistance: convertedTripDistance }),
          ...(searchParams.startDate && { fromDate: searchParams.startDate }),
          ...(searchParams.endDate && { toDate: searchParams.endDate }),
        };

        const { data } = await getFleetTrips(lonestarId, page, itemsPerPage, requestBody);
        setTripsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setTripsInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, sortParams, searchParams, TripFilterCriteria]
  );

  useEffect(() => {
    if (lonestarId) {
      fetchTripData(currentPage);
    }
  }, [currentPage, fetchTripData, lonestarId]);

  const fetchFleetDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const { data } = await getDocuments(lonestarId);
      const fleetDocs = data?.fleetDocuments || [];
      setDocumentsInformation(fleetDocs);

      if (fleetDocs.length < MAX_RECORDS) {
        setAllDocuments(fleetDocs);
      } else {
        setAllDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching fleet documents:', error);
      setDocumentsInformation([]);
      setAllDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [lonestarId]);

  useEffect(() => {
    if (lonestarId) {
      fetchFleetDocuments();
    }
  }, [fetchFleetDocuments, lonestarId]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'trips':
        return (
          <FleetTrips
            tripsInformation={TripsInformation}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onSort={handleSort}
            currentPage={currentPage}
            searchQueries={searchQueries}
            setSearchQueries={setSearchQueries}
            setSortColumn={setSortColumn}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            filterCriteria={filterCriteria}
            setFilterCriteria={setFilterCriteria}
            fleetName={state?.name}
            fleetId={fleetId}
            insuredId={state?.insuredId}
          />
        );
      case 'drivers':
        return (
          <FleetDrivers
            driversInformation={driversInformation}
            onPageChange={handlePageChange}
            fetchData={fetchDriversData}
            filterCriteria={filterCriteria}
            currentPage={currentPage}
            searchQueries={searchQueries}
            setSearchQueries={setSearchQueries}
            setSortColumn={setSortColumn}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onSearch={handleSearch}
            onSort={handleSort}
          />
        );
      case 'vehicles':
        return (
          <FleetVehicles
            vehiclesInformation={vehiclesInformation}
            onPageChange={handlePageChange}
            fetchData={fetchVehicleData}
            filterCriteria={filterCriteria}
            currentPage={currentPage}
            searchQueries={searchQueries}
            setSearchQueries={setSearchQueries}
            setSortColumn={setSortColumn}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onSearch={handleSearch}
            onSort={handleSort}
          />
        );

      case 'personnel':
        return (
          <FleetPersonnel
            personnelInformation={FleetPersonnelData}
            onPageChange={handlePageChange}
            fetchData={() => {}}
          />
        );
      case 'documents':
        return (
          <FleetDocuments
            documentsInformation={documentsInformation}
            documentsList={allDocuments}
            // onPageChange={handlePageChange}
            fetchData={fetchFleetDocuments}
            lonestarId={lonestarId}
          />
        );
      default:
        return null;
    }
  };

  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handleFilterApply = (filters: any) => {
    switch (activeTab) {
      case 'vehicles':
        dispatch(setVehicleFilterCriteria(filters));
        break;
      case 'drivers':
        dispatch(setDriverFilterCriteria(filters));
        break;
      case 'trips':
        dispatch(setTripFilterCriteria(filters));
        break;
    }
  };

  const handleClearFilter = () => {
    switch (activeTab) {
      case 'vehicles':
        dispatch(clearVehicleFilterCriteria());
        break;
      case 'drivers':
        dispatch(clearDriverFilterCriteria());
        break;
      case 'trips':
        dispatch(clearTripFilterCriteria());
        break;
    }
  };

  const renderFilterDialog = () => {
    switch (activeTab) {
      case 'vehicles':
        return (
          <FilterVehicleDialog
            filterPopupOpen={filterPopupOpen}
            filterButtonPosition={filterButtonPosition}
            handleFilterPopupClose={handleFilterPopupClose}
            onApplyFilter={handleFilterApply}
            onClearFilter={handleClearFilter}
          />
        );
      case 'drivers':
        return (
          <FilterDriverDialog
            filterPopupOpen={filterPopupOpen}
            filterButtonPosition={filterButtonPosition}
            handleFilterPopupClose={handleFilterPopupClose}
            onApplyFilter={handleFilterApply}
            onClearFilter={handleClearFilter}
          />
        );
      case 'trips':
        return (
          <FilterListDialog
            filterPopupOpen={filterPopupOpen}
            filterButtonPosition={filterButtonPosition}
            handleFilterPopupClose={handleFilterPopupClose}
            onApplyFilter={handleFilterApply}
            onClearFilter={handleClearFilter}
          />
        );
      default:
        return null;
    }
  };

  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const dialogHeight = 350;

    if (spaceBelow < dialogHeight + 100) {
      setFilterButtonPosition({
        top: buttonRect.top - dialogHeight,
        left: buttonRect.left,
      });
    } else {
      setFilterButtonPosition({
        top: buttonRect.bottom,
        left: buttonRect.left,
      });
    }
    setFilterPopupOpen(true);
  };

  return (
    <>
      <Box
        mb={4}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FleetDetailsHeader vin={fleetId} state={state} />
      </Box>
      <Container maxWidth={false}>
        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item md={12}>
            <FleetOverview fleetId={fleetId} state={state} fleetStats={fleetStats} />
          </Grid>
          <Grid item xs={12}>
            <InsurerFleet lonestarId={lonestarId} />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ marginTop: 5 }}>
          <Grid item md={12} id="vehicle-trip-details" sx={{ width: '80vw' }}>
            <Box
              sx={{
                borderTop: '1px solid #ccc',
                marginTop: 1,
                marginBottom: 2,
                backgroundColor: '#fff',
                borderRadius: '10px',
                width: '100%',
              }}
            >
              <Grid container sx={{ height: '50px' }}>
                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={activeTab === 'vehicles' ? 'contained' : 'outlined'}
                      sx={{ width: '150px', textTransform: 'none' }}
                      onClick={() => setActiveTab('vehicles')}
                    >
                      Vehicles
                    </Button>

                    <Button
                      variant={activeTab === 'drivers' ? 'contained' : 'outlined'}
                      sx={{ width: '150px', textTransform: 'none' }}
                      onClick={() => setActiveTab('drivers')}
                    >
                      Drivers
                    </Button>
                    <Button
                      variant={activeTab === 'personnel' ? 'contained' : 'outlined'}
                      sx={{ width: '150px', textTransform: 'none' }}
                      onClick={() => setActiveTab('personnel')}
                    >
                      Fleet Personnel
                    </Button>
                    <Button
                      variant={activeTab === 'trips' ? 'contained' : 'outlined'}
                      sx={{ width: '150px', textTransform: 'none' }}
                      onClick={() => setActiveTab('trips')}
                    >
                      Trips
                    </Button>
                    <Button
                      variant={activeTab === 'documents' ? 'contained' : 'outlined'}
                      sx={{ width: '150px', textTransform: 'none' }}
                      onClick={() => setActiveTab('documents')}
                    >
                      Documents
                    </Button>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={8}
                  sx={{
                    padding: 1,
                    justifyContent: 'flex-end',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {activeTab === 'documents' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ mr: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ textTransform: 'none' }}
                          onClick={() => setUploadModalOpen(true)}
                        >
                          <img src={UPLOAD} alt="Upload Icon" style={{ width: 20, height: 20, marginRight: 8 }} />
                          Upload
                        </Button>
                      </Box>
                    </Box>
                  ) : activeTab !== 'personnel' ? (
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      sx={{ textTransform: 'none', mr: 2 }}
                      onClick={handleFilterIconClick}
                    >
                      Filters
                    </Button>
                  ) : null}
                </Grid>
              </Grid>
              {renderActiveComponent()}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {renderFilterDialog()}

      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        lonestarId={lonestarId}
        fetchData={fetchFleetDocuments}
      />
    </>
  );
};

export default FleetDetails;
