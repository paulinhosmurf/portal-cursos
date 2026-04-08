import React, { useState, useEffect } from 'react';
import { LogOut, User, Settings, LayoutDashboard, PlaySquare, Megaphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Início', icon: LayoutDashboard },
    { path: '/conteudo', label: 'Conteúdo', icon: PlaySquare },
    { path: '/mural', label: 'Mural', icon: Megaphone },
    ...(userProfile?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '80px' : '0' }}>
      {/* Top Navbar Minimalista - Oculta no Mobile em favor do novo layout de marca */}
      <header 
        style={{ 
          margin: isMobile ? '8px auto' : '24px auto', 
          padding: isMobile ? '8px 16px' : '12px 24px', 
          display: isMobile ? 'none' : 'flex', 
          justifyContent: isMobile ? 'center' : 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          width: isMobile ? 'calc(100% - 16px)' : 'calc(100% - 48px)',
          borderRadius: '999px',
          background: 'rgba(15, 15, 15, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(25px)',
          zIndex: 100,
          position: isMobile ? 'sticky' : 'relative',
          top: isMobile ? '8px' : 'auto',
          height: isMobile ? '44px' : 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/">
            <motion.img 
              src="/images/Logo-Branca.PNG" 
              alt="Portal de Cursos" 
              style={{ height: isMobile ? '24px' : '76px', objectFit: 'contain', cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>
          
          {!isMobile && (
            <nav style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'nav-link-active' : ''}`}
                >
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="flex-center" style={{ gap: '6px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }}>
                <User size={14} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {userProfile?.name || '...'}
              </span>
            </div>
            <button onClick={handleSignOut} className="icon-btn" title="Sair" style={{ padding: '6px' }}>
              <LogOut size={20} />
            </button>
          </div>
        )}
      </header>

      {/* Main Content Área Centralizada */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '0 12px 24px 12px' : '0 24px 24px 24px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%', 
        overflow: 'visible' 
      }}>
        {/* Nova Posição do Logo no Mobile - Maior e Visível */}
        {isMobile && (
          <div className="mobile-brand-header">
            <Link to="/">
              <motion.img 
                src="/images/Logo-Branca.PNG" 
                alt="Portal de Cursos"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              />
            </Link>
          </div>
        )}

        <motion.div 
          className="glass-panel" 
          style={{ minHeight: '80vh', padding: isMobile ? '20px' : '32px', borderRadius: isMobile ? '24px' : '32px' }}
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation para Mobile - Única Fonte de Navegação */}
      <AnimatePresence>
        {isMobile && (
          <motion.nav 
            initial={{ y: 100, x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            exit={{ y: 100, x: "-50%" }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              width: 'calc(100% - 16px)',
              maxWidth: '430px',
              height: '68px',
              background: 'rgba(15, 15, 15, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '0 8px',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {[...navItems, { path: 'logout', label: 'Sair', icon: LogOut }].map((item) => {
              const isActive = location.pathname === item.path;
              const isLogout = item.path === 'logout';

              const handleClick = (e: React.MouseEvent) => {
                if (isLogout) {
                  e.preventDefault();
                  handleSignOut();
                }
              };

              return (
                <Link 
                  key={item.path}
                  to={isLogout ? "#" : item.path}
                  onClick={handleClick}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    position: 'relative',
                    height: '100%',
                    transition: 'color 0.2s ease',
                    minWidth: 0
                  }}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span style={{ 
                    fontSize: '0.55rem', 
                    fontWeight: isActive ? '700' : '500', 
                    letterSpacing: '-0.01em',
                    width: '100%',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottomNavActive"
                      style={{ 
                        position: 'absolute', 
                        bottom: '8px', 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        background: 'var(--text-primary)',
                        filter: 'drop-shadow(0 0 4px var(--text-primary))'
                      }} 
                    />
                  )}
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
