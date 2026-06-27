import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Updated import to use the correct context
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  // Using signInWithEmail from the standardized context
  const { signInWithEmail, resetPassword, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(formData.email, formData.password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao AhLembrei.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast({
        title: "Erro no login social",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-effect rounded-2xl p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">AhLembrei</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-600">
              Entre na sua conta para acessar suas informações de emergência
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleSocialLogin('google')}
              variant="outline"
              className="w-full py-3 border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              <img className="w-5 h-5 mr-3" alt="Google logo" src="https://images.unsplash.com/photo-1678483789111-3a04c4628bd6" />
              Continuar com Google
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSocialLogin('apple')}
                variant="outline"
                className="py-3 border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <img className="w-5 h-5 mr-2" alt="Apple logo" src="https://images.unsplash.com/photo-1620829868801-8a443f0370f3" />
                Apple
              </Button>
              <Button
                onClick={() => handleSocialLogin('facebook')}
                variant="outline"
                className="py-3 border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <img className="w-5 h-5 mr-2" alt="Facebook logo" src="https://images.unsplash.com/photo-1684577088653-f14e310d841b" />
                Facebook
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resetPassword(formData.email);
                    toast({
                      title: "Email enviado!",
                      description: "Verifique sua caixa de entrada para redefinir sua senha.",
                    });
                  } catch (err) {
                    toast({
                      title: "Erro ao enviar email",
                      description: err.message,
                      variant: "destructive",
                    });
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 hover:opacity-90"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;