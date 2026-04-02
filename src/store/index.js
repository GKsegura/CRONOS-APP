import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Store centralizado da aplicação CRONOS
 * Gerencia: dias, tarefas, filtros, tema
 */

const store = (set, get) => ({
    // ========== DIAS ==========
    dias: [],
    setDias: (dias) => set({ dias }),

    addDia: (dia) => set((state) => ({
        dias: [...state.dias, dia]
    })),

    updateDia: (id, updates) => set((state) => ({
        dias: state.dias.map((d) => d.id === id ? { ...d, ...updates } : d)
    })),

    removeDia: (id) => set((state) => ({
        dias: state.dias.filter((d) => d.id !== id)
    })),

    // ========== TAREFAS ==========
    tarefas: [],
    setTarefas: (tarefas) => set({ tarefas }),

    addTarefa: (diaId, tarefa) => set((state) => ({
        dias: state.dias.map((d) =>
            d.id === diaId
                ? { ...d, tarefas: [...(d.tarefas || []), tarefa] }
                : d
        )
    })),

    updateTarefa: (diaId, tarefaId, updates) => set((state) => ({
        dias: state.dias.map((d) =>
            d.id === diaId
                ? {
                    ...d,
                    tarefas: d.tarefas.map((t) =>
                        t.id === tarefaId ? { ...t, ...updates } : t
                    )
                }
                : d
        )
    })),

    removeTarefa: (diaId, tarefaId) => set((state) => ({
        dias: state.dias.map((d) =>
            d.id === diaId
                ? { ...d, tarefas: d.tarefas.filter((t) => t.id !== tarefaId) }
                : d
        )
    })),

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
