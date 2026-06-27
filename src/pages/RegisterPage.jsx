import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const PasswordRule = ({ text, met }) => (
  <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
    {met ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
    {text}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  // Using direct supabase auth since signUp helper wasn't in new context spec, 
  // or we can implement it in the component as the spec was strictly defined
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(() => {
    const password = formData.password;
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [formData.password]);

  const allRulesMet = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!allRulesMet) {
      toast({
        title: "Senha inválida",
        description: "Sua senha não atende a todos os critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro na confirmação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Direct supabase call since context strictly only included signInWithEmail
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
      },
    });

    if (!error) {
      toast({
        title: "Conta criada com sucesso!",
        description: "Enviamos um link de confirmação para o seu e-mail.",
      });
      navigate('/login');
    } else {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
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
              Crie sua conta
            </h1>
            <p className="text-gray-600">
              Comece a proteger suas informações de emergência hoje mesmo
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
              <span className="px-2 bg-white text-gray-500">ou cadastre-se com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

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
                  placeholder="Crie uma senha forte"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <PasswordRule text="Mínimo de 8 caracteres" met={passwordRules.length} />
                <PasswordRule text="Uma letra maiúscula" met={passwordRules.uppercase} />
                <PasswordRule text="Uma letra minúscula" met={passwordRules.lowercase} />
                <PasswordRule text="Um número" met={passwordRules.number} />
                <PasswordRule text="Um caractere especial" met={passwordRules.special} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Concordo com os{' '}
                <button
                  type="button"
                  onClick={() => toast({
                    title: "🚧 Esta funcionalidade não está implementada ainda",
                    description: "Mas não se preocupe! Você pode solicitar na sua próxima mensagem! 🚀",
                  })}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Termos de Uso
                </button>
                {' '}e{' '}
                <button
                  type="button"
                  onClick={() => toast({
                    title: "🚧 Esta funcionalidade não está implementada ainda",
                    description: "Mas não se preocupe! Você pode solicitar na sua próxima mensagem! 🚀",
                  })}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Política de Privacidade
                </button>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading || !allRulesMet}
              className="w-full gradient-bg text-white py-3 hover:opacity-90"
            >
              {loading ? 'Criando conta...' : 'Criar conta gratuita'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;