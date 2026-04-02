import { FEATURES, MENSAGENS_ERRO } from '@constants'
import { toast } from 'react-toastify'

/**
 * Handler centralizado de erros da API
 * Lida com diferentes tipos de erro (rede, servidor, validação, etc)
 */

const log = (message, error) => {
    if (FEATURES.LOGS_HABILITADOS) {
        console.error(`[API ERROR] ${message}`, error)
    }
}

/**
 * Mapeia status HTTP para mensagens amigáveis
 * @param {number} status - Status HTTP
 * @param {string} data - Response data
 * @returns {string} Mensagem tratada
 */
const getMensagemPorStatus = (status, data) => {
    const mensagem = data?.message || data?.mensagem || data?.error

    switch (status) {
        case 400:
            return mensagem || MENSAGENS_ERRO.VALIDAÇÃO
        case 401:
            return mensagem || MENSAGENS_ERRO.NÃO_AUTORIZADO
        case 403:
            return MENSAGENS_ERRO.NÃO_AUTORIZADO
        case 404:
            return MENSAGENS_ERRO.NÃO_ENCONTRADO
        case 500:
        case 502:
        case 503:
            return MENSAGENS_ERRO.SERVIDOR
        case 504:
            return MENSAGENS_ERRO.TIMEOUT
        default:
            return MENSAGENS_ERRO.DESCONHECIDO
    }
}

/**
 * Tratamento centralizado de erros de API
 * @param {Error} error - Erro capturado
 * @param {Object} options - Opções { showToast, return }
 * @returns {Object} { mensagem, status, detalhes }
 */
export const handleApiError = (error, options = {}) => {
    const { showToast = true, returnError = true } = options

    let mensagem, status, detalhes

    // Erro de resposta HTTP (4xx, 5xx)
    if (error.response) {
        status = error.response.status
        mensagem = getMensagemPorStatus(status, error.response.data)
        detalhes = error.response.data

        log(`HTTP ${status}:`, detalhes)

        // Casos especiais
        if (status === 401) {
            // TODO: Limpar autenticação e redirecionar
            // store.dispatch(logout())
        }
    }
    // Erro de timeout
    else if (error.code === 'ECONNABORTED') {
        mensagem = MENSAGENS_ERRO.TIMEOUT
        log('Timeout na requisição', error.message)
    }
    // Erro de conexão
    else if (error.message === 'Network Error' || !window.navigator.onLine) {
        mensagem = MENSAGENS_ERRO.REDE
        log('Erro de rede', error.message)
    }
    // Erro desconhecido
    else {
        mensagem = MENSAGENS_ERRO.DESCONHECIDO
        log('Erro desconhecido', error.message)
    }

    // Exibir toast se solicitado
    if (showToast) {
        toast.error(mensagem, {
            position: 'bottom-right',
            autoClose: 5000
        })
    }

    // Retornar erro estruturado
    if (returnError) {
        return {
            mensagem,
            status: status || error.code,
            detalhes: detalhes || error.message,
            original: error
        }
    }

    return null
}

/**
 * Wrapper para chamadas API com tratamento de erro automático
 * @param {Function} apiCall - Função que faz a chamada à API
 * @param {Object} options - Opções de tratamento
 * @returns {Promise} Resultado da API ou null em caso de erro
 */
export const executeApiCall = async (apiCall, options = {}) => {
    try {
        const result = await apiCall()
        return result
    } catch (error) {
        handleApiError(error, {
            showToast: options.showToast !== false,
            returnError: false
        })
        return null
    }
}

/**
 * Validação de resposta API
 * @param {*} data - Dados a validar
 * @param {string} type - Tipo esperado ('array', 'object', etc)
 * @returns {boolean}
 */
export const validateResponse = (data, type = 'object') => {
    if (!data) return false

    if (type === 'array' && !Array.isArray(data)) return false
    if (type === 'object' && typeof data !== 'object') return false

    return true
}
