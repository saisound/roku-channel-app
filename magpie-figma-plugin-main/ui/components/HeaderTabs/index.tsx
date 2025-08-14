import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const PluginTabs = ({ value, onChange }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#374747' }}>
      <Tabs
        value={value}
        onChange={onChange}
        textColor="inherit"
        // variant="fullWidth"
        sx={{
          minHeight: '40px',
          height: '40px',
          '& .MuiButtonBase-root': {
            minHeight: '40px',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'white'
          }
        }}
      >
        <Tab label="Global" />
        <Tab label="The Roku Channel" />
      </Tabs>
    </AppBar>


  );
}

export default PluginTabs;