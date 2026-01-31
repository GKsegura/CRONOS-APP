import api from './axios';

export const exportAPI = {
    // Exportar Excel
    excel: async (mes, ano) => {
        const response = await api.get(`/export/excel/${mes}/${ano}`, {
            responseType: 'blob', // Importante para download de arquivos
        });
        return response.data;
    },
};