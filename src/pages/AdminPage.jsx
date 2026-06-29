import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Crown, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { adminListUsers, adminUpdateUserRole } from '@/lib/emergencyApi';
import { toast } from '@/components/ui/use-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (err) {
      toast({ title: 'Erro ao carregar usuários', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await adminUpdateUserRole(targetUser.id, newRole);
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      toast({ title: `Usuário ${newRole === 'admin' ? 'promovido' : 'rebaixado'} com sucesso` });
    } catch (err) {
      toast({ title: 'Erro ao atualizar role', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" /> Admin
          </h1>
          <p className="text-gray-600 mt-1">Gerencie usuários e permissões do sistema</p>
        </div>
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" /> Usuários ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plano</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Criado em</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{u.full_name || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{u.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.plan_type === 'free' ? 'bg-gray-100 text-gray-700' :
                        u.plan_type === 'basic' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{u.plan_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== user.id && (
                        <Button onClick={() => handleToggleRole(u)} size="sm"
                          variant={u.role === 'admin' ? 'outline' : 'default'}
                          className={u.role === 'admin'
                            ? 'text-red-600 border-red-600 hover:bg-red-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'}
                        >
                          {u.role === 'admin' ? 'Rebaixar' : 'Promover'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPage;
