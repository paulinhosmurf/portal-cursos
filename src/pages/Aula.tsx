import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { autoEmbedUrls } from '../utils/autoEmbed';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../config/supabase';
import type { Aula } from '../types';

export default function AulaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAula = async () => {
      if (!id) return;
      const { data } = await supabase.from('aulas').select('*').eq('id', id).single();
      if (data) setAula(data);
      setLoading(false);
    };
    fetchAula();
  }, [id]);

  // Convert raw HTML into embedded players if applicable
  const processedHtml = useMemo(() => {
    if (!aula) return '';
    return autoEmbedUrls(aula.content);
  }, [aula]);

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="icon-btn" 
          style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', gap: '8px', padding: '8px 16px', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        
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
      </div>
    </Layout>
  );
}
