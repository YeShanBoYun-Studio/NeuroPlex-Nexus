// Environment variables from Vite
const environment = {
  NODE_ENV: import.meta.env.MODE,
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
};

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      apiUrl: environment.API_URL,
      wsUrl: environment.WS_URL,
      isDevelopment: environment.NODE_ENV === 'development',
      isProduction: environment.NODE_ENV === 'production',
    };
  }

  get(): AppConfig {
    return this.config;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getWsUrl(): string {
    return this.config.wsUrl;
  }

  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  isProduction(): boolean {
    return this.config.isProduction;
  }
}

// Export singleton instance
export const configService = new ConfigService();
export type { ConfigService };
export default configService;
