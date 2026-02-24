import { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Container,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Search as SearchIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import ReportDetails from '../reports-details';
import { RiAddCircleLine, RiRefreshLine } from '@remixicon/react';
import CustomizeReportsDialog from './customize-reports';
import settings from '../../../assets/icons/settings.png';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { envConfig } from './report-list';
import { getPowerBIReports } from '../../../services/insurer/IReportsService';

const reportGroups: any = {
  'Fleets Performance': ['Fleet Safety', 'Event Hotspots'],
  Vehicles: ['Vehicles without Devices', 'Vehicle Details', 'Vehicle Risk'],
  Drivers: ['Driver Details', 'Driver Risk'],
  Trips: ['Incomplete Trips', 'High-Risk Trips'],
  Events: ['Event Details', 'First-Notice-of-Loss (FNOL)'],
  Mileage: ['Fleet Miles', 'Vehicle Miles', 'Driver Miles'],
  Devices: ['Unassigned Devices'],
  Custom: ['Fleet Vehicle Device Count'],
  // 'Compliance ': ['Hours of Service (HOS) Compliance '],
};

const reportTypes = [
  'Fleets Performance',
  'Vehicles',
  'Drivers',
  'Trips',
  'Events',
  'Mileage',
  'Devices',
  'Custom',
  // 'Compliance ',
];

const currentEnv = import.meta.env.VITE_MODE || 'dev';

const { groupId, reports } = envConfig[currentEnv];

const USER_REPORT_PREFERENCES_KEY = 'user_report_preferences';

const InsurerReportList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [refreshContext, setRefreshContext] = useState('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [filterOrder, setFilterOrder] = useState<any>({});
  const [hovered, setHovered] = useState(false);
  const [hoveredCustomize, setHoveredCustomize] = useState(false);
  const [hoveredCreate, setHoveredCreate] = useState(false);
  const [powerBiReports, setPowerBiReports] = useState<any>([]);
  const [combinedReports, setCombinedReports] = useState<any[]>(reports);

  const userId: any = useSelector((state: any) => state.auth.currentUserId);
  const navigate = useNavigate();

  // Load user preferences on initial component mount
  useEffect(() => {
    const loadUserPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem(USER_REPORT_PREFERENCES_KEY);
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          if (preferences.filters && Array.isArray(preferences.filters)) {
            setSelectedFilters(preferences.filters);
          }
          if (preferences.order && typeof preferences.order === 'object') {
            setFilterOrder(preferences.order);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // const customGroupId = '9303d88f-d46d-4de9-9312-c085728c6f22';
  const customGroupId = '7a64a3bc-7443-48be-a65b-c8c958b5d907';

  useEffect(() => {
    const fetchPowerBiReports = async () => {
      try {
        // Use the service function instead of direct API call
        const { data, status } = await getPowerBIReports(userId, customGroupId);

        // Filter reports to only show the current user's reports
        let userReports = [];
        if (userId) {
          userReports = data.reports.filter((report: any) => {
            return report.ReportName.includes(`_ins_${userId}`);
          });

          userReports = userReports?.map((report: any) => {
            return {
              ...report,
              name: report.ReportName.split(`_ins_${userId}`)[0],
              originalName: report.ReportName,
              id: report.ReportId,
              isCustomReport: true,
            };
          });
        } else {
          userReports = data.value;
        }

        setPowerBiReports(userReports);
        setCombinedReports([...reports, ...userReports]);
      } catch (error) {
        console.error('Error fetching Power BI reports:', error);
      }
    };

    fetchPowerBiReports();
  }, [customGroupId, userId]);

  const handleReportClick = (reportId: any) => {
    if (!reportId) return;
    const report = [...reports, ...powerBiReports].find((r) => r.id === reportId);
    setSelectedReport(report);
    setRefreshContext('details');
  };

  const getOrderedReportGroups = () => {
    if (selectedFilters.length === 0) {
      return Object.entries(allReportGroups);
    }

    return Object.entries(allReportGroups)
      .filter(([groupName]) => selectedFilters.includes(groupName))
      .sort(([groupA], [groupB]) => {
        const orderA = filterOrder[groupA] || Infinity;
        const orderB = filterOrder[groupB] || Infinity;
        return orderA - orderB;
      });
  };

  const getFilteredReports = (groupName: any, groupReports: any) => {
    if (!groupReports) return [];

    return groupReports.filter((report: any) => {
      const matchesSearchQuery = !searchQuery || report.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSelectedFilters =
        selectedFilters.length === 0 ||
        selectedFilters.some((filter: any) => groupName.toLowerCase().includes(filter?.toLowerCase()));

      return matchesSearchQuery && matchesSelectedFilters;
    });
  };

  const handleBackClick = () => {
    setSelectedReport(null);
    setRefreshContext('list');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleApplyFilters = (filters: any, order: any) => {
    setSelectedFilters(filters);

    const newOrder: any = {};
    filters.forEach((filter: any, index: any) => {
      newOrder[filter] = index + 1;
    });
    setFilterOrder({ ...newOrder });
    saveUserPreferences(filters, newOrder);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setFilterOrder({});

    localStorage.removeItem(USER_REPORT_PREFERENCES_KEY);
  };

  const saveUserPreferences = (filters: any, order: any) => {
    try {
      const preferences = {
        filters,
        order,
      };
      localStorage.setItem(USER_REPORT_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const handleCreateReport = () => {
    navigate('/insurer/create-report');
  };

  const allReportGroups = { ...reportGroups };
  if (powerBiReports?.length > 0) {
    allReportGroups['Custom'] = [
      ...(allReportGroups['Custom'] || []),
      ...powerBiReports.map((report: any) => report.name),
    ];
  }

  console.log('powerbi reports : ', powerBiReports);

  return (
    <>
      {selectedReport ? (
        <ReportDetails
          reportId={selectedReport.id}
          report={selectedReport}
          onBack={handleBackClick}
          groupId={powerBiReports?.some((r: any) => r.id === selectedReport.id) ? customGroupId : groupId}
          isCustomReport={selectedReport.isCustomReport}
        />
      ) : (
        <>
          <Box
            mb={4}
            sx={{
              boxShadow: '0px 4px 4px 0px #00000040',
              bgcolor: '#fff',
              py: 1.5,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#1F2937' }}>Reports</Typography>
              <IconButton size="small" onClick={handleRefresh} sx={{ padding: '4px' }}>
                <RiRefreshLine />
              </IconButton>
            </Box>

            <TextField
              size="small"
              placeholder="Search "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mx: 2, flex: 1, maxWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Create Report Button */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'transform 0.7s ease',
                  transform: hoveredCustomize ? 'translateX(-200px)' : 'translateX(0)',
                }}
                // Add mouse events to the container to keep hover text visible
                onMouseEnter={() => setHoveredCreate(true)}
                onMouseLeave={() => setHoveredCreate(false)}
              >
                <Box
                  className="hover-text"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    opacity: hoveredCreate ? 1 : 0,
                    transform: 'translateY(-50%)',
                    transition: 'opacity 0.9s ease',
                    color: 'white',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#247FAD',
                    borderRadius: '24px',
                    height: 48,
                    padding: '0 16px',
                    minWidth: 200,
                    boxShadow: 1,
                    zIndex: 2,
                    pointerEvents: 'none', // Allows clicking through the hover text
                  }}
                >
                  Create a new report
                </Box>
                <IconButton sx={{ padding: '8px', cursor: 'pointer' }} onClick={handleCreateReport}>
                  <RiAddCircleLine size={40} />
                </IconButton>
              </Box>

              {/* Customize Button */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'transform 0.9s ease',
                }}
                onMouseEnter={() => setHoveredCustomize(true)}
                onMouseLeave={() => setHoveredCustomize(false)}
              >
                <Box
                  className="hover-text"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    opacity: hoveredCustomize ? 1 : 0,
                    transform: 'translateY(-50%)',
                    transition: 'opacity 0.7s ease',
                    color: 'white',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#247FAD',
                    borderRadius: '24px',
                    height: 48,
                    padding: '0 16px',
                    minWidth: 200,
                    boxShadow: 1,
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  Customize this page
                </Box>
                <IconButton sx={{ padding: '8px', cursor: 'pointer' }} onClick={handleDialogOpen}>
                  <img src={settings} alt="Settings Icon" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Container
            maxWidth={false}
            sx={{
              px: 3,
              py: 0,
            }}
          >
            <Grid container spacing={2.5}>
              {getOrderedReportGroups().map(([groupName, groupReports]) => {
                const filteredReports = getFilteredReports(groupName, groupReports);
                if (filteredReports.length === 0) return null;

                return (
                  <Grid
                    item
                    container
                    spacing={1}
                    xs={12}
                    key={groupName}
                    sx={{ background: '#fff', p: 2, borderRadius: 4, m: 2 }}
                  >
                    <Grid item xs={3}>
                      <Paper
                        sx={{
                          borderRadius: 2,
                          border: '1px solid #E5E7EB',
                          background: 'linear-gradient(270deg, #5B7C9D 0%, #3F5C78 100%)',
                          color: 'white',
                          px: 3,
                          py: 1.5,
                          boxShadow: 'none',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '20px',
                          }}
                        >
                          {groupName}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={9}>
                      <Paper
                        sx={{
                          overflow: 'hidden',
                          boxShadow: 'none',
                        }}
                      >
                        <List>
                          {filteredReports?.map((reportName: any) => {
                            const report = combinedReports.find((r: any) => r.name === reportName);
                            if (!report) return null;

                            return (
                              <ListItem
                                key={report?.id}
                                onClick={() => handleReportClick(report.id)}
                                sx={{
                                  bgcolor: '#E9F8FF',
                                  '&:hover': {
                                    bgcolor: '#F1F5F9',
                                  },
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  mx: 2,
                                  mb: 2,
                                }}
                              >
                                <ListItemText
                                  primary={report.name}
                                  secondary={report.description || 'Custom Power BI Report'}
                                  primaryTypographyProps={{
                                    sx: {
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      color: '#1F2937',
                                      mb: 0.5,
                                    },
                                  }}
                                  secondaryTypographyProps={{
                                    sx: {
                                      fontSize: '12px',
                                      color: '#6B7280',
                                      lineHeight: '16px',
                                    },
                                  }}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleReportClick(report.id)}
                                    sx={{
                                      color: '#6B7280',
                                      '&:hover': {
                                        bgcolor: 'transparent',
                                      },
                                    }}
                                  >
                                    <ChevronRightIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
          <CustomizeReportsDialog
            open={openDialog}
            initialSelectedFilters={selectedFilters}
            reportTypes={reportTypes}
            onClose={handleDialogClose}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </>
      )}
    </>
  );
};

export default InsurerReportList;
