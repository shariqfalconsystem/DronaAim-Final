import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { RiEditBoxLine } from '@remixicon/react';
import Pagination from '../../components/molecules/pagination';
import useTableSort from '../../common/hooks/useTableSort';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  color: theme.palette.common.black,
  textAlign: 'left',
  cursor: 'pointer',
}));

interface DriverListProps {
  drivers: any;
  driversInformation: any;
  onAssignVehicle: (driverId: string) => void;
  onAssignTrip: (driverId: string) => void;
  onEdit: (driverId: string) => void;
  onDelete: (driverId: string) => void;
  onPageChange: any;
  searchQuery: string;
}

const DriverListTable: React.FC<DriverListProps> = ({
  driversInformation,
  onAssignVehicle,
  onAssignTrip,
  onEdit,
  onDelete,
  drivers,
  onPageChange,
  searchQuery,
}) => {
  const {
    displayedItems: displayedDrivers,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords,
  } = useTableSort({
    data: driversInformation?.tenants[0]?.drivers || [],
    itemsPerPage: 10,
    totalRecords: driversInformation?.pageDetails?.totalRecords,
    onPageChange,
    searchQuery,
  });

  const totalPages = Math.ceil(totalFilteredRecords / 10);

  return (
    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => theme.palette.secondary.dark }}>
            <StyledTableCell onClick={() => handleSort('driverName')}>
              Driver Name & ID
              {sortColumn === 'driverName' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </StyledTableCell>
            <StyledTableCell onClick={() => handleSort('contact.phone')}>
              Contact
              {sortColumn === 'contact.phone' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </StyledTableCell>
            <StyledTableCell onClick={() => handleSort('status')}>
              Current Status
              {sortColumn === 'status' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </StyledTableCell>
            <StyledTableCell onClick={() => handleSort('vehicleAssigned')}>
              Vehicle Assigned
              {sortColumn === 'vehicleAssigned' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </StyledTableCell>
            <StyledTableCell onClick={() => handleSort('tripDetails')}>
              Trip & Details
              {sortColumn === 'tripDetails' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </StyledTableCell>
            <StyledTableCell width="10%">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedDrivers?.map((driver: any, index: number) => {
            return (
              <TableRow
                key={driver.driverID}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box ml={2}>
                      <Typography variant="body1">{driver.driverName}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {driver.driverID}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography>{driver?.contact?.phone || 'NA'}</Typography>
                  <Typography>{driver?.contact?.email || 'NA'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={driver.status} color={driver.status === 'Active' ? 'success' : 'error'} />
                </TableCell>
                <TableCell>
                  {
                    driver.vehicleAssigned ? driver.vehicleAssigned || 'NA' : 'NA'
                    // <Button
                    //   variant="outlined"
                    //   onClick={() => onAssignVehicle(driver.driverID)}
                    //   sx={{borderRadius: 3, bgcolor: "#ECF0F1"}}
                    // >
                    //   Assign Vehicle
                    // </Button>
                  }
                </TableCell>
                <TableCell>
                  {
                    driver.tripDetails ? driver.tripDetails || 'NA' : 'NA'
                    // <Button
                    //   variant="outlined"
                    //   onClick={() => onAssignTrip(driver.driverID)}
                    //   sx={{borderRadius: 3, bgcolor: "#ECF0F1"}}
                    // >
                    //   Assign Trip
                    // </Button>
                  }
                </TableCell>
                <TableCell width="10%">
                  <Box display="flex" gap={0}>
                    <IconButton onClick={() => onEdit(driver.driverID)}>
                      <RiEditBoxLine size={20} color="black" className="edit-icon" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(driver.driverID)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalRecords={driversInformation?.tenants[0]?.drivers?.length}
        pageSize={driversInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </TableContainer>
  );
};

export default DriverListTable;
