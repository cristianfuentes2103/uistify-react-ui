import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useModal } from '../context/ModalContext';
import PlayerIcon from '../components/PlayerIcon';
import PlaylistCoverIcon from '../components/PlaylistCoverIcon';
import SongOptionsMenu from '../components/SongOptionsMenu';

function PlaylistItemSong({ song, index, onPlay, onRemove, onTogglePlayPause }) {
    const { currentSong, isPlaying } = usePlayer();
    const isCurrentSong = currentSong?.id === song.id;

    const handleRowClick = (e) => {
        if (e.target.closest('.song-options-menu')) {
            return;
        }
        if (isCurrentSong) {
            onTogglePlayPause();
        } else {
            onPlay(song);
        }
    };

    return (
        <div className={`song-item ${isCurrentSong ? 'is-playing' : ''}`} onClick={handleRowClick}>
            <div className="song-item-index">
                <span className="song-index-number">{index + 1}</span>
                <button className="song-item-play-btn">
                    <PlayerIcon type={isCurrentSong && isPlaying ? 'pause' : 'play'} />
                </button>
            </div>
            <div className="song-item-title">
                <img src={song.pictureUrl} alt={song.title} className="song-item-cover" />
                <div>
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist}</p>
                </div>
            </div>
            <div className="song-item-album">{song.album}</div>
            <div className="song-item-duration">
                <span>{new Date(song.duration * 1000).toISOString().substr(14, 5)}</span>
                <SongOptionsMenu song={song} onRemove={onRemove} />
            </div>
        </div>
    );
}

// --- Componente Principal de la Vista de Playlist ---
function PlaylistView() { 
    const [playlist, setPlaylist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { playlistId } = useParams(); // OBTIENE el ID de la URL
    const navigate = useNavigate();      // OBTIENE la función de navegación

    const { playSong, togglePlayPause } = usePlayer();
    const { showToast, openModal } = useModal();

    const fetchPlaylistDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch(`/playlists/${playlistId}`);
            setPlaylist(data);
        } catch (error) {
            console.error("Error al cargar los detalles de la playlist:", error);
            setPlaylist(null);
        } finally {
            setIsLoading(false);
        }
    }, [playlistId]);

    useEffect(() => {
        if (playlistId) {
            fetchPlaylistDetails();
        }
    }, [playlistId, fetchPlaylistDetails]);

    const handlePlaySong = (songToPlay) => {
        if (playlist?.songs) {
            playSong(songToPlay, playlist.songs);
        }
    };

    const handleRemoveSong = async (songToRemove) => {
        if (!playlist) return;
        try {
            await apiFetch(`/playlists/${playlist.id}/songs/${songToRemove.id}`, 'DELETE');
            showToast('Canción quitada de la playlist', 'success');
            await fetchPlaylistDetails();
        } catch (error) {
            console.error("Error al quitar la canción:", error);
            showToast('No se pudo quitar la canción', 'error');
        }
    };

    const handleEditClick = () => {
        openModal('editPlaylist', playlist, { onUpdateSuccess: fetchPlaylistDetails });
    };

    const coverImageUrl = playlist?.songs?.[0]?.pictureUrl;
    const songsToShow = playlist?.songs || [];

    return (
        <main id="playlist-view-content" className="content-area-playlist">
            <header className="main-header-list">
                <div className="navigation-arrows">
                    <button className="arrow-btn back-btn" onClick={() => navigate(-1)}>
                        <i className="icon-arrow-left"></i>
                    </button>
                </div>
            </header>

            <div className="playlist-header">
                <div className="playlist-cover">
                    {coverImageUrl ? (
                        <img src={coverImageUrl} alt="Portada de la playlist" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <PlaylistCoverIcon />
                    )}
                </div>
                <div className="playlist-info">
                    <span className="playlist-type">Playlist</span>
                    <div onClick={handleEditClick} style={{ cursor: 'pointer' }} title="Editar detalles">
                        <h1 className="playlist-title-h1">{playlist?.title }</h1>
                        <p className="playlist-description">{playlist?.description}</p>
                    </div>
                </div>
            </div>

            <div className="playlist-songs-container">
                <div className="song-list-header">
                    <div className="song-header-index">#</div>
                    <div className="song-header-title">Título</div>
                    <div className="song-header-album">Álbum</div>
                    <div className="song-header-duration"><i className="icon-clock"></i></div>
                </div>
                <div id="song-list" className="song-list">
                    {songsToShow.map((song, index) => (
                        <PlaylistItemSong
                            key={song.id}
                            song={song}
                            index={index}
                            onPlay={handlePlaySong}
                            onRemove={handleRemoveSong}
                            onTogglePlayPause={togglePlayPause}
                        />
                    ))}
                    {!isLoading && playlist && songsToShow.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3' }}>
                            Aún no hay canciones en esta playlist.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default PlaylistView;