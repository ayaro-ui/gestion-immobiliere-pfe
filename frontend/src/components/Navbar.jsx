import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const token     = localStorage.getItem('token')
  const user      = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const isVendeur = token && user?.id_role === 2
  const isAdmin   = token && user?.id_role === 1
  const isClient  = token && user?.id_role === 3

  // Lien actif
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#2563eb' : '#374151',
    fontWeight: isActive(path) ? '700' : '500',
    fontSize: '14px',
    padding: '6px 10px',
    borderRadius: '6px',
    background: isActive(path) ? '#EEF2FF' : 'transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  })

  return (
    <nav style={{
      background: 'white',
      padding: '0 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <polygon points="18,2 34,20 2,20" fill="#2563eb" />
          <rect x="6" y="20" width="24" height="14" fill="#2563eb" rx="1" />
          <rect x="14" y="26" width="8" height="8" fill="white" rx="1" />
        </svg>
        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#2563eb' }}>ImmoExpert</span>
      </Link>

      {/* ── Liens navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

        {/* Visiteur non connecté */}
        {!token && (
          <>
            <Link to="/"          style={linkStyle('/__home__')}>Accueil</Link>
            <Link to="/biens"     style={linkStyle('/biens')}>Tendances</Link>
            <Link to="/mes-droits" style={linkStyle('/mes-droits')}>Mes droits</Link>
          </>
        )}

        {/* ── Vendeur (id_role: 2) ── */}
        {isVendeur && (
          <>
            <Link to="/"                      style={linkStyle('/__home__')}>Accueil</Link>
            <Link to="/vendeur/dashboard"     style={linkStyle('/vendeur/dashboard')}>
              📊 Dashboard
            </Link>
            <Link to="/vendeur/mes-biens"     style={linkStyle('/vendeur/mes-biens')}>Mes Biens</Link>
            <Link to="/vendeur/mes-demandes"  style={linkStyle('/vendeur/mes-demandes')}>Demandes</Link>
            <Link to="/vendeur/contrats"      style={linkStyle('/vendeur/contrats')}>Contrats</Link>
            <Link to="/vendeur/mes-paiements" style={linkStyle('/vendeur/mes-paiements')}>Paiements</Link>
            <Link to="/vendeur/mes-transactions" style={linkStyle('/vendeur/mes-transactions')}>Transactions</Link>
            <Link to="/mes-droits"            style={linkStyle('/mes-droits')}>Mes droits</Link>
          </>
        )}

        {/* ── Admin (id_role: 1) ── */}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard"    style={linkStyle('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/contrats"     style={linkStyle('/admin/contrats')}>Contrats</Link>
            <Link to="/admin/utilisateurs" style={linkStyle('/admin/utilisateurs')}>Utilisateurs</Link>
            <Link to="/admin/biens"        style={linkStyle('/admin/biens')}>Biens</Link>
            <Link to="/mes-droits"         style={linkStyle('/mes-droits')}>Mes droits</Link>
          </>
        )}

        {/* ── Client (id_role: 3) ── */}
        {isClient && (
          <>
            <Link to="/"                   style={linkStyle('/__home__')}>Accueil</Link>
            <Link to="/biens"              style={linkStyle('/biens')}>Tendances</Link>
            <Link to="/client/favoris"     style={linkStyle('/client/favoris')}>❤️ Favoris</Link>
            <Link to="/client/mes-contrats"  style={linkStyle('/client/mes-contrats')}>Contrats</Link>
            <Link to="/client/mes-paiements" style={linkStyle('/client/mes-paiements')}>Paiements</Link>
            <Link to="/mes-droits"         style={linkStyle('/mes-droits')}>Mes droits</Link>
          </>
        )}

      </div>

      {/* ── Profil / Connexion ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {!token ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/login')} style={btnPrimaryStyle}>
              Connexion
            </button>
            <button onClick={() => navigate('/register')} style={btnSecondaryStyle}>
              S'inscrire
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Badge rôle */}
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: 99,
              background: isAdmin ? '#FEF3C7' : isVendeur ? '#EEF2FF' : '#ECFDF5',
              color: isAdmin ? '#D97706' : isVendeur ? '#4F46E5' : '#059669',
              border: `1px solid ${isAdmin ? '#FCD34D' : isVendeur ? '#A5B4FC' : '#6EE7B7'}`,
            }}>
              {isAdmin ? '👑 Admin' : isVendeur ? '🏠 Vendeur' : '🤝 Client'}
            </span>

            {/* Nom utilisateur */}
            <span style={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>
              👤 {user?.prenom || user?.nom || 'Profil'}
            </span>

            <button onClick={handleLogout} style={btnLogoutStyle}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

const btnPrimaryStyle = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '8px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
}

const btnSecondaryStyle = {
  background: 'white',
  color: '#2563eb',
  border: '1px solid #2563eb',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
}

const btnLogoutStyle = {
  background: 'white',
  color: '#ef4444',
  border: '1px solid #ef4444',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '14px',
}

export default Navbar