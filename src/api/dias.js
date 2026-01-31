import api from './axios';

export const diasAPI = {
    // Buscar todos os dias
    getAll: async () => {
        const response = await api.get('/dias');
        return response.data;
    },

    // Buscar um dia específico
    getById: async (id) => {
        const response = await api.get(`/dias/${id}`);
        return response.data;
    },

    // Criar ou carregar um dia
    createOrLoad: async (data) => {
        const response = await api.post('/dias', { data });
        return response.data;
    },

    // Atualizar horários do dia
    update: async (id, campo, valor) => {
        const response = await api.put(`/dias/${id}`, { [campo]: valor });
        return response.data;
    },

    // Deletar um dia
    delete: async (id) => {
        const response = await api.delete(`/dias/${id}`);
        return response.data;
    },
};