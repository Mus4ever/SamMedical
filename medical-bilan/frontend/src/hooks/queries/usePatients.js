import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const KEY = 'patients';

export const usePatientsList = ({ search = '', limit = 50, offset = 0, active } = {}) =>
  useQuery({
    queryKey: [KEY, { search, limit, offset, active }],
    queryFn: async () => {
      const params = { limit, offset };
      if (search) params.search = search;
      if (active !== undefined) params.active = active;
      const { data } = await api.get('/patients', { params });
      return data;
    },
  });

export const usePatient = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/patients', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/patients/${id}`, payload);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, vars.id] });
    },
  });
};

export const useResetPatientPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newPassword }) => {
      const { data } = await api.post(`/patients/${id}/reset-password`,
        newPassword ? { newPassword } : {});
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
