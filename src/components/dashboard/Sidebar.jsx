import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  User,
  Users,
  FileText,
  Heart,
  CreditCard,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const menuItems = [
  { icon: Home, label: 'Visão Geral', tab: 'overview' },
  { icon: User, label: 'Meus Dados', tab: 'my-data' },
  { icon: Users, label: 'Contatos de Emergência', tab: 'contacts' },
  { icon: Heart, label: 'Informações Médicas', tab: 'medical' },
  { icon: FileText, label: 'Documentos', tab: 'documents' },
  { icon: CreditCard, label: 'Assinatura', tab: 'subscription' },
];

const Sidebar = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AhLembrei</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.tab;

                return (
                  <li key={item.tab}>
                    <button
                      onClick={() => { onTabChange(item.tab); onClose(); }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'active text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              {user?.role === 'admin' && (
                <li className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { navigate('/admin'); onClose(); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-1">Precisa de ajuda?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Entre em contato com nosso suporte
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Falar com suporte
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
