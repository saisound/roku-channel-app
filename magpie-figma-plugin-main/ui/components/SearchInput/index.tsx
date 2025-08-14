import * as React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const SearchInput = ({ value, onChange, clearSearch, searchInputRef }) => {

  return (
    <TextField
      hiddenLabel size='small' inputRef={searchInputRef}
      placeholder="Search" variant="outlined" fullWidth
      value={value}
      onChange={onChange}
      InputProps={{
        endAdornment: value !== "" ? (
          <InputAdornment position="start">
            <HighlightOffIcon
              sx={{
                padding: '4px', cursor: 'pointer', width: '1.25em', height: '1.25em',
                '&:hover': { color: 'rgba(0,0,0,.8)' }
              }}
              onClick={clearSearch} />
          </InputAdornment>
        ) : null,
      }}
      sx={{
        fontSize: '14px',
        lineHeight: '22px',
        '& .MuiInputBase-root': {
          paddingRight: '0px'
        }
      }}
    />
  );
}

export default SearchInput;