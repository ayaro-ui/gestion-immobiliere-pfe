import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Accueil</h1>} />
      <Route path="/login" element={<h1>Connexion</h1>} />
      <Route path="/register" element={<h1>Inscription</h1>} />
    </Routes>
  )
}

export default App
