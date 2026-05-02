import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const KEY = 'bilans';

export const useAllBilans = ({ status, search, limit = 50, offset = 0 } = {}) =>
  useQuery({
    queryKey: [KEY, 'all', { status, search, limit, offset }],
    queryFn: async () => {
      const params = { limit, offset };
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await api.get('/bilans', { params });
      return data;
    },
  });

export const useMyBilans = () =>
  useQuery({
    queryKey: [KEY, 'my'],
    queryFn: async () => {
      const { data } = await api.get('/bilans/my');
      return data;
    },
  });

export const useUploadBilan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, title, description, file }) => {
      const fd = new FormData();
      fd.append('patientId', patientId);
      fd.append('title', title);
      if (description) fd.append('description', description);
      fd.append('bilanFile', file);
      const { data } = await api.post('/bilans', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['patients', vars.patientId] });
    },
  });
};

export const useMarkBilanReady = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/bilans/${id}/ready`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const useDeleteBilan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/bilans/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
};

export const useDownloadBilan = () =>
  useMutation({
    mutationFn: async (id) => {
      const { data } = await api.get(`/bilans/${id}/download`);
      return data; // { url, fileName }
    },
  });
