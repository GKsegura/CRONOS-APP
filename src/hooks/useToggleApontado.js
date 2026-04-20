import { diasAPI, tarefasAPI } from '@api';
import { useCallback, useState } from 'react';

const toPayloadToggle = (tarefa, novoValor) => ({
    descricao: (tarefa.descricao || '').trim().toUpperCase(),
    categoria: tarefa.categoria || null,
    cliente: tarefa.cliente || '',
    duracaoMin: parseInt(tarefa.duracaoMin, 10),
    obs: tarefa.obs || '',
    apontado: novoValor,
});

export const useToggleApontado = ({
    selectedDia,
    setSelectedDia,
    atualizarDiaLocal,
    setError,
    dias = [],
}) => {
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const refreshDiaById = useCallback(async (diaId) => {
        const diaAtualizado = await diasAPI.getById(diaId);

        atualizarDiaLocal(diaAtualizado);

        if (selectedDia?.id === diaId && setSelectedDia) {
            setSelectedDia(diaAtualizado);
        }

        return diaAtualizado;
    }, [selectedDia?.id, setSelectedDia, atualizarDiaLocal]);

    const encontrarDiaDaTarefa = useCallback((taskId) => {
        if (selectedDia?.tarefas?.some((tarefa) => tarefa.id === taskId)) {
            return selectedDia;
        }

        return dias.find((dia) =>
            dia.tarefas?.some((tarefa) => tarefa.id === taskId)
        );
    }, [selectedDia, dias]);

    const handleToggleApontado = useCallback(async (taskId, novoValor) => {
        try {
            setUpdatingTaskId(taskId);
            setError('');

            const diaDaTarefa = encontrarDiaDaTarefa(taskId);

            if (!diaDaTarefa) {
                throw new Error('Não foi possível localizar o dia da tarefa.');
            }

            const tarefaAtual = diaDaTarefa.tarefas.find((tarefa) => tarefa.id === taskId);

            if (!tarefaAtual) {
                throw new Error('Não foi possível localizar a tarefa.');
            }

            await tarefasAPI.update(
                taskId,
                toPayloadToggle(tarefaAtual, novoValor)
            );

            await refreshDiaById(diaDaTarefa.id);
        } catch (err) {
            setError('Erro ao atualizar status: ' + err.message);
        } finally {
            setUpdatingTaskId(null);
        }
    }, [setError, encontrarDiaDaTarefa, refreshDiaById]);

    return {
        updatingTaskId,
        handleToggleApontado,
    };
};