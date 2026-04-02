import { ArrowDown, ArrowUp, CheckCheck, Edit, Save, Trash2, X } from 'lucide-react';
import './BacklogCard.css';

const BacklogCard = ({
    item,
    index,
    total,
    diaAtualId,
    onConverter,
    onRemover,
    onMoverCima,
    onMoverBaixo,
    onEditar,
    editingId,
    editForm,
    onEditFormChange,
    onSalvar,
    onCancelar,
    saving,
    formatarDuracao,
    categorias,
    clientes,
}) => {
    const isEditing = editingId === item.id;
    const vencido = item.dataLimite && isPrazoVencido(item.dataLimite);
    const proximoVencer = item.dataLimite && !vencido && isPrazoProximo(item.dataLimite);

    if (isEditing) {
        return (
            <div className="backlog-card backlog-card-editing">
                <div className="backlog-form">
                    <input
                        type="text"
                        placeholder="Descrição *"
                        value={editForm.descricao}
                        onChange={(e) => onEditFormChange({ ...editForm, descricao: e.target.value })}
                        disabled={saving}
                        className="input"
                    />
                    <select
                        value={editForm.categoria}
                        onChange={(e) => onEditFormChange({ ...editForm, categoria: e.target.value })}
                        disabled={saving}
                        className="select"
                    >
                        <option value="">Selecione categoria</option>
                        {categorias.map((cat) => (
                            <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    <select
                        value={editForm.cliente}
                        onChange={(e) => onEditFormChange({ ...editForm, cliente: e.target.value })}
                        disabled={saving}
                        className="select"
                    >
                        <option value="">Selecione cliente (opcional)</option>
                        {clientes.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Duração em minutos (opcional)"
                        value={editForm.duracaoMin}
                        onChange={(e) => onEditFormChange({ ...editForm, duracaoMin: e.target.value })}
                        disabled={saving}
                        className="input"
                        min="1"
                    />
                    <input
                        type="date"
                        placeholder="Data limite (opcional)"
                        value={editForm.dataLimite}
                        onChange={(e) => onEditFormChange({ ...editForm, dataLimite: e.target.value })}
                        disabled={saving}
                        className="input"
                    />
                    <textarea
                        placeholder="Observações (opcional)"
                        value={editForm.obs}
                        onChange={(e) => onEditFormChange({ ...editForm, obs: e.target.value })}
                        disabled={saving}
                        rows="2"
                        className="textarea"
                    />
                    <div className="backlog-form-actions">
                        <button onClick={() => onSalvar(item.id)} disabled={saving} className="btn btn-success">
                            {saving ? <><div className="spinner" /> Salvando...</> : <><Save className="icon-sm" />Salvar</>}
                        </button>
                        <button onClick={onCancelar} disabled={saving} className="btn btn-secondary">
                            <X className="icon-sm" />Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`backlog-card ${vencido ? 'backlog-card-vencido' : ''} ${proximoVencer ? 'backlog-card-proximo' : ''}`}>
            <div className="backlog-prioridade">
                <span className="prioridade-numero">#{index + 1}</span>
                <div className="prioridade-botoes">
                    <button
                        onClick={() => onMoverCima(index)}
                        disabled={index === 0}
                        className="btn-prioridade"
                        title="Aumentar prioridade"
                    >
                        <ArrowUp className="icon-xs" />
                    </button>
                    <button
                        onClick={() => onMoverBaixo(index)}
                        disabled={index === total - 1}
                        className="btn-prioridade"
                        title="Diminuir prioridade"
                    >
                        <ArrowDown className="icon-xs" />
                    </button>
                </div>
            </div>

            <div className="backlog-info">
                <p className="backlog-descricao">{item.descricao}</p>
                <div className="backlog-tags">
                    {item.categoria && (
                        <span className="badge badge-blue">{item.categoria.replace(/_/g, ' ')}</span>
                    )}
                    {item.cliente && (
                        <span className="badge badge-purple">{item.cliente}</span>
                    )}
                    {item.duracaoMin && (
                        <span className="badge badge-orange">⏱️ {formatarDuracao(item.duracaoMin)}</span>
                    )}
                    {item.dataLimite && (
                        <span className={`badge ${vencido ? 'badge-danger' : proximoVencer ? 'badge-warning' : 'badge-gray'}`}>
                            📅 {formatarDataLimite(item.dataLimite)}
                        </span>
                    )}
                </div>
                {item.obs && (
                    <div className="backlog-obs"><p>{item.obs}</p></div>
                )}
            </div>

            <div className="backlog-botoes">
                {diaAtualId && (
                    <button
                        onClick={() => onConverter(item.id)}
                        className="btn-converter"
                        title="Fazer hoje"
                    >
                        <CheckCheck className="icon-sm" />
                        <span>Fazer hoje</span>
                    </button>
                )}
                <button onClick={() => onEditar(item)} className="btn-icon btn-icon-edit" title="Editar">
                    <Edit className="icon-md" />
                </button>
                <button onClick={() => onRemover(item.id)} className="btn-icon btn-icon-delete" title="Remover">
                    <Trash2 className="icon-md" />
                </button>
            </div>
        </div>
    );
};

// Converte "dd/MM/yyyy" para Date
function parseDateBR(str) {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}

// Converte "yyyy-MM-dd" (input date) para Date
function parseDateISO(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function parseData(str) {
    if (!str) return null;
    return str.includes('/') ? parseDateBR(str) : parseDateISO(str);
}

function isPrazoVencido(dataLimite) {
    const limite = parseData(dataLimite);
    if (!limite) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return limite < hoje;
}

function isPrazoProximo(dataLimite) {
    const limite = parseData(dataLimite);
    if (!limite) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = (limite - hoje) / (1000 * 60 * 60 * 24);
    return diff <= 3;
}

function formatarDataLimite(str) {
    const data = parseData(str);
    if (!data) return str;
    return data.toLocaleDateString('pt-BR');
}

export default BacklogCard;