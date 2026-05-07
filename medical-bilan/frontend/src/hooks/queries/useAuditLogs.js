import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export const useAuditLogs = ({ action, limit = 50, offset = 0 } = {}) =>
  useQuery({
    queryKey: ['audit-logs', { action, limit, offset }],
    queryFn: async () => {
      const params = { limit, offset };
      if (action) params.action = action;
      const { data } = await api.get('/audit-logs', { params });
      return data;
    },
  });
