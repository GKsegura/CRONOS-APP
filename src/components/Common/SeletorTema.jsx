import { ChevronDown, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TEMAS, useTema } from '../context/ThemeContext';
import '../styles/components.css';
import './SeletorTema.css';

export function SeletorTema() {
    const { tema, setTema } = useTema();
    const [aberto, setAberto] = useState(false);
    const ref = useRef(null);

    const temaAtual = TEMAS.find((t) => t.id === tema);

    // Seleciona o ícone dinamicamente baseado no tema atual
    // Moon para temas escuros, Sun para temas claros
    const IconeTema = tema.includes('dark') ? Moon : Sun;

    useEffect(() => {
        const handleClickFora = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, []);

    return (
        <div className="seletor-tema" ref={ref}>
            <button
                className="seletor-tema-btn"
                onClick={() => setAberto(!aberto)}
            >
                <IconeTema className="icon-sm seletor-tema-icon seletor-tema-icon-dinamico" />
                <span> {temaAtual?.label}</span>
                <ChevronDown className={`icon-sm seletor-tema-chevron ${aberto ? 'aberto' : ''}`} />
            </button>

            {aberto && (
                <div className="seletor-tema-dropdown">
                    {TEMAS.map((t) => (
                        <button
                            key={t.id}
                            className={`seletor-tema-option ${tema === t.id ? 'ativo' : ''}`}
                            onClick={() => { setTema(t.id); setAberto(false); }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}