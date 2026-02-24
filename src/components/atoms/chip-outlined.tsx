import { Chip } from '@mui/material';

const ChipOutlined = ({ label, color, ...props }: any) => {
  return (
    <Chip
      label={label}
      sx={{
        backgroundColor: '#ECF0F1',
        border: `1px solid ${color}`,
        color: color,
      }}
      {...props}
    />
  );
};

export default ChipOutlined;
