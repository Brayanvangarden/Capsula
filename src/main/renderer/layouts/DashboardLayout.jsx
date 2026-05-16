import { Outlet } from 'react-router-dom'

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        {/* <Sidebar /> → lo agregaremos después */}
      </aside>

      {/* Contenido principal */}
      <main className="main-content">

        {/* Navbar */}
        <header className="navbar">
          {/* <Navbar /> → lo agregaremos después */}
        </header>

        {/* Páginas */}
        <section className="page-content">
          <Outlet />
        </section>

      </main>
    </div>
  )
}

export default DashboardLayout
