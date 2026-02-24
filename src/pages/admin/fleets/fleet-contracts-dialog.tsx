import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  Popover,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import { Download as DownloadIcon, Sync as SyncIcon } from '@mui/icons-material';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import { formatZohoUtcDate } from '../../../utility/utilities';
import { RiCloseCircleFill } from '@remixicon/react';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import {
  getContractsByLonestarId,
  downloadContractDocument,
  syncFleetFromZoho,
} from '../../../services/admin/fleetServices';
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

interface FleetContractsDialogProps {
  open: boolean;
  onClose: () => void;
  fleetData: any;
  lonestarId: string;
  currentLoggedInUserId: string;
}

const FleetContractsDialog: React.FC<FleetContractsDialogProps> = ({
  open,
  onClose,
  fleetData,
  lonestarId,
  currentLoggedInUserId,
}) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);

  // API related states
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState('Sync');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  // Sync states
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Download states
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Attachments popup states
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<ContractDocument[]>([]);
  const [selectedZohoDocumentId, setSelectedZohoDocumentId] = useState<string>('');

  // Email popover states
  const [emailPopoverAnchor, setEmailPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverEmails, setPopoverEmails] = useState<string[]>([]);

  const itemsPerPage = 5;

  useEffect(() => {
    if (fleetData?.zohoLastSyncTs) {
      const syncDate = new Date(fleetData.zohoLastSyncTs);
      const formattedSync = syncDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setLastSyncTime(formattedSync);
    } else {
      setLastSyncTime('Never');
    }
  }, [fleetData]);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const debouncedSearch = useCallback(
    debounce((queries: Record<string, any>) => {
      setSearchQueries(queries);
      setCurrentPage(1);
    }, 1000),
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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
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

  const handleSyncFromZoho = async () => {
    if (!lonestarId || !currentLoggedInUserId) {
      setSyncError('Missing required parameters for sync');
      return;
    }

    setSyncing(true);
    setSyncError(null);
    setSyncStatus('Syncing...');

    try {
      await syncFleetFromZoho({
        lonestarId,
        currentLoggedInUserId,
      });

      setSyncSuccess(true);
      setSyncStatus('Sync');

      const currentTime = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setLastSyncTime(currentTime);
      setTimeout(() => {
        fetchContracts();
      }, 2000);
    } catch (err: any) {
      console.error('Error syncing from Zoho:', err);
      setSyncError(err.message || 'Failed to sync from Zoho');
      setSyncStatus('Sync Failed');
    } finally {
      setSyncing(false);
    }
  };

  const fetchContracts = useCallback(async () => {
    if (!open || !lonestarId) return;

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
      setSyncStatus('Sync');
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err.message || 'Failed to fetch contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [open, lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  useEffect(() => {
    if (open) {
      fetchContracts();
    }
  }, [open, currentPage, sortColumn, sortDirection, searchQueries]);

  useEffect(() => {
    if (!open) {
      setSearchQueries({});
      setLocalSearchQueries({});
      setCurrentPage(1);
      setSortColumn(null);
      setSortDirection(null);
      setContracts([]);
      setError(null);
      setDownloadError(null);
      setDownloadSuccess(false);
      setSyncError(null);
      setSyncSuccess(false);
    }
  }, [open]);

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

  // Define date columns that should use DatePicker
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            borderRadius: '10px',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: (theme) => theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {fleetData?.name || 'Fleet'} - Contracts
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white', padding: '4px' }} size="small">
            <RiCloseCircleFill />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  All Contracts
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
                  onClick={handleSyncFromZoho}
                  disabled={syncing}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    padding: '4px 12px',
                    minWidth: 'auto',
                    borderRadius: 4,
                    bgcolor: '#c6f4d9ff',
                    color: '#000',
                    '&:hover': {
                      bgcolor: '#c6f4d9ff',
                      border: '1px solid #000',
                    },
                  }}
                >
                  {syncing ? 'Syncing...' : syncStatus}
                </Button>

                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  Last Sync: {lastSyncTime}
                </Typography>
              </Box>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                onScroll={handleScroll}
                sx={{
                  maxHeight: '60vh',
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
                    borderRadius: '4px',
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((column, index) => (
                        <StyledHeadCell
                          key={column.key}
                          sx={{
                            position: index === 0 || column.key === 'action' ? 'sticky' : 'static',
                            left: index === 0 ? 0 : 'auto',
                            right: column.key === 'action' ? 0 : 'auto',
                            zIndex: index === 0 || column.key === 'action' ? 2 : 'auto',
                            backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                            background: column.key === 'action' ? '#EDF0F5' : 'auto',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography
                                sx={{
                                  whiteSpace: 'nowrap',
                                  color: '#000',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                {column.label}
                              </Typography>

                              {column.key !== 'action' && column.key !== 'documentLink' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                                  <TbTriangleFilled
                                    size={8}
                                    color={
                                      sortColumn === column.key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'
                                    }
                                    onClick={() => handleSort(column.key, 'ASC')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <TbTriangleInvertedFilled
                                    size={8}
                                    color={
                                      sortColumn === column.key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'
                                    }
                                    onClick={() => handleSort(column.key, 'DESC')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {column.key !== 'action' && (
                              <>
                                {dateColumns.includes(column.key) ? (
                                  <DatePicker
                                    value={
                                      localSearchQueries[column.key] ? dayjs(localSearchQueries[column.key]) : null
                                    }
                                    onChange={(date) => handleDateChange(date, column.key)}
                                    placeholder=""
                                    format="MM-DD-YYYY"
                                    style={{ marginTop: 8, width: '100%' }}
                                    popupStyle={{ zIndex: 9999 }}
                                  />
                                ) : (
                                  <TextField
                                    size="small"
                                    variant="outlined"
                                    value={localSearchQueries[column.key] || ''}
                                    onChange={(e) => handleColumnSearch(column.key, e.target.value)}
                                    disabled={column.key === 'documentLink'}
                                    sx={{
                                      mt: 1,
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: column.key === 'documentLink' ? '#f0f0f0' : 'white',
                                        width: '100%',
                                        height: '30px',
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
                              color: 'inherit',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
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
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {contract.contractId}
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
                                  textDecoration: 'underline',
                                  cursor: docs && docs.length > 0 ? 'pointer' : 'default',
                                  color: docs && docs.length > 0 ? '#1976d2' : 'text.disabled',
                                  '&:hover': {
                                    textDecoration: docs && docs.length > 0 ? 'underline' : 'none',
                                  },
                                }}
                              >
                                {documentId || 'NA'}
                              </Link>
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
                            <StyledDataCell>{docs?.[0]?.status || 'NA'}</StyledDataCell>
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
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenAttachmentsDialog(docs, documentId)}
                                  disabled={!docs || docs?.length === 0}
                                  sx={{ padding: '2px' }}
                                  title="View Attachments"
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
                        <StyledDataCell colSpan={columns.length} align="center">
                          <Typography variant="body2" sx={{ py: 2 }}>
                            No contracts found
                          </Typography>
                        </StyledDataCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'white' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalRecords={totalRecords}
                  pageSize={itemsPerPage}
                  isDefaultList={true}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

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

      <AttachmentsDialog
        open={attachmentsDialogOpen}
        onClose={handleCloseAttachmentsDialog}
        zohoDocumentId={selectedZohoDocumentId}
        documents={selectedDocuments}
        onDownload={handleDownloadByDocumentId}
        downloading={downloading}
      />

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

      <Snackbar
        open={syncSuccess}
        autoHideDuration={3000}
        onClose={() => setSyncSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSyncSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Sync initiated successfully! Data will be updated shortly.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!syncError}
        autoHideDuration={5000}
        onClose={() => setSyncError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSyncError(null)} severity="error" sx={{ width: '100%' }}>
          {syncError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FleetContractsDialog;
