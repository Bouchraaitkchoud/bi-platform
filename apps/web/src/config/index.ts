/**
 * Application Configuration
 */

export const config = {
  /**
   * Application Info
   */
  app: {
    name: 'BI Platform',
    version: '1.0.0',
    description: 'Business Intelligence Platform',
  },

  /**
   * API Configuration
   */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
  },

  /**
   * Authentication Configuration
   */
  auth: {
    tokenKey: 'auth_token',
    userKey: 'current_user',
    refreshEndpoint: '/auth/refresh',
  },

  /**
   * Feature Flags
   */
  features: {
    darkMode: true,
    notifications: true,
    socialLogin: false,
    twoFactor: false,
  },

  /**
   * UI Configuration
   */
  ui: {
    theme: 'light' as 'light' | 'dark',
    locale: 'en-US',
    pageSize: 20,
  },

  /**
   * Development Configuration
   */
  development: {
    debug: process.env.NODE_ENV === 'development',
    logApi: process.env.NODE_ENV === 'development',
  },

  /**
   * Third-party Services
   */
  services: {
    analytics: {
      enabled: process.env.NEXT_PUBLIC_GA_ENABLED === 'true',
      id: process.env.NEXT_PUBLIC_GA_ID,
    },
    sentry: {
      enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  },
};

export default config;
