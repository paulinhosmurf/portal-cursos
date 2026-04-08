import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import type { Tema, Modulo, Aula } from '../types';

export default function TemaPage() {
  const { id } = useParams();
  const [tema, setTema] = useState<Tema | null>(null);
  const [modulos, setModulos] = useState<(Modulo & { aulas: Aula[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemaData = async () => {
      if (!id) return;
      const { data: temaData } = await supabase.from('temas').select('*').eq('id', id).single();
      if (temaData) setTema(temaData);

      const { data: modsData } = await supabase.from('modulos').select('*').eq('tema_id', id).order('order', { ascending: true });
      if (modsData && modsData.length > 0) {
        const modsIds = modsData.map(m => m.id);
        const { data: aulasData } = await supabase.from('aulas').select('*').in('modulo_id', modsIds).order('order', { ascending: true });
        
        const modulosWithAulas = modsData.map(m => ({
          ...m,
          aulas: aulasData ? aulasData.filter(a => a.modulo_id === m.id) : []
        }));
        
        setModulos(modulosWithAulas);
      } else {
        setModulos([]);
      }
      setLoading(false);
    };
    fetchTemaData();
  }, [id]);

  return (
    <Layout>
      <div className="animate-fade-in">
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
             &larr; Voltar
          </Link>
          <h1>{tema ? tema.name : 'Detalhes do Tema'}</h1>
        </div>

        {loading ? (
           <p style={{ color: 'var(--text-secondary)' }}>Carregando trilha de estudos...</p>
        ) : modulos.length === 0 ? (
           <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
             <p style={{ color: 'var(--text-secondary)' }}>Nenhum módulo disponível para este tema ainda.</p>
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {modulos.map((modulo, i) => (
              <div key={modulo.id} className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: tema?.border || 'var(--text-primary)', borderBottom: `1px solid ${tema?.border || 'var(--border-color)'}`, paddingBottom: '8px' }}>
                  Módulo {i + 1}: {modulo.name}
                </h3>
                
                {modulo.aulas.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma aula cadastrada neste módulo.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {modulo.aulas.map((aula, j) => (
                    <Link to={`/aula/${aula.id}`} key={aula.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <PlayCircle size={20} color={tema?.border || "var(--text-primary)"} />
                      <span>Aula {j + 1}: {aula.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
