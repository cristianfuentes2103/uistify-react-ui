import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useModal } from '../context/ModalContext';
import PlaylistContextMenu from './PlaylistContextMenu';
import ToggleSwitch from './ToggleSwitch';
import { usePlaylist } from '../context/PlaylistContext';

function Library({ isLoggedIn, onPlaylistUpdate }) {
  const { modalView, openModal, showToast } = useModal();
  const [playlists, setPlaylists] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { fetchPublicPlaylists } = usePlaylist();
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    playlist: null,
    x: 0,
    y: 0,
  });

  const fetchUserPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setPlaylists([]);
      setIsLoadingInitial(false);
      return;
    }

    try {
      const userPlaylists = await apiFetch('/playlists');
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error al cargar las playlists:", error);
      setPlaylists([]);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Si hay una actualización externa, recargamos
    if (onPlaylistUpdate) {
      onPlaylistUpdate(fetchUserPlaylists);
    }
    fetchUserPlaylists();
  }, [fetchUserPlaylists, onPlaylistUpdate, modalView]);

  const handleCreatePlaylist = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const defaultPlaylistCount = playlists.filter(p => p.title.startsWith('Mi lista n.º')).length;
      const newPlaylistTitle = `Mi lista n.º ${defaultPlaylistCount + 1}`;

      await apiFetch('/playlists', 'POST', { title: newPlaylistTitle, description: "" });
      showToast('Playlist creada', 'success');
      await fetchUserPlaylists();
    } catch (error) {
      console.error("Error al crear playlist:", error);
      showToast('Error al crear la playlist', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // --- LÓGICA DE TOGGLE ---
  const handleVisibilityToggle = async (playlistToUpdate) => {
    // Calculamos el nuevo estado
    const newVisibility = !playlistToUpdate.publicPlaylist;

    // 1. Actualización Optimista (UI primero)
    // Actualizamos el estado local inmediatamente para que el usuario vea el cambio ya
    setPlaylists(prev => prev.map(p =>
      p.id === playlistToUpdate.id ? { ...p, publicPlaylist: newVisibility } : p
    ));

    try {
      // 2. Petición al Backend
      await apiFetch('/playlists', 'PUT', {
        id: playlistToUpdate.id,
        title: playlistToUpdate.title,
        description: playlistToUpdate.description,
        publicPlaylist: newVisibility,

      });
      showToast(`Playlist ahora es ${newVisibility ? 'pública' : 'privada'}.`, 'success');
      fetchPublicPlaylists(); // <-- Actualiza el Home inmediatamente
    } catch (error) {
      // Si falla, revertimos el cambio en la UI
      console.error("Error al cambiar visibilidad:", error);
      showToast('No se pudo actualizar.', 'error');
      setPlaylists(prev => prev.map(p =>
        p.id === playlistToUpdate.id ? { ...p, publicPlaylist: !newVisibility } : p
      ));
    }
  };

  const handleContextMenu = (e, playlist) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, playlist, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu({ ...contextMenu, isOpen: false });
  const handleDeletePlaylist = () => {
    openModal('deletePlaylist', contextMenu.playlist);
    closeContextMenu();
  };

  const createIconSVG = <svg width="22" height="21" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.2841 -0.00683594V23.0001" stroke="#626262" strokeWidth="3" /><path d="M0 11.6562H24" stroke="#626262" strokeWidth="3" /></svg>;
  const playlistIconSVG = <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.2188 4.37207L29.8457 4.66113L11.3457 8.12988L10.4062 8.27441V23.7754C9.71973 23.3734 8.94287 23.125 8.09375 23.125C5.5509 23.125 3.46875 25.2072 3.46875 27.75C3.46875 30.2928 5.5509 32.375 8.09375 32.375C10.6366 32.375 12.7188 30.2928 12.7188 27.75V14.8145L28.9062 11.7793V20.3066C28.2197 19.9047 27.4429 19.6562 26.5938 19.6562C24.0509 19.6562 21.9688 21.7384 21.9688 24.2812C21.9688 26.8241 24.0509 28.9062 26.5938 28.9062C29.1366 28.9062 31.2188 26.8241 31.2188 24.2812V4.37207ZM28.9062 7.1543V9.4668L12.7188 12.502V10.1895L28.9062 7.1543ZM26.5938 21.9688C27.8855 21.9688 28.9062 22.9895 28.9062 24.2812C28.9062 25.573 27.8855 26.5938 26.5938 26.5938C25.302 26.5938 24.2812 25.573 24.2812 24.2812C24.2812 22.9895 25.302 21.9688 26.5938 21.9688ZM8.09375 25.4375C9.3855 25.4375 10.4062 26.4583 10.4062 27.75C10.4062 29.0417 9.3855 30.0625 8.09375 30.0625C6.802 30.0625 5.78125 29.0417 5.78125 27.75C5.78125 26.4583 6.802 25.4375 8.09375 25.4375Z" fill="#848484" /></svg>;

  return (
    <div className="sidebar-block user-playlists">
      <div id="sidebar-library-content" className={isLoggedIn ? '' : 'hidden'}>
        <div className="library-header">
          <i className="icon-library"></i>
          <span className="library-title">Tu biblioteca</span>
          <button onClick={handleCreatePlaylist} className={`btn-create btn-icon ${isCreating ? 'is-loading' : ''}`} disabled={isCreating}>
            {createIconSVG} Crear lista
          </button>
        </div>

        <div id="playlist-container">
          {[...playlists].reverse().map(playlist => (
            <div key={playlist.id} className="playlist-item-wrapper">
              <Link
                to={`/playlist/${playlist.id}`}
                className="playlist-item"
                onContextMenu={(e) => handleContextMenu(e, playlist)}
              >
                <div className="playlist-item-cover">{playlistIconSVG}</div>
                <div className="playlist-item-info">
                  <p className="playlist-item-title">{playlist.title}</p>
                  <p className="playlist-item-owner">Playlist</p>
                </div>
              </Link>
              <ToggleSwitch
                isChecked={!!playlist.publicPlaylist} // Convertimos a booleano por seguridad
                onToggle={() => handleVisibilityToggle(playlist)}
              />
            </div>
          ))}
          {!isLoadingInitial && playlists.length === 0 && (
            <div className="first-playlist-prompt" style={{ padding: '20px', color: '#b3b3b3' }}>
              <h4>Crea tu primera playlist</h4>
              <p style={{ fontSize: '0.8rem', fontWeight: '300' }}>¡Es muy fácil, te ayudaremos!</p>
            </div>
          )}
        </div>
      </div>
      <PlaylistContextMenu menuData={contextMenu} onDelete={handleDeletePlaylist} onClose={closeContextMenu} />
    </div>
  );
}

export default Library;