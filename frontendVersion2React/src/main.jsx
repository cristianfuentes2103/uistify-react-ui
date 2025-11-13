import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import './assets/css/styles.css';
import { PlayerProvider } from './context/PlayerContext'; 
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        <ModalProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);