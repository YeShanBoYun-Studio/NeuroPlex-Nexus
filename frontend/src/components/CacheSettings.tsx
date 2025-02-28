import React, { useState } from 'react';
import { Box, Typography, Slider, Switch, Button } from '@mui/material';
import { apiService } from '../services/api';

interface CacheSettingsProps {
    workflowId?: string;
}

export const CacheSettings: React.FC<CacheSettingsProps> = ({ workflowId }) => {
    const [maxSizeMB, setMaxSizeMB] = useState(100);
    const [compressionEnabled, setCompressionEnabled] = useState(true);
    const [compressionThreshold, setCompressionThreshold] = useState(0.8);

    const handleSave = async () => {
        try {
            await apiService.updateCacheSettings({
                max_size_mb: maxSizeMB,
                compression_enabled: compressionEnabled,
                compression_threshold: compressionThreshold
            });
            // Show success message
        } catch (error) {
            // Handle error
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Cache Pool Settings
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                    Maximum Cache Size: {maxSizeMB} MB
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
                    Enable Compression
                </Typography>
                <Switch
                    checked={compressionEnabled}
                    onChange={(e) => setCompressionEnabled(e.target.checked)}
                />
            </Box>

            {compressionEnabled && (
                <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                        Compression Threshold: {Math.round(compressionThreshold * 100)}%
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
                Save Settings
            </Button>
        </Box>
    );
};
