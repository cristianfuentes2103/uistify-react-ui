import { NavLink } from 'react-router-dom';

// El componente `NavLink` es una versión especial de `Link` que sabe si está "activo".

function Nav() { 
  
  return (
    <nav className="sidebar-block main-nav">
      {/* 
        - `to="/"`: La URL a la que navegará.
        - `className`: Puede ser una función para aplicar una clase si el enlace está activo.
      */}
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <i className="icon-home"></i>
        <span>Home</span>
      </NavLink>
      
      <NavLink 
        to="/search" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <i className="icon-search"></i>
        <span>Buscar</span>
      </NavLink>
    </nav>
  );
}

export default Nav;