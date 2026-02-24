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
} from '@mui/material';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import { formatZohoUtcDate } from '../../../utility/utilities';
import { RiCloseCircleFill } from '@remixicon/react';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getZohoSubscriptionsByLonestarId } from '../../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface FleetSubscriptionsDialogProps {
  open: boolean;
  onClose: () => void;
  fleetData: any;
  lonestarId: string;
  currentLoggedInUserId: string;
  onEditSubscription?: (subscriptionId: string) => void;
  onDownloadSubscription?: (subscriptionId: string) => void;
}

const FleetSubscriptionsDialog: React.FC<FleetSubscriptionsDialogProps> = ({
  open,
  onClose,
  fleetData,
  lonestarId,
  currentLoggedInUserId,
  onEditSubscription,
  onDownloadSubscription,
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
  const [syncStatus, setSyncStatus] = useState('Syncing...');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 5;

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

  // Handle column search with debouncing
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
  // Handle sorting
  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  // Fetch subscriptions from API

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

      // Handle response
      const apiSubscriptions = data.zohoSubscriptions || [];
      const total = data.pageDetails?.totalRecords || apiSubscriptions.length;
      const pages = Math.ceil(total / itemsPerPage);

      setSubscriptions(apiSubscriptions);
      setTotalRecords(total);
      setTotalPages(pages);

      setSyncStatus(`Sync`);
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
      console.error('Error fetching subscriptions:', err);
      const errorMessage = err.response?.data?.details || err.message || 'Failed to fetch subscriptions';
      setError(errorMessage);
      setSyncStatus('Sync Failed');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [open, lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  // Fetch subscriptions when dependencies change
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Reset state when dialog closes
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

  const handleRefresh = () => {
    fetchSubscriptions();
  };

  const columns = [
    { label: 'Subscription ID', key: 'subscriptionNumber' },
    { label: 'Subscription Plan', key: 'planName' },
    { label: 'Start Date', key: 'activatedAtUtc' },
    { label: 'Expiry Date', key: 'expiresAtUtc' },
    { label: 'Status', key: 'status' },
    { label: 'Reference No', key: 'referenceId' },
    { label: 'Amount', key: 'amountWithCcySymbol' },
  ];
  const dateColumns = ['activatedAtUtc', 'expiresAtUtc'];

  return (
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
              sx={{
                maxHeight: '60vh',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
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
                        <Box>
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
  );
};

export default FleetSubscriptionsDialog;
