import { LandingPage } from '@pages/index'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import AppProvider from './AppProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <LandingPage />
    <ToastContainer position="top-right" autoClose={2000} />
  </AppProvider>
)