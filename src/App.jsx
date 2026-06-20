import React from 'react';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/system';
import { Route, Routes } from 'react-router-dom';
import ElectionResults from './ElectionResults';

const theme = createTheme({
  palette: {
    primary: { main: '#000000' },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'],
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<ElectionResults />} />
        <Route path="/:year" element={<ElectionResults />} />
      </Routes>
      <footer style={{ background: '#131b2e', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#7c839b', margin: 0 }}>
          Unofficial election results visualizer · Data source:{' '}
          <a
            href="https://www.instagram.com/stonybrookusg/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#a9c2ff', textDecoration: 'none' }}
          >
            @stonybrookusg
          </a>
        </p>
      </footer>
    </ThemeProvider>
  );
}

export default App;
