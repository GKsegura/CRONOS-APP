import { diasAPI } from '@api';
import { diaComHorasPendentes, parseData } from '@utils/tempo';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useDias = () => {
    const [dias, setDias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('pendentes');
    const [ordenacao, setOrdenacao] = useState('recente');
    const [filtroMes, setFiltroMes] = useState('atual');

    useEffect(() => {
        carregarDias();
    }, [filtroMes]);

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(''), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    const carregarDias = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await diasAPI.getAll(filtroMes);
            setDias(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Erro ao carregar dados: ' + err.message);
            setDias([]);
        } finally {
            setLoading(false);
        }
    }, [filtroMes]);

    const criarOuCarregarDia = useCallback(async (data) => {
        try {
            setLoading(true);
            setError('');
            const dia = await diasAPI.createOrLoad(data);
            await carregarDias();
            return dia;
        } catch (err) {
            setError('Erro ao carregar dia: ' + err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [carregarDias]);

    const excluirDia = useCallback(async (diaId) => {
        if (!confirm('Tem certeza que deseja excluir este dia? Esta ação não pode ser desfeita.')) {
            return false;
        }
        try {
            setError('');
            await diasAPI.delete(diaId);
            await carregarDias();
            return true;
        } catch (err) {
            setError('Erro ao excluir dia: ' + err.message);
            return false;
        }
    }, [carregarDias]);

    const atualizarDiaLocal = useCallback((diaAtualizado) => {
        setDias((prev) => prev.map((d) => (d.id === diaAtualizado.id ? diaAtualizado : d)));
    }, []);

    // ─── Derivados ───────────────────────────────────────────────────────────

    const diasRecentes = useMemo(() => {
        const filtrados =
            filtroStatus === 'pendentes' ? dias.filter(diaComHorasPendentes)
                : filtroStatus === 'completos' ? dias.filter((d) => !diaComHorasPendentes(d))
                    : dias;

        return [...filtrados].sort((a, b) => {
            const diff = parseData(b.data) - parseData(a.data);
            return ordenacao === 'recente' ? diff : -diff;
        });
    }, [dias, filtroStatus, ordenacao]);

    const contadores = useMemo(() => ({
        todos: dias.length,
        pendentes: dias.filter(diaComHorasPendentes).length,
        completos: dias.filter((d) => !diaComHorasPendentes(d)).length,
    }), [dias]);

    return {
        dias,
        loading,
        error,
        setError,
        filtroStatus,
        setFiltroStatus,
        ordenacao,
        setOrdenacao,
        filtroMes,
        setFiltroMes,
        diasRecentes,
        contadores,
        carregarDias,
        criarOuCarregarDia,
        excluirDia,
        atualizarDiaLocal,
    };
};