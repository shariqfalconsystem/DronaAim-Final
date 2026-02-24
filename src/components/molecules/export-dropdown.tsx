import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Popper,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
  Grow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TiExport } from 'react-icons/ti';
import { KeyboardArrowDown } from '@mui/icons-material';

const FilterButton: any = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  borderRadius: '4px',
  height: '32px',
  padding: '0 12px',
  cursor: 'pointer',
  backgroundColor: '#3F5C78',
  color: 'white',
  transition: 'all 0.2s ease',
  minWidth: '80px',
  justifyContent: 'center',
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgba(7, 40, 74, 1)',
  },
  '&.disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#6c757d',
  },
}));

const StyledPopper: any = styled(Popper)(({ theme }) => ({
  zIndex: 9999,
  '& .MuiPaper-root': {
    borderRadius: '4px',
    minWidth: '140px',
    maxWidth: '200px',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
}));

const StyledMenuItem: any = styled(MenuItem)(({ theme }) => ({
  fontSize: '14px',
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  minHeight: '40px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    '& .MuiTypography-root': {
      color: '#000',
    },
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const FileIcon: any = styled(Box)(({ theme }) => ({
  width: 25,
  height: 20,
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '10px',
  marginRight: 12,
  flexShrink: 0,
}));

const ArrowIcon: any = styled(KeyboardArrowDown)<{ open: boolean }>(({ theme, open }) => ({
  marginLeft: '6px',
  fontSize: '18px',
  transition: 'transform 0.2s ease',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  color: 'white',
}));

const ExportDropdown = ({ handleExport, isDownloading = false, isEventExport = false }: any) => {
  const [open, setOpen] = useState(false);
  const anchorRef: any = useRef(null);

  const handleToggle = () => {
    if (!isDownloading) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleExportOption = (fileType: any) => {
    handleExport(fileType);
    setOpen(false);
  };

  const handleListKeyDown = (event: any) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  // Return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const exportOptions = isEventExport
    ? [
        { type: 'csv', label: 'CSV', color: '#28a745' },
        { type: 'pdf', label: 'PDF', color: '#334fdcff' },
      ]
    : [
        { type: 'csv', label: 'CSV', color: '#28a745' },
        { type: 'xlsx', label: 'XLSX', color: '#dc3545' },
        { type: 'pdf', label: 'PDF', color: '#334fdcff' },
      ];

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <FilterButton
        ref={anchorRef}
        onClick={handleToggle}
        className={isDownloading ? 'disabled' : ''}
        aria-controls={open ? 'export-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
      >
        <TiExport size={18} style={{ color: 'white', marginRight: '6px' }} />
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Export
        </Typography>
        <ArrowIcon open={open} />
      </FilterButton>

      <StyledPopper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal={false}
        modifiers={[
          {
            name: 'flip',
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: 'document',
              padding: 8,
            },
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              rootBoundary: 'document',
              padding: 8,
            },
          },
          {
            name: 'offset',
            enabled: true,
            options: {
              offset: [0, 8],
            },
          },
        ]}
        style={{
          zIndex: 9999,
        }}
      >
        {({ TransitionProps }: any) => (
          <Grow
            {...TransitionProps}
            timeout={150}
            style={{
              transformOrigin: 'top left',
            }}
          >
            <Paper elevation={8}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="export-menu"
                  aria-labelledby="export-button"
                  onKeyDown={handleListKeyDown}
                  sx={{
                    padding: '4px 0',
                    backgroundColor: '#3F5C78',
                  }}
                >
                  {exportOptions.map((option) => (
                    <StyledMenuItem key={option.type} onClick={() => handleExportOption(option.type)}>
                      <ListItemIcon sx={{ minWidth: 'auto' }}>
                        <FileIcon sx={{ backgroundColor: option.color }}>{option.label}</FileIcon>
                      </ListItemIcon>
                      <ListItemText
                        primary={option.label}
                        primaryTypographyProps={{
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#fff',
                        }}
                      />
                    </StyledMenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </StyledPopper>
    </Box>
  );
};

export default ExportDropdown;
