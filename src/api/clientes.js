import api from './axios';

export const clientesAPI = {
    // Buscar nomes de clientes
    getNomes: async () => {
        const response = await api.get('/clientes/nomes');
        return response.data;
    },
};