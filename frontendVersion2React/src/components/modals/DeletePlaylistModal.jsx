import { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function DeletePlaylistModal({ onUpdateSuccess }) {
  const { closeModal, modalView, modalData, showToast } = useModal();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const playlistToDelete = modalData;

  const handleDelete = async () => {
    if (!playlistToDelete) return;

    setIsLoading(true);
    try {
      await apiFetch(`/playlists/${playlistToDelete.id}`, 'DELETE');
      
      showToast(`Playlist "${playlistToDelete.title}" eliminada.`, 'success');
      
      if (onUpdateSuccess) {
        onUpdateSuccess(); 
      }
      const currentPath = window.location.pathname;
      const deletedPlaylistPath = `/playlist/${playlistToDelete.id}`;

      if (currentPath === deletedPlaylistPath) {
        navigate('/');
      }
      
      closeModal();
      
    } catch (error) {
      console.error("Error al eliminar la playlist:", error);
      showToast('No se pudo eliminar la playlist.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (modalView !== 'deletePlaylist' || !playlistToDelete) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Eliminar de tu biblioteca</h2>
        <p className="delete-modal-text">
          ¿Quieres eliminar permanentemente "{playlistToDelete.title}"?
        </p>
        <div className="modal-actions">
          <button onClick={closeModal} className="btn btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={handleDelete} 
            className={`btn btn-primary ${isLoading ? 'is-loading' : ''}`}
            disabled={isLoading}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePlaylistModal;