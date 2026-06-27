import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const TwoFactorAuthDialog = ({ isOpen, onClose, onSuccess, reason }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const reasonText = reason === 'login' ? 'para completar o login' : 'para salvar as alterações';

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setMethod(null);
      setCode('');
      setLoading(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  const handleSendCode = (selectedMethod) => {
    setLoading(true);
    setMethod(selectedMethod);
    toast({
      title: "Código de verificação enviado!",
      description: `Um código foi enviado para seu ${selectedMethod === 'email' ? 'e-mail' : 'celular'}.`,
    });
    setTimeout(() => {
      setStep(2);
      setResendTimer(30);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyCode = () => {
    setLoading(true);
    if (code === '123456') {
      toast({
        title: "Verificação bem-sucedida!",
        description: "Sua identidade foi confirmada.",
      });
      setTimeout(() => {
        onSuccess();
        setLoading(false);
      }, 500);
    } else {
      toast({
        title: "Código inválido",
        description: "O código inserido está incorreto. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 gradient-bg rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificação de Segurança</h2>
            <p className="text-gray-600">
              Precisamos confirmar sua identidade {reasonText}.
            </p>
          </div>

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <p className="text-center font-medium">Escolha um método de verificação:</p>
              <Button
                onClick={() => handleSendCode('email')}
                variant="outline"
                className="w-full py-6 text-lg"
                disabled={loading}
              >
                <Mail className="w-6 h-6 mr-3" />
                Enviar código por E-mail
              </Button>
              <Button
                onClick={() => handleSendCode('sms')}
                variant="outline"
                className="w-full py-6 text-lg"
                disabled={loading}
              >
                <Smartphone className="w-6 h-6 mr-3" />
                Enviar código por SMS
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <p className="text-center text-gray-600 mb-4">
                Digite o código de 6 dígitos enviado para seu {method === 'email' ? 'e-mail' : 'celular'}.
              </p>
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-48 text-center text-3xl tracking-[0.5em] font-bold bg-gray-100 border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full mt-6 gradient-bg text-white py-3 text-lg"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
              <div className="mt-4 text-center text-sm">
                {resendTimer > 0 ? (
                  <p className="text-gray-500">
                    Você pode reenviar o código em {resendTimer}s.
                  </p>
                ) : (
                  <button
                    onClick={() => handleSendCode(method)}
                    className="text-blue-600 hover:underline"
                  >
                    Reenviar código
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TwoFactorAuthDialog;