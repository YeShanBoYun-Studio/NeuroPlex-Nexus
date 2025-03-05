import React from 'react';
import { CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import type { NavItem } from './components/Layout';
import RelayPage from './pages/RelayPage';
import DebatePage from './pages/DebatePage';
import CustomPage from './pages/CustomPage';
import { Message as MessageIcon, Forum as ForumIcon, Settings as SettingsIcon } from '@mui/icons-material';

// Navigation structure that will be used in Layout
const navigationItems: NavItem[] = [
  {
    path: '/relay',
    label: 'workflow.relay.title',
    icon: <MessageIcon />,
  },
  {
    path: '/debate',
    label: 'workflow.debate.title',
    icon: <ForumIcon />,
  },
  {
    path: '/custom',
    label: 'workflow.custom.title',
    icon: <SettingsIcon />,
  },
];

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout navigationItems={navigationItems} />}>
          <Route index element={<RelayPage />} />
          <Route path="relay" element={<RelayPage />} />
          <Route path="debate" element={<DebatePage />} />
          <Route path="custom" element={<CustomPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
