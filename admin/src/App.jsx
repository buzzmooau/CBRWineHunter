import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminWines from './pages/AdminWines';
import AdminReview from './pages/AdminReview';
import WineForm from './pages/WineForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to admin login */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/wines" 
            element={
              <ProtectedRoute>
                <AdminWines />
              </ProtectedRoute>
            } 
          />
          
          {/* NEW: Review Route */}
          <Route 
            path="/admin/review" 
            element={
              <ProtectedRoute>
                <AdminReview />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/wines/new" 
            element={
              <ProtectedRoute>
                <WineForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/wines/:id/edit" 
            element={
              <ProtectedRoute>
                <WineForm />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
