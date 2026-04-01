import { diasAPI, tarefasAPI } from '@api';
import { useCallback, useState } from 'react';

const emptyForm = () => ({
    descricao: '',
    categoria: '',
    cliente: '',
    duracao: '',
    obs: '',
    apontado: false,
});

const toPayload = (form) => ({
    descricao: form.descricao.trim().toUpperCase(),
    categoria: form.categoria || null,
    cliente: form.cliente || '',
    duracaoMin: parseInt(form.duracao),
    obs: form.obs || '',
    apontado: form.apontado,
});

export const useTaskForm = ({ selectedDia, setSelectedDia, atualizarDiaLocal, setError }) => {
    const [novaTaskForm, setNovaTaskForm] = useState(emptyForm());
    const [editForm, setEditForm] = useState(emptyForm());
    const [editingTask, setEditingTask] = useState(null);
    const [savingTask, setSavingTask] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    // ─── Validação ───────────────────────────────────────────────────────────

    const validarTarefa = (form) => {
        if (!form.descricao?.trim()) {
            setError('Descrição é obrigatória');
            return false;
        }
        const duracao = parseInt(form.duracao);
        if (!form.duracao || isNaN(duracao) || duracao <= 0) {
            setError('Duração é obrigatória e deve ser maior que 0');
            return false;
        }
        return true;
    };

    // ─── Sincronização ───────────────────────────────────────────────────────

    const refreshDia = useCallback(async () => {
        const dia = await diasAPI.getById(selectedDia.id);
        setSelectedDia(dia);
        atualizarDiaLocal(dia);
    }, [selectedDia?.id, setSelectedDia, atualizarDiaLocal]);

    // ─── Operações CRUD ──────────────────────────────────────────────────────

    const adicionarTarefa = async () => {
        if (!selectedDia) { setError('Nenhum dia selecionado'); return; }
        if (!validarTarefa(novaTaskForm)) return;

        try {
            setSavingTask(true);
            setError('');
            await tarefasAPI.create(selectedDia.id, toPayload(novaTaskForm));
            await refreshDia();
            setNovaTaskForm(emptyForm());
        } catch (err) {
            setError('Erro ao adicionar tarefa: ' + err.message);
        } finally {
            setSavingTask(false);
        }
    };

    const atualizarTarefa = async (taskId) => {
        if (!validarTarefa(editForm)) return;

        try {
            setSavingTask(true);
            setError('');
            await tarefasAPI.update(taskId, toPayload(editForm));
            await refreshDia();
            cancelarEdicao();
        } catch (err) {
            setError('Erro ao atualizar tarefa: ' + err.message);
        } finally {
            setSavingTask(false);
        }
    };

    const removerTarefa = async (taskId) => {
        if (!confirm('Tem certeza que deseja remover esta tarefa?')) return;
        try {
            setError('');
            await tarefasAPI.delete(taskId);
            await refreshDia();
        } catch (err) {
            setError('Erro ao remover tarefa: ' + err.message);
        }
    };

    const handleToggleApontado = async (taskId, novoValor) => {
        try {
            setUpdatingTaskId(taskId);
            setError('');
            const tarefaAtual = selectedDia.tarefas.find((t) => t.id === taskId);
            await tarefasAPI.update(taskId, { ...toPayload({ ...tarefaAtual, duracao: tarefaAtual.duracaoMin }), apontado: novoValor });
            await refreshDia();
        } catch (err) {
            setError('Erro ao atualizar status: ' + err.message);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    // ─── Controle de edição ──────────────────────────────────────────────────

    const iniciarEdicao = useCallback((tarefa) => {
        setEditingTask(tarefa.id);
        setEditForm({
            descricao: tarefa.descricao || '',
            categoria: tarefa.categoria || '',
            cliente: tarefa.cliente || '',
            duracao: tarefa.duracaoMin?.toString() || '',
            obs: tarefa.obs || '',
            apontado: tarefa.apontado || false,
        });
        setError('');
    }, [setError]);

    const cancelarEdicao = useCallback(() => {
        setEditingTask(null);
        setEditForm(emptyForm());
        setError('');
    }, [setError]);

    return {
        novaTaskForm,
        setNovaTaskForm,
        editForm,
        setEditForm,
        editingTask,
        savingTask,
        updatingTaskId,
        adicionarTarefa,
        atualizarTarefa,
        removerTarefa,
        handleToggleApontado,
        iniciarEdicao,
        cancelarEdicao,
    };
};