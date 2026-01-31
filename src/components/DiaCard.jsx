import { CheckSquare, Clock, Trash2 } from "lucide-react";
import './DiaCard.css';

const DiaCard = ({ dia, onSelecionar, onExcluir, calcularHorasTrabalhadas, calcularTotalTarefas, obterDataFormatada }) => (
    <button
        onClick={() => onSelecionar(dia)}
        className="dia-card"
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
                {dia.tarefas && dia.tarefas.length > 0 && (
                    <p className="stats-duracao">
                        ⏱️ {calcularTotalTarefas(dia.tarefas)}
                    </p>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onExcluir(dia.id);
                    }}
                    className="btn-excluir"
                >
                    <Trash2 className="icon-sm" />
                    Excluir
                </button>
            </div>
        </div>
    </button>
);

export default DiaCard;