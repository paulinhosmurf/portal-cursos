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
import Mural from './pages/Mural';

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
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Permitir clique direito em campos de texto para colar/copiar
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('.ql-editor')
      ) {
        return;
      }
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      // Bloquear cópia exceto em inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('.ql-editor')
      ) {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Bloquear Ctrl+Shift+I (Inspeção), Ctrl+Shift+C, Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) {
        e.preventDefault();
      }
      // Bloquear Ctrl+U (Ver código fonte)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
      // Bloquear Ctrl+S (Salvar página)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

          <Route path="/mural" element={
            <ProtectedRoute>
              <Mural />
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

          <Route path="/conteudo" element={
            <ProtectedRoute>
              <ConteudoAdmin />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

