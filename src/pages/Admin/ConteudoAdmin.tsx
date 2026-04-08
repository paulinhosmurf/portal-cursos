import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PlaySquare, Folder, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../../config/supabase';
import type { Tema, Modulo, Aula } from '../../types';

export default function ConteudoAdmin() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [collapsedTemas, setCollapsedTemas] = useState<Record<string, boolean>>({});

  const toggleModulo = (id: string) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTema = (id: string) => {
    setCollapsedTemas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const [temasRes, modsRes, aulasRes] = await Promise.all([
        supabase.from('temas').select('*').order('created_at', { ascending: false }),
        supabase.from('modulos').select('*').order('created_at', { ascending: true }),
        supabase.from('aulas').select('*').order('created_at', { ascending: true })
      ]);

      if (temasRes.data) setTemas(temasRes.data);
      if (modsRes.data) setModulos(modsRes.data);
      if (aulasRes.data) setAulas(aulasRes.data);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <PlaySquare size={32} color="var(--primary-color)" />
        <h2>Conteúdo Publicado</h2>
      </div>
      
      <div className="glass-panel" style={{ padding: '24px' }}>
         <p style={{ color: 'var(--text-secondary)' }}>
           Aqui está listada toda a árvore de conteúdos postados na plataforma.
         </p>
         
         <div style={{ marginTop: '32px' }}>
           {loading ? (
             <p style={{ color: 'var(--text-secondary)' }}>Carregando dados...</p>
           ) : temas.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Nenhum tema criado ainda.</p>
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {temas.map(tema => (
                 <div key={tema.id} style={{ border: `1px solid ${tema.border || 'var(--border-color)'}`, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', transition: 'height 0.3s' }}>
                   <div 
                     onClick={() => toggleTema(tema.id)}
                     style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: collapsedTemas[tema.id] ? '0' : '16px', cursor: 'pointer', userSelect: 'none' }}
                   >
                     <Folder color={tema.border || "var(--primary-color)"} size={24} />
                     <h3 style={{ margin: 0, color: tema.border || 'var(--text-primary)' }}>{tema.name}</h3>
                     <div style={{ marginLeft: 'auto', transform: collapsedTemas[tema.id] ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', display: 'flex' }}>
                        <ChevronRight size={20} color="var(--text-secondary)" />
                     </div>
                   </div>
                   
                   {/* Módulos do Tema */}
                   {!collapsedTemas[tema.id] && (
                     <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                       {modulos.filter(m => m.tema_id === tema.id).length === 0 ? (
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum módulo atrelado.</p>
                       ) : (
                         modulos.filter(m => m.tema_id === tema.id).map(modulo => (
                            <div key={modulo.id}>
                              <div 
                                onClick={() => toggleModulo(modulo.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
                              >
                                <div style={{ transform: collapsedModules[modulo.id] ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', display: 'flex' }}>
                                  <ChevronRight size={16} color="var(--text-secondary)" />
                                </div>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{modulo.name}</strong>
                              </div>
                              
                              {/* Aulas do Módulo */}
                              {!collapsedModules[modulo.id] && (
                                <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {aulas.filter(a => a.modulo_id === modulo.id).length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhuma aula postada.</p>
                                  ) : (
                                    aulas.filter(a => a.modulo_id === modulo.id).map(aula => (
                                      <Link to={`/aula/${aula.id}`} key={aula.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                                      >
                                        <FileText size={14} color="var(--text-secondary)" />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{aula.title}</span>
                                      </Link>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                         ))
                       )}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>
      </div>
    </Layout>
  );
}
