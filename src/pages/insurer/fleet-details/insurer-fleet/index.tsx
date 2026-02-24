import { Box, Button, ButtonGroup, FormControl, Grid, MenuItem, Select, Typography } from '@mui/material';
import PieChartComponent from './PieChart';
import TrendIcon from '../../../../assets/icons/trend.png';
import SafetyIcon from '../../../../assets/icons/overall-safety.png';
import { DatePicker } from 'antd';
import { useMemo, useState } from 'react';
import EventPieChartComponent from './event-pie-chart';
import EventOverview from './event-overview';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { Sector } from 'recharts';
import { formatScore } from '../../../../utility/utilities';
import { eventTypeColorMap } from '../../../../common/constants/general';
import SafetyScoreChart from './safety-score-chart';
import { getFleetEvents, getFleetScore } from '../../../../services/fleetManager/dashboardService';
import { PiCalendarDotsDuotone } from 'react-icons/pi';

const MyFleet = ({ lonestarId }: any) => {
  const [activeButton, setActiveButton] = useState<'Safety Score' | 'Total Events'>('Safety Score');

  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [isWeekActive, setIsWeekActive] = useState(false);
  const defaultActiveKeys = [
    'Speeding',
    'Harsh Cornering',
    'Harsh Braking',
    'Harsh Acceleration',
    'Impact',
    'Severe Impact',
    'SOS',
  ];

  const eventTypeMap: any = {
    Speeding: 'speeding',
    'Harsh Cornering': 'harshCornering',
    'Harsh Braking': 'harshBraking',
    'Harsh Acceleration': 'harshAcceleration',
    Impact: 'shock',
    'Severe Impact': 'severeShock',
    SOS: 'SOS',
  };

  const [responseData, setResponseData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [scoreChartData, setScoreChartData] = useState<any[]>([]);
  const [totalFleetScore, setTotalFleetScore] = useState<any>(null);
  const [pieData, setPieData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<any>(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [activeIndex, setActiveIndex] = useState<any>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>(defaultActiveKeys);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [isFetchingScores, setIsFetchingScores] = useState(false);

  const { RangePicker } = DatePicker;

  const months: any = useMemo(
    () => ['Month', ...Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'))],
    []
  );

  const years = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

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
      // Show the selected month range in the selected year
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

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    if (range === 'week') {
      // Toggle the week active state
      if (isWeekActive) {
        // If week is already active, deactivate it and reset range to month or year
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
        // If week is not active, activate it and set the range to the past week
        setIsWeekActive(true);
        setSelectedMonth(0);
        const start = dayjs().subtract(1, 'week');
        const end = dayjs();
        setDateRange([start, end]);
      }
    } else {
      // Handle month and year selection
      setIsWeekActive(false); // Deactivate the week button
      setSelectedRange(range);
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

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  useEffect(() => {
    const fetchEventsData = async () => {
      setIsFetchingEvents(true);
      try {
        const fromDate = dateRange[0]?.startOf('day')?.valueOf();
        const toDate = dateRange[1]?.endOf('day')?.valueOf();
        const response = await getFleetEvents(lonestarId, fromDate, toDate);
        setResponseData(response?.data?.allEvents);
        processData(response?.data?.allEvents);
      } catch (error) {
        console.error('Error fetching vehicle events:', error);
      } finally {
        setIsFetchingEvents(false);
      }
    };
    if (lonestarId) {
      fetchEventsData();
    }
  }, [dateRange, lonestarId]);

  const fetchScoreData = async (fromDate: number, toDate: number) => {
    try {
      setIsFetchingScores(true);
      const { data } = await getFleetScore(lonestarId, fromDate, toDate);
      setTotalFleetScore(data?.cummulativeScore);

      const availableData = data?.data ?? [];
      if (availableData.length === 0) {
        setScoreChartData([]);
        return;
      }

      availableData.sort((a: any, b: any) => b.fleetScoreTs - a.fleetScoreTs);

      const lastAvailable = dayjs(availableData[0].fleetScoreTs).endOf('day');
      const firstAvailable = dayjs(availableData[availableData.length - 1].fleetScoreTs).startOf('day');
      const currentDate = dayjs().startOf('day');

      const dateMap: any = {};
      let currentLoopDate = dayjs(fromDate).startOf('day');
      const endDate = dayjs(lastAvailable).endOf('day');

      // Initialize dateMap
      while (currentLoopDate.isBefore(endDate) || currentLoopDate.isSame(endDate)) {
        const formattedDate = currentLoopDate.format('YYYY-MM-DD');
        if (currentLoopDate.isBefore(firstAvailable)) {
          dateMap[formattedDate] = { date: formattedDate, score: 'NA', median: 'NA' };
        } else if (currentLoopDate.isAfter(lastAvailable) || currentLoopDate.isAfter(currentDate)) {
          dateMap[formattedDate] = { date: formattedDate, score: null, median: null };
        } else {
          dateMap[formattedDate] = { date: formattedDate, score: null, median: null };
        }
        currentLoopDate = currentLoopDate.add(1, 'day');
      }

      availableData.forEach((item: any) => {
        const formattedDate = dayjs(item.fleetScoreTs).format('YYYY-MM-DD');
        if (dateMap[formattedDate]) {
          dateMap[formattedDate] = {
            date: formattedDate,
            score: formatScore(item?.meanScore),
            median: formatScore(item?.medianScore),
          };
        }
      });

      const dateKeys = Object.keys(dateMap)
        .filter((dateKey) => !dayjs(dateKey).isAfter(currentDate)) // Filter out dates after `currentDate`
        .sort();

      let lastSeenScore: any = null;
      let lastSeenMedian: any = null;

      // Forward pass to fill in scores using last seen value
      dateKeys.forEach((dateKey) => {
        if (dateMap[dateKey].score === null) {
          dateMap[dateKey].score = lastSeenScore !== null ? lastSeenScore : 'NA';
          dateMap[dateKey].median = lastSeenMedian !== null ? lastSeenMedian : 'NA';
        } else {
          lastSeenScore = dateMap[dateKey].score;
          lastSeenMedian = dateMap[dateKey].median;
        }
      });

      // Backward pass: strictly retain 'NA' for all dates before `firstAvailable`
      lastSeenScore = null;
      lastSeenMedian = null;
      for (let i = dateKeys.length - 1; i >= 0; i--) {
        const dateKey = dateKeys[i];
        if (dayjs(dateKey).isBefore(firstAvailable)) {
          dateMap[dateKey].score = 'NA';
          dateMap[dateKey].median = 'NA';
        } else if (dateMap[dateKey].score === 'NA' && lastSeenScore !== null) {
          dateMap[dateKey].score = lastSeenScore;
          dateMap[dateKey].median = lastSeenMedian;
        } else if (dateMap[dateKey].score !== 'NA') {
          lastSeenScore = dateMap[dateKey].score;
          lastSeenMedian = dateMap[dateKey].median;
        }
      }

      const mappedData = dateKeys
        .filter((dateKey) => dateMap[dateKey].score !== null)
        .map((dateKey) => dateMap[dateKey])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setScoreChartData(mappedData);
    } catch (error) {
      console.error('Error fetching vehicle score:', error);
    } finally {
      setIsFetchingScores(false);
    }
  };

  useEffect(() => {
    const [start, end] = dateRange;
    fetchScoreData(start?.startOf('day')?.valueOf(), end?.endOf('day')?.valueOf());
  }, [dateRange, lonestarId]);

  const processData = (events: { tsInMilliSeconds: number; eventType: string }[]) => {
    const eventCounts: { [key: string]: number } = {
      Speeding: 0,
      'Harsh Cornering': 0,
      'Harsh Braking': 0,
      'Harsh Acceleration': 0,
      Impact: 0,
      'Severe Impact': 0,
      SOS: 0,
    };

    const availableData = events ?? [];
    if (availableData.length === 0) {
      setChartData([]);
      setPieData([]);
      return;
    }
    availableData.sort((a: any, b: any) => b.tsInMilliSeconds - a.tsInMilliSeconds);

    const dateGroupedData: { [date: string]: any } = {};

    const lastAvailable = dayjs(availableData[0].tsInMilliSeconds).endOf('day');

    let currentDate = dateRange[0].startOf('day');
    const endDate = dayjs(lastAvailable).endOf('day');

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const date = currentDate.format('YYYY-MM-DD');
      dateGroupedData[date] = { date, ...eventCounts };
      currentDate = currentDate.add(1, 'day');
    }

    events.forEach((event) => {
      const date = dayjs(event.tsInMilliSeconds).format('YYYY-MM-DD');
      if (!dateGroupedData[date]) {
        dateGroupedData[date] = { date, ...eventCounts };
      }
      switch (event.eventType) {
        case 'Speed':
          dateGroupedData[date]['Speeding']++;
          break;
        case 'Turn':
          dateGroupedData[date]['Harsh Cornering']++;
          break;
        case 'Brake':
          dateGroupedData[date]['Harsh Braking']++;
          break;
        case 'Accelerate':
          dateGroupedData[date]['Harsh Acceleration']++;
          break;
        case 'Shock':
          dateGroupedData[date]['Impact']++;
          break;
        case 'SevereShock':
          dateGroupedData[date]['Severe Impact']++;
          break;
        case 'PanicButton':
          dateGroupedData[date]['SOS']++;
          break;
        default:
          break;
      }
    });

    const chartDataArray = Object.values(dateGroupedData).sort((a, b) => {
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });

    setChartData(chartDataArray);

    const pieDataArray = Object.keys(eventCounts).map((key) => ({
      name: key,
      value: chartDataArray.reduce((sum, data) => sum + data[key], 0),
    }));

    setPieData(pieDataArray);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = (_: any, index: number) => {
    setActiveIndex(null);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 1}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="none"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill={fill}
          stroke="none"
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
      </g>
    );
  };

  const toggleDataKey = (key: string) => {
    if (key === 'all') {
      setActiveKeys(defaultActiveKeys);
      setActiveIndex(null);
    } else {
      setActiveKeys([key]);
      const index = pieData.findIndex((data) => data.name === key);
      setActiveIndex(index);
    }
  };

  const totalEvents = pieData.reduce((acc, cur) => acc + cur.value, 0);

  const handleActiveEvent = (e: any) => {
    setActiveKeys([e.name]);
  };

  return (
    <Box
      sx={{
        marginTop: 2,
        borderRadius: '20px',
        height: {
          xs: 'auto',
          md: 'auto',
        },
        backgroundColor: (theme) => theme.palette.common.white,
      }}
    >
      <Grid container>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              borderRadius: 0,
              borderRight: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              paddingY: 1,
            }}
          >
            <Box
              sx={{
                borderBottom: '1px solid #ccc',
                padding: 1.45,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'row',
                mb: 1,
              }}
            >
              <Box sx={{ ml: 1 }}>
                <img src={SafetyIcon} alt="overall-safety-icon" />
              </Box>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {activeButton === 'Safety Score' ? 'Fleet Score' : 'Events Overview'}
              </Typography>
            </Box>
            <Box>
              {activeButton === 'Safety Score' ? (
                <PieChartComponent overallSafetyScore={totalFleetScore || 'NA'} isFetchingScores={isFetchingScores} />
              ) : (
                <EventPieChartComponent
                  onPieEnter={onPieEnter}
                  onPieLeave={onPieLeave}
                  pieData={pieData}
                  colorMap={eventTypeColorMap}
                  activeKeys={activeKeys}
                  toggleDataKey={toggleDataKey}
                  totalEvents={totalEvents}
                  activeIndex={activeIndex}
                  renderActiveShape={renderActiveShape}
                  handleActiveEvent={handleActiveEvent}
                  isFetchingEvents={isFetchingEvents}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly', paddingTop: 5 }}>
                <Button
                  variant={activeButton === 'Safety Score' ? 'contained' : 'outlined'}
                  sx={{
                    background:
                      activeButton === 'Safety Score'
                        ? 'linear-gradient(180deg, #008334 0%, #001D0C 100%)'
                        : 'transparent',
                  }}
                  onClick={() => setActiveButton('Safety Score')}
                >
                  Safety Score
                </Button>
                <Button
                  variant={activeButton === 'Total Events' ? 'contained' : 'outlined'}
                  sx={{
                    background:
                      activeButton === 'Total Events'
                        ? 'linear-gradient(180deg, #3F5C78 0%, #001D0C 100%)'
                        : 'transparent',
                  }}
                  onClick={() => {
                    setActiveButton('Total Events');
                    setActiveIndex(null);
                    setActiveKeys(defaultActiveKeys);
                  }}
                >
                  Total Events
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              paddingY: 1,
            }}
          >
            <Box
              sx={{
                borderBottom: '1px solid #ccc',
                padding: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ ml: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={TrendIcon} alt="violations-overall" />
                </Box>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  TREND
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                {/* Month Dropdown */}
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
                {/* Year Dropdown */}
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
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  allowClear={true}
                  format="MM/DD/YYYY"
                  suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
                  className="custom-placeholder"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeButton === 'Safety Score' ? (
                <SafetyScoreChart
                  chartData={scoreChartData}
                  selectedMonth={selectedMonth}
                  isWeekActive={isWeekActive}
                  isFetchingScores={isFetchingScores}
                />
              ) : (
                <EventOverview
                  chartData={chartData}
                  scoreChartData={scoreChartData}
                  activeKeys={activeKeys}
                  colorMap={eventTypeColorMap}
                  eventTypeMap={eventTypeMap}
                  toggleDataKey={toggleDataKey}
                  selectedMonth={selectedMonth}
                  isWeekActive={isWeekActive}
                  isFetchingEvents={isFetchingEvents}
                />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyFleet;
