import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const STATUTS = ['en_attente', 'disponible', 'vendu', 'loue'];

const IMG_BASE = 'http://127.0.0.1:8000/storage/';

export default function GestionBiens() {
    const [biens, setBiens]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showImages, setShowImages] = useState(null);
    const [success, setSuccess]       = useState('');
    const [error, setError]           = useState('');
    const [search, setSearch]         = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        axios.get('/biens')
            .then(res => setBiens(Array.isArray(res.data) ? res.data : []))
            .catch(() => setError('Impossible de charger les biens.'))
            .finally(() => setLoading(false));
    };

    const showMsg = (msg, isError = false) => {
        isError ? setError(msg) : setSuccess(msg);
        setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Supprimer ce bien ?')) return;
        axios.delete(`/biens/${id}`)
            .then(() => { showMsg('Bien supprimé !'); fetchData(); })
            .catch(() => showMsg('Erreur lors de la suppression.', true));
    };

    const handleStatut = (id, statut) => {
        axios.patch(`/biens/${id}/statut`, { statut })
            .then(() => { showMsg('Statut mis à jour !'); fetchData(); })
            .catch(() => showMsg('Erreur lors de la mise à jour.', true));
    };

    const statutStyle = (statut) => {
        if (statut === 'en_attente') return { bg: '#e2d9f3', color: '#6f42c1' };
        if (statut === 'disponible') return { bg: '#d4edda', color: '#155724' };
        if (statut === 'vendu')      return { bg: '#f8d7da', color: '#721c24' };
        if (statut === 'loue')       return { bg: '#fff3cd', color: '#856404' };
        return { bg: '#eee', color: '#333' };
    };

    const filtered = biens.filter(b => {
        const q = search.toLowerCase();
        return (
            (b.titre        || '').toLowerCase().includes(q) ||
            (b.type_bien    || '').toLowerCase().includes(q) ||
            (b.statut       || '').toLowerCase().includes(q) ||
            (b.adresse      || '').toLowerCase().includes(q) ||
            String(b.prix   || '').includes(q)               ||
            String(b.surface|| '').includes(q)               ||
            (b.vendeur ? `${b.vendeur.prenom} ${b.vendeur.nom}`.toLowerCase() : '').includes(q) ||
            (b.vendeur?.email || '').toLowerCase().includes(q)
        );
    });

    // Stats
    const stats = [
        { label: 'En attente', statut: 'en_attente', color: '#6f42c1' },
        { label: 'Disponible', statut: 'disponible', color: '#28a745' },
        { label: 'Vendu',      statut: 'vendu',      color: '#dc3545' },
        { label: 'Loué',       statut: 'loue',       color: '#ffc107' },
        { label: 'Total',      statut: null,          color: '#333'    },
    ];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>

            <h1 style={{ color: '#333', marginBottom: '25px' }}>🏠 Gestion des Biens</h1>

            {success && <div style={{ background: '#d4edda', color: '#155724', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>✅ {success}</div>}
            {error   && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

            {/* Compteurs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {stats.map(({ label, statut, color }) => {
                    const count = statut ? biens.filter(b => b.statut === statut).length : biens.length;
                    return (
                        <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '15px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{count}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>{label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tableau */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' }}>

                <input
                    type="text"
                    placeholder="🔍 Rechercher par titre, type, adresse, vendeur, prix, statut..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}
                />

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Photo</th>
                            <th style={thStyle}>Titre</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Prix</th>
                            <th style={thStyle}>Surface</th>
                            <th style={thStyle}>Pièces</th>
                            <th style={thStyle}>Adresse</th>
                            <th style={thStyle}>Statut</th>
                            <th style={thStyle}>Vendeur</th>
                            <th style={thStyle}>Images</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Aucun bien trouvé</td></tr>
                        ) : (
                            filtered.map((bien, i) => {
                                const s         = statutStyle(bien.statut);
                                const firstImg  = bien.images?.[0]?.url_image;
                                return (
                                    <tr key={bien.id_bien} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={tdStyle}>{bien.id_bien}</td>

                                        {/* ── Miniature ── */}
                                        <td style={tdStyle}>
                                            <div style={{ width: 52, height: 42, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                                {firstImg
                                                    ? <img src={`${IMG_BASE}${firstImg}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>🏠</div>
                                                }
                                            </div>
                                        </td>

                                        <td style={{ ...tdStyle, fontWeight: '600', maxWidth: 160 }}>{bien.titre}</td>

                                        <td style={tdStyle}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: bien.type_bien === 'vente' ? '#e3f2fd' : '#e8f5e9', color: bien.type_bien === 'vente' ? '#1565c0' : '#2e7d32' }}>
                                                {bien.type_bien}
                                            </span>
                                        </td>

                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#007bff', whiteSpace: 'nowrap' }}>
                                            {Number(bien.prix).toLocaleString()} MAD
                                        </td>

                                        <td style={tdStyle}>{bien.surface} m²</td>
                                        <td style={tdStyle}>{bien.nb_pieces}</td>

                                        <td style={{ ...tdStyle, maxWidth: 140 }}>
                                            {bien.adresse
                                                ? <span>📍 {bien.adresse}</span>
                                                : <span style={{ color: '#999' }}>—</span>
                                            }
                                        </td>

                                        {/* ── Statut dropdown ── */}
                                        <td style={tdStyle}>
                                            <select
                                                value={bien.statut}
                                                onChange={e => handleStatut(bien.id_bien, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '12px', border: '1px solid #ddd', cursor: 'pointer', background: s.bg, color: s.color, fontWeight: '600' }}>
                                                {STATUTS.map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>

                                        <td style={tdStyle}>
                                            {bien.vendeur ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{bien.vendeur.prenom} {bien.vendeur.nom}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{bien.vendeur.email}</div>
                                                </div>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            <button onClick={() => setShowImages(bien)} style={{ padding: '5px 12px', background: '#e8f0fd', color: '#1a56db', border: '1px solid #1a56db', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                                🖼️ {bien.images?.length || 0}
                                            </button>
                                        </td>

                                        <td style={tdStyle}>
                                            <button onClick={() => handleDelete(bien.id_bien)} style={btnDelete}>🗑️ Supprimer</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Modal Images ── */}
            {showImages && (
                <div style={overlayStyle}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>🖼️ Images — {showImages.titre}</h2>
                            <button onClick={() => setShowImages(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
                        </div>
                        {!showImages.images?.length ? (
                            <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>Aucune image pour ce bien</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                                {showImages.images.map(img => (
                                    <div key={img.id_image} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                        <img
                                            src={`${IMG_BASE}${img.url_image}`}
                                            alt={img.description || ''}
                                            style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        {img.description && (
                                            <p style={{ fontSize: '11px', color: '#666', padding: '5px', margin: 0, textAlign: 'center' }}>{img.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button onClick={() => setShowImages(null)} style={btnCancel}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle     = { padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '2px solid #dee2e6' };
const tdStyle     = { padding: '12px 15px', color: '#444', verticalAlign: 'middle' };
const btnDelete   = { padding: '6px 12px', background: '#f8d7da', color: '#721c24', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };
const btnCancel   = { padding: '10px 20px', background: '#f8f9fa', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };