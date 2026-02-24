import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Typography } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/vehicles/vehicleSlice';
import LoadingScreen from '../../components/molecules/loading-screen';
import DriversListTable from './drivers-list-table';
import {
  deleteDriver,
  getBulkUploadTemplateUrl,
  getDriverList,
  uploadDriverFile,
  editDriverUser,
} from '../../services/fleetManager/driverServices';
import { FilterDriverDialog } from '../../components/modals/filter-driver-dialog';
import AddEditDriverDialog from '../../components/modals/add-driver-dialog';
import { toast } from 'react-toastify';
import FileUploadDialog from '../../components/modals/file-upload-dialog-driver';
import ValidationErrorModal from '../../components/modals/driver-validation-erros';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DriversList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterCriteria = useSelector(selectFilterCriteria);

  const [driversInformation, setDriversInformation] = useState<any>(null);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddDriver, setOpenAddDriver] = useState(false);
  const [editDriverData, setEditDriverData] = useState<any>(null);
  const [mode, setMode] = useState<'add' | 'edit' | 'link'>('add');

  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const lonestarId = 'LS1013'; // Temporarily hardcoded

  const itemsPerPage = 10;

  const currentUserId = useSelector((state: any) => state.auth.currentUserId);

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);

      try {
        const vehicleStatus = filterCriteria?.active ? 'assigned' : filterCriteria?.inactive ? 'unassigned' : undefined;

        const requestBody: any = {
          ...params,
          ...(filterCriteria?.scoreRange &&
            (filterCriteria?.scoreRange[0] !== 0 || filterCriteria?.scoreRange[1] !== 100) && {
            driverScoreRange: filterCriteria?.scoreRange,
          }),
          ...(vehicleStatus && { vehicleStatus }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParamsState && { ...searchParamsState }),
          ...(searchParamsState.meanScore && { driverScore: searchParamsState.meanScore }),
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
    [lonestarId, itemsPerPage, filterCriteria, sortParams, searchParamsState]
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
  }, [currentPage, filterCriteria, sortParams, fetchData, searchParamsState]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
    setSearchParams({ page: '1' }, { replace: true });
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
    setSearchParams({ page: '1' }, { replace: true });
  };

  const handleDeleteDriverClick = async (driverData: any) => {
    console.log('driverDAta', driverData);
    try {
      const getRoleUidForCurrentDriver = (driverData: any) => {
        if (!driverData?.orgRoleAndScoreMapping || !Array.isArray(driverData?.orgRoleAndScoreMapping)) {
          return 'NA';
        }
        const driverRole = driverData.orgRoleAndScoreMapping.find(
          (mapping: any) => mapping.lonestarId === lonestarId && mapping.role === 'driver'
        );
        return driverRole?.roleUid || null;
      };

      const formattedData = {
        userId: driverData?.userId,
        initials: driverData?.initials,
        firstName: driverData?.firstName,
        lastName: driverData?.lastName,
        primaryPhone: driverData?.primaryPhone,
        primaryPhoneCtryCd: driverData?.primaryPhoneCtryCd,
        emailId: driverData?.emailId,
        activeStatus: mode === 'add' ? 'active' : driverData.activeStatus,
        orgRoleMappings: [
          {
            role: 'driver',
            lonestarId: lonestarId,
            roleUid: getRoleUidForCurrentDriver(driverData),
            action: 'delete',
          },
        ],
      };

      const { status, data } = await editDriverUser(currentUserId, formattedData);

      if (status === 200) {
        toast.success('Driver deleted successfully');
        fetchData(currentPage, searchParamsState);
      } else {
        toast.error(data?.message);
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleAddDriverClick = () => {
    setMode('add');
    setOpenAddDriver(true);
  };

  const handleEditDriverClick = (driverData: any) => {
    setMode('edit');
    setEditDriverData(driverData);
    setOpenAddDriver(true);
  };

  const handleLinkDriverClick = (driverData: any) => {
    setMode('link');
    setEditDriverData(driverData);
    setOpenAddDriver(true);
  };

  const handleAddDriverClose = () => {
    setOpenAddDriver(false);
    setEditDriverData(null);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' }, { replace: true });
    fetchData(1, searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleOpenFileUpload = () => setFileUploadDialogOpen(true);
  const handleCloseFileUpload = () => setFileUploadDialogOpen(false);

  const handleFileUpload = async (files: File[]) => {
    if (!lonestarId) {
      toast.error('Lonestar ID not found');
      return;
    }
    setIsUploading(true);

    try {
      for (const file of files) {
        const documentType = 'BulkUploadDriverDetails';
        const response = await uploadDriverFile(lonestarId, file, documentType, currentUserId);

        if (response.status === 202) {
          // Check if userValidationErrorMap is not empty
          if (response.data.userValidationErrorMap && Object.keys(response.data.userValidationErrorMap).length > 0) {
            setValidationErrors(response.data.userValidationErrorMap);
            setValidationErrorModalOpen(true); // Open validation popup only if there are validation errors
          }

          if (response.data.userExceptionMap && Object.keys(response.data.userExceptionMap).length > 0) {
            setValidationErrors(response.data.userExceptionMap);
            setValidationErrorModalOpen(true); // Open validation popup only if there are user exceptions
          }

          // Show toast notifications for created users
          if (response?.data?.createdUserIds && response?.data?.createdUserIds.length > 0) {
            response.data.createdUserIds.forEach((user: string) => {
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

  const handleFileDownload = async (fileType: string) => {
    try {
      const { status, data } = await getBulkUploadTemplateUrl(fileType);
      window.open(data?.signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(error.message || 'Failed to download file');
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
                  leftText="All Drivers"
                  isDriver={true}
                  onAddDriverClick={handleAddDriverClick}
                  onFileUploadClick={handleOpenFileUpload}
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <DriversListTable
                    driversInformation={driversInformation}
                    allDrivers={allDrivers}
                    onPageChange={handlePageChange}
                    filterCriteria={filterCriteria}
                    fetchData={fetchData}
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
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterDriverDialog
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
        <AddEditDriverDialog
          open={openAddDriver}
          handleClose={handleAddDriverClose}
          isMobile={false}
          fetchData={fetchData}
          currentUserId={currentUserId}
          mode={mode}
          editDriverData={editDriverData}
          currentPage={currentPage}
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
