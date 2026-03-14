import { useState, useEffect } from 'react';
import axios from "../../api/axios";

export default function DashboardAdmin() {
    const [biens, setBiens] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:8000/api/biens'),
            axios.get('http://localhost:8000/api/utilisateurs'),
        ]).then(([biensRes, usersRes]) => {
            setBiens(biensRes.data);
            setUtilisateurs(usersRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    const totalBiens        = biens.length;
    const totalUtilisateurs = utilisateurs.length;
    const biensDisponibles  = biens.filter(b => b.statut === 'disponible').length;
    const biensEnAttente    = biens.filter(b => b.statut === 'en_attente').length;
    const biensVendus       = biens.filter(b => b.statut === 'vendu').length;
    const biensLoues        = biens.filter(b => b.statut === 'loué').length;

    const rolesCount = utilisateurs.reduce((acc, u) => {
        const role = u.role?.libelle || 'inconnu';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const vendeurCount = Object.values(
        biens.reduce((acc, b) => {
            if (b.vendeur) {
                const key = b.id_vendeur;
                if (!acc[key]) acc[key] = { name: `${b.vendeur.prenom} ${b.vendeur.nom}`, total: 0 };
                acc[key].total += 1;
            }
            return acc;
        }, {})
    );

    const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];

    const statutBiens = [
        { label: 'En attente', value: biensEnAttente,   color: '#6f42c1' },
        { label: 'Disponible', value: biensDisponibles, color: '#28a745' },
        { label: 'Vendu',      value: biensVendus,      color: '#dc3545' },
        { label: 'Loué',       value: biensLoues,       color: '#ffc107' },
    ];

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '30px', color: '#333' }}>📊 Tableau de bord</h1>

            {/* Cartes statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                <StatCard icon="👥" title="Utilisateurs"  value={totalUtilisateurs} color="#007bff" />
                <StatCard icon="🏠" title="Total Biens"   value={totalBiens}        color="#28a745" />
                <StatCard icon="✅" title="Disponibles"   value={biensDisponibles}  color="#17a2b8" />
                <StatCard icon="⏳" title="En attente"    value={biensEnAttente}    color="#fd7e14" />
                <StatCard icon="🔑" title="Vendus"        value={biensVendus}       color="#dc3545" />
                <StatCard icon="🏘️" title="Loués"         value={biensLoues}        color="#ffc107" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Graphique Rôles */}
                <ChartCard title="👥 Utilisateurs par rôle">
                    {Object.entries(rolesCount).map(([role, count], i) => (
                        <BarRow key={role} label={role} value={count} max={totalUtilisateurs} color={COLORS[i % COLORS.length]} />
                    ))}
                </ChartCard>

                {/* Graphique Statuts */}
                <ChartCard title="🏠 Biens par statut">
                    {statutBiens.map((s, i) => (
                        <BarRow key={s.label} label={s.label} value={s.value} max={totalBiens || 1} color={s.color} />
                    ))}
                </ChartCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Graphique Type */}
                <ChartCard title="🏗️ Biens par type">
                    {['vente', 'location'].map((type, i) => {
                        const count = biens.filter(b => b.type_bien === type).length;
                        return <BarRow key={type} label={type} value={count} max={totalBiens || 1} color={COLORS[i]} />;
                    })}
                </ChartCard>

                {/* Graphique Vendeurs */}
                <ChartCard title="🧑‍💼 Biens par vendeur">
                    {vendeurCount.map((v, i) => (
                        <BarRow key={v.name} label={v.name} value={v.total} max={totalBiens || 1} color={COLORS[i % COLORS.length]} />
                    ))}
                </ChartCard>
            </div>

            {/* Tableaux résumé */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                <ChartCard title="📋 Résumé des rôles">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={thStyle}>Rôle</th>
                                <th style={thStyle}>Nombre</th>
                                <th style={thStyle}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(rolesCount).map(([role, count], i) => (
                                <tr key={role} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}>
                                        <span style={{ background: COLORS[i % COLORS.length], color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px' }}>
                                            {role}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{count}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {((count / totalUtilisateurs) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ChartCard>

                <ChartCard title="🏠 Résumé des biens">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={thStyle}>Statut</th>
                                <th style={thStyle}>Nombre</th>
                                <th style={thStyle}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statutBiens.map(({ label, value, color }, i) => (
                                <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}>
                                        <span style={{ background: color, color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px' }}>
                                            {label}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{value}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {totalBiens > 0 ? ((value / totalBiens) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ChartCard>
            </div>
        </div>
    );
}

// Barre de progression CSS
function BarRow({ label, value, max, color }) {
    const percent = max > 0 ? (value / max) * 100 : 0;
    return (
        <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                <span style={{ color: '#444', textTransform: 'capitalize' }}>{label}</span>
                <span style={{ fontWeight: 'bold', color }}>{value}</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, background: color, height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' }} />
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, color }) {
    return (
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{title}</div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#333', fontSize: '16px' }}>{title}</h3>
            {children}
        </div>
    );
}

const thStyle = { padding: '10px 15px', textAlign: 'left', fontWeight: '600', color: '#555' };
const tdStyle = { padding: '10px 15px', color: '#444' };