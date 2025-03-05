import React from 'react';
import { 
  Box, 
  TextField,
  Typography,
  IconButton,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { WorkspaceArea } from '../../components/WorkspaceArea';

export function CustomPage() {
  const { t, tk } = useLanguage();
  const [name, setName] = React.useState('');
  const [template, setTemplate] = React.useState('');
  const [variables, setVariables] = React.useState('');
  const [showVariables, setShowVariables] = React.useState(false);
  const [variablesError, setVariablesError] = React.useState<string | null>(null);

  const handleVariablesChange = (value: string) => {
    setVariables(value);
    if (!value) {
      setVariablesError(null);
      return;
    }
    try {
      JSON.parse(value);
      setVariablesError(null);
    } catch (error) {
      setVariablesError(t(tk.errors.invalid_json));
    }
  };

  const handleSend = React.useCallback(() => {
    if (!name.trim() || !template.trim()) return;
    if (variables && variablesError) return;

    const payload = {
      name,
      template,
      variables: variables ? JSON.parse(variables) : undefined,
    };

    // TODO: Implement custom workflow
    console.log('Starting custom workflow:', payload);
  }, [name, template, variables, variablesError]);

  const canSubmit = Boolean(
    name.trim() && 
    template.trim() && 
    !variablesError
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WorkspaceArea
        title={t(tk.workflow.custom.title)}
        description={t(tk.workflow.custom.description)}
        showSendButton
        onSend={canSubmit ? handleSend : undefined}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label={t(tk.workflow.custom.workflow_name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t(tk.workflow.custom.prompt_template)}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            required
          />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t(tk.workflow.custom.advanced_settings)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {t(tk.workflow.custom.prompt_variables)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowVariables(!showVariables)}
                  >
                    <CodeIcon />
                  </IconButton>
                </Box>
                
                <Collapse in={showVariables}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={variables}
                    onChange={(e) => handleVariablesChange(e.target.value)}
                    error={!!variablesError}
                    helperText={variablesError}
                    placeholder="{}"
                  />
                </Collapse>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </WorkspaceArea>
    </Box>
  );
}

export default CustomPage;
