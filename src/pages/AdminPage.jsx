import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, ArrowLeft, Search, Crown, X, Clock,
  ToggleLeft, ToggleRight, Activity, ChevronDown, ChevronUp,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { adminListUsers, adminUpdateUserRole, adminToggleUserActive, adminGetUserAudit } from '@/lib/emergencyApi';
import { toast } from '@/components/ui/use-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAudit, setExpandedAudit] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListUsers({
        search, status: statusFilter, plan: planFilter, role: roleFilter, sortBy, sortDir
      });
      setUsers(data);
    } catch (err) {
      toast({ title: 'Erro ao carregar usuários', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter, roleFilter, sortBy, sortDir]);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    loadUsers();
  }, [user, loadUsers, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await adminUpdateUserRole(targetUser.id, newRole);
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      toast({ title: newRole === 'admin' ? 'Promovido a admin' : 'Rebaixado para usuário' });
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      await adminToggleUserActive(targetUser.id);
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, active: !u.active } : u));
      toast({ title: targetUser.active ? 'Usuário desativado' : 'Usuário ativado' });
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleViewAudit = async (targetUser) => {
    if (expandedAudit === targetUser.id) { setExpandedAudit(null); return; }
    setExpandedAudit(targetUser.id);
    setLoadingAudit(true);
    try {
      const data = await adminGetUserAudit(targetUser.id);
      setAuditLog(data);
    } catch { setAuditLog([]); } finally { setLoadingAudit(false); }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const actionLabels = { update_role: 'Alterou role', activate: 'Ativou', deactivate: 'Desativou' };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" /> Admin
          </h1>
          <p className="text-gray-600 mt-1">Gerencie usuários, permissões e status do sistema</p>
        </div>
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nome ou email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-300' : ''}>
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </Button>
          <span className="text-sm text-gray-500">{users.length} usuário{users.length !== 1 ? 's' : ''}</span>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">Status: Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">Plano: Todos</option>
              <option value="free">Free</option>
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
            </select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">Role: Todos</option>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={() => { setStatusFilter('all'); setPlanFilter('all'); setRoleFilter('all'); setSearch(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium">Limpar filtros</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhum usuário encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th onClick={() => toggleSort('full_name')}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                    Nome <SortIcon field="full_name" />
                  </th>
                  <th onClick={() => toggleSort('email')}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell">
                    Email <SortIcon field="email" />
                  </th>
                  <th onClick={() => toggleSort('plan_type')}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                    Plano <SortIcon field="plan_type" />
                  </th>
                  <th onClick={() => toggleSort('role')}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                    Role <SortIcon field="role" />
                  </th>
                  <th onClick={() => toggleSort('created_at')}
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 hidden lg:table-cell">
                    Criado em <SortIcon field="created_at" />
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          !u.active ? 'bg-gray-300' : u.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>{(u.full_name || '?')[0]}</div>
                        <div>
                          <span className="font-medium text-gray-900">{u.full_name || '—'}</span>
                          <span className="text-xs text-gray-400 ml-2 md:hidden">{u.email || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{u.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.plan_type === 'free' ? 'bg-gray-100 text-gray-700' :
                        u.plan_type === 'basic' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{u.plan_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => handleViewAudit(u)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Histórico">
                          <Activity className="w-4 h-4" />
                        </button>
                        {u.id !== user.id && (
                          <>
                            <button onClick={() => handleToggleRole(u)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.role === 'admin'
                                  ? 'text-purple-600 hover:bg-purple-50'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`} title={u.role === 'admin' ? 'Rebaixar para usuário' : 'Promover a admin'}>
                              <Crown className={`w-4 h-4 ${u.role === 'admin' ? 'fill-purple-600' : ''}`} />
                            </button>
                            <button onClick={() => handleToggleActive(u)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                              }`} title={u.active ? 'Desativar' : 'Ativar'}>
                              {u.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {expandedAudit && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" /> Histórico de ações
            </h3>
            <button onClick={() => setExpandedAudit(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {loadingAudit ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Nenhuma ação registrada</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {auditLog.map((log) => (
                <div key={log.id} className="flex items-start text-sm border-l-2 pl-3 py-1" style={{
                  borderColor: log.action === 'deactivate' ? '#ef4444' : log.action === 'activate' ? '#22c55e' : '#3b82f6'
                }}>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{log.admin_name || 'Admin'}</span>
                    <span className="text-gray-600"> {actionLabels[log.action] || log.action}</span>
                    {log.details?.new_role && <span className="text-gray-500"> para {log.details.new_role}</span>}
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminPage;
