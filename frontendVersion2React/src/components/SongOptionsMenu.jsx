import { useState, useEffect, useRef } from 'react';

// --- Componentes SVG para los iconos ---
const MoreIcon = () => (
  <svg role="img" height="16" width="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
  </svg>
);

const RemoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="#656565">
    <path d="M5.25 3v-.917C5.25.933 6.183 0 7.333 0h1.334c1.15 0 2.083.933 2.083 2.083V3h4.75v1.5h-.972l-1.257 9.544A2.25 2.25 0 0 1 11.041 16H4.96a2.25 2.25 0 0 1-2.23-1.956L1.472 4.5H.5V3zm1.5-.917V3h2.5v-.917a.583.583 0 0 0-.583-.583H7.333a.583.583 0 0 0-.583.583M2.986 4.5l1.23 9.348a.75.75 0 0 0 .744.652h6.08a.75.75 0 0 0 .744-.652L13.015 4.5H2.985z"/>
  </svg>
);

function SongOptionsMenu({ song, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveClick = () => {
    // Llama a la función `onRemove` que le pasará el componente padre
    onRemove(song);
    setIsOpen(false); 
  };

  return (
    <div ref={menuRef} className="song-options-menu">
      <button 
        className="song-options-btn" 
        title="Más opciones" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreIcon />
      </button>

      {/* Menú desplegable condicional */}
      {isOpen && (
        <div className="song-options-dropdown">
          <button className="remove-song-btn" onClick={handleRemoveClick}>
            <RemoveIcon />
            Quitar de esta lista
          </button>
        </div>
      )}
    </div>
  );
}

export default SongOptionsMenu;