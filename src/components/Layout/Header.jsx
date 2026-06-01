import { SeletorTema } from '@components/Common';
import '@styles/components.css';
import { ArrowLeft, Building2, Clock, RotateCcw, RotateCw, Search } from 'lucide-react';
import './Header.css';

const Header = ({
    view,
    onVoltar,
    dia,
    onGoToSearch,
    onGoToClientes,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    lastAction,
}) => (
    <header className="header">
        <div className="header-container">
            <div className="header-content">

                <div className="header-brand">
                    <div className="header-icon">
                        <Clock className="icon" />
                    </div>

                    <div>
                        <h1 className="header-title">CRONOS</h1>

                        {dia && (
                            <span className="header-dia-data">
                                {dia.data}
                            </span>
                        )}
                    </div>
                </div>

                <div className="header-actions">

                    <button
                        onClick={onGoToClientes}
                        className={`btn-search ${view === 'clientes' ? 'active' : ''}`}
                        title="Gerenciar clientes"
                    >
                        <Building2 className="icon-sm" />
                    </button>

                    <button
                        onClick={onGoToSearch}
                        className={`btn-search ${view === 'search' ? 'active' : ''}`}
                        title="Pesquisar tarefas"
                    >
                        <Search className="icon-sm" />
                    </button>

                    {view === 'detalhes' && (
                        <>
                            <button
                                onClick={onUndo}
                                disabled={!canUndo}
                                className="btn-undo-redo"
                                title={canUndo ? `Desfazer: ${lastAction}` : 'Nada para desfazer'}
                            >
                                <RotateCcw className="icon-sm" />
                            </button>

                            <button
                                onClick={onRedo}
                                disabled={!canRedo}
                                className="btn-undo-redo"
                                title={canRedo ? 'Refazer' : 'Nada para refazer'}
                            >
                                <RotateCw className="icon-sm" />
                            </button>
                        </>
                    )}

                    <SeletorTema />

                    {view !== 'home' && (
                        <button onClick={onVoltar} className="btn-voltar">
                            <ArrowLeft className="icon-sm" />
                            Voltar
                        </button>
                    )}

                </div>

            </div>
        </div>
    </header>
);

export default Header;