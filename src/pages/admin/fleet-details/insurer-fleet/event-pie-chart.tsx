import { Box, Button, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

ChartJS.register(ArcElement, Tooltip);

const EventPieChartComponent = ({
  totalEvents,
  pieData,
  onPieEnter,
  onPieLeave,
  activeIndex,
  renderActiveShape,
  colorMap,
  activeKeys,
  toggleDataKey,
}: any) => {
  return (
    <Box
      sx={{
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
      height={450}
    >
      <Typography variant="h6" sx={{ mt: 1, fontSize: '1.1rem' }}>
        Total {totalEvents} Events
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        {pieData.length > 0 ? (
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
              stroke="none"
              style={{ outline: 'none' }}
            >
              {pieData.map((entry: any) => (
                <Cell key={`cell-${entry.name}`} fill={colorMap[entry.name]} style={{ outline: 'none' }} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No Data Available
            </Typography>
          </Box>
        )}
      </ResponsiveContainer>
    </Box>
  );
};

export default EventPieChartComponent;
