import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Chip,
  ListItem,
  ListItemText,
  List,
  Popover,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import Pagination from '../../components/molecules/pagination';
import { getInvoicesByLonestarId } from '../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { formatZohoUtcDate } from '../../utility/utilities';

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
//   invoiceUrl: string;
// }

interface FleetInvoicesProps {
  lonestarId: string;
  currentLoggedInUserId: string;
  fleetData?: any;
}

const FleetInvoices: React.FC<FleetInvoicesProps> = ({ lonestarId, currentLoggedInUserId, fleetData }) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [syncStatus, setSyncStatus] = useState('Sync');
  const [emailPopoverAnchor, setEmailPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverEmails, setPopoverEmails] = useState<string[]>([]);

  const itemsPerPage = 5;

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const debouncedSearch = useCallback(
    debounce((queries: Record<string, any>) => {
      setSearchQueries(queries);
      setCurrentPage(1);
    }, 500),
    []
  );
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

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: string) => {
    const newQueries = { ...localSearchQueries, [column]: value };
    if (value === '') delete newQueries[column];
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const fetchInvoices = useCallback(async () => {
    if (!lonestarId || !currentLoggedInUserId) return;
    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        lonestarId,
        currentLoggedInUserId,
        ...(sortColumn && sortDirection && { sortKey: sortColumn, sortOrder: sortDirection }),
        ...searchQueries,
      };

      const response = await getInvoicesByLonestarId(requestBody, currentPage, itemsPerPage);

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
      setInvoices([]);
      setError(err.message || 'Failed to fetch invoices');
      setSyncStatus('Sync Failed');
    } finally {
      setLoading(false);
    }
  }, [lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleRefresh = () => fetchInvoices();

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

  const columns = [
    { label: 'Zoho Subscription ID', key: 'zohoSubscriptionId' },
    { label: 'Invoice ID', key: 'invoiceNumber' },
    { label: 'Invoice Link', key: 'invoiceUrl' },
    { label: 'Status', key: 'status' },
    { label: 'Invoice Date', key: 'dateUtc' },
    { label: 'Due Date', key: 'dueDateUtc' },
    { label: 'Reference #', key: 'referenceNumber' },
    { label: 'Amount', key: 'total' },
    { label: 'Balance Due', key: 'balance' },
    { label: 'Recipient Email', key: 'email' },
    { label: 'Action', key: 'action' },
  ];

  const dateColumns = ['dateUtc', 'dueDateUtc'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // if (error) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
  //       <Typography color="error">{error}</Typography>
  //     </Box>
  //   );
  // }

  return (
    <>
      <Box sx={{ whiteSpace: 'nowrap', width: '81vw' }}>
        <TableContainer
          component={Paper}
          onScroll={handleScroll}
          sx={{
            maxHeight: '60vh',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '10px',
              cursor: 'pointer !important',
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
          <Table sx={{ width: '130%' }}>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 600 }}>
                          {label}
                        </Typography>
                        {key !== 'action' && key !== 'invoiceLink' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                            <TbTriangleFilled
                              size={8}
                              color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'ASC')}
                              style={{ cursor: 'pointer' }}
                            />
                            <TbTriangleInvertedFilled
                              size={8}
                              color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'DESC')}
                              style={{ cursor: 'pointer' }}
                            />
                          </Box>
                        )}
                      </Box>

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
                              disabled={key === 'invoiceLink'}
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
                invoices.map((invoice) => (
                  <TableRow key={invoice.invoiceId} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
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
                      {invoice.zohoSubscriptionId || 'NA'}
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
                    <StyledDataCell>{invoice.referenceNumber || 'NA'}</StyledDataCell>
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
                      {invoice.invoiceUrl && (
                        <IconButton
                          size="small"
                          onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                          sx={{ padding: '2px' }}
                          title="View Invoice"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                    </StyledDataCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledDataCell colSpan={columns.length} align="center">
                    <Typography variant="body2" sx={{ py: 2 }}>
                      No Invoices Found
                    </Typography>
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
    </>
  );
};

export default FleetInvoices;
