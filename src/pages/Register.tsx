import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Supabase SignUp with raw_user_meta_data to hit the Database Trigger
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message || 'Erro ao criar conta');
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Este e-mail já está em uso.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (success) {
    return (
      <div className="auth-wrapper flex-center">
        <div className="auth-card glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: 'var(--success-color)', marginBottom: '20px' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '64px', height: '64px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 style={{ marginBottom: '16px' }}>Cadastro Realizado!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sua solicitação foi enviada para nossos administradores. Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img src="/images/Logo-Branca.PNG" alt="Portal de Cursos" style={{ maxWidth: '100%', height: 'auto', maxHeight: '100px' }} />
        </div>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="Digite seu nome"
            />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Digite seu e-mail"
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
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Criar Conta
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Já possui conta? <Link to="/login" style={{ color: 'var(--primary-hover)', textDecoration: 'underline' }}>Entre aqui</Link>
        </p>
      </div>
    </div>
  );
}
