import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

function DropMenu({ label, active, children }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const handleEnter = () => { clearTimeout(timer.current); setOpen(true) }
  const handleLeave = () => { timer.current = setTimeout(() => setOpen(false), 180) }

  return (
    <div style={{ position: 'relative' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '10.5px', fontWeight: 600,
        letterSpacing: '0.4px', textTransform: 'uppercase', padding: '5px 1px',
        color: active ? '#0f1e35' : 'rgba(15,30,53,0.45)', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        position: 'relative', whiteSpace: 'nowrap', transition: 'color .2s',
      }}>
        {label}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 1.5, background: '#c8a96e', transform: active ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'center', transition: 'transform .25s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', borderRadius: 12, minWidth: 190,
          boxShadow: '0 16px 48px rgba(15,30,53,.16), 0 2px 8px rgba(15,30,53,.08)',
          border: '1px solid rgba(200,169,110,.25)', padding: '8px 0', zIndex: 999,
          animation: 'dropIn .18s cubic-bezier(.34,1.56,.64,1)',
        }}>
          <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 6, overflow: 'hidden' }}>
            <div style={{ width: 12, height: 12, background: 'white', border: '1px solid rgba(200,169,110,.25)', transform: 'rotate(45deg)', transformOrigin: 'bottom', position: 'absolute', top: 3, left: 0 }} />
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

