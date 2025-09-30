/**
 * Environment configuration
 * All environment variables should be prefixed with VITE_
 */

const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    console.error('Available env vars:', Object.keys(import.meta.env));
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

export const env = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  app: {
    name: getOptionalEnvVar('VITE_APP_NAME', 'M2F CRM'),
    url: getOptionalEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
