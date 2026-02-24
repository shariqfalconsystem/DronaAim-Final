import { Box } from '@mui/material';
import React from 'react';

const MiniInfoCard = (props: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#3F5C78',
        color: '#fff',
        p: 1,
        paddingX: 4,
        borderRadius: '7px',
        width: props?.width,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      }}
    >
      {props.children}
    </Box>
  );
};

export default MiniInfoCard;
