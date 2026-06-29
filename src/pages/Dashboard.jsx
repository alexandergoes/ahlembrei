import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Overview from '@/components/dashboard/Overview';
import MyData from '@/components/dashboard/MyData';
import EmergencyContacts from '@/components/dashboard/EmergencyContacts';
import MedicalInfo from '@/components/dashboard/MedicalInfo';
import Documents from '@/components/dashboard/Documents';
import Subscription from '@/components/dashboard/Subscription';
import AdminPage from '@/pages/AdminPage';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="overview" />} />
              <Route path="overview" element={<Overview />} />
              <Route path="my-data" element={<MyData />} />
              <Route path="emergency-contacts" element={<EmergencyContacts />} />
              <Route path="medical-info" element={<MedicalInfo />} />
              <Route path="documents" element={<Documents />} />
              <Route path="subscription" element={<Subscription />} />
              {user?.role === 'admin' && (
                <Route path="admin" element={<AdminPage />} />
              )}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;