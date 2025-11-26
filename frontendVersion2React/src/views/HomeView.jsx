import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import AlbumShelf from '../components/AlbumShelf';
import { chunkArray } from '../utils/arrayUtils';
import { usePlaylist } from '../context/PlaylistContext'; 

const ITEMS_PER_ROW = 12;

function HomeView() {
  const [publicContentRows, setPublicContentRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isLoggedIn } = useAuth();
  const { showToast } = useModal();
  const navigate = useNavigate();
  
  // Obtenemos los datos REACTIVOS del contexto
  const { publicPlaylists, fetchPublicPlaylists } = usePlaylist();

  // 1. Efecto de carga inicial: Pide actualizar el contexto al montar
  useEffect(() => {
    fetchPublicPlaylists();
  }, [fetchPublicPlaylists]);

  // 2. Efecto Reactivo: Se ejecuta cada vez que 'publicPlaylists' cambia en el contexto
  useEffect(() => {
    const enrichPlaylists = async () => {
      // Si el contexto dice que no hay playlists, limpiamos y terminamos
      if (!publicPlaylists || publicPlaylists.length === 0) {
        setPublicContentRows([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const enrichedPlaylists = await Promise.all(
          publicPlaylists.map(async (playlist) => {
            try {
              const songs = await apiFetch(`/public-playlists/${playlist.id}/songs`);

              return {
                id: playlist.id,
                title: playlist.title,
                cover: songs[0]?.pictureUrl || '/src/assets/img/song.png',
                artists: [playlist.ownerName || 'Usuario de UisTiFy'],
                isPlaylist: true,
              };
            } catch (songError) {
              return {
                id: playlist.id,
                title: playlist.title,
                cover: '/src/assets/img/song.png',
                artists: ['Usuario de UisTiFy'],
                isPlaylist: true,
              };
            }
          })
        );

        setPublicContentRows(chunkArray(enrichedPlaylists, ITEMS_PER_ROW));

      } catch (error) {
        console.error("Error al procesar contenido público:", error);
      } finally {
        setIsLoading(false);
      }
    };

    enrichPlaylists();

  }, [publicPlaylists]); 

  const handleCardClick = (item) => {
    if (!isLoggedIn) {
      showToast('Debes iniciar sesión para ver los detalles.', 'error');
      return;
    }

    if (item.isPlaylist) {
      navigate(`/public-playlist/${item.id}`);
    }
  };

  return (
    <main id="home-view-content" className="content-area home-landing">
      <header className="main-header">
        {isLoggedIn && <UserMenu />}
      </header>

      <h1 className="welcome-message music-title-gradient">Bienvenido a UisTiFy</h1>

      {!isLoading && (
        <>
          <h2 className="community-playlists-title">Playlists de la Comunidad</h2>

          {publicContentRows.map((row, index) => (
            <div
              key={index}
              className="community-shelf-container"
              onClick={(e) => {
                const card = e.target.closest(".album-card");
                if (card) {
                  const clickedItemId = card.dataset.itemId;
                  const clickedItem = row.find(item => String(item.id) === clickedItemId);
                  if (clickedItem) handleCardClick(clickedItem);
                }
              }}
            >
              <AlbumShelf albums={row} />
            </div>
          ))}

          {publicContentRows.length === 0 && (
            <p className="no-playlists-message">
              Aún no hay playlists públicas. ¡Sé el primero en compartir una!
            </p>
          )}
        </>
      )}
      
      {isLoading && <p style={{textAlign: 'center', color: '#777', marginTop: '20px'}}>Cargando comunidad...</p>}
    </main>
  );
}

export default HomeView;