import * as React from 'react';
// import NativeSelect from '@mui/material/NativeSelect';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const MySelect = ({ value, onChange, options, defaultValue, labelWhenDefault }) => {

  return (
    <FormControl size="small">

      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        autoWidth
        value={value}
        onChange={onChange}

        sx={{
          fontSize: '14px',
          fontWeight: value === defaultValue ? 400 : 800,
          textTransform: 'uppercase',
          color: '#6200EE',
          height: '20px',
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-select': {
            paddingLeft: 0,
            paddingRight: '30px !important',
          },
          '& svg': {
            height: '20px',
            color: '#6200EE',
          }
        }}
      >
        {options.map(option => {
          const isSelectedDefault = option.value === defaultValue && value === defaultValue;
          return (
            <MenuItem
              key={option.value}
              value={option.value}
              style={{
                display: isSelectedDefault ? 'none' : 'default',
                fontSize: '16px'
              }}
            >
              {isSelectedDefault ? labelWhenDefault : option.label}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>

  );
}

export default MySelect;





