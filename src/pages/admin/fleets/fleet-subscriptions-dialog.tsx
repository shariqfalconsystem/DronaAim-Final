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
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import { formatZohoUtcDate } from '../../../utility/utilities';
import { RiCloseCircleFill } from '@remixicon/react';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getZohoSubscriptionsByLonestarId, syncFleetFromZoho } from '../../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface FleetSubscriptionsDialogProps {
  open: boolean;
  onClose: () => void;
  fleetData: any;
  lonestarId: string;
  currentLoggedInUserId: string;
}

const FleetSubscriptionsDialog: React.FC<FleetSubscriptionsDialogProps> = ({
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
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState('Sync');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sync states
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

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
        fetchSubscriptions();
      }, 2000);
    } catch (err: any) {
      console.error('Error syncing from Zoho:', err);
      setSyncError(err.message || 'Failed to sync from Zoho');
      setSyncStatus('Sync Failed');
    } finally {
      setSyncing(false);
    }
  };

  const fetchSubscriptions = useCallback(async () => {
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
        ...(searchQueries.amountWithCcySymbol && { amount: searchQueries.amountWithCcySymbol }),
      };

      const { data } = await getZohoSubscriptionsByLonestarId(requestBody, {
        page: currentPage,
        limit: itemsPerPage,
      });

      const apiSubscriptions = data.zohoSubscriptions || [];
      const total = data.pageDetails?.totalRecords;
      const pages = Math.ceil(total / itemsPerPage);

      setSubscriptions(apiSubscriptions);
      setTotalRecords(total);
      setTotalPages(pages);

      setSyncStatus(`Sync`);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      const errorMessage = err.response?.data?.details || err.message || 'Failed to fetch subscriptions';
      setError(errorMessage);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [open, lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  useEffect(() => {
    if (open) {
      fetchSubscriptions();
    }
  }, [open, currentPage, sortColumn, sortDirection, searchQueries]);

  useEffect(() => {
    if (!open) {
      setSearchQueries({});
      setLocalSearchQueries({});
      setCurrentPage(1);
      setSortColumn(null);
      setSortDirection(null);
      setSubscriptions([]);
      setError(null);
    }
  }, [open]);

  const dateColumns = ['activatedAtUtc', 'expiresAtUtc'];

  const columns = [
    { label: 'Subscription ID', key: 'subscriptionNumber' },
    { label: 'Subscription Plan', key: 'planName' },
    { label: 'Start Date', key: 'activatedAtUtc' },
    { label: 'Expiry Date', key: 'expiresAtUtc' },
    { label: 'Status', key: 'status' },
    { label: 'Reference No', key: 'referenceId' },
    { label: 'Amount', key: 'amountWithCcySymbol' },
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
            {fleetData?.name || 'Fleet'} - Zoho Subscriptions
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
                  All Subscriptions
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
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <StyledHeadCell key={column.key}>
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
                            </Box>

                            {/* Add search field - DatePicker for date columns, TextField for others */}
                            {dateColumns.includes(column.key) ? (
                              <DatePicker
                                value={localSearchQueries[column.key] ? dayjs(localSearchQueries[column.key]) : null}
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
                                sx={{
                                  mt: 1,
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    width: '100%',
                                    height: '30px',
                                    fontSize: '0.75rem',
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </StyledHeadCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions.length > 0 ? (
                      subscriptions.map((subscription: any) => (
                        <TableRow
                          key={subscription.subscriptionNumber}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {subscription.subscriptionNumber}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {subscription.planName || '-'}
                            </Typography>
                          </StyledDataCell>

                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {formatZohoUtcDate(subscription?.activatedAtUtc)}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {formatZohoUtcDate(subscription?.expiresAtUtc)}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>{subscription.status}</StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {subscription.referenceId || 'NA'}
                            </Typography>
                          </StyledDataCell>
                          <StyledDataCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {subscription.amountWithCcySymbol ? `${subscription.amountWithCcySymbol}` : 'NA'}
                            </Typography>
                          </StyledDataCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledDataCell colSpan={columns.length} align="center">
                          <Typography variant="body2" sx={{ py: 2 }}>
                            No subscriptions found
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

export default FleetSubscriptionsDialog;
