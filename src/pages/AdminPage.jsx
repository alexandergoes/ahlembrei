import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertCircle, ArrowLeft, Search, CheckCircle, XCircle,
  Eye, Phone, MessageCircle, Heart, FileText, Activity, Clock,
  Mail, User, Calendar, CreditCard, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  fetchAllUsers,
  adminToggleUserActive,
  adminUpdateUserRole,
  fetchEmergencyContacts,
  fetchMedicalRecords,
  fetchDocuments,
  adminGetUserAudit,
  adminListAuditLogs,
  adminListEmergencyLogs,
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

const UserDetailsModal = ({ user: targetUser, onClose }) => {
  const [tab, setTab] = useState('profile');
  const [contacts, setContacts] = useState([]);
  const [medical, setMedical] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, m, d, a] = await Promise.all([
          fetchEmergencyContacts(targetUser.id).catch(() => []),
          fetchMedicalRecords(targetUser.id).catch(() => null),
          fetchDocuments(targetUser.id).catch(() => []),
          adminGetUserAudit(targetUser.id).catch(() => []),
        ]);
        setContacts(c || []);
        setMedical(m);
        setDocuments(d || []);
        setAudit(a || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [targetUser.id]);

  const tabs = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'contacts', label: 'Contatos', icon: Phone },
    { key: 'medical', label: 'Médico', icon: Heart },
    { key: 'documents', label: 'Documentos', icon: FileText },
    { key: 'audit', label: 'Auditoria', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{targetUser.full_name || 'Usuário'}</h2>
            <p className="text-sm text-gray-500">{targetUser.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tab === 'profile' ? (
            <><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Nome" value={targetUser.full_name} />
              <InfoRow icon={Mail} label="Email" value={targetUser.email} />
              {targetUser.display_name && <InfoRow icon={User} label="Nome de exibição" value={targetUser.display_name} />}
              {targetUser.phone && <InfoRow icon={Phone} label="Telefone" value={targetUser.phone} />}
              <InfoRow icon={CreditCard} label="Plano" value={targetUser.plan_type || 'free'} />
              <InfoRow icon={Shield} label="Role" value={targetUser.role || 'user'} />
              <InfoRow icon={Activity} label="Status" value={targetUser.active !== false ? 'Ativo' : 'Inativo'} />
              <InfoRow icon={Calendar} label="Criado em" value={targetUser.created_at ? new Date(targetUser.created_at).toLocaleDateString('pt-BR') : '---'} />
              {targetUser.deactivated_at && (
                <InfoRow icon={Calendar} label="Desativado em" value={new Date(targetUser.deactivated_at).toLocaleDateString('pt-BR')} />
              )}
            </div>
            {(targetUser.address_street || targetUser.address_city) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1.5" />Endereço</h4>
                <p className="text-sm text-blue-900">
                  {targetUser.address_street && `${targetUser.address_street}${targetUser.address_number ? `, ${targetUser.address_number}` : ''}`}
                  {targetUser.address_complement && ` — ${targetUser.address_complement}`}
                  <br />
                  {targetUser.address_neighborhood && `${targetUser.address_neighborhood}, `}{targetUser.address_city && `${targetUser.address_city}`}{targetUser.address_state && ` — ${targetUser.address_state}`}
                  {targetUser.address_zipcode && <><br />CEP: {targetUser.address_zipcode}</>}
                </p>
              </div>
            )}</>
          ) : tab === 'contacts' ? (
            contacts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum contato de emergência.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">{c.name}</span>
                        {c.is_primary && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">Principal</span>}
                      </div>
                      <span className="text-sm text-gray-500">{c.relationship}</span>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Phone className="w-3 h-3" />{c.phone}</a>
                      {c.whatsapp && <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-1 text-sm text-green-600 hover:underline"><MessageCircle className="w-3 h-3" />WhatsApp</a>}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'medical' ? (
            medical ? (
              <div className="space-y-4">
                {medical.blood_type && (
                  <div><span className="text-sm text-gray-500">Tipo sanguíneo</span><p className="font-semibold text-gray-900">{medical.blood_type}</p></div>
                )}
                {medical.allergies?.length > 0 && (
                  <div><span className="text-sm text-gray-500">Alergias</span><div className="flex flex-wrap gap-1 mt-1">{medical.allergies.map((a, i) => <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs">{a}</span>)}</div></div>
                )}
                {medical.conditions?.length > 0 && (
                  <div><span className="text-sm text-gray-500">Condições</span><div className="flex flex-wrap gap-1 mt-1">{medical.conditions.map((c, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{c}</span>)}</div></div>
                )}
                {medical.medications?.length > 0 && (
                  <div><span className="text-sm text-gray-500">Medicações</span><div className="flex flex-wrap gap-1 mt-1">{medical.medications.map((m, i) => <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">{m}</span>)}</div></div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhum registro médico.</p>
            )
          ) : tab === 'documents' ? (
            documents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum documento.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documents.map(d => (
                  <div key={d.id} className="border border-gray-200 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 truncate">{d.name || d.document_type}</p>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'audit' ? (
            audit.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum registro de auditoria.</p>
            ) : (
              <div className="space-y-2">
                {audit.map(a => (
                  <div key={a.id} className="flex items-start gap-3 border border-gray-200 rounded-xl p-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.action}</p>
                      <p className="text-xs text-gray-500">{a.admin_name ? `por ${a.admin_name}` : ''} — {new Date(a.created_at).toLocaleString('pt-BR')}</p>
                      {a.details && <pre className="text-xs text-gray-400 mt-1">{JSON.stringify(a.details, null, 1)}</pre>}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

const SortableHeader = ({ label, sortKey, sort, onSort }) => (
  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
    onClick={() => onSort(sortKey)}>
    {label}{sort.key === sortKey ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
  </th>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '---'}</p>
    </div>
  </div>
);

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', role: 'all', plan: 'all' });
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });

  const handleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const filtered = search
    ? users.filter(u =>
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const sorted = [...filtered]
    .filter(u => filters.status === 'all' || (filters.status === 'active' && u.active !== false) || (filters.status === 'inactive' && u.active === false))
    .filter(u => filters.role === 'all' || u.role === filters.role)
    .filter(u => filters.plan === 'all' || u.plan_type === filters.plan)
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'created_at') return dir * ((new Date(a.created_at||0)) - (new Date(b.created_at||0)));
      const va = (a[sort.key] || '').toString().toLowerCase();
      const vb = (b[sort.key] || '').toString().toLowerCase();
      return dir * va.localeCompare(vb);
    });
  const [showLogs, setShowLogs] = useState(false);
  const [logsTab, setLogsTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadLogs = async () => {
    setLogsLoading(true);
    setShowLogs(true);
    try {
      const [audit, emergency] = await Promise.all([
        adminListAuditLogs().catch(() => []),
        adminListEmergencyLogs().catch(() => []),
      ]);
      setAuditLogs(audit);
      setEmergencyLogs(emergency);
    } catch {}
    setLogsLoading(false);
  };

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
      default:
        return { title: 'Confirmação', message: 'Tem certeza?', danger: false };
    }
  };

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

      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

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
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
            <button onClick={loadLogs} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Clock className="w-3.5 h-3.5" />
              Logs do Sistema
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4 flex flex-wrap gap-3 items-end">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nome ou email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          <select value={filters.role} onChange={e => setFilters(f => ({...f, role: e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="all">Todas as roles</option>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filters.plan} onChange={e => setFilters(f => ({...f, plan: e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="all">Todos os planos</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <SortableHeader label="Nome" sortKey="full_name" sort={sort} onSort={handleSort} />
                  <SortableHeader label="Email" sortKey="email" sort={sort} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="active" sort={sort} onSort={handleSort} />
                  <SortableHeader label="Plano" sortKey="plan_type" sort={sort} onSort={handleSort} />
                  <SortableHeader label="Role" sortKey="role" sort={sort} onSort={handleSort} />
                  <SortableHeader label="Criado em" sortKey="created_at" sort={sort} onSort={handleSort} />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sorted.map((u) => (
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
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-0.5" /> Detalhes
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
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

        {showLogs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Logs do Sistema
                </h2>
                <button onClick={() => setShowLogs(false)} className="text-sm text-gray-500 hover:text-gray-700">Fechar</button>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setLogsTab('audit')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${logsTab === 'audit' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Ações de Admin</button>
                <button onClick={() => setLogsTab('emergency')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${logsTab === 'emergency' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Acessos de Emergência</button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              {logsLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
              ) : logsTab === 'audit' ? (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Admin</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Ação</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Alvo</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50 text-sm">
                        <td className="px-4 py-2 text-gray-900">{l.admin_name || '---'}</td>
                        <td className="px-4 py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{l.action}</span></td>
                        <td className="px-4 py-2 text-gray-600">{l.target_name || '---'}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum registro de auditoria.</td></tr>}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Usuário</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Acessado em</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">IP</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {emergencyLogs.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50 text-sm">
                        <td className="px-4 py-2 text-gray-900">{l.user_name || '---'}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{new Date(l.accessed_at).toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs font-mono">{l.ip_address || '---'}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs truncate max-w-xs">{l.user_agent || '---'}</td>
                      </tr>
                    ))}
                    {emergencyLogs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum acesso de emergência registrado.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
