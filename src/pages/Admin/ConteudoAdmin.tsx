import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PlaySquare, Folder, FileText, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Tema, Modulo, Aula } from '../../types';

export default function ConteudoAdmin() {
  const { userProfile } = useAuth();
  const [temas, setTemas] = useState<Tema[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [collapsedTemas, setCollapsedTemas] = useState<Record<string, boolean>>({});

  const isAdmin = userProfile?.role === 'admin';

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

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModulo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTema = (id: string) => {
    setCollapsedTemas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Funções de Gestão (SÓ ADMIN) ---

  const handleDeleteTema = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir este tema e TUDO vinculado a ele (módulos e aulas)?')) return;
    const { error } = await supabase.from('temas').delete().eq('id', id);
    if (error) alert('Erro ao excluir tema.'); else fetchData();
  };

  const handleDeleteModulo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir este módulo e todas as suas aulas?')) return;
    const { error } = await supabase.from('modulos').delete().eq('id', id);
    if (error) alert('Erro ao excluir módulo.'); else fetchData();
  };

  const handleDeleteAula = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir esta aula?')) return;
    const { error } = await supabase.from('aulas').delete().eq('id', id);
    if (error) alert('Erro ao excluir aula.'); else fetchData();
  };

  const handleRenameTema = async (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Novo nome para o Tema:', currentName);
    if (!newName || newName === currentName) return;
    const { error } = await supabase.from('temas').update({ name: newName }).eq('id', id);
    if (error) alert('Erro ao renomear.'); else fetchData();
  };

  const handleRenameModulo = async (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Novo nome para o Módulo:', currentName);
    if (!newName || newName === currentName) return;
    const { error } = await supabase.from('modulos').update({ name: newName }).eq('id', id);
    if (error) alert('Erro ao renomear.'); else fetchData();
  };

  const handleRenameAula = async (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = window.prompt('Novo título para a Aula:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    const { error } = await supabase.from('aulas').update({ title: newTitle }).eq('id', id);
    if (error) alert('Erro ao renomear.'); else fetchData();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <PlaySquare size={32} color="var(--primary-color)" />
        <h2>Gestão de Conteúdo</h2>
      </div>
      
      <div className="glass-panel" style={{ padding: '24px' }}>
         <p style={{ color: 'var(--text-secondary)' }}>
           Explore a estrutura completa de temas e aulas disponíveis na plataforma.
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
                     
                     <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdmin && (
                          <>
                            <button className="icon-btn-small" onClick={(e) => handleRenameTema(tema.id, tema.name, e)} title="Renomear Tema">
                              <Pencil size={16} />
                            </button>
                            <button className="icon-btn-small" onClick={(e) => handleDeleteTema(tema.id, e)} title="Excluir Tema" style={{ color: 'var(--danger-color)' }}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <div style={{ transform: collapsedTemas[tema.id] ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', display: 'flex' }}>
                           <ChevronRight size={20} color="var(--text-secondary)" />
                        </div>
                      </div>
                   </div>
                   
                   {!collapsedTemas[tema.id] && (
                     <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                       {modulos.filter(m => m.tema_id === tema.id).length === 0 ? (
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum módulo atrelado.</p>
                       ) : (
                         modulos.filter(m => m.tema_id === tema.id).map(modulo => (
                            <div key={modulo.id}>
                              <div 
                                onClick={(e) => toggleModulo(modulo.id, e)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
                              >
                                <div style={{ transform: collapsedModules[modulo.id] ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s', display: 'flex' }}>
                                  <ChevronRight size={16} color="var(--text-secondary)" />
                                </div>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{modulo.name}</strong>
                                
                                {isAdmin && (
                                   <div style={{ marginLeft: '8px', display: 'flex', gap: '4px' }}>
                                      <button className="icon-btn-small" onClick={(e) => handleRenameModulo(modulo.id, modulo.name, e)} title="Renomear Módulo">
                                        <Pencil size={14} />
                                      </button>
                                      <button className="icon-btn-small" onClick={(e) => handleDeleteModulo(modulo.id, e)} title="Excluir Módulo" style={{ color: 'var(--danger-color)' }}>
                                        <Trash2 size={14} />
                                      </button>
                                   </div>
                                 )}
                              </div>
                              
                              {!collapsedModules[modulo.id] && (
                                <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {aulas.filter(a => a.modulo_id === modulo.id).length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhuma aula postada.</p>
                                  ) : (
                                    aulas.filter(a => a.modulo_id === modulo.id).map(aula => (
                                      <div key={aula.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                         <Link to={`/aula/${aula.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', transition: 'background 0.2s' }}
                                           onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                           onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                                         >
                                           <FileText size={14} color="var(--text-secondary)" />
                                           <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{aula.title}</span>
                                         </Link>
                                         
                                         {isAdmin && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                              <button className="icon-btn-small" onClick={(e) => handleRenameAula(aula.id, aula.title, e)} title="Renomear Aula">
                                                <Pencil size={14} />
                                              </button>
                                              <button className="icon-btn-small" onClick={(e) => handleDeleteAula(aula.id, e)} title="Excluir Aula" style={{ color: 'var(--danger-color)' }}>
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          )}
                                      </div>
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
