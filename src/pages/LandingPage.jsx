import { categoriasAPI, clientesAPI, diasAPI, exportAPI, tarefasAPI } from '@api';
import { ErrorAlert, Header } from '@components';
import { useDias } from '@hooks/useDias';
import { calcularMinutosFaltantes } from '@utils/tempo';
import { DetalhesView, HomeView } from '@views';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './LandingPage.css';

const LandingPage = () => {
    const [view, setView] = useState('home');
    const [selectedDia, setSelectedDia] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [exporting, setExporting] = useState(false);

    const {
        dias, loading, error, setError,
        filtroStatus, setFiltroStatus,
        ordenacao, setOrdenacao,
        filtroMes, setFiltroMes,
        diasRecentes, contadores,
        criarOuCarregarDia, excluirDia, atualizarDiaLocal,
    } = useDias();

    useEffect(() => {
        clientesAPI.getNomes().then(setClientes).catch(console.error);
        categoriasAPI.getAll().then(setCategorias).catch(console.error);
    }, []);

    // ─── Navegação ───────────────────────────────────────────────────────────

    const handleVoltar = useCallback(() => {
        setView('home');
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

    // ─── Backlog ─────────────────────────────────────────────────────────────

    const handleTarefaConvertida = useCallback((novaTarefa) => {
        setSelectedDia((prev) => ({
            ...prev,
            tarefas: [...(prev.tarefas || []), novaTarefa],
        }));
    }, []);

    // ─── Atividade Padrão ─────────────────────────────────────────────────────

    const handleAdicionarTarefaPadrao = useCallback(async (dia) => {
        try {
            setError('');
            const minutosFaltantes = calcularMinutosFaltantes(dia);

            if (minutosFaltantes <= 0) {
                toast.info('Não há horas faltantes para este dia');
                return;
            }

            const temTarefaPadrao = dia.tarefas?.some(
                (t) => t.categoria === 'SUPORTE' && t.cliente === 'Nexum'
            );

            if (temTarefaPadrao) {
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
            toast.success(`Atividade padrão adicionada com ${minutosFaltantes} minutos`);
        } catch (err) {
            setError('Erro ao adicionar atividade padrão: ' + err.message);
            toast.error('Erro ao adicionar atividade padrão');
        }
    }, [atualizarDiaLocal]);

    // ─── Export ──────────────────────────────────────────────────────────────

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
            // alert('Planilha exportada com sucesso!');
            toast.success('Planilha exportada com sucesso!');

        } catch (err) {
            // setError('Erro ao exportar planilha: ' + err.message);
            toast.error('Erro ao exportar planilha: ' + err.message);
        } finally {
            setExporting(false);
        }
    }, [setError]);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="app-container">
            <Header view={view} onVoltar={handleVoltar} dia={selectedDia} />
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
                        onSelecionarDia={(dia) => { setSelectedDia(dia); setView('detalhes'); }}
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
            </main>
        </div>
    );
};

export default LandingPage;