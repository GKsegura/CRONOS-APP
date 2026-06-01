import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Store centralizado da aplicação CRONOS
 * Gerencia: dias, tarefas, filtros, tema
 */

/**
 * Helper para adicionar snapshot ao histórico
 */
const addToHistory = (set, get, newState) => {
    const state = get()
    // Remover histórico futuro se não estamos no final
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push({
        dias: newState.dias,
        timestamp: Date.now(),
    })
    // Limitar a 50 snapshots
    if (newHistory.length > 50) newHistory.shift()

    const newIndex = newHistory.length - 1

    set({
        ...newState,
        history: newHistory,
        historyIndex: newIndex,
        lastAction: newState.lastAction || 'modificação',
        canUndo: newIndex > 0,
        canRedo: false, // Sempre false após uma ação nova
    })
}

const store = (set, get) => ({
    // ========== HISTÓRICO (UNDO/REDO) ==========
    history: [],
    historyIndex: -1,
    lastAction: '',
    canUndo: false,
    canRedo: false,

    updateHistoryFlags: () => {
        const state = get()
        set({
            canUndo: state.historyIndex > 0,
            canRedo: state.historyIndex < state.history.length - 1,
        })
    },

    undo: () => {
        const state = get()
        if (state.historyIndex <= 0) return

        const newIndex = state.historyIndex - 1
        const snapshot = state.history[newIndex]

        set({
            dias: snapshot.dias,
            historyIndex: newIndex,
            lastAction: `Desfazer: ${state.lastAction}`,
            canUndo: newIndex > 0,
            canRedo: newIndex < state.history.length - 1,
        })
    },

    redo: () => {
        const state = get()
        if (state.historyIndex >= state.history.length - 1) return

        const newIndex = state.historyIndex + 1
        const snapshot = state.history[newIndex]

        set({
            dias: snapshot.dias,
            historyIndex: newIndex,
            lastAction: `Refazer: ${state.lastAction}`,
            canUndo: newIndex > 0,
            canRedo: newIndex < state.history.length - 1,
        })
    },

    // ========== DIAS ==========
    dias: [],
    setDias: (dias) => set({ dias }),

    addDia: (dia) => addToHistory(set, get, {
        dias: [...get().dias, dia],
        lastAction: `Adicionar dia ${dia.data}`
    }),

    updateDia: (id, updates) => addToHistory(set, get, {
        dias: get().dias.map((d) => d.id === id ? { ...d, ...updates } : d),
        lastAction: `Atualizar dia ${id}`
    }),

    removeDia: (id) => addToHistory(set, get, {
        dias: get().dias.filter((d) => d.id !== id),
        lastAction: `Remover dia`
    }),

    // ========== TAREFAS ==========
    tarefas: [],
    setTarefas: (tarefas) => set({ tarefas }),

    addTarefa: (diaId, tarefa) => addToHistory(set, get, {
        dias: get().dias.map((d) =>
            d.id === diaId
                ? { ...d, tarefas: [...(d.tarefas || []), tarefa] }
                : d
        ),
        lastAction: `Adicionar tarefa`
    }),

    updateTarefa: (diaId, tarefaId, updates) => addToHistory(set, get, {
        dias: get().dias.map((d) =>
            d.id === diaId
                ? {
                    ...d,
                    tarefas: d.tarefas.map((t) =>
                        t.id === tarefaId ? { ...t, ...updates } : t
                    )
                }
                : d
        ),
        lastAction: `Atualizar tarefa`
    }),

    removeTarefa: (diaId, tarefaId) => addToHistory(set, get, {
        dias: get().dias.map((d) =>
            d.id === diaId
                ? { ...d, tarefas: d.tarefas.filter((t) => t.id !== tarefaId) }
                : d
        ),
        lastAction: `Remover tarefa`
    }),

    // ========== FILTROS ==========
    filtros: {
        status: 'todos', // 'todos', 'pendentes', 'completos'
        busca: '',
        mes: new Date().getMonth(),
        ano: new Date().getFullYear()
    },

    setFiltros: (filtros) => set((state) => ({
        filtros: { ...state.filtros, ...filtros }
    })),

    setStatusFiltro: (status) => set((state) => ({
        filtros: { ...state.filtros, status }
    })),

    setBuscaFiltro: (busca) => set((state) => ({
        filtros: { ...state.filtros, busca }
    })),

    // ========== TEMA ==========
    tema: 'default',
    setTema: (tema) => set({ tema }),

    // ========== BACKLOG ==========
    backlog: [],
    setBacklog: (backlog) => set({ backlog }),

    addBacklogItem: (item) => set((state) => ({
        backlog: [...state.backlog, item]
    })),

    removeBacklogItem: (id) => set((state) => ({
        backlog: state.backlog.filter((item) => item.id !== id)
    })),

    // ========== LOADING & ERROS ==========
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),

    erro: null,
    setErro: (erro) => set({ erro }),
    limparErro: () => set({ erro: null }),

    // ========== SELECTED DIA ==========
    diaAtual: null,
    setDiaAtual: (dia) => set({ diaAtual: dia }),
})

export const useStore = create(
    devtools(
        persist(store, {
            name: 'cronos-store',
            version: 1,
            // Apenas tema e backlog são persistidos
            partialize: (state) => ({
                tema: state.tema,
                backlog: state.backlog
            })
        })
    )
)
