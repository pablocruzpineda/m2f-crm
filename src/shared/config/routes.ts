/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
  CONTACT_DETAIL: '/contacts/:id',
  PIPELINES: '/pipelines',
  PIPELINE_DETAIL: '/pipelines/:id',
  CHAT: '/chat',
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_THEME: '/settings/theme',
  SETTINGS_MEMBERS: '/settings/members',
  SETTINGS_CUSTOM_FIELDS: '/settings/custom-fields',
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
} as const;
