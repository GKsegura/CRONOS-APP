import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const TEMAS = [
    { id: 'default', label: 'Verde (padrão)' },
    { id: 'rosa', label: 'Rosa' },
    { id: 'dark', label: 'Escuro' },
    { id: 'dark-rosa', label: 'Escuro Rosa' },
];

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(() => {
        return localStorage.getItem('cronos-tema') || 'default';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (tema === 'default') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', tema);
        }
        localStorage.setItem('cronos-tema', tema);
    }, [tema]);

    return (
        <ThemeContext.Provider value={{ tema, setTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTema() {
    return useContext(ThemeContext);
}