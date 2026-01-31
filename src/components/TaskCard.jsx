import { CheckCircle, Edit, Save, Trash2, X } from 'lucide-react';
import './TaskCard.css';

const TaskCard = ({ tarefa, onEditar, onRemover, editingTask, editForm, onEditFormChange, onSalvar, onCancelar, savingTask, formatarDuracao, categorias, clientes }) => {
    console.log('TaskCard renderizado:', {
        tarefaId: tarefa.id,
        tarefaIdTipo: typeof tarefa.id,
        editingTask: editingTask,
        editingTaskTipo: typeof editingTask,
        isEditing: editingTask === tarefa.id
    });

    if (editingTask === tarefa.id) {
        return (
            <div className="task-card task-card-editing">
                <div className="task-form">
                    <input
                        type="text"
                        placeholder="Descrição *"
                        value={editForm.descricao}
                        onChange={(e) => onEditFormChange({ ...editForm, descricao: e.target.value })}
                        disabled={savingTask}
                        className="input"
                    />
                    <select
                        value={editForm.categoria}
                        onChange={(e) => onEditFormChange({ ...editForm, categoria: e.target.value })}
                        disabled={savingTask}
                        className="select"
                    >
                        <option value="">Selecione categoria</option>
                        {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <select
                        value={editForm.cliente}
                        onChange={(e) => onEditFormChange({ ...editForm, cliente: e.target.value })}
                        disabled={savingTask}
                        className="select"
                    >
                        <option value="">Selecione cliente (opcional)</option>
                        {clientes.map((cliente) => (
                            <option key={cliente} value={cliente}>
                                {cliente}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Duração em minutos *"
                        value={editForm.duracao}
                        onChange={(e) => onEditFormChange({ ...editForm, duracao: e.target.value })}
                        disabled={savingTask}
                        className="input"
                        min="1"
                    />
                    <textarea
                        placeholder="Observações (opcional)"
                        value={editForm.obs}
                        onChange={(e) => onEditFormChange({ ...editForm, obs: e.target.value })}
                        disabled={savingTask}
                        rows="3"
                        className="textarea"
                    />
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={editForm.apontado}
                            onChange={(e) => onEditFormChange({ ...editForm, apontado: e.target.checked })}
                            disabled={savingTask}
                            className="checkbox"
                        />
                        <span>Tarefa já foi apontada</span>
                    </label>
                    <div className="task-actions">
                        <button
                            onClick={() => onSalvar(tarefa.id)}
                            disabled={savingTask}
                            className="btn btn-success"
                        >
                            {savingTask ? (
                                <>
                                    <div className="spinner"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="icon-sm" />
                                    Salvar
                                </>
                            )}
                        </button>
                        <button
                            onClick={onCancelar}
                            disabled={savingTask}
                            className="btn btn-secondary"
                        >
                            <X className="icon-sm" />
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="task-card">
            <div className="task-content">
                <div className="task-info">
                    <div className="task-header">
                        <p className="task-descricao">{tarefa.descricao}</p>
                        {tarefa.apontado && (
                            <div className="badge badge-success">
                                <CheckCircle className="icon-sm" />
                                <span>Apontado</span>
                            </div>
                        )}
                    </div>
                    <div className="task-tags">
                        <span className="badge badge-blue">
                            {tarefa.categoria || 'N/A'}
                        </span>
                        {tarefa.cliente && (
                            <span className="badge badge-purple">
                                {tarefa.cliente}
                            </span>
                        )}
                        {tarefa.duracaoMin && (
                            <span className="badge badge-orange">
                                ⏱️ {formatarDuracao(tarefa.duracaoMin)}
                            </span>
                        )}
                    </div>
                    {tarefa.obs && (
                        <div className="task-obs">
                            <p>{tarefa.obs}</p>
                        </div>
                    )}
                </div>
                <div className="task-buttons">
                    <button
                        onClick={() => onEditar(tarefa)}
                        className="btn-icon btn-icon-edit"
                    >
                        <Edit className="icon-md" />
                    </button>
                    <button
                        onClick={() => onRemover(tarefa.id)}
                        className="btn-icon btn-icon-delete"
                    >
                        <Trash2 className="icon-md" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;