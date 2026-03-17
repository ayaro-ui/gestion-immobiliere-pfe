import { useState, useEffect, useRef } from 'react'
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom'

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90',
    titre: 'Trouvez la maison de vos rêves',
    sous: 'Des milliers de biens disponibles au Maroc',
  },
  {
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90',
    titre: 'Villas & Résidences de standing',
    sous: 'Les plus belles propriétés sélectionnées pour vous',
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90',
    titre: "Investissez dans l'immobilier",
    sous: 'Des opportunités uniques dans tout le Maroc',
  },
  {
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=90',
    titre: 'Appartements modernes & lumineux',
    sous: 'Casablanca, Rabat, Marrakech et plus encore',
  },
]

const STATS = [
  {
    svg: (<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}><path d="M20 4L4 16v20h10V24h12v12h10V16L20 4z" stroke="#c8a96e" strokeWidth="2" strokeLinejoin="round" fill="rgba(200,169,110,0.1)"/><rect x="16" y="24" width="8" height="12" rx="1" stroke="#c8a96e" strokeWidth="1.5" fill="rgba(200,169,110,0.2)"/></svg>),
    value: '10 000+', label: 'Biens disponibles'
  },
  {
    svg: (<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}><circle cx="20" cy="20" r="14" stroke="#c8a96e" strokeWidth="2" fill="none"/><ellipse cx="20" cy="20" rx="5" ry="14" stroke="#c8a96e" strokeWidth="1.5" fill="none"/><line x1="6" y1="20" x2="34" y2="20" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    value: '20+', label: 'Villes couvertes'
  },
  {
    svg: (<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}><circle cx="15" cy="13" r="5.5" stroke="#c8a96e" strokeWidth="2" fill="rgba(200,169,110,0.1)"/><circle cx="25" cy="15" r="4.5" stroke="#c8a96e" strokeWidth="1.5" fill="rgba(200,169,110,0.08)"/><path d="M4 33c0-5.523 4.925-9 11-9s11 3.477 11 9" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M27 23.5c3 .8 7 3 7 8" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>),
    value: '50 000+', label: 'Clients satisfaits'
  },
  {
    svg: (<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}><path d="M20 6l3.5 7.1 7.8 1.14-5.65 5.5 1.33 7.76L20 23.6l-7.02 3.9 1.33-7.76L8.7 14.24l7.8-1.14z" stroke="#c8a96e" strokeWidth="2" strokeLinejoin="round" fill="rgba(200,169,110,0.2)"/></svg>),
    value: '4.9/5', label: 'Note moyenne'
  },
]

const SERVICES = [
  { img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=90', titre: 'Vente', desc: 'Achetez votre bien idéal parmi notre sélection exclusive de propriétés premium.', num: '01' },
  { img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=90', titre: 'Location', desc: 'Trouvez rapidement un logement adapté à vos besoins et votre budget.', num: '02' },
  { img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=90', titre: 'Estimation', desc: 'Estimez précisément la valeur marchande de votre bien immobilier.', num: '03' },
  { img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90', titre: 'Gestion', desc: 'Confiez-nous la gestion locative de votre patrimoine immobilier.', num: '04' },
]

// ── Icônes SVG professionnelles ───────────────────────────────────────────────
const IcoRuler = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
    <path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>
  </svg>
)
const IcoDoor = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/>
    <path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.069.998L3 20.562a2 2 0 0 1-1-3.562V5a2 2 0 0 1 2-2h9z"/>
  </svg>
)
const IcoTag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <path d="M7 7h.01"/>
  </svg>
)
const IcoKey = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
)
const IcoPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoHeart = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)
const IcoUser = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

