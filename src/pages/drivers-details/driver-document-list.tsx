import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import Pagination from '../../components/molecules/pagination';
import DocumentModal from './document-modal';
import useTableDocuments from '../../common/hooks/useTableDocuments';
import { RiDownload2Line, RiShareLine } from '@remixicon/react';
import { formatDateTimeAlpha, handleDriverDocDownload } from '../../utility/utilities';
import pdfIcon from '../../assets/icons/pdf.png';
import jpgIcon from '../../assets/icons/jpg.png';
import pngIcon from '../../assets/icons/png.png';
import rejectedIcon from '../../assets/icons/rejected.png';
import approvedIcon from '../../assets/icons/approved.png';
import pendingIcon from '../../assets/icons/pending.png';
import { FilterList } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/drivers/driversSlice';
import { FilterDocumentDialog } from '../../components/modals/filter-document-dialog';
import { attestDriverDocuments, uploadDriverDocumentFile } from '../../services/fleetManager/driverServices';
import { toast } from 'react-toastify';
import RejectDocumentModal from './reject-document-modal';
import ShareDialog from '../../components/modals/share-dialog';
import { getShortUrl } from '../../services/fleetManager/shareService';
import UploadDialog from './upload-doc-dialog';

const DriverDocumentList = ({ documentsInformation, documentsList, fetchData, onPageChange, driverId }: any) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [processedDocuments, setProcessedDocuments] = useState<any>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [openDocUpload, setOpenDocUpload] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('No File Chosen');
  const [showFileUpload, setShowFileUpload] = useState(false);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);

  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Check if there's enough space below the button to open the dialog
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const dialogHeight = 350; // estimated height of the dialog

    // If there isn't enough space, open the dialog above the button
    if (spaceBelow < dialogHeight + 100) {
      setFilterButtonPosition({
        top: buttonRect.top - dialogHeight, // open above the button
        left: buttonRect.left,
      });
    } else {
      setFilterButtonPosition({
        top: buttonRect.bottom, // open below the button
        left: buttonRect.left,
      });
    }

    setFilterPopupOpen(true);
  };

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
  };

  const handleColumnSearch = (column: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [column]: value }));
  };

  const handleDriverDocShare = async (document: any) => {
    try {
      const response = await getShortUrl(document?.signedUrl);

      if (response.status === 200) {
        const data = response.data;
        setShortenedUrl(data.alias_url);
        setSelectedDocumentName(document.fileName);
        setShareDialogOpen(true);
      } else {
        console.error('Alias API error:', response.data);
        toast.error('Failed to create a shortened URL. Please try again.');
      }
    } catch (error) {
      console.error('Error creating shortened URL:', error);
      toast.error('An error occurred while creating a shortened URL.');
    }
  };

  const {
    displayedItems: displayedDocuments,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords,
  } = useTableDocuments<any>({
    data: processedDocuments,
    itemsPerPage: 6,
    totalRecords: documentsInformation?.length,
    searchQueries,
    onPageChange,
    fetchData,
    filterCriteria,
  });

  useEffect(() => {
    const setTableData = async () => {
      const processedData: any[] = [];
      for (const doc of documentsList) {
        processedData.push({
          ...doc,
          date: formatDateTimeAlpha(doc.uploadedAtTs),
          size: parseFloat(doc?.fileSizeInKb).toFixed(2),
          docType: doc?.documentType === 'DrivingLicense' ? "Driver's License" : doc?.documentType,
        });
      }
      setProcessedDocuments(processedData);
    };

    if (documentsList?.length) {
      setTableData();
    }
  }, [documentsList]);

  const totalPages = Math.ceil(totalFilteredRecords / 6) || 1;

  const handleReject = async (reasons: any) => {
    try {
      setIsRejecting(true);
      const { status, data } = await attestDriverDocuments(driverId, {
        docRef: selectedDocument.docRef,
        status: 'REJECTED',
        attestedBy: currentUserId,
        rejectReason: reasons,
        lonestarId,
      });
      if (status === 200 || status === 202) {
        toast.success('Document rejected successfully');
        fetchData();
      }
      setRejectModalOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRowClick = (document: any) => {
    setSelectedDocument(document);
    setOpenModal(true);
  };

  const handleRejectClick = () => {
    setOpenModal(false);
    setRejectModalOpen(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
  };

  const iconMap: any = {
    'application/pdf': pdfIcon,
    'image/jpeg': jpgIcon,
    'image/jpg': jpgIcon,
    'image/png': pngIcon,
  };

  const statusIconMap: any = {
    APPROVED: approvedIcon,
    REJECTED: rejectedIcon,
    PENDING: pendingIcon,
  };

  const tableHeaders = [
    { label: 'Document Name', key: 'fileName' },
    { label: 'Date', key: 'date' },
    { label: 'Type', key: 'docType' },
    { label: 'Size', key: 'size' },
    { label: 'Status', key: 'status' },
    { label: 'Actions', key: 'actions' },
  ];

  const handleFileChange = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFileName('No File Chosen');
    setSelectedFile(null);
  };

  const handleUpload = () => {
    console.log('selected file : ', selectedFile);
    console.log('document type : ', documentType);

    if (selectedFile && documentType) {
      handleDocumentUpload(selectedFile, documentType);
    }
  };

  const handleDocumentUpload = async (file: File, type: any) => {
    if (!driverId) {
      toast.error('DriverId ID not found');
      return;
    }
    setIsUploading(true);
    try {
      const documentType = type || 'DrivingLicense';
      const response = await uploadDriverDocumentFile(driverId, file, documentType, lonestarId);
      if (response.status === 202) {
        toast.success(response?.data?.message);
        fetchData();
        handleClearFile();
        handleDocClose();
        setDocumentType('');
        setShowFileUpload(false);
      } else {
        toast.error(response?.data?.message);
        handleClearFile();
        handleDocClose();
        setDocumentType('');
        setShowFileUpload(false);
      }

      console.log('response :: ', response);
    } catch (error: any) {
      console.error('Error uploading file:', error);

      toast.error(error.message || 'Failed to upload file');
      handleClearFile();
      handleDocClose();
      setDocumentType('');
      setShowFileUpload(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocOpen = () => setOpenDocUpload(true);
  const handleDocClose = () => setOpenDocUpload(false);

  return (
    <Box
      sx={{
        borderTop: '1px solid #ccc',
        marginBottom: 2,
        backgroundColor: '#fff',
        borderRadius: '10px',
      }}
    >
      <Grid container sx={{ height: '40px' }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="body1">All Documents</Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            padding: 2,
            justifyContent: 'flex-end',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mr: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ mr: 1 }}>
                <Button variant="contained" color="primary" onClick={handleDocOpen}>
                  Upload Document
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mr: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ textTransform: 'none' }}
              onClick={handleFilterIconClick}
            >
              Filters
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer sx={{ marginTop: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
            <TableRow>
              {tableHeaders?.map(({ label, key }, index) => (
                <TableCell key={key} sx={{ textAlign: index === 0 ? 'left' : 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      sx={{
                        whiteSpace: 'nowrap',
                        color: '#fff!important',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {label}
                      {index < 5 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          <TbTriangleFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'asc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'asc')}
                          />
                          <TbTriangleInvertedFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'desc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'desc')}
                          />
                        </Box>
                      )}
                    </Typography>

                    {index < 5 && (
                      <TextField
                        size="small"
                        variant="outlined"
                        value={searchQueries[key] || ''}
                        onChange={(e) => handleColumnSearch(key, e.target.value)}
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            width: 'auto',
                            height: '30px',
                          },
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedDocuments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', padding: '20px' }}>
                  <Typography variant="body1">No Documents found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedDocuments?.map((document: any, index: any) => (
                <TableRow
                  key={index}
                  sx={index % 2 ? { background: '#BFD1D9' } : { background: '#fff' }}
                  onClick={() => handleRowClick(document)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        position: 'relative',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '300px',
                        '&:hover': {
                          overflow: 'visible',
                          whiteSpace: 'normal',
                          maxWidth: '100%',
                          zIndex: 1,
                          padding: '0 5px',
                        },
                      }}
                    >
                      <img
                        src={iconMap[document.contentType] || ''}
                        alt={document.type}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                      />
                      {document.fileName}
                    </Box>
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {formatDateTimeAlpha(document?.uploadedAtTs)}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.docType}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.size} KB
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={statusIconMap[document.status] || ''}
                        alt={document.status}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                      />
                      <Typography>{document.status}</Typography>
                    </Box>{' '}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <IconButton
                      aria-label="download"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleDriverDocDownload(document);
                      }}
                    >
                      <RiDownload2Line color="#3F5C78" />
                    </IconButton>
                    <IconButton
                      aria-label="share"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleDriverDocShare(document);
                      }}
                    >
                      <RiShareLine color="#3F5C78" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={totalFilteredRecords}
          pageSize={6}
          isDefaultList={false}
        />
      </TableContainer>

      <DocumentModal
        open={openModal}
        onClose={handleCloseModal}
        document={selectedDocument}
        driverId={driverId}
        refreshData={fetchData}
        onRejectClick={handleRejectClick}
      />

      <RejectDocumentModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onReject={handleReject}
        isRejecting={isRejecting}
      />
      <FilterDocumentDialog
        filterPopupOpen={filterPopupOpen}
        handleFilterPopupClose={handleFilterPopupClose}
        filterButtonPosition={filterButtonPosition}
        onApplyFilter={handleFilterApply}
        onClearFilter={handleClearFilter}
      />

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setShortenedUrl('');
          setSelectedDocumentName('');
        }}
        documentUrl={shortenedUrl}
        documentName={selectedDocumentName}
      />

      <UploadDialog
        open={openDocUpload}
        onClose={handleDocClose}
        onUpload={handleUpload}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        selectedFileName={selectedFileName}
        selectedFile={selectedFile}
        handleClearFile={handleClearFile}
        documentType={documentType}
        setDocumentType={setDocumentType}
        showFileUpload={showFileUpload}
        setShowFileUpload={setShowFileUpload}
        isUploading={isUploading}
      />
    </Box>
  );
};

export default DriverDocumentList;
