import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ButtonIconSVG = () => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="icon">
        <path clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" fillRule="evenodd"></path>
    </svg>
);

function AuthView() { 
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { login, register } = useAuth();
    const mode = searchParams.get('mode') || 'login';
    const showRegister = mode === 'register';

    // Estados para los campos del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
    }, [showRegister]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);

            // Si el login tiene éxito, navegamos a la página principal.
            navigate('/');
        } catch (err) {
            setError('Correo o contraseña incorrectos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password);
            // Si el registro tiene éxito, también navegamos a la principal
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para alternar la vista y actualizar la URL
    const toggleAuthMode = (e) => {
        e.preventDefault();
        const newMode = showRegister ? 'login' : 'register';
        setSearchParams({ mode: newMode });
    };

    // Función para el botón "Regresar a Home"
    const handleBackToHome = () => {
        navigate('/');
    };

    // --- LÓGICA DE LA ANIMACIÓN DEL YETI ---
    const pupilLeftRef = useRef(null);
    const pupilRightRef = useRef(null);
    
    useEffect(() => {
    const pupilMoveRadius = 50;
    const moveEye = (eyeElement, event) => {
      if (!eyeElement) return;
      const eyeRect = eyeElement.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;
      const angle = Math.atan2(event.clientY - eyeCenterY, event.clientX - eyeCenterX);
      const newPupilX = pupilMoveRadius * Math.cos(angle);
      const newPupilY = pupilMoveRadius * Math.sin(angle);
      eyeElement.style.transform = `translate(${newPupilX}px, ${newPupilY}px)`;
    };
    
    const handleMouseMove = (event) => {
      moveEye(pupilLeftRef.current, event);
      moveEye(pupilRightRef.current, event);
    };

    // Añadimos el listener cuando el componente se monta
    window.addEventListener('mousemove', handleMouseMove);

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); 
    // --- COMPONENTE SVG DEL YETI CON `ref`s ---
    const YetiSVG = () => (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
            <title>mascotaUisTiFy</title>
            <g id="eyes">
                <g id="eye-left">
                    <circle cx="630" cy="1000" r="100" fill="white" />
                    <circle cx="630" cy="1000" r="90" fill="#AED6F1" />
                    <circle ref={pupilLeftRef} id="pupil-left" cx="630" cy="1000" r="50" fill="#2C3E50" />
                    <circle cx="590" cy="960" r="30" fill="white" />
                </g>
                <g id="eye-right">
                    <circle cx="970" cy="1030" r="100" fill="white" />
                    <circle cx="970" cy="1030" r="90" fill="#AED6F1" />
                    <circle ref={pupilRightRef} id="pupil-right" cx="970" cy="1030" r="50" fill="#2C3E50" />
                    <circle cx="930" cy="980" r="30" fill="white" />
                </g>
            </g>
        </svg>
    );

    return (
        <>
            <div className="container">
                <div id="auth-view" className="view">
                    <div className="logo-container" title="Logo de UistiFy">
                        <img src="/img/UisTiFy.png" alt="Logo de UistiFy" />
                    </div>
                    <div className="form-container">
                        <div className="yeti-container">
                            <YetiSVG />
                        </div>
                        {showRegister ? (
                            <form id="register-form" onSubmit={handleRegisterSubmit}>
                                <h2>Crear Cuenta</h2>
                                <input type="text" placeholder="Nombre" required value={name} onChange={e => setName(e.target.value)} />
                                <input type="email" placeholder="Correo electrónico" required value={email} onChange={e => setEmail(e.target.value)} />
                                <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} />
                                <button className="button" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Registrando...' : 'Registrarse'}
                                    <ButtonIconSVG />
                                </button>
                            </form>
                        ) : (
                            <form id="login-form" onSubmit={handleLoginSubmit}>
                                <h2>Iniciar Sesión</h2>
                                <input type="email" placeholder="Correo electrónico" required value={email} onChange={e => setEmail(e.target.value)} />
                                <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} />
                                <button className="button" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Ingresando...' : 'Ingresar a UisTiFy'}
                                    <ButtonIconSVG />
                                </button>
                            </form>
                        )}
                        <div className="toggle-container">
                            <a href="#" onClick={toggleAuthMode}>
                                {showRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </a>
                        </div>
                        {error && <p id="error-message" className="error">{error}</p>}
                        <div className="main-header-auth">
                            <div className="navigation-arrows-auth">
                                <button title="Regresar a Home" className="auth-btn" onClick={handleBackToHome}>
                                    <i className="icon-arrow-left-auth"></i>Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer id="main-footer" className="footer">
                <p>© 2025 UisTify Todos los derechos reservados.</p>
            </footer>
        </>
    );
}

export default AuthView;