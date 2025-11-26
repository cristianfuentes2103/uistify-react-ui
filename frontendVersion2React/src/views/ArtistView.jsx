import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function ArtistView() {
  const [artistProfile, setArtistProfile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isArtistLoading, setIsArtistLoading] = useState(true);

  const { openModal } = useModal();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  // Función unificada para cargar perfil Y canciones
  const fetchArtistData = async () => {
    if (!isLoggedIn) {
      setIsArtistLoading(false);
      return;
    }

    try {
      // 1. Obtener Perfil del Artista
      const profile = await apiFetch('/artist');
      setArtistProfile(profile);

      // 2. Obtener Discografía
      try {

        // Pedimos page=0 y size=200 para traer un bloque grande de canciones
        const allSongs = await apiFetch('/songs?page=0&size=200');

        // Filtramos las canciones que pertenecen a este artista
        const mySongs = allSongs.filter(s =>
          s.artist && s.artist.trim().toLowerCase() === profile.name.trim().toLowerCase()
        );

        console.log("Mis canciones encontradas:", mySongs);
        setSongs(mySongs);

      } catch (songError) {
        console.error("Error cargando canciones", songError);
        setSongs([]);
      }

    } catch (error) {
      // Si falla perfil (404), no es artista o hubo error de red
      setArtistProfile(null);
    } finally {
      setIsArtistLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        fetchArtistData();
      } else {
        setIsArtistLoading(false);
      }
    }
  }, [isLoggedIn, isAuthLoading]);

  // Callback para refrescar datos
  const handleDataUpdate = () => {
    fetchArtistData();
  };

  // --- 1. PANTALLA DE CARGA ---
  if (isAuthLoading || (isLoggedIn && isArtistLoading)) {
    return (
      <main className="content-area centered-message">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '10px', color: '#b3b3b3' }}>Cargando...</p>
      </main>
    );
  }

  // --- 2. PANTALLA: NO LOGUEADO ---
  if (!isLoggedIn) {
    return (
      <main className="content-area artist-view-locked">
        <header className="main-header-list">
          <div className="navigation-arrows">
            <button className="arrow-btn back-btn" onClick={() => navigate(-1)}>
              <i className="icon-arrow-left"></i>
            </button>
          </div>
        </header>

        <div className="locked-container">
          <div className="locked-icon">🔒</div>
          <h1 className="locked-title">Para ser artista debes loguearte</h1>
          <p className="locked-description">
            Esta sección es exclusiva para creadores.<br />
            Inicia sesión en tu cuenta para gestionar o crear tu perfil.
          </p>
          <button onClick={() => navigate('/auth?mode=login')} className="btn-secondary-outline">
            Iniciar Sesión
          </button>
        </div>
      </main>
    );
  }

  // --- 3. PANTALLA: USUARIO LOGUEADO ---
  return (
    <main className="content-area artist-view-content">
      <header className="main-header-list-artist">
        <div className="navigation-arrows">
          <button className="arrow-btn back-btn" onClick={() => navigate(-1)}>
            <i className="icon-arrow-left"></i>
          </button>
        </div>
      </header>

      <div className="artist-view-container">
        {artistProfile ? (
          // === CASO A: ES UN ARTISTA ===
          <div className="artist-dashboard">

            {/* HERO HEADER */}
            <div className="artist-hero">
              <div className="artist-hero-image-wrapper">
                <img
                  src={artistProfile.portraitUrl || '/src/img/default-artist.png'}
                  alt={artistProfile.name}
                  className="artist-hero-img"
                  onError={(e) => { e.target.src = '/src/img/default-artist.png'; }}
                />
              </div>

              <div className="artist-hero-info">
                <span className="verified-badge">
                  <i className="icon-check">✓</i> Artista Verificado
                </span>
                <h1 className="artist-hero-name">{artistProfile.name}</h1>
                <p className="artist-hero-country">
                  <span className="flag-icon">🏳</span> {artistProfile.country}
                </p>

                <div className="artist-hero-actions">
                  <button
                    onClick={() => openModal('uploadSong', null, { onUpdateSuccess: handleDataUpdate })}
                    className="btn-hero-primary"
                  >
                    Subir Canción
                  </button>
                  <button
                    onClick={() => openModal('editArtist', artistProfile, { onUpdateSuccess: handleDataUpdate })}
                    className="btn-hero-secondary"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>

            <hr className="artist-divider" />

            {/* SECCIÓN DE MÚSICA */}
            <section className="artist-content-section">
              <h2 className="section-title">Tu Discografía</h2>

              {songs.length > 0 ? (
                // --- TABLA DE CANCIONES ---
                <div className="artist-songs-table">
                  {/* Cabecera */}
                  <div className="song-row-header">
                    <div className="col-index">#</div>
                    <div className="col-title">Título</div>
                    <div className="col-album">Álbum</div>
                    <div className="col-date">Lanzamiento</div>
                    <div className="col-time"><i className="icon-clock"></i></div>
                  </div>

                  {/* Lista */}
                  {songs.map((song, index) => (
                    <div key={song.id} className="song-row" onClick={() => playSong(song, songs)}>
                      <div className="col-index">
                        <span className="index-num">{index + 1}</span>
                        <span className="index-play">▶</span>
                      </div>
                      <div className="col-title">
                        <img
                          src={song.pictureUrl || '/src/img/song.png'}
                          alt="Cover"
                          className="song-row-cover"
                          onError={(e) => { e.target.src = '/src/img/song.png'; }}
                        />
                        <div className="song-row-info">
                          <span className="song-name">{song.title}</span>
                          <span className="song-sub">{song.genre || 'Desconocido'}</span>
                        </div>
                      </div>
                      <div className="col-album">{song.album || 'Sencillo'}</div>
                      <div className="col-date">{song.releaseDate}</div>
                      {/* Duración */}
                      <div className="col-time">
                        {/* USAMOS LA FUNCIÓN AQUÍ */}
                        {formatTime(song.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // --- ESTADO VACÍO ---
                <div className="empty-songs-placeholder">
                  <p>Aún no has subido canciones o no se encontraron.</p>
                  <small style={{ display: 'block', marginTop: '5px', color: '#777' }}>
                    Usa el botón "Subir Canción" para agregar tu primer lanzamiento.
                  </small>
                </div>
              )}
            </section>
          </div>
        ) : (
          // === CASO B: NO ES ARTISTA ===
          <div className="become-artist-container">
            <div className="promo-card">
              <div className="promo-content">
                <span className="promo-tag">Comunidad de Creadores</span>
                <h1 className="promo-title">Comparte tu música con el mundo</h1>
                <p className="promo-text">
                  Crea tu perfil de artista para empezar a subir tus canciones.
                  Es el momento de que te escuchen.
                </p>
                <button
                  onClick={() => openModal('becomeArtist', null, { onUpdateSuccess: handleDataUpdate })}
                  className="btn-promo-action"
                >
                  Conviértete en Artista
                </button>
              </div>
              <div className="promo-visual">
                <div className="music-note-icon">🎵</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ArtistView;