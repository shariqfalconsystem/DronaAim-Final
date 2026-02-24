import { Box, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TbShieldCheckFilled } from 'react-icons/tb';
import { formatScore } from '../../../../utility/utilities';

ChartJS.register(ArcElement, Tooltip);

const PieChartComponent = ({ overallSafetyScore }: any) => {
  const safetyScore = overallSafetyScore;
  const remainingScore = 100 - safetyScore;

  let scoreColor = '#008334';
  if (safetyScore >= 90 && safetyScore <= 100) {
    scoreColor = '#008334';
  } else if (safetyScore >= 80 && safetyScore <= 89) {
    scoreColor = '#FFD700';
  } else if (safetyScore >= 0 && safetyScore <= 79) {
    scoreColor = '#FF0000';
  }

  const chartData = {
    labels: ['Remaining', 'Safety Score'],
    datasets: [
      {
        data: [remainingScore, safetyScore],
        backgroundColor: ['#E0E0E0', scoreColor],
        hoverBackgroundColor: ['#D3D3D3', scoreColor],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '80%',
    rotation: 0,
    circumference: 360,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '90%',
        width: '100%',
      }}
    >
      <Box sx={{ position: 'relative', height: '400px', width: '250px' }}>
        <Doughnut data={chartData} options={chartOptions} />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" sx={{ color: '#008334', fontWeight: 'bold' }}>
            <TbShieldCheckFilled size={70} color={scoreColor} />
          </Typography>
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
            {formatScore(safetyScore)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PieChartComponent;
