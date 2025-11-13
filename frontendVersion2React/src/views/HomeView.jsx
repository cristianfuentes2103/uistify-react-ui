import { useState, useEffect } from 'react';
import { allPlaylists } from '../utils/mockData';
import { chunkArray } from '../utils/arrayUtils'; 
import UserMenu from '../components/UserMenu';
import AlbumShelf from '../components/AlbumShelf'; 
import { useAuth } from '../context/AuthContext';

const ALBUMS_PER_ROW = 12; 

function HomeView() {
  // Guardaremos los álbumes ya agrupados en filas
  const [albumRows, setAlbumRows] = useState([]);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Agrupamos los datos en filas cuando el componente se monta
    const rows = chunkArray(allPlaylists, ALBUMS_PER_ROW);
    setAlbumRows(rows);
  }, []); // El array vacío asegura que se ejecute solo una vez

  return (
    <main id="home-view-content" className="content-area">
      <header className="main-header">
        {isLoggedIn && <UserMenu />}
      </header>

      <h1 className="welcome-message">Bienvenido a UisTiFy</h1>

      {/* --- RENDERIZADO DE LAS FILAS DEL CARRUSEL --- */}
      {/* Mapeamos sobre las filas y renderizamos un AlbumShelf por cada una */}
      {albumRows.map((row, index) => (
        <AlbumShelf key={index} albums={row} />
      ))}
    </main>
  );
}

export default HomeView;