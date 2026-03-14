import { useState, useEffect } from 'react';
import axios from "../../api/axios";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [paiements, setPaiements]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeTab, setActiveTab]       = useState('transactions');
    const [searchT, setSearchT]           = useState(''); // recherche transactions
    const [searchP, setSearchP]           = useState(''); // recherche paiements

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:8000/api/transactions'),
            axios.get('http://localhost:8000/api/paiements'),
        ]).then(([tRes, pRes]) => {
            setTransactions(tRes.data);
            setPaiements(pRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.montant), 0);
    const totalPaiements    = paiements.reduce((sum, p) => sum + Number(p.montant), 0);

    // ── Filtres ───────────────────────────────────────────────────────────────
    const filteredT = transactions.filter(t => {
        const q = searchT.toLowerCase();
        return (
            String(t.id_transaction).includes(q)               ||
            (t.type_transaction || '').toLowerCase().includes(q) ||
            (t.description      || '').toLowerCase().includes(q) ||
            (t.bien?.titre      || '').toLowerCase().includes(q) ||
            (t.client ? `${t.client.prenom} ${t.client.nom}`.toLowerCase() : '').includes(q) ||
            (t.proprietaire ? `${t.proprietaire.prenom} ${t.proprietaire.nom}`.toLowerCase() : '').includes(q)
        );
    });

    const filteredP = paiements.filter(p => {
        const q = searchP.toLowerCase();
        return (
            String(p.id_paiement).includes(q)                         ||
            (p.mode_paiement          || '').toLowerCase().includes(q) ||
            (p.contrat?.bien?.titre   || '').toLowerCase().includes(q) ||
            (p.contrat?.acheteur ? `${p.contrat.acheteur.prenom} ${p.contrat.acheteur.nom}`.toLowerCase() : '').includes(q) ||
            (p.contrat?.vendeur  ? `${p.contrat.vendeur.prenom} ${p.contrat.vendeur.nom}`.toLowerCase()   : '').includes(q)
        );
    });

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>
            <h1 style={{ color: '#333', marginBottom: '25px' }}>💰 Transactions & Paiements</h1>

            {/* Cartes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard icon="🔄" title="Transactions"    value={transactions.length}                         color="#007bff" />
                <StatCard icon="💵" title="Montant total"   value={`${totalTransactions.toLocaleString()} MAD`} color="#28a745" sub />
                <StatCard icon="💳" title="Paiements"       value={paiements.length}                            color="#6f42c1" />
                <StatCard icon="💰" title="Paiements total" value={`${totalPaiements.toLocaleString()} MAD`}    color="#fd7e14" sub />
            </div>

            {/* Onglets */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                <TabBtn label={`🔄 Transactions (${transactions.length})`} active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                <TabBtn label={`💳 Paiements (${paiements.length})`}       active={activeTab === 'paiements'}    onClick={() => setActiveTab('paiements')} />
            </div>

            {/* Tableau Transactions */}
            {activeTab === 'transactions' && (
                <div style={cardStyle}>
                    <h2 style={titleStyle}>🔄 Liste des transactions</h2>

                    {/* Barre de recherche */}
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par type, bien, client, propriétaire, description..."
                        value={searchT}
                        onChange={e => setSearchT(e.target.value)}
                        style={searchStyle}
                    />

                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Montant</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Bien</th>
                                <th style={thStyle}>Client</th>
                                <th style={thStyle}>Propriétaire</th>
                                <th style={thStyle}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredT.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Aucune transaction trouvée</td></tr>
                            ) : (
                                filteredT.map((t, i) => (
                                    <tr key={t.id_transaction} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={tdStyle}>{t.id_transaction}</td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: '#e3f2fd', color: '#1565c0', fontWeight: '600' }}>
                                                {t.type_transaction}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#28a745' }}>
                                            {Number(t.montant).toLocaleString()} MAD
                                        </td>
                                        <td style={tdStyle}>📅 {t.date_transaction}</td>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{t.bien?.titre || '—'}</td>
                                        <td style={tdStyle}>{t.client ? `${t.client.prenom} ${t.client.nom}` : '—'}</td>
                                        <td style={tdStyle}>{t.proprietaire ? `${t.proprietaire.prenom} ${t.proprietaire.nom}` : '—'}</td>
                                        <td style={{ ...tdStyle, color: '#888', fontSize: '13px' }}>{t.description || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {filteredT.length > 0 && (
                        <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '15px', fontWeight: 'bold', color: '#28a745' }}>
                            Total : {filteredT.reduce((s, t) => s + Number(t.montant), 0).toLocaleString()} MAD
                        </div>
                    )}
                </div>
            )}

            {/* Tableau Paiements */}
            {activeTab === 'paiements' && (
                <div style={cardStyle}>
                    <h2 style={titleStyle}>💳 Liste des paiements</h2>

                    {/* Barre de recherche */}
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par mode, bien, acheteur, vendeur..."
                        value={searchP}
                        onChange={e => setSearchP(e.target.value)}
                        style={searchStyle}
                    />

                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Montant</th>
                                <th style={thStyle}>Mode</th>
                                <th style={thStyle}>Bien</th>
                                <th style={thStyle}>Acheteur</th>
                                <th style={thStyle}>Vendeur</th>
                                <th style={thStyle}>Contrat statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredP.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Aucun paiement trouvé</td></tr>
                            ) : (
                                filteredP.map((p, i) => (
                                    <tr key={p.id_paiement} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={tdStyle}>{p.id_paiement}</td>
                                        <td style={tdStyle}>📅 {p.date_paiement}</td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#007bff' }}>
                                            {Number(p.montant).toLocaleString()} MAD
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: '#e8f5e9', color: '#2e7d32', fontWeight: '600' }}>
                                                {p.mode_paiement}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{p.contrat?.bien?.titre || '—'}</td>
                                        <td style={tdStyle}>{p.contrat?.acheteur ? `${p.contrat.acheteur.prenom} ${p.contrat.acheteur.nom}` : '—'}</td>
                                        <td style={tdStyle}>{p.contrat?.vendeur  ? `${p.contrat.vendeur.prenom} ${p.contrat.vendeur.nom}`   : '—'}</td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: p.contrat?.statut === 'signe' ? '#d4edda' : '#fff3cd', color: p.contrat?.statut === 'signe' ? '#155724' : '#856404', fontWeight: '600' }}>
                                                {p.contrat?.statut || '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {filteredP.length > 0 && (
                        <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '15px', fontWeight: 'bold', color: '#007bff' }}>
                            Total : {filteredP.reduce((s, p) => s + Number(p.montant), 0).toLocaleString()} MAD
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, title, value, color, sub }) {
    return (
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: sub ? '18px' : '32px', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{title}</div>
        </div>
    );
}

function TabBtn({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px',
            background: active ? '#007bff' : 'white',
            color:      active ? 'white'   : '#555',
            boxShadow:  active ? '0 2px 8px rgba(0,123,255,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
        }}>
            {label}
        </button>
    );
}

const cardStyle  = { background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' };
const titleStyle = { margin: '0 0 15px', color: '#333', fontSize: '18px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
const thStyle    = { padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '2px solid #dee2e6' };
const tdStyle    = { padding: '12px 15px', color: '#444', verticalAlign: 'middle' };
const searchStyle = { width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', boxSizing: 'border-box' };