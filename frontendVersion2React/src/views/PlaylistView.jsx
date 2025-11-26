import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import PlayerIcon from '../components/PlayerIcon';
import PlaylistCoverIcon from '../components/PlaylistCoverIcon';
import SongOptionsMenu from '../components/SongOptionsMenu';
import { usePlaylist } from '../context/PlaylistContext'; 

// --- SUB-COMPONENTE CANCIÓN ---
function PlaylistItemSong({ song, index, onPlay, onRemove, onTogglePlayPause, isOwner }) {
    const { currentSong, isPlaying } = usePlayer();
    const isCurrentSong = currentSong?.id === song.id;

    const handleRowClick = (e) => {
        if (e.target.closest('.song-options-menu') || e.target.closest('.delete-btn-area')) return;
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
                {isOwner && (
                    <div className="delete-btn-area">
                        <SongOptionsMenu song={song} onRemove={onRemove} />
                    </div>
                )}
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
function PlaylistView() {
    const [playlistDetails, setPlaylistDetails] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocalOwner, setIsLocalOwner] = useState(false);

    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast, openModal } = useModal();
    const { fetchPublicPlaylists } = usePlaylist();
    // Funciones necesarias del Player
    const {
        playSong,
        togglePlayPause,
        currentSong,
        updateQueue,
        removeFromQueue
    } = usePlayer();

    // --- CARGA DE DATOS Y SINCRONIZACIÓN ---
    const fetchPlaylistData = useCallback(async () => {
        setIsLoading(true);
        setIsLocalOwner(false);

        try {
            // 1. Intentamos carga privada
            let detailsData, songsData;
            try {
                [detailsData, songsData] = await Promise.all([
                    apiFetch(`/playlists/${playlistId}`),
                    apiFetch(`/playlists/${playlistId}/songs`)
                ]);
                setIsLocalOwner(true);
            } catch (privateError) {
                // 2. Si falla, carga pública
                [detailsData, songsData] = await Promise.all([
                    apiFetch(`/public-playlists/${playlistId}`),
                    apiFetch(`/public-playlists/${playlistId}/songs`)
                ]);
            }

            setPlaylistDetails(detailsData);
            setPlaylistSongs(songsData);

            // --- SINCRONIZACIÓN  ---
            // Si la canción que está sonando actualmente está dentro de esta playlist...
            // significa que el usuario está escuchando ESTA lista.
            // Entonces, actualizamos la cola del reproductor con los nuevos datos (ej. canción nueva agregada).
            if (currentSong && songsData.some(s => s.id === currentSong.id)) {
                console.log("Sincronizando cola del reproductor con la playlist actualizada...");
                updateQueue(songsData);
            }

        } catch (error) {
            console.error("Error al cargar playlist:", error);
            showToast('Playlist no disponible.', 'error');
            navigate('/', { replace: true });
        } finally {
            setIsLoading(false);
        }
    }, [playlistId, navigate, currentSong, updateQueue]);

       const handleUpdateSuccess = async () => {
        // 1. Recargamos los datos de ESTA vista (título, descripción)
        await fetchPlaylistData();
        
        // 2. Recargamos los datos del HOME en segundo plano
        // Así, si cambió de privada a pública, el Home ya lo sabrá.
        fetchPublicPlaylists(); 
    };
    useEffect(() => {
        if (playlistId) fetchPlaylistData();
    }, [playlistId]);

    const handlePlaySong = (songToPlay) => {
        if (playlistSongs.length > 0) playSong(songToPlay, playlistSongs);
    };

    const handleRemoveSong = async (songToRemove) => {
        if (!isLocalOwner) return;
        try {
            await apiFetch(`/playlists/${playlistId}/songs/${songToRemove.id}`, 'DELETE');
            showToast('Canción eliminada', 'success');

            // 1. Actualizamos el reproductor inmediatamente 
            removeFromQueue(songToRemove.id);

            // 2. Recargamos la lista visualmente
            // No llamamos a fetchPlaylistData completo para evitar parpadeos masivos, 
            // solo actualizamos las canciones.
            const updatedSongs = await apiFetch(`/playlists/${playlistId}/songs`);
            setPlaylistSongs(updatedSongs);

        } catch (error) {
            console.error("Error eliminando canción:", error);
            showToast('No se pudo eliminar la canción', 'error');
        }
    };

     const handleEditHeaderClick = () => {
        if (isLocalOwner && playlistDetails) {
            openModal('editPlaylist', playlistDetails, { 
                onUpdateSuccess: handleUpdateSuccess 
            });
        }
    };


    if (isLoading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>Cargando...</p>;
    if (!playlistDetails) return null;

    const coverImageUrl = playlistSongs?.[0]?.pictureUrl;

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
                        <img src={coverImageUrl} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <PlaylistCoverIcon />
                    )}
                </div>

                <div className="playlist-info">
                    <span className="playlist-type">Playlist</span>
                    <div
                        onClick={isLocalOwner ? handleEditHeaderClick : undefined}
                        style={{ cursor: isLocalOwner ? 'pointer' : 'default', marginTop: '10px' }}
                        title={isLocalOwner ? "Editar" : ""}
                    >
                        <h1 className="playlist-title-h1" style={{ marginBottom: '8px' }}>{playlistDetails.title}</h1>
                        {playlistDetails.description && (
                            <p className="playlist-description" style={{ color: '#ccc' }}>{playlistDetails.description}</p>
                        )}
                    </div>
                    <p className="playlist-owner" style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                        {playlistDetails.ownerName || user?.name || 'Usuario'}
                    </p>
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
                    {playlistSongs.map((song, index) => (
                        <PlaylistItemSong
                            key={song.id}
                            song={song}
                            index={index}
                            onPlay={handlePlaySong}
                            onRemove={handleRemoveSong}
                            onTogglePlayPause={togglePlayPause}
                            isOwner={isLocalOwner}
                        />
                    ))}
                    {playlistSongs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                            <p>Esta playlist está vacía.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default PlaylistView;