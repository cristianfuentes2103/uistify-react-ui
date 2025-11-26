import { NavLink } from 'react-router-dom';

function Nav() {
  return (
    <nav className="sidebar-block main-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <i className="icon-home"></i>
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <i className="icon-search"></i>
        <span>Buscar</span>
      </NavLink>
      <NavLink to="/artist" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <i className="icon-artist"></i> 
        <span>Artista</span>
      </NavLink>
    </nav>
  );
}

export default Nav;