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
      {/* Top Navbar Responsiva e Compacta */}
      <header 
        style={{ 
          margin: isMobile ? '8px auto' : '24px auto', 
          padding: isMobile ? '6px 12px' : '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
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
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '32px', flex: 1, minWidth: 0 }}>
          <Link to="/" style={{ flexShrink: 0 }}>
            <motion.img 
              src="/images/Logo-Branca.PNG" 
              alt="Portal de Cursos" 
              style={{ height: isMobile ? '28px' : '76px', objectFit: 'contain', cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>
          
          <div className={isMobile ? "nav-scroll-container" : ""} style={{ 
            display: 'flex', 
            gap: isMobile ? '4px' : '8px', 
            flex: 1, 
            minWidth: 0,
            justifyContent: isMobile ? 'flex-start' : 'center'
          }}>
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'nav-link-active' : ''}`}
                style={{
                  fontSize: isMobile ? '0.75rem' : '0.9rem',
                  padding: isMobile ? '6px 10px' : '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <item.icon size={isMobile ? 14 : 18} /> {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '24px', flexShrink: 0 }}>
          {!isMobile && (
            <div className="flex-center" style={{ gap: '6px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }}>
                <User size={14} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {userProfile?.name?.split(' ')[0] || '...'}
              </span>
            </div>
          )}
          <button onClick={handleSignOut} className="icon-btn" title="Sair" style={{ padding: '6px' }}>
            <LogOut size={isMobile ? 16 : 20} />
          </button>
        </div>
      </header>

      {/* Main Content Área Centralizada */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '8px 8px 16px 8px' : '0 24px 24px 24px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%', 
        overflow: 'visible' 
      }}>
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

      {/* Bottom Navigation para Mobile */}
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
              width: 'calc(100% - 32px)',
              maxWidth: '430px',
              height: '66px',
              background: 'rgba(15, 15, 15, 0.85)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 12px',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    position: 'relative',
                    height: '100%',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span style={{ fontSize: '0.6rem', fontWeight: isActive ? '700' : '500', letterSpacing: '0.02em' }}>
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
