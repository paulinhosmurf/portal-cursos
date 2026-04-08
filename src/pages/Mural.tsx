import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Megaphone, Plus, Trash2, Pencil, Calendar, AlertCircle, X, Save } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Aviso } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

export default function Mural() {
  const { currentUser, userProfile } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  const fetchAvisos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .order('is_important', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) setAvisos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const handleOpenModal = (aviso?: Aviso) => {
    if (aviso) {
      setEditingAviso(aviso);
      setTitle(aviso.title);
      setContent(aviso.content);
      setIsImportant(aviso.is_important);
    } else {
      setEditingAviso(null);
      setTitle('');
      setContent('');
      setIsImportant(false);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Por favor, preencha o título e o conteúdo.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      content,
      is_important: isImportant,
      admin_id: currentUser?.id
    };

    let error;
    if (editingAviso) {
      const { error: err } = await supabase
        .from('avisos')
        .update(payload)
        .eq('id', editingAviso.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('avisos')
        .insert([payload]);
      error = err;
    }

    if (error) {
      alert('Erro ao salvar aviso: ' + error.message);
    } else {
      setShowModal(false);
      fetchAvisos();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este aviso?')) return;
    
    const { error } = await supabase.from('avisos').delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else fetchAvisos();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-color)', padding: '12px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
            <Megaphone size={28} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Mural de Avisos</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fique por dentro das atualizações oficiais.</p>
          </div>
        </div>

        {isAdmin && (
          <button 
            className="btn-primary" 
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} /> Novo Aviso
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando avisos...</p>
        ) : avisos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
            <AlertCircle size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum aviso postado ainda.</p>
          </div>
        ) : (
          avisos.map((aviso) => (
            <motion.div 
              key={aviso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ 
                padding: '24px', 
                borderLeft: aviso.is_important ? '4px solid #ef4444' : '1px solid var(--border-color)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {aviso.is_important && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>
                        Importante
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{aviso.title}</h3>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn-action btn-edit" onClick={() => handleOpenModal(aviso)}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn-action btn-delete" onClick={() => handleDelete(aviso.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div 
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: aviso.content }}
                style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL PARA ADMIN */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>{editingAviso ? 'Editar Aviso' : 'Novo Aviso'}</h3>
                <button onClick={() => setShowModal(false)} className="icon-btn-action">
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Título do Aviso</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Novo módulo liberado!"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', width: '100%', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Conteúdo</label>
                  <RichTextEditor value={content} onChange={setContent} placeholder="Descreva o aviso aqui..." />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={isImportant} 
                    onChange={(e) => setIsImportant(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                  />
                  <span>Marcar como Importante (Destaque Vermelho)</span>
                </label>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleSave} 
                    disabled={submitting}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={20} /> {submitting ? 'Salvando...' : 'Publicar Aviso'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .rich-content img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
        .rich-content iframe { width: 100%; aspect-ratio: 16/9; border-radius: 8px; margin: 12px 0; }
        .rich-content a { color: var(--primary-color); }
        .ql-container.ql-snow { border: 1px solid var(--border-color) !important; border-radius: 0 0 8px 8px; background: rgba(0,0,0,0.2); }
        .ql-toolbar.ql-snow { border: 1px solid var(--border-color) !important; border-radius: 8px 8px 0 0; background: rgba(255,255,255,0.05); }
      `}</style>
    </Layout>
  );
}
