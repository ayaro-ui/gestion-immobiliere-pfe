import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const ROLE_COLORS = {
    admin:    { bg: '#fde8e8', color: '#c0392b' },
    vendeur:  { bg: '#e8f0fd', color: '#1a56db' },
    acheteur: { bg: '#e8fdf0', color: '#1a7a3c' },
};

const emptyForm = { nom: '', prenom: '', email: '', mot_de_passe: '', telephone: '', id_role: '' };

export default function GestionUtilisateurs() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [roles, setRoles]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showModal, setShowModal]       = useState(false);
    const [editUser, setEditUser]         = useState(null);
    const [form, setForm]                 = useState(emptyForm);
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState('');
    const [search, setSearch]             = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        Promise.all([
            axios.get('http://localhost:8000/api/utilisateur'),
            axios.get('http://localhost:8000/api/roles'),
        ]).then(([usersRes, rolesRes]) => {
            setUtilisateurs(usersRes.data);
            setRoles(rolesRes.data);
        }).finally(() => setLoading(false));
    };

    const openAdd = () => {
        setEditUser(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            mot_de_passe: '',
            telephone: user.telephone || '',
            id_role: user.id_role,
        });
        setError('');
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        axios.delete(`http://localhost:8000/api/utilisateur/${id}`)
            .then(() => {
                setSuccess('Utilisateur supprimé !');
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            });
    };

    const handleSubmit = () => {
        setError('');
        const url    = editUser
            ? `http://localhost:8000/api/utilisateur/${editUser.id_user}`
            : 'http://localhost:8000/api/utilisateur';
        const method = editUser ? 'put' : 'post';

        axios[method](url, form)
            .then(() => {
                setSuccess(editUser ? 'Utilisateur modifié !' : 'Utilisateur ajouté !');
                setShowModal(false);
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            })
            .catch(err => {
                const errors = err.response?.data?.errors;
                setError(errors ? Object.values(errors).flat().join(' | ') : 'Une erreur est survenue.');
            });
    };

    // ── Filtre recherche ──────────────────────────────────────────────────────
    const filtered = utilisateurs.filter(u => {
        const q = search.toLowerCase();
        return (
            u.nom.toLowerCase().includes(q)                          ||
            u.prenom.toLowerCase().includes(q)                       ||
            u.email.toLowerCase().includes(q)                        ||
            (u.telephone || '').toLowerCase().includes(q)            ||
            (u.role?.libelle || '').toLowerCase().includes(q)        ||
            (u.date_inscription || '').toLowerCase().includes(q)
        );
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <p style={{ color: '#666' }}>Chargement...</p>
        </div>
    );

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h1 style={{ color: '#333', margin: 0 }}>👥 Gestion des Utilisateurs</h1>
                <button onClick={openAdd} style={btnPrimary}>+ Ajouter</button>
            </div>

            {success && (
                <div style={{ background: '#d4edda', color: '#155724', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    ✅ {success}
                </div>
            )}

            {/* Compteurs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                {roles.map((role, i) => {
                    const count = utilisateurs.filter(u => u.id_role === role.id_role).length;
                    const style = ROLE_COLORS[role.libelle] || { bg: '#eee', color: '#333' };
                    return (
                        <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '15px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${style.color}` }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: style.color }}>{count}</div>
                            <div style={{ fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>{role.libelle}s</div>
                        </div>
                    );
                })}
                <div style={{ background: 'white', borderRadius: '10px', padding: '15px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #333' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{utilisateurs.length}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Total</div>
                </div>
            </div>

            {/* Tableau */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' }}>

                {/* Barre de recherche */}
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom, prénom, email, téléphone, rôle..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}
                />

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Nom complet</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Téléphone</th>
                            <th style={thStyle}>Date inscription</th>
                            <th style={thStyle}>Rôle</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user, i) => {
                                const roleStyle = ROLE_COLORS[user.role?.libelle] || { bg: '#eee', color: '#333' };
                                return (
                                    <tr key={user.id_user} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={tdStyle}>{user.id_user}</td>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{user.prenom} {user.nom}</td>
                                        <td style={tdStyle}>📧 {user.email}</td>
                                        <td style={tdStyle}>📞 {user.telephone || '—'}</td>
                                        <td style={tdStyle}>📅 {user.date_inscription}</td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: roleStyle.bg, color: roleStyle.color }}>
                                                {user.role?.libelle || '—'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => openEdit(user)} style={btnEdit}>✏️ Modifier</button>
                                                <button onClick={() => handleDelete(user.id_user)} style={btnDelete}>🗑️ Supprimer</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ margin: '0 0 20px', color: '#333' }}>
                            {editUser ? '✏️ Modifier utilisateur' : '➕ Ajouter utilisateur'}
                        </h2>

                        {error && (
                            <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={inputStyle} />
                                <input placeholder="Nom"    value={form.nom}    onChange={e => setForm({ ...form, nom: e.target.value })}    style={inputStyle} />
                            </div>
                            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                            <input placeholder={editUser ? 'Nouveau mot de passe (laisser vide)' : 'Mot de passe'} type="password" value={form.mot_de_passe} onChange={e => setForm({ ...form, mot_de_passe: e.target.value })} style={inputStyle} />
                            <input placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} style={inputStyle} />
                            <select value={form.id_role} onChange={e => setForm({ ...form, id_role: e.target.value })} style={inputStyle}>
                                <option value="">-- Choisir un rôle --</option>
                                {roles.map(role => (
                                    <option key={role.id_role} value={role.id_role}>{role.libelle}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} style={btnCancel}>Annuler</button>
                            <button onClick={handleSubmit} style={btnPrimary}>
                                {editUser ? 'Modifier' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle    = { padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#555', borderBottom: '2px solid #dee2e6' };
const tdStyle    = { padding: '12px 15px', color: '#444', verticalAlign: 'middle' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const btnPrimary = { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const btnEdit    = { padding: '6px 12px', background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const btnDelete  = { padding: '6px 12px', background: '#f8d7da', color: '#721c24', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const btnCancel  = { padding: '10px 20px', background: '#f8f9fa', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' };