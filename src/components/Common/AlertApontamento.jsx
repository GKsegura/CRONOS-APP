import './AlertApontamento.css';

const AlertApontamento = ({ onClose }) => {
    return (
        <div className="alert-overlay">
            <div className="alert-modal">
                <h2>⚠️ Atenção</h2>

                <p>
                    Você está há alguns dias sem apontar suas horas.
                    <br />
                    Isso pode impactar seus registros e relatórios.
                </p>

                <button onClick={onClose} className="btn btn-primary">
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default AlertApontamento;