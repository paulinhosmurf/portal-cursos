import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { supabase } from '../config/supabase';
import type { Tema } from '../types';

export default function Home() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemas = async () => {
      const { data } = await supabase.from('temas').select('*').order('created_at', { ascending: false });
      if (data) setTemas(data);
      setLoading(false);
    };
    fetchTemas();
  }, []);

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 style={{ marginBottom: '8px' }}>Catálogo de Temas</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Selecione uma área de estudo para começar.</p>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando catálogo...</p>
        ) : temas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum tema encontrado. Peça para um administrador criar um novo tema.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {temas.map(tema => (
              <Link to={`/tema/${tema.id}`} key={tema.id} style={{ display: 'block' }}>
                <div 
                  style={{ 
                    padding: '24px', 
                    background: tema.color, 
                    border: `1px solid ${tema.border}`, 
                    borderRadius: '12px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  className="tema-card"
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 10px 25px ${tema.color}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ marginBottom: '16px', color: tema.border }}>
                    <BookOpen size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{tema.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>{tema.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
