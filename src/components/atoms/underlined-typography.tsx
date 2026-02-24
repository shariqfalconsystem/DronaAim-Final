export const underlinedTypographyStyle = {
  position: 'relative',
  marginBottom: '16px',
  '&::after': {
    width: '46px',
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-4px',
    height: '2px',
    backgroundColor: '#000',
  },
};
