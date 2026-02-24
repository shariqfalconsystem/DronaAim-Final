import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import Pagination from '../../components/molecules/pagination';

const FuelTransactionListTable: React.FC<any> = ({
  fuelTransInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
}: any) => {
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setSearchQueries(queries);
    }, 1000),
    [onSearch, setSearchQueries]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: any) => {
    const newQueries = { ...localSearchQueries, [column]: value };
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

    const timestamp =
      key === 'lastStatusPing' || key === 'lastLocationPing'
        ? date.startOf('day').valueOf()
        : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const columns = [
    { label: 'Card Number', key: 'cardNumber' },
    { label: 'Card Name', key: 'cardName' },
    { label: 'Driver Name', key: 'driverName' },
    { label: 'Transaction Date', key: 'txnDate' },
    { label: 'Vehicle', key: 'unit' },
    { label: 'Odometer', key: 'odometer' },
    { label: 'Location', key: 'locationName' },
    { label: 'Jurisdiction', key: 'stateProvince' },
    { label: 'Fees', key: 'fees' },
    { label: 'Item', key: 'item' },
    { label: 'Unit Price', key: 'unitPrice' },
    { label: 'Quantity', key: 'qty' },
    { label: 'Amount', key: 'amount' },
    { label: 'Currency', key: 'currency' },
  ];

  const totalPages =
    Math.ceil(fuelTransInformation?.pageDetails?.totalRecords / fuelTransInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box sx={{ maxWidth: '81.8vw', overflowX: 'auto' }}>
      <TableContainer
        ref={containerRef}
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
                    right: index === columns.length - 1 ? 0 : 'auto',
                    zIndex: index === 0 ? 2 : 'auto',
                    backdropFilter: 'blur(50px)',
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
                        {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && (
                          <>
                            <TbTriangleFilled
                              size={9}
                              color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'ASC')}
                            />
                            <TbTriangleInvertedFilled
                              size={9}
                              color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'DESC')}
                            />
                          </>
                        )}
                      </Box>
                    </Typography>

                    {['lastStatusPing', 'lastLocationPing']?.includes(key) ? (
                      <DatePicker
                        value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                        onChange={(date) => handleDateChange(date, key)}
                        placeholder={``}
                        format="MM-DD-YYYY"
                        style={{ marginTop: 8, width: '100%' }}
                      />
                    ) : (
                      key !== 'actions' && (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={localSearchQueries[key] || ''}
                          onChange={(e) => handleColumnSearch(key, e.target.value)}
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              width: '100%',
                              height: '30px',
                            },
                          }}
                        />
                      )
                    )}
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fuelTransInformation?.iftaFuelTransactions && fuelTransInformation?.iftaFuelTransactions?.length > 0 ? (
              fuelTransInformation?.iftaFuelTransactions?.map((txn: any, index: number) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: txn.isOrphaned ? '#f0f0f0' : 'transparent',
                    color: txn.isOrphaned ? '#a1a1a1' : 'inherit',
                    cursor: txn.isOrphaned ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: txn.isOrphaned ? '#f0f0f0' : '#f5f5f5',
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
                      background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                      <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                        {txn.cardNumber
                          ? txn.cardNumber.length > 4
                            ? '*'.repeat(txn.cardNumber.length - 4) + txn.cardNumber.slice(-4)
                            : txn.cardNumber
                          : 'NA'}
                      </Typography>
                    </Box>
                  </StyledDataCell>
                  <StyledDataCell> {txn?.cardName || 'NA'} </StyledDataCell>
                  <StyledDataCell>{txn?.driverName || 'NA'}</StyledDataCell>
                  <StyledDataCell>{txn?.txnDate || 'NA'}</StyledDataCell>
                  <StyledDataCell>
                    {txn?.unit
                      ? isNaN(txn.unit)
                        ? txn.unit
                        : parseFloat(txn.unit).toString().replace(/\.0+$/, '')
                      : 'NA'}
                  </StyledDataCell>{' '}
                  <StyledDataCell>{txn?.odometer}</StyledDataCell>
                  <StyledDataCell>{txn?.locationName || 'NA'}</StyledDataCell>
                  <StyledDataCell>{txn?.stateProvince}</StyledDataCell>
                  <StyledDataCell>{txn?.fees}</StyledDataCell>
                  <StyledDataCell>{txn?.item} </StyledDataCell>
                  <StyledDataCell>{txn?.unitPrice}</StyledDataCell>
                  <StyledDataCell>{txn?.qty}</StyledDataCell>
                  <StyledDataCell>{txn?.amount}</StyledDataCell>
                  <StyledDataCell>{txn?.currency}</StyledDataCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography> No Fuel Transactions Found</Typography>
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
        totalRecords={fuelTransInformation?.pageDetails?.totalRecords}
        pageSize={fuelTransInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default FuelTransactionListTable;
