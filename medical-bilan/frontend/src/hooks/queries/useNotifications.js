import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export const useNotificationLogs = (bilanId) =>
  useQuery({
    queryKey: ['notifications', bilanId],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/logs/${bilanId}`);
      return data;
    },
    enabled: !!bilanId,
  });

export const useResendNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bilanId) => {
      const { data } = await api.post(`/notifications/resend/${bilanId}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
};
