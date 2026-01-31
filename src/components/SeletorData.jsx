import { Calendar } from 'lucide-react';
import './SeletorData.css';

const SeletorData = ({ onSelecionar, loading }) => (
    <section className="seletor-data">
        <h2 className="seletor-title">
            <div className="seletor-icon">
                <Calendar className="icon" />
            </div>
            Selecionar Data
        </h2>
        <div className="seletor-actions">
            <button
                onClick={() => onSelecionar(new Date().toLocaleDateString('pt-BR'))}
                disabled={loading}
                className="btn-hoje"
            >
                <Calendar className="icon-md" />
                {loading ? 'Carregando...' : 'Hoje'}
            </button>
            <input
                type="date"
                onChange={(e) => {
                    if (e.target.value) {
                        const data = new Date(e.target.value + 'T00:00:00');
                        onSelecionar(data.toLocaleDateString('pt-BR'));
                    }
                }}
                disabled={loading}
                className="input-date"
            />
        </div>
    </section>
);

export default SeletorData;