import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import type { Tema, Modulo } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentBuilder() {
  const [builderTab, setBuilderTab] = useState<'tema' | 'modulo' | 'aula'>('tema');
  
  // States Locais
  const [temas, setTemas] = useState<Tema[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);

  // Carregar Temas e Módulos para os Selects
  useEffect(() => {
    const fetchSelects = async () => {
      const { data: temasData } = await supabase.from('temas').select('*').order('created_at', { ascending: true });
      if (temasData) setTemas(temasData);

      const { data: modsData } = await supabase.from('modulos').select('*').order('order', { ascending: true });
      if (modsData) setModulos(modsData);
    };
    fetchSelects();
  }, [builderTab]);

  // Form Tema
  const [temaName, setTemaName] = useState('');
  const [temaDesc, setTemaDesc] = useState('');

  // Cores dinâmicas (Gerados internamente agora)
  const themeColors = [
    { color: 'rgba(99, 102, 241, 0.1)', border: '#6366f1' },
    { color: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' },
    { color: 'rgba(239, 68, 68, 0.1)', border: '#ef4444' },
    { color: 'rgba(168, 85, 247, 0.1)', border: '#a855f7' },
    { color: 'rgba(234, 179, 8, 0.1)', border: '#eab308' }
  ];

  // Form Módulo
  const [modTemaId, setModTemaId] = useState('');
  const [modName, setModName] = useState('');

  // Form Aula
  const [aulaModId, setAulaModId] = useState('');
  const [aulaTitle, setAulaTitle] = useState('');
  const [aulaContent, setAulaContent] = useState('');

  const handleCreateTema = async () => {
    if (!temaName || !temaDesc) return alert('Preencha nome e descrição.');
    const randomTheme = themeColors[Math.floor(Math.random() * themeColors.length)];
    const { error } = await supabase.from('temas').insert([{ name: temaName, description: temaDesc, color: randomTheme.color, border: randomTheme.border }]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Tema criado!'); setTemaName(''); setTemaDesc(''); }
  };

  const handleCreateModulo = async () => {
    if (!modTemaId || !modName) return alert('Selecione um tema e digite o nome do módulo.');
    const { error } = await supabase.from('modulos').insert([{ tema_id: modTemaId, name: modName }]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Módulo criado!'); setModName(''); }
  };

  const handleCreateAula = async () => {
    if (!aulaModId || !aulaTitle || !aulaContent) return alert('Preencha os campos da Aula.');
    const { error } = await supabase.from('aulas').insert([{ modulo_id: aulaModId, title: aulaTitle, content: aulaContent }]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Aula Publicada!'); setAulaTitle(''); setAulaContent(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="pill-tabs-container" style={{ alignSelf: 'flex-start' }}>
        {['tema', 'modulo', 'aula'].map((t) => (
          <button 
            key={t}
            className={`pill-tab ${builderTab === t ? 'active' : ''}`}
            onClick={() => setBuilderTab(t as any)}
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
          {builderTab === 'tema' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <h3>Criar Novo Tema</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A categoria principal (Ex: Segurança Defensiva)</p>
              
              <input type="text" className="input-field" placeholder="Nome do Tema" value={temaName} onChange={e => setTemaName(e.target.value)} />
              <textarea className="input-field" placeholder="Breve descrição" rows={3} value={temaDesc} onChange={e => setTemaDesc(e.target.value)} />

              <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} onClick={handleCreateTema}>Cadastrar Tema</button>
            </div>
          )}

          {builderTab === 'modulo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <h3>Criar Novo Módulo</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Um módulo agrupa diversas aulas dentro de um Tema.</p>

              <select className="input-field" value={modTemaId} onChange={e => setModTemaId(e.target.value)}>
                <option value="">Selecione um Tema...</option>
                {temas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <input type="text" className="input-field" placeholder="Nome do Módulo (Ex: Iniciando no Blue Team)" value={modName} onChange={e => setModName(e.target.value)} />
              
              <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} onClick={handleCreateModulo}>Cadastrar Módulo</button>
            </div>
          )}

          {builderTab === 'aula' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>Adicionar Aula</h3>

              <div style={{ display: 'flex', gap: '16px' }}>
                <select className="input-field" value={aulaModId} onChange={e => setAulaModId(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Selecione um Módulo...</option>
                  {modulos.map(m => {
                    const tema = temas.find(t => t.id === m.tema_id);
                    return <option key={m.id} value={m.id}>[{tema?.name}] - {m.name}</option>;
                  })}
                </select>
                <input type="text" className="input-field" placeholder="Título da Aula" value={aulaTitle} onChange={e => setAulaTitle(e.target.value)} style={{ flex: 2 }} />
              </div>

              <div style={{ marginTop: '16px' }}>
                 <RichTextEditor value={aulaContent} onChange={setAulaContent} />
              </div>

              <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '16px' }} onClick={handleCreateAula}>Publicar Aula</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
