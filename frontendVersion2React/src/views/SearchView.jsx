import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import PlayerIcon from '../components/PlayerIcon'; 
import { useModal } from '../context/ModalContext'; 


function SongItem({ song, onPlay }) {
    const { currentSong, isPlaying, togglePlayPause} = usePlayer();
    const isCurrentSong = currentSong?.id === song.id;
    const { openModal } = useModal();
    
    const handlePlayClick = (e) => {
        e.stopPropagation();
        if (isCurrentSong) {
            togglePlayPause();
        } else {
            onPlay(song);
        }
    };
    
    const handleAddClick = (e) => {
        e.stopPropagation();
        openModal('addToPlaylist', song);
    };
    
    return (
        <div className={`song-item ${isCurrentSong ? 'is-playing' : ''}`} data-song-id={song.id}>
            <div className="song-item-cover-container">
                <img src={song.pictureUrl} alt={song.title} className="song-item-cover" />
                <button onClick={handlePlayClick} className="song-item-play-btn">
                    <PlayerIcon type={isCurrentSong && isPlaying ? 'pause' : 'play'} />
                </button>
            </div>
            <div className="song-item-title-search">
                <div>
                    <p className="song-title" style={{ color: isCurrentSong ? 'var(--primary-color)' : 'white' }}>
                        {song.title}
                    </p>
                    <p className="song-artist">{song.artist}</p>
                </div>
            </div>
            <div className="song-item-album">{song.album}</div>
            <div className="song-item-duration">
                <span>{new Date(song.duration * 1000).toISOString().substr(14, 5)}</span>
                <button onClick={handleAddClick} className="add-to-playlist-btn" title="Añadir a playlist">
                    +
                </button>
            </div>
        </div>
    );
}

// --- Componente principal de la Vista de Búsqueda ---
function SearchView() { 
    const navigate = useNavigate(); 
    const { playSong } = usePlayer();

    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [allSongsLoaded, setAllSongsLoaded] = useState(false);
    const pageSize = 20;
    const mainContentRef = useRef(null);

    const handlePlaySong = (songToPlay) => {
        playSong(songToPlay, filteredSongs);
    };

    const loadMoreSongs = useCallback(async () => {
        if (isLoading || allSongsLoaded) return;
        setIsLoading(true);
        try {

            const newSongs = await apiFetch(`/songs?page=${currentPage}&size=${pageSize}`);
            if (newSongs.length < pageSize) {
                setAllSongsLoaded(true);
            }
            setSongs(prevSongs => {
                const existingIds = new Set(prevSongs.map(s => s.id));
                const uniqueNewSongs = newSongs.filter(s => !existingIds.has(s.id));
                return [...prevSongs, ...uniqueNewSongs];
            });
            setCurrentPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error("Error al cargar más canciones:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, allSongsLoaded, currentPage, pageSize]);

    useEffect(() => {
        if (songs.length === 0) {
            loadMoreSongs();
        }
    }, [loadMoreSongs, songs.length]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredSongs(songs);
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const results = songs.filter(song =>
                song.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                (song.artist || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (song.album || '').toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredSongs(results);
        }
    }, [searchTerm, songs]);

    useEffect(() => {
        const mainContentEl = document.querySelector('.main-content');
        mainContentRef.current = mainContentEl;
        const handleScroll = () => {
            const container = mainContentRef.current;
            if (container && !isLoading) { 
                const { scrollTop, clientHeight, scrollHeight } = container;
                if (scrollTop + clientHeight >= scrollHeight - 100 && searchTerm === '') {
                    loadMoreSongs();
                }
            }
        };
        if (mainContentEl) {
            mainContentEl.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (mainContentEl) {
                mainContentEl.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, searchTerm, loadMoreSongs]);

    return (
        <main id="search-view-content" className="content-area">
            <header className="main-header-search">
                <div className="navigation-arrows search">
                    <button className="arrow-btn back-btn" onClick={() => navigate(-1)}>
                        <i className="icon-arrow-left"></i>
                    </button>
                </div>
            </header>
            <h1>Explorar Canciones</h1>
            <div className="search-bar-container">
                <i className="icon-search"></i>
                <input
                    type="text"
                    id="search-input"
                    placeholder="Busca por título, artista o álbum"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div id="all-songs-container" className="song-list">
                {filteredSongs.map(song => (
                    <SongItem
                        key={song.id}
                        song={song}
                        onPlay={handlePlaySong}
                    />
                ))}
                {isLoading && searchTerm === '' && (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#b3b3b3' }}>Cargando canciones...</p>
                )}
                {searchTerm !== '' && filteredSongs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
                        <p>No se encontraron resultados para "{searchTerm}" en la lista de canciones.</p>
                        {!allSongsLoaded && (
                            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                                Sigue haciendo scroll para cargar más canciones y vuelve a intentarlo.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default SearchView;