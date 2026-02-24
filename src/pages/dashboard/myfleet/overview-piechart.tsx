import { Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1C7C44', '#D24537', '#6AA5D9'];
const PLACEHOLDER_COLOR = '#E0E0E0';

const renderCustomizedLabel = ({ cx, cy, count, label, isNA }: any) => {
  return (
    <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#000" fontSize={24} fontWeight="bold">
      {isNA ? '0' : count}
      <tspan x={cx} y={cy + 25} fontSize={16} fontWeight="normal">
        {label}
      </tspan>
    </text>
  );
};

const OverviewPieChart = ({ count, label, dataLabels, data }: any) => {
  let pieData = dataLabels.map((label: string, index: number) => ({
    name: label,
    value: data[index],
  }));

  const hasData = pieData.some((item: any) => item.value > 0);

  const isNA = !hasData;

  if (!hasData) {
    // If all values are zero, replace them with a small value (but keep labels for legend)
    pieData = dataLabels.map((label: any) => ({
      name: label,
      value: 0.1, // Dummy value to render a circle
      isPlaceholder: true,
    }));
  }

  return (
    <Box sx={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy }) => renderCustomizedLabel({ cx, cy, count, label, isNA })}
            style={isNA ? { pointerEvents: 'none' } : {}}
          >
            {pieData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.isPlaceholder ? PLACEHOLDER_COLOR : COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(value: any, entry: any) => `${value} (${hasData ? entry.payload.value : 0})`}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OverviewPieChart;
