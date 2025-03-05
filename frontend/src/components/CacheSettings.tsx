import React, { useState } from 'react';
import { Box, Typography, Slider, Switch, Button, Snackbar, Alert } from '@mui/material';
import { useTranslation } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

interface CacheSettingsProps {
    workflowId?: string;
}

export const CacheSettings: React.FC<CacheSettingsProps> = ({ workflowId }) => {
    const { t } = useTranslation();
    const [maxSizeMB, setMaxSizeMB] = useState(100);
    const [compressionEnabled, setCompressionEnabled] = useState(true);
    const [compressionThreshold, setCompressionThreshold] = useState(0.8);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleSave = async () => {
        try {
            await apiService.updateCacheSettings({
                max_size_mb: maxSizeMB,
                compression_enabled: compressionEnabled,
                compression_threshold: compressionThreshold
            });
            setShowSuccess(true);
        } catch (error) {
            setShowError(true);
        }
    };

    const handleCloseSnackbar = () => {
        setShowSuccess(false);
        setShowError(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {t('settings.cache.title')}
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                    {t('settings.cache.max_size')}: {maxSizeMB} MB
                </Typography>
                <Slider
                    value={maxSizeMB}
                    onChange={(e, value) => setMaxSizeMB(value as number)}
                    min={10}
                    max={1000}
                    step={10}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                    {t('settings.cache.compression')}
                </Typography>
                <Switch
                    checked={compressionEnabled}
                    onChange={(e) => setCompressionEnabled(e.target.checked)}
                />
            </Box>

            {compressionEnabled && (
                <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                        {t('settings.cache.threshold')}: {Math.round(compressionThreshold * 100)}%
                    </Typography>
                    <Slider
                        value={compressionThreshold}
                        onChange={(e, value) => setCompressionThreshold(value as number)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                    />
                </Box>
            )}

            <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={!workflowId}
            >
                {t('common.save')}
            </Button>

            <Snackbar 
                open={showSuccess} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
            >
                <Alert severity="success" onClose={handleCloseSnackbar}>
                    {t('settings.cache.save_success')}
                </Alert>
            </Snackbar>

            <Snackbar 
                open={showError} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
            >
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {t('errors.network_error')}
                </Alert>
            </Snackbar>
        </Box>
    );
};
