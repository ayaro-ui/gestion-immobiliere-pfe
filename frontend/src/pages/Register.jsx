import { useState } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', confirmer_mot_de_passe: '',
    telephone: '', id_role: '3'
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const navigate = useNavigate()

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/register', formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally { setLoading(false) }
  }

  const inpStyle = (name) => ({
    width: '100%', padding: '12px 14px 12px 40px',
    border: `1.5px solid ${focused === name ? '#c8a96e' : '#ece8df'}`,
    borderRadius: 10, fontSize: 13, color: '#0f1e35', background: '#fff',
    outline: 'none', boxSizing: 'border-box', transition: 'all .25s',
    boxShadow: focused === name ? '0 0 0 3px rgba(200,169,110,.12)' : '0 1px 4px rgba(15,30,53,.04)',
  })

  const lblStyle = {
    display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700,
    color: '#0f1e35', letterSpacing: '0.8px', textTransform: 'uppercase',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#f8f7f4' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.05)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .reg-left  { animation: slideIn .9s cubic-bezier(.22,1,.36,1) both; }
        .reg-right { animation: fadeIn .8s cubic-bezier(.22,1,.36,1) .12s both; }
        .reg-btn {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0f1e35 0%, #1a3055 50%, #0f1e35 100%);
          background-size: 200% auto;
          transition: background-position .6s ease, transform .2s, box-shadow .2s;
        }
        .reg-btn:hover:not(:disabled) { background-position: right center; transform: translateY(-2px); box-shadow: 0 16px 40px rgba(15,30,53,.45) !important; }
        .reg-btn:disabled { opacity: .65; cursor: not-allowed; }
        .reg-btn::after { content:''; position:absolute; inset:0; background: linear-gradient(135deg, transparent 40%, rgba(200,169,110,.18) 60%, transparent 70%); background-size:200% auto; animation: shimmer 3s linear infinite; }
        select option { color: #0f1e35; }
      `}</style>

      {/* ══════════ GAUCHE — IMAGE ══════════ */}
      <div className="reg-left" style={{ flex: '0 0 42%', position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=90"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(8,14,28,.92) 0%, rgba(15,30,53,.78) 45%, rgba(10,20,40,.6) 100%)' }} />
        <div style={{ position: 'absolute', left: 56, top: '12%', bottom: '12%', width: 1, background: 'linear-gradient(to bottom, transparent, #c8a96e 30%, #c8a96e 70%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px 48px 84px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(200,169,110,.15)', border: '1px solid rgba(200,169,110,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>ImmoExpert</div>
              <div style={{ fontSize: 9, color: 'rgba(200,169,110,.7)', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Maroc</div>
            </div>
          </div>

          {/* Texte central */}
          <div>
            <div style={{ width: 32, height: 2, background: '#c8a96e', marginBottom: 22 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px,3.5vw,46px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 18px', maxWidth: 360 }}>
              Rejoignez<br />
              <em style={{ color: '#c8a96e', fontStyle: 'italic' }}>l'excellence</em><br />
              immobilière
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', maxWidth: 320, lineHeight: 1.75, margin: 0 }}>
              Créez votre compte et accédez à des milliers de biens d'exception au Maroc.
            </p>

            {/* Avantages */}
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                '✦ Accès à tous les biens disponibles',
                '✦ Contrats signés électroniquement',
                '✦ Suivi complet de vos transactions',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 1, background: 'rgba(200,169,110,.4)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Plateforme sécurisée</span>
          </div>
        </div>

        {/* Cercles déco */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(200,169,110,.1)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(200,169,110,.07)', animation: 'pulse 6s ease-in-out infinite .5s' }} />
      </div>

      {/* ══════════ DROITE — FORMULAIRE ══════════ */}
      <div className="reg-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 56px', background: '#f8f7f4', position: 'relative', overflowY: 'auto' }}>

        {/* Déco fond */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,110,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, width: '100%', margin: '0 auto' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,169,110,.1)', border: '1px solid rgba(200,169,110,.25)', borderRadius: 99, padding: '4px 14px', marginBottom: 14 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c8a96e' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#92400e', letterSpacing: '2px', textTransform: 'uppercase' }}>Nouveau compte</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: '#0f1e35', margin: '0 0 6px', lineHeight: 1.15 }}>
              Créez votre<br />
              <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>espace personnel</span>
            </h2>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Rejoignez des milliers de clients satisfaits</p>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,.2)', borderLeft: '3px solid #ef4444', borderRadius: 10, padding: '11px 16px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#991b1b', fontWeight: 600, animation: 'fadeIn .3s ease' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Nom + Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { name: 'nom',    label: 'Nom',    placeholder: 'Ex: Benali',  icon: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="12" cy="7" r="4"/> },
                { name: 'prenom', label: 'Prénom', placeholder: 'Ex: Ahmed',   icon: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="12" cy="7" r="4"/> },
              ].map(f => (
                <div key={f.name}>
                  <label style={lblStyle}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === f.name ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {f.icon}{f.icon2}
                    </svg>
                    <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')}
                      placeholder={f.placeholder} required style={inpStyle(f.name)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={lblStyle}>Adresse email</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="votre@email.com" required style={inpStyle('email')} />
              </div>
            </div>

            {/* Téléphone */}
            <div style={{ marginBottom: 14 }}>
              <label style={lblStyle}>Téléphone</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'tel' ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input type="text" name="telephone" value={formData.telephone} onChange={handleChange}
                  onFocus={() => setFocused('tel')} onBlur={() => setFocused('')}
                  placeholder="+212 6XX XXX XXX" style={inpStyle('tel')} />
              </div>
            </div>

            {/* Rôle */}
            <div style={{ marginBottom: 14 }}>
              <label style={lblStyle}>Je suis</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { val: '3', label: 'Client', sub: 'Acheteur / Locataire', icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  )},
                  { val: '2', label: 'Vendeur', sub: 'Propriétaire', icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )},
                ].map(r => (
                  <button key={r.val} type="button" onClick={() => setFormData({ ...formData, id_role: r.val })} style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: `1.5px solid ${formData.id_role === r.val ? '#c8a96e' : '#ece8df'}`,
                    background: formData.id_role === r.val ? 'rgba(200,169,110,.08)' : 'white',
                    transition: 'all .2s',
                  }}>
                    <div style={{ marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: formData.id_role === r.val ? '#92400e' : '#0f1e35' }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mot de passe + Confirmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { name: 'mot_de_passe',           label: 'Mot de passe',   ph: '••••••••' },
                { name: 'confirmer_mot_de_passe',  label: 'Confirmer',      ph: '••••••••' },
              ].map(f => (
                <div key={f.name}>
                  <label style={lblStyle}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === f.name ? '#c8a96e' : '#c4bfb8', transition: 'color .25s' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" name={f.name} value={formData[f.name]} onChange={handleChange}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')}
                      placeholder={f.ph} required style={inpStyle(f.name)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading} className="reg-btn" style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(15,30,53,.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Création du compte...
                </>
              ) : (
                <>
                  Créer mon compte
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#ece8df' }} />
            <span style={{ fontSize: 10, color: '#c4bfb8', fontWeight: 600, letterSpacing: '1px' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: '#ece8df' }} />
          </div>

          {/* Lien connexion */}
          <div style={{ background: 'white', border: '1.5px solid #ece8df', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(15,30,53,.04)' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f1e35' }}>Déjà un compte ?</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>Connectez-vous à votre espace</p>
            </div>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'transparent', border: '1.5px solid #0f1e35', color: '#0f1e35', fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.5px', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0f1e35'; e.currentTarget.style.color = '#c8a96e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0f1e35'; }}>
              Se connecter →
            </Link>
          </div>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 10, color: '#c4bfb8', letterSpacing: '0.3px' }}>
            © 2026 ImmoExpert — Plateforme sécurisée
          </p>
        </div>
      </div>
    </div>
  )
}