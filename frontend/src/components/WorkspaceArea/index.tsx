import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

interface WorkspaceAreaProps {
  title?: string;
  description?: string;
  showSendButton?: boolean;
  onSend?: () => void;
  children?: React.ReactNode;
}

export function WorkspaceArea({ 
  title,
  description,
  showSendButton = false,
  onSend,
  children,
}: WorkspaceAreaProps) {
  const { t, tk } = useLanguage();

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={1}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          {title && (
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {description}
            </Typography>
          )}
          {children}
        </Box>
        {showSendButton && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onSend}
              endIcon={<SendIcon />}
              disabled={!onSend}
            >
              {t(tk.common.send)}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default WorkspaceArea;
