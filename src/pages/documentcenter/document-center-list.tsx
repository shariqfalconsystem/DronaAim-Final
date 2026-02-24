import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { RiDownload2Line } from '@remixicon/react';
import useTableDocuments from '../../common/hooks/useTableDocuments';
import { formatDateTimeAlpha, handleDriverDocDownload } from '../../utility/utilities';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import { toast } from 'react-toastify';
import Delete from '../../assets/icons/delete.png';
import { deleteDocument } from '../../services/fleetManager/documentServices';
import debounce from 'lodash/debounce';
import PDF from '../../assets/icons/pdf_doc.png';
import PNG from '../../assets/icons/png_doc.png';
import JPG from '../../assets/icons/jpg_doc.png';
import useTableDocumentsNew from '../../common/hooks/useTableDocumentsNew';

const FleetDocuments: React.FC<any> = ({ documentsInformation, documentsList, fetchData, lonestarId }) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, string>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useCallback(
    debounce((queries: Record<string, string>) => {
      setSearchQueries(queries);
    }, 500),
    []
  );

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQueries, debouncedSearch]);

  // Helper function to convert UTC timestamp to local date
  const getLocalDateFromUtc = (dateValue: string) => {
    if (!dateValue) return null;

    // If it's already a date string in MM-DD-YYYY format, parse it
    if (dateValue.includes('-') && dateValue.length === 10) {
      return dayjs(dateValue, 'MM-DD-YYYY');
    }

    // If it's a timestamp, convert it
    const timestamp = parseInt(dateValue);
    if (!isNaN(timestamp)) {
      return dayjs(timestamp);
    }

    // Try to parse as regular date string
    return dayjs(dateValue);
  };

  // Helper function to format date for search
  const formatDateForSearch = (date: any) => {
    if (!date) return '';
    return dayjs(date).format('MM-DD-YYYY');
  };

  // Handle date change for DatePicker
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
    handlePageChange: onPageChange,
    totalFilteredRecords,
  } = useTableDocumentsNew<any>({
    data: processedDocuments,
    itemsPerPage: 10,
    totalRecords: documentsInformation?.length || 0,
    searchQueries,
    onPageChange: () => {},
    fetchData,
  });

  const totalPages = Math.ceil(totalFilteredRecords / 10) || 1;

  useEffect(() => {
    const setTableData = async () => {
      const processedData = documentsList.map((doc: any) => ({
        ...doc,
        documentId: doc?.documentId ?? '',
        date: formatDateTimeAlpha(doc.uploadedAtTs),
        dateForSearch: formatDateForSearch(dayjs(doc.uploadedAtTs)), // Add formatted date for search
        size: parseFloat(doc?.fileSizeInKb).toFixed(2),
        uploadedByName: doc?.uploadedByName ?? '',
        contentType: getReadableContentType(doc?.contentType),
      }));
      setProcessedDocuments(processedData);
    };

    setTableData();
  }, [documentsList]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleColumnSearch = (column: string, value: string) => {
    const newQueries = { ...localSearchQueries, [column]: value };
    if (value === '') {
      delete newQueries[column];
    }
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
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

  const columns = [
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
    <Box ref={containerRef} sx={{ whiteSpace: 'nowrap', width: '81vw' }}>
      <TableContainer
        component={Paper}
        onScroll={handleScroll}
        sx={{
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
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
        <Table ref={tableRef} sx={{ width: '120%' }}>
          <TableHead>
            <TableRow>
              {columns.map(({ label, key }, index) => (
                <StyledHeadCell
                  key={key}
                  sx={{
                    position: index === 0 ? 'sticky' : 'static',
                    left: index === 0 ? 0 : 'auto',
                    zIndex: index === 0 ? 2 : 'auto',
                    backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                      sx={{
                        whiteSpace: 'nowrap',
                        color: '#000!important',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                      component={'span'}
                    >
                      {label}
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        {key !== 'actions' && (
                          <>
                            <TbTriangleFilled
                              size={9}
                              color={sortColumn === key && sortDirection === 'asc' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'asc')}
                              style={{ cursor: 'pointer' }}
                            />
                            <TbTriangleInvertedFilled
                              size={9}
                              color={sortColumn === key && sortDirection === 'desc' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'desc')}
                              style={{ cursor: 'pointer' }}
                            />
                          </>
                        )}
                      </Box>
                    </Typography>

                    {key !== 'actions' && renderSearchInput(key)}
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedDocuments?.length > 0 ? (
              displayedDocuments.map((document: any, index: number) => (
                <TableRow
                  key={document.docRef}
                  sx={{
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <StyledDataCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      whiteSpace: 'nowrap',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {document.documentId || 'NA'}
                      </Typography>
                    </Box>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {document?.fileName?.toLowerCase().endsWith('.pdf') && (
                        <img src={PDF} alt="PDF Icon" width={16} height={16} />
                      )}
                      {document?.fileName?.toLowerCase().endsWith('.png') && (
                        <img src={PNG} alt="PNG Icon" width={16} height={16} />
                      )}
                      {document?.fileName?.toLowerCase().endsWith('.jpg') && (
                        <img src={JPG} alt="JPG Icon" width={16} height={16} />
                      )}
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {document?.fileName?.replace(/\.[^/.]+$/, '') || 'NA'}
                      </Typography>
                    </Box>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {document?.status || 'NA'}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {document?.contentType || 'NA'}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {document?.size} KB
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {document?.date || 'NA'}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {document?.uploadedByName || 'NA'}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        aria-label="download"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          handleDriverDocDownload(document);
                        }}
                        size="small"
                      >
                        <RiDownload2Line color="#3F5C78" size={16} />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={(e: any) => handleDeleteClick(e, document?.docRef)}
                        size="small"
                      >
                        <img src={Delete} alt="Delete" width={16} height={16} />
                      </IconButton>
                    </Box>
                  </StyledDataCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography variant="body1">No Documents Found</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalRecords={documentsInformation?.pageDetails?.totalRecords}
        pageSize={documentsInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default FleetDocuments;
