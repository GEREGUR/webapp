import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { InventoryResponse } from './api.dto';

const QUERY_KEYS = {
  inventory: ['inventory'] as const,
};

export const useInventory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.inventory,
    queryFn: async (): Promise<InventoryResponse> => {
      const response = await api.get<InventoryResponse>('/inventory');
      return response.data;
    },
  });
};
