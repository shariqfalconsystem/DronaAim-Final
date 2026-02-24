import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1C7C44', '#D24537', '#6AA5D9']; // Matching colors from the uploaded image

const renderCustomizedLabel = ({ cx, cy, count, label }: any) => {
  return (
    <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#000" fontSize={24} fontWeight="bold">
      {count}
      <tspan x={cx} y={cy + 25} fontSize={16} fontWeight="normal">
        {label}
      </tspan>
    </text>
  );
};

const OverviewPieChart = ({ count, label, dataLabels, data }: any) => {
  const pieData = dataLabels.map((label: string, index: number) => ({
    name: label,
    value: data[index],
  }));

  return (
    <Box sx={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%" // Adjusted to move the pie chart left for space for the legend
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy }) => renderCustomizedLabel({ cx, cy, count, label })}
          >
            {pieData.map((entry: any, index: number) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(value: any, entry: any) => `${value} (${entry.payload.value})`}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OverviewPieChart;
