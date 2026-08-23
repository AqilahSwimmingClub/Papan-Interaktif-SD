import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/base.css';

const wadah = document.getElementById('root');
if (!wadah) {
  throw new Error('Elemen #root tidak ditemukan di index.html.');
}

createRoot(wadah).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
