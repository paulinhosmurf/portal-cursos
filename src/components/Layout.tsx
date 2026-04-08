import React from 'react';
import { LogOut, User, Settings, LayoutDashboard, PlaySquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar Minimalista e Flutuante */}
      <header 
        style={{ 
          margin: '24px auto', 
          padding: '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          width: 'calc(100% - 48px)',
          borderRadius: '999px',
          background: 'rgba(23, 23, 23, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/">
            <motion.img 
              src="/images/Logo-Branca.PNG" 
              alt="Portal de Cursos" 
              style={{ height: '76px', objectFit: 'contain', cursor: 'pointer' }}
              whileHover={{ scale: 1.05, rotate: -1, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            />
          </Link>
          
          <nav style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>
              <LayoutDashboard size={18} /> Início
            </Link>
            {userProfile?.role === 'admin' && (
              <>
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}>
                  <Settings size={18} /> Painel Admin
                </Link>
                <Link to="/admin/conteudo" className={`nav-link ${location.pathname === '/admin/conteudo' ? 'nav-link-active' : ''}`}>
                  <PlaySquare size={18} /> Conteúdo
                </Link>
              </>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="flex-center" style={{ gap: '12px' }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }}>
               <User size={16} color="var(--text-primary)" />
             </div>
             <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
               {userProfile?.name || 'Carregando...'}
             </span>
          </div>
          <button onClick={handleSignOut} className="icon-btn" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Área Centralizada */}
      <main style={{ flex: 1, padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%', overflow: 'visible' }}>
        <motion.div 
          className="glass-panel" 
          style={{ minHeight: '80vh', padding: '32px' }}
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
