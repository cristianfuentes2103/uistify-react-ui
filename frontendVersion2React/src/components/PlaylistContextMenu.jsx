import { useEffect, useRef } from 'react';

// El componente recibe la información del menú (si está abierto, su posición)
// y las funciones para manejar las acciones.
function PlaylistContextMenu({ menuData, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose(); // Llama a la función para cerrar que le pasa el padre
      }
    };
    // Añade el listener cuando el menú está abierto
    if (menuData.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Función de limpieza para quitar el listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuData.isOpen, onClose]); // Depende de si está abierto y de la función onClose

  // Si el menú no está abierto, no renderizamos nada
  if (!menuData.isOpen) {
    return null;
  }

  // Estilos en línea para posicionar el menú dinámicamente
  const menuStyle = {
    top: `${menuData.y}px`,
    left: `${menuData.x}px`,
  };

  return (
    <div ref={menuRef} className="context-menu" style={menuStyle}>
      <ul>

        <li onClick={onDelete}>
          {/* SVG de Eliminar */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="#b3b3b3">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8" />
            <path d="M12 8.75H4v-1.5h8z" />
          </svg>
          Eliminar lista
        </li>
      </ul>
    </div>
  );
}

export default PlaylistContextMenu;