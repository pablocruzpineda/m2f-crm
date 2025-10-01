import { useMutation } from '@tanstack/react-query';
import { testMind2FlowConnection } from '../api/chatSettingsApi';

interface TestConnectionInput {
  apiEndpoint: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Hook to test Mind2Flow API connection
 */
export function useTestConnection() {
  return useMutation<
    { success: boolean; message: string },
    Error,
    TestConnectionInput
  >({
    mutationFn: async ({ apiEndpoint, apiKey, apiSecret }) => {
      return testMind2FlowConnection(apiEndpoint, apiKey, apiSecret);
    },
  });
}
