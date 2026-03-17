import { useState } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axiosInstance.post('/login', {
        email,
        mot_de_passe: password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if      (data.user.id_role === 1) navigate('/admin/dashboard')
      else if (data.user.id_role === 2) navigate('/vendeur/mes-biens')
      else                              navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#f8f7f4' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes fadeIn  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes float   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes pulse   { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.05)} }

        .login-left  { animation: slideIn .9s cubic-bezier(.22,1,.36,1) both; }
        .login-right { animation: fadeIn .8s cubic-bezier(.22,1,.36,1) .15s both; }

        .inp-wrap input:focus { border-color: #c8a96e !important; box-shadow: 0 0 0 3px rgba(200,169,110,.12) !important; }
        .inp-wrap input { transition: all .25s; }

        .login-btn {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0f1e35 0%, #1a3055 50%, #0f1e35 100%);
          background-size: 200% auto;
          transition: background-position .6s ease, transform .2s, box-shadow .2s;
        }
        .login-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(15,30,53,.45) !important;
        }
        .login-btn:disabled { opacity: .65; cursor: not-allowed; }
        .login-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(200,169,110,.18) 60%, transparent 70%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .stat-card { transition: transform .3s, box-shadow .3s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,.25) !important; }

        .social-link { transition: all .2s; }
        .social-link:hover { color: #c8a96e !important; }
      `}</style>

      {/* ══════════════ GAUCHE — IMAGE + OVERLAY ══════════════ */}
      <div className="login-left" style={{
        flex: '0 0 55%', position: 'relative', overflow: 'hidden',
      }}>
        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=90"
          alt="Immobilier"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(8,14,28,.92) 0%, rgba(15,30,53,.75) 40%, rgba(10,20,40,.55) 100%)',
        }} />

        {/* Ligne dorée décorative */}
        <div style={{ position: 'absolute', left: 64, top: '12%', bottom: '12%', width: 1, background: 'linear-gradient(to bottom, transparent, #c8a96e 30%, #c8a96e 70%, transparent)' }} />

        {/* Contenu overlay */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 60px 52px 92px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(200,169,110,.15)', border: '1px solid rgba(200,169,110,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>ImmoExpert</div>
              <div style={{ fontSize: 10, color: 'rgba(200,169,110,.7)', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Maroc</div>
            </div>
          </div>

          {/* Titre central */}
          <div>
            <div style={{ width: 36, height: 2, background: '#c8a96e', marginBottom: 24 }} />
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,4vw,54px)', fontWeight: 700, color: '#fff', lineHeight: 1.12, margin: '0 0 20px', maxWidth: 480 }}>
              L'immobilier<br />
              <em style={{ color: '#c8a96e', fontStyle: 'italic' }}>d'exception</em><br />
              au Maroc
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', maxWidth: 380, lineHeight: 1.75, margin: 0 }}>
              Achetez, vendez ou louez en toute confiance. Des milliers de biens d'exception vous attendent.
            </p>
          </div>

          {/* Footer gauche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 1, background: 'rgba(200,169,110,0.4)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Plateforme immobilière au Maroc</span>
          </div>
        </div>

        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(200,169,110,.12)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(200,169,110,.08)', animation: 'pulse 6s ease-in-out infinite .5s' }} />
      </div>

      {/* ══════════════ DROITE — FORMULAIRE ══════════════ */}
      <div className="login-right" style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', background: '#f8f7f4', position: 'relative', overflow: 'hidden',
      }}>

        {/* Texture de fond subtile */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,110,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,30,53,.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, width: '100%', margin: '0 auto' }}>

          {/* En-tête formulaire */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,169,110,.1)', border: '1px solid rgba(200,169,110,.25)', borderRadius: 99, padding: '5px 14px', marginBottom: 18 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8a96e' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', letterSpacing: '2px', textTransform: 'uppercase' }}>Connexion sécurisée</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: '#0f1e35', margin: '0 0 8px', lineHeight: 1.15 }}>
              Bon retour<br />
              <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>chez vous</span>
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
              Accédez à votre espace personnel ImmoExpert
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid rgba(239,68,68,.2)',
              borderLeft: '3px solid #ef4444',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, color: '#991b1b', fontWeight: 600,
              animation: 'fadeIn .3s ease',
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span> {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="inp-wrap" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 7, fontSize: 12, fontWeight: 700, color: '#0f1e35', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  placeholder="votre@email.com"
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px',
                    border: '1.5px solid #ece8df', borderRadius: 12,
                    fontSize: 14, color: '#0f1e35', background: '#fff',
                    outline: 'none', boxSizing: 'border-box',
                    boxShadow: '0 1px 4px rgba(15,30,53,.04)',
                  }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="inp-wrap" style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 7, fontSize: 12, fontWeight: 700, color: '#0f1e35', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'pwd' ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password" value={password} required
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px',
                    border: '1.5px solid #ece8df', borderRadius: 12,
                    fontSize: 14, color: '#0f1e35', background: '#fff',
                    outline: 'none', boxSizing: 'border-box',
                    boxShadow: '0 1px 4px rgba(15,30,53,.04)',
                  }}
                />
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#c8a96e', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.3px' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton connexion */}
            <button type="submit" disabled={loading} className="login-btn" style={{
              width: '100%', padding: '15px 0', borderRadius: 12, border: 'none',
              color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(15,30,53,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#ece8df' }} />
            <span style={{ fontSize: 11, color: '#c4bfb8', fontWeight: 600, letterSpacing: '1px' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: '#ece8df' }} />
          </div>

          {/* Créer un compte */}
          <div style={{ background: 'white', border: '1.5px solid #ece8df', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(15,30,53,.04)' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f1e35' }}>Pas encore de compte ?</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Rejoignez notre plateforme</p>
            </div>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10,
              background: 'transparent', border: '1.5px solid #0f1e35',
              color: '#0f1e35', fontSize: 12, fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.5px',
              transition: 'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0f1e35'; e.currentTarget.style.color = '#c8a96e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0f1e35'; }}>
              S'inscrire →
            </Link>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: '#c4bfb8', letterSpacing: '0.3px' }}>
            © 2026 ImmoExpert — Plateforme sécurisée
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}