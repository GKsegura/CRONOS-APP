import { LandingPage } from '@pages/index';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import './styles/components.css';
import './styles/style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LandingPage />
      <ToastContainer position="top-right" autoClose={2000} />
    </ThemeProvider>
  </React.StrictMode>,
)