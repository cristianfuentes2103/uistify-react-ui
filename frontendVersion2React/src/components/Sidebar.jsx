import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import Library from './Library';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className={`sidebar-block user-auth ${isLoggedIn ? 'empty' : ''}`}>
        {!isLoggedIn && (
          <div className="auth-buttons">
            {/* El botón de Login navega a /auth (o /auth?mode=login) */}
            <button onClick={() => navigate('/auth?mode=login')} className="btn btn-primary">
              Iniciar Sesión
            </button>
            {/* El botón de Registro navega a /auth?mode=register */}
            <button onClick={() => navigate('/auth?mode=register')} className="btn btn-secondary">
              Registrarse
            </button>
          </div>
        )}
      </div>
      
      <Nav />
      <Library isLoggedIn={isLoggedIn} />
    </aside>
  );
}

export default Sidebar;