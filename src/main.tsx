import React from 'react';
import ReactDOM from 'react-dom/client';
import {BackendGate} from './BackendGate';
import './styles.css';
import './redesign.css';
import './mobile.css';
import './nav-experience.css';
import './backend-status.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BackendGate />
  </React.StrictMode>,
);
