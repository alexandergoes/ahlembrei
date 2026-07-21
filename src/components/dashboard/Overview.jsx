import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Users, FileText, Heart, Shield, ExternalLink,
  Plus, Download, Copy, Check, Crown, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

const Overview = ({ onTabChange }) => {
  const { user } = useAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState(null);

  const emergencyUrl = `${window.location.origin}/emergency/${user.id}`;

  useEffect(() => {
    if (!user?.id) return;
    import('@/lib/emergencyApi').then(async ({ fetchMyProfile, fetchEmergencyContacts, fetchDocuments, fetchMedicalRecords }) => {
      const data = await fetchMyProfile(user.id);
      const [contacts, docs, medical] = await Promise.all([
        fetchEmergencyContacts(user.id),
        fetchDocuments(user.id),
        fetchMedicalRecords(user.id),
      ]);
      setProfile({ ...data, contactCount: contacts.length, documentCount: docs.length, hasPrimary: contacts.some(c => c.is_primary), hasMedical: !!medical });
    }).catch(err => console.error('Overview load error:', err));
  }, [user?.id]);

  const missing = [];
  if (profile) {
    if (!profile.full_name) missing.push({ field: 'my-data', label: 'Nome completo' });
    if (!profile.phone) missing.push({ field: 'my-data', label: 'Telefone pessoal' });
    if (!profile.handle) missing.push({ field: 'my-data', label: 'Apelido' });
    if (profile.contactCount === 0) missing.push({ field: 'contacts', label: 'Contato de emergência' });
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    toast({ title: "Link copiado!", description: "O link da sua página de emergência foi copiado." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('emergency-qrcode');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'ahlembrei-qrcode.png';
      link.href = png;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const stats = [
    {
      label: 'Contatos de Emergência',
      value: profile?.contactCount ?? '0',
      max: user?.plan === 'free' ? '2' : user?.plan === 'basic' ? '5' : '∞',
      icon: Users, bgColor: 'bg-blue-100', textColor: 'text-blue-600', isPremium: false,
    },
    {
      label: 'Documentos',
      value: profile?.documentCount ?? '0',
      max: user?.plan === 'free' ? '0' : '3',
      icon: FileText, bgColor: 'bg-green-100', textColor: 'text-green-600', isPremium: user?.plan === 'free',
    },
    {
      label: 'Informações Médicas',
      value: profile?.hasMedical ? '1' : '0',
      max: '1',
      icon: Heart, bgColor: 'bg-red-100', textColor: 'text-red-600', isPremium: user?.plan === 'free',
    },
  ];

  return (
    <div className="space-y-8">
      {missing.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-800 font-medium text-sm">Seu perfil está incompleto</p>
              <ul className="mt-1 space-y-1">
                {missing.map((item) => (
                  <li key={item.field}>
                    <button onClick={() => onTabChange(item.field)}
                      className="text-amber-700 hover:text-amber-900 text-sm underline">
                      Cadastrar {item.label.toLowerCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">Bem-vindo ao seu painel de emergência</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                user?.plan === 'premium'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : user?.plan === 'basic'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}>
                {user?.plan === 'free' ? 'Grátis' : user?.plan === 'basic' ? 'Básico' : 'Premium'}
              </span>
            </div>
            <p className="text-gray-600 text-lg">Suas informações estão seguras e prontas para situações críticas.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setShowQRCode(true)} className="gradient-bg text-white hover:opacity-90">
              <QrCode className="w-5 h-5 mr-2" /> Gerar QR Code
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? '✓ Copiado!' : 'Compartilhar Link'}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.isPremium && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">Premium</span>
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => onTabChange('contacts')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <span className="font-medium text-gray-900">Adicionar Contato</span>
          </button>
          <button onClick={() => onTabChange('my-data')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
            <Shield className="w-8 h-8 text-green-600 mb-2" />
            <span className="font-medium text-gray-900">Atualizar Dados</span>
          </button>
          <button onClick={() => onTabChange('documents')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <span className="font-medium text-gray-900">Upload Documentos</span>
          </button>
          <button onClick={() => onTabChange('subscription')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
            <Crown className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="font-medium text-gray-900">Upgrade Plano</span>
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Preview da Página de Emergência</h3>
          <a href={`/emergency/${user.id}`} target="_blank" rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium flex items-center">
            Ver página completa <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Usuário'}</h4>
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

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code de Emergência</DialogTitle>
            <DialogDescription>Escaneie para acessar sua página de emergência</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-xl border">
              <QRCodeSVG id="emergency-qrcode" value={emergencyUrl} size={220} level="M" />
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={handleDownloadQR} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copiado' : 'Copiar Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overview;
