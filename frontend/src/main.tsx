import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';

// Initialize any required services here if needed
// For example, setting up global error handlers, analytics, etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CssBaseline />
        <App />
    </React.StrictMode>
);
