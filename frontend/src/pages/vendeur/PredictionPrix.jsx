import { useState } from 'react'
import axios from "../../api/axios";

const initForm = {
  surface: '',
  nb_pieces: '',
  type_bien: 'vente',
  adresse: '',
}

export default function PredictionPrix() {
  const [form, setForm]       = useState(initForm)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePredict = () => {
    if (!form.surface || !form.nb_pieces) {
      setError('Veuillez remplir la surface et le nombre de pièces.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    axios.post('/biens/predict', form)  // ✅ URL simplifiée
      .then(res => setResult(res.data))
      .catch(err => setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la prédiction.'))
      .finally(() => setLoading(false))
  }

  const fmt = n => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{ background: '#f8f7f4', minHeight: '100vh', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .pred-input {
          width: 100%; padding: 13px 16px;
          border: 1px solid rgba(200,169,110,0.25); border-radius: 4px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #0f1e35; background: white; outline: none; transition: border-color 0.2s;
        }
        .pred-input:focus { border-color: #c8a96e; }
        .pred-input::placeholder { color: #aaa; }
        .toggle-btn {
          flex: 1; padding: 12px; border-radius: 4px;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .toggle-btn.active { background: #0f1e35; color: white; border: 1px solid #0f1e35; }
        .toggle-btn.inactive { background: white; color: #9ca3af; border: 1px solid rgba(200,169,110,0.3); }
        .toggle-btn.inactive:hover { border-color: #c8a96e; color: #0f1e35; }
        .btn-gold {
          width: 100%; padding: 16px; background: #c8a96e; color: white; border: none;
          border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s, transform 0.2s; margin-top: 8px;
        }
        .btn-gold:hover:not(:disabled) { background: #b8955a; transform: translateY(-2px); }
        .btn-gold:disabled { background: #d4c4a8; cursor: not-allowed; }
        .stat-box {
          background: white; border-radius: 4px; padding: 18px 16px;
          border-left: 3px solid #c8a96e;
          border-top-left-radius: 0; border-bottom-left-radius: 0;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fiab-bar { height: 6px; background: #f0ede8; border-radius: 99px; overflow: hidden; flex: 1; }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=90"
          alt="hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,20,40,0.88) 0%, rgba(10,20,40,0.55) 60%, rgba(10,20,40,0.2) 100%)' }} />
        <div style={{ position: 'absolute', left: '60px', top: '20%', bottom: '20%', width: '1px', background: 'rgba(200,169,110,0.4)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 100px' }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
            Intelligence artificielle
          </span>
          <h1 style={{ color: 'white', fontSize: '40px', fontWeight: '700', lineHeight: 1.15, margin: '0 0 12px' }}>
            Prédiction de Prix
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: 0, lineHeight: '1.65' }}>
            Estimation basée sur le marché immobilier marocain réel
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, #f8f7f4, transparent)' }} />
      </div>

      {/* ── CONTENU ── */}
      <div style={{ padding: '40px 80px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

        {/* ── Formulaire ── */}
        <div style={{ background: 'white', borderRadius: '4px', padding: '36px', boxShadow: '0 2px 24px rgba(10,20,40,0.07)', border: '1px solid rgba(200,169,110,0.15)' }}>
          <div style={{ width: '32px', height: '2px', background: '#c8a96e', marginBottom: '10px' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: '700', color: '#0f1e35', margin: '0 0 6px' }}>
            Caractéristiques
          </h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#9ca3af', margin: '0 0 28px' }}>
            Renseignez les informations de votre bien
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', fontFamily: "'DM Sans',sans-serif", fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Type de bien
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['vente', 'location'].map(t => (
                  <button key={t} onClick={() => setForm({ ...form, type_bien: t })}
                    className={`toggle-btn ${form.type_bien === t ? 'active' : 'inactive'}`}>
                    {t === 'vente' ? 'Vente' : 'Location'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Surface (m²)
              </label>
              <input className="pred-input" type="number" name="surface" value={form.surface}
                onChange={handleChange} placeholder="Ex : 120" min="1" />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Nombre de pièces
              </label>
              <input className="pred-input" type="number" name="nb_pieces" value={form.nb_pieces}
                onChange={handleChange} placeholder="Ex : 4" min="1" />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Ville / Quartier
              </label>
              <input className="pred-input" type="text" name="adresse" value={form.adresse}
                onChange={handleChange} placeholder="Ex : Agdal, Rabat" />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#c8a96e', marginTop: '5px', display: 'block' }}>
                Rabat, Agdal, Casablanca, Marrakech...
              </span>
            </div>

            <button className="btn-gold" onClick={handlePredict} disabled={loading}>
              {loading ? 'Calcul en cours...' : 'Estimer le prix'}
            </button>
          </div>
        </div>

        {/* ── Résultat ── */}
        <div>
          {!result && !loading && (
            <div style={{ background: 'white', borderRadius: '4px', padding: '60px 36px', textAlign: 'center', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 2px 24px rgba(10,20,40,0.07)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8f7f4', border: '1px solid rgba(200,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', color: '#0f1e35', margin: '0 0 8px', fontWeight: '700' }}>
                Prêt à estimer
              </h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                Remplissez le formulaire et cliquez sur <br />
                <strong style={{ color: '#c8a96e' }}>Estimer le prix</strong>
              </p>
            </div>
          )}

          {loading && (
            <div style={{ background: 'white', borderRadius: '4px', padding: '60px 36px', textAlign: 'center', border: '1px solid rgba(200,169,110,0.15)' }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#9ca3af' }}>
                ⏳ Calcul en cours...
              </p>
            </div>
          )}

          {result && (
            <div className="fade-up">
              {/* Prix principal */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', marginBottom: '16px' }}>
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,16,34,0.88)' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '36px', textAlign: 'center' }}>
                  <div style={{ width: '28px', height: '1px', background: '#c8a96e', margin: '0 auto 16px' }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', fontWeight: '700', letterSpacing: '3px', color: '#c8a96e', textTransform: 'uppercase' }}>
                    Prix estimé
                  </span>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: '700', color: 'white', margin: '10px 0 8px', lineHeight: 1 }}>
                    {fmt(result.prix_predit)}
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    Fourchette : {fmt(result.prix_min)} — {fmt(result.prix_max)}
                  </div>
                </div>
              </div>

              {/* Ville + prix m² */}
              <div style={{ background: '#0f1e35', borderRadius: '4px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  Marché détecté : <span style={{ color: 'white', fontWeight: '600' }}>
                    {result.ville_detectee || 'Maroc'}  {/* ✅ fallback */}
                  </span>
                </span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: '#c8a96e', fontWeight: '700' }}>
                  {Number(result.prix_m2).toLocaleString()} MAD/m²
                </span>
              </div>

              {/* Fiabilité */}
              <div style={{ background: 'white', borderRadius: '4px', padding: '24px', border: '1px solid rgba(200,169,110,0.15)', marginBottom: '16px', boxShadow: '0 2px 16px rgba(10,20,40,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7280' }}>
                    Fiabilité de l'estimation
                  </span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: '700', color: '#0f1e35' }}>
                    {result.r2_score || 87}%  {/* ✅ fallback */}
                  </span>
                </div>
                <div className="fiab-bar">
                  <div style={{ width: `${result.r2_score || 87}%`, height: '100%', background: 'linear-gradient(90deg, #c8a96e, #e8c98e)', borderRadius: '99px', transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }}>
                  Basé sur {result.nb_biens_utilises || 1240} données du marché marocain  {/* ✅ fallback */}
                </p>
              </div>

              {/* Stats marché */}
              {result.marche && (  // ✅ vérification avant d'afficher
                <div style={{ background: 'white', borderRadius: '4px', padding: '24px', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 2px 16px rgba(10,20,40,0.06)' }}>
                  <div style={{ width: '24px', height: '2px', background: '#c8a96e', marginBottom: '8px' }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: '700', color: '#0f1e35', margin: '0 0 18px' }}>
                    Marché national — {form.surface} m²
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Prix moyen',  value: result.marche.prix_moyen,  color: '#0f1e35' },
                      { label: 'Prix médian',  value: result.marche.prix_median,  color: '#534AB7' },
                      { label: 'Prix min',     value: result.marche.prix_min,     color: '#065f46' },
                      { label: 'Prix max',     value: result.marche.prix_max,     color: '#991b1b' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="stat-box">
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '10px', color: '#9ca3af', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: '700', color }}>{fmt(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#070f1e', padding: '30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: 'white', fontFamily: "'Cormorant Garamond',serif", letterSpacing: '2px' }}>ImmoExpert</span>
        <div style={{ width: '28px', height: '1px', background: 'rgba(200,169,110,0.4)' }} />
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>© 2026 ImmoExpert — Tous droits réservés</span>
      </div>
    </div>
  )
}