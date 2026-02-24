import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, ButtonGroup, Button, Divider, FormControl, Select, MenuItem } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RiShieldCheckFill } from '@remixicon/react';
import { DatePicker } from 'antd';
import { getVehicleScore } from '../../services/fleetManager/vehiclesService';
import dayjs, { Dayjs } from 'dayjs';
import { formatScore } from '../../utility/utilities';
import LoadingScreen from '../../components/molecules/loading-screen';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const VehicleScoreChart = ({ vehicleId }: { vehicleId: string }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'year'>('year');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [isWeekActive, setIsWeekActive] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<any>(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [isFetchingScores, setIsFetchingScores] = useState(false);

  const { RangePicker } = DatePicker;

  const fetchData = async (fromDate: number, toDate: number) => {
    setIsFetchingScores(false);
    try {
      const { data } = await getVehicleScore(vehicleId, fromDate, toDate);

      const availableData = data?.data ?? [];
      if (availableData.length === 0) {
        setChartData([]);
        return;
      }

      availableData.sort((a: any, b: any) => b.vechicleScoreTs - a.vechicleScoreTs);

      const lastAvailable = dayjs(availableData[0].vechicleScoreTs).endOf('day');
      const firstAvailable = dayjs(availableData[availableData.length - 1].vechicleScoreTs).startOf('day');
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
        const formattedDate = dayjs(item.vechicleScoreTs).format('YYYY-MM-DD');
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

      setChartData(mappedData);
    } catch (error) {
      console.error('Error fetching vehicle score:', error);
    } finally {
      setIsFetchingScores(false);
    }
  };

  useEffect(() => {
    const [start, end] = dateRange;
    fetchData(start?.startOf('day')?.valueOf(), end?.endOf('day')?.valueOf());
  }, [dateRange, vehicleId]);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
    }
  };

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

  const aggregateDataByMonth = (data: any[]) => {
    const monthlyData: any = {};

    data.forEach((item) => {
      const month = dayjs(item.date).format('YYYY-MM');

      if (!monthlyData[month]) {
        monthlyData[month] = { date: month, score: 0, median: 0, scoreCount: 0, medianCount: 0 };
      }

      if (item.score !== 'NA') {
        monthlyData[month].score += parseFloat(item.score);
        monthlyData[month].scoreCount += 1;
      }

      if (item.median !== 'NA') {
        monthlyData[month].median += parseFloat(item.median);
        monthlyData[month].medianCount += 1;
      }
    });

    return Object.values(monthlyData).map((item: any) => ({
      date: item.date,
      score: item.scoreCount > 0 ? (item.score / item.scoreCount).toFixed(1) : 'NA',
      median: item.medianCount > 0 ? (item.median / item.medianCount).toFixed(1) : 'NA',
    }));
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

  const processedData =
    !isWeekActive && (selectedMonth === 'Month' || selectedMonth === 0) ? aggregateDataByMonth(chartData) : chartData;

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: 2, backgroundColor: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <RiShieldCheckFill color="#4C6784" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
            Vehicle Score
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
      <Box sx={{ mt: 2 }}>
        {!isFetchingScores ? (
          <ResponsiveContainer width="100%" height={300}>
            {processedData.length > 0 ? (
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tickLine={false} />
                <YAxis tickFormatter={formatYAxis} tickLine={false} />
                <Tooltip />
                <Line type="linear" dataKey="score" stroke="#008334" strokeWidth={4} activeDot={{ r: 8 }} dot={false} />
                <Line
                  type="linear"
                  dataKey="median"
                  stroke="#2C3E50"
                  strokeDasharray="5 5"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={false}
                  name="Average Score of All Vehicles"
                />
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
          <LoadingScreen />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ borderBottom: '2px solid #008334', width: '100px', mr: 1 }} />
            <Typography variant="subtitle1" sx={{ color: '#008334', fontWeight: '500' }}>
              Vehicle Score
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: '500', ml: 5 }}>
              --------- Average score of all vehicles
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VehicleScoreChart;
