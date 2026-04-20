import {
    BacklogPanel,
    DiaCard,
    ExportarExcel,
    SeletorData,
    GraficoHoras
} from '@components';
import { Calendar, CheckSquare, Clock, Filter } from 'lucide-react';

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
    const mensagemVazia = MENSAGENS_VAZIAS[filtroStatus] ?? { title: 'Nenhum dia encontrado', subtitle: '' };

    return (
        <div className="home-grid">
            <SeletorData onSelecionar={onCriarOuCarregarDia} loading={loading} />
            {diasRecentes.length > 0 && <GraficoHoras dias={diasRecentes} />}
            {/* {diaAtualHome && <GraficoHoras dias={[diaAtualHome]} />} */}
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
    );
};

export default HomeView;