import {
    BacklogPanel,
    DiaCard,
    ExportarExcel,
    GraficoHoras,
    SeletorData
} from '@components';
import { calcularIndicadoresDashboard, formatarMinutosEmHoras } from '@utils';
import { Calendar, CheckSquare, Clock, Filter } from 'lucide-react';

import { AlertApontamento } from '@components';
import { verificarDiasSemApontamento } from '@utils';
import { useState } from 'react';

import {
    Building2,
    CheckCircle,
    Tag
} from 'lucide-react';
const TITULOS = {
    todos: 'Todos os Dias',
    pendentes: 'Dias Pendentes',
    completos: 'Dias Completos',
};

const MENSAGENS_VAZIAS = {
    todos: { title: 'Nenhum dia registrado ainda', subtitle: 'Clique em "Hoje" ou selecione uma data acima' },
    pendentes: { title: 'Nenhum dia pendente', subtitle: 'Todos os dias estão com horas completas!' },
    completos: { title: 'Nenhum dia completo ainda', subtitle: 'Complete os apontamentos para vê-los aqui' },
};

const HomeView = ({
    dias,
    loading,
    diasRecentes,
    contadores,
    filtroStatus,
    setFiltroStatus,
    ordenacao,
    setOrdenacao,
    filtroMes,
    setFiltroMes,
    onSelecionarDia,
    onCriarOuCarregarDia,
    onExportar,
    exporting,
    onExcluirDia,
    onAdicionarTarefaPadrao,
}) => {
    const [alertaFechado, setAlertaFechado] = useState(false);

    const deveMostrarAlerta = verificarDiasSemApontamento(diasRecentes, 3) && !alertaFechado;
    const mensagemVazia = MENSAGENS_VAZIAS[filtroStatus] ?? { title: 'Nenhum dia encontrado', subtitle: '' };
    const indicadores = calcularIndicadoresDashboard(diasRecentes);

    return (
        <>{deveMostrarAlerta && (
            <AlertApontamento onClose={() => setAlertaFechado(true)} />
        )}
            <div className="home-grid">
                <SeletorData onSelecionar={onCriarOuCarregarDia} loading={loading} />
                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <div className="dashboard-card-top">
                            <div className="dashboard-card-icon-wrapper">
                                <Clock className="dashboard-card-icon" />
                            </div>
                            <span className="dashboard-card-tag">Período atual</span>
                        </div>

                        <div className="dashboard-card-label">Horas registradas</div>
                        <div className="dashboard-card-value">
                            {formatarMinutosEmHoras(indicadores.totalMinutos)}
                        </div>
                        <div className="dashboard-card-subtitle">
                            Tempo total alocado no período
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-top">
                            <div className="dashboard-card-icon-wrapper">
                                <CheckSquare className="dashboard-card-icon" />
                            </div>
                            <span className="dashboard-card-tag">Volume</span>
                        </div>

                        <div className="dashboard-card-label">Total de tarefas</div>
                        <div className="dashboard-card-value">
                            {indicadores.totalTarefas}
                        </div>
                        <div className="dashboard-card-subtitle">
                            Quantidade de tarefas encontradas
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-top">
                            <div className="dashboard-card-icon-wrapper">
                                <CheckCircle className="dashboard-card-icon" />
                            </div>
                            <span className="dashboard-card-tag">Status</span>
                        </div>

                        <div className="dashboard-card-label">Tarefas apontadas</div>
                        <div className="dashboard-card-value">
                            {indicadores.totalTarefasApontadas}
                            <span className="dashboard-card-muted">/{indicadores.totalTarefas}</span>
                        </div>
                        <div className="dashboard-card-subtitle">
                            {indicadores.percentualApontado}% do total apontado
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-top">
                            <div className="dashboard-card-icon-wrapper">
                                <Building2 className="dashboard-card-icon" />
                            </div>
                            <span className="dashboard-card-tag">Foco</span>
                        </div>

                        <div className="dashboard-card-label">Cliente mais recorrente</div>
                        <div className="dashboard-card-value dashboard-card-value-text">
                            {indicadores.clienteMaisRecorrente}
                        </div>
                        <div className="dashboard-card-subtitle">
                            Cliente com mais tarefas no período
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-top">
                            <div className="dashboard-card-icon-wrapper">
                                <Tag className="dashboard-card-icon" />
                            </div>
                            <span className="dashboard-card-tag">Perfil</span>
                        </div>

                        <div className="dashboard-card-label">Categoria mais usada</div>
                        <div className="dashboard-card-value dashboard-card-value-text">
                            {indicadores.categoriaMaisUsada !== '-'
                                ? indicadores.categoriaMaisUsada.replace(/_/g, ' ')
                                : '-'}
                        </div>
                        <div className="dashboard-card-subtitle">
                            Categoria mais frequente no período
                        </div>
                    </div>
                </div>
                {diasRecentes.length > 0 && <GraficoHoras dias={diasRecentes} />}
                <ExportarExcel onExportar={onExportar} exporting={exporting} />

                <BacklogPanel diaAtualId={null} onTarefaConvertida={null} />

                <section className="card">
                    <div className="section-header-with-filter">
                        <h2 className="section-title">
                            <div className="section-icon">
                                <Clock className="icon-lg" />
                            </div>
                            {TITULOS[filtroStatus] ?? 'Dias'}
                        </h2>

                        <div className="filter-group">
                            <Filter className="icon-sm filter-icon" />
                            <div className="filter-options">
                                <button
                                    className={`filter-btn ${filtroMes === 'atual' ? 'active' : ''}`}
                                    onClick={() => setFiltroMes('atual')}
                                >
                                    Mês atual
                                </button>
                                <button
                                    className={`filter-btn ${filtroMes === 'anterior' ? 'active' : ''}`}
                                    onClick={() => setFiltroMes('anterior')}
                                >
                                    Mês anterior
                                </button>
                                <button
                                    className={`filter-btn ${filtroMes === 'ambos' ? 'active' : ''}`}
                                    onClick={() => setFiltroMes('ambos')}
                                >
                                    Ambos
                                </button>

                                {['todos', 'pendentes', 'completos'].map((status) => (
                                    <button
                                        key={status}
                                        className={`filter-btn ${filtroStatus === status ? 'active' : ''}`}
                                        onClick={() => setFiltroStatus(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                        {contadores[status] > 0 && (
                                            <span className={`filter-badge ${status === 'pendentes' ? 'badge-warning' : status === 'completos' ? 'badge-success' : ''}`}>
                                                {contadores[status]}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <span className="filter-separator" />

                                {['recente', 'antigo'].map((ord) => (
                                    <button
                                        key={ord}
                                        className={`filter-btn ${ordenacao === ord ? 'active' : ''}`}
                                        onClick={() => setOrdenacao(ord)}
                                    >
                                        {ord === 'recente' ? 'Mais recente' : 'Mais antigo'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner spinner-lg" />
                            <span className="loading-text">Carregando...</span>
                        </div>
                    ) : dias.length === 0 ? (
                        <div className="empty-state">
                            <Calendar className="empty-state-icon" />
                            <p className="empty-state-title">Nenhum dia registrado ainda</p>
                            <p className="empty-state-subtitle">Clique em "Hoje" ou selecione uma data acima</p>
                        </div>
                    ) : diasRecentes.length === 0 ? (
                        <div className="empty-state">
                            <CheckSquare className="empty-state-icon" />
                            <p className="empty-state-title">{mensagemVazia.title}</p>
                            <p className="empty-state-subtitle">{mensagemVazia.subtitle}</p>
                        </div>
                    ) : (
                        <div className="dias-list">
                            {diasRecentes.map((dia) => (
                                <DiaCard
                                    key={dia.id}
                                    dia={dia}
                                    onSelecionar={onSelecionarDia}
                                    onExcluir={onExcluirDia}
                                    onAdicionarTarefaPadrao={onAdicionarTarefaPadrao}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default HomeView;