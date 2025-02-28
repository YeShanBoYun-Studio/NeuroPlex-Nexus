import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RelayPage } from './pages/RelayPage';
import { DebatePage } from './pages/DebatePage';
import { CustomPage } from './pages/CustomPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Redirect root to relay mode */}
                    <Route index element={<Navigate to="/relay" replace />} />
                    
                    {/* Main routes */}
                    <Route path="/relay" element={<RelayPage />} />
                    <Route path="/debate" element={<DebatePage />} />
                    <Route path="/custom" element={<CustomPage />} />
                    
                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/relay" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
