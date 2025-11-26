import { useNavigate } from 'react-router-dom';

function ArtistDashboardView() {
  const navigate = useNavigate();

  return (
    <main className="content-area">
      <header className="main-header-list">
        <div className="navigation-arrows">
          <button className="arrow-btn back-btn" onClick={() => navigate(-1)}>
            <i className="icon-arrow-left"></i>
          </button>
        </div>
      </header>

      <div style={{ padding: '0 32px' }}>
        <h1>Panel de Artista</h1>
        <p style={{ color: '#b3b3b3' }}>
          ¡Bienvenido a tu panel! Desde aquí podrás gestionar tus álbumes y subir tus canciones.
        </p>

        {/* Placeholder para el botón de subir canciones */}
        <div style={{ marginTop: '30px' }}>
          <button className="btn btn-primary">Subir Canción</button>
        </div>
      </div>
    </main>
  );
}

export default ArtistDashboardView;