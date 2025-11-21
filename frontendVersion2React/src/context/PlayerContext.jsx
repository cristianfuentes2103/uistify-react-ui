import { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useModal } from './ModalContext';
import { useAuth } from './AuthContext';

const PlayerContext = createContext();
const API_BASE_URL = 'https://apidev.uistify.site';

function PlayerProvider({ children }) {
    const { showToast } = useModal();
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingSong, setIsLoadingSong] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(-1);
    const { isLoggedIn } = useAuth();

    const audioRef = useRef(new Audio());
    const currentObjectUrl = useRef(null);

    // --- EFECTO PARA INICIALIZAR Y SINCRONIZAR EL VOLUMEN ---
    useEffect(() => {
        // Al cargar, establece el volumen inicial del elemento de audio
        audioRef.current.volume = volume;
    }, []); // Se ejecuta solo una vez al inicio

    const getInitialVolume = () => {
        const savedVolume = localStorage.getItem('playerVolume');
        // Si `savedVolume` es `null` o `undefined`, devolvemos 1 por defecto.
        if (savedVolume === null || savedVolume === undefined) {
            return 1;
        }
        // Si existe, nos aseguramos de convertirlo a número.
        const volumeAsNumber = Number(savedVolume);
        // Si la conversión falla (ej. era un string inválido), también devolvemos 1.
        return isNaN(volumeAsNumber) ? 1 : volumeAsNumber;
    };

    const [volume, setVolume] = useState(getInitialVolume());
    // --- ¡NUEVA FUNCIÓN PARA CAMBIAR EL VOLUMEN! ---
    const changeVolume = (newVolume) => {
        const volumeValue = Number(newVolume);
        setVolume(volumeValue); // Actualiza el estado de React
        audioRef.current.volume = volumeValue; // Actualiza el volumen del elemento <audio>
        localStorage.setItem('playerVolume', volumeValue); // Guarda la preferencia
    };

    const playSong = useCallback(async (song, songList) => {
        showToast('Cargando canción...', 'info', 2000);
        if (!isLoggedIn) {
            showToast('Debes iniciar sesión para reproducir canciones.', 'error');
            return; // Detenemos la función aquí
        }
        if (!song?.sourceUrl || isLoadingSong) return;
        if (song.id === currentSong?.id) {
            audioRef.current.play();
            return;
        }

        setIsLoadingSong(true);
        setCurrentSong(song);
        if (currentObjectUrl.current) URL.revokeObjectURL(currentObjectUrl.current);

        // Si se proporciona una lista de canciones, la usamos para actualizar la cola
        if (songList && songList.length > 0) {
            setQueue(songList);
            setQueueIndex(songList.findIndex(s => s.id === song.id));
        } else if (queue.length === 0) {
            // Si no hay lista ni cola, la cola es solo la canción actual
            setQueue([song]);
            setQueueIndex(0);
        }
        // Si ya hay una cola y no se pasa una nueva lista, se reutiliza la existente
        try {
            const objectKey = song.sourceUrl;
            const fileEndpointUrl = `${API_BASE_URL}/api/file/${objectKey}`;
            const token = localStorage.getItem('authToken');
            const response = await fetch(fileEndpointUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const audioBlob = await response.blob();
            const playableUrl = URL.createObjectURL(audioBlob);
            currentObjectUrl.current = playableUrl;
            audioRef.current.src = playableUrl;
            await audioRef.current.play();
        } catch (error) {
            console.error("Error al cargar o reproducir la canción:", error);
            setCurrentSong(null);
        } finally {
            setIsLoadingSong(false);
        }
    }, [isLoadingSong, currentSong, queue, showToast, isLoggedIn]);

    const pauseSong = useCallback(() => {
        audioRef.current.pause();
    }, []);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pauseSong();
        } else if (currentSong) {
            audioRef.current.play();
        }
    }, [isPlaying, currentSong, pauseSong]);

    const playNext = useCallback(() => {
        if (queue.length === 0 || queueIndex >= queue.length - 1) {
            console.log("Fin de la cola.");
            return;
        }
        const nextIndex = queueIndex + 1;
        const nextSong = queue[nextIndex];
        // Al llamar a playSong, también le pasamos la cola actual para asegurar consistencia
        playSong(nextSong, queue);
    }, [queue, queueIndex, playSong]);

    const playPrevious = useCallback(() => {
        if (queue.length === 0 || queueIndex <= 0) {
            console.log("Inicio de la cola.");
            return;
        }
        const prevIndex = queueIndex - 1;
        const prevSong = queue[prevIndex];
        playSong(prevSong, queue);
    }, [queue, queueIndex, playSong]);

    const seek = useCallback((time) => {
        if (!isNaN(time) && audioRef.current.src) { // Añadimos .src para asegurar que haya audio cargado
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }, []); // `seek` no tiene dependencias porque solo interactúa con el audioRef

    useEffect(() => {
        // Si el estado de `isLoggedIn` cambia a `false`...
        if (!isLoggedIn) {
            // 1. Pausamos la reproducción
            audioRef.current.pause();

            // 2. Quitamos la fuente para que no se pueda volver a dar play
            audioRef.current.src = '';

            // 3. Reseteamos todos los estados del reproductor
            setCurrentSong(null);
            setQueue([]);
            setQueueIndex(-1);
            setProgress(0);
            setDuration(0);
        }
    }, [isLoggedIn]); // <-- Este efecto se dispara cada vez que `isLoggedIn` cambia
    // --- useEffect para los eventos de audio ---
    useEffect(() => {
        const audio = audioRef.current;
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => playNext();


        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);


        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);

        };
    }, [playNext]);

    const value = {
        currentSong, isPlaying, isLoadingSong, progress, duration,
        playSong, pauseSong, togglePlayPause, playNext, playPrevious, seek, volume, changeVolume
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer debe ser usado dentro de un PlayerProvider');
    }
    return context;
}

export { PlayerProvider, usePlayer };