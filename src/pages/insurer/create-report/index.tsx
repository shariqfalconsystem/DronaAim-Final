import React, { useState, useEffect } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models, Report, Embed } from 'powerbi-client';
import { TextField, Button, Box, Container, IconButton, Grid, CircularProgress, Typography } from '@mui/material';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCustomReportToken } from '../../../services/insurer/IReportsService';
import environment from '../../../environments/environment';
import './create-report.css';
import { toast } from 'react-toastify';

// Define interfaces for our component's state
interface EmbedConfig {
  type: string;
  tokenType: models.TokenType;
  accessToken: string;
  embedUrl: string;
  datasetId: string;
  permissions: models.Permissions;
  settings: {
    background: models.BackgroundType;
    useCustomSaveAsDialog: boolean;
    panes: {
      filters: {
        expanded: boolean;
        visible: boolean;
      };
    };
  };
}

interface SaveResult {
  reportId: string;
}

interface SavedEvent {
  detail: SaveResult;
}

const ReportComponent: React.FC = () => {
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig | null>(null);
  const [reportInstance, setReportInstance] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportName, setReportName] = useState<string>('');
  const [savedReportName, setSavedReportName] = useState<string>('');

  const navigate = useNavigate();
  const userId = useSelector((state: any) => state.auth.currentUserId);

  // Constants
  const datasetId = environment.insurerDatasetId;
  const workspaceId = '7a64a3bc-7443-48be-a65b-c8c958b5d907';

  const generateEmbedToken = async (): Promise<string> => {
    try {
      console.log('Generating embed token via custom API...');

      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, status } = await getCustomReportToken(userId, workspaceId, datasetId);

      if (!data.EmbedToken || !data.EmbedToken) {
        throw new Error('Failed to retrieve embed token from API');
      }

      return data.EmbedToken;
    } catch (error) {
      const embedError = error as Error;
      console.error('Error generating embed token:', embedError);
      throw embedError;
    }
  };

  useEffect(() => {
    const initializeReport = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const embedToken = await generateEmbedToken();

        const embedUrl = workspaceId
          ? `https://app.powerbi.com/reportEmbed?groupId=${workspaceId}`
          : `https://app.powerbi.com/reportEmbed`;

        const config: EmbedConfig = {
          type: 'create',
          tokenType: models.TokenType.Embed,
          accessToken: embedToken,
          embedUrl: embedUrl,
          datasetId: datasetId,
          permissions: models.Permissions.All,
          settings: {
            background: models.BackgroundType.Transparent,
            useCustomSaveAsDialog: true,
            panes: {
              filters: { expanded: false, visible: true },
            },
          },
        };

        setEmbedConfig(config);
        setIsLoading(false);
      } catch (error) {
        const initError = error as Error;
        console.error('Failed to initialize report:', initError);
        setError(`Failed to initialize report: ${initError.message}`);
        setIsLoading(false);
      }
    };

    initializeReport();
  }, []);

  const handleSaveAs = async (): Promise<void> => {
    if (!reportInstance) {
      alert('Report not fully loaded yet. Please try again in a moment.');
      return;
    }

    if (!reportName) {
      alert('Report name cannot be empty.');
      return;
    }

    try {
      const reportNameWithUserId = userId ? `${reportName}_ins_${userId}` : reportName;

      const saveResult: any = await reportInstance.saveAs({
        name: reportNameWithUserId,
        targetWorkspaceId: workspaceId,
      });

      console.log('Save result:', saveResult);
      setSavedReportName(reportName); // Save the report name in state
      toast.success(`Report "${reportName}" saved successfully`);
    } catch (error) {
      const saveError = error as Error;
      console.error('Save failed:', saveError);
      alert(`Failed to save the report: ${saveError.message || 'Unknown error'}`);
    }
  };

  const setupEventListeners = (report: Report): void => {
    report.on('saved', (event: SavedEvent) => {
      console.log('Report saved:', event.detail);
    });

    if (embedConfig?.settings.useCustomSaveAsDialog) {
      report.on('saveAsTriggered', () => {
        handleSaveAs();
      });
    }

    report.on('loaded', () => {
      console.log('Report loaded successfully');
    });

    report.on('error', (event: { detail: { message?: string } }) => {
      console.error('Report error:', event.detail);
      setError(`Report error: ${event.detail.message || 'Unknown error'}`);
    });
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <Button variant="contained" color="primary" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || !embedConfig) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
      >
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="subtitle1" sx={{ color: '#666' }}>
          Please wait while we set up your report...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        mb={2}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid item display="flex" alignItems="center" justifyContent="space-between">
          <IconButton onClick={() => navigate(-1)}>
            <IoArrowBack />
          </IconButton>
          <Box ml={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Enter new report name"
                size="small"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                sx={{
                  input: { color: '#000' },
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#000' } },
                }}
              />
            </Box>
            <Box sx={{ ml: 2, display: 'flex' }}>
              {!savedReportName && (
                <Button variant="contained" color="primary" onClick={handleSaveAs} sx={{ marginRight: 1 }}>
                  Save
                </Button>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setReportName('');
                  setSavedReportName('');
                  navigate(-1);
                }}
              >
                {savedReportName ? 'Close' : 'Cancel'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth={false} sx={{ flexGrow: 1, backgroundColor: '#EDEEF0', padding: 0 }}>
          <PowerBIEmbed
            embedConfig={embedConfig}
            cssClassName="report-container"
            getEmbeddedComponent={(embeddedReport: Embed) => {
              setReportInstance(embeddedReport as Report);
              setupEventListeners(embeddedReport as Report);
            }}
          />
        </Container>
      </Box>
    </>
  );
};

export default ReportComponent;
