import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Users,
  FileText,
  Heart,
  Shield,
  ExternalLink,
  Crown,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const Overview = () => {
  const { user } = useAuth();

  const generateQRCode = () => {
    toast({ title: "QR Code gerado!", description: "Seu QR Code de emergência foi criado com sucesso." });
  };

  const shareEmergencyLink = () => {
    const link = `${window.location.origin}/emergency/${user.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!", description: "O link da sua página de emergência foi copiado." });
  };

  const stats = [
    {
      label: 'Contatos de Emergência',
      value: '2',
      max: user?.plan === 'free' ? '2' : user?.plan === 'basic' ? '5' : '∞',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Documentos',
      value: '0',
      max: user?.plan === 'free' ? '0' : '3',
      icon: FileText,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Informações Médicas',
      value: user?.plan === 'free' ? '0' : '1',
      max: '1',
      icon: Heart,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo ao seu painel de emergência
            </h2>
            <p className="text-gray-600 text-lg">
              Suas informações estão seguras e prontas para situações críticas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={generateQRCode} className="gradient-bg text-white hover:opacity-90">
              <QrCode className="w-5 h-5 mr-2" /> Gerar QR Code
            </Button>
            <Button onClick={shareEmergencyLink} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <ExternalLink className="w-5 h-5 mr-2" /> Compartilhar Link
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {user?.plan === 'free' && stat.label !== 'Contatos de Emergência' && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-gray-500">/ {stat.max}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/dashboard/emergency-contacts"
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <span className="font-medium text-gray-900">Adicionar Contato</span>
          </Link>
          <Link to="/dashboard/my-data"
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
            <Shield className="w-8 h-8 text-green-600 mb-2" />
            <span className="font-medium text-gray-900">Atualizar Dados</span>
          </Link>
          <Link to="/dashboard/documents"
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <span className="font-medium text-gray-900">Upload Documentos</span>
          </Link>
          <Link to="/dashboard/subscription"
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
            <Crown className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="font-medium text-gray-900">Upgrade Plano</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Preview da Página de Emergência</h3>
          <Link to={`/emergency/${user.id}`} target="_blank"
            className="text-red-600 hover:text-red-700 font-medium flex items-center">
            Ver página completa <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{user?.user_metadata?.full_name || 'Usuário'}</h4>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">PÁGINA DE EMERGÊNCIA</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button className="bg-red-600 hover:bg-red-700 text-white"><Users className="w-4 h-4 mr-2" /> Contatos</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white"><Heart className="w-4 h-4 mr-2" /> Médico</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white"><FileText className="w-4 h-4 mr-2" /> Documentos</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;