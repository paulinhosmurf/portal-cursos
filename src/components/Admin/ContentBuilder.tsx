import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import type { Tema, Modulo, Aula } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Save, Settings } from 'lucide-react';

export default function ContentBuilder() {
  const [builderTab, setBuilderTab] = useState<'tema' | 'modulo' | 'aula'>('tema');
  
  // States de Listagem
  const [temas, setTemas] = useState<Tema[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // States de Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Tema
  const [temaName, setTemaName] = useState('');
  const [temaDesc, setTemaDesc] = useState('');
  const [temaColor, setTemaColor] = useState('');
  const [temaBorder, setTemaBorder] = useState('');

  // Form Módulo
  const [modTemaId, setModTemaId] = useState('');
  const [modName, setModName] = useState('');

  // Form Aula
  const [aulaModId, setAulaModId] = useState('');
  const [aulaTitle, setAulaTitle] = useState('');
  const [aulaContent, setAulaContent] = useState('');

  // Cores dinâmicas
  const themeColors = [
    { name: 'Indigo', color: 'rgba(99, 102, 241, 0.1)', border: '#6366f1' },
    { name: 'Verde', color: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' },
    { name: 'Vermelho', color: 'rgba(239, 68, 68, 0.1)', border: '#ef4444' },
    { name: 'Roxo', color: 'rgba(168, 85, 247, 0.1)', border: '#a855f7' },
    { name: 'Amarelo', color: 'rgba(234, 179, 8, 0.1)', border: '#eab308' },
    { name: 'Ciano', color: 'rgba(6, 182, 212, 0.1)', border: '#06b6d4' }
  ];

  const fetchAllData = async () => {
    setLoadingList(true);
    const { data: temasData } = await supabase.from('temas').select('*').order('created_at', { ascending: true });
    if (temasData) setTemas(temasData);

    const { data: modsData } = await supabase.from('modulos').select('*').order('order', { ascending: true });
    if (modsData) setModulos(modsData);

    const { data: aulasData } = await supabase.from('aulas').select('*').order('created_at', { ascending: true });
    if (aulasData) setAulas(aulasData);
    setLoadingList(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [builderTab]);

  const resetForms = () => {
    setEditingId(null);
    setTemaName(''); setTemaDesc(''); setTemaColor(''); setTemaBorder('');
    setModName(''); setModTemaId('');
    setAulaTitle(''); setAulaContent(''); setAulaModId('');
  };

  const handleSaveTema = async () => {
    if (!temaName || !temaDesc) return alert('Preencha nome e descrição.');
    
    // Se não selecionou cor, pega a primeira por padrão
    const finalColor = temaColor || themeColors[0].color;
    const finalBorder = temaBorder || themeColors[0].border;

    if (editingId) {
      const { error } = await supabase.from('temas').update({ 
        name: temaName, 
        description: temaDesc,
        color: finalColor,
        border: finalBorder
      }).eq('id', editingId);
      if (error) alert('Erro ao atualizar: ' + error.message);
      else { alert('Tema atualizado!'); resetForms(); fetchAllData(); }
    } else {
      const { error } = await supabase.from('temas').insert([{ 
        name: temaName, 
        description: temaDesc, 
        color: finalColor, 
        border: finalBorder 
      }]);
      if (error) alert('Erro ao criar: ' + error.message);
      else { alert('Tema criado!'); resetForms(); fetchAllData(); }
    }
  };

  const handleSaveModulo = async () => {
    if (!modTemaId || !modName) return alert('Selecione um tema e digite o nome do módulo.');
    
    if (editingId) {
      const { error } = await supabase.from('modulos').update({ tema_id: modTemaId, name: modName }).eq('id', editingId);
      if (error) alert('Erro ao atualizar: ' + error.message);
      else { alert('Módulo atualizado!'); resetForms(); fetchAllData(); }
    } else {
      const { error } = await supabase.from('modulos').insert([{ tema_id: modTemaId, name: modName }]);
      if (error) alert('Erro ao criar: ' + error.message);
      else { alert('Módulo criado!'); resetForms(); fetchAllData(); }
    }
  };

  const handleSaveAula = async () => {
    if (!aulaModId || !aulaTitle || !aulaContent) return alert('Preencha os campos da Aula.');
    
    if (editingId) {
      const { error } = await supabase.from('aulas').update({ modulo_id: aulaModId, title: aulaTitle, content: aulaContent }).eq('id', editingId);
      if (error) alert('Erro ao atualizar: ' + error.message);
      else { alert('Aula atualizada!'); resetForms(); fetchAllData(); }
    } else {
      const { error } = await supabase.from('aulas').insert([{ modulo_id: aulaModId, title: aulaTitle, content: aulaContent }]);
      if (error) alert('Erro ao criar: ' + error.message);
      else { alert('Aula Publicada!'); resetForms(); fetchAllData(); }
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('Tem certeza? Isso pode apagar conteúdos vinculados.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else fetchAllData();
  };

  const startEditTema = (t: Tema) => {
    setEditingId(t.id);
    setTemaName(t.name);
    setTemaDesc(t.description || '');
    setTemaColor(t.color || '');
    setTemaBorder(t.border || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditModulo = (m: Modulo) => {
    setEditingId(m.id);
    setModTemaId(m.tema_id || '');
    setModName(m.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditAula = (a: Aula) => {
    setEditingId(a.id);
    setAulaModId(a.modulo_id || '');
    setAulaTitle(a.title);
    setAulaContent(a.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="pill-tabs-container" style={{ alignSelf: 'flex-start' }}>
        {['tema', 'modulo', 'aula'].map((t) => (
          <button 
            key={t}
            className={`pill-tab ${builderTab === t ? 'active' : ''}`}
            onClick={() => { setBuilderTab(t as any); resetForms(); }}
            style={{ textTransform: 'capitalize' }}
          >
            {builderTab === t && <motion.div layoutId="builder-tab-pill" className="pill-tab-active-bg" />}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={builderTab}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
          className="glass-panel" style={{ padding: '32px' }}
        >
          {/* FORMULÁRIOS */}
          <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>{editingId ? 'Editar' : 'Criar Novo'} {builderTab === 'tema' ? 'Tema' : builderTab === 'modulo' ? 'Módulo' : 'Aula'}</h3>
              {editingId && (
                <button onClick={resetForms} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Cancelar Edição
                </button>
              )}
            </div>

            {builderTab === 'tema' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <input type="text" className="input-field" placeholder="Nome do Tema" value={temaName} onChange={e => setTemaName(e.target.value)} />
                <textarea className="input-field" placeholder="Breve descrição" rows={3} value={temaDesc} onChange={e => setTemaDesc(e.target.value)} />
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cor de Destaque</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {themeColors.map(tc => (
                      <button
                        key={tc.name}
                        onClick={() => { setTemaColor(tc.color); setTemaBorder(tc.border); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: tc.border, border: (temaBorder === tc.border) ? '3px solid white' : 'none',
                          cursor: 'pointer', transition: 'all 0.2s',
                          transform: (temaBorder === tc.border) ? 'scale(1.2)' : 'scale(1)'
                        }}
                        title={tc.name}
                      />
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveTema}>
                  {editingId ? <><Save size={18} /> Salvar Alterações</> : 'Cadastrar Tema'}
                </button>
              </div>
            )}

            {builderTab === 'modulo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <select className="input-field" value={modTemaId} onChange={e => setModTemaId(e.target.value)}>
                  <option value="">Selecione um Tema...</option>
                  {temas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="text" className="input-field" placeholder="Nome do Módulo" value={modName} onChange={e => setModName(e.target.value)} />
                <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveModulo}>
                  {editingId ? <><Save size={18} /> Salvar Alterações</> : 'Cadastrar Módulo'}
                </button>
              </div>
            )}

            {builderTab === 'aula' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <select className="input-field" value={aulaModId} onChange={e => setAulaModId(e.target.value)} style={{ flex: 1, minWidth: '200px' }}>
                    <option value="">Selecione um Módulo...</option>
                    {modulos.map(m => {
                      const tema = temas.find(t => t.id === m.tema_id);
                      return <option key={m.id} value={m.id}>[{tema?.name}] - {m.name}</option>;
                    })}
                  </select>
                  <input type="text" className="input-field" placeholder="Título da Aula" value={aulaTitle} onChange={e => setAulaTitle(e.target.value)} style={{ flex: 2, minWidth: '300px' }} />
                </div>
                <RichTextEditor value={aulaContent} onChange={setAulaContent} />
                <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveAula}>
                  {editingId ? <><Save size={18} /> Salvar Alterações</> : 'Publicar Aula'}
                </button>
              </div>
            )}
          </div>

          {/* LISTAGEM PARA GESTÃO */}
          <div>
            <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> Gerenciar {builderTab === 'tema' ? 'Temas' : builderTab === 'modulo' ? 'Módulos' : 'Aulas'}
            </h4>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {loadingList ? (
                <p style={{ color: 'var(--text-secondary)' }}>Carregando lista...</p>
              ) : (
                <>
                  {builderTab === 'tema' && temas.map(t => (
                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{t.name}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn-action" onClick={() => startEditTema(t)}><Pencil size={14} /></button>
                        <button className="icon-btn-action" onClick={() => handleDelete('temas', t.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}

                  {builderTab === 'modulo' && modulos.map(m => (
                    <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{m.name}</span>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Tema: {temas.find(t => t.id === m.tema_id)?.name}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn-action" onClick={() => startEditModulo(m)}><Pencil size={14} /></button>
                        <button className="icon-btn-action" onClick={() => handleDelete('modulos', m.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}

                  {builderTab === 'aula' && aulas.map(a => (
                    <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{a.title}</span>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Módulo: {modulos.find(m => m.id === a.modulo_id)?.name}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn-action" onClick={() => startEditAula(a)}><Pencil size={14} /></button>
                        <button className="icon-btn-action" onClick={() => handleDelete('aulas', a.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  
                  {((builderTab === 'tema' && temas.length === 0) || (builderTab === 'modulo' && modulos.length === 0) || (builderTab === 'aula' && aulas.length === 0)) && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Nenhum item encontrado.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
