import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, ButtonGroup, Button, Divider, FormControl, Select, MenuItem } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getVehicleEvents } from '../../services/fleetManager/vehicleDetailService';
import { eventTypeColorMap } from '../../common/constants/general';
import LoadingScreen from '../../components/molecules/loading-screen';
import Loader from '../../components/molecules/loader';

const EventOverview = ({ vehicleId }: { vehicleId: string }) => {
  const [responseData, setResponseData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'year'>('year');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [isWeekActive, setIsWeekActive] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<any>(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);

  const [activeIndex, setActiveIndex] = useState<any>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([
    'Speeding',
    'Harsh Cornering',
    'Harsh Braking',
    'Harsh Acceleration',
    'Impact',
    'Severe Impact',
    'SOS',
  ]);

  const { RangePicker } = DatePicker;

  const eventTypeMap: any = {
    Speeding: 'speeding',
    'Harsh Cornering': 'harshCornering',
    'Harsh Braking': 'harshBraking',
    'Harsh Acceleration': 'harshAcceleration',
    Impact: 'shock',
    'Severe Impact': 'severeShock',
    SOS: 'sos',
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingEvents(true);
      try {
        const fromDate = dateRange[0]?.startOf('day')?.valueOf();
        const toDate = dateRange[1]?.endOf('day')?.valueOf();
        const response = await getVehicleEvents(vehicleId, fromDate, toDate);
        setResponseData(response?.data?.allEvents);
        processData(response?.data?.allEvents);
      } catch (error) {
        console.error('Error fetching vehicle events:', error);
      } finally {
        setIsFetchingEvents(false);
      }
    };

    fetchData();
  }, [dateRange, vehicleId]);

  const months: any = useMemo(
    () => ['Month', ...Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'))],
    []
  );

  const years = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

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

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
    }
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
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius}
          outerRadius={outerRadius + 20}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
      </g>
    );
  };

  const toggleDataKey = (key: string) => {
    if (key === 'all') {
      setActiveKeys([
        'Speeding',
        'Harsh Cornering',
        'Harsh Braking',
        'Harsh Acceleration',
        'Impact',
        'Severe Impact',
        'SOS',
      ]);
      setActiveIndex(null);
    } else {
      setActiveKeys([key]);
      const index = pieData.findIndex((data) => data.name === key);
      setActiveIndex(index);
    }
  };

  const totalEvents = pieData.reduce((acc, cur) => acc + cur.value, 0);

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

  const formatXAxis = (tickItem: any) => {
    if (!isWeekActive && (selectedMonth === 'Month' || selectedMonth === 0)) {
      return dayjs(tickItem).format('MMM');
    } else {
      return dayjs(tickItem).format('DD MMM');
    }
  };

  const formatYAxis = (tick: any, index: any) => {
    if (index === 0) return '';
    return tick;
  };

  const aggregateDataByMonth = (data: any[]) => {
    const monthlyData: any = {};

    data.forEach((item) => {
      const month = dayjs(item.date).format('YYYY-MM');
      if (!monthlyData[month]) {
        // Initialize monthly data object for aggregation
        monthlyData[month] = {
          date: month,
          count: 0,
          Speeding: 0,
          'Harsh Cornering': 0,
          'Harsh Braking': 0,
          'Harsh Acceleration': 0,
          Impact: 0,
          'Severe Impact': 0,
          SOS: 0,
          eventCount: 0, // Count for event occurrences
        };
      }
      // Aggregate scores and median
      monthlyData[month].count += 1;

      // Aggregate event data
      monthlyData[month].Speeding += item.Speeding;
      monthlyData[month]['Harsh Cornering'] += item['Harsh Cornering'];
      monthlyData[month]['Harsh Braking'] += item['Harsh Braking'];
      monthlyData[month]['Harsh Acceleration'] += item['Harsh Acceleration'];
      monthlyData[month].Impact += item.Impact;
      monthlyData[month]['Severe Impact'] += item['Severe Impact'];
      monthlyData[month]['SOS'] += item['SOS'];
      monthlyData[month].eventCount += 1;
    });

    return Object.values(monthlyData).map((item: any) => ({
      date: item.date,
      Speeding: item.Speeding,
      'Harsh Cornering': item['Harsh Cornering'],
      'Harsh Braking': item['Harsh Braking'],
      'Harsh Acceleration': item['Harsh Acceleration'],
      Impact: item.Impact,
      'Severe Impact': item['Severe Impact'],
      SOS: item['SOS'],
    }));
  };

  const processedData =
    !isWeekActive && (selectedMonth === 'Month' || selectedMonth === 0) ? aggregateDataByMonth(chartData) : chartData;

  const handleActiveEvent = (e: any) => {
    setActiveKeys([e.name]);
  };

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: 2, backgroundColor: '#fff', mt: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Events Overview
        </Typography>
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
          <RangePicker value={dateRange} onChange={handleDateRangeChange} allowClear={true} format="MM/DD/YYYY" />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '35%', textAlign: 'center', display: 'flex', flexDirection: 'column' }} height={500}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Total Events: {totalEvents}
          </Typography>
          {!isFetchingEvents ? (
            <ResponsiveContainer width="100%" height="100%">
              {processedData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    startAngle={180}
                    endAngle={-180}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    legendType="diamond"
                    onClick={(event: any) => handleActiveEvent(event)}
                    style={{ outline: 'none', cursor: 'pointer' }}
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={eventTypeColorMap[entry.name]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No Data Available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          ) : (
            <Loader />
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              onClick={() => toggleDataKey('all')}
              variant={activeKeys.length === 6 ? 'contained' : 'outlined'}
              color="primary"
            >
              Total Events
            </Button>
          </Box>
        </Box>
        <Box width="65%" sx={{ display: 'flex', flexDirection: 'column' }} height={500}>
          {!isFetchingEvents ? (
            <ResponsiveContainer height="100%" style={{ marginTop: 50 }}>
              {processedData.length > 0 ? (
                <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatXAxis} tickLine={false} />
                  <YAxis tickFormatter={formatYAxis} tickLine={false} />

                  <Tooltip />
                  {activeKeys.map((key) => (
                    <Line
                      key={key}
                      type="linear"
                      dataKey={key}
                      name={key}
                      stroke={eventTypeColorMap[key]}
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No Data Available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          ) : (
            <Loader />
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', my: 2 }}>
            <ButtonGroup variant="contained" size="small">
              {Object.keys(eventTypeMap).map((key) => (
                <Button
                  key={key}
                  onClick={() => toggleDataKey(key)}
                  variant={activeKeys.includes(key) ? 'contained' : 'outlined'}
                  style={{ backgroundColor: eventTypeColorMap[key], color: '#fff' }}
                >
                  {key}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EventOverview;
