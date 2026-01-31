import { categoriasAPI, clientesAPI, diasAPI, exportAPI, tarefasAPI } from '@api';
import { DiaCard, ErrorAlert, ExportarExcel, Header, SeletorData, TaskCard } from '@components';
import { Calendar, CheckSquare, Clock, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './LandingPage.css';

const LandingPage = () => {
    const [view, setView] = useState('home');
    const [dias, setDias] = useState([]);
    const [selectedDia, setSelectedDia] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [savingTask, setSavingTask] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [novaTaskForm, setNovaTaskForm] = useState({
        descricao: '',
        categoria: '',
        cliente: '',
        duracao: '',
        obs: '',
        apontado: false
    });

    const [editForm, setEditForm] = useState({
        descricao: '',
        categoria: '',
        cliente: '',
        duracao: '',
        obs: '',
        apontado: false
    });

    useEffect(() => {
        carregarDias();
        carregarClientes();
        carregarCategorias();
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const carregarDias = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await diasAPI.getAll();
            setDias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar dias:', err);
            setError('Erro ao carregar dados: ' + err.message);
            setDias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarClientes = async () => {
        try {
            const data = await clientesAPI.getNomes();
            setClientes(data);
        } catch (err) {
            console.error('Erro ao carregar clientes:', err);
        }
    };

    const carregarCategorias = async () => {
        try {
            const data = await categoriasAPI.getAll();
            setCategorias(data);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
        }
    };

    const criarOuCarregarDia = async (data) => {
        try {
            setLoading(true);
            setError('');
            const dia = await diasAPI.createOrLoad(data);
            setSelectedDia(dia);
            setView('detalhes');
            await carregarDias();
        } catch (err) {
            console.error('Erro ao criar/carregar dia:', err);
            setError('Erro ao carregar dia: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const atualizarTempo = async (campo, valor) => {
        if (!selectedDia) return;

        try {
            const diaAtualizado = await diasAPI.update(selectedDia.id, campo, valor);
            setSelectedDia(diaAtualizado);
            setDias(prev => prev.map(d => d.id === diaAtualizado.id ? diaAtualizado : d));
        } catch (err) {
            console.error('Erro ao atualizar tempo:', err);
            setError('Erro ao atualizar horário: ' + err.message);
        }
    };

    const validarTarefa = (form) => {
        if (!form.descricao?.trim()) {
            setError('Descrição é obrigatória');
            return false;
        }

        const duracao = parseInt(form.duracao);
        if (!form.duracao || isNaN(duracao) || duracao <= 0) {
            setError('Duração é obrigatória e deve ser maior que 0');
            return false;
        }

        return true;
    };

    const adicionarTarefa = async () => {
        if (!selectedDia) {
            setError('Nenhum dia selecionado');
            return;
        }

        if (!validarTarefa(novaTaskForm)) return;

        const novaTask = {
            descricao: novaTaskForm.descricao.trim().toUpperCase(),
            categoria: novaTaskForm.categoria || null,
            cliente: novaTaskForm.cliente || '',
            duracaoMin: parseInt(novaTaskForm.duracao),
            obs: novaTaskForm.obs || '',
            apontado: novaTaskForm.apontado
        };

        try {
            setSavingTask(true);
            setError('');
            await tarefasAPI.create(selectedDia.id, novaTask);

            const dia = await diasAPI.getById(selectedDia.id);
            setSelectedDia(dia);
            setDias(prev => prev.map(d => d.id === dia.id ? dia : d));

            setNovaTaskForm({ descricao: '', categoria: '', cliente: '', duracao: '', obs: '', apontado: false });
        } catch (err) {
            console.error('Erro ao adicionar tarefa:', err);
            setError('Erro ao adicionar tarefa: ' + err.message);
        } finally {
            setSavingTask(false);
        }
    };

    const removerTarefa = async (taskId) => {
        if (!confirm('Tem certeza que deseja remover esta tarefa?')) return;

        try {
            setError('');
            await tarefasAPI.delete(taskId);

            const dia = await diasAPI.getById(selectedDia.id);
            setSelectedDia(dia);
            setDias(prev => prev.map(d => d.id === dia.id ? dia : d));
        } catch (err) {
            console.error('Erro ao remover tarefa:', err);
            setError('Erro ao remover tarefa: ' + err.message);
        }
    };

    const iniciarEdicao = (tarefa) => {
        setEditingTask(tarefa.id);
        setEditForm({
            descricao: tarefa.descricao || '',
            categoria: tarefa.categoria || '',
            cliente: tarefa.cliente || '',
            duracao: tarefa.duracaoMin ? tarefa.duracaoMin.toString() : '',
            obs: tarefa.obs || '',
            apontado: tarefa.apontado || false
        });
        setError('');
    };

    const cancelarEdicao = () => {
        setEditingTask(null);
        setEditForm({ descricao: '', categoria: '', cliente: '', duracao: '', obs: '', apontado: false });
        setError('');
    };

    const atualizarTarefa = async (taskId) => {
        if (!validarTarefa(editForm)) return;

        const updates = {
            descricao: editForm.descricao.trim().toUpperCase(),
            categoria: editForm.categoria || null,
            cliente: editForm.cliente || '',
            duracaoMin: parseInt(editForm.duracao),
            obs: editForm.obs || '',
            apontado: editForm.apontado
        };

        try {
            setSavingTask(true);
            setError('');
            await tarefasAPI.update(taskId, updates);

            const dia = await diasAPI.getById(selectedDia.id);
            setSelectedDia(dia);
            setDias(prev => prev.map(d => d.id === dia.id ? dia : d));

            cancelarEdicao();
        } catch (err) {
            console.error('Erro ao atualizar tarefa:', err);
            setError('Erro ao atualizar tarefa: ' + err.message);
        } finally {
            setSavingTask(false);
        }
    };

    const excluirDia = async (diaId) => {
        if (!confirm('Tem certeza que deseja excluir este dia? Esta ação não pode ser desfeita.')) return;

        try {
            setError('');
            await diasAPI.delete(diaId);
            await carregarDias();

            if (selectedDia?.id === diaId) {
                setSelectedDia(null);
                setView('home');
            }
        } catch (err) {
            console.error('Erro ao excluir dia:', err);
            setError('Erro ao excluir dia: ' + err.message);
        }
    };

    const exportarExcel = async (mes, ano) => {
        try {
            setExporting(true);
            setError('');

            const blob = await exportAPI.excel(mes, ano);

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Apontamentos_${mes.toString().padStart(2, '0')}_${ano}.xlsx`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(downloadUrl);

            alert('Planilha exportada com sucesso!');
        } catch (err) {
            console.error('Erro ao exportar:', err);
            setError('Erro ao exportar planilha: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const formatarDuracao = useCallback((min) => {
        if (!min || min === 0) return '0h00m';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h}h${m.toString().padStart(2, '0')}m`;
    }, []);

    const calcularHorasTrabalhadas = useCallback((dia) => {
        if (!dia.inicioTrabalho || !dia.fimTrabalho) return '00:00';

        try {
            const inicio = new Date(`2000-01-01T${dia.inicioTrabalho}`);
            const fim = new Date(`2000-01-01T${dia.fimTrabalho}`);

            let minutos = (fim - inicio) / 60000;

            if (dia.inicioAlmoco && dia.fimAlmoco) {
                const almIn = new Date(`2000-01-01T${dia.inicioAlmoco}`);
                const almFim = new Date(`2000-01-01T${dia.fimAlmoco}`);
                minutos -= (almFim - almIn) / 60000;
            }

            if (minutos < 0) return '00:00';

            const h = Math.floor(minutos / 60);
            const m = Math.floor(minutos % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        } catch {
            return '00:00';
        }
    }, []);

    const calcularTotalTarefas = useCallback((tarefas) => {
        if (!tarefas || tarefas.length === 0) return '0h00m';
        const total = tarefas.reduce((acc, t) => acc + (t.duracaoMin || 0), 0);
        return formatarDuracao(total);
    }, [formatarDuracao]);

    const calcularTotalTarefasApontadas = useCallback((tarefas) => {
        if (!Array.isArray(tarefas) || tarefas.length === 0) {
            return '0h00m';
        }

        const totalMinutos = tarefas
            .filter(tarefa => tarefa.apontado === true)
            .reduce((acc, tarefa) => acc + (tarefa.duracaoMin ?? 0), 0);

        return formatarDuracao(totalMinutos);
    }, [formatarDuracao]);

    const obterDataFormatada = useCallback((dia) => {
        return dia.dataFormatada || dia.data || '(sem data)';
    }, []);

    const handleKeyPress = (e, callback) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            callback();
        }
    };

    const handleVoltar = useCallback(() => {
        setView('home');
        setSelectedDia(null);
        setEditingTask(null);
        setError('');
    }, []);

    const diasRecentes = useMemo(() => dias.slice(-10).reverse(), [dias]);

    return (
        <div className="app-container">
            <Header view={view} onVoltar={handleVoltar} />
            <ErrorAlert error={error} onClose={() => setError('')} />

            <main className="main-content">
                {view === 'home' && (
                    <div className="home-grid">
                        <SeletorData onSelecionar={criarOuCarregarDia} loading={loading} />
                        <ExportarExcel onExportar={exportarExcel} exporting={exporting} />

                        <section className="card">
                            <h2 className="section-title">
                                <div className="section-icon">
                                    <Clock className="icon-lg" />
                                </div>
                                Dias Recentes
                            </h2>
                            {loading ? (
                                <div className="loading-container">
                                    <div className="spinner spinner-lg"></div>
                                    <span className="loading-text">Carregando...</span>
                                </div>
                            ) : dias.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar className="empty-state-icon" />
                                    <p className="empty-state-title">Nenhum dia registrado ainda</p>
                                    <p className="empty-state-subtitle">Clique em "Hoje" ou selecione uma data acima</p>
                                </div>
                            ) : (
                                <div className="dias-list">
                                    {diasRecentes.map((dia) => (
                                        <DiaCard
                                            key={dia.id}
                                            dia={dia}
                                            onSelecionar={(d) => {
                                                setSelectedDia(d);
                                                setView('detalhes');
                                            }}
                                            onExcluir={excluirDia}
                                            calcularHorasTrabalhadas={calcularHorasTrabalhadas}
                                            calcularTotalTarefas={calcularTotalTarefas}
                                            obterDataFormatada={obterDataFormatada}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {view === 'detalhes' && selectedDia && (
                    <div className="detalhes-grid">
                        <section className="card">
                            <h2 className="section-title">
                                <div className="section-icon">
                                    <Clock className="icon-lg" />
                                </div>
                                Horários - {obterDataFormatada(selectedDia)}
                            </h2>

                            <div className="horarios-grid">
                                <div className="form-group">
                                    <label className="form-label">Início do Trabalho</label>
                                    <input
                                        type="time"
                                        value={selectedDia.inicioTrabalho || ''}
                                        onChange={(e) => atualizarTempo('inicioTrabalho', e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fim do Trabalho</label>
                                    <input
                                        type="time"
                                        value={selectedDia.fimTrabalho || ''}
                                        onChange={(e) => atualizarTempo('fimTrabalho', e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Início do Almoço</label>
                                    <input
                                        type="time"
                                        value={selectedDia.inicioAlmoco || ''}
                                        onChange={(e) => atualizarTempo('inicioAlmoco', e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fim do Almoço</label>
                                    <input
                                        type="time"
                                        value={selectedDia.fimAlmoco || ''}
                                        onChange={(e) => atualizarTempo('fimAlmoco', e.target.value)}
                                        className="input"
                                    />
                                </div>
                            </div>

                            {selectedDia.inicioTrabalho && selectedDia.fimTrabalho && (
                                <div className="horas-summary">
                                    <p className="horas-summary-text">
                                        Horas Trabalhadas: {calcularHorasTrabalhadas(selectedDia)}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="card">
                            <div className="tarefas-header">
                                <h2 className="section-title">
                                    <div className="section-icon">
                                        <CheckSquare className="icon-lg" />
                                    </div>
                                    Tarefas
                                </h2>
                                {selectedDia.tarefas && selectedDia.tarefas.length > 0 && (
                                    <div className="tarefas-total-wrapper">
                                        <div className="tarefas-total">
                                            <p className="tarefas-total-label">Total:</p>
                                            <p className="tarefas-total-value">
                                                {calcularTotalTarefas(selectedDia.tarefas)}
                                            </p>
                                        </div>

                                        <div className="tarefas-total">
                                            <p className="tarefas-total-label">Total apontado:</p>
                                            <p className="tarefas-total-value">
                                                {calcularTotalTarefasApontadas(selectedDia.tarefas)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>

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
                                        onKeyPress={(e) => handleKeyPress(e, adicionarTarefa)}
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
                                        {categorias.map((categoria) => (
                                            <option key={categoria} value={categoria}>
                                                {categoria.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={novaTaskForm.cliente}
                                        onChange={(e) => setNovaTaskForm({ ...novaTaskForm, cliente: e.target.value })}
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
                                        value={novaTaskForm.duracao}
                                        onChange={(e) => setNovaTaskForm({ ...novaTaskForm, duracao: e.target.value })}
                                        onKeyPress={(e) => handleKeyPress(e, adicionarTarefa)}
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

                                <button
                                    onClick={adicionarTarefa}
                                    disabled={savingTask}
                                    className="btn btn-primary btn-block"
                                >
                                    {savingTask ? (
                                        <>
                                            <div className="spinner"></div>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="icon-md" />
                                            Adicionar Tarefa
                                        </>
                                    )}
                                </button>
                            </div>

                            {selectedDia.tarefas && selectedDia.tarefas.length > 0 ? (
                                <div className="tarefas-list">
                                    {selectedDia.tarefas.map((tarefa) => (
                                        <TaskCard
                                            key={tarefa.id}
                                            tarefa={tarefa}
                                            onEditar={iniciarEdicao}
                                            onRemover={removerTarefa}
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
                )}
            </main>
        </div>
    );
}

export default LandingPage;