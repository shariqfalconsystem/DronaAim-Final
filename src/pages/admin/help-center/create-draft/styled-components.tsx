// StyledComponents.tsx
import { Paper, TextField, Button, Box, styled } from '@mui/material';

export const ContentPaper = styled(Paper)({
  width: '100%',
  height: '100%',
  borderRadius: 8,
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
});

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    padding: '8px 0',
    fontSize: '24px',
    fontWeight: '450',
  },
});

export const SubtitleTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    padding: '8px 0',
    fontSize: '24px',
    fontWeight: '450',
  },
});

export const ActionButton = styled(Button)({
  borderRadius: '20px',
  padding: '6px 16px',
  textTransform: 'none',
});

export const PublishButton = styled(ActionButton)({
  backgroundColor: '#83D860',
  color: 'white',
  '&:hover': { backgroundColor: '#7CB342' },
});

export const SaveButton = styled(ActionButton)({
  backgroundColor: '#003350',
  color: 'white',
  marginRight: '10px',
  '&:hover': { backgroundColor: '#1976D2' },
});

export const EditorContainer = styled(Box)({
  border: '1px solid #eee',
  borderRadius: 4,
  padding: '8px',
  marginTop: '16px',
  marginBottom: '16px',
  minHeight: '300px',
  position: 'relative',
  '& .ce-block__content': { maxWidth: '100%', margin: '0' },
  '& .ce-toolbar__content': { maxWidth: '100%', margin: '0' },
});
