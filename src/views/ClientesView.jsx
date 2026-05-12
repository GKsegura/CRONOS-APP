import { clientesAPI } from '@api';
import { Check, Pencil, Plus, Power, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import './ClientesView.css';

const ClientesView = () => {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [nome, setNome] = useState('');
    const [editando, setEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const carregarClientes = async () => {
        try {
            setLoading(true);
            const data = await clientesAPI.getAll();
            setClientes(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarClientes();
    }, []);

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) return clientes;

        return clientes.filter((cliente) =>
            cliente.nome?.toLowerCase().includes(termo)
        );
    }, [clientes, busca]);

    const limparForm = () => {
        setNome('');
        setEditando(null);
    };

    const iniciarEdicao = (cliente) => {
        setEditando(cliente);
        setNome(cliente.nome);
    };

    const salvarCliente = async (event) => {
        event.preventDefault();

        const nomeTratado = nome.trim();

        if (!nomeTratado) {
            toast.warning('Informe o nome do cliente');
            return;
        }

        try {
            setSaving(true);

            if (editando) {
                await clientesAPI.update(editando.id, nomeTratado);
                toast.success('Cliente atualizado com sucesso');
            } else {
                await clientesAPI.create(nomeTratado);
                toast.success('Cliente cadastrado com sucesso');
            }

            limparForm();
            await carregarClientes();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || 'Erro ao salvar cliente');
        } finally {
            setSaving(false);
        }
    };

    const alternarStatus = async (cliente) => {
        try {
            await clientesAPI.updateStatus(cliente.id, !cliente.ativo);

            toast.success(
                cliente.ativo
                    ? 'Cliente inativado com sucesso'
                    : 'Cliente ativado com sucesso'
            );

            await carregarClientes();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar status do cliente');
        }
    };

    return (
        <section className="clientes-view">
            <div className="clientes-header">
                <div>
                    <h1>Clientes</h1>
                    <p>Cadastre, edite, ative ou inative clientes do Cronos.</p>
                </div>
            </div>

            <div className="clientes-grid">
                <form className="clientes-form-card" onSubmit={salvarCliente}>
                    <h2>{editando ? 'Editar cliente' : 'Novo cliente'}</h2>

                    <input
                        type="text"
                        placeholder="Nome do cliente"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        disabled={saving}
                        className="input"
                    />

                    <div className="clientes-form-actions">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-success"
                        >
                            {editando ? <Check size={16} /> : <Plus size={16} />}
                            {saving ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
                        </button>

                        {editando && (
                            <button
                                type="button"
                                onClick={limparForm}
                                disabled={saving}
                                className="btn btn-secondary"
                            >
                                <X size={16} />
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <div className="clientes-list-card">
                    <div className="clientes-list-top">
                        <div>
                            <h2>Lista de clientes</h2>
                            <span>{clientes.length} cliente(s) cadastrado(s)</span>
                        </div>

                        <div className="clientes-search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="clientes-empty">Carregando clientes...</div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className="clientes-empty">Nenhum cliente encontrado.</div>
                    ) : (
                        <div className="clientes-table-wrapper">
                            <table className="clientes-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {clientesFiltrados.map((cliente) => (
                                        <tr key={cliente.id}>
                                            <td>{cliente.nome}</td>
                                            <td>
                                                <span className={cliente.ativo ? 'badge ativo' : 'badge inativo'}>
                                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="clientes-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => iniciarEdicao(cliente)}
                                                        className="icon-button"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => alternarStatus(cliente)}
                                                        className={`icon-button ${cliente.ativo ? 'danger' : 'success'}`}
                                                        title={cliente.ativo ? 'Inativar' : 'Ativar'}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ClientesView;