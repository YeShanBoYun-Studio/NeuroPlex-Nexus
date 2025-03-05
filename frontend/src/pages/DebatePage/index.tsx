import React from 'react';
import { 
  Box, 
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { WorkspaceArea } from '../../components/WorkspaceArea';

export function DebatePage() {
  const { t, tk } = useLanguage();
  const [topic, setTopic] = React.useState('');
  const [position, setPosition] = React.useState<'pro' | 'con' | null>(null);

  const handleSend = React.useCallback(() => {
    if (!topic.trim() || !position) return;
    // TODO: Implement debate workflow
    console.log('Starting debate:', { topic, position });
  }, [topic, position]);

  const canSubmit = Boolean(topic.trim() && position);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WorkspaceArea
        title={t(tk.workflow.debate.title)}
        description={t(tk.workflow.debate.description)}
        showSendButton
        onSend={canSubmit ? handleSend : undefined}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label={t(tk.workflow.debate.select_topic)}
            placeholder={t(tk.workflow.debate.enter_topic)}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t(tk.workflow.debate.your_position)}
            </Typography>
            <ToggleButtonGroup
              value={position}
              exclusive
              onChange={(_, value) => setPosition(value)}
              aria-label={t(tk.workflow.debate.your_position)}
            >
              <ToggleButton value="pro">
                {t(tk.workflow.debate.pro)}
              </ToggleButton>
              <ToggleButton value="con">
                {t(tk.workflow.debate.con)}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </WorkspaceArea>
    </Box>
  );
}

export default DebatePage;
