import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchInput = ({ placeholder = 'Search...', onChange, ...props }: any) => {
  return (
    <TextField
      variant="outlined"
      placeholder={placeholder}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="primary" />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default SearchInput;
