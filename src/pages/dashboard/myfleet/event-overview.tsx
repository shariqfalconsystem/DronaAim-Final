import { Box, ButtonGroup, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingScreen from '../../../components/molecules/loading-screen';

const EventOverview = ({
  chartData,
  activeKeys,
  colorMap,
  eventTypeMap,
  toggleDataKey,
  isWeekActive,
  selectedMonth,
  isFetchingEvents,
  dateRange,
}: any) => {
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
    }));
  };

  const isDateRangeMoreThan3Months = () => {
    if (!dateRange || dateRange.length !== 2) return false;

    const startDate = dayjs(dateRange[0]);
    const endDate = dayjs(dateRange[1]);
    const diffInMonths = endDate.diff(startDate, 'month', true);

    return diffInMonths > 3;
  };

  const processedData = isDateRangeMoreThan3Months() ? aggregateDataByMonth(chartData) : chartData;

  const formatXAxis = (tickItem: any) => {
    if (isDateRangeMoreThan3Months()) {
      return dayjs(tickItem).format('MMM');
    } else {
      return dayjs(tickItem).format('DD MMM');
    }
  };

  const formatYAxis = (tick: any, index: any) => {
    if (index === 0) return '';
    return tick;
  };

  const allActiveKeys = [...activeKeys];
  if (!allActiveKeys.includes('score')) {
    allActiveKeys.push('score');
  }

  return (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Box width="100%" sx={{ display: 'flex', flexDirection: 'column' }} height={500}>
        {!isFetchingEvents ? (
          <ResponsiveContainer height="100%" style={{ marginTop: 20 }}>
            {processedData.length > 0 ? (
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  allowDecimals={false}
                  label={{
                    value: 'Total Events',
                    angle: -90,
                    position: 'left',
                    offset: -5,
                    style: { textAnchor: 'middle' },
                  }}
                />

                <Tooltip />
                {allActiveKeys.map((key: any) => (
                  <Line
                    yAxisId="left"
                    key={key}
                    type="linear"
                    dataKey={key}
                    name={key}
                    stroke={colorMap[key] || 'green'}
                    strokeWidth={4}
                    activeDot={{ r: 8 }}
                    dot={false}
                  />
                ))}
              </LineChart>
            ) : (
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No Data Available
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        ) : (
          <LoadingScreen />
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', my: 0 }}>
          <ButtonGroup size="small">
            {Object.keys(eventTypeMap).map((key) => (
              <Button
                key={key}
                onClick={() => toggleDataKey(key)}
                variant={activeKeys.includes(key) ? 'contained' : 'outlined'}
                style={{ backgroundColor: colorMap[key], color: '#fff', marginLeft: 5 }}
              >
                {key}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default EventOverview;
