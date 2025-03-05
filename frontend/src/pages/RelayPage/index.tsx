import React from 'react';
import { Box, TextField } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { WorkspaceArea } from '../../components/WorkspaceArea';

export function RelayPage() {
  const { t, tk } = useLanguage();
  const [prompt, setPrompt] = React.useState('');

  const handleSend = React.useCallback(() => {
    if (!prompt.trim()) return;
    // TODO: Implement relay workflow
    console.log('Sending prompt:', prompt);
  }, [prompt]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WorkspaceArea
        title={t(tk.workflow.relay.title)}
        description={t(tk.workflow.relay.description)}
        showSendButton
        onSend={prompt.trim() ? handleSend : undefined}
      >
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t(tk.workflow.relay.enter_prompt)}
            helperText={t(tk.workflow.relay.press_enter)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </Box>
      </WorkspaceArea>
    </Box>
  );
}

export default RelayPage;
