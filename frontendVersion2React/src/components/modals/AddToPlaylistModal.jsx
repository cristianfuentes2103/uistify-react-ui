import { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function AddToPlaylistModal() {
  const { modalView, modalData, closeModal } = useModal();
  const songToAdd = modalData;

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Para la carga inicial de playlists
  const [isAdding, setIsAdding] = useState(false); // Para la acción de añadir
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // Para el mensaje de feedback

  useEffect(() => {
    // Cuando el modal se abre, cargamos las playlists y reseteamos los estados
    if (modalView === 'addToPlaylist') {
      setIsLoading(true);
      setFeedback({ message: '', type: '' }); // Limpia feedback anterior
      setPlaylists([]);

      const fetchUserPlaylists = async () => {
        try {
          const userPlaylists = await apiFetch('/playlists');
          setPlaylists(userPlaylists);
        } catch (error) {
          console.error("Error al cargar playlists para el modal:", error);
          setFeedback({ message: 'Inicia sesión para agregar canciones a una Playlist.', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserPlaylists();
    } else { setFeedback({ message: '', type: '' });}
  }, [modalView]);

  const handlePlaylistClick = async (playlist) => {
    if (isAdding || !songToAdd) return; 

    setIsAdding(true);
    try {
      await apiFetch(`/playlists/${playlist.id}/songs/${songToAdd.id}`, 'POST');
      setFeedback({ message: `¡Añadida a "${playlist.title}"!`, type: 'success' });
    } catch (error) {
      console.error("Error al añadir la canción:", error);
      setFeedback({ message: 'Esta canción ya está en la playlist.', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  if (modalView !== 'addToPlaylist') {
    return null;
  }
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 style={{ textAlign: 'center'}}>Añadir a la playlist</h2>

        {feedback.message ? (
          <p className={`modal-feedback ${feedback.type}`}>
            {feedback.message}
          </p>
        ) : (
          // --- VISTA DE LISTA DE PLAYLISTS ---
          <div 
            id="modal-playlist-list" 
            className={`modal-playlist-list ${isAdding ? 'is-loading' : ''}`}
          >
         {isLoading ? (
              <div className="modal-list-loader is-loading"></div>
            ) : playlists.length > 0 ? (
              playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="modal-playlist-item"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  {playlist.title}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#b3b3b3' }}>
                No tienes playlists. ¡Crea una primero!
              </p>
            )}
          </div>
        )}
        
        <button 
          id="modal-close-btn" 
          className="modal-close-btn"
          onClick={closeModal}
          // Deshabilitamos el botón mientras se añade la canción
          disabled={isAdding}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;