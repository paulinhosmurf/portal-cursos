import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { autoEmbedUrls } from '../utils/autoEmbed';
import { ArrowLeft, Pencil, X, Save } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Aula } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

export default function AulaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  const fetchAula = async () => {
    if (!id) return;
    const { data } = await supabase.from('aulas').select('*').eq('id', id).single();
    if (data) {
      setAula(data);
      setEditTitle(data.title);
      setEditContent(data.content);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAula();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!id || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('aulas')
      .update({ title: editTitle, content: editContent })
      .eq('id', id);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setIsEditing(false);
      fetchAula();
    }
    setSaving(false);
  };

  // Convert raw HTML into embedded players if applicable
  const processedHtml = useMemo(() => {
    if (!aula) return '';
    return autoEmbedUrls(aula.content);
  }, [aula]);

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="icon-btn" 
            style={{ background: 'rgba(255,255,255,0.05)', gap: '8px', padding: '8px 16px', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          {isAdmin && !loading && aula && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <Pencil size={16} /> Editar Aula
            </button>
          )}
        </div>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando conteúdo da aula...</p>
        ) : !aula ? (
          <p style={{ color: 'var(--danger-color)' }}>Aula não encontrada.</p>
        ) : (
          <>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h1 style={{ color: 'var(--primary-color)' }}>{aula.title}</h1>
            </div>

            {/* Rich Text Rendered View */}
            <div 
              className="aula-render-content"
              style={{ lineHeight: '1.6', fontSize: '1rem', color: 'var(--text-primary)', padding: 0 }}
              dangerouslySetInnerHTML={{ __html: processedHtml }} 
            />
          </>
        )}

        {/* Modal de Edição para Admin */}
        <AnimatePresence>
          {isEditing && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3>Editar Aula</h3>
                  <button onClick={() => setIsEditing(false)} className="icon-btn-action">
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Título da Aula" 
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  <RichTextEditor value={editContent} onChange={setEditContent} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" onClick={handleSaveEdit} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
