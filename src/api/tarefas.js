import api from './axios';

export const tarefasAPI = {
    // Adicionar tarefa a um dia
    create: async (diaId, tarefa) => {
        const response = await api.post(`/tarefas/${diaId}`, tarefa);
        return response.data;
    },

    // Atualizar uma tarefa
    update: async (taskId, updates) => {
        const response = await api.put(`/tarefas/${taskId}`, updates);
        return response.data;
    },

    // Deletar uma tarefa
    delete: async (taskId) => {
        const response = await api.delete(`/tarefas/${taskId}`);
        return response.data;
    },
};