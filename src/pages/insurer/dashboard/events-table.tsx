import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  Box,
  TextField,
  FormControl,
  ButtonGroup,
} from '@mui/material';
import { FilterList, CalendarToday } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Pagination from '../../../components/molecules/pagination';
import dayjs, { Dayjs } from 'dayjs';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilterCriteria,
  selectFilterCriteria,
  setFilterCriteria,
} from '../../../redux/insurer/dashboard/iEventsMileSlice';
import { FleetEventsMileDialog } from '../../../components/modals/iFleet-events-mile-dialog';
import { getFleetEventsOverview } from '../../../services/insurer/IdashboardService';
import { convertKmToMiles } from '../../../utility/utilities';
import EventsIcon from '../../../assets/icons/events.png';

const EventsTable = ({ insurerId }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const [selectedWeek, setSelectedWeek] = useState('Week');

  const [selectedFleet, setSelectedFleet] = useState<any>(null);
  const [selectedFleetDisplayName, setSelectedFleetDisplayName] = useState<any>(null);

  const [selectedEventType, setSelectedEventType] = useState('Total Events');

  const [isWeekActive, setIsWeekActive] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<any>(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [filterButtonPosition, setFilterButtonPosition] = useState<any>(null);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [searchTermForEventsPerMile, setSearchTermForEventsPerMile] = useState('');
  const [fleetData, setFleetData] = useState<any>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [eventsOverviewData, setEventsOverviewData] = useState<any>({});

  const handleFilterPopupClose = () => setFilterPopupOpen(false);

  const filterCriteria = useSelector(selectFilterCriteria);

  const ITEMS_PER_PAGE = 10;

  const { RangePicker } = DatePicker;

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEventsOverview = async () => {
      try {
        const fromDate = dateRange[0]?.startOf('day')?.valueOf();
        const toDate = dateRange[1].endOf('day')?.valueOf();
        const range = [fromDate, toDate];
        // const eventPerMile = filterCriteria?.eventsPerMile;

        const postData = {
          insurerId: insurerId,
          fleetName: searchTerm,
          sortKey: sortColumn || 'eventsPerMile',
          sortOrder: sortColumn ? sortDirection : 'DESC',
          dateRange: range,
          eventsPerMile: searchTermForEventsPerMile ? searchTermForEventsPerMile : null,
          ...(filterCriteria && {
            eventsPerMileRange: filterCriteria?.eventsPerMile,
          }),
        };

        const response = await getFleetEventsOverview(postData, currentPage, 10);

        const fleetEventsWithIds = (response.data.fleetEvents || []).map((event: any, index: any) => ({
          ...event,
          id: `${event.name || 'event'}_${index}`,
        }));

        setFleetData(fleetEventsWithIds);
        setTotalRecords(response.data.pageDetails.totalRecords || 0);
      } catch (error) {
        setFleetData([]);
        console.error('Error fetching driver overview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsOverview();
  }, [
    currentPage,
    searchTerm,
    sortColumn,
    sortDirection,
    dateRange,
    filterCriteria,
    searchTermForEventsPerMile,
    insurerId,
  ]);

  useEffect(() => {
    if (fleetData.length > 0 && !selectedFleet) {
      setSelectedFleet(fleetData[0].id);
      setSelectedFleetDisplayName(fleetData[0].name);
    }
  }, [fleetData, selectedFleet]);
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const toggleRangePicker = () => {
    setShowRangePicker(!showRangePicker);
  };

  const totalPages = Math.ceil((totalRecords || 0) / ITEMS_PER_PAGE);

  const getFleetEventsSummary = (fleetEvents: any) => {
    if (!fleetEvents?.eventsMeta) return null;

    const eventCounts: any = {
      Speed: 0,
      Turn: 0,
      Brake: 0,
      Accelerate: 0,
      Shock: 0,
      SevereShock: 0,
    };

    fleetEvents.eventsMeta.forEach((event: any) => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });

    return [
      { name: 'Speeding', events: eventCounts.Speed || 0, color: '#4CAF50' },
      { name: 'Harsh Cornering', events: eventCounts.Turn || 0, color: '#F44336' },
      { name: 'Harsh Acceleration', events: eventCounts.Accelerate || 0, color: '#FF9800' },
      { name: 'Harsh Braking', events: eventCounts.Brake || 0, color: '#2196F3' },
      { name: 'Impact', events: eventCounts.Shock || 0, color: '#9C27B0' },
      { name: 'Severe Impact', events: eventCounts.SevereShock || 0, color: '#E91E63' },
      { name: 'SOS', events: eventCounts.Panic || 0, color: '#8D6F64' },
    ];
  };

  const getFleetTrendData = (fleetEvents: any, eventType: string) => {
    if (!fleetEvents?.eventsMeta) return [];

    const eventTypeMapping: { [key: string]: string } = {
      Speeding: 'Speed',
      'Harsh Cornering': 'Turn',
      'Harsh Acceleration': 'Accelerate',
      'Harsh Braking': 'Brake',
      Impact: 'Shock',
      'Severe Impact': 'SevereShock',
      SOS: 'PanicButton',
    };

    const eventsByDate: Record<string, number> = {};

    const relevantEvents =
      eventType === 'Total Events'
        ? fleetEvents.eventsMeta
        : fleetEvents.eventsMeta.filter((event: any) => event.eventType === eventTypeMapping[eventType]);

    const sortedEvents = relevantEvents.sort((a: any, b: any) => a.tsInMilliSeconds - b.tsInMilliSeconds);

    sortedEvents.forEach((event: any) => {
      const dateLabel = dayjs(event.tsInMilliSeconds).format('MMM DD');
      eventsByDate[dateLabel] = (eventsByDate[dateLabel] || 0) + 1;
    });

    const totalEvents = Object.values(eventsByDate).reduce((a, b) => a + b, 0);

    let totalEventsPerMile = 0;
    const dataPoints = Object.entries(eventsByDate).map(([name, events]) => {
      const eventsPerMile: any = fleetEvents.totalDistance
        ? convertKmToMiles((events / fleetEvents.totalDistance).toFixed(4))
        : 0;
      totalEventsPerMile += parseFloat(eventsPerMile);
      return {
        name,
        eventsPerMile: eventsPerMile ? eventsPerMile.toFixed(4) : 0,
        events: events,
      };
    });

    const averageEventsPerMile = (totalEventsPerMile / dataPoints.length).toFixed(4);
    dataPoints.forEach((dataPoint: any) => (dataPoint.average = averageEventsPerMile));

    const firstDate = dataPoints[0];
    const lastDate = dataPoints[dataPoints.length - 1];
    const interval = Math.ceil(dataPoints.length / 10);

    const adjustedData = dataPoints.filter((_, index) => index % interval === 0);
    if (firstDate && adjustedData[0].name !== firstDate.name) adjustedData.unshift(firstDate);
    if (lastDate && adjustedData[adjustedData.length - 1].name !== lastDate.name) adjustedData.push(lastDate);

    return adjustedData;
  };

  const handleEventClick = (eventName: any) => {
    setSelectedEventType(eventName);
  };

  const selectedFleetData = useMemo(() => {
    return selectedFleet ? fleetData.find((fleet: any) => fleet?.id === selectedFleet) : fleetData[0];
  }, [selectedFleet, fleetData]);

  const eventsSummary = useMemo(() => getFleetEventsSummary(selectedFleetData), [selectedFleetData]);
  const trendData = useMemo(
    () => getFleetTrendData(selectedFleetData, selectedEventType),
    [selectedFleetData, selectedEventType]
  );

  const totalEvents = useMemo(() => eventsSummary?.reduce((sum, event) => sum + event.events, 0) || 0, [eventsSummary]);

  const years = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const months: any = useMemo(
    () => ['Month', ...Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'))],
    []
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleSearchChange = (event: any) => {
    const value = event.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSearchChangeForEventsPerMile = (event: any) => {
    const value = event.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSearchTermForEventsPerMile(value);
    }
  };

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    if (range === 'week') {
      if (isWeekActive) {
        setIsWeekActive(false);
        if (selectedMonth === 'Month' || selectedMonth === 0) {
          const start = dayjs().year(selectedYear).startOf('year');
          const end = dayjs().year(selectedYear).endOf('year');
          setDateRange([start, end]);
        } else {
          const start = dayjs()
            .year(selectedYear)
            .month(selectedMonth - 1)
            .startOf('month');
          const end = dayjs()
            .year(selectedYear)
            .month(selectedMonth - 1)
            .endOf('month');
          setDateRange([start, end]);
        }
      } else {
        setIsWeekActive(true);
        setSelectedMonth(0);
        const start = dayjs().subtract(1, 'week');
        const end = dayjs();
        setDateRange([start, end]);
      }
    } else {
      setIsWeekActive(false);
      let start = dayjs();
      const end = dayjs();

      switch (range) {
        case 'month':
          start = dayjs()
            .month(selectedMonth - 1)
            .startOf('month');
          break;
        case 'year':
          start = dayjs().year(selectedYear).startOf('year');
          break;
      }

      setDateRange([start, end]);
    }
  };

  const handleMonthChange = (event: any) => {
    const month = event.target.value;
    setSelectedMonth(month);
    setIsWeekActive(false);

    if (month === 0) {
      const start = dayjs().year(selectedYear).startOf('year');
      const end = dayjs().year(selectedYear).endOf('year');

      setDateRange([start, end]);
    } else {
      const start = dayjs()
        .year(selectedYear)
        .month(month - 1)
        .startOf('month');
      const end = dayjs()
        .year(selectedYear)
        .month(month - 1)
        .endOf('month');
      setDateRange([start, end]);
    }
  };

  const handleYearChange = (event: any) => {
    const selectedYear = event.target.value;
    setSelectedYear(selectedYear);
    if (selectedMonth === 'Month' || selectedMonth === 0) {
      const start = dayjs().year(selectedYear).startOf('year');
      const end = dayjs().year(selectedYear).endOf('year');
      setDateRange([start, end]);
    } else {
      const start = dayjs()
        .year(selectedYear)
        .month(selectedMonth - 1)
        .startOf('month');
      const end = dayjs()
        .year(selectedYear)
        .month(selectedMonth - 1)
        .endOf('month');
      setDateRange([start, end]);
    }
  };

  const handleFilterIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setFilterButtonPosition({
      top: buttonRect.bottom,
      left: buttonRect.left,
    });
    setFilterPopupOpen(true);
  };

  const handleFilterApply = (filters: any) => {
    dispatch(setFilterCriteria(filters));
  };

  const handleClearFilter = () => {
    dispatch(clearFilterCriteria());
  };

  const getSelectedEventColor = useMemo(() => {
    if (selectedEventType === 'Total Events') return '#2C3E50';
    const selectedEvent = eventsSummary?.find((event) => event.name === selectedEventType);
    return selectedEvent?.color || '#2C3E50';
  }, [selectedEventType, eventsSummary]);

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C3D1DD' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            pb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2 }}>
            <img src={EventsIcon} alt="portfolio" width={31} height={32} />
            <Typography sx={{ fontSize: '0.875rem', ml: 2 }}>Events</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            mb: 5,
            borderRight: '1px solid #C3D1DD',
            px: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
              borderBottom: '1px solid #C3D1DD',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: '400', fontSize: '1rem' }}>
              Overview
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ textTransform: 'none', mr: 2 }}
                onClick={handleFilterIconClick}
              >
                Filters
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ flex: 1, mr: 2, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    '&:first-child td, &:first-child th': { border: 0 },
                  }}
                >
                  <TableCell sx={{ backgroundColor: '#fff', textAlign: 'center', width: '50%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2">Fleets</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        <TbTriangleFilled
                          size={8}
                          color={sortColumn === 'name' && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                          onClick={() => handleSort('name', 'ASC')}
                        />
                        <TbTriangleInvertedFilled
                          size={8}
                          color={sortColumn === 'name' && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                          onClick={() => handleSort('name', 'DESC')}
                        />
                      </Box>
                    </Box>

                    <TextField
                      size="small"
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      sx={{
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          width: '100%',
                          height: '30px',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#fff', textAlign: 'center', width: '50%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2">Events / Mile</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        <TbTriangleFilled
                          size={8}
                          color={sortColumn === 'eventsPerMile' && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                          onClick={() => handleSort('eventsPerMile', 'ASC')}
                        />
                        <TbTriangleInvertedFilled
                          size={8}
                          color={
                            sortColumn === 'eventsPerMile' && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'
                          }
                          onClick={() => handleSort('eventsPerMile', 'DESC')}
                        />
                      </Box>
                    </Box>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={searchTermForEventsPerMile}
                      onChange={handleSearchChangeForEventsPerMile}
                      sx={{
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          width: '100%',
                          height: '30px',
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fleetData && fleetData.length > 0 ? (
                  fleetData?.map((fleet: any, index: number) => {
                    return (
                      <TableRow
                        key={fleet?.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          height: '60px',
                          background:
                            fleet?.id === selectedFleet ? 'linear-gradient(90deg, #B7D7E7 0%, #E9F8FF 100%)' : 'none',
                          color: fleet?.id === selectedFleet ? '#fff' : 'inherit',
                          cursor: 'pointer',
                          // borderTop: index === 0 ? 'none,
                        }}
                        onClick={() => {
                          setSelectedFleet(fleet?.id);
                          setSelectedFleetDisplayName(fleet.name);
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {fleet?.name || 'NA'}
                        </TableCell>
                        <TableCell align="center">{fleet?.eventsPerMile || '0.00'}</TableCell>{' '}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                        <Typography variant="body1">No Fleets Found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRecords={totalRecords}
            pageSize={ITEMS_PER_PAGE}
            isDefaultList={false}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', px: 2, flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              mb: 2,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.8,
                borderBottom: '1px solid #C3D1DD',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: '400', fontSize: '1rem' }}>
                Trend
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                {!showRangePicker && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <ButtonGroup variant="outlined" size="small" color="primary">
                      <Button
                        onClick={() => handleRangeChange('week')}
                        style={{
                          backgroundColor: isWeekActive ? '#2C3E50' : 'transparent',
                          color: isWeekActive ? '#fff' : '#000',
                          height: 35,
                        }}
                      >
                        Week
                      </Button>
                    </ButtonGroup>
                    <FormControl size="small" sx={{ maxWidth: 100 }}>
                      <Select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        sx={{
                          height: 35,
                          backgroundColor: selectedMonth !== 0 ? '#2C3E50' : 'transparent',
                          color: selectedMonth !== 0 ? '#fff' : '#000',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: selectedMonth !== 0 ? 'white' : '#000',
                          },
                          '& .MuiSvgIcon-root': {
                            color: selectedMonth !== 0 ? 'white' : '#000',
                          },
                        }}
                      >
                        {months.map((month: any, index: any) => (
                          <MenuItem
                            key={index}
                            value={index}
                            sx={{
                              ':hover': {
                                backgroundColor: '#2c3e50',
                                color: '#fff',
                              },
                            }}
                          >
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ maxWidth: 100 }}>
                      <Select
                        value={selectedYear}
                        onChange={handleYearChange}
                        sx={{
                          height: 35,
                          backgroundColor: selectedYear !== 0 ? '#2C3E50' : 'transparent',
                          color: selectedYear !== 0 ? '#fff' : '#000',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: selectedYear !== 0 ? 'white' : '#000',
                          },
                          '& .MuiSvgIcon-root': {
                            color: selectedYear !== 0 ? 'white' : '#000',
                          },
                        }}
                      >
                        {years.map((year) => (
                          <MenuItem
                            key={year}
                            value={year}
                            sx={{
                              ':hover': {
                                backgroundColor: '#2c3e50',
                                color: '#fff',
                              },
                            }}
                          >
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <IconButton onClick={toggleRangePicker} color="primary">
                    <CalendarToday />
                  </IconButton>
                </Box>
                {showRangePicker && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <RangePicker
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      allowClear={true}
                      format="MM/DD/YYYY"
                    />
                  </Box>
                )}{' '}
              </Box>
            </Box>
            <Box sx={{ p: 1, mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#247FAD' }}>
                  {selectedFleetDisplayName}
                </Typography>

                <Box
                  sx={{
                    mb: 4,
                    height: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: trendData && trendData.length > 0 ? '0px solid #C3D1DD' : '1px dashed #C3D1DD',
                    borderRadius: '8px',
                    // backgroundColor: '#fff',
                  }}
                >
                  {trendData && trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendData}
                        margin={{
                          top: 15,
                          right: 10,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          label={{
                            value: 'Average Events/Mile of Fleet',
                            position: 'bottom',
                            offset: 5,
                            style: { textAnchor: 'middle' },
                          }}
                        />
                        <YAxis
                          allowDecimals={true}
                          label={{
                            value: 'Events / Mile',
                            angle: -90,
                            position: 'left',
                            offset: 10,
                            style: { textAnchor: 'middle' },
                          }}
                        />
                        <Tooltip />
                        <Line type="linear" dataKey="eventsPerMile" stroke={getSelectedEventColor} name="Events/mile" />
                        <Line type="linear" dataKey="average" stroke="#809AB2" dot={true} name="Average" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        // color: '#809AB2',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        textAlign: 'center',
                      }}
                    >
                      No Events Found
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                <>
                  <Box
                    key="total events"
                    sx={{
                      width: '100%',
                      height: '65px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleEventClick('Total Events')}
                  >
                    <Box
                      sx={{
                        border: selectedEventType === 'Total Events' ? '1px solid black' : 'none',
                        p: selectedEventType === 'Total Events' ? '4px' : 'none',
                        mr: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#2C3E50',
                          borderRadius: selectedEventType === 'Total Events' ? '1px' : '50%',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: selectedEventType === 'Total Events' ? '#2C3E50' : 'inherit' }}
                    >
                      Total Events
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ ml: 'auto', color: selectedEventType === 'Total Events' ? '#2C3E50' : 'inherit' }}
                    >
                      {totalEvents} events
                    </Typography>
                  </Box>
                  {eventsSummary?.map((event: any, index) => (
                    <Box
                      key={event?.name}
                      onClick={() => handleEventClick(event?.name)}
                      sx={{
                        width: '100%',
                        height: '45px',
                        borderBottom: index === eventsSummary.length - 1 ? 'none' : '1px solid rgba(224, 224, 224, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          border: selectedEventType === event?.name ? '1px solid black' : 'none',
                          p: selectedEventType === event?.name ? '4px' : 'none',
                          mr: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: event?.color,
                            borderRadius: selectedEventType === event?.name ? '1px' : '50%',
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ color: selectedEventType === event.name ? event.color : 'inherit' }}
                      >
                        {event.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ ml: 'auto', color: selectedEventType === event.name ? event.color : 'inherit' }}
                      >
                        {event.events} events
                      </Typography>
                    </Box>
                  ))}
                </>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <FleetEventsMileDialog
        filterPopupOpen={filterPopupOpen}
        handleFilterPopupClose={handleFilterPopupClose}
        filterButtonPosition={filterButtonPosition}
        onApplyFilter={handleFilterApply}
        onClearFilter={handleClearFilter}
      />
    </Paper>
  );
};

export default EventsTable;