function DropItem({ to, label, icon }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', textDecoration: 'none',
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
      color: active ? '#0f1e35' : '#374151',
      background: active ? 'rgba(200,169,110,.08)' : 'transparent',
      transition: 'all .15s', borderLeft: active ? '2px solid #c8a96e' : '2px solid transparent',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(200,169,110,.06)'; e.currentTarget.style.color='#0f1e35'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#374151'; }}}
    >
      <span style={{ color: active ? '#0f1e35' : 'rgba(15,30,53,.3)', flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  )
}

// ── Profil Dropdown ───────────────────────────────────────────────────────────
function ProfileDropdown({ user, isAdmin, isVendeur, onLogout }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const handleEnter = () => { clearTimeout(timer.current); setOpen(true) }
  const handleLeave = () => { timer.current = setTimeout(() => setOpen(false), 200) }

  const roleLabel = isAdmin ? 'Admin' : isVendeur ? 'Vendeur' : 'Client'
  const roleColor = isAdmin ? '#c8a96e' : isVendeur ? '#0f1e35' : '#059669'
  const roleBg    = isAdmin ? 'rgba(200,169,110,.1)' : isVendeur ? 'rgba(15,30,53,.06)' : 'rgba(5,150,105,.07)'
  const roleBorder= isAdmin ? 'rgba(200,169,110,.3)' : isVendeur ? 'rgba(15,30,53,.18)' : 'rgba(5,150,105,.2)'

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen(o => !o)}
        className="avatar-wrap"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Badge rôle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: roleBg, border: `1px solid ${roleBorder}` }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: roleColor }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: isAdmin ? '#92400e' : isVendeur ? '#0f1e35' : '#065f46' }}>
            {roleLabel}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(200,169,110,.2)' }} />

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f1e35, #1a3055)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#c8a96e', fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
            border: `1.5px solid ${open ? '#c8a96e' : 'rgba(200,169,110,.3)'}`,
            boxShadow: open ? '0 0 0 3px rgba(200,169,110,.15)' : '0 2px 8px rgba(15,30,53,.2)',
            flexShrink: 0, transition: 'all .2s',
          }}>
            {(user?.prenom?.[0] || user?.nom?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#0f1e35', lineHeight: 1.1 }}>{user?.prenom || 'Profil'}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: '#9ca3af', lineHeight: 1 }}>{user?.email?.split('@')[0] || ''}</div>
          </div>
          {/* chevron */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(15,30,53,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: -2 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          background: 'white', borderRadius: 20, width: 300,
          boxShadow: '0 20px 60px rgba(15,30,53,.18), 0 4px 16px rgba(15,30,53,.08)',
          border: '1px solid rgba(200,169,110,.2)',
          overflow: 'hidden', zIndex: 1100,
          animation: 'profileIn .2s cubic-bezier(.34,1.3,.64,1)',
        }}>

          {/* Header navy */}
          <div style={{ background: '#0f1e35', padding: '22px 22px 18px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 22, top: '15%', bottom: '15%', width: 1, background: 'linear-gradient(to bottom, transparent, #c8a96e, transparent)' }} />
            <div style={{ paddingLeft: 18 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '3px', color: '#c8a96e', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Mon profil
              </span>
              {/* Avatar grand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #c8a96e, #d4ba82)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#0f1e35', fontWeight: 800, fontFamily: "'DM Sans',sans-serif", border: '2px solid rgba(200,169,110,.4)', flexShrink: 0 }}>
                  {(user?.prenom?.[0] || user?.nom?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
                    {user?.prenom || ''} {user?.nom || ''}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, background: roleBg, border: `1px solid ${roleBorder}`, borderRadius: 99, padding: '2px 8px' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: roleColor }} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: isAdmin ? '#c8a96e' : isVendeur ? 'rgba(200,169,110,.8)' : '#c8a96e' }}>{roleLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infos */}
          <div style={{ padding: '16px 20px' }}>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fdfcfa', borderRadius: 12, border: '1px solid rgba(200,169,110,.12)', marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>Email</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#0f1e35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || '—'}</div>
              </div>
            </div>

            {/* Téléphone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fdfcfa', borderRadius: 12, border: '1px solid rgba(200,169,110,.12)', marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>Téléphone</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#0f1e35' }}>{user?.telephone || '—'}</div>
              </div>
            </div>

            {/* Membre depuis */}
            {user?.date_inscription && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fdfcfa', borderRadius: 12, border: '1px solid rgba(200,169,110,.12)', marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>Membre depuis</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#0f1e35' }}>
                    {new Date(user.date_inscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(200,169,110,.1)', margin: '12px 0' }} />

            {/* Déconnexion */}
            <button
              onClick={onLogout}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.04)', color: '#991b1b', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s', letterSpacing: '0.5px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.04)'; e.currentTarget.style.color = '#991b1b'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Navbar principale ─────────────────────────────────────────────────────────
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token    = localStorage.getItem('token')
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const isVendeur = token && user?.id_role === 2
  const isAdmin   = token && user?.id_role === 1
  const isClient  = token && user?.id_role === 3

  const isActive = (path) =>
    path === '/__home__'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/')

  const nl = (path) => `nav-link${isActive(path) ? ' active' : ''}`
  const nh = () => `nav-link${location.pathname === '/' ? ' active' : ''}`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes dropIn    { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes profileIn { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .nav-link {
          position: relative; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.4px; text-transform: uppercase;
          padding: 5px 1px; color: rgba(15,30,53,0.45);
          transition: color .2s; white-space: nowrap;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1.5px; background: #0f1e35;
          transform: scaleX(0); transform-origin: center;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .nav-link:hover { color: #b8955a !important; }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: #0f1e35 !important; }
        .nav-link.active::after { transform: scaleX(1); }

        .btn-login {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase; padding: 8px 20px;
          border-radius: 3px; cursor: pointer; background: #0f1e35; color: #fff;
          border: none; transition: all .2s;
        }
        .btn-login:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,169,110,.3); }

        .btn-register {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase; padding: 7px 18px;
          border-radius: 3px; cursor: pointer; background: transparent; color: #0f1e35;
          border: 1.5px solid rgba(15,30,53,.22); transition: all .2s;
        }
        .btn-register:hover { border-color: #c8a96e; color: #c8a96e; }

        .avatar-wrap { transition: transform .2s; }
        .avatar-wrap:hover { transform: scale(1.02); }
      `}</style>

      <nav style={{
        background: 'rgba(250,248,244,0.98)', backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid rgba(200,169,110,.22)', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 2px 0 rgba(200,169,110,.18), 0 4px 20px rgba(15,30,53,.07)',
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.3)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 19, color: '#0f1e35', letterSpacing: '0.5px', display: 'block', lineHeight: 1.1 }}>ImmoExpert</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, color: '#c8a96e', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>Maroc</span>
          </div>
        </Link>

        <div style={{ width: 1, height: 22, background: 'rgba(200,169,110,.3)', margin: '0 14px', flexShrink: 0 }} />

        {/* ── Liens ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, justifyContent: 'center' }}>

          {!token && <>
            <Link to="/"                 className={nh()}>Accueil</Link>
            <Link to="/biens"            className={nl('/biens')}>Tendances</Link>
            <Link to="/Actualitesmarche" className={nl('/Actualitesmarche')}>Actualités</Link>
          </>}

          {isVendeur && <>
            <Link to="/"                  className={nh()}>Accueil</Link>
            <Link to="/vendeur/dashboard" className={nl('/vendeur/dashboard')}>Dashboard</Link>
            <Link to="/vendeur/mes-biens" className={nl('/vendeur/mes-biens')}>Mes Biens</Link>
            <DropMenu label="Gestion" active={isActive('/vendeur/mes-demandes') || isActive('/vendeur/contrats')}>
              <DropItem to="/vendeur/mes-demandes" label="Demandes"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}/>
              <DropItem to="/vendeur/contrats" label="Contrats"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}/>
            </DropMenu>
            <DropMenu label="Finances" active={isActive('/vendeur/mes-paiements') || isActive('/vendeur/mes-transactions') || isActive('/vendeur/prediction-prix')}>
              <DropItem to="/vendeur/mes-paiements" label="Paiements"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}/>
              <DropItem to="/vendeur/mes-transactions" label="Transactions"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}/>
              <DropItem to="/vendeur/prediction-prix" label="Prédiction IA"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}/>
            </DropMenu>
            <Link to="/Actualitesmarche" className={nl('/Actualitesmarche')}>Actualités</Link>
          </>}

          {isAdmin && <>
            <Link to="/admin/dashboard"    className={nl('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/utilisateurs" className={nl('/admin/utilisateurs')}>Utilisateurs</Link>
            <Link to="/admin/biens"        className={nl('/admin/biens')}>Biens</Link>
            <DropMenu label="Gestion" active={isActive('/admin/contrats') || isActive('/admin/contacts')}>
              <DropItem to="/admin/contrats" label="Contrats"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}/>
              <DropItem to="/admin/contacts" label="Contacts"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}/>
            </DropMenu>
            <Link to="/admin/transactions" className={nl('/admin/transactions')}>Paiements</Link>
            <Link to="/Actualitesmarche"   className={nl('/Actualitesmarche')}>Actualités</Link>
          </>}

          {isClient && <>
            <Link to="/"                     className={nh()}>Accueil</Link>
            <Link to="/biens"                className={nl('/biens')}>Tendances</Link>
            <Link to="/client/favoris"       className={nl('/client/favoris')}>Favoris</Link>
            <Link to="/client/mes-contrats"  className={nl('/client/mes-contrats')}>Contrats</Link>
            <Link to="/client/mes-paiements" className={nl('/client/mes-paiements')}>Paiements</Link>
            <Link to="/Actualitesmarche"     className={nl('/Actualitesmarche')}>Actualités</Link>
            <Link to="/client/carte-biens"   className={nl('/client/carte-biens')}>Maps</Link>
          </>}
        </div>

        {/* ── Droite : Auth ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {!token ? (
            <>
              <button className="btn-register" onClick={() => navigate('/register')}>S'inscrire</button>
              <button className="btn-login"    onClick={() => navigate('/login')}>Connexion</button>
            </>
          ) : (
            // ✅ Remplace tout le bloc auth par le ProfileDropdown
            <ProfileDropdown
              user={user}
              isAdmin={isAdmin}
              isVendeur={isVendeur}
              onLogout={handleLogout}
            />
          )}
        </div>
      </nav>
    </>
  )
}