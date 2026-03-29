import api from './axios';

export const diasAPI = {
    // Buscar todos os dias do mês atual
    getAll: async () => {
        const response = await api.get('/dias');

        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Janeiro = 1, Fevereiro = 2, etc
        const currentYear = now.getFullYear();

        // Filtrar apenas dias do mês atual
        const diasDoMesAtual = response.data.filter(dia => {
            // Assumindo que dia.data vem no formato "dd/MM/yyyy"
            const [day, month, year] = dia.data.split('/').map(Number);

            return month === currentMonth && year === currentYear;
        });

        return diasDoMesAtual;
    },

    getMesAtual: async () => {
        const response = await api.get('/dias');

        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Janeiro = 1, Fevereiro = 2, etc
        const currentYear = now.getFullYear();
        // Filtrar apenas dias do mês atual
        const diasDoMesAtual = response.data.filter(dia => {
            // Assumindo que dia.data vem no formato "dd/MM/yyyy"
            const [day, month, year] = dia.data.split('/').map(Number);

            return month === currentMonth && year === currentYear;
        });

        return diasDoMesAtual;
    },

    getMesAtualEAnterior: async () => {
        const response = await api.get('/dias');

        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Janeiro = 1, Fevereiro = 2, etc
        const currentYear = now.getFullYear();
        // Filtrar dias do mês atual e do mês anterior
        const diasDoMesAtualEAnterior = response.data.filter(dia => {
            // Assumindo que dia.data vem no formato "dd/MM/yyyy"
            const [day, month, year] = dia.data.split('/').map(Number);

            const isCurrentMonth = month === currentMonth && year === currentYear;
            const isPreviousMonth = month === (currentMonth === 1 ? 12 : currentMonth - 1) && year === (currentMonth === 1 ? currentYear - 1 : currentYear);

            return isCurrentMonth || isPreviousMonth;
        });

        return diasDoMesAtualEAnterior;
    },

    // Buscar todos os dias sem filtro (caso precise no futuro)
    getAllUnfiltered: async () => {
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