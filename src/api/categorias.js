import api from './axios';

export const categoriasAPI = {
    // Buscar todas as categorias
    getAll: async () => {
        const response = await api.get('/categorias');
        return response.data;
    },
};