import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container, Button } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterCriteria } from '../../redux/trips/tripsSlice';
import { getDocuments } from '../../services/fleetManager/documentServices';
import FleetDocuments from './document-center-list';
import UploadDocumentModal from './upload-document';
import UploadIcon from '../../assets/icons/upload.png';
import FleetContracts from './fleet-contracts-dialog';
import FleetInvoices from './fleet-invoices-dialog';
import FleetSubscriptions from './fleet-subscriptions-dialog';

const DeviceList: React.FC = () => {
  const dispatch = useDispatch();
  const filterCriteria = useSelector(selectFilterCriteria);

  const [deviceInformation, setDeviceInformation] = useState<any>(null);
  const [allDeviceList, setAllDeviceList] = useState<any[]>([]);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({
    key: 'lastStatusPing',
    order: 'DESC',
  });
  const [documentsInformation, setDocumentsInformation] = useState<any>([]);
  const [allDocuments, setAllDocuments] = useState<any>([]);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false);

  // const getInitialSelectedButton = ():  'Documents' | 'All Contracts' | 'All Invoices' | 'All Subscriptions' => {
  //   const view = searchParams.get('view');
  //   return view === 'Documents' || view === 'All Contracts' || view === 'All Invoices' ||view === 'All Invoices'  ? view : 'insuredFleet';
  // };

  const [selectedButton, setSelectedButton] = useState<
    'Documents' | 'All Contracts' | 'All Invoices' | 'All Subscriptions'
  >('Documents');

  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  // Dialog states
  const [contractsDialogOpen, setContractsDialogOpen] = useState(false);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [subscriptionsDialogOpen, setSubscriptionsDialogOpen] = useState(false);

  const lonestarId = 'LS1013'; // Temporarily hardcoded
  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);

  const itemsPerPage = 10;
  const MAX_RECORDS = 50000;

  const fetchFleetDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const { data } = await getDocuments(lonestarId);
      const fleetDocs = data?.fleetDocuments || [];
      setDocumentsInformation(fleetDocs);

      if (fleetDocs.length < MAX_RECORDS) {
        setAllDocuments(fleetDocs);
      } else {
        setAllDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching fleet documents:', error);
      setDocumentsInformation([]);
      setAllDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [lonestarId]);

  useEffect(() => {
    if (lonestarId) {
      fetchFleetDocuments();
    }
  }, [fetchFleetDocuments, lonestarId]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
  };

  const handleAllDevicesListClick = () => {
    setSelectedButton('Documents');
    // Add any additional logic for showing documents
  };

  const handleContractsClick = () => {
    setSelectedButton('All Contracts');
    setContractsDialogOpen(true);
  };

  const handleInvoicesClick = () => {
    setSelectedButton('All Invoices');
    setInvoicesDialogOpen(true);
  };

  const handleSubscriptionsClick = () => {
    setSelectedButton('All Subscriptions');
    setSubscriptionsDialogOpen(true);
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
                <Divider />
                <SegmentControlDesktop
                  onUploadClick={selectedButton === 'Documents' ? handleUploadClick : undefined}
                  isDocument={selectedButton === 'Documents'}
                  uploadIcon={selectedButton === 'Documents' ? UploadIcon : undefined}
                  isFilterHide={true}
                  leftText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant={selectedButton === 'Documents' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleAllDevicesListClick}
                      >
                        Documents
                      </Button>
                      <Button
                        variant={selectedButton === 'All Contracts' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleContractsClick}
                      >
                        All Contracts
                      </Button>
                      <Button
                        variant={selectedButton === 'All Invoices' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleInvoicesClick}
                      >
                        All Invoices
                      </Button>
                      <Button
                        variant={selectedButton === 'All Subscriptions' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        sx={{ fontSize: '0.875rem', textTransform: 'none' }}
                        onClick={handleSubscriptionsClick}
                      >
                        All Subscriptions
                      </Button>
                    </Box>
                  }
                />
                {loading ? (
                  <LoadingScreen />
                ) : (
                  <>
                    {selectedButton === 'Documents' && (
                      <FleetDocuments
                        documentsInformation={documentsInformation}
                        documentsList={allDocuments}
                        fetchData={fetchFleetDocuments}
                        lonestarId={lonestarId}
                      />
                    )}

                    {selectedButton === 'All Contracts' && (
                      <FleetContracts lonestarId={lonestarId} currentLoggedInUserId={currentUserId} />
                    )}
                    {selectedButton === 'All Invoices' && (
                      <FleetInvoices lonestarId={lonestarId} currentLoggedInUserId={currentUserId} />
                    )}
                    {selectedButton === 'All Subscriptions' && (
                      <FleetSubscriptions lonestarId={lonestarId} currentLoggedInUserId={currentUserId} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={handleUploadModalClose}
        lonestarId={lonestarId}
        fetchData={fetchFleetDocuments}
      />
    </Container>
  );
};

export default DeviceList;
