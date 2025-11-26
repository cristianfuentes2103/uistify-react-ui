import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import './assets/css/styles.css';
import { PlayerProvider } from './context/PlayerContext'; 
import { BrowserRouter } from 'react-router-dom';
import { PlaylistProvider } from './context/PlaylistContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <ModalProvider>
        <AuthProvider>
          <PlayerProvider>
            <PlaylistProvider> 
            <App />
            </PlaylistProvider>
          </PlayerProvider>
        </AuthProvider>
      </ModalProvider>
    </BrowserRouter>
  </React.StrictMode>,
);