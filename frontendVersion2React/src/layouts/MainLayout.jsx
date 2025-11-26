import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

function MainLayout() {
  const navigate = useNavigate();

  const handleNavigateToAuth = (mode) => {
    // Usamos el hook `useNavigate` para cambiar a la ruta /auth con el parámetro correcto
    navigate(`/auth?mode=${mode}`);
  };

  return (
    <div id="main-view" className="view">
      <Sidebar onNavigateToAuth={handleNavigateToAuth} />

      <div className="main-content">
        {/* 
          <Outlet> es el marcador de posición de React Router.
          Aquí es donde se renderizará el componente de la ruta anidada que coincida.
          - Si la URL es '/', aquí se mostrará <HomeView />.
          - Si la URL es '/search', aquí se mostrará <SearchView />.
          - Si la URL es '/playlist/123', aquí se mostrará <PlaylistView />.
        */}
        <Outlet />
      </div>
      
      <Player />
    </div>
  );
}

export default MainLayout;