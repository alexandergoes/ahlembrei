import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Phone, QrCode, Users, FileText, Search, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [emergencyCode, setEmergencyCode] = useState('');

  const handleEmergencyAccess = (e) => {
    e.preventDefault();
    const code = emergencyCode.trim();
    if (code) navigate(`/emergency/${code}`);
  };

  const features = [
    { icon: <Shield className="w-8 h-8" />, title: 'Segurança Total', description: 'Seus dados protegidos com criptografia de ponta' },
    { icon: <Phone className="w-8 h-8" />, title: 'Acesso Rápido', description: 'Contatos de emergência disponíveis instantaneamente' },
    { icon: <QrCode className="w-8 h-8" />, title: 'QR Code Único', description: 'Acesso via QR Code para situações críticas' },
    { icon: <Heart className="w-8 h-8" />, title: 'Informações Médicas', description: 'Dados médicos importantes sempre acessíveis' },
    { icon: <Users className="w-8 h-8" />, title: 'Múltiplos Contatos', description: 'Gerencie vários contatos de emergência' },
    { icon: <FileText className="w-8 h-8" />, title: 'Documentos Seguros', description: 'Upload seguro de documentos importantes' },
  ];

  const steps = [
    { num: '01', title: 'Crie sua conta', desc: 'Cadastre seus contatos e informações médicas em minutos' },
    { num: '02', title: 'Compartilhe seu QR Code', desc: 'Cole no celular, na carteira ou onde preferir' },
    { num: '03', title: 'Fique tranquilo', desc: 'Em uma emergência, qualquer um pode acessar suas informações' },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">AhLembrei</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-blue-600">
                Entrar
              </Button>
              <Button onClick={() => navigate('/register')}
                className="gradient-bg text-white hover:opacity-90">
                Cadastrar
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center bg-red-500/30 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse mr-2" />
              <span className="text-red-100 text-sm font-medium">ACESSO DE EMERGÊNCIA</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              PRESTAR
              <br />
              <span className="text-red-200">SOCORRO</span>
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Alguém precisa de ajuda? Digite o código da pessoa ou escaneie o QR Code
              para acessar contatos de emergência e informações médicas.
            </p>
            <form onSubmit={handleEmergencyAccess} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                  <input type="text" placeholder="Código de emergência ou URL..." value={emergencyCode}
                    onChange={(e) => setEmergencyCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-red-400 bg-white/95 backdrop-blur focus:ring-4 focus:ring-red-300 focus:border-red-500 text-lg" />
                </div>
                <Button type="submit" disabled={!emergencyCode.trim()}
                  className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 text-lg font-bold rounded-xl shadow-lg">
                  Acessar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>
            <p className="text-red-200 text-sm mt-4">
              Ou escaneie o QR Code da pessoa com a câmera do celular
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-xl text-gray-600">Em 3 passos simples você protege suas informações</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa em emergências</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidades pensadas para garantir que suas informações importantes
              estejam sempre disponíveis quando mais precisar.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para proteger suas informações?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Cadastre-se gratuitamente e tenha seus dados de emergência sempre disponíveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/register')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Criar Conta Gratuita
              </Button>
              <Button onClick={() => navigate('/login')}
                variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Já tenho conta
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AhLembrei</span>
          </div>
          <p className="text-gray-400 mb-4">
            Suas informações de emergência sempre acessíveis e seguras.
          </p>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AhLembrei. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
