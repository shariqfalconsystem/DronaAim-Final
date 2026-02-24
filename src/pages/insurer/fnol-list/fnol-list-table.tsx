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
  Radio,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import Pagination from '../../../components/molecules/pagination';
import debounce from 'lodash/debounce';
import { paths } from '../../../common/constants/routes';
import { useSelector } from 'react-redux';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { formatLocalizedDateTime, formatUserDateTime, splitAddressInTwoLines } from '../../../utility/utilities';
import { getFalsePositiveFnol } from '../../../services/fleetManager/eventsService';
import { getShortUrl } from '../../../services/fleetManager/shareService';
import SendClaims from './sendToClaims-dialog';
import environment from '../../../environments/environment';

const FnolListTable: React.FC<any> = ({
  fnolInformation,
  searchQueries,
  setSearchQueries,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  fetchData,
}) => {
  const navigate = useNavigate();
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);
  const currentLoggedInUserId = useSelector((state: any) => state.auth.currentUserId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sendClaimState, setSendClaimState] = useState<Record<string, string>>({});
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<any>(null);
  const baseUrl = environment?.mediaBaseUrl;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
      setSearchQueries(queries);
    }, 1000),
    [onSearch, setSearchQueries, setCurrentPage, setSearchParams]
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

  const getMediaWithShortUrls = async (media: any): Promise<any> => {
    if (!media || media.length === 0) {
      return [];
    }

    const mp4Media = media.filter((item: any) => item.type === 'mp4');
    const mediaWithShortUrls = [];

    for (const item of mp4Media) {
      try {
        const fullUrl = baseUrl + item.url;
        const response = await getShortUrl(fullUrl);

        if (response.status === 200) {
          mediaWithShortUrls.push({
            type: item.type,
            camera: item.camera,
            startTsInMilliseconds: item.startTsInMilliseconds,
            endTsInMilliseconds: item.endTsInMilliseconds,
            url: response.data.alias_url,
          });
        } else {
          mediaWithShortUrls.push({
            type: item.type,
            camera: item.camera,
            startTsInMilliseconds: item.startTsInMilliseconds,
            endTsInMilliseconds: item.endTsInMilliseconds,
            url: fullUrl,
          });
        }
      } catch (error) {
        console.error('Error shortening media URL:', error);
        // Use full URL as fallback on error
        mediaWithShortUrls.push({
          type: item.type,
          camera: item.camera,
          startTsInMilliseconds: item.startTsInMilliseconds,
          endTsInMilliseconds: item.endTsInMilliseconds,
          url: baseUrl + item.url,
        });
      }
    }

    return mediaWithShortUrls;
  };

  const handleSendClaimChange = async (event: any, value: string) => {
    if (event?.isFalsePositive === value) {
      return;
    }

    if (value === 'Yes') {
      setPendingEvent(event);
      setNotifyOpen(true);
      return;
    }

    if (value === 'No') {
      await callFalsePositiveAPI(event, value);
    }
  };

  const callFalsePositiveAPI = async (event: any, value: string, userNote?: string) => {
    console.log('event : ', event);
    const newValue = sendClaimState[event.eventId] === value ? '' : value;

    setSendClaimState((prevState: any) => ({
      ...prevState,
      [event.eventId]: newValue,
    }));

    try {
      const mediaWithShortUrls = await getMediaWithShortUrls(event.media);

      const requestBody = {
        currentLoggedInUserId: currentLoggedInUserId,
        eventId: event.eventId,
        vendorEventId: event.vendorEventId,
        tsInMilliSeconds: event.tsInMilliSeconds?.toString(),
        isFalsePositive: value === 'No',
        imei: event.imei,
        eventType: event.eventType || event.uiEventType,
        media: mediaWithShortUrls,
        ...(userNote && { userNote }),
      };

      const response = await getFalsePositiveFnol(requestBody);

      if (response?.status === 200) {
        toast.success(value === 'Yes' ? 'Event sent to claims successfully' : 'Event marked as false positive');
        if (fetchData) {
          fetchData(currentPage, searchQueries);
        }
      } else {
        toast.error(response?.data?.details || 'Failed to update event');
      }
    } catch (error: any) {
      console.error('Error updating FNOL event:', error);
      toast.error(error?.message || 'Error occurred while updating event');
    }
  };

  const handleConfirmSendClaims = (note?: string) => {
    if (pendingEvent) {
      callFalsePositiveAPI(pendingEvent, 'Yes', note);
      setPendingEvent(null);
    }
  };

  const columns = [
    { label: 'Insured ID', key: 'insuredId' },
    { label: 'Fleet Name', key: 'name' },
    { label: 'Event ID', key: 'eventId' },
    { label: 'Event Type', key: 'uiEventType' },
    { label: 'Date & Time', key: 'tsInMilliSeconds' },
    { label: 'Location', key: 'address' },
    { label: 'Speed', key: 'speed' },
    { label: 'Trip ID', key: 'tripId' },
    { label: 'VIN', key: 'vin' },
    { label: 'IMEI Number', key: 'imei' },
    { label: 'Driver', key: 'driverName' },
    { label: 'Phone', key: 'phoneNumber' },
    { label: 'Send to Claims?', key: 'sendClaims' },
  ];

  const totalPages =
    Math.ceil(fnolInformation?.pageDetails?.totalRecords / fnolInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
      <TableContainer
        ref={containerRef}
        component={Paper}
        onScroll={handleScroll}
        sx={{
          borderCollapse: 'separate',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '14px',
            cursor: 'pointer',
            overflow: 'auto',
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
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map(({ label, key }, index) => (
                <StyledHeadCell
                  key={key}
                  sx={{
                    position: index === 0 || key === 'sendClaims' || index === columns.length - 1 ? 'sticky' : 'static',
                    left: index === 0 ? 0 : 'auto',
                    right: key === 'sendClaims' ? 0 : 'auto',
                    zIndex: index === 0 || index === columns.length - 1 ? 2 : 'auto',
                    backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                    background: key === 'sendClaims' ? '#EDF0F5' : 'auto',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        onClick={() => {
                          key !== 'startLocation' && key !== 'endLocation';
                        }}
                        component={'span'}
                      >
                        {label}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1, alignItems: 'center' }}>
                        {key === 'sendClaims' ? (
                          <></>
                        ) : (
                          <>
                            <TbTriangleFilled
                              size={8}
                              color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'ASC')}
                            />
                            <TbTriangleInvertedFilled
                              size={8}
                              color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                              onClick={() => handleSort(key, 'DESC')}
                            />
                          </>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                      {key === 'sendClaims' ? (
                        <Box
                          sx={{
                            marginTop: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: 0,
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRight: '2px solid #9EADBB',
                              paddingRight: '10px',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: '#000',
                                fontWeight: 500,
                              }}
                            >
                              Yes
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingLeft: '10px',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: '#000',
                                fontWeight: 500,
                              }}
                            >
                              No
                            </Typography>
                          </Box>
                        </Box>
                      ) : ['tsInMilliSeconds']?.includes(key) ? (
                        <DatePicker
                          value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                          onChange={(date) => handleDateChange(date, key)}
                          placeholder={``}
                          format="MM-DD-YYYY"
                          style={{ marginTop: 8, width: '100%' }}
                        />
                      ) : (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={localSearchQueries[key] || ''}
                          onChange={(e) => handleColumnSearch(key, e.target.value)}
                          sx={{
                            mt: 1,
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              width: '100%',
                              height: '30px',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fnolInformation?.allEvents && fnolInformation?.allEvents?.length > 0 ? (
              fnolInformation.allEvents.map((event: any) => {
                return (
                  <TableRow
                    key={event?.eventId}
                    onClick={() => {
                      navigate(`${paths.INSURERFNOLDETAILS}/${event.eventId}/`, {
                        state: { ...event, place: event.address, currentPage },
                      });
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <StyledDataCell
                      width="8%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {event?.lookup_fleetcompanies?.[0]?.insuredId || 'NA'}
                        </Typography>
                      </Box>
                    </StyledDataCell>
                    <StyledDataCell>{event?.lookup_fleetcompanies?.[0]?.name || 'NA'}</StyledDataCell>
                    <StyledDataCell> {event?.eventId || 'NA'}</StyledDataCell>
                    <StyledDataCell>{event?.uiEventType || 'NA'}</StyledDataCell>
                    <StyledDataCell>
                      {event?.localizedTsInMilliSeconds
                        ? formatLocalizedDateTime(event.localizedTsInMilliSeconds, event?.tzAbbreviation)?.dateWithTmz
                        : formatUserDateTime(event.tsInMilliSeconds).date}
                    </StyledDataCell>
                    <StyledDataCell width="5%">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {event.address && event?.address !== 'NA' ? (
                          splitAddressInTwoLines(event.address).map((line: any, index: any) => (
                            <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {line}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#9CACBA' }}>
                            GPS Location Not Available
                          </Typography>
                        )}
                      </Box>
                    </StyledDataCell>
                    <StyledDataCell>{event?.speedInMph ? `${event?.speedInMph} mph` : '0.00 mph'}</StyledDataCell>
                    <StyledDataCell>{event?.tripId || 'NA'}</StyledDataCell>
                    <StyledDataCell>{event?.lookup_vehicles?.[0]?.vin || 'NA'}</StyledDataCell>
                    <StyledDataCell>{event?.imei || 'NA'}</StyledDataCell>
                    <StyledDataCell>
                      {event?.lookup_users?.[0]?.firstName && event?.lookup_users?.[0]?.lastName
                        ? `${event.lookup_users[0].firstName} ${event.lookup_users[0].lastName}`
                        : 'NA'}
                    </StyledDataCell>
                    <StyledDataCell>{event?.phoneNo ? `${event?.phoneNo}` : 'NA'}</StyledDataCell>
                    <StyledDataCell
                      width="8%"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 3,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        background: '#fff',
                        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: '100%',
                        padding: '0px',
                        margin: '0px',
                      }}
                    >
                      <Box
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '50px',
                          borderRight: '2px solid #9EADBB',
                          padding: '0px 20px',
                          display: 'flex',
                          backgroundColor: event?.isFalsePositive === false ? '#E8F5E9' : 'transparent',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <Radio
                          checked={event?.isFalsePositive === false}
                          onChange={() => handleSendClaimChange(event, 'Yes')}
                          value="Yes"
                          name={`sendClaim-${event?.eventId}`}
                          sx={{
                            padding: 0,
                            color: event?.isFalsePositive === false ? '#4CAF50' : 'rgba(0, 0, 0, 0.54)',
                            '&.Mui-checked': {
                              color: '#4CAF50',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '20px',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            },
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '50px',
                          margin: '0px',
                          padding: '0px 18px',
                          backgroundColor: event?.isFalsePositive === true ? '#FFEBEE' : 'transparent',
                          transition: 'background-color 0.3s ease',
                          opacity: event?.isFalsePositive === false ? 0.5 : 1,
                        }}
                      >
                        <Radio
                          checked={event?.isFalsePositive === true}
                          onChange={() => handleSendClaimChange(event, 'No')}
                          value="No"
                          name={`sendClaim-${event?.eventId}`}
                          disabled={event?.isFalsePositive === false}
                          sx={{
                            padding: 0,
                            color: event?.isFalsePositive === true ? '#F44336' : 'rgba(0, 0, 0, 0.54)',
                            '&.Mui-checked': {
                              color: '#F44336',
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(0, 0, 0, 0.26)',
                              cursor: 'not-allowed',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '20px',
                            },
                            '&:hover': {
                              backgroundColor:
                                event?.isFalsePositive === false ? 'transparent' : 'rgba(244, 67, 54, 0.04)',
                            },
                          }}
                        />
                      </Box>
                    </StyledDataCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length} align="center">
                  <Typography variant="body1">No Events Found for First Notice of Loss</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 0}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={fnolInformation?.pageDetails?.totalRecords}
        pageSize={fnolInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
      <SendClaims
        open={notifyOpen}
        onClose={() => {
          setNotifyOpen(false);
          setPendingEvent(null);
        }}
        onConfirm={handleConfirmSendClaims}
      />
    </Box>
  );
};

export default FnolListTable;
