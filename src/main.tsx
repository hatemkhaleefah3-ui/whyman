import React from 'react';
import ReactDOM from 'react-dom/client';
import { NavExperience } from './NavExperience';
import './styles.css';
import './redesign.css';
import './mobile.css';
import './nav-experience.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NavExperience />
  </React.StrictMode>,
);
