import { SeletorTema } from '@components/Common';
import '@styles/components.css';
import { ArrowLeft, Clock } from 'lucide-react';
import './Header.css';

const Header = ({ view, onVoltar, dia }) => (
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