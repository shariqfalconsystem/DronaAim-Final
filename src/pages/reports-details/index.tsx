import { useEffect, useState, useCallback } from 'react';
import { models } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { Box, Button, CircularProgress, Container, Grid, IconButton, Tooltip } from '@mui/material';
import './powerbidemo.css';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';
import { RiFileDownloadLine, RiRefreshLine } from '@remixicon/react';
import { useSelector } from 'react-redux';
import LoadingScreen from '../../components/molecules/loading-screen';
import { exportPowerBIReportToPdf, getReportTokenV3 } from '../../services/fleetManager/reportService';

const ReportDetails = ({ reportId, report, onBack, groupId, isCustomReport }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<any>({
    type: 'report',
    embedUrl: undefined,
    accessToken: undefined,
    id: undefined,
    tokenType: models.TokenType.Embed,
    permissions: models.Permissions.All,
    viewMode: isCustomReport ? models.ViewMode.Edit : models.ViewMode.View,
    settings: {
      panes: {
        filters: { expanded: true, visible: true },
      },
      background: models.BackgroundType.Default,
    },
  });
  const [datasetId, setDatasetId] = useState<string>('');

  const userId: any = useSelector((state: any) => state.auth.currentUserId);
  // Get user information from Redux or environment
  const userEmail = useSelector((state: any) => state.auth.userData?.emailId);
  const userRoles = useSelector((state: any) => state.auth.userData?.role);

  const currentUserRole: any = useSelector((state: any) => state?.auth?.currentUserRole);
  const lonestarId: any = useSelector((state: any) => state?.auth?.userData?.selectedRole?.lonestarId);
  const insurerId: any = useSelector((state: any) => state.auth?.userData?.selectedRole?.insurerId);

  const fetchReportDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReportTokenV3(userId, currentUserRole, insurerId, lonestarId, groupId, reportId);

      const embedUrl = response?.data?.EmbeddedUrl;
      const embedToken = response?.data?.EmbedToken;
      const datasetId = response?.data?.DatasetId;

      setDatasetId(datasetId);
      setReportConfig((prevConfig: any) => ({
        ...prevConfig,
        embedUrl,
        accessToken: embedToken,
        id: reportId,
      }));
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to fetch report details.');
    } finally {
      setLoading(false);
    }
  }, [userId, groupId, reportId]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  const handleExportToPdf = async () => {
    // Check if exportReports exists and has reports
    if (report.exportReports && report.exportReports.length > 0) {
      setExporting(true);
      toast.info(`Preparing reports for download. ${report.exportReports.length} report(s) will be exported shortly!`);

      try {
        // Export all reports sequentially
        for (let i = 0; i < report.exportReports.length; i++) {
          const exportReport = report.exportReports[i];
          const currentReportId = exportReport.reportId;
          const currentDatasetId = exportReport.datasetId;
          const isPaginated = exportReport.isPaginated || false; // Get isPaginated flag if present

          if (!currentReportId || !currentDatasetId) {
            console.error(`Missing reportId or datasetId for export report ${i}`);
            continue;
          }

          // Update export progress
          setExportProgress(`Exporting report ${i + 1} of ${report.exportReports.length}...`);

          // Get the PDF blob - pass isPaginated flag to the export function
          const pdfBlob = await exportPowerBIReportToPdf(
            userId,
            groupId,
            currentReportId,
            currentDatasetId,
            userEmail,
            userRoles,
            isPaginated,
            insurerId,
            lonestarId,
            currentUserRole
          );

          // Create a meaningful filename
          const reportName = report.name || 'Report';
          const fileName = report.exportReports.length > 1 ? `${reportName}_Part${i + 1}.pdf` : `${reportName}.pdf`;

          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;

          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          if (i < report.exportReports.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        toast.success(`Successfully exported ${report.exportReports.length} report(s)!`);
      } catch (error: any) {
        console.error('Error exporting reports:', error);
        toast.error(`Failed to export reports: ${error.message || 'Unknown error'}`);
      } finally {
        setExporting(false);
        setExportProgress('');
      }
    } else {
      if (!datasetId) {
        toast.error('Dataset ID is missing. Cannot export to PDF.');
        return;
      }

      setExporting(true);
      toast.info('Preparing report for download. This may take a moment...');

      try {
        const pdfBlob = await exportPowerBIReportToPdf(
          userId,
          groupId,
          reportId,
          datasetId,
          userEmail,
          userRoles,
          false
        );

        // Create a download link for the PDF
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.name || 'Report'}.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        toast.success('Report downloaded successfully!');
      } catch (error: any) {
        console.error('Error exporting report:', error);
        toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
      } finally {
        setExporting(false);
      }
    }
  };

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
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid
            item
            display="flex"
            alignItems="center"
            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          >
            <Box>
              <IconButton onClick={onBack}>
                <IoArrowBack />
              </IconButton>
              {report.name || 'NA'}
              <Tooltip title="Refresh report">
                <IconButton size="small" sx={{ padding: '4px' }} onClick={fetchReportDetails} disabled={loading}>
                  <RiRefreshLine />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip title="Export to PDF">
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <RiFileDownloadLine />}
                    onClick={handleExportToPdf}
                    disabled={loading || exporting || (!datasetId && !(report.exportReports?.length > 0))}
                  >
                    {exporting ? exportProgress || 'Exporting...' : 'Export to PDF'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <LoadingScreen />
          ) : reportConfig.embedUrl && reportConfig.accessToken ? (
            <PowerBIEmbed embedConfig={reportConfig} cssClassName="power-bi-report-class" />
          ) : (
            <LoadingScreen />
          )}
        </Box>
      </Container>
    </>
  );
};

export default ReportDetails;
