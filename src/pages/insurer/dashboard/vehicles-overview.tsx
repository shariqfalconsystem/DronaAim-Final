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
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { getVehicleOverview } from '../../../services/insurer/IdashboardService';
import VehicleIcon from '../../../assets/icons/vehicles.png';
import Pagination from '../../../components/molecules/pagination';

interface Fleet {
  name: string;
  numberOfVehicles: number;
  highRiskVehicles: number;
  mediumRiskVehicles: number;
  lowRiskVehicles: number;
  hasWarning: boolean;
}

interface PageDetails {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
}

interface VehicleOverviewData {
  fleetVehicleOverview: Fleet[];
  pageDetails: PageDetails;
}

interface Props {
  insurerId: string | number;
}

const ITEMS_PER_PAGE = 10;

const RiskBar = ({ fleet }: { fleet: Fleet }) => {
  const total = fleet.numberOfVehicles;
  const available = fleet.highRiskVehicles + fleet.mediumRiskVehicles + fleet.lowRiskVehicles;
  const noRisk = total - available;

  if (!available) {
    const plural = noRisk === 1 ? 'Vehicle is' : 'Vehicles are';
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
                cursor: 'pointer',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#fff', position: 'absolute' }}>
                {noRisk}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  const riskSegments = [
    { count: noRisk, color: '#b3b3b3', label: 'No Risk' },
    { count: fleet.highRiskVehicles, color: '#F44336', label: 'High Risk' },
    { count: fleet.mediumRiskVehicles, color: '#FF9800', label: 'Medium Risk' },
    { count: fleet.lowRiskVehicles, color: '#4CAF50', label: 'Low Risk' },
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
          const percentage = (segment.count / total) * 100;
          if (percentage <= 0) return null;

          const plural = segment.count === 1 ? 'Vehicle is' : 'Vehicles are';
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
    { color: '#b3b3b3', label: 'No Risk Vehicles' },
    { color: '#F44336', label: 'High Risk Vehicles' },
    { color: '#FF9800', label: 'Medium Risk Vehicles' },
    { color: '#4CAF50', label: 'Low Risk Vehicles' },
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 2, overflow: 'hidden' }}>
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

const VehiclesOverviewTable: React.FC<Props> = ({ insurerId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({
    column: null as string | null,
    direction: null as 'ASC' | 'DESC' | null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<VehicleOverviewData>({
    fleetVehicleOverview: [],
    pageDetails: { totalRecords: 0, pageSize: 10, currentPage: 1 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.ceil((data.pageDetails.totalRecords || 0) / ITEMS_PER_PAGE),
    [data.pageDetails.totalRecords]
  );

  const fetchVehicleData = useCallback(async () => {
    try {
      setIsLoading(true);
      const postData = {
        insurerId,
        fleetName: searchTerm,
        sortKey: sortState.column === 'numberOfVehicles' ? 'vehicle' : sortState.column,
        sortOrder: sortState.direction,
      };

      const response = await getVehicleOverview(postData, currentPage, ITEMS_PER_PAGE);
      setData(response?.data);
    } catch (error) {
      console.error('Error fetching vehicle overview:', error);
      setData({ fleetVehicleOverview: [], pageDetails: { totalRecords: 0, pageSize: 10, currentPage: 1 } });
    } finally {
      setIsLoading(false);
    }
  }, [insurerId, searchTerm, sortState, currentPage]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

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
          <img src={VehicleIcon} alt="portfolio" width={22} height={22} />
          <Typography sx={{ fontSize: '0.875rem', ml: 1 }}>Vehicles Overview</Typography>
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
                  label="Vehicles Count by Risk"
                  column="numberOfVehicles"
                  currentSort={sortState}
                  onSort={handleSort}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.fleetVehicleOverview.length > 0 ? (
              data.fleetVehicleOverview.map((fleet, index) => (
                <TableRow
                  key={`${fleet.name}-${index}`}
                  sx={{ backgroundColor: fleet.hasWarning ? '#FFF4E5' : 'inherit' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                      {fleet.name}
                      {fleet.hasWarning && <WarningIcon sx={{ color: '#FFA000', ml: 1 }} />}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                      Total {fleet.numberOfVehicles || 0} Vehicles
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
                    <Typography variant="body1">No Vehicles Found</Typography>
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

export default VehiclesOverviewTable;
