import { ArrowLeft, Clock } from 'lucide-react';
import './Header.css';

const Header = ({ view, onVoltar }) => (
    <header className="header">
        <div className="header-container">
            <div className="header-content">
                <div className="header-brand">
                    <div className="header-icon">
                        <Clock className="icon" />
                    </div>
                    <h1 className="header-title">CRONOS</h1>
                </div>
                {view !== 'home' && (
                    <button onClick={onVoltar} className="btn-voltar">
                        <ArrowLeft className="icon-sm" />
                        Voltar
                    </button>
                )}
            </div>
        </div>
    </header>
);

export default Header;