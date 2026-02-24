import { styled, TableCell } from '@mui/material';

export const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#3F5C7826',
  color: '#000 !important',
  textAlign: 'left',
  cursor: 'pointer',
  padding: '8px',
  whiteSpace: 'nowrap',
  fontSize: '0.75rem',
}));
