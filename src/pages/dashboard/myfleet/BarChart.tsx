import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './BarChart.css';

const BarCharts = ({ data, label, domain, ticks, barsize }: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '100%',
        width: '100%',
        padding: '15px',
      }}
    >
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tickLine={false} tick={false} />
          <YAxis
            type="number"
            domain={domain}
            interval={0}
            ticks={ticks}
            label={{
              value: label,
              angle: -90,
              position: 'insideBottomLeft',
              offset: 15,
            }}
          />
          <Tooltip />
          <Bar
            dataKey="filled"
            fill="#4caf50"
            isAnimationActive={false}
            barSize={barsize ?? 12}
            background={{ fill: '#EDF2F7' }}
          />
          <Legend
            layout="vertical"
            align="right"
            wrapperStyle={{
              fontSize: '10px',
              color: 'black',
              height: 'auto',
              width: 'auto',
              lineHeight: '3',
              right: '-10px',
              bottom: '20px',
            }}
            payload={data.map((entry: any) => ({
              id: entry.name,
              type: 'circle',
              value: `${entry.name} (${entry.filled})`,
              color: entry.fill,
            }))}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarCharts;
