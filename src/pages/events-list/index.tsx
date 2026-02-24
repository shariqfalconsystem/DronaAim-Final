import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Divider, Box, Container } from '@mui/material';
import SegmentControlDesktop from '../../components/molecules/segment-control-desktop';
import EventListTable from './events-list-table';
import LoadingScreen from '../../components/molecules/loading-screen';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/events/eventsSlice';
import { getAllEvents, getEventsList } from '../../services/fleetManager/eventsService';
import { FilterEventsDialog } from '../../components/modals/filter-events-dialog';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { getAssociatedLabel } from '../../utility/utilities';
import 'jspdf-autotable';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const STORAGE_KEY = 'selectedEventObjects';
const PAGE_REFRESH_KEY = 'lastSessionTimestamp';

const EventsList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterCriteria = useSelector(selectFilterCriteria);
  const itemsPerPage = 10;
  const lonestarId = 'LS1013'; // Temporarily hardcoded

  const [eventsInformation, setEventsInformation] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [processedEvents, setProcessedEvents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<{ key?: string; order?: 'ASC' | 'DESC' }>({});
  const [searchParamsState, setSearchParamsState] = useState<any>({});
  const [searchQueries, setSearchQueries] = useState<any>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  const [selectedEventObjects, setSelectedEventObjects] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lastSessionTimestamp = sessionStorage.getItem(PAGE_REFRESH_KEY);
    const currentTimestamp = Date.now();

    if (!lastSessionTimestamp || currentTimestamp - parseInt(lastSessionTimestamp) > 1000) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(PAGE_REFRESH_KEY, currentTimestamp.toString());
      return [];
    }

    return saved ? JSON.parse(saved) : [];
  });

  const fetchData = useCallback(
    async (page: number, params: any = {}) => {
      setLoading(true);
      try {
        const eventTypeMapping: Record<string, string> = {
          harshBraking: 'Harsh Braking',
          speeding: 'Speeding',
          harshCornering: 'Harsh Cornering',
          harshAcceleration: 'Harsh Acceleration',
          shock: 'Impact',
          severeShock: 'Severe Impact',
          sos: 'SOS',
        };

        const eventTypeStatus = Object.keys(filterCriteria)
          .filter((key) => eventTypeMapping[key] && filterCriteria[key])
          .map((key) => eventTypeMapping[key]);

        const transformedSearchParams = { ...params };

        const requestBody: any = {
          ...params,
          ...(filterCriteria.toDate && { toDate: filterCriteria.toDate }),
          ...(filterCriteria.fromDate && { fromDate: filterCriteria.fromDate }),
          ...(sortParams.key && {
            sortKey: sortParams.key,
            sortOrder: sortParams.order,
          }),
          ...(transformedSearchParams && { ...transformedSearchParams }),
          ...(eventTypeStatus.length > 0 && { eventTypeStatus }),
        };

        if (transformedSearchParams?.tsInMilliSeconds) {
          requestBody.dateAndTime = Number(transformedSearchParams?.tsInMilliSeconds);
          delete requestBody.tsInMilliSeconds;
        }

        if (transformedSearchParams?.uiEventType) {
          requestBody.eventType = transformedSearchParams?.uiEventType;
          delete requestBody.uiEventType;
        }

        const { data } = await getEventsList(lonestarId, page, itemsPerPage, requestBody);
        setEventsInformation(data);
      } catch (error) {
        console.error('Error fetching tenant information:', error);
        setEventsInformation([]);
      } finally {
        setLoading(false);
      }
    },
    [lonestarId, itemsPerPage, filterCriteria, sortParams]
  );

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    fetchData(currentPage, searchParamsState);
  }, [currentPage, filterCriteria, sortParams]);

  useEffect(() => {
    setSelectAllChecked(false);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedEventObjects));
  }, [selectedEventObjects]);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, []);

  console.log('selected events : ', selectedEventObjects);

  useEffect(() => {
    const currentTimestamp = Date.now();
    sessionStorage.setItem(PAGE_REFRESH_KEY, currentTimestamp.toString());

    return () => {
      // Update timestamp before unmounting
      sessionStorage.setItem(PAGE_REFRESH_KEY, Date.now().toString());
    };
  }, []);

  const handleFilterIconClick = (event: any) => {
    const buttonRect: any = event?.currentTarget?.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });

    setFilterPopupOpen(true);
  };
  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleExport = async (fileType: 'xlsx' | 'csv') => {
    try {
      setExportLoading(true);
      toast.success('Exported File will be downloaded shortly');

      if (fileType === 'csv') {
        await handleExportAsCsv();
      } else {
        await handleExportAsPDF();
      }
    } catch (error) {
      console.error('Error during export:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
  };

  const handleSearch = (searchQueries: any) => {
    setSearchParamsState(searchQueries);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    fetchData(1, searchQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    const newSortParams = {
      key: column,
      order: direction,
    };
    setSortParams(newSortParams);
  };

  const selectedEvents = selectedEventObjects.map((event: any) => event.eventId);

  const handleSelectAll = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked) {
      const currentPageEvents = eventsInformation?.allEvents || [];
      const existingEventIds = new Set(selectedEventObjects.map((event) => event.eventId));
      const newEvents = currentPageEvents.filter((event: any) => !existingEventIds.has(event.eventId));
      setSelectedEventObjects([...selectedEventObjects, ...newEvents]);
    } else {
      const currentPageEventIds = new Set((eventsInformation?.allEvents || []).map((event: any) => event.eventId));
      setSelectedEventObjects(selectedEventObjects.filter((event) => !currentPageEventIds.has(event.eventId)));
    }
  };

  const handleSelectionChange = (newSelection: any[], eventObject: any) => {
    if (newSelection.includes(eventObject.eventId)) {
      setSelectedEventObjects([...selectedEventObjects, eventObject]);
    } else {
      setSelectedEventObjects(selectedEventObjects.filter((event) => event.eventId !== eventObject.eventId));
    }

    // Update select all checkbox based on whether all current page items are selected
    const currentPageEventIds = eventsInformation?.allEvents?.map((event: any) => event.eventId) || [];
    setSelectAllChecked(
      currentPageEventIds.length > 0 && currentPageEventIds.every((id: any) => newSelection.includes(id))
    );
  };

  const getEventsToExport = () => {
    // If there are selected events, use those
    if (selectedEventObjects.length > 0) {
      return selectedEventObjects;
    }
    // Otherwise, use the current page events
    return null;
  };

  const handleExportAsPDF = async () => {
    try {
      const eventsToExport = getEventsToExport();

      // If we have selected events, use existing logic
      if (eventsToExport) {
        if (eventsToExport.length === 0) {
          console.warn('No events available to export.');
          return;
        }

        const doc: any = new jsPDF();

        const tableColumn = [
          'Event ID',
          'Event Type',
          'Date & Time',
          'Location',
          'Trip ID',
          'Vehicle ID',
          'Driver',
          'Phone',
        ];

        const tableRows = eventsToExport.map((event: any) => [
          event.eventId,
          getAssociatedLabel(event.eventType),
          new Date(event.tsInMilliSeconds).toLocaleString(),
          event.address || 'NA',
          event.tripId || 'NA',
          event.vehicleId || 'NA',
          event.driverFirstName ? `${event.driverFirstName} ${event.driverLastName}` : 'NA',
          event.primaryPhone ? `${event.primaryPhoneCtryCd} ${event?.primaryPhone}` : 'NA',
        ]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 10,
          startX: 10,
          columnStyles: {
            7: { cellWidth: 40 },
          },
          styles: {
            overflow: 'linebreak',
          },
        });

        doc.save(`EventsList_${dayjs().format('YYYY-MM-DD')}.pdf`);
      } else {
        // Fetch all events and create a zip file
        const limit = 100;
        let page = 1;
        let totalRecords = 0;

        const zip = new JSZip();

        do {
          const { data } = await getAllEvents(lonestarId, page, limit);
          const { allEvents, pageDetails } = data;
          totalRecords = pageDetails.totalRecords;

          const doc: any = new jsPDF();
          const tableColumn = [
            'Event ID',
            'Event Type',
            'Date & Time',
            'Location',
            'Trip ID',
            'Vehicle ID',
            'Driver',
            'Phone',
          ];
          const tableRows = allEvents?.map((event: any) => [
            event.eventId,
            getAssociatedLabel(event.eventType),
            new Date(event.tsInMilliSeconds).toLocaleString(),
            event.address || 'NA',
            event.tripId || 'NA',
            event.vehicleId || 'NA',
            event.driverFirstName ? `${event.driverFirstName} ${event.driverLastName}` : 'NA',
            event.primaryPhone ? `${event.primaryPhoneCtryCd} ${event?.primaryPhone}` : 'NA',
          ]);

          doc?.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            columnStyles: {
              7: { cellWidth: 40 },
            },
            styles: {
              overflow: 'linebreak',
            },
          });

          const pdfBlob = doc.output('blob');
          zip.file(`EventsList_${dayjs().format('YYYY-MM-DD')}_Page_${page}.pdf`, pdfBlob);

          page++;
        } while ((page - 1) * limit < totalRecords);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `EventsList_${dayjs().format('YYYY-MM-DD')}.zip`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportAsCsv = async () => {
    try {
      const eventsToExport = getEventsToExport();

      // If we have selected events, use existing logic
      if (eventsToExport) {
        if (eventsToExport.length === 0) {
          console.warn('No events available to export.');
          return;
        }

        const escapeCsvValue = (value: any) => {
          if (value == null) return '';
          const stringValue = String(value);
          if (/[",\n]/.test(stringValue)) {
            const escapedValue = stringValue.replace(/"/g, '""');
            return `"${escapedValue}"`;
          }
          return stringValue;
        };

        const headers = [
          'Event ID',
          'Event Type',
          'Date & Time',
          'Location',
          'Trip ID',
          'Vehicle ID',
          'Driver',
          'Phone',
        ];

        const csvRows = [
          headers.map(escapeCsvValue).join(','),
          ...eventsToExport.map((event: any) =>
            [
              event.eventId,
              getAssociatedLabel(event.eventType),
              new Date(event.tsInMilliSeconds).toLocaleString(),
              event.address || 'NA',
              event.tripId || 'NA',
              event.vehicleId || 'NA',
              event.driverFirstName ? `${event.driverFirstName} ${event.driverLastName}` : 'NA',
              event.primaryPhone ? `${event.primaryPhoneCtryCd} ${event?.primaryPhone}` : 'NA',
            ]
              .map(escapeCsvValue)
              .join(',')
          ),
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `EventsList_${dayjs().format('YYYY-MM-DD')}.csv`);
      } else {
        // Fetch all events and create a zip file
        const limit = 100; // Number of records per page
        let page = 1;
        let totalRecords = 0;

        const zip = new JSZip();

        do {
          const { data } = await getAllEvents(lonestarId, page, limit);
          const { allEvents, pageDetails } = data;
          totalRecords = pageDetails.totalRecords;

          const headers = [
            'Event ID',
            'Event Type',
            'Date & Time',
            'Location',
            'Trip ID',
            'Vehicle ID',
            'Driver',
            'Phone',
          ];

          const escapeCsvValue = (value: any) => {
            if (value == null) return '';
            const stringValue = String(value).replace(/"/g, '""');
            return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
          };

          const csvRows = [
            headers.join(','), // Header row
            ...allEvents.map((event: any) =>
              [
                event.eventId,
                getAssociatedLabel(event.eventType),
                new Date(event.tsInMilliSeconds).toLocaleString(),
                event.address || 'NA',
                event.tripId || 'NA',
                event.vehicleId || 'NA',
                event.driverFirstName ? `${event.driverFirstName} ${event.driverLastName}` : 'NA',
                event.primaryPhone ? `${event.primaryPhoneCtryCd} ${event?.primaryPhone}` : 'NA',
              ]
                .map(escapeCsvValue)
                .join(',')
            ),
          ];

          const csvContent = csvRows.join('\n');
          zip.file(`EventsList_${dayjs().format('YYYY-MM-DD')}_Page_${page}.csv`, csvContent);

          page++;
        } while ((page - 1) * limit < totalRecords);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `EventsList_${dayjs().format('YYYY-MM-DD')}.zip`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
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
            <Card sx={{ borderRadius: '10px', overflowX: 'auto' }}>
              <CardContent sx={{ padding: '0px', fontSize: '0.875rem' }}>
                <Divider />

                <SegmentControlDesktop
                  handleFilterIconClick={handleFilterIconClick}
                  leftText="All Events"
                  handleExport={handleExport}
                  isDownloading={exportLoading}
                  selectAllChecked={selectAllChecked}
                  onSelectAll={handleSelectAll}
                  showSelectAll={selectedEvents.length > 0}
                  isEventExport={true}
                />

                {loading ? (
                  <LoadingScreen />
                ) : (
                  <EventListTable
                    eventsInformation={eventsInformation}
                    allEvents={allEvents}
                    onPageChange={handlePageChange}
                    filterCriteria={filterCriteria}
                    fetchData={fetchData}
                    processedEvents={processedEvents}
                    setProcessedEvents={setProcessedEvents}
                    searchQueries={searchQueries}
                    setSearchQueries={setSearchQueries}
                    setSortColumn={setSortColumn}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    onSearch={handleSearch}
                    onSort={handleSort}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    selectedEvents={selectedEvents}
                    onSelectionChange={handleSelectionChange}
                    selectAllChecked={selectAllChecked}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
        <FilterEventsDialog
          filterPopupOpen={filterPopupOpen}
          handleFilterPopupClose={handleFilterPopupClose}
          filterButtonPosition={filterButtonPosition}
          onApplyFilter={handleFilterApply}
          onClearFilter={handleClearFilter}
        />
      </Grid>
    </Container>
  );
};

export default EventsList;
