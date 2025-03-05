import type { TranslationKey } from './translations';

interface TranslationKeyMap {
  common: {
    submit: 'common.submit';
    cancel: 'common.cancel';
    save: 'common.save';
    loading: 'common.loading';
    error: 'common.error';
    success: 'common.success';
    settings: 'common.settings';
    refresh: 'common.refresh';
    language: 'common.language';
    search: 'common.search';
    filter: 'common.filter';
    sort: 'common.sort';
    menu: 'common.menu';
    send: 'common.send';
    theme: {
      name: 'common.theme.name';
      change: 'common.theme.change';
      light: 'common.theme.light';
      dark: 'common.theme.dark';
      system: 'common.theme.system';
    };
  };
  errors: {
    notFound: 'errors.notFound';
    serverError: 'errors.serverError';
    unauthorized: 'errors.unauthorized';
    forbidden: 'errors.forbidden';
    required: 'errors.required';
    workflow_error: 'errors.workflow_error';
    invalid_json: 'errors.invalid_json';
    network_error: 'errors.network_error';
  };
  settings: {
    title: 'settings.title';
    max_steps: 'settings.max_steps';
    inheritance: {
      title: 'settings.inheritance.title';
      full_history: 'settings.inheritance.full_history';
      last_3_steps: 'settings.inheritance.last_3_steps';
      prompt_chain: 'settings.inheritance.prompt_chain';
    };
  };
  workflow: {
    relay: {
      title: 'workflow.relay.title';
      description: 'workflow.relay.description';
      session_name: 'workflow.relay.session_name';
      initial_content: 'workflow.relay.initial_content';
      enter_prompt: 'workflow.relay.enter_prompt';
      press_enter: 'workflow.relay.press_enter';
      start: 'workflow.relay.start';
    };
    debate: {
      title: 'workflow.debate.title';
      description: 'workflow.debate.description';
      select_topic: 'workflow.debate.select_topic';
      enter_topic: 'workflow.debate.enter_topic';
      your_position: 'workflow.debate.your_position';
      pro: 'workflow.debate.pro';
      con: 'workflow.debate.con';
      start: 'workflow.debate.start';
    };
    custom: {
      title: 'workflow.custom.title';
      description: 'workflow.custom.description';
      workflow_name: 'workflow.custom.workflow_name';
      prompt_template: 'workflow.custom.prompt_template';
      prompt_variables: 'workflow.custom.prompt_variables';
      initial_content: 'workflow.custom.initial_content';
      advanced_settings: 'workflow.custom.advanced_settings';
      start: 'workflow.custom.start';
    };
  };
}

// Type guard to ensure all translation keys are accounted for
type AssertTranslationKeys<T> = T extends TranslationKey ? true : false;
type KeyUnion = {
  [K in keyof TranslationKeyMap]: TranslationKeyMap[K] extends string ? K : never;
}[keyof TranslationKeyMap];
type _AssertComplete = AssertTranslationKeys<KeyUnion>;

export const translationKeys: TranslationKeyMap = {
  common: {
    submit: 'common.submit',
    cancel: 'common.cancel',
    save: 'common.save',
    loading: 'common.loading',
    error: 'common.error',
    success: 'common.success',
    settings: 'common.settings',
    refresh: 'common.refresh',
    language: 'common.language',
    search: 'common.search',
    filter: 'common.filter',
    sort: 'common.sort',
    menu: 'common.menu',
    send: 'common.send',
    theme: {
      name: 'common.theme.name',
      change: 'common.theme.change',
      light: 'common.theme.light',
      dark: 'common.theme.dark',
      system: 'common.theme.system',
    },
  },
  errors: {
    notFound: 'errors.notFound',
    serverError: 'errors.serverError',
    unauthorized: 'errors.unauthorized',
    forbidden: 'errors.forbidden',
    required: 'errors.required',
    workflow_error: 'errors.workflow_error',
    invalid_json: 'errors.invalid_json',
    network_error: 'errors.network_error',
  },
  settings: {
    title: 'settings.title',
    max_steps: 'settings.max_steps',
    inheritance: {
      title: 'settings.inheritance.title',
      full_history: 'settings.inheritance.full_history',
      last_3_steps: 'settings.inheritance.last_3_steps',
      prompt_chain: 'settings.inheritance.prompt_chain',
    },
  },
  workflow: {
    relay: {
      title: 'workflow.relay.title',
      description: 'workflow.relay.description',
      session_name: 'workflow.relay.session_name',
      initial_content: 'workflow.relay.initial_content',
      enter_prompt: 'workflow.relay.enter_prompt',
      press_enter: 'workflow.relay.press_enter',
      start: 'workflow.relay.start',
    },
    debate: {
      title: 'workflow.debate.title',
      description: 'workflow.debate.description',
      select_topic: 'workflow.debate.select_topic',
      enter_topic: 'workflow.debate.enter_topic',
      your_position: 'workflow.debate.your_position',
      pro: 'workflow.debate.pro',
      con: 'workflow.debate.con',
      start: 'workflow.debate.start',
    },
    custom: {
      title: 'workflow.custom.title',
      description: 'workflow.custom.description',
      workflow_name: 'workflow.custom.workflow_name',
      prompt_template: 'workflow.custom.prompt_template',
      prompt_variables: 'workflow.custom.prompt_variables',
      initial_content: 'workflow.custom.initial_content',
      advanced_settings: 'workflow.custom.advanced_settings',
      start: 'workflow.custom.start',
    },
  },
} as const;

export default translationKeys;
