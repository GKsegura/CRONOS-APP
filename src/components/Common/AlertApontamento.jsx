import './AlertApontamento.css';

const AlertApontamento = ({ onClose }) => {
    return (
        <div className="alert-overlay" onClick={onClose}>
            <div className="alert-modal" onClick={e => e.stopPropagation()}>
                <div className="alert-icon">
                    <span>⚠️</span>
                </div>

                <h2>Atenção</h2>

                <p>
                    Você está há alguns dias sem apontar suas horas.
                    Isso pode impactar seus registros e relatórios.
                </p>

                <button onClick={onClose} className="btn-entendi">
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default AlertApontamento;