import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext'; 
// función auxiliar para formatear el tiempo 
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function Player() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seek
  } = usePlayer();

  const { isLoggedIn } = useAuth(); // <-- estado de login
  // --- ESTADO DESHABILITADO ---
  // Los controles deben estar deshabilitados si no hay una sesión activa O si no hay una canción cargada.
  const isDisabled = !isLoggedIn || !currentSong;
  // ---------------------------------------------
  const handleSeek = (e) => {
    seek(Number(e.target.value));
  };

  return (
    <footer className="player-bar">
      {/* Columna Izquierda: Información de la canción */}
      <div className="player-left">
        {currentSong ? (
          <div className="current-song-info">
            <img
              src={currentSong.pictureUrl}
              alt={currentSong.title}
              className="player-song-cover"
            />
            <div>
              <p className="player-song-title">{currentSong.title}</p>
              <p className="player-song-artist">{currentSong.artist}</p>
            </div>
          </div>
        ) : (
          // Si no hay canción, no renderizamos nada en esta sección.
          null
        )}
      </div>

      {/* Columna Central: Controles y barra de progreso */}
      <div className="player-center">
        <div className="player-controls">
           <button onClick={playPrevious} className="player-btn secondary" title="Anterior" disabled={isDisabled}>
            <i className="icon-prev"></i>
          </button>
          <button onClick={togglePlayPause} className="player-btn" title={isPlaying ? 'Pausar' : 'Reproducir'} disabled={isDisabled}>
            <i className={isPlaying ? 'icon-pause' : 'icon-play'}></i>
          </button>
            <button onClick={playNext} className="player-btn secondary" title="Siguiente" disabled={isDisabled}>
            <i className="icon-next"></i>
          </button>
        </div>
        <div className="progress-container">
          <span className="time-stamp">{formatTime(progress)}</span>
          <input
            type="range"
            className="progress-slider"
            value={progress}
            min="0"
            max={duration || 100}
            onChange={handleSeek}
            disabled={isDisabled}
          />
          <span className="time-stamp">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Columna Derecha: Control de volumen (Placeholder) */}
      <div className="player-right">
        {/* Aquí irán los controles de volumen en el futuro */}
      </div>
    </footer>
  );
}

export default Player;