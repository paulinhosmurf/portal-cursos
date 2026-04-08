import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Credenciais inválidas ou erro no Supabase.');
    } else {
      const user = signInData.user;
      
      // Verificamos o status do perfil antes de permitir a entrada
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (profile?.status === 'pending') {
        await supabase.auth.signOut();
        alert('Conta não autorizada. Sua solicitação ainda está em análise por um administrador.');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src="/images/Logo-Branca.PNG" alt="Portal de Cursos" style={{ maxWidth: '100%', height: 'auto', maxHeight: '100px' }} />
        </div>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>Acesso Exclusivo</p>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="seu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Sua senha secreta"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Acessar Plataforma
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Não tem acesso? <Link to="/register" style={{ color: 'var(--primary-hover)', textDecoration: 'underline' }}>Solicite agora</Link>
        </p>
      </div>
    </div>
  );
}
