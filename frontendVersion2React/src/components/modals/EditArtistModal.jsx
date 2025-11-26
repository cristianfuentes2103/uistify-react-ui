import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function EditArtistModal() {
  const { modalView, modalData, closeModal, showToast, modalProps } = useModal();
  const onUpdateSuccess = modalProps?.onUpdateSuccess;
  const artistProfile = modalData;
  const navigate = useNavigate();

  const [artistName, setArtistName] = useState('');
  const [country, setCountry] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (artistProfile && modalView === 'editArtist') {
      setArtistName(artistProfile.name || '');
      setCountry(artistProfile.country || '');
      setProfilePictureUrl(artistProfile.portraitUrl || '');
    }
  }, [artistProfile, modalView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistName.trim() || !country.trim()) {
      setError('El nombre de artista y el país son obligatorios.');
      return;
    }

    // VALIDACIÓN DE LONGITUD DE URL 
    if (profilePictureUrl.length > 255) {
      setError('La URL de la imagen es demasiado larga. Intenta con una URL más corta (ej. terminada en .jpg o .png).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const artistData = {
        id: artistProfile.id,
        name: artistName,
        country,
        portraitUrl: profilePictureUrl.trim(), 
        userId: artistProfile.userId 
      };

      console.log("Enviando datos:", artistData);

      await apiFetch('/artist', 'PUT', artistData);

      showToast('Perfil de artista actualizado.', 'success');

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      closeModal();

    } catch (err) {
      console.error("Error del backend:", err);
      setError('Error al guardar. Verifica que la URL de la imagen no sea muy larga.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleImageError = (e) => {
    e.target.src = '/public/img/default-artist.png'; 
  };

  if (modalView !== 'editArtist') {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content-edit edit-modal-content">
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button onClick={closeModal} className="close-modal-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-body">

          {error && (
            <div className="modal-error-message">
              <span className="error-icon">!</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* CONTENEDOR FLEX: Imagen Izquierda | Inputs Derecha */}
          <div className="edit-modal-fields-container">

            {/* ZONA DE FOTO */}
            <div className="edit-modal-cover">
              <img
                id="edit-artist-cover-img"
                src={profilePictureUrl || '/public/img/default-artist.png'}
                alt="Foto del artista"
                onError={handleImageError} // Evita imagen rota
                style={{ objectFit: 'cover' }}
              />
              <div style={{ marginTop: '10px', width: '100%' }}>
                {/* Input pequeño para la URL de la imagen justo debajo de la foto */}
                <input
                  type="text"
                  placeholder="URL de imagen"
                  value={profilePictureUrl}
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '5px', width: '93%', opacity: 0.8 }}
                />
              </div>
            </div>

            {/* ZONA DE INPUTS */}
            <div className="edit-modal-fields">
              <div className="input-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre Artístico"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  required
                  className="modal-input-title" 
                />
              </div>

              <div className="input-group" style={{ marginTop: '15px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>País de origen</label>
                <input
                  type="text"
                  placeholder="Ej: Colombia"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArtistModal;