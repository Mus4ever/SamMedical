import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';

export const useChangePassword = () =>
  useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
      return data;
    },
  });
