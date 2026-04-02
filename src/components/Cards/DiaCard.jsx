import {
    calcularHorasTrabalhadas,
    calcularTotalTarefas,
    calcularTotalTarefasApontadas,
    converterHorasParaMinutos,
    obterDataFormatada,
} from '@utils';
import { CheckSquare, Clock, Plus, Trash2 } from 'lucide-react';
import './DiaCard.css';

const DiaCard = ({ dia, onSelecionar, onExcluir, onAdicionarTarefaPadrao }) => {
    // Calcula minutos faltantes
    const minutosTrabalho = !dia.inicioTrabalho || !dia.fimTrabalho 
        ? 0 
        : converterHorasParaMinutos(calcularHorasTrabalhadas(dia));
    const minutosTarefas = dia.tarefas?.reduce((acc, t) => acc + (t.duracaoMin || 0), 0) || 0;
    const minutosFaltantes = minutosTrabalho - minutosTarefas;
    
    const temHorasFaltantes = minutosFaltantes > 0;
    const temTarefaPadrao = dia.tarefas?.some(
        (t) => t.categoria === 'SUPORTE' && t.cliente === 'Nexum'
    );
    const deveMostrarBotao = temHorasFaltantes && !temTarefaPadrao;
    
    if (minutosFaltantes > 0) {
        console.log(`🗓️ Card ${obterDataFormatada(dia)}: ${minutosFaltantes}min faltantes, mostra=${deveMostrarBotao}`);
    }
    
    return (
        <div
            onClick={() => onSelecionar(dia)}
            className="dia-card"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelecionar(dia)}
        >
            <div className="dia-card-content">
                <div className="dia-card-info">
                    <div className="dia-card-header">
                        <span className="dia-data">{obterDataFormatada(dia)}</span>
                    </div>

                    <div className="dia-horarios">
                        {dia.inicioTrabalho && dia.fimTrabalho && (
                            <div className="horario-item">
                                <Clock className="icon-sm horario-icon-trabalho" />
                                <span className="horario-text">{dia.inicioTrabalho} - {dia.fimTrabalho}</span>
                            </div>
                        )}
                        {dia.inicioAlmoco && dia.fimAlmoco && (
                            <div className="horario-item">
                                <Clock className="icon-sm horario-icon-almoco" />
                                <span className="horario-text">Almoço: {dia.inicioAlmoco} - {dia.fimAlmoco}</span>
                            </div>
                        )}
                    </div>

                    {dia.inicioTrabalho && dia.fimTrabalho && (
                        <div className="horas-trabalhadas">
                            {calcularHorasTrabalhadas(dia)}h trabalhadas
                        </div>
                    )}
                </div>

                <div className="dia-card-stats">
                    <div className="stats-tarefas">
                        <div className="stats-numero">
                            <CheckSquare className="icon-md stats-icon" />
                            <span className="stats-count">{dia.tarefas?.length || 0}</span>
                        </div>
                        <p className="stats-label">tarefas</p>
                    </div>

                    {dia.tarefas?.length > 0 && (
                        <>
                            <p className="stats-duracao">Total: {calcularTotalTarefas(dia.tarefas)}</p>
                            <p className="stats-duracao">Apontado: {calcularTotalTarefasApontadas(dia.tarefas)}</p>
                        </>
                    )}

                    <div className="dia-card-buttons">
                        {deveMostrarBotao && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdicionarTarefaPadrao(dia); }}
                                className="btn-adicionar-padrao"
                                title="Adicionar atividade padrão"
                            >
                                <Plus className="icon-sm" />
                                Atividade Padrão
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onExcluir(dia.id); }}
                            className="btn-excluir"
                        >
                            <Trash2 className="icon-sm" />
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaCard;