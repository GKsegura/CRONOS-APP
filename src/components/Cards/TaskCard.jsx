import { CheckCircle, Copy, Edit, Save, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import './TaskCard.css';

const TaskCard = ({
    tarefa,
    onEditar,
    onRemover,
    onToggleApontado,
    updatingTaskId,
    editingTask,
    editForm,
    onEditFormChange,
    onSalvar,
    onCancelar,
    savingTask,
    formatarDuracao,
    categorias,
    clientes,
}) => {
    const isUpdatingApontado = updatingTaskId === tarefa.id;

    const handleToggleApontado = () => {
        if (isUpdatingApontado) return;

        if (!onToggleApontado) {
            console.warn('onToggleApontado não foi informado para TaskCard');
            toast.error('Não foi possível alterar o status da tarefa.');
            return;
        }

        onToggleApontado(tarefa.id, !tarefa.apontado);
    };

    const handleCopy = async () => {
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
                        <option value="">Selecione cliente</option>
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
                        placeholder="Observações"
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
                            type="button"
                            onClick={() => onSalvar(tarefa.id)}
                            disabled={savingTask}
                            className="btn btn-success"
                        >
                            <Save className="icon-sm" />
                            Salvar
                        </button>

                        <button
                            type="button"
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

                        <button
                            type="button"
                            className={`badge ${tarefa.apontado ? 'badge-success' : 'badge-gray'} clickable badge-toggle-btn`}
                            onClick={handleToggleApontado}
                            disabled={isUpdatingApontado}
                            title="Clique para alterar o status"
                            aria-label={
                                tarefa.apontado
                                    ? 'Desmarcar tarefa como apontada'
                                    : 'Marcar tarefa como apontada'
                            }
                            style={{
                                opacity: isUpdatingApontado ? 0.5 : 1,
                                pointerEvents: isUpdatingApontado ? 'none' : 'auto',
                            }}
                        >
                            <CheckCircle className="icon-sm" />
                            <span>{tarefa.apontado ? 'Apontado' : 'Não apontado'}</span>
                        </button>
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
                        type="button"
                        onClick={handleCopy}
                        className="btn-icon btn-icon-copy"
                        title="Copiar tarefa"
                    >
                        <Copy className="icon-md" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onEditar(tarefa)}
                        className="btn-icon btn-icon-edit"
                        title="Editar tarefa"
                    >
                        <Edit className="icon-md" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onRemover(tarefa.id)}
                        className="btn-icon btn-icon-delete"
                        title="Remover tarefa"
                    >
                        <Trash2 className="icon-md" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;