import { ThemeProvider } from '@context/ThemeContext'
import '@styles/components.css'
import '@styles/style.css'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'

/**
 * Provider centralizado para todas as dependências globais
 * Inclui: Zustand Store (automático), ThemeContext, e CSS globals
 */
export const AppProvider = ({ children }) => (
    <React.StrictMode>
        <ThemeProvider>
            {children}
        </ThemeProvider>
    </React.StrictMode>
)

export default AppProvider
