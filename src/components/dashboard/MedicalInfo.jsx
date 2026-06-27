import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Save, Crown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { fetchMedicalRecords, upsertMedicalRecords } from '@/lib/emergencyApi';

const MedicalInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [medicalData, setMedicalData] = useState({
    blood_type: '',
    allergies: [],
    conditions: [],
    medications: []
  });
  const [newItem, setNewItem] = useState({ allergy: '', condition: '', medication: '' });

  const canEdit = user?.plan !== 'free';

  useEffect(() => {
    if (user?.id) {
      loadMedicalRecords();
    }
  }, [user]);

  const loadMedicalRecords = async () => {
    try {
      const data = await fetchMedicalRecords(user.id);
      if (data) {
        setMedicalData({
          blood_type: data.blood_type || '',
          allergies: data.allergies || [],
          conditions: data.conditions || [],
          medications: data.medications || []
        });
      }
    } catch (err) {
      console.error('Error loading medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSave = async () => {
    if (!canEdit) {
      toast({ title: "Upgrade necessário", description: "Faça upgrade para o plano Básico ou Premium para salvar informações médicas.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await upsertMedicalRecords(user.id, medicalData);
      toast({ title: "Informações salvas!", description: "Suas informações médicas foram atualizadas." });
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type) => {
    if (!canEdit) {
      toast({ title: "Upgrade necessário", variant: "destructive" });
      return;
    }
    const key = type === 'allergy' ? 'allergies' : type === 'condition' ? 'conditions' : 'medications';
    const value = newItem[type].trim();
    if (value) {
      setMedicalData({ ...medicalData, [key]: [...medicalData[key], value] });
      setNewItem({ ...newItem, [type]: '' });
    }
  };

  const removeItem = (type, index) => {
    const key = type === 'allergy' ? 'allergies' : type === 'condition' ? 'conditions' : 'medications';
    setMedicalData({ ...medicalData, [key]: medicalData[key].filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informações Médicas</h2>
        <p className="text-gray-600">
          {canEdit ? 'Mantenha suas informações médicas atualizadas para emergências.' : 'Upgrade para o plano Básico ou Premium para adicionar informações médicas.'}
        </p>
      </motion.div>

      {!canEdit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200"
        >
          <div className="flex items-center space-x-4">
            <Crown className="w-12 h-12 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Funcionalidade Premium</h3>
              <p className="text-gray-700 mb-4">As informações médicas estão disponíveis nos planos Básico e Premium. Upgrade agora.</p>
              <Button className="gradient-bg text-white hover:opacity-90">
                <Crown className="w-5 h-5 mr-2" /> Fazer Upgrade
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${!canEdit ? 'opacity-50' : ''}`}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-600" /> Tipo Sanguíneo
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {bloodTypes.map((type) => (
            <button key={type} disabled={!canEdit}
              onClick={() => setMedicalData({ ...medicalData, blood_type: type })}
              className={`p-3 rounded-lg border-2 transition-colors ${
                medicalData.blood_type === type
                  ? 'border-red-600 bg-red-50 text-red-600'
                  : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
              } ${!canEdit ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="font-bold text-lg">{type}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {(['allergy', 'condition', 'medication']).map((type, idx) => {
        const configs = {
          allergy: { key: 'allergies', title: 'Alergias', placeholder: 'Ex: Penicilina, Amendoim...', chipBg: 'bg-red-100', chipText: 'text-red-800', chipBtn: 'text-red-600 hover:text-red-800' },
          condition: { key: 'conditions', title: 'Condições Médicas', placeholder: 'Ex: Diabetes, Hipertensão...', chipBg: 'bg-blue-100', chipText: 'text-blue-800', chipBtn: 'text-blue-600 hover:text-blue-800' },
          medication: { key: 'medications', title: 'Medicamentos', placeholder: 'Ex: Metformina 500mg...', chipBg: 'bg-green-100', chipText: 'text-green-800', chipBtn: 'text-green-600 hover:text-green-800' }
        };
        const cfg = configs[type];
        return (
          <motion.div key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${!canEdit ? 'opacity-50' : ''}`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">{cfg.title}</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input type="text" disabled={!canEdit} value={newItem[type]}
                  onChange={(e) => setNewItem({ ...newItem, [type]: e.target.value })}
                  placeholder={cfg.placeholder}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  onKeyDown={(e) => e.key === 'Enter' && addItem(type)} />
                <Button onClick={() => addItem(type)} disabled={!canEdit} className="gradient-bg text-white hover:opacity-90">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {medicalData[cfg.key].map((item, i) => (
                  <div key={i} className={`flex items-center space-x-2 ${cfg.chipBg} ${cfg.chipText} px-3 py-1 rounded-full`}>
                    <span>{item}</span>
                    {canEdit && (
                      <button onClick={() => removeItem(type, i)} className={cfg.chipBtn}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}

      {canEdit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full gradient-bg text-white hover:opacity-90">
            {saving ? 'Salvando...' : <><Save className="w-5 h-5 mr-2" /> Salvar Informações Médicas</>}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default MedicalInfo;