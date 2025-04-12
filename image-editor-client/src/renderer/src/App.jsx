import { Route, Routes, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Gallery from './pages/Gallery'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/gallery" replace /> : <Auth />} 
      />
      
      <Route 
        path="/gallery" 
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/gallery" : "/"} replace />} 
      />
    </Routes>
  )
}

export default App