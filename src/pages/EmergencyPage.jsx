import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Shield, Eye, EyeOff, Heart, FileText,
  AlertCircle, MapPin, Send, ChevronDown, ChevronUp, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchEmergencyProfile, fetchEmergencyContacts, fetchMedicalRecords, fetchDocuments, getDocumentPublicUrl, logEmergencyAccess } from '@/lib/emergencyApi';

const EmergencyPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [medical, setMedical] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [helperName, setHelperName] = useState('');
  const [helperPhone, setHelperPhone] = useState('');
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [helperLocation, setHelperLocation] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, contactsData, medicalData, documentsData] = await Promise.all([
          fetchEmergencyProfile(userId),
          fetchEmergencyContacts(userId),
          fetchMedicalRecords(userId),
          fetchDocuments(userId),
        ]);
        setProfile(profileData);
        setContacts(contactsData);
        setMedical(medicalData);
        setDocuments(documentsData);
        logEmergencyAccess(userId);
      } catch (err) {
        console.error('Error loading emergency data:', err);
        setError('Não foi possível carregar as informações de emergência.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setHelperLocation(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => {}
      );
    }
  }, []);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone, message) => {
    const url = `https://wa.me/${phone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.location.href = url;
  };

  const handleHelperWhatsApp = (contact) => {
    const name = helperName || 'Alguém';
    const phone = helperPhone || '(sem contato)';
    const location = helperLocation
      ? `\n\nLocalização: https://www.google.com/maps?q=${helperLocation}`
      : '';
    const message = `Olá! ${name} está prestando socorro a ${profile?.full_name || 'um usuário'} do AhLembrei.${location}\n\nTelefone do socorrista: ${phone}\n\nEntre em contato o mais rápido possível.`;
    handleWhatsApp(contact.whatsapp, message);
  };

  const handleNotifyFamily = async () => {
    const primaryContact = contacts.find(c => c.is_primary) || contacts[0];
    if (!primaryContact?.whatsapp) return;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `Olá, estou ajudando ${profile.full_name} em uma emergência. Localização: ${mapsLink}`;
      window.open(`https://wa.me/${primaryContact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } catch {
      const message = `Olá, estou ajudando ${profile.full_name} em uma emergência.`;
      window.open(`https://wa.me/${primaryContact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações de emergência...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h1>
          <p className="text-gray-600">{error || 'Este perfil de emergência não existe ou foi removido.'}</p>
        </div>
      </div>
    );
  }

  const showMedical = profile.settings_show_medical && medical;
  const showDocs = profile.settings_show_documents && documents.length > 0;

  return (
    <div className="min-h-screen bg-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Shield className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.full_name || 'Usuário'}
          </h1>
          <div className="bg-red-600 text-white px-4 py-2 rounded-full inline-block">
            <span className="font-semibold">PÁGINA DE EMERGÊNCIA</span>
          </div>
          {profile.emergency_message && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800">{profile.emergency_message}</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-red-300"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-red-600" />
            Ajudando {profile.full_name || 'o usuário'}?
          </h2>
          <p className="text-gray-600 mb-4">
            Se você está prestes a ajudar esta pessoa, clique no botão abaixo para notificar a família imediatamente.
          </p>
          <Button
            onClick={handleNotifyFamily}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
          >
            <Bell className="w-6 h-6 mr-2" />
            NOTIFICAR FAMÍLIA AGORA
          </Button>
        </motion.div>

        {(profile.address_street || profile.address_city) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              Localização de Referência
            </h2>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-blue-900 font-medium">📍 Endereço do perfil:</p>
              <p className="text-blue-800 mt-1">
                {profile.address_street && `${profile.address_street}${profile.address_number ? `, ${profile.address_number}` : ''}`}
                {profile.address_complement && ` — ${profile.address_complement}`}
                <br />
                {profile.address_neighborhood && `${profile.address_neighborhood}, `}{profile.address_city && `${profile.address_city}`}{profile.address_state && ` — ${profile.address_state}`}
                {profile.address_zipcode && <><br />CEP: {profile.address_zipcode}</>}
              </p>
            </div>
          </motion.div>
        )}

        {!profile.address_street && !profile.address_city && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              Localização de Referência
            </h2>
            <p className="text-gray-500 text-sm">Localização não informada pelo usuário.</p>
          </motion.div>
        )}

        {profile.health_plan_company && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3">Convênio Médico</h2>
            <p className="text-gray-700"><strong>{profile.health_plan_company}</strong></p>
            {profile.health_plan_type && <p className="text-gray-600 text-sm">{profile.health_plan_type}</p>}
            {profile.health_plan_card_number && <p className="text-gray-600 text-sm">Carteirinha: {profile.health_plan_card_number}</p>}
            {profile.health_plan_phone && (
              <Button onClick={() => handleCall(profile.health_plan_phone)} variant="outline" size="sm" className="mt-2">
                <Phone className="w-4 h-4 mr-2" /> {profile.health_plan_phone}
              </Button>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
        >
          <button
            onClick={() => setShowHelperForm(!showHelperForm)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Send className="w-5 h-5 mr-2 text-green-600" />
              {profile.full_name ? `Avise que está ajudando ${profile.full_name.split(' ')[0]}` : 'Estou ajudando'}
            </h2>
            {showHelperForm ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>

          {showHelperForm && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">
                Preencha seus dados e avise o contato de emergência que você está prestando socorro.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Seu nome" value={helperName}
                  onChange={(e) => setHelperName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                <input type="tel" placeholder="Seu telefone" value={helperPhone}
                  onChange={(e) => setHelperPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              {contacts.filter(c => c.whatsapp).map((contact) => (
                <Button key={contact.id} onClick={() => handleHelperWhatsApp(contact)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-3">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar aviso para {contact.name} (WhatsApp)
                </Button>
              ))}
              {helperLocation && (
                <div className="flex items-center text-sm text-green-700">
                  <MapPin className="w-4 h-4 mr-1" /> Sua localização será compartilhada
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Phone className="w-6 h-6 mr-2 text-red-600" />
            Contatos de Emergência
          </h2>

          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum contato de emergência cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-gray-600">{contact.relationship}</p>
                    </div>
                    {contact.is_primary && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">Principal</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button onClick={() => handleCall(contact.phone)} className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center py-3">
                      <Phone className="w-5 h-5 mr-2" /> Ligar
                    </Button>
                    {contact.whatsapp && (
                      <Button onClick={() => {
                        const msg = `Estou acessando a página de emergência de ${profile?.full_name || 'um usuário'} do AhLembrei.${helperLocation ? `\n\nLocalização: https://www.google.com/maps?q=${helperLocation}` : ''}`;
                        handleWhatsApp(contact.whatsapp, msg);
                      }} className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-3">
                        <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {showMedical && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-600" />
                Informações Médicas
              </h2>
              <Button onClick={() => setShowMedicalInfo(!showMedicalInfo)} variant="outline" size="sm">
                {showMedicalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {showMedicalInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medical.blood_type && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tipo Sanguíneo</h3>
                    <p className="text-2xl font-bold text-red-600">{medical.blood_type}</p>
                  </div>
                )}
                {medical.allergies?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Alergias</h3>
                    <ul className="text-gray-700">
                      {medical.allergies.map((item, i) => (
                        <li key={i} className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {medical.conditions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Condições</h3>
                    <ul className="text-gray-700">
                      {medical.conditions.map((item, i) => (
                        <li key={i} className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {medical.medications?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Medicamentos</h3>
                    <ul className="text-gray-700">
                      {medical.medications.map((item, i) => (
                        <li key={i} className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Informações médicas ocultas por privacidade.<br />Clique no ícone acima para visualizar.</p>
              </div>
            )}
          </motion.div>
        )}

        {showDocs && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-red-600" />
                Documentos
              </h2>
              <Button onClick={() => setShowDocuments(!showDocuments)} variant="outline" size="sm">
                {showDocuments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {showDocuments ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                    <Button
                    key={doc.id}
                    onClick={() => {
                      const url = getDocumentPublicUrl(doc.storage_path);
                      if (url) window.location.href = url;
                    }}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileText className="w-6 h-6 mb-1" />
                    {doc.name || doc.document_type}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Documentos ocultos por privacidade.<br />Clique no ícone acima para visualizar.</p>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AhLembrei</span>
            </div>
            <p className="text-gray-600 text-sm">
              Esta página contém informações de emergência protegidas.<br />
              Acesse apenas em situações críticas.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyPage;