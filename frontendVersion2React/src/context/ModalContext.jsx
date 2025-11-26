import { createContext, useState, useContext } from 'react';
// Lógica de ShowToast
const showToast = (message, type = 'info', duration = 3000) => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
};

const ModalContext = createContext();

function ModalProvider({ children }) {
const [modalState, setModalState] = useState({ view: null, data: null, props: {} });
const openModal = (view, data = null, props = {}) => setModalState({ view, data, props });
const closeModal = () => setModalState({ view: null, data: null, props: {} });
const value = { modalView: modalState.view, modalData: modalState.data, modalProps: modalState.props, openModal, closeModal, showToast };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

function useModal() {
  return useContext(ModalContext);
}

export { ModalProvider, useModal };