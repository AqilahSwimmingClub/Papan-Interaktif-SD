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

// Runtime shell dicache hanya pada build produksi agar HMR pengembangan tidak
// tertahan service worker. Seluruh data aplikasi tetap berada di IndexedDB.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
