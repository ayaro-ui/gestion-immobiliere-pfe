import { useState, useEffect } from 'react';
import axios from "../../api/axios";


const statutStyle = (statut) => {
    if (statut === 'signe_complet') return { bg: '#cce5ff', color: '#004085' };
    if (statut === 'signe')         return { bg: '#d4edda', color: '#155724' };
    if (statut === 'signe_vendeur') return { bg: '#fff3cd', color: '#856404' };
    if (statut === 'en_attente')    return { bg: '#e2d9f3', color: '#6f42c1' };
    return { bg: '#eee', color: '#333' };
};

export default function GestionContrats() {
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        setLoading(true);
        axios.get('http://localhost:8000/api/contrats')
            .then(res => setContrats(res.data))
            .catch(() => setError('Erreur lors du chargement des contrats.'))
            .finally(() => setLoading(false));
    };

    // ── PDF via window.print() — zéro installation ───────────────────────────
    const handleDownloadPdf = (contrat) => {
        const html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8"/>
                <title>Contrat #${contrat.id_contrat}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #1a56db; }
                    .header h1 { font-size: 22px; color: #1a56db; letter-spacing: 2px; }
                    .header p  { color: #888; font-size: 12px; margin-top: 5px; }
                    .ref { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 12px; color: #666; }
                    .section { margin-bottom: 22px; }
                    .section h2 { font-size: 13px; color: #1a56db; border-left: 4px solid #1a56db; padding-left: 10px; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    table td { padding: 7px 12px; border: 1px solid #e0e0e0; font-size: 12px; }
                    table td:first-child { font-weight: bold; background: #f4f6f9; width: 35%; }
                    .sig-row { display: flex; gap: 20px; margin-top: 10px; }
                    .sig-box { flex: 1; border: 1px solid #ccc; border-radius: 6px; padding: 10px; text-align: center; }
                    .sig-box h3 { font-size: 12px; color: #555; margin-bottom: 8px; }
                    .sig-box img { width: 180px; height: 60px; object-fit: contain; }
                    .sig-empty { color: #bbb; font-size: 12px; padding: 20px 0; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CONTRAT IMMOBILIER</h1>
                    <p>Document officiel généré automatiquement</p>
                </div>

                <div class="ref">
                    <span>Réf : <strong>#${contrat.id_contrat}</strong></span>
                    <span>Date : <strong>${new Date(contrat.date_contrat).toLocaleDateString('fr-FR')}</strong></span>
                    <span>Statut : <strong>${contrat.statut}</strong></span>
                </div>

                <div class="section">
                    <h2>🏠 Bien Immobilier</h2>
                    <table>
                        <tr><td>Titre</td><td>${contrat.bien?.titre ?? '—'}</td></tr>
                        <tr><td>Type</td><td>${contrat.bien?.type_bien ?? '—'}</td></tr>
                        <tr><td>Surface</td><td>${contrat.bien?.surface ?? '—'} m²</td></tr>
                        <tr><td>Adresse</td><td>${contrat.bien?.adresse ?? '—'}</td></tr>
                        <tr><td>Montant</td><td><strong>${Number(contrat.montant).toLocaleString()} MAD</strong></td></tr>
                    </table>
                </div>

                <div class="section">
                    <h2>👤 Vendeur</h2>
                    <table>
                        <tr><td>Nom complet</td><td>${contrat.vendeur?.prenom ?? ''} ${contrat.vendeur?.nom ?? '—'}</td></tr>
                        <tr><td>Email</td><td>${contrat.vendeur?.email ?? '—'}</td></tr>
                        <tr><td>Téléphone</td><td>${contrat.vendeur?.telephone ?? '—'}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <h2>👤 Acheteur</h2>
                    <table>
                        <tr><td>Nom complet</td><td>${contrat.acheteur?.prenom ?? ''} ${contrat.acheteur?.nom ?? '—'}</td></tr>
                        <tr><td>Email</td><td>${contrat.acheteur?.email ?? '—'}</td></tr>
                        <tr><td>Téléphone</td><td>${contrat.acheteur?.telephone ?? '—'}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <h2>✍️ Signatures</h2>
                    <div class="sig-row">
                        <div class="sig-box">
                            <h3>Signature Vendeur</h3>
                            ${contrat.signature_vendeur
                                ? `<img src="${contrat.signature_vendeur}" alt="Signature vendeur"/>`
                                : `<div class="sig-empty">Non signé</div>`}
                        </div>
                        <div class="sig-box">
                            <h3>Signature Acheteur</h3>
                            ${contrat.signature_acheteur
                                ? `<img src="${contrat.signature_acheteur}" alt="Signature acheteur"/>`
                                : `<div class="sig-empty">Non signé</div>`}
                        </div>
                    </div>
                </div>

                <div class="footer">
                    Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} — Plateforme Immobilière
                </div>

                <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>

            <h1 style={{ color: '#333', marginBottom: '25px' }}>📄 Gestion des Contrats</h1>

            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Compteurs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Signé complet', statut: 'signe_complet', color: '#004085' },
                    { label: 'Signé',         statut: 'signe',         color: '#28a745' },
                    { label: 'Signé vendeur', statut: 'signe_vendeur', color: '#856404' },
                    { label: 'En attente',    statut: 'en_attente',    color: '#6f42c1' },
                    { label: 'Total',         statut: null,            color: '#333'    },
                ].map(({ label, statut, color }) => {
                    const count = statut
                        ? contrats.filter(c => c.statut === statut).length
                        : contrats.length;
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Montant</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Statut</th>
                            <th style={thStyle}>Signature Vendeur</th>
                            <th style={thStyle}>Signature Acheteur</th>
                            <th style={thStyle}>Bien</th>
                            <th style={thStyle}>Vendeur</th>
                            <th style={thStyle}>Acheteur</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contrats.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    Aucun contrat trouvé
                                </td>
                            </tr>
                        ) : (
                            contrats.map((contrat, i) => {
                                const s = statutStyle(contrat.statut);
                                return (
                                    <tr key={contrat.id_contrat} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>

                                        <td style={tdStyle}>{contrat.id_contrat}</td>

                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#007bff' }}>
                                            {Number(contrat.montant).toLocaleString()} MAD
                                        </td>

                                        <td style={tdStyle}>
                                            {new Date(contrat.date_contrat).toLocaleDateString('fr-FR')}
                                        </td>

                                        <td style={tdStyle}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.bg, color: s.color }}>
                                                {contrat.statut}
                                            </span>
                                        </td>

                                        <td style={tdStyle}>
                                            {contrat.signature_vendeur ? (
                                                <img src={contrat.signature_vendeur} alt="sig vendeur"
                                                    style={{ width: '100px', height: '45px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '6px', background: 'white', padding: '3px' }} />
                                            ) : (
                                                <span style={{ color: '#bbb', fontSize: '12px' }}>— Non signé</span>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {contrat.signature_acheteur ? (
                                                <img src={contrat.signature_acheteur} alt="sig acheteur"
                                                    style={{ width: '100px', height: '45px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '6px', background: 'white', padding: '3px' }} />
                                            ) : (
                                                <span style={{ color: '#bbb', fontSize: '12px' }}>— Non signé</span>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {contrat.bien ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contrat.bien.titre}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{contrat.bien.type_bien}</div>
                                                </div>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            {contrat.vendeur ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contrat.vendeur.prenom} {contrat.vendeur.nom}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{contrat.vendeur.email}</div>
                                                </div>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            {contrat.acheteur ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contrat.acheteur.prenom} {contrat.acheteur.nom}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{contrat.acheteur.email}</div>
                                                </div>
                                            ) : <span style={{ color: '#999' }}>—</span>}
                                        </td>

                                        <td style={tdStyle}>
                                            <button onClick={() => handleDownloadPdf(contrat)} style={btnPdf}>
                                                📥 PDF
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = { padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '2px solid #dee2e6' };
const tdStyle = { padding: '12px 15px', color: '#444', verticalAlign: 'middle' };
const btnPdf  = { padding: '6px 14px', background: '#e8f0fd', color: '#1a56db', border: '1px solid #1a56db', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };