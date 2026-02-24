import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Container, Box } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import { FilterUserManagementDialog } from '../../components/modals/filter-usermanagement';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../redux/admin/usermanagement/usersSlice';
import UserManagementTable from './user-mangement-table';
import AddUserPopup from './add-user-popup';
import { roleLabels } from '../../common/constants/general';
import { getOrganizations, getRoles } from '../../services/insurer/IUserMangtService';
import { getFmUsers, downloadUsers } from '../../services/fleetManager/userMangtService';
import { getOrgTypeMap } from '../../services/admin/userMangementService';
import { toast } from 'react-toastify';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);

  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [usersInformation, setUsersInformation] = useState<any>(null);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [isAddUserPopupOpen, setAddUserPopupOpen] = useState<any>(false);

  const [organizationsTypes, setOrganizationsTypes] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [mode, setMode] = useState<any>('add');
  const [editUserData, setEditUserData] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const itemsPerPage = 10;
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentUserOrg = useSelector((state: any) => state.auth.userData?.currentOrganization);

  const roleReverseMapping = Object.fromEntries(
    Object.entries(roleLabels).map(([key, value]: any) => [value.toLowerCase(), key])
  );

  const getMappedRole = (input: string) => {
    if (!input) return undefined;
    const lowerInput = input.toLowerCase();

    // Find all roles that start with the input
    const matchedRoles = Object.entries(roleReverseMapping)
      .filter(([label]) => label.startsWith(lowerInput))
      .map(([_, roleKey]) => roleKey);

    // If only one match is found, return the mapped role
    return matchedRoles.length === 1 ? matchedRoles[0] : input.replace(/\s+/g, '');
  };

  // Initialize default filter on component mount
  useEffect(() => {
    if (isInitialLoad && currentUserId) {
      // Set default filter criteria: only active users
      const defaultFilters = {
        active: true,
        inactive: false,
      };

      // Check if filter criteria is empty (first load)
      if (!filterCriteria.active && !filterCriteria.inactive) {
        dispatch(setFilterCriteria(defaultFilters));
      }

      setIsInitialLoad(false);
    }
  }, [currentUserId, isInitialLoad, dispatch, filterCriteria]);

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const mappedRole = getMappedRole(searchParams?.role);

        const statusInput = searchParams?.activeStatus?.toLowerCase() || '';
        const isPartialActive = 'active'.startsWith(statusInput) && statusInput?.length <= 'active'.length;
        const isPartialInactive = 'inactive'.startsWith(statusInput) && statusInput?.length <= 'inactive'.length;

        const dynamicStatus = isPartialActive ? 'active' : isPartialInactive ? 'inactive' : searchParams?.activeStatus;
        const typeStatus: Record<string, string> = {
          active: 'active',
          inactive: 'inactive',
        };

        const status = Object.keys(filterCriteria)
          .filter((key) => typeStatus[key] && filterCriteria[key])
          .map((key) => typeStatus[key]);
        const requestBody: any = {
          ...params,
          lonestarId,
          organization: currentUserOrg,
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(searchParams && {
            ...searchParams,
            role: mappedRole,
          }),
          ...(searchParams?.activeStatus && { activeStatus: dynamicStatus }),
        };

        if (status.length > 0 && status.length < 2) {
          requestBody.status = status;
        }

        const { data } = await getFmUsers(currentUserId, page, itemsPerPage, requestBody);
        setUsersInformation(data);
      } catch (error) {
        console.error('Error fetching user information:', error);
        setUsersInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, itemsPerPage, filterCriteria, sortParams, searchParams]
  );

  const fetchOrganizationsTypes = async () => {
    try {
      const { data } = await getOrgTypeMap();
      setOrganizationsTypes(data?.orgTypes);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizationsTypes([]);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data } = await getOrganizations();

      setOrganizations(data?.fleetCompanies);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  };

  const fetchRoles = async (persona: string = 'admin') => {
    try {
      const { data } = await getRoles(persona);

      const filteredRoles = data?.roles?.filter((role: any) =>
        ['driver', 'fleetManager', 'fleetManagerSuperUser'].includes(role)
      );

      setRoles(
        filteredRoles?.map((role: any) => ({
          value: role,
          label: roleLabels[role] || role,
        }))
      );
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  useEffect(() => {
    if (currentUserId && !isInitialLoad) {
      fetchData(currentPage);
    }
  }, [currentPage, currentUserId, fetchData, isInitialLoad]);

  useEffect(() => {
    fetchOrganizations();
    fetchRoles();
    fetchOrganizationsTypes();
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });

    setFilterPopupOpen(true);
  };
  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
    setCurrentPage(1);
  };

  const handleClearFilter = (defaultFilters?: any) => {
    if (defaultFilters) {
      // If default filters are passed from the dialog, use them
      dispatch(setFilterCriteria(defaultFilters));
    } else {
      // Fallback: set default active filter
      const defaultFilters = {
        active: true,
        inactive: false,
      };
      dispatch(setFilterCriteria(defaultFilters));
    }
    setCurrentPage(1);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParams(searchQueries);
    setCurrentPage(1);
  };

  const handleAddUserClick = () => {
    setMode('add');
    setAddUserPopupOpen(true);
  };

  const handleCloseAddUserPopup = () => {
    setAddUserPopupOpen(false);
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
    setMode('edit');
    setEditUserData(user);
    setAddUserPopupOpen(true);
  };

  const handleUserManagementExport = async (fileType: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    if (!currentUserId || !lonestarId) {
      toast.error('Insurer ID or User ID not found. Please try logging in again.');
      return;
    }

    setIsDownloading(true);
    try {
      const mappedRole = getMappedRole(searchParams?.role);

      const typeStatus: Record<string, string> = {
        active: 'active',
        inactive: 'inactive',
      };

      const status = Object.keys(filterCriteria)
        .filter((key) => typeStatus[key] && filterCriteria[key])
        .map((key) => typeStatus[key]);

      const requestBody: any = {
        lonestarId,
        organization: currentUserOrg,
        ...(sortParams.key && {
          sortKey: sortParams.key,
          sortOrder: sortParams.order,
        }),
        ...(searchParams && {
          ...searchParams,
          role: mappedRole,
        }),
      };

      if (status.length > 0 && status.length < 2) {
        requestBody.status = status;
      }

      const response = await downloadUsers(lonestarId, currentUserId, currentUserOrg, fileType, 500, requestBody);

      if (response?.status === 200 && response?.data?.signedUrl) {
        const fileResponse = await fetch(response.data.signedUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const filename = `Users_${year}_${month}_${day}.${fileType}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('User export successful');
      } else {
        throw new Error('Download URL not received from server');
      }
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast.error(error.message || 'Failed to export users');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} sx={{ marginTop: 1 }}>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              borderRadius: '20px',
              backgroundColor: '#fff',
            }}
          >
            <Card sx={{ borderRadius: '10px' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  leftText="Users"
                  isUserManagement={true}
                  handleAddUserClick={handleAddUserClick}
                  handleUserManagementExport={handleUserManagementExport}
                  isDownloading={isDownloading}
                />

                {loading ? (
                  <LoadingScreen />
                ) : (
                  <UserManagementTable
                    usersInformation={usersInformation}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onSort={handleSort}
                    currentPage={currentPage}
                    filterCriteria={filterCriteria}
                    searchQueries={searchQueries}
                    setSearchQueries={setSearchQueries}
                    setSortColumn={setSortColumn}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    handleEditUser={handleEditUser}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterUserManagementDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
        <AddUserPopup
          open={isAddUserPopupOpen}
          handleClose={handleCloseAddUserPopup}
          mode={mode}
          currentUserId={currentUserId}
          organizations={organizations}
          roles={roles}
          editUserData={editUserData}
          fetchData={fetchData}
          setCurrentPage={setCurrentPage}
          lonestarId={lonestarId}
          organizationsTypes={organizationsTypes}
          currentPage={currentPage}
        />
      </Grid>
    </Container>
  );
};

export default UserManagement;
