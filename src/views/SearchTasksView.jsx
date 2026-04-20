import { formatarDuracao } from '@utils/tempo';
import { CheckCircle, Clock, Copy, Search, Tag, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import './SearchTasksView.css';

const SearchTasksView = ({
    dias = [],
    onToggleApontado,
    updatingTaskId,
}) => {
    const [buscaMain, setBuscaMain] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroData, setFiltroData] = useState('');
    const [filtroDia, setFiltroDia] = useState('');
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroAno, setFiltroAno] = useState('');
    const [filtroApontado, setFiltroApontado] = useState('');

    const extrairPartesData = (data) => {
        if (!data) {
            return { dataISO: '', dia: '', mes: '', ano: '' };
        }

        if (data.includes('-')) {
            const [ano, mes, dia] = data.split('-');
            return { dataISO: data, dia, mes, ano };
        }

        if (data.includes('/')) {
            const [dia, mes, ano] = data.split('/');
            return {
                dataISO: `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
                dia: dia.padStart(2, '0'),
                mes: mes.padStart(2, '0'),
                ano,
            };
        }

        return { dataISO: '', dia: '', mes: '', ano: '' };
    };

    const formatarDataBR = (data) => {
        if (!data) return '-';
        if (data.includes('/')) return data;

        if (data.includes('-')) {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        }

        return data;
    };

    const handleCopy = async (tarefa) => {
        try {
            const titulo = tarefa.descricao || 'Sem título';
            const cliente = tarefa.cliente || 'Sem cliente';
            const descricao = tarefa.obs || '';

            const texto = descricao
                ? `${titulo} - ${cliente} - ${descricao}`
                : `${titulo} - ${cliente}`;

            await navigator.clipboard.writeText(texto);
            toast.success('Copiado!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            toast.error('Erro ao copiar!');
        }
    };

    const handleToggleApontado = (tarefa) => {
        if (!onToggleApontado) return;
        if (updatingTaskId === tarefa.id) return;

        onToggleApontado(tarefa.id, !tarefa.apontado);
    };

    const tarefasGlobais = useMemo(() => {
        const todasTarefas = [];

        dias.forEach((dia) => {
            const partesData = extrairPartesData(dia.data);

            dia.tarefas?.forEach((tarefa) => {
                todasTarefas.push({
                    ...tarefa,
                    dataAlocada: dia.data,
                    dataISO: partesData.dataISO,
                    diaNumero: partesData.dia,
                    mesNumero: partesData.mes,
                    anoNumero: partesData.ano,
                    diaId: dia.id,
                });
            });
        });

        return todasTarefas;
    }, [dias]);

    const tarefasFiltradas = useMemo(() => {
        return tarefasGlobais.filter((tarefa) => {
            const descricaoMatch =
                !buscaMain ||
                tarefa.descricao?.toLowerCase().includes(buscaMain.toLowerCase()) ||
                tarefa.obs?.toLowerCase().includes(buscaMain.toLowerCase());

            const clienteMatch = !filtroCliente || tarefa.cliente === filtroCliente;
            const categoriaMatch = !filtroCategoria || tarefa.categoria === filtroCategoria;
            const dataMatch = !filtroData || tarefa.dataISO === filtroData;
            const diaMatch = !filtroDia || tarefa.diaNumero === filtroDia.padStart(2, '0');
            const mesMatch = !filtroMes || tarefa.mesNumero === filtroMes.padStart(2, '0');
            const anoMatch = !filtroAno || tarefa.anoNumero === filtroAno;

            const apontadoMatch =
                !filtroApontado ||
                (filtroApontado === 'apontado' && tarefa.apontado) ||
                (filtroApontado === 'nao_apontado' && !tarefa.apontado);

            return (
                descricaoMatch &&
                clienteMatch &&
                categoriaMatch &&
                dataMatch &&
                diaMatch &&
                mesMatch &&
                anoMatch &&
                apontadoMatch
            );
        });
    }, [
        tarefasGlobais,
        buscaMain,
        filtroCliente,
        filtroCategoria,
        filtroData,
        filtroDia,
        filtroMes,
        filtroAno,
        filtroApontado,
    ]);

    const clientesUnicos = useMemo(() => {
        const unicos = new Set(tarefasGlobais.map((t) => t.cliente).filter(Boolean));
        return Array.from(unicos).sort();
    }, [tarefasGlobais]);

    const categoriasUnicas = useMemo(() => {
        const unicos = new Set(tarefasGlobais.map((t) => t.categoria).filter(Boolean));
        return Array.from(unicos).sort();
    }, [tarefasGlobais]);

    const anosUnicos = useMemo(() => {
        const unicos = new Set(tarefasGlobais.map((t) => t.anoNumero).filter(Boolean));
        return Array.from(unicos).sort((a, b) => Number(b) - Number(a));
    }, [tarefasGlobais]);

    return (
        <div className="search-tasks-grid">
            <div className="card">
                <div className="section-header">
                    <h2 className="section-title">
                        <div className="section-icon">
                            <Search className="icon-lg" />
                        </div>
                        Pesquisar Tarefas
                    </h2>
                </div>

                <div className="search-filters">
                    <div className="filtro-group filtro-group-full">
                        <label className="filtro-label">Descrição</label>
                        <input
                            type="text"
                            placeholder="Digite para buscar..."
                            className="filtro-input"
                            value={buscaMain}
                            onChange={(e) => setBuscaMain(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Cliente</label>
                        <select
                            className="filtro-select"
                            value={filtroCliente}
                            onChange={(e) => setFiltroCliente(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {clientesUnicos.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Categoria</label>
                        <select
                            className="filtro-select"
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {categoriasUnicas.map((c) => (
                                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Data exata</label>
                        <input
                            type="date"
                            className="filtro-input"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                        />
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Dia</label>
                        <select
                            className="filtro-select"
                            value={filtroDia}
                            onChange={(e) => setFiltroDia(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {Array.from({ length: 31 }, (_, i) => {
                                const dia = String(i + 1).padStart(2, '0');
                                return (
                                    <option key={dia} value={dia}>
                                        {dia}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Mês</label>
                        <select
                            className="filtro-select"
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="01">Janeiro</option>
                            <option value="02">Fevereiro</option>
                            <option value="03">Março</option>
                            <option value="04">Abril</option>
                            <option value="05">Maio</option>
                            <option value="06">Junho</option>
                            <option value="07">Julho</option>
                            <option value="08">Agosto</option>
                            <option value="09">Setembro</option>
                            <option value="10">Outubro</option>
                            <option value="11">Novembro</option>
                            <option value="12">Dezembro</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Ano</label>
                        <select
                            className="filtro-select"
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {anosUnicos.map((ano) => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label className="filtro-label">Status</label>
                        <select
                            className="filtro-select"
                            value={filtroApontado}
                            onChange={(e) => setFiltroApontado(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="apontado">Somente apontadas</option>
                            <option value="nao_apontado">Somente não apontadas</option>
                        </select>
                    </div>
                </div>

                <div className="search-results">
                    {tarefasFiltradas.length === 0 ? (
                        <div className="empty-state">
                            <Search className="empty-state-icon" />
                            <p className="empty-state-title">
                                {tarefasGlobais.length === 0 ? 'Nenhuma tarefa registrada' : 'Nenhuma tarefa encontrada'}
                            </p>
                            <p className="empty-state-subtitle">
                                {tarefasGlobais.length === 0
                                    ? 'Adicione tarefas aos seus dias para vê-las aqui'
                                    : 'Tente ajustar os filtros de busca'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="search-result-count">
                                <p>
                                    <strong>{tarefasFiltradas.length}</strong> tarefa{tarefasFiltradas.length !== 1 ? 's' : ''} encontrada{tarefasFiltradas.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="tarefas-search-list">
                                {tarefasFiltradas.map((tarefa, idx) => (
                                    <div key={`${tarefa.diaId}-${idx}`} className="tarefa-search-card">
                                        <div className="tarefa-search-header">
                                            <h3 className="tarefa-search-title">{tarefa.descricao}</h3>

                                            <div
                                                className={`badge ${tarefa.apontado ? 'badge-success' : 'badge-gray'} clickable`}
                                                onClick={() => handleToggleApontado(tarefa)}
                                                style={{
                                                    opacity: updatingTaskId === tarefa.id ? 0.5 : 1,
                                                    pointerEvents: updatingTaskId === tarefa.id ? 'none' : 'auto',
                                                }}
                                                title="Clique para alterar status"
                                            >
                                                <CheckCircle className="icon-sm" />
                                                <span>{tarefa.apontado ? 'Apontado' : 'Não apontado'}</span>
                                            </div>
                                        </div>

                                        <div className="tarefa-search-meta">
                                            {tarefa.cliente && (
                                                <div className="meta-item">
                                                    <User className="icon-sm" />
                                                    <span>{tarefa.cliente}</span>
                                                </div>
                                            )}

                                            {tarefa.categoria && (
                                                <div className="meta-item">
                                                    <Tag className="icon-sm" />
                                                    <span>{tarefa.categoria.replace(/_/g, ' ')}</span>
                                                </div>
                                            )}

                                            {tarefa.duracaoMin && (
                                                <div className="meta-item">
                                                    <Clock className="icon-sm" />
                                                    <span>{formatarDuracao(tarefa.duracaoMin)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {tarefa.obs && (
                                            <p className="tarefa-search-obs">{tarefa.obs}</p>
                                        )}

                                        <div className="tarefa-search-footer">
                                            <p className="tarefa-search-data">
                                                Alocada em: <strong>{formatarDataBR(tarefa.dataAlocada)}</strong>
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => handleCopy(tarefa)}
                                                className="btn-icon btn-icon-copy"
                                                title="Copiar tarefa"
                                            >
                                                <Copy className="icon-md" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchTasksView;