import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Layouts
import AuthLayout     from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Pages
import Login         from '../pages/Login'
import Dashboard     from '../pages/Dashboard'
import Productos     from '../pages/Productos'
import Categorias    from '../pages/Categorias'
import Inventario    from '../pages/Inventario'
import Clientes      from '../pages/Clientes'
import Ordenes       from '../pages/Ordenes'
import Pagos         from '../pages/Pagos'
import Usuarios      from '../pages/Usuarios'
import Reportes      from '../pages/Reportes'
import Configuracion from '../pages/Configuracion'

// 🔒 Ruta protegida: redirige al login si no hay sesión
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── Rutas públicas ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ── Rutas protegidas ── */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/productos"     element={<Productos />} />
        <Route path="/categorias"    element={<Categorias />} />
        <Route path="/inventario"    element={<Inventario />} />
        <Route path="/clientes"      element={<Clientes />} />
        <Route path="/ordenes"       element={<Ordenes />} />
        <Route path="/pagos"         element={<Pagos />} />
        <Route path="/usuarios"      element={<Usuarios />} />
        <Route path="/reportes"      element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>

      {/* ── Ruta no encontrada ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
