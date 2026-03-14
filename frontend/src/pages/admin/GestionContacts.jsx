import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const statutStyle = (statut) => {
    if (statut === 'nouveau')    return { bg: '#cce5ff', color: '#004085' };
    if (statut === 'traité')     return { bg: '#d4edda', color: '#155724' };
    if (statut === 'en_cours')   return { bg: '#fff3cd', color: '#856404' };
    if (statut === 'fermé')      return { bg: '#f8d7da', color: '#721c24' };
    return { bg: '#eee', color: '#333' };
};

export default function GestionContacts() {
    const [contacts, setContacts]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [showBien, setShowBien]       = useState(null); // modal bien lié
    const [search, setSearch]           = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        setLoading(true);
        axios.get('http://localhost:8000/api/contacts')
            .then(res => setContacts(res.data))
            .catch(() => setError('Erreur lors du chargement des contacts.'))
            .finally(() => setLoading(false));
    };

    const filtered = contacts.filter(c =>
        c.nom.toLowerCase().includes(search.toLowerCase())   ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.message && c.message.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>

            <h1 style={{ color: '#333', marginBottom: '25px' }}>📬 Gestion des Contacts</h1>

            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Compteurs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Nouveau',   statut: 'nouveau',  color: '#004085' },
                    { label: 'En cours',  statut: 'en_cours', color: '#856404' },
                    { label: 'Traité',    statut: 'traité',   color: '#28a745' },
                    { label: 'Fermé',     statut: 'fermé',    color: '#dc3545' },
                    { label: 'Total',     statut: null,       color: '#333'    },
                ].map(({ label, statut, color }) => {
                    const count = statut
                        ? contacts.filter(c => c.statut === statut).length
                        : contacts.length;
                    return (
                        <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '15px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{count}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>{label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Barre de recherche */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom, email ou message..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                />
            </div>

            {/* Tableau */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Nom</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Message</th>
                            <th style={thStyle}>Statut</th>
                            <th style={thStyle}>Client</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Bien lié</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    Aucun contact trouvé
                                </td>
                            </tr>
                        ) : (
                            filtered.map((contact, i) => {
                                const s = statutStyle(contact.statut);
                                return (
                                    <tr key={contact.id_contact} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>

                                        <td style={tdStyle}>{contact.id_contact}</td>

                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{contact.nom}</td>

                                        <td style={tdStyle}>
                                            <a href={`mailto:${contact.email}`} style={{ color: '#1a56db', textDecoration: 'none' }}>
                                                {contact.email}
                                            </a>
                                        </td>

                                        <td style={{ ...tdStyle, maxWidth: '250px' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }}
                                                 title={contact.message}>
                                                {contact.message}
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                            {contact.statut ? (
                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.bg, color: s.color }}>
                                                    {contact.statut}
                                                </span>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            {contact.client ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contact.client.prenom} {contact.client.nom}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{contact.client.email}</div>
                                                </div>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            {contact.date_envoi
                                                ? new Date(contact.date_envoi).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </td>

                                        <td style={tdStyle}>
                                            {contact.bien ? (
                                                <button onClick={() => setShowBien(contact.bien)} style={btnBien}>
                                                    🏠 Voir
                                                </button>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Bien lié */}
            {showBien && (
                <div style={overlayStyle}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '480px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#333' }}>🏠 Bien lié</h2>
                            <button onClick={() => setShowBien(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            {[
                                ['Titre',       showBien.titre],
                                ['Type',        showBien.type_bien],
                                ['Prix',        `${Number(showBien.prix).toLocaleString()} MAD`],
                                ['Surface',     `${showBien.surface} m²`],
                                ['Pièces',      showBien.nb_pieces],
                                ['Adresse',     showBien.adresse ?? '—'],
                                ['Statut',      showBien.statut],
                            ].map(([label, val]) => (
                                <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '9px 12px', fontWeight: '600', background: '#f4f6f9', width: '35%', fontSize: '12px' }}>{label}</td>
                                    <td style={{ padding: '9px 12px', color: '#444' }}>{val}</td>
                                </tr>
                            ))}
                        </table>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button onClick={() => setShowBien(null)} style={btnCancel}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

const thStyle    = { padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '2px solid #dee2e6' };
const tdStyle    = { padding: '12px 15px', color: '#444', verticalAlign: 'middle' };
const btnBien    = { padding: '5px 12px', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #28a745', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };
const btnCancel  = { padding: '10px 20px', background: '#f8f9fa', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };