import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

function AlbumCard({ album }) {
  const { isLoggedIn } = useAuth();
  const { showToast } = useModal();

  // El `to` ahora siempre es `/playlist/ID`
  const linkTo = `/playlist/${album.id}`;

  const handleClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showToast('Debes iniciar sesión para ver los detalles.', 'error');
    }
  };

    return (
    // Le decimos que esta navegación se origina desde una vista pública.
    <Link to={linkTo} className="album-card" onClick={handleClick} state={{ isPublic: album.isPlaylist }}>
      <img src={album.cover} alt={`Portada de ${album.title}`} />
      <h4>{album.title}</h4>
      <p>{album.artists.join(', ')}</p>
    </Link>
  );
}

export default AlbumCard;