function Home() {
  const [biens,      setBiens]      = useState([])
  const [favoris,    setFavoris]    = useState({})
  const [loadingFav, setLoadingFav] = useState({})
  const [slide,      setSlide]      = useState(0)
  const [animating,  setAnimating]  = useState(false)
  const biensRef                    = useRef(null)
  const navigate                    = useNavigate()

  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const token    = localStorage.getItem('token')
  const isClient = token && user?.id_role === 3
  const showHeart = !token || isClient

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => { setSlide(s => (s + 1) % HERO_SLIDES.length); setAnimating(false) }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    axios.get('/biens').then(res => setBiens(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isClient) return
    axios.get('/favoris').then(res => {
      const map = {}
      res.data.forEach(f => { if (f.id_user === user.id_user) map[f.id_bien] = f.id_favori })
      setFavoris(map)
    }).catch(() => {})
  }, [isClient])

  const toggleFavori = async (e, id_bien) => {
    e.stopPropagation()
    if (!token) { navigate('/login'); return }
    if (!isClient) return
    setLoadingFav(p => ({ ...p, [id_bien]: true }))
    try {
      if (favoris[id_bien]) {
        await axios.delete(`/favoris/${favoris[id_bien]}`)
        setFavoris(p => { const n = { ...p }; delete n[id_bien]; return n })
      } else {
        const { data } = await axios.post('/favoris', { id_bien, id_user: user.id_user })
        setFavoris(p => ({ ...p, [id_bien]: data.id_favori }))
      }
    } catch {}
    setLoadingFav(p => ({ ...p, [id_bien]: false }))
  }

  const scrollToBiens = () => biensRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const fmt = n => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
  const current = HERO_SLIDES[slide]

  return (
    <div style={{ background: '#f8f7f4', minHeight: '100vh', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .hero-img { transition: opacity 0.6s ease, transform 0.6s ease; }
        .hero-img.fade { opacity: 0; transform: scale(1.03); }
        .dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.4); cursor:pointer; transition:all 0.3s; border:none; }
        .dot.active { background:white; width:28px; border-radius:4px; }
        .btn-primary { background:#c8a96e; color:white; border:none; padding:16px 40px; border-radius:4px; font-size:15px; font-weight:600; cursor:pointer; letter-spacing:1px; font-family:'DM Sans',sans-serif; transition:background 0.2s,transform 0.2s; text-transform:uppercase; }
        .btn-primary:hover { background:#b8955a; transform:translateY(-2px); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay:0.1s; opacity:0; }
        .delay-2 { animation-delay:0.25s; opacity:0; }
        .delay-3 { animation-delay:0.4s; opacity:0; }

        /* Services */
        .svc { position:relative; height:360px; overflow:hidden; cursor:pointer; }
        .svc img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform 0.7s ease; filter:brightness(0.8); }
        .svc .svc-ov { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,10,25,0.9) 0%,rgba(5,10,25,0.25) 60%,rgba(5,10,25,0.05) 100%); transition:background 0.4s; }
        .svc .svc-line { width:32px; height:2px; background:#c8a96e; margin-bottom:12px; transition:width 0.4s ease; }
        .svc .svc-desc { opacity:0; transform:translateY(10px); transition:opacity 0.4s,transform 0.4s; font-family:'DM Sans',sans-serif; color:rgba(255,255,255,0.8); font-size:13px; line-height:1.7; margin:0; }
        .svc:hover img { transform:scale(1.08); filter:brightness(0.7); }
        .svc:hover .svc-ov { background:linear-gradient(to top,rgba(5,10,25,0.95) 0%,rgba(5,10,25,0.5) 60%,rgba(5,10,25,0.15) 100%); }
        .svc:hover .svc-line { width:52px; }
        .svc:hover .svc-desc { opacity:1; transform:translateY(0); }
        .svc-border { position:absolute; inset:0; border:1px solid transparent; transition:border-color 0.4s; pointer-events:none; z-index:3; }
        .svc:hover .svc-border { border-color:rgba(200,169,110,0.5); }

        /* ── Nouvelles cartes biens ── */
        .bien-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.28s;
          box-shadow: 0 2px 16px rgba(10,20,40,0.08);
          position: relative;
        }
        .bien-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 52px rgba(10,20,40,0.16);
        }
        .bien-card:hover .bien-img { transform: scale(1.06); }
        .bien-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c8a96e, #e8c98e, #c8a96e);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .bien-card:hover::after { transform: scaleX(1); }
        .bien-img { width:100%; height:100%; object-fit:cover; transition:transform 0.55s ease; display:block; }

        .spec-item { display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; padding:10px 6px; border-right:1px solid #f0ede8; }
        .spec-item:last-child { border-right:none; }
        .spec-val { font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; color:#0f1e35; }
        .spec-lbl { font-family:'DM Sans',sans-serif; font-size:9px; color:#9ca3af; letter-spacing:0.8px; text-transform:uppercase; }

        .stat-item { text-align:center; padding:28px 20px; position:relative; }
        .stat-item::after { content:''; position:absolute; right:0; top:25%; bottom:25%; width:1px; background:rgba(200,169,110,0.2); }
        .stat-item:last-child::after { display:none; }

        .voir-btn { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#c8a96e; cursor:pointer; background:none; border:none; padding:0; transition:gap 0.2s,letter-spacing 0.2s; display:flex; align-items:center; gap:6px; }
        .voir-btn:hover { letter-spacing:3px; }

        .heart-btn { transition:transform 0.15s; border:none; cursor:pointer; background:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.15); }
        .heart-btn:hover { transform:scale(1.2); }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', height:'92vh', overflow:'hidden' }}>
        <img className={`hero-img${animating ? ' fade' : ''}`} src={current.url} alt="hero"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(10,20,40,0.85) 0%,rgba(10,20,40,0.5) 60%,rgba(10,20,40,0.15) 100%)' }} />
        <div style={{ position:'absolute', left:'60px', top:'20%', bottom:'20%', width:'1px', background:'rgba(200,169,110,0.4)' }} />
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 100px' }}>
          <div className="fade-up delay-1">
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:'700', letterSpacing:'4px', color:'#c8a96e', textTransform:'uppercase', display:'block', marginBottom:'18px' }}>
              ImmoExpert Maroc
            </span>
          </div>
          <h1 className="fade-up delay-2" style={{ color:'white', fontSize:'clamp(34px,5vw,64px)', fontWeight:'700', lineHeight:'1.1', margin:'0 0 18px', maxWidth:'620px' }}>
            {current.titre}
          </h1>
          <p className="fade-up delay-3" style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.72)', fontSize:'17px', margin:'0 0 38px', maxWidth:'480px', lineHeight:'1.65' }}>
            {current.sous}
          </p>
          <div className="fade-up delay-3">
            <button className="btn-primary" onClick={scrollToBiens}>Voir les biens</button>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:'38px', left:'100px', display:'flex', gap:'8px', zIndex:3 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`dot${i === slide ? ' active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
        <div style={{ position:'absolute', bottom:'38px', right:'60px', fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.45)', fontSize:'13px', zIndex:3 }}>
          <span style={{ color:'white', fontWeight:'700', fontSize:'17px' }}>0{slide + 1}</span>
          {' / 0'}{HERO_SLIDES.length}
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'100px', background:'linear-gradient(to top,#f8f7f4,transparent)' }} />
      </div>

      {/* ── STATS ── */}
      <div style={{ background:'#0f1e35', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
        {STATS.map(({ svg, value, label }) => (
          <div key={label} className="stat-item">
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>{svg}</div>
            <div style={{ color:'#c8a96e', fontSize:'28px', fontWeight:'700', lineHeight:1, fontFamily:"'Cormorant Garamond',serif" }}>{value}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.4)', fontSize:'11px', marginTop:'5px', letterSpacing:'0.8px', textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ height:'60px', background:'linear-gradient(to bottom,#0f1e35,#0a1428)' }} />

      {/* ── SERVICES ── */}
      <div style={{ background:'#0a1428', padding:'0 80px 80px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'44px' }}>
          <div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:'700', letterSpacing:'4px', color:'#c8a96e', textTransform:'uppercase' }}>Ce que nous faisons</span>
            <h2 style={{ fontSize:'40px', color:'white', margin:'10px 0 0', fontWeight:'700' }}>Nos services</h2>
          </div>
          <div style={{ width:'60px', height:'2px', background:'linear-gradient(90deg,#c8a96e,transparent)' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'3px' }}>
          {SERVICES.map(({ img, titre, desc, num }) => (
            <div key={titre} className="svc">
              <img src={img} alt={titre} />
              <div className="svc-ov" />
              <div className="svc-border" />
              <div style={{ position:'absolute', inset:0, padding:'28px 24px', display:'flex', flexDirection:'column', justifyContent:'flex-end', zIndex:2 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'52px', fontWeight:'800', color:'rgba(200,169,110,0.1)', position:'absolute', top:'14px', right:'18px', lineHeight:1 }}>{num}</div>
                <div className="svc-line" />
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:'white', fontSize:'24px', fontWeight:'700', margin:'0 0 10px' }}>{titre}</h3>
                <p className="svc-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BIENS RÉCENTS ── */}
      <div ref={biensRef} style={{ padding:'80px 80px 90px', background:'#f8f7f4' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'52px' }}>
          <div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:'700', letterSpacing:'4px', color:'#c8a96e', textTransform:'uppercase' }}>Sélection du moment</span>
            <h2 style={{ fontSize:'42px', color:'#0f1e35', margin:'10px 0 0', fontWeight:'700' }}>Biens récents</h2>
          </div>
          <button onClick={() => navigate('/biens')}
            style={{ fontFamily:"'DM Sans',sans-serif", background:'none', border:'1px solid #0f1e35', color:'#0f1e35', padding:'12px 28px', borderRadius:'2px', cursor:'pointer', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', transition:'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#0f1e35'; e.currentTarget.style.color='white'; }}
            onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#0f1e35'; }}>
            Voir tout
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'28px' }}>
          {biens.filter(b => b.statut === 'disponible').slice(0, 6).map((bien, idx) => {
            const isFav     = !!favoris[bien.id_bien]
            const isLoading = loadingFav[bien.id_bien]
            const rawUrl    = bien.images?.[0]?.url_image || ''
            const imgSrc    = rawUrl
              ? (rawUrl.startsWith('http') ? rawUrl : `http://127.0.0.1:8000/storage/${rawUrl}`)
              : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
            const isVente = bien.type_bien === 'vente'

            return (
              <div key={bien.id_bien} className="bien-card"
                onClick={() => navigate(`/biens/${bien.id_bien}`)}>

                {/* ── Image ── */}
                <div style={{ position:'relative', height:'230px', overflow:'hidden', background:'#f1f0ee' }}>
                  <img className="bien-img" src={imgSrc} alt={bien.titre}
                    onError={e => e.target.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'} />

                  {/* Overlay gradient */}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,20,40,0.7) 0%,transparent 55%)' }} />

                  {/* Badge type */}
                  <div style={{
                    position:'absolute', top:7, left:9,
                    background: isVente ? '#0f1e35' : '#0f1e35',
                    color:'#c8a96e', padding:'5px 12px',
                    fontFamily:"'DM Sans',sans-serif", fontSize:'11',
                    fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase',
                     display: "inline-flex", alignItems: "center", gap: 5,
                      borderRadius: 8,
                  }}>
                    {isVente ? <IcoTag /> : <IcoKey />}
                    {isVente ? 'Vente' : 'Location'}
                  </div>

                  {/* Statut */}
                  <div style={{
                    position:'absolute', top:7, right: showHeart ? '44px' : '0',
                    background: bien.statut === 'disponible' ? 'rgba(5,150,105,0.92)' : 'rgba(185,28,28,0.92)',
                    color:'#c8a96e', padding:'5px 12px',
                    fontFamily:"'DM Sans',sans-serif", fontSize:'11px',
                    fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase',
                    borderRadius: 8,
                  }}>
                    {bien.statut}
                  </div>

                  {/* Bouton favori */}
                  {showHeart && (
                    <button className="heart-btn"
                      onClick={e => toggleFavori(e, bien.id_bien)}
                      disabled={isLoading}
                      style={{ position:'absolute', top:'5px', right:'8px' }}>
                      <IcoHeart filled={isFav} />
                    </button>
                  )}

                  {/* Prix en bas de l'image */}
                  <div style={{ position:'absolute', bottom:'12px', left:'16px', right:'16px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <div>
                      <p style={{ margin:0, fontFamily:"'Cormorant Garamond',serif", fontWeight:'700', color:'white', fontSize:'22px', lineHeight:1, textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
                        {fmt(bien.prix)}
                      </p>
                      {!isVente && <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.65)', fontSize:'11px' }}>/mois</span>}
                    </div>
                  </div>
                </div>

                {/* ── Contenu ── */}
                <div style={{ padding:'18px 20px 20px' }}>

                  {/* Titre */}
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontWeight:'700', color:'#0f1e35', margin:'0 0 6px', lineHeight:'1.25', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {bien.titre}
                  </h3>

                  {/* Adresse */}
                  {bien.adresse && (
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:'14px', color:'#9ca3af' }}>
                      <IcoPin />
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px' }}>{bien.adresse}</span>
                    </div>
                  )}

                  {/* Ligne séparatrice dorée */}
                  <div style={{ height:'1px', background:'linear-gradient(90deg,#e8c98e,transparent)', marginBottom:'14px' }} />

                  {/* Specs avec icônes SVG */}
                  <div style={{ display:'flex', borderTop:'1px solid #f0ede8', borderBottom:'1px solid #f0ede8', marginBottom:'16px' }}>
                    <div className="spec-item">
                      <div style={{ color:'#c8a96e' }}><IcoRuler /></div>
                      <span className="spec-val">{bien.surface} m²</span>
                      <span className="spec-lbl">Surface</span>
                    </div>
                    <div className="spec-item">
                      <div style={{ color:'#c8a96e' }}><IcoDoor /></div>
                      <span className="spec-val">{bien.nb_pieces}</span>
                      <span className="spec-lbl">Pièces</span>
                    </div>
                    <div className="spec-item" style={{ borderRight:'none' }}>
                      <div style={{ color:'#c8a96e' }}>{isVente ? <IcoTag /> : <IcoKey />}</div>
                      <span className="spec-val">{isVente ? 'Vente' : 'Location'}</span>
                      <span className="spec-lbl">Type</span>
                    </div>
                  </div>

                  {/* Footer carte : vendeur + CTA */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#0f1e35,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}>
                        <IcoUser />
                      </div>
                      <div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:'600', color:'#374151' }}>
                          {bien.vendeur ? `${bien.vendeur.prenom} ${bien.vendeur.nom}` : 'Vendeur'}
                        </div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', color:'#9ca3af' }}>Propriétaire</div>
                      </div>
                    </div>
                    <button className="voir-btn">
                      Voir <IcoArrow />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div style={{ position:'relative', overflow:'hidden', padding:'90px 80px', textAlign:'center' }}>
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80" alt="cta"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(8,16,34,0.85)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ width:'40px', height:'2px', background:'#c8a96e', margin:'0 auto 20px' }} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:'700', letterSpacing:'4px', color:'#c8a96e', textTransform:'uppercase' }}>
            Rejoignez notre plateforme
          </span>
          <h2 style={{ color:'white', fontSize:'48px', margin:'16px 0 18px', fontWeight:'700', lineHeight:1.15 }}>
            Confiez-nous votre projet
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.65)', fontSize:'16px', maxWidth:'500px', margin:'0 auto 40px', lineHeight:'1.75' }}>
            Notre équipe d'experts vous accompagne de l'estimation à la signature du contrat.
          </p>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            S'inscrire gratuitement
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:'#070f1e', padding:'30px 40px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
        <span style={{ fontSize:'18px', fontWeight:'700', color:'white', fontFamily:"'Cormorant Garamond',serif", letterSpacing:'2px' }}>
          ImmoExpert
        </span>
        <div style={{ width:'28px', height:'1px', background:'rgba(200,169,110,0.4)' }} />
        <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'0.5px', textAlign:'center' }}>
          © 2026 ImmoExpert — Tous droits réservés
        </span>
      </div>
    </div>
  )
}

export default Home