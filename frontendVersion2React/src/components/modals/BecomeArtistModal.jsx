import { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function BecomeArtistModal() {
  // 1. Obtenemos modalProps del contexto
  const { modalView, closeModal, showToast, modalProps } = useModal();
  
  // 2. Extraemos la función de actualización que nos pasó ArtistView
  const onUpdateSuccess = modalProps?.onUpdateSuccess;

  const [artistName, setArtistName] = useState('');
  const [country, setCountry] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!artistName.trim() || !country.trim()) {
      setError('El nombre de artista y el país son obligatorios.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const artistData = { 
        name: artistName, 
        country, 
        portraitUrl: profilePictureUrl 
      };

      // Petición POST
      await apiFetch('/artist', 'POST', artistData);
      
      showToast('¡Felicidades! Ahora eres un artista.', 'success');
      
      // 3.Ejecutamos la función para recargar ArtistView
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      closeModal();
    } catch (err) {
      setError('No se pudo crear el perfil. Es posible que ya seas un artista.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (modalView !== 'becomeArtist') {
    return null;
  }

  return (
   <div className="modal-backdrop">
      <div className="modal-content-edit edit-modal-content">
        <div className="modal-header">
          <h2>Conviértete en Artista</h2>
          <button onClick={closeModal} className="close-modal-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-body">
          
          {error && (
            <div className="modal-error-message">
              <span className="error-icon">!</span><span className="error-text">{error}</span>
            </div>
          )}
          <div className="edit-modal-fields-container">
            
            <div className="edit-modal-cover">
               <img 
                  src={profilePictureUrl || '/img/default-artist.png'} 
                  alt="Avatar" 

                  onError={(e) => { e.target.src = '/img/default-artist.png'; }}
               />
            </div>

            {/* Campos */}
            <div className="edit-modal-fields">
              <div className="input-group">
                <label className="modal-label">Nombre Artístico</label>
                <input 
                    type="text" 
                    placeholder='Tu nombre artístico' 
                    value={artistName} 
                    onChange={(e) => setArtistName(e.target.value)} 
                    required 
                    className="modal-input-title"
                />
              </div>

              <div className="input-group" style={{ marginTop: '15px' }}>
                <label className="modal-label">País de Origen</label>
                <input 
                    type="text" 
                    placeholder='Ej: Colombia' 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    required 
                />
              </div>

              <div className="input-group" style={{ marginTop: '15px' }}>
                <label className="modal-label">URL Foto de Perfil</label>
                <input 
                    type="text" 
                    placeholder='https://...' 
                    value={profilePictureUrl} 
                    onChange={(e) => setProfilePictureUrl(e.target.value)} 
                    style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          <div className="edit-modal-footer">
            <button 
              type="submit" 
              className={`save-playlist-btn ${isLoading ? 'is-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Comenzar Carrera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BecomeArtistModal;