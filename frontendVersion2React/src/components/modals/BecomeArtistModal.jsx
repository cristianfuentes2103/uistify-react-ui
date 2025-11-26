import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function BecomeArtistModal() {
  const { modalView, closeModal, showToast } = useModal();
  const navigate = useNavigate();

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
      const artistData = { name: artistName, country, portraitUrl: profilePictureUrl };
      await apiFetch('/artist', 'POST', artistData);
      showToast('¡Felicidades! Ahora eres un artista.', 'success');
      closeModal();
      navigate('/artist/dashboard'); // Navegamos al panel de artista
    } catch (err) {
      setError('No se pudo crear el perfil. Es posible que ya seas un artista.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // El modal solo se renderiza si es el que está activo
  if (modalView !== 'becomeArtist') {
    return null;
  }

  return (
   <div className="modal-backdrop">
      <div className="form-container" style={{ position: 'relative' }}>
        <button onClick={closeModal} className="close-modal-btn" style={{ position: 'absolute', top: '10px', right: '15px' }}>
          &times;
        </button>
        <form onSubmit={handleSubmit} className="upload-song-form">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Conviértete en Artista</h2>
          
          {error && <div className="modal-error-message">...</div>}

          <div className="form-field">
            <input id="artist-name" type="text" placeholder='Nombre Artístico' value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
          </div>
          <div className="form-field">
            <input id="artist-country" type="text" placeholder='País' value={country} onChange={(e) => setCountry(e.target.value)} required />
          </div>
          <div className="form-field">
            <input id="artist-picture" type="text" placeholder='URL de tu foto de perfil (opcional)' value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)} />
          </div>
            <div className="edit-modal-footer" style={{ justifyContent: 'center' }}>
            <button 
              type="submit" 
              className={`save-playlist-btn ${isLoading ? 'is-loading' : ''}`}
              disabled={isLoading}
            >
              Crear Perfil de Artista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BecomeArtistModal;