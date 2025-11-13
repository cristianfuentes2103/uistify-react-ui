import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null); // Para detectar clics fuera del menú

  // Efecto para cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="user-profile-menu">
      <button onClick={() => setIsOpen(!isOpen)} className="user-avatar-btn">
        <i className="icon-yeti-cs" alt="Menú de usuario"></i>
      </button>
      
      {/* Usamos renderizado condicional para el dropdown */}
      {isOpen && (
        <div className="logout-dropdown">
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;