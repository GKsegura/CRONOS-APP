import { LandingPage } from '@pages/index';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/components.css'; // Classes utilitárias
import './styles/style.css'; // Este já importa o variables.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
)