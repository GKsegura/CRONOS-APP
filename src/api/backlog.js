import api from './axios';

export const backlogAPI = {
    getAll: async () => {
        const response = await api.get('/backlog');
        return response.data;
    },

    create: async (item) => {
        const response = await api.post('/backlog', item);
        return response.data;
    },

    update: async (id, dados) => {
        const response = await api.put(`/backlog/${id}`, dados);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/backlog/${id}`);
        return response.data;
    },

    reordenar: async (ids) => {
        const response = await api.put('/backlog/reordenar', ids);
        return response.data;
    },

    converterParaDia: async (backlogId, diaId) => {
        const response = await api.post(`/backlog/${backlogId}/converter/${diaId}`);
        return response.data;
    },
};