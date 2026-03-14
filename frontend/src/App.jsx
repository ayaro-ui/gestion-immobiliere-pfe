import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MesBiens from "./pages/vendeur/MesBiens"
import AjouterBien from "./pages/vendeur/AjouterBien"
import CreerContrat from "./pages/vendeur/CreerContrat"
import MesContratsVendeur from "./pages/vendeur/MesContrats"
import MesContratsAcheteur from "./pages/acheteur/MesContrats"
import ModifierBien from "./pages/vendeur/ModifierBien"
import DetailBien from "./pages/DetailBien"
import MesDemandes from "./pages/vendeur/MesDemandes"
import DashboardVendeur from './pages/vendeur/Dashboard'
import MesPaiements from "./pages/vendeur/MesPaiements"
import MesTransactions from "./pages/vendeur/MesTransactions"
import MesFavoris from "./pages/acheteur/MesFavoris"
import Tendances from "./pages/acheteur/Tendances"
import MesPaiementsAcheteur from "./pages/acheteur/MesPaiements"
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs'
import GestionBiens from './pages/admin/GestionBiens'
import PredictionPrix from './pages/vendeur/PredictionPrix'
import Transactions from './pages/admin/Transactions'
import DashboardAdmin from './pages/admin/Dashboard'
import GestionContacts from './pages/admin/GestionContacts'
import GestionContrats from './pages/admin/GestionsContrats'
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/biens"      element={<Tendances />} />
        <Route path="/biens/:id"  element={<DetailBien />} />
        <Route path="/contact"    element={<h1>Contact</h1>} />
        <Route path="/mes-droits" element={<h1>Mes droits</h1>} />

        {/* ── Vendeur ── */}
        <Route path="/vendeur/dashboard"         element={<DashboardVendeur />} />
        <Route path="/vendeur/mes-biens"         element={<MesBiens />} />
        <Route path="/vendeur/ajouter-bien"      element={<AjouterBien />} />
        <Route path="/vendeur/modifier-bien/:id" element={<ModifierBien />} />
        <Route path="/vendeur/mes-demandes"      element={<MesDemandes />} />
        <Route path="/vendeur/creer-contrat"     element={<CreerContrat />} />
        <Route path="/vendeur/contrats"          element={<MesContratsVendeur />} />
        <Route path="/vendeur/mes-paiements"     element={<MesPaiements />} />
        <Route path="/vendeur/mes-transactions"  element={<MesTransactions />} />
        <Route path="/vendeur/prediction-prix"   element={<PredictionPrix />} />

        {/* ── Admin ── */}
        <Route path="/admin/dashboard"             element={<DashboardAdmin />} />
        <Route path="/admin/utilisateurs"           element={<GestionUtilisateurs />} />
        <Route path="/admin/biens"                  element={<GestionBiens />} />
        <Route path="/admin/contrats"               element={<GestionContrats />} />
        <Route path="/admin/transactions" element={<Transactions />} />
        <Route path="/admin/contacts"              element={<GestionContacts />} />

        {/* ── Client / Acheteur ── */}
        <Route path="/client/favoris"       element={<MesFavoris />} />
        <Route path="/client/mes-contrats"  element={<MesContratsAcheteur />} />
        <Route path="/client/mes-paiements" element={<MesPaiementsAcheteur />} />

        {/* Anciennes routes (compatibilité) */}
        <Route path="/acheteur/contrats" element={<MesContratsAcheteur />} />
        <Route path="/acheteur/favoris"  element={<MesFavoris />} />
      </Routes>
    </>
  )
}

export default App