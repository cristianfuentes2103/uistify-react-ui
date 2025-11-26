import { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { apiFetch } from '../../services/api';

function UploadSongModal() {
  const { modalView, closeModal, showToast, modalProps } = useModal();
  const onUploadSuccess = modalProps?.onUpdateSuccess; 

  // Estados
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState(''); 
  const [pictureUrl, setPictureUrl] = useState(''); 
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState(0);
  
  const today = new Date().toISOString().split('T')[0];
  const [releaseDate, setReleaseDate] = useState(today);
  
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalView === 'uploadSong') {
      setTitle('');
      setAlbum('');      
      setPictureUrl(''); 
      setGenre('');
      setReleaseDate(today);
      setAudioFile(null);
      setDuration(0);
      setError('');
      setIsLoading(false);
    }
  }, [modalView, today]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== 'audio/mpeg' && !file.name.endsWith('.mp3')) {
        setError('Por favor sube solo archivos MP3.');
        setAudioFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`El archivo es demasiado pesado. Máximo 10 MB.`);
        setAudioFile(null);
        return;
      }

      setAudioFile(file);
      setError('');

      // --- LÓGICA PARA CALCULAR DURACIÓN AUTOMÁTICAMENTE ---
      const objectUrl = URL.createObjectURL(file); // Creamos URL temporal
      const audio = new Audio(objectUrl); // Creamos elemento de audio invisible
      
      // Cuando el navegador lea los metadatos (duración)
      audio.onloadedmetadata = () => {
        const seconds = Math.round(audio.duration);
        setDuration(seconds);
        URL.revokeObjectURL(objectUrl); // Limpiamos memoria
        console.log("Duración detectada:", seconds, "segundos");
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !audioFile) {
      setError('El título y el archivo de audio son obligatorios.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      const defaultImage = '/img/song.png';

      const songDto = {
        title: title.trim(),
        album: album.trim() || 'Sencillo',
        pictureUrl: pictureUrl.trim() || defaultImage, 
        genre: genre.trim(),
        releaseDate: releaseDate,
        duration: duration 
      };

      formData.append('dto', new Blob([JSON.stringify(songDto)], { type: 'application/json' }));
      formData.append('file', audioFile);

      await apiFetch('/artist/songs', 'POST', formData, true);

      showToast('¡Canción subida con éxito!', 'success');
      if (onUploadSuccess) onUploadSuccess();
      closeModal();

    } catch (err) {
      console.error(err);
      setError('Error al subir. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (modalView !== 'uploadSong') return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content-edit edit-modal-content">
        <div className="modal-header">
          <h2>Subir Canción</h2>
          <button onClick={closeModal} className="close-modal-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-body">
          <p style={{ color: '#b3b3b3', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
            Sube tu música en formato MP3 para que el mundo la escuche.
          </p>

          {error && <div className="modal-error-message"><span className="error-icon">!</span><span className="error-text">{error}</span></div>}

          <div className="edit-modal-fields-container" style={{ flexDirection: 'column', gap: '15px' }}>
            <div className="edit-modal-fields" style={{ width: '100%' }}>
              <div className="input-group-artist-modal">
                <label className="modal-label">Título <span style={{color:'red'}}>*</span></label>
                <input type="text" placeholder="Ej: Mi gran éxito" value={title} onChange={(e) => setTitle(e.target.value)} className="modal-input-title" required />
              </div>
              <div className="input-group-artist-modal" style={{ marginTop: '15px' }}>
                <label className="modal-label">Álbum</label>
                <input type="text" placeholder="Ej: Vida (Deja vacío si es un Sencillo)" value={album} onChange={(e) => setAlbum(e.target.value)} />
              </div>
              <div className="input-group-artist-modal" style={{ marginTop: '15px' }}>
                <label className="modal-label">URL de Portada (Opcional)</label>
                <input type="text" placeholder="https://ejemplo.com/imagen.jpg" value={pictureUrl} onChange={(e) => setPictureUrl(e.target.value)} style={{ fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="modal-label">Género</label>
                  <input type="text" placeholder="Ej: Pop" value={genre} onChange={(e) => setGenre(e.target.value)} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="modal-label">Lanzamiento</label>
                  <input type="date" value={releaseDate} max={today} onChange={(e) => setReleaseDate(e.target.value)} required style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            <div className="file-upload-area" style={{ border: '2px dashed #444', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: audioFile ? 'rgba(30, 215, 96, 0.1)' : 'transparent', marginTop: '10px' }}>
              <input id="song-file" type="file" accept=".mp3,audio/mpeg" onChange={handleFileChange} style={{ display: 'none' }} />
              <label htmlFor="song-file" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
                {audioFile ? (
                  <div style={{ color: '#1ed760' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎵</div>
                    <strong>{audioFile.name}</strong>
                    {/* Mostramos la duración detectada al usuario */}
                    <p style={{ fontSize: '0.8rem', marginTop: '5px', opacity: 0.8 }}>
                       Duración detectada: {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')} min
                    </p>
                  </div>
                ) : (
                  <div style={{ color: '#b3b3b3' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>☁️</div>
                    <strong>Haz clic para seleccionar el archivo MP3</strong>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="edit-modal-footer">
            <button type="submit" className={`save-playlist-btn ${isLoading ? 'is-loading' : ''}`} disabled={isLoading || !audioFile || !title}>
              {isLoading ? 'Subiendo...' : 'Publicar Canción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadSongModal;