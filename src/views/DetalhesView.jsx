import { diasAPI } from '@api';
import { BacklogPanel, InputHora, TaskCard } from '@components';
import { useTaskForm } from '@hooks/useTaskForm';
import {
    calcularHorasTrabalhadas,
    calcularTotalTarefas,
    calcularTotalTarefasApontadas,
    converterHorasParaMinutos,
    formatarDuracao,
    obterDataFormatada,
    ordenarTarefas,
    sugerirHorariosPorFimAlmoco,
    sugerirHorariosPorInicio,
    sugerirHorariosPorInicioAlmoco,
    temTarefaPadrao
} from '@utils';
import { CheckSquare, Clock, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import './DetalhesView.css';

const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        callback();
    }
};

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const [reescrevendoIA, setReescrevendoIA] = useState(false);
    const [statusIA, setStatusIA] = useState('');

    const taskForm = useTaskForm({
        selectedDia,
        setSelectedDia,
        atualizarDiaLocal,
        setError,
    });

    const {
        novaTaskForm,
        setNovaTaskForm,
        editForm,
        setEditForm,
        editingTask,
        savingTask,
        updatingTaskId,
        adicionarTarefa,
        atualizarTarefa,
        removerTarefa,
        handleToggleApontado,
        iniciarEdicao,
        cancelarEdicao,
    } = taskForm;

    const atualizarTempo = async (campo, valor) => {
        try {
            let diaAtualizado = await diasAPI.update(selectedDia.id, campo, valor);

            if (campo === 'inicioTrabalho') {
                const sugestao = sugerirHorariosPorInicio(valor);

                if (sugestao) {
                    if (!selectedDia.inicioAlmoco) {
                        diaAtualizado = await diasAPI.update(selectedDia.id, 'inicioAlmoco', sugestao.inicioAlmoco);
                    }

                    if (!selectedDia.fimAlmoco) {
                        diaAtualizado = await diasAPI.update(selectedDia.id, 'fimAlmoco', sugestao.fimAlmoco);
                    }

                    if (!selectedDia.fimTrabalho) {
                        diaAtualizado = await diasAPI.update(selectedDia.id, 'fimTrabalho', sugestao.fimTrabalho);
                    }
                }
            }

            if (campo === 'inicioAlmoco') {
                const sugestao = sugerirHorariosPorInicioAlmoco(valor);

                if (sugestao) {
                    if (!selectedDia.fimAlmoco) {
                        diaAtualizado = await diasAPI.update(selectedDia.id, 'fimAlmoco', sugestao.fimAlmoco);
                    }

                    if (!selectedDia.fimTrabalho) {
                        diaAtualizado = await diasAPI.update(selectedDia.id, 'fimTrabalho', sugestao.fimTrabalho);
                    }
                }
            }

            if (campo === 'fimAlmoco') {
                const sugestao = sugerirHorariosPorFimAlmoco(valor);

                if (sugestao && !selectedDia.fimTrabalho) {
                    diaAtualizado = await diasAPI.update(selectedDia.id, 'fimTrabalho', sugestao.fimTrabalho);
                }
            }

            setSelectedDia(diaAtualizado);
            atualizarDiaLocal(diaAtualizado);
        } catch (err) {
            setError('Erro ao atualizar horário: ' + err.message);
        }
    };

    const chamarIA = async (texto, modelo) => {
        const response = await fetch('http://localhost:8080/api/ia/reescrever', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, modelo }),
        });

        if (!response.ok) {
            throw new Error('Falha na chamada da IA');
        }

        const data = await response.json();
        return data.texto;
    };

    const chamarIAComTentativas = async (texto) => {
        const modelos = [
            { nome: 'gemini-2.5-flash', label: 'modelo principal' },
            { nome: 'gemini-2.5-flash-lite', label: 'modelo leve' },
        ];

        for (let indiceModelo = 0; indiceModelo < modelos.length; indiceModelo++) {
            const modelo = modelos[indiceModelo];

            if (indiceModelo > 0) {
                setStatusIA('Modelo principal indisponível. Tentando com o modelo leve...');
                await esperar(800);
            }

            for (let tentativa = 1; tentativa <= 3; tentativa++) {
                try {
                    setStatusIA(`Reescrevendo com ${modelo.label}... tentativa ${tentativa}/3`);

                    const textoReescrito = await chamarIA(texto, modelo.nome);

                    setStatusIA('Observação reescrita com sucesso.');
                    return textoReescrito;
                } catch (err) {
                    if (tentativa < 3) {
                        setStatusIA(`A IA não respondeu agora. Nova tentativa ${tentativa + 1}/3 em instantes...`);
                        await esperar(tentativa * 1200);
                    }
                }
            }
        }

        throw new Error('A IA está temporariamente indisponível. Tente novamente mais tarde.');
    };

    const limparStatusIADepois = () => {
        setTimeout(() => {
            setStatusIA('');
        }, 3500);
    };

    const reescreverObservacaoComIA = async () => {
        const texto = novaTaskForm.obs?.trim();

        if (!texto) {
            setError('Informe uma observação antes de usar a IA.');
            return;
        }

        try {
            setReescrevendoIA(true);
            setStatusIA('Preparando reescrita da observação...');

            const textoReescrito = await chamarIAComTentativas(texto);

            setNovaTaskForm((prev) => ({
                ...prev,
                obs: textoReescrito,
            }));
        } catch (err) {
            setError(err.message || 'Não foi possível reescrever a observação com IA.');
            setStatusIA('Não foi possível usar a IA no momento. Tente novamente mais tarde.');
        } finally {
            setReescrevendoIA(false);
            limparStatusIADepois();
        }
    };

    const reescreverObservacaoEdicaoComIA = async () => {
        const texto = editForm.obs?.trim();

        if (!texto) {
            setError('Informe uma observação antes de usar a IA.');
            return;
        }

        try {
            setReescrevendoIA(true);
            setStatusIA('Preparando reescrita da observação...');

            const textoReescrito = await chamarIAComTentativas(texto);

            setEditForm((prev) => ({
                ...prev,
                obs: textoReescrito,
            }));
        } catch (err) {
            setError(err.message || 'Não foi possível reescrever a observação com IA.');
            setStatusIA('Não foi possível usar a IA no momento. Tente novamente mais tarde.');
        } finally {
            setReescrevendoIA(false);
            limparStatusIADepois();
        }
    };

    const horasTrabalhadas = calcularHorasTrabalhadas(selectedDia);
    const tarefasOrdenadas = ordenarTarefas(selectedDia.tarefas || []);
    const totalRegistrado = calcularTotalTarefas(selectedDia.tarefas || []);
    const totalApontado = calcularTotalTarefasApontadas(selectedDia.tarefas || []);

    return (
        <div className="detalhes-grid">
            <BacklogPanel diaAtualId={selectedDia.id} onTarefaConvertida={onTarefaConvertida} />

            <section className="card">
                <h2 className="section-title">
                    <div className="section-icon">
                        <Clock className="icon-lg" />
                    </div>
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
                            <InputHora
                                value={selectedDia[campo] || ''}
                                onChange={(valor) => atualizarTempo(campo, valor)}
                                className="input"
                            />
                        </div>
                    ))}
                </div>

                {selectedDia.inicioTrabalho && selectedDia.fimTrabalho && (
                    <div className="horas-summary">
                        <p className="horas-summary-text">Horas Trabalhadas: {horasTrabalhadas}</p>

                        {(() => {
                            const minutosTrabalho = converterHorasParaMinutos(horasTrabalhadas);
                            const minutosTarefas =
                                selectedDia.tarefas?.reduce((acc, t) => acc + (t.duracaoMin || 0), 0) || 0;
                            const minutosFaltantes = minutosTrabalho - minutosTarefas;
                            const tarefaPadrao = temTarefaPadrao(selectedDia);

                            return minutosFaltantes > 0 && !tarefaPadrao && (
                                <button
                                    onClick={() => onAdicionarTarefaPadrao(selectedDia)}
                                    className="btn-adicionar-padrao-detalhes"
                                >
                                    <Plus className="icon-sm" />
                                    Atividade Padrão
                                </button>
                            );
                        })()}
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

                    <div className="tarefas-resumo-dia">
                        <span>Total registrado: {totalRegistrado}</span>
                        <span>Total apontado: {totalApontado}</span>
                    </div>
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
                            <option value="">Categoria</option>
                            {categorias.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={novaTaskForm.cliente}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, cliente: e.target.value })}
                            disabled={savingTask}
                            className="select"
                        >
                            <option value="">Cliente</option>
                            {clientes.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Duração Ex: 1h00, 00h30 ou 90"
                            value={novaTaskForm.duracao}
                            onChange={(e) => setNovaTaskForm({ ...novaTaskForm, duracao: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, adicionarTarefa)}
                            disabled={savingTask}
                            className="input"
                        />
                    </div>

                    <textarea
                        placeholder="Observações"
                        value={novaTaskForm.obs}
                        onChange={(e) => setNovaTaskForm({ ...novaTaskForm, obs: e.target.value })}
                        disabled={savingTask || reescrevendoIA}
                        rows="3"
                        className="textarea"
                    />

                    <div className="ia-actions">
                        <button
                            type="button"
                            onClick={reescreverObservacaoComIA}
                            disabled={savingTask || reescrevendoIA || !novaTaskForm.obs?.trim()}
                            className="btn-reescrever-ia"
                            title="Reescrever observação com IA"
                        >
                            {reescrevendoIA ? (
                                <>
                                    <div className="spinner" />
                                    Reescrevendo...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="icon-sm" />
                                    Reescrever observação com IA
                                </>
                            )}
                        </button>
                    </div>

                    {statusIA && (
                        <p className="ia-status">
                            {statusIA}
                        </p>
                    )}

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
                                <div className="spinner" />
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

                <div className="tarefas-list">
                    {tarefasOrdenadas?.map((tarefa) => (
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
                            onReescreverObservacaoIA={reescreverObservacaoEdicaoComIA}
                            reescrevendoIA={reescrevendoIA}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DetalhesView;
