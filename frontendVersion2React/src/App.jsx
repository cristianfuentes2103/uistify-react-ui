import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';

// Vistas y Componentes
import AuthView from './views/AuthView';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import PlaylistView from './views/PlaylistView';
import MainLayout from './layouts/MainLayout';
import BecomeArtistModal from './components/modals/BecomeArtistModal';
import ArtistDashboardView from './views/ArtistDashboardView';
import ArtistView from './views/ArtistView'; 

// Modales
import EditPlaylistModal from './components/modals/EditPlaylistModal';
import DeletePlaylistModal from './components/modals/DeletePlaylistModal';
import AddToPlaylistModal from './components/modals/AddToPlaylistModal';
import VerificationModal from './components/modals/VerificationModal';
import EditArtistModal from './components/modals/EditArtistModal';
import UploadSongModal from './components/modals/UploadSongModal';

function App() {
  const { modalView, modalProps } = useModal();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-fullscreen">Cargando...</div>;
  }

  return (
    <>
      <Routes>
        {/*
          Ruta para la Autenticación.
        */}
        <Route path="/auth" element={<AuthView />} />

        {/*
          Ruta Principal que envuelve todo lo demás.
          Utiliza el comodín `/*` para coincidir con `/`, `/search`, etc.
        */}
        <Route path="/*" element={<MainLayout />}>
          <Route path="artist" element={<ArtistView />} />
          {/*
          Rutas anidadas que se renderizarán dentro del <Outlet> de MainLayout.
            `index` se usa para la ruta padre (`/`).
          */}
          <Route index element={<HomeView />} />
          <Route path="search" element={<SearchView />} />
            <Route path="playlist/:playlistId" element={<PlaylistView />} />
          <Route path="artist/dashboard" element={<ArtistDashboardView />} />
          <Route path="*" element={<h1>Contenido no encontrado dentro de la app</h1>} />
        </Route>
      </Routes>

      {/* Modales y elementos globales */}
      <div id="toast-container"></div>

      {modalView === 'addToPlaylist' && <AddToPlaylistModal />}
      {modalView === 'editPlaylist' && <EditPlaylistModal {...modalProps} />}
      {modalView === 'deletePlaylist' && <DeletePlaylistModal {...modalProps} />}
      <UploadSongModal />
      <BecomeArtistModal />
      <VerificationModal />
      <EditArtistModal />
    </>
  );
}

export default App;