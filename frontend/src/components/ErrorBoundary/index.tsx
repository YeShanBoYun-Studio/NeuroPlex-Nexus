import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { TranslationProps } from '../../types/translations';

interface Props extends Partial<TranslationProps> {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryBase extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getTranslation = (defaultText: string): string => {
    const { t, tk } = this.props;
    if (!t || !tk) return defaultText;
    return t(defaultText as any);
  };

  public render() {
    const { hasError, error } = this.state;
    const { children, tk } = this.props;

    if (!hasError) {
      return children;
    }

    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {this.getTranslation(tk?.common.error || 'Error')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {this.getTranslation(tk?.errors.serverError || 'Something went wrong')}
          </Typography>
          {error && (
            <Typography
              variant="body2"
              sx={{
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
                color: 'error.contrastText',
              }}
            >
              {error.message}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={this.handleReset}
              startIcon={<RefreshIcon />}
            >
              {this.getTranslation(tk?.common.refresh || 'Try Again')}
            </Button>
            <Button
              variant="contained"
              onClick={this.handleReload}
              color="primary"
            >
              {this.getTranslation(tk?.common.refresh || 'Reload Page')}
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }
}

export function ErrorBoundary(props: Omit<Props, keyof TranslationProps>) {
  const { t, tk } = useLanguage();
  return <ErrorBoundaryBase {...props} t={t} tk={tk} />;
}

export default ErrorBoundary;
