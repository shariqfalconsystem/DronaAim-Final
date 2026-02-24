import React from 'react';
import { Menu, MenuItem, IconButton, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PopoverMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  options: string[];
  handleMenuItemClick: (option: string) => void;
}

const PopoverMenu: React.FC<PopoverMenuProps> = ({ anchorEl, open, handleClose, options, handleMenuItemClick }) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
      {options.map((option, index) => (
        <MenuItem key={index} onClick={() => handleMenuItemClick(option)}>
          {option}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default PopoverMenu;
