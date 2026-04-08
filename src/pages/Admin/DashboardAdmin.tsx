import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../config/supabase';
import type { UserProfile } from '../../types';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import ContentBuilder from '../../components/Admin/ContentBuilder';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardAdmin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tab, setTab] = useState<'users' | 'content'>('users');

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Sort: Pendents first
      const usersData = data as UserProfile[];
      usersData.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return 0;
      });
      setUsers(usersData);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Setup Supabase Realtime for instant UI
    const channel = supabase.channel('user-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatus = async (id: string, newStatus: 'active' | 'pending') => {
    await supabase.from('user_profiles').update({ status: newStatus }).eq('id', id);
  };

  const handleRole = async (id: string, newRole: 'admin' | 'user') => {
    await supabase.from('user_profiles').update({ role: newRole }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Excluir este perfil permanentemente?')) {
      await supabase.from('user_profiles').delete().eq('id', id);
      // Not calling supabase.auth.admin.deleteUser here due to client side permissions, but profile is deleted.
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <div className="pill-tabs-container">
          <button 
            className={`pill-tab ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            {tab === 'users' && <motion.div layoutId="tab-pill" className="pill-tab-active-bg" />}
            Gestão de Acessos
          </button>
          <button 
            className={`pill-tab ${tab === 'content' ? 'active' : ''}`}
            onClick={() => setTab('content')}
          >
            {tab === 'content' && <motion.div layoutId="tab-pill" className="pill-tab-active-bg" />}
            Criar Conteúdo
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
      {tab === 'users' && (
        <motion.div 
          key="users-tab"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className="glass-panel" 
          style={{ padding: '24px' }}
        >
          <h2 style={{ marginBottom: '24px' }}>Usuários e Solicitações</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>ID do Supabase</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any, index: number) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <td style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 500 }}>{u.name}</span>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.id.substring(0, 8)}...</td>
                    <td>
                      {u.status === 'pending' ? 
                        <span style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Pendente</span> : 
                        <span style={{ color: 'var(--success-color)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Ativo</span>
                      }
                    </td>
                    <td>
                      <span style={{ color: u.role === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                      {u.status === 'pending' ? (
                        <>
                          <button className="icon-btn" onClick={() => handleStatus(u.id, 'active')} title="Aprovar" style={{ color: 'var(--success-color)' }}><CheckCircle2 size={20}/></button>
                          <button className="icon-btn" onClick={() => handleDelete(u.id)} title="Recusar" style={{ color: 'var(--danger-color)' }}><XCircle size={20}/></button>
                        </>
                      ) : (
                        <>
                          <button className="icon-btn" onClick={() => handleStatus(u.id, 'pending')} title="Suspender" style={{ color: '#fbbf24' }}><ShieldAlert size={20}/></button>
                          {u.role === 'user' ? (
                            <button className="icon-btn" onClick={() => handleRole(u.id, 'admin')} title="Promover a Admin" style={{ color: '#a855f7' }}><ShieldCheck size={20}/></button>
                          ) : (
                            <button className="icon-btn" onClick={() => handleRole(u.id, 'user')} title="Revogar Admin" style={{ color: 'var(--text-secondary)' }}><ShieldAlert size={20}/></button>
                          )}
                          <button className="icon-btn" onClick={() => handleDelete(u.id)} title="Excluir Definitivamente" style={{ color: 'var(--danger-color)' }}><XCircle size={20}/></button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum usuário encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'content' && (
        <motion.div 
          key="content-tab"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          <ContentBuilder />
        </motion.div>
      )}
      </AnimatePresence>
    </Layout>
  );
}
