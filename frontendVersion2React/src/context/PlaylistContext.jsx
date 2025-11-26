import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { apiFetch } from '../services/api';

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
    const [publicPlaylists, setPublicPlaylists] = useState([]);
    const [isLoadingPublic, setIsLoadingPublic] = useState(false);

    // Esta función va al backend y trae las playlists públicas actualizadas
    const fetchPublicPlaylists = useCallback(async () => {
        setIsLoadingPublic(true);
        try {
            const data = await apiFetch('/public-playlists');
            setPublicPlaylists(data || []);
        } catch (error) {
            console.error("Error cargando playlists públicas:", error);
            setPublicPlaylists([]);
        } finally {
            setIsLoadingPublic(false);
        }
    }, []);

    // Cargamos los datos apenas inicia la app
    useEffect(() => {
        fetchPublicPlaylists();
    }, [fetchPublicPlaylists]);

    const value = {
        publicPlaylists,
        isLoadingPublic,
        fetchPublicPlaylists 
    };

    return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}

export function usePlaylist() {
    return useContext(PlaylistContext);
}