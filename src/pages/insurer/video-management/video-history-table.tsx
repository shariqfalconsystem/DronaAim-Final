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
  InputAdornment,
} from '@mui/material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { paths } from '../../../common/constants/routes';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import VideoStatusChip from '../../../components/atoms/video-status-chip';
import { formatTimestamp } from '../../../utility/utilities';
import VideoStatusModal from './dashcam-modal';
import { FilterList } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { FilterDashcamDialog } from '../../../components/modals/filter-dashcam-dialog';
import { clearFilterCriteria } from '../../../redux/insurer/dashcam/dashcamSlice';

const VideoHistoryTable = ({
  videoHistoryData,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  fetchData,
}: any) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [showBlocker, setShowBlocker] = useState(false);
  const [currentVideoStatus, setCurrentVideoStatus] = useState('');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const tableRef = useRef<HTMLTableElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const role = useSelector((state: any) => state.auth.currentUserRole);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const formatToISO8601 = (date: any, key?: string) => {
    if (!date) return null;

    if (key === 'createdAt') {
      return dayjs(date).utc().format('YYYY-MM-DDTHH:mm');
    }

    return dayjs(date).toISOString();
  };

  const handleDateTimeChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    const formattedDate = formatToISO8601(date, key);

    const newQueries = { ...localSearchQueries, [key]: formattedDate };
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
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setSearchQueries(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
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
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const columns = [
    { label: 'Video ID', key: 'requestId' },
    { label: 'Video Start Date & Time', key: 'startTime' },
    { label: 'Video End Date & Time', key: 'endTime' },
    { label: 'Request Date & Time', key: 'createdAt' },
    { label: 'Request Status', key: 'status' },
  ];

  const handleRowClick = (video: any) => {
    const status = video.status?.toLowerCase();
    const isCompleted = ['completed', 'completedwithlimits'].includes(status);

    if (isCompleted && (role === 'insurer' || role === 'insurerSuperUser')) {
      navigate(`${paths.INSURERVIDEOMANAGEMENT}/${video.deviceId}/dashcam-footage/${video.requestId}`, {
        state: { video, currentPage },
      });
    } else if (isCompleted && role === 'admin') {
      navigate(`${paths.ADMINVIDEOMANAGEMENT}/${video.deviceId}/dashcam-footage/${video.requestId}`, {
        state: video,
      });
    } else if (isCompleted && (role === 'fleetManagerSuperUser' || role === 'fleetManager')) {
      navigate(`${paths.FMVIDEOMANAGEMENT}/${video.deviceId}/dashcam-footage/${video.requestId}`, {
        state: video,
      });
    } else {
      setCurrentVideo(video);
      setCurrentVideoStatus(status || '');
      setShowBlocker(true);
    }
  };

  const handleCloseBlocker = () => {
    setShowBlocker(false);
    setCurrentVideo(null);
  };

  const totalPages =
    Math.ceil(videoHistoryData?.pageDetails?.totalRecords / videoHistoryData?.pageDetails?.pageSize) || 1;

  // Function to parse ISO date string back to dayjs object for the DatePicker
 const parseIsoDate = (isoString: string | null) => {
  if (!isoString) return null;
  return dayjs.utc(isoString).local();
};

  // Function to determine which input to render based on column key
  const renderColumnInput = (key: string) => {
    if (['startTime', 'endTime', 'createdAt'].includes(key)) {
      return (
        <DatePicker
          showTime={{ format: 'HH:mm', showSecond: false }}
          value={parseIsoDate(localSearchQueries[key])}
          onChange={(date) => handleDateTimeChange(date, key)}
          placeholder=""
          format="YYYY-MM-DD HH:mm"
          style={{ marginTop: 8, width: '100%' }}
          popupStyle={{ zIndex: 1500 }}
        />
      );
    } else if (key === 'status') {
      return (
        <TextField
          size="small"
          variant="outlined"
          value={localSearchQueries[key] || ''}
          disabled
          sx={{
            mt: 1,
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              height: '30px',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FilterList fontSize="small" sx={{ cursor: 'pointer' }} onClick={handleFilterIconClick} />
              </InputAdornment>
            ),
          }}
        />
      );
    } else {
      return (
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
              paddingRight: key === 'status' ? '8px' : 'inherit',
            },
          }}
        />
      );
    }
  };

  const handleFilterIconClick = () => {
    setShowFilterPopup(true);
  };

  const handleCloseFilterPopup = () => {
    setShowFilterPopup(false);
  };

  const handleFilterApply = (filters: any) => {};

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
    setCurrentPage(1);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        whiteSpace: 'nowrap',
      }}
    >
      <TableContainer
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
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map(({ label, key }, index) => (
                <StyledHeadCell key={key} sx={{}}>
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
                    </Typography>
                    {renderColumnInput(key)}
                  </Box>
                </StyledHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {videoHistoryData?.videoRequests && videoHistoryData?.videoRequests?.length > 0 ? (
              videoHistoryData?.videoRequests?.map((videoRequests: any) => {
                return (
                  <TableRow
                    key={videoRequests.requestId}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    onClick={() => handleRowClick(videoRequests)}
                  >
                    <StyledDataCell width="10%">{videoRequests.requestId || 'NA'}</StyledDataCell>
                    <StyledDataCell width="15%">{formatTimestamp(videoRequests?.startTime)}</StyledDataCell>
                    <StyledDataCell width="15%">{formatTimestamp(videoRequests?.endTime)}</StyledDataCell>
                    <StyledDataCell width="15%">{formatTimestamp(videoRequests?.createdAt)}</StyledDataCell>
                    <StyledDataCell width="15%">{<VideoStatusChip status={videoRequests?.status} />}</StyledDataCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1">No Videos Found</Typography>
                  </Box>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={videoHistoryData?.pageDetails?.totalRecords}
        pageSize={videoHistoryData?.pageDetails?.pageSize}
        isDefaultList={true}
      />

      {/* Using our new Modal Component */}
      <VideoStatusModal open={showBlocker} onClose={handleCloseBlocker} status={currentVideoStatus} />

      <FilterDashcamDialog
        filterPopupOpen={showFilterPopup}
        handleFilterPopupClose={handleCloseFilterPopup}
        // onApplyFilter={handleFilterApply}
        onClearFilter={handleClearFilter}
      />
    </Box>
  );
};

export default VideoHistoryTable;
