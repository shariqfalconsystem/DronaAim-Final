import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { CartesianGrid, Line, XAxis, YAxis, Tooltip, LineChart, ResponsiveContainer } from 'recharts';
import LoadingScreen from '../../../components/molecules/loading-screen';

const SafetyScoreChart = ({
  chartData,
  selectedRange,
  selectedMonth,
  isWeekActive,
  isFetchingScores,
  dateRange,
}: any) => {
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

  return (
    <Box sx={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column' }} height={500}>
      {!isFetchingScores ? (
        <ResponsiveContainer width="100%" height="90%">
          {processedData.length > 0 ? (
            <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tickLine={false} />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                label={{
                  value: 'Safety Score',
                  angle: -90,
                  position: 'left',
                  offset: -5,
                  style: { textAnchor: 'middle' },
                }}
              />
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
                name="Average Safety Score Of All Fleets"
              />
            </LineChart>
          ) : (
            <Box sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
            Fleet Score
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: '500', ml: 5 }}>
            -------- Average Safety Score of Total Fleets
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SafetyScoreChart;
