import * as React from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {};

export const FuelConsumptionGraph = (props: Props) => {
  return (
    <LineChart width={400} height={300} data={fuelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis ticks={[10, 20, 30, 40]} domain={[0, 40]} />
      <Tooltip />
      <Line type="monotone" dataKey="consumption" stroke="#247FAD" />
    </LineChart>
  );
};

const fuelData = [
  { day: 'S', consumption: 25 },
  { day: 'M', consumption: 30 },
  { day: 'T', consumption: 22 },
  { day: 'W', consumption: 35 },
  { day: 'T', consumption: 28 },
  { day: 'F', consumption: 32 },
  { day: 'S', consumption: 20 },
];
