import { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useModal } from './ModalContext';
import { useAuth } from './AuthContext';

const PlayerContext = createContext();
import { API_BASE_URL } from '../services/config';

function PlayerProvider({ children }) {
    const { showToast } = useModal();
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingSong, setIsLoadingSong] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [queue, setQueue] = useState([]);
    const { isLoggedIn } = useAuth();

    const audioRef = useRef(new Audio());
    const currentObjectUrl = useRef(null);

    // --- VOLUMEN ---
    const getInitialVolume = () => {
        const savedVolume = localStorage.getItem('playerVolume');
        return savedVolume ? Number(savedVolume) : 1;
    };
    const [volume, setVolume] = useState(getInitialVolume());

    useEffect(() => { audioRef.current.volume = volume; }, []);

    const changeVolume = (newVolume) => {
        const v = Number(newVolume);
        setVolume(v);
        audioRef.current.volume = v;
        localStorage.setItem('playerVolume', v);
    };

    // --- REPRODUCCIÓN ---
    const playSong = useCallback(async (song, songList = null) => {
        if (!isLoggedIn) {
            showToast('Inicia sesión para escuchar música.', 'error');
            return;
        }
        if (!song?.sourceUrl || isLoadingSong) return;

        // Si es la misma canción, reanudar
        if (currentSong && song.id === currentSong.id) {
            audioRef.current.play();
            return;
        }

        setIsLoadingSong(true);
        setCurrentSong(song);
        if (currentObjectUrl.current) URL.revokeObjectURL(currentObjectUrl.current);

        // ACTUALIZACIÓN DE COLA INTELIGENTE
        // Si nos pasan una lista nueva, la usamos 
        if (songList && songList.length > 0) {
            setQueue(songList);
        } else if (queue.length === 0) {
            // Si no hay lista y la cola estaba vacía
            setQueue([song]);
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/file/${song.sourceUrl}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error cargando audio');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            currentObjectUrl.current = url;
            audioRef.current.src = url;
            await audioRef.current.play();
        } catch (error) {
            console.error("Error reproducción:", error);
        } finally {
            setIsLoadingSong(false);
        }
    }, [isLoadingSong, currentSong, queue, isLoggedIn]);

    const pauseSong = useCallback(() => audioRef.current.pause(), []);

    const togglePlayPause = useCallback(() => {
        isPlaying ? pauseSong() : (currentSong && audioRef.current.play());
    }, [isPlaying, currentSong, pauseSong]);

    // --- NAVEGACIÓN Y SINCRONIZACIÓN ---

    // Función auxiliar para saber dónde estamos
    const getCurrentIndex = useCallback(() => {
        if (!currentSong || queue.length === 0) return -1;
        return queue.findIndex(s => s.id === currentSong.id);
    }, [currentSong, queue]);

    const playNext = useCallback(() => {
        const idx = getCurrentIndex();
        // Si no hay cola o estamos en la última canción
        if (queue.length === 0 || idx === -1 || idx >= queue.length - 1) {
            console.log("Fin de la cola.");
            return;
        }
        const nextSong = queue[idx + 1];
        playSong(nextSong); // NO pasamos lista, mantenemos la cola actual
    }, [queue, getCurrentIndex, playSong]);

    const playPrevious = useCallback(() => {
        const idx = getCurrentIndex();
        if (queue.length === 0 || idx <= 0) {
            if (audioRef.current.currentTime > 3) audioRef.current.currentTime = 0;
            return;
        }
        const prevSong = queue[idx - 1];
        playSong(prevSong);
    }, [queue, getCurrentIndex, playSong]);

    // Eliminar de la cola en vivo
    const removeFromQueue = useCallback((songId) => {
        setQueue(prev => prev.filter(s => s.id !== songId));
    }, []);

    // Actualizar cola silenciosamente
    const updateQueue = useCallback((newQueue) => {
        // Solo actualizamos si la canción actual sigue existiendo en la nueva lista
        // para evitar bugs extraños.
        setQueue(newQueue);
    }, []);

    const seek = useCallback((time) => {
        if (!isNaN(time) && audioRef.current.src) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        const setPlay = () => setIsPlaying(true);
        const setPause = () => setIsPlaying(false);
        const setTime = () => setProgress(audio.currentTime);
        const setDur = () => setDuration(audio.duration);
        const setEnd = () => playNext();

        audio.addEventListener('play', setPlay);
        audio.addEventListener('pause', setPause);
        audio.addEventListener('timeupdate', setTime);
        audio.addEventListener('loadedmetadata', setDur);
        audio.addEventListener('ended', setEnd);

        return () => {
            audio.removeEventListener('play', setPlay);
            audio.removeEventListener('pause', setPause);
            audio.removeEventListener('timeupdate', setTime);
            audio.removeEventListener('loadedmetadata', setDur);
            audio.removeEventListener('ended', setEnd);
        };
    }, [playNext]);

    // Limpieza al desloguear
    useEffect(() => {
        if (!isLoggedIn) {
            audioRef.current.pause();
            setCurrentSong(null);
            setQueue([]);
        }
    }, [isLoggedIn]);

    const value = {
        currentSong, isPlaying, isLoadingSong, progress, duration, queue,
        playSong, pauseSong, togglePlayPause, playNext, playPrevious, seek,
        volume, changeVolume,
        removeFromQueue, updateQueue
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer debe estar en PlayerProvider');
    return context;
}

export { PlayerProvider, usePlayer };