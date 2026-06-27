import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, MessageCircle, Instagram, Edit, Trash2, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { fetchEmergencyContacts, createContact, updateContact, deleteContact, setPrimaryContact } from '@/lib/emergencyApi';

const EmergencyContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    whatsapp: '',
    instagram: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const data = await fetchEmergencyContacts(user.id);
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
      toast({ title: "Erro ao carregar contatos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const maxContacts = user?.plan === 'free' ? 2 : user?.plan === 'basic' ? 5 : Infinity;
  const canAddMore = contacts.length < maxContacts;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...formData } : c));
        toast({ title: "Contato atualizado!" });
      } else {
        const newContact = await createContact({
          user_id: user.id,
          ...formData,
          is_primary: contacts.length === 0
        });
        setContacts([...contacts, newContact]);
        toast({ title: "Contato adicionado!" });
      }
      resetForm();
    } catch (err) {
      console.error('Error saving contact:', err);
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', relationship: '', phone: '', whatsapp: '', instagram: '' });
    setShowForm(false);
    setEditingContact(null);
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      whatsapp: contact.whatsapp || '',
      instagram: contact.instagram || ''
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (contactId) => {
    try {
      await deleteContact(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      toast({ title: "Contato removido" });
    } catch (err) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const handleSetPrimary = async (contactId) => {
    try {
      await setPrimaryContact(user.id, contactId);
      setContacts(contacts.map(c => ({ ...c, is_primary: c.id === contactId })));
      toast({ title: "Contato principal alterado" });
    } catch (err) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contatos de Emergência</h2>
            <p className="text-gray-600">
              {contacts.length} de {maxContacts === Infinity ? '∞' : maxContacts} contatos utilizados
            </p>
          </div>

          {canAddMore ? (
            <Button onClick={() => setShowForm(true)} className="gradient-bg text-white hover:opacity-90 mt-4 sm:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Contato
            </Button>
          ) : (
            <Button
              onClick={() => toast({ title: "Limite atingido", description: "Faça upgrade do seu plano para adicionar mais contatos." })}
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 mt-4 sm:mt-0"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade para mais
            </Button>
          )}
        </div>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingContact ? 'Editar Contato' : 'Novo Contato de Emergência'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do contato" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grau de parentesco *</label>
                <select required value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecione...</option>
                  <option value="Cônjuge">Cônjuge</option>
                  <option value="Pai">Pai</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Filho(a)">Filho(a)</option>
                  <option value="Irmão(ã)">Irmão(ã)</option>
                  <option value="Médico">Médico</option>
                  <option value="Amigo(a)">Amigo(a)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 (11) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 (11) 99999-9999" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@usuario" />
              </div>
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={saving} className="gradient-bg text-white hover:opacity-90">
                {saving ? 'Salvando...' : `${editingContact ? 'Atualizar' : 'Adicionar'} Contato`}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{contact.name}</h3>
                  {contact.is_primary && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">Principal</span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{contact.relationship}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 lg:mb-0">
                  <Button onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" /> {contact.phone}
                  </Button>
                  {contact.whatsapp && (
                    <Button onClick={() => window.open(`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                  )}
                  {contact.instagram && (
                    <Button onClick={() => window.open(`https://instagram.com/${contact.instagram.replace('@', '')}`, '_blank')}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center">
                      <Instagram className="w-4 h-4 mr-2" /> Instagram
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                {!contact.is_primary && (
                  <Button onClick={() => handleSetPrimary(contact.id)} variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <Star className="w-4 h-4 mr-1" /> Principal
                  </Button>
                )}
                <Button onClick={() => handleEdit(contact)} variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDelete(contact.id)} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center"
        >
          <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum contato cadastrado</h3>
          <p className="text-gray-600 mb-6">Adicione seus contatos de emergência para que possam ser acessados rapidamente.</p>
          <Button onClick={() => setShowForm(true)} className="gradient-bg text-white hover:opacity-90">
            <Plus className="w-5 h-5 mr-2" /> Adicionar Primeiro Contato
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default EmergencyContacts;