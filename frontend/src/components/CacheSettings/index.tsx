import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { translationKeys as tk } from '../../types/translation-keys';
import { configService } from '../../services/config';
import type { CacheSettings as CacheSettingsType } from '../../services/config';

export interface CacheSettingsProps {
  onSave?: () => void;
}

export const CacheSettings: React.FC<CacheSettingsProps> = ({ onSave }) => {
  const { t } = useLanguage();
  const initialSettings = configService.getCacheSettings();
  const [maxSize, setMaxSize] = React.useState<number>(initialSettings.maxSize);
  const [compression, setCompression] = React.useState<boolean>(
    initialSettings.compression
  );
  const [threshold, setThreshold] = React.useState<number>(
    initialSettings.threshold
  );
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

  const handleSave = () => {
    const settings: CacheSettingsType = {
      maxSize,
      compression,
      threshold,
    };

    // Save settings using config service
    configService.setCacheSettings(settings);

    // Show success message
    setShowSuccess(true);

    // Call onSave callback if provided
    onSave?.();
  };

  const handleSnackbarClose = () => {
    setShowSuccess(false);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t(tk.settings.cache.title)}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={t(tk.settings.cache.max_size)}
            type="number"
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value))}
            sx={{ mb: 2 }}
            inputProps={{
              min: 1,
              max: 1000,
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={compression}
                onChange={(e) => setCompression(e.target.checked)}
              />
            }
            label={t(tk.settings.cache.compression)}
            sx={{ mb: 2 }}
          />

          {compression && (
            <TextField
              fullWidth
              label={t(tk.settings.cache.threshold)}
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{
                min: 0,
                max: 10000,
              }}
            />
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave}>
              {t(tk.common.save)}
            </Button>
          </Box>
        </Box>
      </CardContent>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {t(tk.settings.cache.changes_saved)}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CacheSettings;
