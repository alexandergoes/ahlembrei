import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { supabase } from '@/lib/supabaseClient'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast({ title: "Senha fraca", description: "Mínimo de 8 caracteres.", variant: "destructive" })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (!error) {
      toast({ title: "Senha alterada!", description: "Faça login com sua nova senha." })
      navigate('/login')
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Redefinir senha</h1>
          <p className="text-gray-600">Digite sua nova senha</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nova senha" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-3">
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
