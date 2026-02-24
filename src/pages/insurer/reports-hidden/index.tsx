import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
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
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import ReportDetails from '../reports-details';
import { RiRefreshLine } from '@remixicon/react';

const reports = [
  {
    id: 'dece37f1-1802-4c96-a012-8550f2fc7ee3',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Fleet Safety Report',
    description: 'Overview of safety scores for fleets based on driving behaviors.',
  },
  {
    id: 'c1038d6b-8cab-44ce-b4d4-a37f0c444d7d',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Accident Hotspots Report',
    description: 'Locations where incidents occur frequently for insured fleets.',
  },
  {
    id: '20233997-aa99-45fc-a008-e76f81bd98d8',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '937d9162-728a-4bdd-b256-ccfad2b7edcb',
    name: 'Vehicle without Devices Report',
    description: 'List of insured vehicles without active telematics devices.',
  },
  {
    id: '1b026d39-d83a-4987-9e19-33f2790a352a',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Vehicle Risk Report',
    description: 'Vehicle-specific risk levels based on telematics and historical data.',
  },
  {
    id: '85cb245e-1973-4767-911e-e0385196847d',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Vehicle Details Report',
    description: 'List of insured vehicles in each Fleet + Vehicle details.',
  },
  {
    id: 'f2a5f566-bfa8-4aa3-bcb2-9a20af18fb79',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Driver Risk Report',
    description: 'Driver-specific risk levels based on telematics and historical data.',
  },
  {
    id: 'dee7037b-09aa-42de-abfd-762cf08f398e',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Driver Details Report',
    description: 'List of drivers in each Fleet + driver details.',
  },
  {
    id: '2da9f97f-18fa-47c6-b06b-b1cd481d58e5',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: 'a16b9a4b-2360-4540-a14b-b8b2406d66a7',
    name: 'High-Risk Trips Report',
    description: 'Trips involving unsafe behaviors or conditions(based on trip score)',
  },
  {
    id: '824f1226-ca43-4f33-9674-ea25412a40ef',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: 'a16b9a4b-2360-4540-a14b-b8b2406d66a7',
    name: 'Incomplete Trips Report',
    description: 'Trips without associated driver or vehicle data.',
  },
  {
    id: '6d53cac4-3175-4f7f-8c44-71fe42c72f92',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Event Details Report',
    description: 'List of Events in each Fleet+ event details.',
  },
  {
    id: '9a62f29a-7e2b-4cb5-b153-ad638f578d3c',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Fleet Miles Report',
    description: 'List of Fleets with total miles driven.',
  },
  {
    id: 'dc9376a8-d94b-443b-8179-f1ca6dd54cbd',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
    name: 'Vehicle Miles Report',
    description: 'List of Vehicles with total miles driven.',
  },
  {
    id: '19dd5e3c-7da3-4a7d-ac17-056c5e2ef902',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: 'cd6fe54c-0219-424d-8ef4-326ee6fa4e13',
    name: 'Driver Miles Report',
    description: 'List of Drivers with total miles driven.',
  },
  {
    id: 'a61256e5-ae0c-440c-9d8f-f16a8e561d3f',
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    datasetId: 'cd6fe54c-0219-424d-8ef4-326ee6fa4e13',
    name: 'Unassigned Devices Report',
    description: 'List of devices unassigned to vehicles.',
  },
  {
    name: 'Hours of Service (HOS) Compliance Report',
    description: 'Ensure drivers comply with regulations on driving hours.',
  },
];

const reportGroups = {
  'Fleet Performance Reports': ['Fleet Safety Report', 'Accident Hotspots Report'],
  'Vehicle Reports': ['Vehicle without Devices Report', 'Vehicle Details Report', 'Vehicle Risk Report'],
  'Driver Reports': ['Driver Details Report', 'Driver Risk Report'],
  'Trip-Based Reports': ['Incomplete Trips Report', 'High-Risk Trips Report'],
  'Event Reports': ['Event Details Report'],
  'Miles Reports': ['Fleet Miles Report', 'Vehicle Miles Report', 'Driver Miles Report'],
  'Devices Reports': ['Unassigned Devices Report'],
  'Compliance Reports': ['Hours of Service (HOS) Compliance Report'],
};

const ReportList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [refreshContext, setRefreshContext] = useState('list');

  const handleReportClick = (reportId: any) => {
    if (!reportId) {
      alert('Report is not available. Please select a valid report.');
      return;
    }
    const report = reports.find((r) => r.id === reportId);
    setSelectedReport(report);
    setRefreshContext('details');
  };

  const getFilteredReports = (groupReports: any) => {
    return groupReports.filter((reportName: any) => reportName.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleBackClick = () => {
    setSelectedReport(null);
    setRefreshContext('list');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {selectedReport ? (
        <ReportDetails reportId={selectedReport.id} report={selectedReport} onBack={handleBackClick} />
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
              placeholder="Search Report"
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
            <span>
              {/* <IconButton sx={{ padding: '8px' }}>
                <SettingsIcon sx={{ fontSize: 20 }} />
              </IconButton> */}
            </span>
          </Box>

          <Container
            maxWidth={false}
            sx={{
              px: 3,
              py: 0,
            }}
          >
            <Grid container spacing={2.5}>
              {Object.entries(reportGroups).map(([groupName, groupReports]) => {
                const filteredReports = getFilteredReports(groupReports);
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
                            const report = reports.find((r) => r.name === reportName);
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
                                  secondary={report.description}
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
        </>
      )}
    </>
  );
};

export default ReportList;
