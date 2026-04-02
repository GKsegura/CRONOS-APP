import { backlogAPI, categoriasAPI, clientesAPI } from '@api';
import { BacklogCard } from '@components/Cards';
import { ClipboardList, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './BacklogPanel.css';

const formVazio = {
    descricao: '',
    categoria: '',
    cliente: '',
    duracaoMin: '',
    dataLimite: '',
    obs: '',
};

const BacklogPanel = ({ diaAtualId, onTarefaConvertida }) => {
    const [itens, setItens] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [novoForm, setNovoForm] = useState(formVazio);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(formVazio);
    const [saving, setSaving] = useState(false);

    // Carrega tudo na montagem
    useEffect(() => {
        Promise.all([
            backlogAPI.getAll(),
            categoriasAPI.getAll(),
            clientesAPI.getNomes(),
        ]).then(([backlog, cats, clis]) => {
            setItens(backlog);
            setCategorias(cats);
            setClientes(clis);
        }).finally(() => setLoading(false));
    }, []);

    // ---------------------------------------------------------------
    // CRIAÇÃO
    // ---------------------------------------------------------------
    const handleCriar = async () => {
        if (!novoForm.descricao.trim()) return;
        setSaving(true);
        try {
            const payload = montarPayload(novoForm);
            const criado = await backlogAPI.create(payload);
            setItens(prev => [...prev, criado]);
            setNovoForm(formVazio);
            setMostrarForm(false);
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------------
    // EDIÇÃO
    // ---------------------------------------------------------------
    const handleEditar = (item) => {
        setEditingId(item.id);
        setEditForm({
            descricao: item.descricao || '',
            categoria: item.categoria || '',
            cliente: item.cliente || '',
            duracaoMin: item.duracaoMin || '',
            dataLimite: isoParaInputDate(item.dataLimite),
            obs: item.obs || '',
        });
    };

    const handleSalvar = async (id) => {
        if (!editForm.descricao.trim()) return;
        setSaving(true);
        try {
            const payload = montarPayload(editForm);
            const atualizado = await backlogAPI.update(id, payload);
            setItens(prev => prev.map(i => i.id === id ? atualizado : i));
            setEditingId(null);
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------------
    // REMOÇÃO
    // ---------------------------------------------------------------
    const handleRemover = async (id) => {
        await backlogAPI.delete(id);
        setItens(prev => prev.filter(i => i.id !== id));
    };

    // ---------------------------------------------------------------
    // REORDENAÇÃO
    // ---------------------------------------------------------------
    const mover = async (index, direcao) => {
        const novaLista = [...itens];
        const destino = index + direcao;
        [novaLista[index], novaLista[destino]] = [novaLista[destino], novaLista[index]];
        setItens(novaLista);
        await backlogAPI.reordenar(novaLista.map(i => i.id));
    };

    // ---------------------------------------------------------------
    // CONVERTER → TASK DO DIA
    // ---------------------------------------------------------------
    const handleConverter = async (backlogId) => {
        const novaTarefa = await backlogAPI.converterParaDia(backlogId, diaAtualId);
        setItens(prev => prev.filter(i => i.id !== backlogId));
        onTarefaConvertida?.(novaTarefa);
    };

    // ---------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------
    const formatarDuracao = (min) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return h > 0 ? `${h}h${m > 0 ? `${String(m).padStart(2, '0')}m` : ''}` : `${m}m`;
    };

    if (loading) {
        return (
            <div className="backlog-panel">
                <div className="backlog-loading">
                    <div className="spinner" />
                    <span>Carregando backlog...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="backlog-panel">
            <div className="backlog-header">
                <div className="backlog-title-area">
                    <div className="backlog-icon">
                        <ClipboardList className="icon" />
                    </div>
                    <div>
                        <h2 className="backlog-title">Backlog</h2>
                        <p className="backlog-subtitle">
                            {itens.length === 0
                                ? 'Nenhuma tarefa pendente'
                                : `${itens.length} tarefa${itens.length > 1 ? 's' : ''} pendente${itens.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setMostrarForm(f => !f); setNovoForm(formVazio); }}
                    className="btn-adicionar"
                >
                    {mostrarForm ? <X className="icon-sm" /> : <Plus className="icon-sm" />}
                    {mostrarForm ? 'Cancelar' : 'Adicionar'}
                </button>
            </div>

            {/* Formulário de nova tarefa */}
            {mostrarForm && (
                <div className="backlog-novo-form">
                    <input
                        type="text"
                        placeholder="Descrição *"
                        value={novoForm.descricao}
                        onChange={(e) => setNovoForm({ ...novoForm, descricao: e.target.value })}
                        disabled={saving}
                        className="input"
                    />
                    <div className="backlog-novo-form-row">
                        <select
                            value={novoForm.categoria}
                            onChange={(e) => setNovoForm({ ...novoForm, categoria: e.target.value })}
                            disabled={saving}
                            className="select"
                        >
                            <option value="">Categoria (opcional)</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <select
                            value={novoForm.cliente}
                            onChange={(e) => setNovoForm({ ...novoForm, cliente: e.target.value })}
                            disabled={saving}
                            className="select"
                        >
                            <option value="">Cliente (opcional)</option>
                            {clientes.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="backlog-novo-form-row">
                        <input
                            type="number"
                            placeholder="Duração em minutos (opcional)"
                            value={novoForm.duracaoMin}
                            onChange={(e) => setNovoForm({ ...novoForm, duracaoMin: e.target.value })}
                            disabled={saving}
                            className="input"
                            min="1"
                        />
                        <div className="form-group">
                            <label className="form-label">Data limite (opcional)</label>
                            <input
                                type="date"
                                value={novoForm.dataLimite}
                                onChange={(e) => setNovoForm({ ...novoForm, dataLimite: e.target.value })}
                                disabled={saving}
                                className="input"
                            />
                        </div>
                    </div>
                    <textarea
                        placeholder="Observações (opcional)"
                        value={novoForm.obs}
                        onChange={(e) => setNovoForm({ ...novoForm, obs: e.target.value })}
                        disabled={saving}
                        rows="2"
                        className="textarea"
                    />
                    <div className="backlog-novo-form-actions">
                        <button onClick={handleCriar} disabled={saving || !novoForm.descricao.trim()} className="btn btn-success">
                            {saving ? <><div className="spinner" />Salvando...</> : <><Save className="icon-sm" />Salvar</>}
                        </button>
                        <button onClick={() => { setMostrarForm(false); setNovoForm(formVazio); }} disabled={saving} className="btn btn-secondary">
                            <X className="icon-sm" />Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de itens */}
            {itens.length > 0 && (
                <div className="backlog-lista">
                    {itens.map((item, index) => (
                        <BacklogCard
                            key={item.id}
                            item={item}
                            index={index}
                            total={itens.length}
                            diaAtualId={diaAtualId}
                            onConverter={handleConverter}
                            onRemover={handleRemover}
                            onMoverCima={(i) => mover(i, -1)}
                            onMoverBaixo={(i) => mover(i, 1)}
                            onEditar={handleEditar}
                            editingId={editingId}
                            editForm={editForm}
                            onEditFormChange={setEditForm}
                            onSalvar={handleSalvar}
                            onCancelar={() => setEditingId(null)}
                            saving={saving}
                            formatarDuracao={formatarDuracao}
                            categorias={categorias}
                            clientes={clientes}
                        />
                    ))}
                </div>
            )}

            {itens.length === 0 && !mostrarForm && (
                <div className="backlog-vazio">
                    <ClipboardList className="backlog-vazio-icon" />
                    <p>Nenhuma tarefa no backlog</p>
                    <span>Adicione tarefas que você precisa fazer nos próximos dias</span>
                </div>
            )}
        </section>
    );
};

// "dd/MM/yyyy" ou "yyyy-MM-dd" → "yyyy-MM-dd" para o input[type=date]
function isoParaInputDate(str) {
    if (!str) return '';
    if (str.includes('/')) {
        const [d, m, y] = str.split('/');
        return `${y}-${m}-${d}`;
    }
    return str;
}

// Monta o payload limpando campos vazios
function montarPayload(form) {
    const payload = { descricao: form.descricao.trim() };
    if (form.categoria) payload.categoria = form.categoria;
    if (form.cliente) payload.cliente = form.cliente;
    if (form.obs?.trim()) payload.obs = form.obs.trim();
    if (form.duracaoMin) payload.duracaoMin = Number(form.duracaoMin);
    if (form.dataLimite) {
        // Envia no formato dd/MM/yyyy igual ao resto da API
        const [y, m, d] = form.dataLimite.split('-');
        payload.dataLimite = `${d}/${m}/${y}`;
    }
    return payload;
}

export default BacklogPanel;