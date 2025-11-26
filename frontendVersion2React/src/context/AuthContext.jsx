import { createContext, useState, useContext, useEffect } from 'react';
import { useModal } from './ModalContext';
import { API_BASE_URL } from '../services/config';

const AuthContext = createContext();

function AuthProvider({ children }) {

  const { openModal } = useModal();
  // Guardamos el token y la información del usuario en el estado.
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  // isLoading nos ayuda a saber si estamos verificando el token inicial.
  const [isLoading, setIsLoading] = useState(true);

  // useEffect se ejecutará una vez al cargar la app para verificar el token.
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
      }
      setIsLoading(false);
    };
    verifyToken();
  }, []);

  // Función de Login: llama a la API y guarda el token en el estado y localStorage.
  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { token: authToken } = await response.json();
      localStorage.setItem('authToken', authToken);
      setToken(authToken); // Actualizar el estado
      return true;
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const register = async (name, email, password) => {
    const registerUrl = `${API_BASE_URL}/auth/register`;

    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      // Si el registro es exitoso en el backend (código 200),
      // abrimos el modal de verificación.
      openModal('verifyEmail', { email: email });
      return true;

    } else if (response.status === 409) {
      throw new Error('El correo electrónico ya está registrado.');
    } else {
      throw new Error('Ocurrió un error durante el registro.');
    }
  };

  // Función de Logout: limpia el estado y el localStorage.
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null); // Actualizar el estado
  };

  // Determinamos si el usuario está autenticado basándonos en si existe el token.
  const isLoggedIn = !!token;

  // El valor que compartiremos con todos los componentes hijos.
  const value = {
    isLoggedIn,
    token,
    login,
    logout,
    isLoading,
    register,
  };

  // El proveedor envuelve a los "children" 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Creamos un "Hook" personalizado para consumir el contexto fácilmente.
// En lugar de importar `useContext` y `AuthContext` en cada componente,
function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };