import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Phone, QrCode, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Acesso Rápido",
      description: "Contatos de emergência disponíveis instantaneamente"
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Único",
      description: "Acesso via QR Code para situações críticas"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Informações Médicas",
      description: "Dados médicos importantes sempre acessíveis"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Múltiplos Contatos",
      description: "Gerencie vários contatos de emergência"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Documentos Seguros",
      description: "Upload seguro de documentos importantes"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">AhLembrei</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex space-x-4"
            >
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="gradient-bg text-white hover:opacity-90"
              >
                Cadastrar
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Suas informações de
              <span className="font-bold text-[#0052cc]"> emergência</span>
              <br />sempre acessíveis
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Registre e disponibilize suas informações pessoais e contatos de emergência 
              para acesso rápido em situações críticas. Seguro, rápido e confiável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="gradient-bg text-white hover:opacity-90 px-8 py-4 text-lg"
              >
                Começar Agora - Grátis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                Ver Demonstração
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <img 
              className="w-full rounded-2xl shadow-2xl"
              alt="Dashboard do AhLembrei mostrando interface de emergência"
             src="https://images.unsplash.com/photo-1599082168981-7f854a4e4736" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em emergências
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidades pensadas para garantir que suas informações importantes 
              estejam sempre disponíveis quando mais precisar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para ter suas informações sempre seguras?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Cadastre-se gratuitamente e tenha acesso imediato a todas as funcionalidades básicas.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Criar Conta Gratuita
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
            © 2024 AhLembrei. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;