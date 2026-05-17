import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navLinks = [
  { label: 'Inicio', path: '/', icon: '🏠' },
  { label: 'Productos', path: '/productos', icon: '📦' },
  { label: 'Clientes', path: '/clientes', icon: '👥' },
  { label: 'Pagos', path: '/pagos', icon: '💳' },
  { label: 'Reportes', path: '/reportes', icon: '📊' },
  { label: 'Usuarios', path: '/usuarios', icon: '🧑‍💼' },
  { label: 'Órdenes', path: '/ordenes', icon: '📝' },
  { label: 'Inventario', path: '/inventario', icon: '📋' },
  { label: 'Categorías', path: '/categorias', icon: '🏷️' },
  { label: 'Configuración', path: '/configuracion', icon: '⚙️' },
]

function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">💊</span>
          <div>
            <h2>Cápsula</h2>
            <p>Panel administrativo</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-avatar">
              {user?.nombre?.charAt(0) || 'U'}
            </span>
            <div>
              <p>{user?.nombre || 'Usuario'}</p>
              <small>{user?.rol || 'Sin rol'}</small>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="navbar">
          <div>
            <p className="navbar-path">Dashboard</p>
            <h1 className="navbar-title">Panel administrativo</h1>
          </div>
          <div className="navbar-user-info">
            <span>Bienvenido</span>
            <strong>{user?.nombre}</strong>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default DashboardLayout
