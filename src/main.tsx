import React from 'react';
import ReactDOM from 'react-dom/client';
import {ProductionApp} from './ProductionApp';
import './styles.css';
import './redesign.css';
import './mobile.css';
import './nav-experience.css';
import './backend-status.css';
import './production-app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductionApp />
  </React.StrictMode>,
);
