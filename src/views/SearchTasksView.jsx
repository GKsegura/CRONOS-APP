import { formatarDuracao } from '@utils/tempo';
import { Clock, Search, Tag, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import './SearchTasksView.css';

const SearchTasksView = ({ dias = [] }) => {
    const [buscaMain, setBuscaMain] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Extrai todas as tarefas de todos os dias
    const tarefasGlobais = useMemo(() => {
        const todasTarefas = [];
        dias.forEach((dia) => {
            dia.tarefas?.forEach((tarefa) => {
                todasTarefas.push({
                    ...tarefa,
                    dataAlocada: dia.data,
                    diaId: dia.id,
                });
            });
        });
        return todasTarefas;
    }, [dias]);

    // Filtra tarefas baseado nos critérios
    const tarefasFiltradas = useMemo(() => {
        return tarefasGlobais.filter((tarefa) => {
            const descricaoMatch = !buscaMain || tarefa.descricao?.toLowerCase().includes(buscaMain.toLowerCase());
            const clienteMatch = !filtroCliente || tarefa.cliente === filtroCliente;
            const categoriaMatch = !filtroCategoria || tarefa.categoria === filtroCategoria;
            return descricaoMatch && clienteMatch && categoriaMatch;
        });
    }, [tarefasGlobais, buscaMain, filtroCliente, filtroCategoria]);

    // Extrai clientes e categorias únicos
    const clientesUnicos = useMemo(() => {
        const unicos = new Set(tarefasGlobais.map((t) => t.cliente).filter(Boolean));
        return Array.from(unicos).sort();
    }, [tarefasGlobais]);

    const categoriasUnicas = useMemo(() => {
        const unicos = new Set(tarefasGlobais.map((t) => t.categoria).filter(Boolean));
        return Array.from(unicos).sort();
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

                {/* ── Filtros ─────────────────────────────────────────────── */}
                <div className="search-filters">
                    <div className="filtro-group">
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
                </div>

                {/* ── Resultados ──────────────────────────────────────────── */}
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
                                            {tarefa.apontado && (
                                                <span className="badge badge-success">Apontado</span>
                                            )}
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

                                        <p className="tarefa-search-data">
                                            Alocada em: <strong>{tarefa.dataAlocada}</strong>
                                        </p>
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
