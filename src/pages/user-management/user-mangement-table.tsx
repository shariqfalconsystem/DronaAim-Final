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
  Popover,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { StyledHeadCell } from './table-row-cell';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import { roleLabels } from '../../common/constants/general';
import Edit from '../../assets/icons/edit.png';
import { normalizeStatus } from '../../utility/utilities';
import { VehicleStatus } from '../../components/atoms/chip-with-icon';
import { useSelector } from 'react-redux';

const UserManagementTable = ({
  usersInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  handleEditUser,
}: any) => {
  const navigate = useNavigate();
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const allowedRoles = ['fleetManager', 'fleetManagerSuperUser', 'driver'];

  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverData, setPopoverData] = useState<any[]>([]);
  const [popoverType, setPopoverType] = useState<'roles' | 'orgs'>('roles');

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    const timestamp = key === 'startDate' ? date.startOf('day').valueOf() : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
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

    if (value === '') {
      delete newQueries[column];
    }

    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const getFilteredMappings = (mappings: any[]) => {
    if (!mappings || !lonestarId) {
      return mappings || [];
    }
    return mappings.filter((mapping) => mapping.lonestarId === lonestarId && allowedRoles.includes(mapping.role));
  };

  // Helper function to get organization name
  const getOrgName = (mapping: any) => {
    if (mapping.role === 'admin') {
      return 'DronaAim';
    }
    return mapping.orgName || 'NA';
  };

  // Helper function to handle popup display
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, data: any[], type: 'roles' | 'orgs') => {
    if (data.length > 1) {
      setPopoverAnchor(event.currentTarget);
      setPopoverData(data);
      setPopoverType(type);
    }
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverData([]);
  };

  // Helper function to render organization without additional count
  const renderOrganization = (mappings: any[]) => {
    const filteredMappings = getFilteredMappings(mappings);

    if (!filteredMappings || filteredMappings.length === 0) {
      return 'DronaAim';
    }

    const firstItem = filteredMappings[0];
    return getOrgName(firstItem);
  };

  // Helper function to render roles with additional count
  const renderRoles = (mappings: any[], user: any) => {
    const filteredMappings = getFilteredMappings(mappings);

    if (!filteredMappings || filteredMappings.length === 0) {
      return 'NA';
    }

    const firstItem = filteredMappings[0];
    const displayText = roleLabels[firstItem.role] || firstItem.role;
    const additionalCount = filteredMappings.length - 1;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ height: '20px', fontSize: '0.7rem' }}>
          {displayText}
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
            onClick={(e) => handlePopoverOpen(e, filteredMappings, 'roles')}
          />
        )}
      </Box>
    );
  };

  const columns = [
    { label: 'User ID', key: 'userId' },
    { label: 'Name', key: 'firstAndLastName' },
    { label: 'Last Login', key: 'lastLoginAtDisplay' },
    { label: 'Email', key: 'emailId' },
    { label: 'Phone No.', key: 'phone' },
    { label: 'Organization', key: 'organization' },
    { label: 'Role', key: 'role' },
    { label: 'Status', key: 'activeStatus' },
    { label: 'Action', key: 'actions' },
  ];

  const totalPages = Math.ceil(usersInformation?.pageDetails?.totalRecords / 10) || 1;

  return (
    <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
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
        <Table
          ref={tableRef}
          sx={{
            width: '120%',
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
                      {key !== 'actions' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
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
                        </Box>
                      )}
                    </Typography>
                    {['startDate', 'endDate']?.includes(key) ? (
                      <DatePicker
                        value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                        onChange={(date) => handleDateChange(date, key)}
                        placeholder={``}
                        format="MM-DD-YYYY"
                        style={{ marginTop: 8, width: '100%' }}
                      />
                    ) : key !== 'actions' ? (
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
                    ) : null}
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {usersInformation?.users && usersInformation?.users?.length > 0 ? (
              usersInformation?.users?.map((user: any) => {
                const formattedUserStatus: VehicleStatus = normalizeStatus(user?.activeStatus);
                const orgRoleMappings = user?.orgRoleAndScoreMapping || [];

                return (
                  <TableRow
                    key={user.userId}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <StyledDataCell
                      width="7%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      {user.userId}
                    </StyledDataCell>
                    <StyledDataCell width="8%">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'NA'}
                    </StyledDataCell>{' '}
                    <StyledDataCell width="8%">{`${user.lastLoginAtDisplay || 'NA'}`}</StyledDataCell>
                    <StyledDataCell width="10%">{user.emailId}</StyledDataCell>
                    <StyledDataCell width="8%">
                      {user?.primaryPhoneCtryCd && user?.primaryPhone
                        ? `${user.primaryPhoneCtryCd} ${user.primaryPhone}`
                        : 'NA'}
                    </StyledDataCell>
                    <StyledDataCell>{renderOrganization(orgRoleMappings)}</StyledDataCell>
                    <StyledDataCell>{renderRoles(orgRoleMappings, user)}</StyledDataCell>
                    <StyledDataCell>
                      <ChipWithIcon status={formattedUserStatus} />
                    </StyledDataCell>
                    <StyledDataCell
                      sx={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(50px)',
                        background: '#f5f5f5',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                        padding: '10px',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <IconButton onClick={() => handleEditUser(user)}>
                          <img src={Edit} alt="Edit" width={20} height={20} />
                        </IconButton>
                      </Box>
                    </StyledDataCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1">No Users Found</Typography>
                  </Box>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            {popoverType === 'roles' ? 'All Roles:' : 'All Organizations:'}
          </Typography>
          <List dense>
            {popoverData.map((item, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={popoverType === 'roles' ? roleLabels[item.role] || item.role : getOrgName(item)}
                  secondary={popoverType === 'roles' ? getOrgName(item) : roleLabels[item.role] || item.role}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalRecords={usersInformation?.pageDetails?.totalRecords}
        pageSize={usersInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default UserManagementTable;
