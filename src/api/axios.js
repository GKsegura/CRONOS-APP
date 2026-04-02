import { API_CONFIG } from '@constants'
import axios from 'axios'
import { handleApiError } from './errorHandler'

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor de resposta com tratamento de erro centralizado
api.interceptors.response.use(
    (response) => response,
    (error) => {
        handleApiError(error)
        return Promise.reject(error)
    }
)

export default api