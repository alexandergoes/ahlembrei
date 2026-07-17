import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    const payment = searchParams.get('payment');
    const plan = searchParams.get('plan');
    if (payment === 'success' && plan) {
      supabase.rpc('update_my_plan', { new_plan: plan }).then(({ error }) => {
        if (error) {
          toast({ title: 'Erro ao ativar plano', description: error.message });
        } else {
          toast({ title: 'Plano ativado com sucesso!' });
          refreshUser();
          window.history.replaceState({}, '', '/dashboard');
        }
      });
    }
  }, []);

  const plans = {
    basic: {
      name: 'Básico',
      price: { monthly: 4.99, yearly: 44.90 },
      features: [
        { text: 'Até 5 contatos de emergência', included: true },
        { text: 'QR Code personalizado', included: true },
        { text: 'Upload de documentos (RG, CNH, Convênio)', included: true },
        { text: 'Dados médicos completos', included: true },
        { text: 'Endereço com busca ViaCEP', included: true },
        { text: 'Notificação WhatsApp para contatos', included: true },
      ],
    },
    premium: {
      name: 'Premium',
      price: { monthly: 9.9, yearly: 89.90 },
      features: [
        { text: 'Contatos de emergência ilimitados', included: true },
        { text: 'QR Code personalizado', included: true },
        { text: 'Upload de documentos ilimitado', included: true },
        { text: 'Dados médicos completos', included: true },
        { text: 'Suporte prioritário', included: true },
      ],
    },
  };

  const handleChoosePlan = async (planName) => {
    if (planName.toLowerCase() === user.plan) {
      toast({
        title: 'Este é o seu plano atual',
        description: 'Você já está inscrito neste plano.',
      });
      return;
    }

    const planKey = planName.toLowerCase() === 'básico' ? 'basic' : 'premium';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const edgeUrl = `${supabaseUrl}/functions/v1/smooth-api`;

    try {
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          plan: planKey,
          billing: billingCycle,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      window.location.href = data.init_point;
    } catch (err) {
      toast({
        title: 'Erro ao criar assinatura',
        description: err.message,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
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
                  {plan.name === 'Básico' ? 'O mais popular' : 'Para máxima segurança'}
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
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;