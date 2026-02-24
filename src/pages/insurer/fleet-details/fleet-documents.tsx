import { useEffect, useCallback, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { RiDownload2Line } from '@remixicon/react';
import Pagination from '../../../components/molecules/pagination';
import Delete from '../../../assets/icons/delete.png';
import { deleteDocument } from '../../../services/fleetManager/documentServices';
import { formatDateTimeAlpha, handleDriverDocDownload } from '../../../utility/utilities';
import useTableDocuments from '../../../common/hooks/useTableDocuments';
import { toast } from 'react-toastify';
import PDF from '../../../assets/icons/pdf_doc.png';
import PNG from '../../../assets/icons/png_doc.png';
import JPG from '../../../assets/icons/jpg_doc.png';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import useTableDocumentsNew from '../../../common/hooks/useTableDocumentsNew';
import debounce from 'lodash/debounce';

const FleetDocuments = ({ documentsInformation, documentsList, onPageChange, fetchData, lonestarId }: any) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<any>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, string>>({});

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  console.log('documentList', documentsList);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const debouncedSearch = useCallback(
    debounce((queries: Record<string, string>) => {
      setSearchQueries(queries);
    }, 500),
    []
  );
  const getLocalDateFromUtc = (dateValue: string) => {
    if (!dateValue) return null;

    if (dateValue.includes('-') && dateValue.length === 10) {
      return dayjs(dateValue, 'MM-DD-YYYY');
    }

    const timestamp = parseInt(dateValue);
    if (!isNaN(timestamp)) {
      return dayjs(timestamp);
    }

    return dayjs(dateValue);
  };

  const formatDateForSearch = (date: any) => {
    if (!date) return '';
    return dayjs(date).format('MM-DD-YYYY');
  };

  const handleDateChange = (date: any, key: string) => {
    const formattedDate = date ? formatDateForSearch(date) : '';
    const newQueries = { ...localSearchQueries, [key]: formattedDate };
    if (!formattedDate) {
      delete newQueries[key];
    }
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const getReadableContentType = (contentType?: string): string => {
    const typeMap: Record<string, string> = {
      'image/png': 'PNG File',
      'image/jpeg': 'JPEG File',
      'image/jpg': 'JPG File',
      'application/pdf': 'PDF File',
      'application/vnd.ms-excel': 'Excel File',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel File',
      'text/csv': 'CSV File',
    };
    return typeMap[contentType || ''] || 'Unknown File';
  };

  const {
    displayedItems: displayedDocuments,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords,
  } = useTableDocumentsNew<any>({
    data: processedDocuments,
    itemsPerPage: 6,
    totalRecords: documentsInformation?.length || 0,
    searchQueries,
    onPageChange,
    fetchData,
  });

  useEffect(() => {
    const setTableData = async () => {
      const processedData: any[] = [];
      for (const doc of documentsList) {
        processedData.push({
          ...doc,
          documentId: doc?.documentId ?? '',
          date: formatDateTimeAlpha(doc.uploadedAtTs),
          dateForSearch: formatDateForSearch(dayjs(doc.uploadedAtTs)),
          size: parseFloat(doc?.fileSizeInKb).toFixed(2),
          uploadedByName: doc?.uploadedByName ?? '',
          contentType: getReadableContentType(doc?.contentType),

          // docType: doc?.documentType === 'DrivingLicense' ? "Driver's License" : doc?.documentType,
        });
      }
      setProcessedDocuments(processedData);
    };

    setTableData();
  }, [documentsList]);

  const totalPages = Math.ceil(totalFilteredRecords / 6) || 1;

  const handleColumnSearch = (column: string, value: string) => {
    setLocalSearchQueries((prev) => ({ ...prev, [column]: value }));
    debouncedSearch({ ...localSearchQueries, [column]: value });
  };

  const handleDeleteClick = async (e: React.MouseEvent, docRef: string) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const { status, data } = await deleteDocument(lonestarId, docRef);
      if (status === 202) {
        toast.success(data?.message);
        fetchData();
      } else {
        toast.error(data?.details);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const tableHeaders = [
    { label: 'Document ID', key: 'documentId' },
    { label: 'Document Name', key: 'fileName' },
    { label: 'Status', key: 'status' },
    { label: 'Type', key: 'contentType' },
    { label: 'Size', key: 'size' },
    { label: 'Uploaded At', key: 'date' },
    { label: 'Uploaded By', key: 'uploadedByName' },
    { label: 'Actions', key: 'actions' },
  ];

  const renderSearchInput = (key: string) => {
    if (key === 'date') {
      return (
        <DatePicker
          value={localSearchQueries[key] ? getLocalDateFromUtc(localSearchQueries[key]) : null}
          onChange={(date) => handleDateChange(date, key)}
          placeholder=""
          format="MM-DD-YYYY"
          style={{
            marginTop: 8,
            width: '100%',
            height: '30px',
          }}
          showTime={false}
          allowClear
        />
      );
    }

    return (
      <TextField
        size="small"
        variant="outlined"
        value={localSearchQueries[key] || ''}
        onChange={(e) => handleColumnSearch(key, e.target.value)}
        sx={{
          mt: 1,
          '& .MuiOutlinedInput-root': {
            width: '100%',
            height: '30px',
            backgroundColor: 'white',
          },
        }}
      />
    );
  };

  return (
    <Box ref={containerRef} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
      <TableContainer
        component={Paper}
        onScroll={handleScroll}
        sx={{
          marginTop: 2,
          width: '100%',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '14px',
            cursor: 'pointer',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#5B7C9D',
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4a5c72',
          },
        }}
      >
        <Table ref={tableRef} sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
            <TableRow>
              {tableHeaders.map(({ label, key }, index) => (
                <TableCell
                  key={key}
                  sx={{
                    position: index === 0 ? 'sticky' : 'static',
                    left: index === 0 ? 0 : 'auto',
                    zIndex: index === 0 ? 2 : 'auto',
                    backdropFilter: index === 0 && applyBackdropFilter ? 'blur(50px)' : 'none',
                    textAlign: index === 0 ? 'left' : 'center',
                  }}
                >
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
                      {index < 7 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          <TbTriangleFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'asc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'asc')}
                            style={{ cursor: 'pointer' }}
                          />
                          <TbTriangleInvertedFilled
                            size={8}
                            color={sortColumn === key && sortDirection === 'desc' ? '#fff' : 'rgba(255,255,255,0.5)'}
                            onClick={() => handleSort(key, 'desc')}
                            style={{ cursor: 'pointer' }}
                          />
                        </Box>
                      )}
                    </Typography>

                    {key !== 'actions' && renderSearchInput(key)}
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
                  key={`${document.docRef}`}
                  sx={index % 2 ? { background: '#BFD1D9' } : { background: '#fff' }}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell
                    width="5%"
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 100,
                      whiteSpace: 'nowrap',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                    }}
                  >
                    {document?.documentId || 'NA'}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1 }}>
                      {document?.fileName?.toLowerCase().endsWith('.pdf') && (
                        <img src={PDF} alt="PDF Icon" width={16} height={16} />
                      )}
                      {document?.fileName?.toLowerCase().endsWith('.png') && (
                        <img src={PNG} alt="PNG Icon" width={16} height={16} />
                      )}
                      {(document?.fileName?.toLowerCase().endsWith('.jpg') ||
                        document?.fileName?.toLowerCase().endsWith('.jpeg')) && (
                        <img src={JPG} alt="JPG Icon" width={16} height={16} />
                      )}
                      {document?.fileName?.replace(/\.[^/.]+$/, '') || 'NA'}
                    </Box>
                  </TableCell>

                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.status || 'NA'}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.contentType}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.size} KB
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {formatDateTimeAlpha(document?.uploadedAtTs)}
                  </TableCell>
                  <TableCell width="15%" sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {document?.uploadedByName || 'NA'}
                  </TableCell>
                  <TableCell
                    width="15%"
                    sx={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 1,
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(50px)',
                      background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      padding: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <IconButton
                      aria-label="download"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleDriverDocDownload(document);
                      }}
                    >
                      <RiDownload2Line color="#3F5C78" />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={(e: any) => handleDeleteClick(e, document?.docRef)}>
                      <img src={Delete} alt="Delete" width={20} height={20} />
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
    </Box>
  );
};

export default FleetDocuments;
