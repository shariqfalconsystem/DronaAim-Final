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
  Tooltip,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { formatDateString, formatScore, formatTotalDistance } from '../../../utility/utilities';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import Pagination from '../../../components/molecules/pagination';
import debounce from 'lodash/debounce';
import { paths } from '../../../common/constants/routes';
import ContractsIcon from '../../../assets/icons/contracts-icon.png';
import InvoicesIcon from '../../../assets/icons/invoices-icon.png';
import SubscriptionIcon from '../../../assets/icons/subscription-icon.png';
import { useSelector } from 'react-redux';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import FleetContractsDialog from './fleet-contracts-dialog';
import FleetInvoicesDialog from './fleet-invoices-dialog';
import FleetSubscriptionsDialog from './fleet-subscriptions-dialog';

const FleetListTable: React.FC<any> = ({
  fleetInformation,
  searchQueries,
  setSearchQueries,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  onEditFleet,
  onDeleteFleet,
  isUnInsuredFleet,
}) => {
  const navigate = useNavigate();
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fleetToDelete, setFleetToDelete] = useState<any>(null);
  const [contractsDialogOpen, setContractsDialogOpen] = useState(false);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [subscriptionsDialogOpen, setSubscriptionsDialogOpen] = useState(false);
  const [selectedFleetForContracts, setSelectedFleetForContracts] = useState<any>(null);
  const [selectedFleetForInvoices, setSelectedFleetForInvoices] = useState<any>(null);
  const [selectedFleetForSubscriptions, setSelectedFleetForSubscriptions] = useState<any>(null);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      setSearchQueries(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
      onSearch(queries);
    }, 1000),
    [onSearch, setSearchQueries, setCurrentPage, setSearchParams]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: any) => {
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

    const timestamp =
      key === 'termEffectiveDate' ||
      key === 'termExpiryDate' ||
      key === 'contractEffectiveDate' ||
      key === 'contractExpiryDate'
        ? date.startOf('day').valueOf()
        : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleContractOpen = (e: React.MouseEvent, fleet: any) => {
    e.stopPropagation();
    setSelectedFleetForContracts(fleet);
    setContractsDialogOpen(true);
  };

  const handleInvoicesOpen = (e: React.MouseEvent, fleet: any) => {
    e.stopPropagation();
    setSelectedFleetForInvoices(fleet);
    setInvoicesDialogOpen(true);
  };

  const handleSubcriptionsOpen = (e: React.MouseEvent, fleet: any) => {
    e.stopPropagation();
    setSelectedFleetForSubscriptions(fleet);
    setSubscriptionsDialogOpen(true);
  };

  const columns = [
    { label: 'Insured ID', key: 'insuredId' },
    { label: 'Fleet ID', key: 'lonestarId' },
    { label: 'Fleet Name', key: 'name' },
    { label: 'Organization ID', key: 'insurerId' },
    { label: 'Organization Name', key: 'organizationName' },
    { label: 'DOT No.', key: 'dotNumber' },
    { label: 'Fleet Score', key: 'meanScore' },
    { label: 'Miles - Last 30 Days', key: 'lastThirtyDayTotalDistanceInMiles' },
    { label: 'Primary Contact', key: 'primaryContactFullName' },
    { label: 'Phone', key: 'primaryContactPhone' },
    { label: 'Email', key: 'primaryContactEmail' },
    { label: 'Policy Number', key: 'policyNumber' },
    { label: ' Policy Status', key: 'policyStatus' },
    { label: 'Policy Effective Date', key: 'termEffectiveDate' },
    { label: 'Policy Expiry Date', key: 'termExpiryDate' },

    { label: 'Action', key: 'actions' },
  ];

  const totalPages =
    Math.ceil(fleetInformation?.pageDetails?.totalRecords / fleetInformation?.pageDetails?.pageSize) || 1;

  return (
    <>
      <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
        <TableContainer
          ref={containerRef}
          component={Paper}
          onScroll={handleScroll}
          sx={{
            borderCollapse: 'separate',
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
          <Table
            ref={tableRef}
            sx={{
              width: '100%',
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map(({ label, key }, index) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      position: index === 0 || key === 'actions' ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: key === 'actions' ? 0 : 'auto',
                      zIndex: index === 0 || key === 'actions' ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: key === 'actions' ? '#EDF0F5' : 'auto',
                    }}
                  >
                    <Box>
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
                        onClick={() => {
                          key !== 'startLocation' && key !== 'endLocation';
                        }}
                        component={'span'}
                      >
                        {label}
                        {key !== 'actions' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                            <>
                              <TbTriangleFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'DESC')}
                              />
                            </>
                          </Box>
                        )}
                      </Typography>
                      {['termEffectiveDate', 'termExpiryDate', 'contractEffectiveDate', 'contractExpiryDate']?.includes(
                        key
                      ) ? (
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
              {fleetInformation?.fleetCompanies?.length > 0 ? (
                fleetInformation.fleetCompanies.map((fleet: any) => {
                  const formattedStatus: any =
                    fleet?.lookup_Policies?.[0]?.active !== undefined
                      ? fleet.lookup_Policies[0].active
                        ? 'Active'
                        : 'Expired'
                      : 'NA';

                  const formattedContractStatus: any =
                    fleet?.lookup_Contracts?.[0]?.active !== undefined
                      ? fleet.lookup_Contracts[0].active
                        ? 'Active'
                        : 'Expired'
                      : 'NA';

                  return (
                    <TableRow
                      key={fleet?.lonestarId}
                      onClick={() => {
                        navigate(`${paths.ADMINFLEETDETAILS}/${fleet?.lonestarId}/`, {
                          state: fleet,
                        });
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <StyledDataCell
                        width="8%"
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          whiteSpace: 'nowrap',
                          backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                            {fleet?.insuredId || 'NA'}
                          </Typography>
                        </Box>
                      </StyledDataCell>
                      <StyledDataCell>{fleet?.lonestarId || 'NA'}</StyledDataCell>
                      <StyledDataCell>
                        <a
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget.style.textDecoration = 'underline'),
                              (e.currentTarget.style.color = 'blue');
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget.style.color = 'inherit'), (e.currentTarget.style.textDecoration = 'none');
                          }}
                        >
                          {fleet?.name || 'NA'}
                        </a>
                      </StyledDataCell>
                      <StyledDataCell>{fleet?.lookup_FleetInsurers?.[0]?.insurerId || 'NA'}</StyledDataCell>
                      <StyledDataCell>{fleet?.lookup_FleetInsurers?.[0]?.name || 'NA'}</StyledDataCell>
                      <StyledDataCell>{fleet?.dotNumber || 'NA'}</StyledDataCell>
                      <StyledDataCell width={25}>
                        <VehicleSafetyScoreBox
                          score={formatScore(fleet?.meanScore)}
                          label=""
                          width={100}
                          height={35}
                          imageHeight={15}
                          textSize="0.85rem"
                          textColored={true}
                        />
                      </StyledDataCell>
                      <StyledDataCell>
                        {fleet?.lastThirtyDayTotalDistanceInMiles
                          ? formatTotalDistance(fleet?.lastThirtyDayTotalDistanceInMiles)
                          : '0'}
                      </StyledDataCell>
                      <StyledDataCell>
                        {fleet?.primaryContactFullName ? `${fleet?.primaryContactFullName}` : 'NA'}
                      </StyledDataCell>
                      <StyledDataCell>{fleet?.primaryContactPhone || 'NA'}</StyledDataCell>
                      <StyledDataCell>{fleet?.primaryContactEmail || 'NA'}</StyledDataCell>
                      <StyledDataCell>{fleet?.lookup_Policies?.[0]?.policyId || 'NA'}</StyledDataCell>
                      <StyledDataCell>{<ChipWithIcon status={formattedStatus} />}</StyledDataCell>
                      <StyledDataCell>
                        {formatDateString(fleet?.lookup_Policies?.[0]?.termEffectiveDateUtc)}
                      </StyledDataCell>
                      <StyledDataCell>
                        {formatDateString(fleet?.lookup_Policies?.[0]?.termExpiryDateUtc)}
                      </StyledDataCell>
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Tooltip title="All Contracts" arrow>
                            <IconButton onClick={(e: any) => handleContractOpen(e, fleet)}>
                              <img src={InvoicesIcon} alt="all-contracts" width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="All Invoices" arrow>
                            <IconButton onClick={(e) => handleInvoicesOpen(e, fleet)}>
                              <img src={ContractsIcon} alt="all-invoices" width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="All Subscriptions" arrow>
                            <IconButton onClick={(e) => handleSubcriptionsOpen(e, fleet)}>
                              <img src={SubscriptionIcon} alt="all-subscriptions" width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </StyledDataCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <StyledDataCell colSpan={columns.length} align="center">
                    <Typography variant="body1">No Fleets Found</Typography>
                  </StyledDataCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 0}
          onPageChange={(page) => {
            setCurrentPage(page);
            setSearchParams({ page: page.toString() });
            onPageChange(page);
          }}
          totalRecords={fleetInformation?.pageDetails?.totalRecords}
          pageSize={fleetInformation?.pageDetails?.pageSize}
          isDefaultList={true}
        />
      </Box>

      {/* Contracts Dialog */}
      <FleetContractsDialog
        open={contractsDialogOpen}
        onClose={() => setContractsDialogOpen(false)}
        fleetData={selectedFleetForContracts}
        lonestarId={selectedFleetForContracts?.lonestarId}
        currentLoggedInUserId={currentUserId}
      />

      {/* Invoices Dialog */}
      <FleetInvoicesDialog
        open={invoicesDialogOpen}
        onClose={() => setInvoicesDialogOpen(false)}
        fleetData={selectedFleetForInvoices}
        lonestarId={selectedFleetForInvoices?.lonestarId}
        currentLoggedInUserId={currentUserId}
      />

      <FleetSubscriptionsDialog
        open={subscriptionsDialogOpen}
        onClose={() => setSubscriptionsDialogOpen(false)}
        fleetData={selectedFleetForSubscriptions}
        lonestarId={selectedFleetForSubscriptions?.lonestarId}
        currentLoggedInUserId={currentUserId}
      />
    </>
  );
};

export default FleetListTable;
