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
  Chip,
  Button,
  CircularProgress,
  List,
  ListItem,
  Popover,
  ListItemText,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import { RiCloseCircleFill } from '@remixicon/react';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getInvoicesByLonestarId } from '../../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { formatZohoUtcDate } from '../../../utility/utilities';

// interface Invoice {
//   invoiceId: string;
//   zohoSubscriptionId: string;
//   invoiceNumber: string;
//   status: string;
//   date: number;
//   dueDate: number;
//   dateUtc: string;
//   dueDateUtc: string;
//   referenceNumber: string;
//   total: string;
//   balance: string;
//   email: string;
//   transactionType: string;
//   invoiceUrl: string;
// }

interface FleetInvoicesDialogProps {
  open: boolean;
  onClose: () => void;
  fleetData: any;
  lonestarId: string;
  currentLoggedInUserId: string;
  onDownloadInvoice?: (invoiceId: string) => void;
}

const FleetInvoicesDialog: React.FC<FleetInvoicesDialogProps> = ({
  open,
  onClose,
  fleetData,
  lonestarId,
  currentLoggedInUserId,
  onDownloadInvoice,
}) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);

  // API related states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState('Syncing...');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Email popover states
  const [emailPopoverAnchor, setEmailPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverEmails, setPopoverEmails] = useState<string[]>([]);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const itemsPerPage = 5;

  // Define date columns that should use DatePicker
  const dateColumns = ['dateUtc', 'dueDateUtc'];

  // Sync local search queries with actual search queries
  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((queries: Record<string, any>) => {
      setSearchQueries(queries);
      setCurrentPage(1);
    }, 1000),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  // Handle column search with debouncing
  const handleColumnSearch = (column: string, value: string) => {
    const newQueries = { ...localSearchQueries, [column]: value };

    if (value === '') {
      delete newQueries[column];
    }

    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  // Handle date change for DatePicker
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

  // Handle sorting
  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  /**
   * Handle email popover open on hover
   */
  const handleEmailPopoverOpen = (event: React.MouseEvent<HTMLElement>, emails: string[]) => {
    if (emails.length > 1) {
      setEmailPopoverAnchor(event.currentTarget);
      setPopoverEmails(emails);
    }
  };

  /**
   * Handle email popover close
   */
  const handleEmailPopoverClose = () => {
    setEmailPopoverAnchor(null);
    setPopoverEmails([]);
  };

  /**
   * Parse email field - it could be a single email string or comma-separated emails
   */
  const parseEmails = (emailField: string | undefined): string[] => {
    if (!emailField) return [];

    // Split by comma and trim whitespace
    return emailField
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  /**
   * Render recipient emails with chip for multiple emails
   */
  const renderRecipientEmails = (emailField: string | undefined) => {
    const emails = parseEmails(emailField);

    if (emails.length === 0) {
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

  // Fetch invoices from API
  const fetchInvoices = useCallback(async () => {
    if (!open || !lonestarId || !currentLoggedInUserId) return;

    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        lonestarId,
        currentLoggedInUserId,
      };

      // Add search queries
      Object.keys(searchQueries).forEach((key) => {
        if (searchQueries[key]) {
          requestBody[key] = searchQueries[key];
        }
      });

      // Add sorting
      if (sortColumn && sortDirection) {
        requestBody.sortKey = sortColumn;
        requestBody.sortOrder = sortDirection;
      }

      // Pass page and limit as separate query parameters
      const response = await getInvoicesByLonestarId(requestBody, currentPage, itemsPerPage);

      // Handle response
      const apiInvoices = response.data?.invoices || [];
      const total = response.data?.pageDetails?.totalRecords || apiInvoices.length;
      const pages = Math.ceil(total / itemsPerPage);

      setInvoices(apiInvoices);
      setTotalRecords(total);
      setTotalPages(pages);

      setSyncStatus('Sync');
      setLastSyncTime(
        new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to fetch invoices');
      setSyncStatus('Sync Failed');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [open, lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  // Fetch invoices when dependencies change
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQueries({});
      setLocalSearchQueries({});
      setCurrentPage(1);
      setSortColumn(null);
      setSortDirection(null);
      setInvoices([]);
      setError(null);
    }
  }, [open]);

  const columns = [
    { label: 'Zoho Subscription ID', key: 'zohoSubscriptionId' },
    { label: 'Invoice ID', key: 'invoiceNumber' },
    { label: 'Invoice Link', key: 'invoiceLink' },
    { label: 'Invoice Status', key: 'status' },
    { label: 'Invoice Date', key: 'dateUtc' },
    { label: 'Due Date', key: 'dueDateUtc' },
    { label: 'Reference #', key: 'referenceNumber' },
    { label: 'Amount', key: 'total' },
    { label: 'Balance Due', key: 'balance' },
    { label: 'Recipient Email', key: 'email' },
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
            {fleetData?.name || 'Fleet'} - Invoices
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
                  All Invoices
                </Typography>
                {/* <ChipWithIcon status={'Sync'} onClick={handleRefresh} />
                <Typography variant="caption" color="textSecondary">
                  Last Sync: {lastSyncTime || 'N/A'}
                </Typography> */}
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

                              {column.key !== 'action' &&
                                column.key !== 'documentLink' &&
                                column.key !== 'invoiceLink' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                                    <TbTriangleFilled
                                      size={8}
                                      color={
                                        sortColumn === column.key && sortDirection === 'ASC'
                                          ? '#000'
                                          : 'rgba(0,0,0,0.5)'
                                      }
                                      onClick={() => handleSort(column.key, 'ASC')}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <TbTriangleInvertedFilled
                                      size={8}
                                      color={
                                        sortColumn === column.key && sortDirection === 'DESC'
                                          ? '#000'
                                          : 'rgba(0,0,0,0.5)'
                                      }
                                      onClick={() => handleSort(column.key, 'DESC')}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </Box>
                                )}
                            </Box>

                            {column.key !== 'action' && column.key !== 'transactionType' && (
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
                                    disabled={column.key === 'invoiceLink'}
                                    sx={{
                                      mt: 1,
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white',
                                        width: '100%',
                                        height: '30px',
                                        fontSize: '0.75rem',
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
                    {invoices.length > 0 ? (
                      invoices.map((invoice: any) => (
                        <TableRow
                          key={invoice.invoiceId}
                          sx={{
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
                              {invoice.zohoSubscriptionId || 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {invoice.invoiceNumber || 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              <a href={invoice?.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                {'Invoice'}
                              </a>
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>{invoice.status || 'NA'}</StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {formatZohoUtcDate(invoice.dateUtc)}
                            </Typography>
                          </StyledDataCell>

                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {formatZohoUtcDate(invoice.dueDateUtc)}
                            </Typography>
                          </StyledDataCell>

                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {invoice.referenceNumber || 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {invoice.totalWithCcySymbol ? `${invoice.totalWithCcySymbol}` : 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {invoice.balanceWithCcySymbol ? `${invoice.balanceWithCcySymbol}` : 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>{renderRecipientEmails(invoice.email)}</StyledDataCell>

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
                              {invoice.invoiceUrl && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (invoice.invoiceUrl) {
                                      window.open(invoice.invoiceUrl, '_blank');
                                    }
                                  }}
                                  sx={{ padding: '2px' }}
                                  title="View Invoice"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </StyledDataCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledDataCell colSpan={columns.length} align="center">
                          <Typography variant="body2" sx={{ py: 2 }}>
                            No invoices found
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

      {/* Email Popover for displaying all recipient emails */}
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
    </>
  );
};

export default FleetInvoicesDialog;
