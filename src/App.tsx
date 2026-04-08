import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Tema from './pages/Tema';
import Aula from './pages/Aula';
import DashboardAdmin from './pages/Admin/DashboardAdmin';
import ConteudoAdmin from './pages/Admin/ConteudoAdmin';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Carregando...</div>;
  if (!currentUser || !userProfile) return <Navigate to="/login" />;
  
  if (userProfile.status === 'pending') {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>Conta em Análise</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Sua conta foi criada com sucesso, mas aguarda aprovação de um administrador.</p>
      </div>
    );
  }

  if (requireAdmin && userProfile.role !== 'admin') {
    return <Navigate to="/" />; // Redirect to home if not admin
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/tema/:id" element={
            <ProtectedRoute>
              <Tema />
            </ProtectedRoute>
          } />

          <Route path="/aula/:id" element={
            <ProtectedRoute>
              <Aula />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/conteudo" element={
            <ProtectedRoute requireAdmin={true}>
              <ConteudoAdmin />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

