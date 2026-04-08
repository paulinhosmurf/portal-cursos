import React from 'react';
import { Clock } from 'lucide-react';
import { supabase } from './config/supabase';
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

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Carregando Portal...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  // Se temos usuário mas o perfil ainda não carregou (raro), aguardamos um pouco
  if (!userProfile) return <div className="flex-center" style={{ minHeight: '100vh' }}>Carregando Perfil...</div>;
  
  if (userProfile.status === 'pending') {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', textAlign: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
            color: '#fbbf24', border: '2px solid rgba(251, 191, 36, 0.2)'
          }}>
            <Clock className="spin-slow" size={40} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: 700 }}>Solicitação em análise</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
            Olá! Recebemos seu cadastro com sucesso. Para manter a segurança da nossa comunidade, um administrador revisará seu acesso em breve.
          </p>
          <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Você receberá acesso total assim que for aprovado.
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ 
              marginTop: '32px', background: 'transparent', border: '1px solid var(--border-color)', 
              color: 'var(--text-secondary)', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer' 
            }}
          >
            Sair da conta
          </button>
        </div>
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
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
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

