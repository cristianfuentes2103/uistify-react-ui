import { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function EditPlaylistModal() {
  const { closeModal, modalView, modalData, modalProps } = useModal();
  const playlist = modalData; 
  const onUpdateSuccess = modalProps?.onUpdateSuccess;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(''); 

  const isTitleInvalid = title.trim() === '';
  
  const validationError = isTitleInvalid ? 'El nombre de la lista de reproducción es obligatorio.' : '';

  useEffect(() => {
    if (playlist) {
      setTitle(playlist.title || '');
      setDescription(playlist.description || '');
      setApiError('');
    }
  }, [playlist]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isTitleInvalid) return; 
    
    setIsLoading(true);
    setApiError('');

    // PROTECCIÓN CRÍTICA:
    // Forzamos que sea un booleano. Si viene undefined, usamos false, 
    // pero si viene true, se mantiene true.
    const currentVisibility = playlist?.publicPlaylist === true;
    console.log("Enviando actualización:", {
        id: playlist.id, 
        title, 
        publicPlaylist: currentVisibility 
    });

    try {
      const updatedPlaylistData = { 
        id: playlist.id, 
        title, 
        description,
        publicPlaylist: currentVisibility 
      };

      await apiFetch('/playlists', 'PUT', updatedPlaylistData);
      
      if (onUpdateSuccess) onUpdateSuccess();
      closeModal();
      
    } catch (err) {
      setApiError('No se pudo guardar la playlist. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (modalView !== 'editPlaylist' || !playlist) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content-edit edit-modal-content">
        <div className="modal-header">
          <h2>Editar Información</h2>
          <button onClick={closeModal} id="close-edit-modal-btn" className="close-modal-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} id="edit-playlist-form" className="edit-modal-body">
          {(validationError || apiError) && (
            <div className="modal-error-message">
              <span className="error-icon">!</span>
              <span className="error-text">{validationError || apiError}</span>
            </div>
          )}

          <div className="edit-modal-fields-container">
            <div className="edit-modal-cover">
              <img id="edit-playlist-cover-img" src={playlist.songs?.[0]?.pictureUrl || '/src/assets/img/song.png'} alt="Portada" />
            </div>
            <div className="edit-modal-fields">
              <input 
                type="text"
                id="edit-playlist-name-input"
                placeholder="Añade un nombre"
                required
                maxLength="50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={isTitleInvalid ? 'error-field' : ''}
              />
              <p id="name-char-counter" className={`char-counter ${title.length >= 50 ? 'limit-reached' : ''}`}>
                {title.length} / 50
              </p>

              <textarea
                id="edit-playlist-description-input"
                placeholder="Añade una descripción opcional"
                rows="4"
                maxLength="200"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <p id="description-char-counter" className={`char-counter ${description.length >= 200 ? 'limit-reached' : ''}`}>
                {description.length} / 200
              </p>
            </div>
          </div>

          <div className="edit-modal-footer">
            <button
              type="submit"
              className={`save-playlist-btn ${isLoading ? 'is-loading' : ''}`}
              disabled={isTitleInvalid}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPlaylistModal;