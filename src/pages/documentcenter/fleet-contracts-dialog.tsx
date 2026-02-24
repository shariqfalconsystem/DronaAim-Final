import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Link,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Popover,
  ListItem,
  ListItemText,
  List,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import { formatZohoUtcDate } from '../../utility/utilities';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getContractsByLonestarId, downloadContractDocument } from '../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import AttachmentsDialog from './attachment-dialog';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface ContractDocument {
  zohosignModuleRecordId: string;
  zohosignZohoSignDocumentId: string;
  status: string;
  name: string;
  recipientEmailIds: string[];
  zohoDateSent: number;
  zohoDateCompleted: number;
  zohoDateSentUtc: string;
  zohoDateCompletedUtc: string;
}

interface ApiContract {
  contractId: string;
  contractExpiryDate: number;
  contractEffectiveDate: number;
  contractExpiryDateUtc: string;
  contractEffectiveDateUtc: string;
  contractStatus: boolean;
  deleted: boolean;
  contractDocuments: ContractDocument[];
}

interface FleetContractsProps {
  lonestarId: string;
  currentLoggedInUserId: string;
}

const FleetContracts: React.FC<FleetContractsProps> = ({ lonestarId, currentLoggedInUserId }) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  // API related states
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Download states
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Attachments popup states
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<ContractDocument[]>([]);
  const [selectedZohoDocumentId, setSelectedZohoDocumentId] = useState<string>('');

  const [emailPopoverAnchor, setEmailPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverEmails, setPopoverEmails] = useState<string[]>([]);

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const itemsPerPage = 5;

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const debouncedSearch = useCallback(
    debounce((queries: Record<string, string>) => {
      setSearchQueries(queries);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: string) => {
    const newQueries = { ...localSearchQueries, [column]: value };
    if (value === '') {
      delete newQueries[column];
    }
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }
    const formattedDate = date.format('YYYY-MM-DD');
    const newQueries = { ...localSearchQueries, [key]: formattedDate };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const fetchContracts = useCallback(async () => {
    if (!lonestarId) return;

    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        lonestarId,
        currentLoggedInUserId,
        ...(sortColumn &&
          sortDirection && {
            sortKey: sortColumn,
            sortOrder: sortDirection,
          }),
        ...searchQueries,
      };

      const { data } = await getContractsByLonestarId(requestBody);

      let apiContracts: ApiContract[] = [];
      let total = 0;
      let pages = 0;

      if (Array.isArray(data)) {
        apiContracts = data;
        total = data.length;
        pages = Math.ceil(total / itemsPerPage);
      } else if (data.contracts && Array.isArray(data.contracts)) {
        apiContracts = data.contracts;
        total = data.pageDetails?.totalRecords || data.contracts.length;
        pages = Math.ceil(total / itemsPerPage);
      }

      setContracts(apiContracts);
      setTotalRecords(total);
      setTotalPages(pages);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err.message || 'Failed to fetch contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };
  const handleEmailPopoverOpen = (event: React.MouseEvent<HTMLElement>, emails: string[]) => {
    if (emails.length > 1) {
      setEmailPopoverAnchor(event.currentTarget);
      setPopoverEmails(emails);
    }
  };

  const handleEmailPopoverClose = () => {
    setEmailPopoverAnchor(null);
    setPopoverEmails([]);
  };

  const renderRecipientEmails = (emails: string[] | undefined) => {
    if (!emails || emails.length === 0) {
      return 'NA';
    }

    const firstEmail = emails[0];
    const additionalCount = emails.length - 1;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            maxWidth: 'auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={firstEmail}
        >
          {firstEmail}
        </Typography>
        {additionalCount > 0 && (
          <Chip
            label={`+${additionalCount}`}
            size="small"
            sx={{
              whiteSpace: 'nowrap',
              fontSize: '0.7rem',
              textAlign: 'center',
              height: '20px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#bbdefb',
              },
            }}
            onMouseEnter={(e) => handleEmailPopoverOpen(e, emails)}
            onMouseLeave={handleEmailPopoverClose}
          />
        )}
      </Box>
    );
  };

  const handleOpenAttachmentsDialog = (documents: ContractDocument[], zohoDocumentId: string) => {
    setSelectedDocuments(documents);
    setSelectedZohoDocumentId(zohoDocumentId);
    setAttachmentsDialogOpen(true);
  };

  const handleCloseAttachmentsDialog = () => {
    setAttachmentsDialogOpen(false);
    setSelectedDocuments([]);
    setSelectedZohoDocumentId('');
  };

  const handleDownloadByDocumentId = async (zohosignZohoSignDocumentId: string, documentName?: string) => {
    if (!zohosignZohoSignDocumentId || zohosignZohoSignDocumentId === 'NA') {
      setDownloadError('Document ID not available');
      return;
    }

    setDownloading(zohosignZohoSignDocumentId);
    setDownloadError(null);

    try {
      const blob = await downloadContractDocument({
        lonestarId,
        currentLoggedInUserId,
        zohosignZohoSignDocumentId,
      });

      const filename = (blob as any).filename || documentName || 'contract.pdf';

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err: any) {
      console.error('Error downloading contract:', err);
      setDownloadError(err.message || 'Failed to download contract');
    } finally {
      setDownloading(null);
    }
  };

  const dateColumns = ['contractEffectiveDateUtc', 'zohoDateSentUtc', 'zohoDateCompletedUtc'];

  const columns = [
    { label: 'DA Contract ID', key: 'contractId' },
    { label: 'Zoho Document ID', key: 'zohosignZohoSignDocumentId' },
    { label: 'Document link', key: 'documentLink' },
    { label: 'Document Status', key: 'documentStatus' },
    { label: 'Contract Effective date', key: 'contractEffectiveDateUtc' },
    { label: 'Date Sent', key: 'zohoDateSentUtc' },
    { label: 'Date Completed', key: 'zohoDateCompletedUtc' },
    { label: 'Recipient Email', key: 'recipientEmailId' },
    { label: 'Action', key: 'action' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box ref={containerRef} sx={{ whiteSpace: 'nowrap', width: '81vw' }}>
        <TableContainer
          component={Paper}
          onScroll={handleScroll}
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '10px',
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
                      position: index === 0 || key === 'action' ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: key === 'action' ? 0 : 'auto',
                      zIndex: index === 0 || key === 'action' ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: key === 'action' ? '#EDF0F5' : 'auto',
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
                          {key !== 'action' && key !== 'documentLink' && (
                            <>
                              <TbTriangleFilled
                                size={9}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                                style={{ cursor: 'pointer' }}
                              />
                              <TbTriangleInvertedFilled
                                size={9}
                                color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'DESC')}
                                style={{ cursor: 'pointer' }}
                              />
                            </>
                          )}
                        </Box>
                      </Typography>

                      {key !== 'action' && (
                        <>
                          {dateColumns.includes(key) ? (
                            <DatePicker
                              value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                              onChange={(date) => handleDateChange(date, key)}
                              placeholder=""
                              format="MM-DD-YYYY"
                              style={{ marginTop: 8, width: '100%' }}
                              popupStyle={{ zIndex: 9999 }}
                            />
                          ) : (
                            <TextField
                              size="small"
                              variant="outlined"
                              value={localSearchQueries[key] || ''}
                              onChange={(e) => handleColumnSearch(key, e.target.value)}
                              disabled={key === 'documentLink'}
                              sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                  width: '100%',
                                  height: '30px',
                                  backgroundColor: key === 'documentLink' ? '#f0f0f0' : 'white',
                                },
                              }}
                            />
                          )}
                        </>
                      )}
                    </Box>
                  </StyledHeadCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.length > 0 ? (
                contracts.map((row: any, index: number) => {
                  const { contractDocuments: docs, ...contract } = row;
                  const documentId = docs?.[0]?.zohosignZohoSignDocumentId;

                  return (
                    <TableRow
                      key={`${contract.contractId}-${documentId || 'no-doc'}-${index}`}
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
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {contract.contractId}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {documentId || 'NA'}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleOpenAttachmentsDialog(docs, documentId)}
                          disabled={!docs || docs.length === 0}
                          sx={{
                            fontSize: '0.75rem',
                            cursor: docs && docs.length > 0 ? 'pointer' : 'default',
                            color: docs && docs.length > 0 ? '#1976d2' : 'text.disabled',
                          }}
                        >
                          📄 {'Contract'}
                        </Link>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {docs?.[0]?.status || 'NA'}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatZohoUtcDate(contract.contractEffectiveDateUtc)}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatZohoUtcDate(docs?.[0]?.zohoDateSentUtc)}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatZohoUtcDate(docs?.[0]?.zohoDateCompletedUtc)}
                        </Typography>
                      </StyledDataCell>
                      <StyledDataCell>{renderRecipientEmails(docs?.[0]?.recipientEmailIds)}</StyledDataCell>
                      <StyledDataCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          zIndex: 3,
                          backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                          background: '#fff',
                          boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            aria-label="view-attachments"
                            onClick={() => handleOpenAttachmentsDialog(docs, documentId)}
                            disabled={!docs || docs?.length === 0}
                            size="small"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </StyledDataCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <StyledDataCell colSpan={columns.length}>
                    <Typography variant="body1">No Contracts Found</Typography>
                  </StyledDataCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalRecords={totalRecords}
          pageSize={itemsPerPage}
          isDefaultList={true}
        />
      </Box>
      <Popover
        open={Boolean(emailPopoverAnchor)}
        anchorEl={emailPopoverAnchor}
        onClose={handleEmailPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          onMouseEnter: () => setEmailPopoverAnchor(emailPopoverAnchor),
          onMouseLeave: handleEmailPopoverClose,
          sx: {
            pointerEvents: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            All Recipient Emails:
          </Typography>
          <List dense>
            {popoverEmails.map((email, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={email}
                  primaryTypographyProps={{
                    sx: { fontSize: '0.875rem', wordBreak: 'break-all' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

      {/* Attachments Dialog Component */}
      <AttachmentsDialog
        open={attachmentsDialogOpen}
        onClose={handleCloseAttachmentsDialog}
        zohoDocumentId={selectedZohoDocumentId}
        documents={selectedDocuments}
        onDownload={handleDownloadByDocumentId}
        downloading={downloading}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={downloadSuccess}
        autoHideDuration={3000}
        onClose={() => setDownloadSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setDownloadSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Contract downloaded successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!downloadError}
        autoHideDuration={5000}
        onClose={() => setDownloadError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setDownloadError(null)} severity="error" sx={{ width: '100%' }}>
          {downloadError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FleetContracts;
