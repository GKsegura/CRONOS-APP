// ========== TEMAS ==========
export const TEMAS = [
    { id: 'default', nome: 'Verde', cores: {} },
    { id: 'rosa', nome: 'Rosa', cores: {} },
    { id: 'dark', nome: 'Escuro', cores: {} },
    { id: 'dark-rosa', nome: 'Escuro Rosa', cores: {} }
]

// ========== STORAGE KEYS ==========
export const STORAGE_KEYS = {
    TEMA: 'cronos-tema',
    STORE: 'cronos-store',
    ÚLTIMAS_TAREFAS: 'cronos-tarefas-cache',
    ÚLTIMOS_CLIENTES: 'cronos-clientes-cache'
}

// ========== API CONFIG ==========
export const API_CONFIG = {
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '5000'),
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
}

// ========== ENDPOINTS ==========
export const ENDPOINTS = {
    DIAS: '/dias',
    TAREFAS: '/tarefas',
    CATEGORIAS: '/categorias',
    CLIENTES: '/clientes',
    BACKLOG: '/backlog',
    EXPORT: '/export'
}

// ========== MENSAGENS DE ERRO ==========
export const MENSAGENS_ERRO = {
    REDE: 'Erro de conexão. Verifique sua internet.',
    SERVIDOR: 'Erro no servidor. Tente novamente mais tarde.',
    VALIDAÇÃO: 'Dados inválidos. Verifique os campos.',
    NÃO_AUTORIZADO: 'Você não tem permissão para fazer isso.',
    NÃO_ENCONTRADO: 'Recurso não encontrado.',
    DESCONHECIDO: 'Erro desconhecido. Tente novamente.',
    TIMEOUT: 'Requisição expirou. Tente novamente.'
}

// ========== STATUS TAREFAS ==========
export const STATUS_TAREFA = {
    PENDENTE: 'pendente',
    COMPLETA: 'completa',
    APONTADA: 'apontada'
}

// ========== VALIDAÇÕES ==========
export const VALIDAÇÕES = {
    DURACAO_MINIMA: 15, // minutos
    DURACAO_MÁXIMA: 480, // 8 horas
    DESCRIÇÃO_MIN: 3,
    DESCRIÇÃO_MAX: 255
}

// ========== FEATURE FLAGS ==========
export const FEATURES = {
    LOGS_HABILITADOS: import.meta.env.VITE_ENABLE_LOGS === 'true',
    DEVTOOLS_HABILITADOS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'
}
