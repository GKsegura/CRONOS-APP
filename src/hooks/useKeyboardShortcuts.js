import { useEffect } from 'react'

/**
 * Hook para gerenciar atalhos de teclado globais
 * @param {Function} onUndo - Callback para Ctrl+Z
 * @param {Function} onRedo - Callback para Ctrl+Y ou Ctrl+Shift+Z
 * @param {Boolean} enabled - Se o hook está ativo
 */
export const useKeyboardShortcuts = (onUndo, onRedo, enabled = true) => {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e) => {
            // Ctrl+Z para undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                onUndo?.()
            }

            // Ctrl+Y ou Ctrl+Shift+Z para redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault()
                onRedo?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [onUndo, onRedo, enabled])
}
