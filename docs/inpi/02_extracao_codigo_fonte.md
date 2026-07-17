# Extrato de Código Fonte para INPI

> Instruções: Leve este documento impresso + pendrive com o código-fonte completo.
> O INPI exige as primeiras e últimas 10 páginas impressas do código-fonte,
> além do código completo em mídia digital (CD/Pendrive).

---

## Primeiras Páginas do Código

### src/main.jsx — Entry Point

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster position="bottom-right" />
  </BrowserRouter>
)
```

### src/App.jsx — Router Principal

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmergencyPage from './pages/EmergencyPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/emergency/:userId" element={<EmergencyPage />} />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}
```

### src/lib/supabaseClient.js

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### src/lib/emergencyApi.js

```js
import { supabase } from './supabaseClient'

export async function fetchEmergencyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function fetchEmergencyContacts(userId) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function fetchMedicalRecords(userId) {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}
```

### src/pages/EmergencyPage.jsx (trecho inicial)

```jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchEmergencyProfile, fetchEmergencyContacts, fetchMedicalRecords } from '../lib/emergencyApi'
import EmergencyHeader from '../components/Emergency/EmergencyHeader'
import EmergencyInfo from '../components/Emergency/EmergencyInfo'
import EmergencyContacts from '../components/Emergency/EmergencyContacts'
import EmergencyNotify from '../components/Emergency/EmergencyNotify'

export default function EmergencyPage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [contacts, setContacts] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [notifySent, setNotifySent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profileData, contactsData, medicalData] = await Promise.all([
          fetchEmergencyProfile(userId),
          fetchEmergencyContacts(userId),
          fetchMedicalRecords(userId),
        ])
        setProfile(profileData)
        setContacts(contactsData)
        setMedicalRecords(medicalData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const handleNotify = async () => {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contacts }),
      })
      if (!response.ok) throw new Error('Falha ao notificar')
      setNotifySent(true)
      setPhoneRevealed(true)
    } catch (err) {
      setError(err.message)
    }
  }

  // ... (continua)
```

---

## Últimas Páginas do Código

### server/index.js

```js
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const app = express()
const PORT = process.env.PORT || 3001

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.use(cors())
app.use(express.json())

// Rota de notificação WhatsApp
app.post('/api/notify', async (req, res) => {
  const { userId, contacts } = req.body
  try {
    const profile = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()

    const userName = profile.data?.name || 'Um usuário'
    const emergencyUrl = `${process.env.SITE_URL}/emergency/${userId}`

    const results = await Promise.allSettled(
      contacts.map(contact => {
        if (!contact.whatsapp) return null
        const message = encodeURIComponent(
          `EMERGÊNCIA: ${userName} precisa de você! Acesse: ${emergencyUrl}`
        )
        return fetch(
          `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=${message}`
        )
      })
    )

    res.json({ success: true, notified: results.filter(r => r.status === 'fulfilled').length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### server/routes/api.js

```js
import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// CRUD de contatos de emergência
router.get('/contacts/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', req.params.userId)
  if (error) return res.status(400).json({ error })
  res.json(data)
})

router.post('/contacts', async (req, res) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert(req.body)
    .select()
  if (error) return res.status(400).json({ error })
  res.json(data)
})

router.put('/contacts/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
  if (error) return res.status(400).json({ error })
  res.json(data)
})

router.delete('/contacts/:id', async (req, res) => {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', req.params.id)
  if (error) return res.status(400).json({ error })
  res.json({ success: true })
})

export default router
```

### Banco de Dados — Esquema SQL (Tabelas Principais)

```sql
-- Profiles (Dados do usuário)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  photo_url TEXT,
  blood_type TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  medications TEXT,
  address_zipcode TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT DEFAULT 'Brasil',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Emergency Contacts
CREATE TABLE public.emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medical Records
CREATE TABLE public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  record_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Documents
CREATE TABLE public.user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Instruções para Impressão

1. Copie TODO o código-fonte para um pendrive/CD-R
2. Imprima as primeiras 10-15 páginas do código (arquivos principais como acima)
3. Imprima as últimas 10-15 páginas (servidor, banco, testes)
4. Numere as páginas manualmente
5. Protocole no INPI junto com:
   - Formulário de RPC preenchido
   - Guia de pagamento (GRU) quitada
   - Documento descritivo assinado
