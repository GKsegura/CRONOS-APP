import { diasAPI } from '@api';
import { BacklogPanel, TaskCard } from '@components';
import { useTaskForm } from '@hooks/useTaskForm';
import {
    calcularHorasTrabalhadas,
    calcularMinutosFaltantes,
    calcularTotalTarefas,
    calcularTotalTarefasApontadas,
    formatarDuracao,
    obterDataFormatada,
    ordenarTarefas,
} from '@utils/tempo';
import { CheckSquare, Clock, Plus } from 'lucide-react';
import './DetalhesView.css';

const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        callback();
    }
};

const DetalhesView = ({
    selectedDia,
    setSelectedDia,
    atualizarDiaLocal,
    setError,
    clientes,
    categorias,
    onTarefaConvertida,
    onAdicionarTarefaPadrao,
}) => {
    const taskForm = useTaskForm({ selectedDia, setSelectedDia, atualizarDiaLocal, setError });

    const atualizarTempo = async (campo, valor) => {
        try {
            const diaAtualizado = await diasAPI.update(selectedDia.id, campo, valor);
            setSelectedDia(diaAtualizado);
            atualizarDiaLocal(diaAtualizado);
        } catch (err) {
            setError('Erro ao atualizar horário: ' + err.message);
        }
    };

    const { novaTaskForm, setNovaTaskForm, editForm, setEditForm, editingTask,
        savingTask, updatingTaskId, adicionarTarefa, atualizarTarefa,
        removerTarefa, handleToggleApontado, iniciarEdicao, cancelarEdicao } = taskForm;

    const horasTrabalhadas = calcularHorasTrabalhadas(selectedDia);
    const tarefasOrdenadas = ordenarTarefas(selectedDia.tarefas);

    return (
        <div className="detalhes-grid">
            <BacklogPanel diaAtualId={selectedDia.id} onTarefaConvertida={onTarefaConvertida} />

            {/* ── Horários ─────────────────────────────────────────────────── */}
            <section className="card">
                <h2 className="section-title">
                    <div className="section-icon"><Clock className="icon-lg" /></div>
                    Horários - {obterDataFormatada(selectedDia)}
                </h2>

                <div className="horarios-grid">
                    {[
                        { label: 'Início do Trabalho', campo: 'inicioTrabalho' },
                        { label: 'Fim do Trabalho', campo: 'fimTrabalho' },
                        { label: 'Início do Almoço', campo: 'inicioAlmoco' },
                        { label: 'Fim do Almoço', campo: 'fimAlmoco' },
                    ].map(({ label, campo }) => (
                        <div key={campo} className="form-group">
                            <label className="form-label">{label}</label>
                            <input
                                type="time"
                                value={selectedDia[campo] || ''}
                                onChange={(e) => atualizarTempo(campo, e.target.value)}
                                className="input"
                            />
                        </div>
                    ))}
                </div>

                {selectedDia.inicioTrabalho && selectedDia.fimTrabalho && (
                    <div className="horas-summary">
                        <p className="horas-summary-text">Horas Trabalhadas: {horasTrabalhadas}</p>
                        {calcularMinutosFaltantes(selectedDia) > 0 &&
                            !selectedDia.tarefas?.some((t) => t.categoria === 'SUPORTE' && t.cliente === 'Nexum') && (
                                <button
                                    onClick={() => onAdicionarTarefaPadrao(selectedDia)}
                                    className="btn-adicionar-padrao-detalhes"
                                    title="Adicionar atividade padrão"
                                >
                                    <Plus className="icon-sm" />
                                    Atividade Padrão
                                </button>
                            )}
                    </div>
                )}
            </section>

            {/* ── Tarefas ──────────────────────────────────────────────────── */}
            <section className="card">
                <div className="tarefas-header">
                    <h2 className="section-title">
                        <div className="section-icon"><CheckSquare className="icon-lg" /></div>
                        Tarefas
                    </h2>

                    {selectedDia.tarefas?.length > 0 && (
                        <div className="tarefas-total-wrapper">
                            <div className="tarefas-total">
                                <p className="tarefas-total-label">Total:</p>
                                <p className="tarefas-total-value">{calcularTotalTarefas(selectedDia.tarefas)}</p>
                            </div>
                            <div className="tarefas-total">
                                <p className="tarefas-total-label">Total apontado:</p>
                                <p className="tarefas-total-value">{calcularTotalTarefasApontadas(selectedDia.tarefas)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Formulário nova tarefa ────────────────────────────────── */}
                <div className="nova-tarefa-form">
                    <h3 className="nova-tarefa-title">
                        <Plus className="icon-md" />
                        Nova Tarefa
                    </h3>

                    <div className="nova-tarefa-inputs">
                        <input
                            type="text"
                            placeholder="Descrição da tarefa *"
                            value={novaTaskForm.descricao}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, descricao: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, adicionarTarefa)}
                            disabled={savingTask}
                            className="input"
                        />

                        <select
                            value={novaTaskForm.categoria}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, categoria: e.target.value })}
                            disabled={savingTask}
                            className="select"
                        >
                            <option value="">Selecione categoria</option>
                            {categorias.map((c) => (
                                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                            ))}
                        </select>

                        <select
                            value={novaTaskForm.cliente}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, cliente: e.target.value })}
                            disabled={savingTask}
                            className="select"
                        >
                            <option value="">Selecione cliente (opcional)</option>
                            {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <input
                            type="number"
                            placeholder="Duração em minutos *"
                            value={novaTaskForm.duracao}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, duracao: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, adicionarTarefa)}
                            disabled={savingTask}
                            className="input"
                            min="1"
                        />
                    </div>

                    <textarea
                        placeholder="Observações (opcional)"
                        value={novaTaskForm.obs}
                        onChange={(e) => setNovaTaskForm({ ...novaTaskForm, obs: e.target.value })}
                        disabled={savingTask}
                        rows="3"
                        className="textarea"
                    />

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={novaTaskForm.apontado}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, apontado: e.target.checked })}
                            disabled={savingTask}
                            className="checkbox"
                        />
                        <span>Tarefa já foi apontada</span>
                    </label>

                    <button onClick={adicionarTarefa} disabled={savingTask} className="btn btn-primary btn-block">
                        {savingTask ? (
                            <><div className="spinner" />Salvando...</>
                        ) : (
                            <><Plus className="icon-md" />Adicionar Tarefa</>
                        )}
                    </button>
                </div>

                {/* ── Lista de tarefas ─────────────────────────────────────── */}
                {tarefasOrdenadas?.length > 0 ? (
                    <div className="tarefas-list">
                        {tarefasOrdenadas.map((tarefa) => (
                            <TaskCard
                                key={tarefa.id}
                                tarefa={tarefa}
                                onEditar={iniciarEdicao}
                                onRemover={removerTarefa}
                                onToggleApontado={handleToggleApontado}
                                updatingTaskId={updatingTaskId}
                                editingTask={editingTask}
                                editForm={editForm}
                                onEditFormChange={setEditForm}
                                onSalvar={atualizarTarefa}
                                onCancelar={cancelarEdicao}
                                savingTask={savingTask}
                                formatarDuracao={formatarDuracao}
                                categorias={categorias}
                                clientes={clientes}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <CheckSquare className="empty-state-icon" />
                        <p className="empty-state-title">Nenhuma tarefa registrada ainda</p>
                        <p className="empty-state-subtitle">Adicione sua primeira tarefa acima</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DetalhesView;