import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

function MainLayout() {
  return (
    <div id="main-view" className="view">
      <Sidebar />
      <div className="main-content">
        {/* Outlet es el marcador de posición donde React Router renderizará
            la ruta anidada que coincida (HomeView, SearchView, etc.) */}
        <Outlet />
      </div>
      <Player />
    </div>
  );
}
export default MainLayout;