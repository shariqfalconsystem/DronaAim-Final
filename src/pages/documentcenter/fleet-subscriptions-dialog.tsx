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
  CircularProgress,
} from '@mui/material';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import { formatZohoUtcDate } from '../../utility/utilities';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getZohoSubscriptionsByLonestarId } from '../../services/admin/fleetServices';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface FleetSubscriptionsProps {
  lonestarId: string;
  currentLoggedInUserId: string;
}

const FleetSubscriptions: React.FC<FleetSubscriptionsProps> = ({ lonestarId, currentLoggedInUserId }) => {
  const [searchQueries, setSearchQueries] = useState<Record<string, any>>({});
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  // API related states
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState('Syncing...');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      const total = data.pageDetails?.totalRecords;
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
      setSubscriptions([]);
      const errorMessage = err.response?.data?.details || err.message || 'Failed to fetch subscriptions';
      setError(errorMessage);
      setSyncStatus('Sync Failed');
    } finally {
      setLoading(false);
    }
  }, [open, lonestarId, currentLoggedInUserId, currentPage, sortColumn, sortDirection, searchQueries, itemsPerPage]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                      </Box>
                    </Typography>
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
                        sx={{
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            width: '100%',
                            height: '30px',
                            backgroundColor: 'white',
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
                    backgroundColor: 'transparent',
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
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {subscription.subscriptionNumber}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
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
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {subscription.status}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                      {subscription.referenceId || 'NA'}
                    </Typography>
                  </StyledDataCell>
                  <StyledDataCell>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {subscription.amountWithCcySymbol ? `${subscription.amountWithCcySymbol}` : 'NA'}
                    </Typography>
                  </StyledDataCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography variant="body1">No Subscriptions Found</Typography>
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
  );
};

export default FleetSubscriptions;
