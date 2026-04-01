import api from './axios';

const now = () => new Date();

const filtrarPorMes = (dias, filtro) => {
    const data = now();
    const mesAtual = data.getMonth() + 1;
    const anoAtual = data.getFullYear();
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

    return dias.filter(dia => {
        // const [year, month] = dia.data.split('-').map(Number); // Se a data estiver no formato 'YYYY-MM-DD'
        const [day, month, year] = dia.data.split('/').map(Number); // Se a data estiver no formato 'DD/MM/YYYY'
        const isMesAtual = month === mesAtual && year === anoAtual;
        const isMesAnterior = month === mesAnterior && year === anoAnterior;

        if (filtro === 'atual') return isMesAtual;
        if (filtro === 'anterior') return isMesAnterior;
        if (filtro === 'ambos') return isMesAtual || isMesAnterior;
        return true;
    });
};

export const diasAPI = {
    getAll: async (filtroMes = 'atual') => {
        const response = await api.get('/dias');
        return filtrarPorMes(response.data, filtroMes);
    },

    getAllUnfiltered: async () => {
        const response = await api.get('/dias');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/dias/${id}`);
        return response.data;
    },

    createOrLoad: async (data) => {
        const response = await api.post('/dias', { data });
        return response.data;
    },

    update: async (id, campo, valor) => {
        const response = await api.put(`/dias/${id}`, { [campo]: valor });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/dias/${id}`);
        return response.data;
    },
};