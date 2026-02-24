import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getDriverOverview } from '../../../services/insurer/IdashboardService';
import DriverIcon from '../../../assets/icons/drivers.png';
import Pagination from '../../../components/molecules/pagination';

interface Fleet {
  name: string;
  numberOfDrivers: number;
  highRiskDriver: number;
  mediumRiskDriver: number;
  lowRiskDriver: number;
  noRiskDriver: number;
  hasWarning: boolean;
}

interface PageDetails {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
}

interface DriverOverviewData {
  fleetDriverOverview: Fleet[];
  pageDetails: PageDetails;
}

interface Props {
  insurerId: string | number;
}

const ITEMS_PER_PAGE = 10;

const RiskBar = ({ fleet }: { fleet: Fleet }) => {
  const total = fleet.numberOfDrivers;
  const available = fleet.highRiskDriver + fleet.mediumRiskDriver + fleet.lowRiskDriver + fleet.noRiskDriver;
  const noRisk = total - available;

  if (!available) {
    const plural = noRisk === 1 ? 'Driver is' : 'Drivers are';
    const tooltipMsg = `${noRisk} ${plural} on No Risk`;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            height: 16,
            borderRadius: 5,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Tooltip title={tooltipMsg} arrow placement="bottom">
            <Box
              sx={{
                width: '100%',
                backgroundColor: '#b3b3b3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#fff', position: 'absolute' }}>
                {available}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  const riskSegments = [
    { count: fleet.noRiskDriver, color: '#b3b3b3', label: 'No Risk' },
    { count: fleet.highRiskDriver, color: '#F44336', label: 'High Risk' },
    { count: fleet.mediumRiskDriver, color: '#FF9800', label: 'Medium Risk' },
    { count: fleet.lowRiskDriver, color: '#4CAF50', label: 'Low Risk' },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          height: 16,
          borderRadius: 5,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {riskSegments.map((segment, index) => {
          if (segment.count <= 0) return null;
          const percentage = (segment.count / total) * 100;
          const plural = segment.count === 1 ? 'Driver is' : 'Drivers are';
          const tooltipMsg = `${segment.count} ${plural} on ${segment.label}`;

          return (
            <Tooltip key={index} title={tooltipMsg} arrow placement="bottom">
              <Box
                sx={{
                  width: `${percentage}%`,
                  backgroundColor: segment.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.7rem',
                    color: '#fff',
                    position: 'absolute',
                  }}
                >
                  {segment.count}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

const SortableHeader = ({ label, column, currentSort, onSort }: any) => (
  <Box sx={{ display: 'flex', cursor: 'pointer' }}>
    <Typography sx={{ fontSize: '0.875rem' }}>{label}</Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
      <TbTriangleFilled
        size={9}
        color={currentSort.column === column && currentSort.direction === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
        onClick={() => onSort(column, 'ASC')}
      />
      <TbTriangleInvertedFilled
        size={9}
        color={currentSort.column === column && currentSort.direction === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
        onClick={() => onSort(column, 'DESC')}
      />
    </Box>
  </Box>
);

const RiskLegend = () => {
  const legends = [
    { color: '#b3b3b3', label: 'No Risk Drivers' },
    { color: '#F44336', label: 'High Risk Drivers' },
    { color: '#FF9800', label: 'Medium Risk Drivers' },
    { color: '#4CAF50', label: 'Low Risk Drivers' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 1,
        p: 2,
        flexWrap: 'wrap',
        gap: 0.5,
      }}
    >
      {legends.map(({ color, label }) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: color, mr: 0.5 }} />
          <Typography variant="caption" noWrap>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const DriversOverviewTable: React.FC<Props> = ({ insurerId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({
    column: null as string | null,
    direction: null as 'ASC' | 'DESC' | null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<DriverOverviewData>({
    fleetDriverOverview: [],
    pageDetails: { totalRecords: 0, pageSize: 10, currentPage: 1 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.ceil((data.pageDetails.totalRecords || 0) / ITEMS_PER_PAGE),
    [data.pageDetails.totalRecords]
  );

  const fetchDriverData = useCallback(async () => {
    try {
      setIsLoading(true);
      const postData = {
        insurerId,
        fleetName: searchTerm,
        sortKey: sortState.column === 'numberOfDrivers' ? 'driver' : sortState.column,
        sortOrder: sortState.direction,
      };

      const response = await getDriverOverview(postData, currentPage, ITEMS_PER_PAGE);
      setData(response?.data);
    } catch (error) {
      console.error('Error fetching driver overview:', error);
      setData({
        fleetDriverOverview: [],
        pageDetails: { totalRecords: 0, pageSize: 10, currentPage: 1 },
      });
    } finally {
      setIsLoading(false);
    }
  }, [insurerId, searchTerm, sortState, currentPage]);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  const handleSort = useCallback((column: string, direction: 'ASC' | 'DESC') => {
    setSortState({ column, direction });
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  return (
    <Paper sx={{ height: 'auto', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flex: 1, px: 1 }}>
          <img src={DriverIcon} alt="portfolio" width={22} height={22} />
          <Typography sx={{ fontSize: '0.875rem', ml: 1 }}>Drivers Overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, px: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search Fleet Name"
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                background: '#fff',
                height: 40,
              },
            }}
          />
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#3F5C7826', padding: 0 }}>
              <TableCell>
                <SortableHeader label="Fleets" column="name" currentSort={sortState} onSort={handleSort} />
              </TableCell>
              <TableCell>
                <SortableHeader
                  label="Drivers Count by Risk"
                  column="numberOfDrivers"
                  currentSort={sortState}
                  onSort={handleSort}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.fleetDriverOverview.length > 0 ? (
              data.fleetDriverOverview.map((fleet, index) => (
                <TableRow
                  key={`${fleet.name}-${index}`}
                  sx={{ backgroundColor: fleet.hasWarning ? '#FFF4E5' : 'inherit' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', textWrap: 'nowrap' }}>
                      {fleet.name}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                      Total {fleet.numberOfDrivers || 0} Drivers
                    </Typography>
                  </TableCell>
                  <TableCell width="50%">
                    <RiskBar fleet={fleet} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                    <Typography variant="body1">No Drivers Found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RiskLegend />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRecords={data.pageDetails.totalRecords}
        pageSize={ITEMS_PER_PAGE}
        isDefaultList={false}
      />
    </Paper>
  );
};

export default DriversOverviewTable;
