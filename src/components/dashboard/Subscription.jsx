import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Subscription = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: 'Até 2 contatos', included: true },
        { text: 'QR Code simples', included: true },
        { text: 'Sem upload de documentos', included: false },
        { text: 'Sem dados médicos', included: false },
        { text: 'Suporte padrão', included: true },
      ],
    },
    basic: {
      name: 'Básico',
      price: { monthly: 9.9, yearly: 99 },
      features: [
        { text: 'Até 5 contatos', included: true },
        { text: 'QR Code personalizado', included: true },
        { text: 'Upload de documentos digitais', included: true },
        { text: 'Dados médicos', included: true },
        { text: 'Suporte padrão', included: true },
      ],
    },
    premium: {
      name: 'Premium',
      price: { monthly: 19.9, yearly: 199 },
      features: [
        { text: 'Contatos ilimitados', included: true },
        { text: 'QR Code personalizado', included: true },
        { text: 'Upload de documentos digitais', included: true },
        { text: 'Dados médicos', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Página multilíngue (PT-BR/EN)', included: true },
      ],
    },
  };

  const handleChoosePlan = (planName) => {
    if (planName.toLowerCase() === user.plan) {
      toast({
        title: "Este é o seu plano atual",
        description: "Você já está inscrito neste plano.",
      });
      return;
    }
    
    toast({
      title: "🚧 Integração de pagamento pendente",
      description: "Por favor, configure o Stripe para ativar as assinaturas. Você pode solicitar isso em sua próxima mensagem! 🚀",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Nossos Planos de Assinatura
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Escolha o plano que melhor se adapta às suas necessidades e 
          tenha total tranquilidade.
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white p-1 rounded-full shadow-sm border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'gradient-bg text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'gradient-bg text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
        {Object.values(plans).map((plan, index) => {
          const isCurrentPlan = plan.name.toLowerCase() === user.plan;
          
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`plan-card bg-white rounded-2xl p-8 shadow-sm border-2 ${
                isCurrentPlan ? 'border-blue-600' : 'border-gray-200'
              } ${plan.name === 'Básico' ? 'featured' : ''}`}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.name === 'Free' ? 'Para começar' : plan.name === 'Básico' ? 'O mais popular' : 'Para máxima segurança'}
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    R$ {plan.price[billingCycle].toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-500">
                    /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-gray-700 ${!feature.included && 'line-through'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleChoosePlan(plan.name)}
                disabled={isCurrentPlan}
                className={`w-full py-3 ${
                  isCurrentPlan
                    ? 'bg-gray-200 text-gray-500'
                    : plan.name === 'Básico'
                      ? 'gradient-bg text-white hover:opacity-90'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentPlan ? 'Plano Atual' : `Escolher ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Current Plan Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo da sua assinatura</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Seu plano atual é</p>
            <p className="text-2xl font-bold text-blue-600 capitalize">{user.plan}</p>
          </div>
          
          <Button
            onClick={() => toast({
              title: "🚧 Esta funcionalidade não está implementada ainda",
              description: "Mas não se preocupe! Você pode solicitar na sua próxima mensagem! 🚀",
            })}
            variant="outline"
          >
            Gerenciar Assinatura
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;