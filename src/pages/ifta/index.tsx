import { Box, Button, Card, CardContent, Container, Divider, Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddDeviceDialog from '../../components/modals/add-device-dialog';
import { FilterListDialog } from '../../components/modals/filter-insurer-trips';
import LoadingScreen from '../../components/molecules/loading-screen';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/vehicles/vehicleSlice';
import FileUploadDialog from '../../components/modals/file-upload-dialog-driver';
import { toast } from 'react-toastify';
import {
  getIftaFuelTrans,
  getIftaMileageReport,
  getIftaTemplateUrl,
  uploadIftaFile,
  downloadIftaFuelTrans,
  downloadIftaMileageReport,
} from '../../services/fleetManager/iftaService';
import FuelTransactionListTable from './fuel-list-table';
import debounce from 'lodash/debounce';
import { Dayjs } from 'dayjs';
import ValidationErrorModal from '../../components/modals/ifta-validation-errors';
import MileageListTable from './mileage-list-table';

const Ifta: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);

  const [fuelTransInformation, setFuelTransInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [selectedButton, setSelectedButton] = useState<'mileage' | 'fuel'>('mileage');

  const [currentFuelPage, setCurrentFuelPage] = useState(1);
  const [fuelLoading, setFuelLoading] = useState<any>(false);
  const [sortFuelParams, setSortFuelParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchFuelParams, setSearchFuelParams] = useState<any>({});
  const [searchFuelQueries, setSearchFuelQueries] = useState<any>({});
  const [sortFuelColumn, setSortFuelColumn] = useState<string>('');
  const [sortFuelDirection, setSortFuelDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [dateCriteria, setDateCriteria] = useState<any>(null);

  const [mileageInformation, setMileageInformation] = useState<any>(null);
  const [currentMileagePage, setCurrentMileagePage] = useState(1);
  const [mileageLoading, setMileageLoading] = useState<any>(false);
  const [sortMileageParams, setSortMileageParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchMileageParams, setSearchMileageParams] = useState<any>({});
  const [searchMileageQueries, setSearchMileageQueries] = useState<any>({});
  const [sortMileageColumn, setSortMileageColumn] = useState<string>('');
  const [sortMileageDirection, setSortMileageDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [localMileageQueries, setLocalMileageQueries] = useState<Record<string, any>>({});
  const [dateMileageCriteria, setDateMileageCriteria] = useState<any>(null);

  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState<any>(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [segmentControlKey, setSegmentControlKey] = useState(0);

  const itemsPerPage = 10;

  const debouncedSearch: any = useCallback(
    debounce((queries: any) => {
      setLocalSearchQueries(queries);
    }, 1000),
    [setLocalSearchQueries]
  );

  useEffect(() => {
    setDateCriteria(null);
    setCurrentFuelPage(1);
    setCurrentMileagePage(1);
    setSearchFuelQueries({});
    setSearchMileageQueries({});
    setLocalSearchQueries({});
    setLocalMileageQueries({});
    setSearchFuelParams({});
    setSearchMileageParams({});
    setSortFuelParams({});
    setSortMileageParams({});
    setSortFuelColumn('');
    setSortMileageColumn('');
    setSortFuelDirection('ASC');
    setSortMileageDirection('ASC');

    setSegmentControlKey((prev) => prev + 1);

    dispatch(clearFilterCriteria());

    console.log('Tab changed to:', selectedButton, 'All filters reset');
  }, [selectedButton, dispatch]);

  const convertToEpochTimestamp = (date: Dayjs | null): number | null => {
    return date ? date.valueOf() : null;
  };

  const fetchFuelTransactions = useCallback(async (): Promise<void> => {
    setFuelLoading(true);
    try {
      const requestBody: any = {
        ...(dateCriteria?.toDate && { toDate: dateCriteria?.toDate?.format('MM/DD/YYYY') }),
        ...(dateCriteria?.fromDate && { fromDate: dateCriteria?.fromDate?.format('MM/DD/YYYY') }),
        ...(sortFuelParams.key && {
          sortKey: sortFuelParams.key,
          sortOrder: sortFuelParams.order,
        }),
        ...(searchFuelParams && { ...searchFuelParams }),
      };

      const response = await getIftaFuelTrans(lonestarId, currentFuelPage, itemsPerPage, requestBody);
      setFuelTransInformation(response.data);
      console.log('Fuel transactions fetched:', response?.data);
    } catch (error) {
      console.error('Error fetching fuel transactions:', error);
      setFuelTransInformation([]);
    } finally {
      setFuelLoading(false);
    }
  }, [
    dateCriteria?.toDate,
    dateCriteria?.fromDate,
    sortFuelParams.key,
    sortFuelParams.order,
    searchFuelParams,
    lonestarId,
    currentFuelPage,
  ]);

  const fetchMileageReport = useCallback(async (): Promise<void> => {
    setMileageLoading(true);
    try {
      const requestBody: any = {
        ...(dateCriteria?.toDate && { toDate: convertToEpochTimestamp(dateCriteria.toDate) }),
        ...(dateCriteria?.fromDate && { fromDate: convertToEpochTimestamp(dateCriteria.fromDate) }),
        ...(sortMileageParams.key && {
          sortKey: sortMileageParams.key,
          sortOrder: sortMileageParams.order,
        }),
        ...(searchMileageParams && { ...searchMileageParams }),
      };

      const response = await getIftaMileageReport(lonestarId, currentMileagePage, itemsPerPage, requestBody);
      setMileageInformation(response.data);
      console.log('Mileage report fetched:', response?.data);
    } catch (error) {
      console.error('Error fetching mileage report:', error);
      setMileageInformation([]);
    } finally {
      setMileageLoading(false);
    }
  }, [
    dateCriteria?.toDate,
    dateCriteria?.fromDate,
    sortMileageParams.key,
    sortMileageParams.order,
    searchMileageParams,
    lonestarId,
    currentMileagePage,
  ]);

  useEffect(() => {
    if (selectedButton === 'fuel') {
      fetchFuelTransactions();
    }
  }, [fetchFuelTransactions, selectedButton]);

  useEffect(() => {
    if (selectedButton === 'mileage') {
      fetchMileageReport();
    }
  }, [fetchMileageReport, selectedButton]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleOpenFileUpload = () => setFileUploadDialogOpen(true);
  const handleCloseFileUpload = () => setFileUploadDialogOpen(false);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      for (const file of files) {
        const documentType = 'BulkUploadIftaFuelTxnDetails';
        const response = await uploadIftaFile(lonestarId, file, documentType, currentUserId);

        console.log('response >> ', response);

        if (response.status === 202) {
          if (response.data.validationErrorMap && Object.keys(response.data.validationErrorMap).length > 0) {
            setValidationErrors(response.data.validationErrorMap);
            setValidationErrorModalOpen(true);
          }

          if (response?.data?.numberOfRecordsCreated && response?.data?.numberOfRecordsCreated > 0) {
            toast.success('Fuel Transactions File uploaded successfully');
          }
        } else if (response.status === 200 || response.status === 202) {
          toast.success('Fuel Transactions File uploaded successfully ');
        }
      }
      fetchFuelTransactions();
      setFileUploadDialogOpen(false);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.details || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDownload = async (fileType: string) => {
    try {
      const { status, data } = await getIftaTemplateUrl(fileType);
      window.open(data?.signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(error.message || 'Failed to download file');
    }
  };

  const handleFuelTransactionDownload = async (fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    if (!currentUserId) {
      toast.error('User ID not found. Please try logging in again.');
      return;
    }

    setIsDownloading(true);
    try {
      const mimeTypeMap = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        pdf: 'application/pdf',
      };

      const mimeType = mimeTypeMap[fileType];
      if (!mimeType) {
        throw new Error('Invalid file type. Supported types: xlsx, csv');
      }

      const requestBody: any = {
        ...(dateCriteria?.toDate && { toDate: dateCriteria?.toDate?.format('MM/DD/YYYY') }),
        ...(dateCriteria?.fromDate && { fromDate: dateCriteria?.fromDate?.format('MM/DD/YYYY') }),
        ...(sortFuelParams.key && {
          sortKey: sortFuelParams.key,
          sortOrder: sortFuelParams.order,
        }),
        ...(searchFuelParams && { ...searchFuelParams }),
        currentLoggedInUserId: currentUserId,
        fileType: mimeType,
      };

      const queryParams = new URLSearchParams({
        limit: '500',
      });

      const response = await downloadIftaFuelTrans(lonestarId, requestBody, queryParams.toString());

      if (response?.status === 200 && response?.data?.signedUrl) {
        const fileResponse = await fetch(response.data.signedUrl);

        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);

        // ✅ Consistent filename format
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = `${year}_${month}_${day}`;
        const filename = `IFTA_Fuel_Transactions_${timestamp}.${fileType}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        toast.success('Fuel transaction report download successful');
      } else {
        throw new Error('Download URL not received from server');
      }
    } catch (error: any) {
      console.error('Error downloading fuel transactions:', error);

      if (error.response?.status === 400 && error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download fuel transaction report');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMileageReportDownload = async (fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    if (!currentUserId) {
      toast.error('User ID not found. Please try logging in again.');
      return;
    }

    setIsDownloading(true);
    try {
      const requestBody: any = {
        ...(dateCriteria?.toDate && { toDate: convertToEpochTimestamp(dateCriteria.toDate) }),
        ...(dateCriteria?.fromDate && { fromDate: convertToEpochTimestamp(dateCriteria.fromDate) }),
        ...(sortMileageParams.key && {
          sortKey: sortMileageParams.key,
          sortOrder: sortMileageParams.order,
        }),
        ...(searchMileageParams && { ...searchMileageParams }),
      };

      const response = await downloadIftaMileageReport(lonestarId, currentUserId, fileType, 500, requestBody);

      if (response?.status === 200 && response?.data?.signedUrl) {
        const fileResponse = await fetch(response.data.signedUrl);

        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);

        // ✅ Consistent filename format
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = `${year}_${month}_${day}`;
        const filename = `IFTA_Mileage_Report_${timestamp}.${fileType}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        toast.success('Mileage report download successful');
      } else {
        throw new Error('Download URL not received from server');
      }
    } catch (error: any) {
      console.error('Error downloading mileage report:', error);

      if (error.response?.status === 400 && error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download mileage report');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExport = (fileType: 'xlsx' | 'csv' | 'pdf') => {
    if (selectedButton === 'fuel') {
      handleFuelTransactionDownload(fileType);
    } else if (selectedButton === 'mileage') {
      handleMileageReportDownload(fileType);
    }
  };

  const handleUnassignedPageChange = (newPage: number) => {
    setCurrentFuelPage(newPage);
  };

  const handleMileagePageChange = (newPage: number) => {
    setCurrentMileagePage(newPage);
  };

  const handleUnassignedSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortFuelParams(newSortParams);
  };

  const handleMileageSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortMileageParams(newSortParams);
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
    setCurrentFuelPage(1);
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentFuelPage(1);
    fetchFuelTransactions();
  };

  const handleAddDeviceClose = () => {
    setOpenAddDevice(false);
  };

  const handleUnassignedDevicesClick = () => {
    setSelectedButton('fuel');
  };

  const handleMileageClick = () => {
    setSelectedButton('mileage');
  };

  const handleFuelSearch = (searchQueries: any) => {
    setSearchFuelParams(searchQueries);
    setCurrentFuelPage(1);
  };

  const handleMileageSearch = (searchQueries: any) => {
    setSearchMileageParams(searchQueries);
    setCurrentMileagePage(1);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    console.log('Date range changed:', dates);
    if (dates && dates[0] && dates[1]) {
      setDateCriteria({
        fromDate: dates[0],
        toDate: dates[1],
      });
    } else {
      setDateCriteria(null);
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
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0', fontSize: '0.875rem' }}>
                <Divider />
                <SegmentControlDesktop
                  key={segmentControlKey} // Force re-render when tab changes
                  handleFilterIconClick={handleFilterIconClick}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'mileage' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                        onClick={handleMileageClick}
                      >
                        Mileage Report
                      </Button>
                      <Button
                        variant={selectedButton === 'fuel' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                        onClick={handleUnassignedDevicesClick}
                      >
                        Fuel Transaction
                      </Button>
                    </Box>
                  }
                  isIfta={true}
                  selectedButton={selectedButton}
                  onFileUploadClick={handleOpenFileUpload}
                  localSearchQueries={localSearchQueries}
                  handleDateRangeChange={handleDateRangeChange}
                  handleExport={handleExport}
                  isDownloading={isDownloading}
                  dateCriteria={dateCriteria} // Pass dateCriteria explicitly if needed
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'mileage' && (
                      <MileageListTable
                        mileageInformation={mileageInformation}
                        onPageChange={handleMileagePageChange}
                        onSearch={handleMileageSearch}
                        onSort={handleMileageSort}
                        currentPage={currentMileagePage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchMileageQueries}
                        setSearchQueries={setSearchMileageQueries}
                        setSortColumn={setSortMileageColumn}
                        sortColumn={sortMileageColumn}
                        sortDirection={sortMileageDirection}
                        setSortDirection={setSortMileageDirection}
                        fetchData={fetchMileageReport}
                      />
                    )}
                    {selectedButton === 'fuel' && (
                      <FuelTransactionListTable
                        fuelTransInformation={fuelTransInformation}
                        onPageChange={handleUnassignedPageChange}
                        onSearch={handleFuelSearch}
                        onSort={handleUnassignedSort}
                        currentPage={currentFuelPage}
                        filterCriteria={filterCriteria}
                        searchQueries={searchFuelQueries}
                        setSearchQueries={setSearchFuelQueries}
                        setSortColumn={setSortFuelColumn}
                        sortColumn={sortFuelColumn}
                        sortDirection={sortFuelDirection}
                        setSortDirection={setSortFuelDirection}
                        fetchData={fetchFuelTransactions}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterListDialog
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
          isIfta={true}
        />
        <AddDeviceDialog open={openAddDevice} handleClose={handleAddDeviceClose} isMobile={false} />
        <ValidationErrorModal
          open={validationErrorModalOpen}
          onClose={() => setValidationErrorModalOpen(false)}
          validationErrors={validationErrors}
        />
      </Grid>
    </Container>
  );
};

export default Ifta;
