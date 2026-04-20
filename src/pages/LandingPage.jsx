import { categoriasAPI, clientesAPI, diasAPI, exportAPI, tarefasAPI } from '@api';
import { ErrorAlert, Header } from '@components';
import { useDias } from '@hooks/useDias';
import { calcularMinutosFaltantes, temTarefaPadrao } from '@utils';
import { DetalhesView, HomeView, SearchTasksView } from '@views';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './LandingPage.css';

const montarPayloadTarefa = (tarefa, apontado) => ({
    descricao: tarefa.descricao?.trim().toUpperCase() || '',
    categoria: tarefa.categoria || null,
    cliente: tarefa.cliente || '',
    duracaoMin: parseInt(tarefa.duracaoMin),
    obs: tarefa.obs || '',
    apontado,
});

const LandingPage = () => {
    const [view, setView] = useState('home');
    const [selectedDia, setSelectedDia] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [updatingTaskIdSearch, setUpdatingTaskIdSearch] = useState(null);

    const {
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
        criarOuCarregarDia,
        excluirDia,
        atualizarDiaLocal,
    } = useDias();

    useEffect(() => {
        clientesAPI.getNomes().then(setClientes).catch(console.error);
        categoriasAPI.getAll().then(setCategorias).catch(console.error);
    }, []);

    const handleVoltar = useCallback(() => {
        setView('home');
        setSelectedDia(null);
        setError('');
    }, [setError]);

    const handleGoToSearch = useCallback(() => {
        setView('search');
        setSelectedDia(null);
        setError('');
    }, [setError]);

    const handleCriarOuCarregarDia = useCallback(async (data) => {
        const dia = await criarOuCarregarDia(data);
        if (dia) {
            setSelectedDia(dia);
            setView('detalhes');
        }
    }, [criarOuCarregarDia]);

    const handleExcluirDia = useCallback(async (diaId) => {
        const excluido = await excluirDia(diaId);
        if (excluido && selectedDia?.id === diaId) {
            setSelectedDia(null);
            setView('home');
        }
    }, [excluirDia, selectedDia?.id]);

    const handleTarefaConvertida = useCallback((novaTarefa) => {
        setSelectedDia((prev) => ({
            ...prev,
            tarefas: [...(prev?.tarefas || []), novaTarefa],
        }));
    }, []);

    const handleAdicionarTarefaPadrao = useCallback(async (dia) => {
        try {
            setError('');
            const minutosFaltantes = calcularMinutosFaltantes(dia);

            if (minutosFaltantes <= 0) {
                toast.info('Não há horas faltantes para este dia');
                return;
            }

            const tarefaPadrao = temTarefaPadrao(dia);

            if (tarefaPadrao) {
                toast.warning('Já existe uma atividade padrão para este dia');
                return;
            }

            const tarefa = {
                descricao: 'ACOMPANHAMENTO E GESTÃO DE CHAMADOS COMO N1, INCLUINDO ANÁLISE DE E-MAILS E WHATSAPP DO SUPORTE, APOIO AO TIME, IDENTIFICAÇÃO DE DIFICULDADES, ORIENTAÇÕES E REALOCAÇÃO DE CHAMADOS.',
                categoria: 'SUPORTE',
                cliente: 'Nexum',
                duracaoMin: minutosFaltantes,
                obs: '',
                apontado: false,
            };

            await tarefasAPI.create(dia.id, tarefa);
            const diaAtualizado = await diasAPI.getById(dia.id);

            atualizarDiaLocal(diaAtualizado);

            if (selectedDia?.id === dia.id) {
                setSelectedDia(diaAtualizado);
            }

            toast.success(`Atividade padrão adicionada com ${minutosFaltantes} minutos`);
        } catch (err) {
            setError('Erro ao adicionar atividade padrão: ' + err.message);
            toast.error('Erro ao adicionar atividade padrão');
            console.error(err);
        }
    }, [atualizarDiaLocal, selectedDia, setError]);

    const exportarExcel = useCallback(async (mes, ano) => {
        try {
            setExporting(true);
            setError('');

            const blob = await exportAPI.excel(mes, ano);
            const url = window.URL.createObjectURL(blob);

            const link = Object.assign(document.createElement('a'), {
                href: url,
                download: `Apontamentos_${mes.toString().padStart(2, '0')}_${ano}.xlsx`,
            });

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Planilha exportada com sucesso!');
        } catch (err) {
            toast.error('Erro ao exportar planilha: ' + err.message);
        } finally {
            setExporting(false);
        }
    }, [setError]);

    const onToggleApontadoSearch = useCallback(async (taskId, novoValor) => {
        try {
            setUpdatingTaskIdSearch(taskId);
            setError('');

            const diaDaTarefa = dias.find((dia) =>
                dia.tarefas?.some((tarefa) => tarefa.id === taskId)
            );

            if (!diaDaTarefa) {
                throw new Error('Erro ao localizar o dia da tarefa');
            }

            const tarefaAtual = diaDaTarefa.tarefas.find((tarefa) => tarefa.id === taskId);

            if (!tarefaAtual) {
                throw new Error('Tarefa não encontrada');
            }

            await tarefasAPI.update(taskId, montarPayloadTarefa(tarefaAtual, novoValor));

            const diaAtualizado = await diasAPI.getById(diaDaTarefa.id);
            atualizarDiaLocal(diaAtualizado);

            if (selectedDia?.id === diaDaTarefa.id) {
                setSelectedDia(diaAtualizado);
            }

            toast.success(
                novoValor
                    ? 'Tarefa marcada como apontada!'
                    : 'Tarefa desmarcada como apontada!'
            );
        } catch (err) {
            setError('Erro ao atualizar status: ' + err.message);
            toast.error('Erro ao atualizar status da tarefa');
            console.error(err);
        } finally {
            setUpdatingTaskIdSearch(null);
        }
    }, [dias, atualizarDiaLocal, selectedDia, setError]);

    return (
        <div className="app-container">
            <Header
                view={view}
                onVoltar={handleVoltar}
                onGoToSearch={handleGoToSearch}
                dia={selectedDia}
            />

            <ErrorAlert error={error} onClose={() => setError('')} />

            <main className="main-content">
                {view === 'home' && (
                    <HomeView
                        dias={dias}
                        loading={loading}
                        diasRecentes={diasRecentes}
                        contadores={contadores}
                        filtroStatus={filtroStatus}
                        setFiltroStatus={setFiltroStatus}
                        ordenacao={ordenacao}
                        setOrdenacao={setOrdenacao}
                        onSelecionarDia={(dia) => {
                            setSelectedDia(dia);
                            setView('detalhes');
                        }}
                        onCriarOuCarregarDia={handleCriarOuCarregarDia}
                        onExportar={exportarExcel}
                        exporting={exporting}
                        onExcluirDia={handleExcluirDia}
                        onAdicionarTarefaPadrao={handleAdicionarTarefaPadrao}
                        filtroMes={filtroMes}
                        setFiltroMes={setFiltroMes}
                    />
                )}

                {view === 'detalhes' && selectedDia && (
                    <DetalhesView
                        selectedDia={selectedDia}
                        setSelectedDia={setSelectedDia}
                        atualizarDiaLocal={atualizarDiaLocal}
                        setError={setError}
                        clientes={clientes}
                        categorias={categorias}
                        onTarefaConvertida={handleTarefaConvertida}
                        onAdicionarTarefaPadrao={handleAdicionarTarefaPadrao}
                    />
                )}

                {view === 'search' && (
                    <SearchTasksView
                        dias={dias}
                        onToggleApontado={onToggleApontadoSearch}
                        updatingTaskId={updatingTaskIdSearch}
                    />
                )}
            </main>
        </div>
    );
};

export default LandingPage;