import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, ArrowLeft, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  fetchAllUsers,
  adminToggleUserActive,
  adminUpdateUserRole,
  adminDeleteUser,
} from '@/lib/emergencyApi';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, danger }) => {
  const [typed, setTyped] = useState('');
  useEffect(() => { setTyped(''); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        {danger && (
          <input
            type="text"
            placeholder='Digite "CONFIRMAR" para prosseguir'
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={danger && typed !== 'CONFIRMAR'}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >Confirmar</button>
        </div>
      </motion.div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
    </motion.div>
  );
};

const AdminPage = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = useCallback(() => setToast(null), []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllUsers();
    if (!result.success) {
      setError(result.error?.message || 'Erro ao carregar usuários');
      setUsers([]);
    } else {
      setUsers(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (authUser) loadUsers();
  }, [authUser, authLoading, navigate]);

  const runAction = async (action, target) => {
    setActionLoading(true);
    setConfirm(null);
    try {
      if (action === 'toggle_active') {
        await adminToggleUserActive(target.id);
        showToast(`Usuário ${target.active ? 'desativado' : 'ativado'} com sucesso`);
      } else if (action === 'promote') {
        await adminUpdateUserRole(target.id, 'admin');
        showToast(`${target.full_name} promovido a admin`);
      } else if (action === 'demote') {
        await adminUpdateUserRole(target.id, 'user');
        showToast(`${target.full_name} rebaixado para usuário`);
      } else if (action === 'delete') {
        await adminDeleteUser(target.id);
        showToast(`${target.full_name} excluído (soft delete)`);
      }
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Erro ao executar ação', 'error');
    }
    setActionLoading(false);
  };

  const getConfirmConfig = (action, target) => {
    const name = target.full_name || target.email || target.id;
    switch (action) {
      case 'toggle_active':
        return {
          title: target.active ? 'Desativar usuário' : 'Ativar usuário',
          message: `Tem certeza que deseja ${target.active ? 'desativar' : 'ativar'} ${name}?`,
          danger: target.active,
        };
      case 'promote':
        return { title: 'Promover para admin', message: `Tem certeza que deseja promover ${name} a administrador?`, danger: false };
      case 'demote':
        return { title: 'Rebaixar para usuário', message: `Tem certeza que deseja rebaixar ${name} para usuário comum?`, danger: true };
      case 'delete':
        return { title: 'Excluir usuário', message: `Esta ação irá desativar a conta de ${name} permanentemente.`, danger: true };
      default:
        return { title: 'Confirmação', message: 'Tem certeza?', danger: false };
    }
  };

  const filtered = search
    ? users.filter(u =>
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={loadUsers} className="mt-4">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}</AnimatePresence>

      <ConfirmModal
        isOpen={!!confirm}
        {...(confirm ? getConfirmConfig(confirm.action, confirm.target) : {})}
        onConfirm={() => runAction(confirm.action, confirm.target)}
        onCancel={() => { setConfirm(null); }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="text-gray-600">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
          <p className="text-gray-500 text-sm">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado em</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{u.full_name || '---'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.email || '---'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.plan_type === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                        u.plan_type === 'basic' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {u.plan_type || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '---'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setConfirm({ action: 'toggle_active', target: u })}
                          disabled={actionLoading}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                            u.active !== false
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } disabled:opacity-50`}
                        >
                          {u.active !== false ? 'Desativar' : 'Ativar'}
                        </button>
                        {u.role === 'admin' ? (
                          <button
                            onClick={() => setConfirm({ action: 'demote', target: u })}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >Rebaixar</button>
                        ) : (
                          <button
                            onClick={() => setConfirm({ action: 'promote', target: u })}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                          >Promover</button>
                        )}
                        <button
                          onClick={() => setConfirm({ action: 'delete', target: u })}
                          disabled={actionLoading}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                      {search ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
