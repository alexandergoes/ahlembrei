import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Shield, Calendar, Heart, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { fetchMyProfile, updateMyProfile } from '@/lib/emergencyApi';

const MyData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birth_date: '',
    health_plan_company: '',
    health_plan_type: '',
    health_plan_card_number: '',
    health_plan_phone: '',
    emergency_message: '',
    settings_show_medical: true,
    settings_show_documents: true,
    photo_url: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) return;
        
        const profile = await fetchMyProfile(user.id);
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            ...profile,
            // Ensure boolean fields have defaults if null
            settings_show_medical: profile.settings_show_medical ?? true,
            settings_show_documents: profile.settings_show_documents ?? true,
          }));
        } else {
          // If no profile exists, pre-fill from auth user metadata if available
          setFormData(prev => ({
            ...prev,
            full_name: user.user_metadata?.full_name || '',
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar suas informações. Tente recarregar a página.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateMyProfile(user.id, formData);
      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    toast({
      title: "🚧 Upload de foto em breve",
      description: "A funcionalidade de upload de imagens será implementada em breve! 🚀",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Dados Pessoais</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                {formData.photo_url ? (
                  <img 
                    src={formData.photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone Pessoal
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Plano de Saúde */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Plano de Saúde
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa / Convênio
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.health_plan_company || ''}
                      onChange={(e) => setFormData({ ...formData, health_plan_company: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Unimed, Bradesco"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Plano
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.health_plan_type || ''}
                      onChange={(e) => setFormData({ ...formData, health_plan_type: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Básico, Premium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Carteirinha
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.health_plan_card_number || ''}
                      onChange={(e) => setFormData({ ...formData, health_plan_card_number: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Telefone do Convênio
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.health_plan_phone || ''}
                      onChange={(e) => setFormData({ ...formData, health_plan_phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Para emergências"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagem de Emergência */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                Mensagem de Emergência
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem Pública
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.emergency_message || ''}
                    onChange={(e) => setFormData({ ...formData, emergency_message: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Esta mensagem aparecerá no topo da sua página de emergência. Ex: 'Sou diabético', 'Avisar imediatamente minha esposa'."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Esta informação será visível para qualquer pessoa que acessar seu perfil de emergência.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full gradient-bg text-white py-4 text-lg font-medium hover:opacity-90 transition-opacity mt-6 shadow-md"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Salvando...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </span>
            )}
          </Button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-600" />
          Configurações de Privacidade
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Mostrar informações médicas</h4>
              <p className="text-sm text-gray-600 mt-1">Exibir dados médicos (alergias, tipo sanguíneo) na página de emergência pública.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                checked={formData.settings_show_medical}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, settings_show_medical: e.target.checked }));
                  // Auto-save toggle immediately
                  updateMyProfile(user.id, { settings_show_medical: e.target.checked }).catch(() => {
                    toast({
                      title: "Erro ao atualizar",
                      variant: "destructive"
                    });
                    // Revert visually on error would require more complex state management, simplified here
                  });
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Mostrar documentos</h4>
              <p className="text-sm text-gray-600 mt-1">Exibir links para documentos na página de emergência pública.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                checked={formData.settings_show_documents}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, settings_show_documents: e.target.checked }));
                  updateMyProfile(user.id, { settings_show_documents: e.target.checked }).catch(() => {
                    toast({ title: "Erro ao atualizar", variant: "destructive" });
                  });
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyData;