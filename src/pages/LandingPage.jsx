import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Phone, QrCode, Users, FileText, Search, ArrowRight, ChevronDown, AlertTriangle, CheckCircle, XCircle, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchByHandle, getRandomQuestions, verifySecurityAnswer, logSecurityFailure, fetchEmergencyContacts } from '@/lib/emergencyApi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [emergencyCode, setEmergencyCode] = useState('');
  const [searchHandle, setSearchHandle] = useState('');
  const [step, setStep] = useState('idle');
  const [foundUser, setFoundUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleEmergencyAccess = (e) => {
    e.preventDefault();
    const code = emergencyCode.trim();
    if (code) navigate(`/emergency/${code}`);
  };

  const showMsg = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 5000);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchHandle.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const user = await searchByHandle(searchHandle);
      if (!user) {
        showMsg('Nenhuma pessoa encontrada com este apelido.');
        setLoading(false);
        return;
      }
      setFoundUser(user);
      setStep('confirm');
    } catch (err) {
      showMsg('Erro ao buscar. Tente novamente.');
    }
    setLoading(false);
  };

  const handleUnconscious = () => {
    notifyContacts(`${foundUser.full_name?.split(' ')[0]} está recebendo socorro e não pode responder. Acesse os dados de emergência imediatamente.`);
    navigate(`/emergency/${foundUser.id}?mode=unconscious`);
  };

  const handleConscious = async () => {
    setLoading(true);
    try {
      const qs = await getRandomQuestions(foundUser.id, 2);
      if (qs.length < 2) {
        showMsg('Esta pessoa não configurou as perguntas de segurança. Acessando dados de emergência...');
        navigate(`/emergency/${foundUser.id}`);
        return;
      }
      setQuestions(qs);
      setAnswers({});
      setAttempts(0);
      setStep('challenge');
    } catch (err) {
      showMsg('Erro ao carregar desafio.');
    }
    setLoading(false);
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let correct = 0;
      for (const q of questions) {
        const ok = await verifySecurityAnswer(q.id, answers[q.id] || '');
        if (ok) correct++;
      }

      if (correct === questions.length) {
        navigate(`/emergency/${foundUser.id}?mode=conscious`);
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        await logSecurityFailure(foundUser.id, newAttempts);
        notifyContacts(`Alerta de segurança: 3 tentativas de acesso falharam para ${foundUser.full_name?.split(' ')[0]}. Por segurança, os dados foram bloqueados.`);
        showMsg('Por segurança, os dados foram bloqueados. O contato de emergência acaba de ser avisado.', 'blocked');
        setStep('blocked');
      } else {
        showMsg(`Resposta incorreta. Tentativa ${newAttempts} de 3.`);
      }
    } catch (err) {
      showMsg('Erro ao verificar respostas.');
    }
    setLoading(false);
  };

  const notifyContacts = useCallback(async (msg) => {
    try {
      const contacts = await fetchEmergencyContacts(foundUser.id);
      const primary = contacts.find(c => c.whatsapp);
      if (primary) {
        const encoded = encodeURIComponent(
          `${msg}\n\nAhLembrei - Sistema de Emergência`
        );
        window.open(`https://wa.me/${primary.whatsapp.replace(/\D/g, '')}?text=${encoded}`, '_blank');
      }
    } catch {}
  }, [foundUser]);

  const reset = () => {
    setStep('idle');
    setFoundUser(null);
    setQuestions([]);
    setAnswers({});
    setAttempts(0);
    setSearchHandle('');
    setMessage('');
  };

  const features = [
    { icon: <Phone className="w-8 h-8" />, title: 'QR Code + Celular', description: 'Aponte a câmera do celular para o QR Code e acesse imediatamente contatos e dados médicos da pessoa.' },
    { icon: <QrCode className="w-8 h-8" />, title: 'Busca por Apelido', description: 'Digite o @apelido da pessoa e, se necessário, responda o desafio de segurança para liberar os dados.' },
  ];

  const secondaryFeatures = [
    { icon: <Shield className="w-8 h-8" />, title: 'Segurança Total', description: 'Seus dados protegidos com criptografia de ponta' },
    { icon: <Heart className="w-8 h-8" />, title: 'Informações Médicas', description: 'Dados médicos importantes sempre acessíveis' },
    { icon: <Users className="w-8 h-8" />, title: 'Múltiplos Contatos', description: 'Gerencie vários contatos de emergência' },
    { icon: <FileText className="w-8 h-8" />, title: 'Documentos Seguros', description: 'Upload seguro de documentos importantes' },
  ];

  const steps = [
    { num: '01', title: 'Crie sua conta', desc: 'Cadastre seus contatos e informações médicas em menos de 5 minutos.' },
    { num: '02', title: 'Configure sua segurança', desc: 'Crie seu @apelido único e cadastre 4 perguntas pessoais.' },
    { num: '03', title: 'Compartilhe seu QR Code', desc: 'Cole no celular, na carteira e compartilhe seu @apelido com contatos de confiança.' },
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
              Alguém precisa de ajuda? Use o QR Code da pessoa ou busque pelo @apelido dela.
            </p>

            <form onSubmit={handleEmergencyAccess} className="max-w-lg mx-auto mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                  <input type="text" placeholder="Código de emergência (QR Code ou URL)..." value={emergencyCode}
                    onChange={(e) => setEmergencyCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-red-400 bg-white/95 backdrop-blur focus:ring-4 focus:ring-red-300 focus:border-red-500 text-lg" />
                </div>
                <Button type="submit" disabled={!emergencyCode.trim()}
                  className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 text-lg font-bold rounded-xl shadow-lg">
                  Acessar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-400" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 px-4 text-sm text-red-200">ou busque por apelido</span>
              </div>
            </div>

            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 font-bold text-lg">@</span>
                  <input type="text" placeholder="apelido" value={searchHandle}
                    onChange={(e) => setSearchHandle(e.target.value.replace(/^@/, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-red-400 bg-white/95 backdrop-blur focus:ring-4 focus:ring-red-300 focus:border-red-500 text-lg" />
                </div>
                <Button type="submit" disabled={!searchHandle.trim() || loading}
                  className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 text-lg font-bold rounded-xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 text-center text-sm font-medium ${
              messageType === 'blocked' ? 'bg-red-100 text-red-800 border-b border-red-200' :
              messageType === 'error' ? 'bg-orange-50 text-orange-800 border-b border-orange-200' :
              'bg-green-50 text-green-800 border-b border-green-200'
            }`}>
            {message}
          </motion.div>
        )}

        {step === 'confirm' && foundUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) reset(); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-red-200">
                {foundUser.photo_url ? (
                  <img src={foundUser.photo_url} alt={foundUser.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-100 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-red-400" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{foundUser.full_name?.split(' ')[0]}</h3>
              <p className="text-gray-500 text-sm mb-6">Você está ajudando esta pessoa?</p>
              <div className="space-y-3">
                <Button onClick={handleConscious} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sim, está consciente'}
                </Button>
                <Button onClick={handleUnconscious} disabled={loading}
                  variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50 py-3">
                  Sim, está inconsciente / Não pode responder
                </Button>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 mt-2">
                  Não, busquei errado
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'challenge' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) reset(); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">Desafio de Segurança</h3>
                <p className="text-sm text-gray-500 mt-1">
                  A pessoa precisa responder estas 2 perguntas para liberar os dados.
                  {attempts > 0 && <span className="text-orange-600 block mt-1">Tentativa {attempts} de 3</span>}
                </p>
              </div>
              <form onSubmit={handleAnswer} className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{q.question_text}</label>
                    <input
                      name={q.id}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      required
                      placeholder="Digite a resposta..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus={i === 0}
                    />
                  </div>
                ))}
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Respostas'}
                </Button>
              </form>
              <button onClick={reset} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-3">
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'blocked' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Acesso Bloqueado</h3>
              <p className="text-sm text-gray-600 mb-6">
                O contato de emergência já foi notificado sobre esta tentativa de acesso.
                Os dados foram bloqueados por segurança.
              </p>
              <Button onClick={reset} className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3">
                Voltar ao início
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Prestando Socorro</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Duas formas rápidas de acessar informações de emergência de quem precisa de ajuda.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 hover:shadow-xl transition-shadow overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">PRESTAR SOCORRO</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Para quem quer se proteger</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Crie sua conta e mantenha seus dados sempre disponíveis para emergências.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {secondaryFeatures.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
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