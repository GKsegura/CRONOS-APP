import api from './axios';

export const clientesAPI = {
    getAll: async () => {
        const response = await api.get('/clientes');
        return response.data;
    },

    getAtivos: async () => {
        const response = await api.get('/clientes/ativos');
        return response.data;
    },

    getNomes: async () => {
        const response = await api.get('/clientes/nomes');
        return response.data;
    },

    create: async (nome) => {
        const response = await api.post('/clientes', { nome });
        return response.data;
    },

    update: async (id, nome) => {
        const response = await api.put(`/clientes/${id}`, { nome });
        return response.data;
    },

    updateStatus: async (id, ativo) => {
        const response = await api.patch(`/clientes/${id}/status`, { ativo });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    },
};