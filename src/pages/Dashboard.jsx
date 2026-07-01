import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Overview from '@/components/dashboard/Overview';
import MyData from '@/components/dashboard/MyData';
import EmergencyContacts from '@/components/dashboard/EmergencyContacts';
import MedicalInfo from '@/components/dashboard/MedicalInfo';
import Documents from '@/components/dashboard/Documents';
import Subscription from '@/components/dashboard/Subscription';

const pathToTab = {
  'overview': 'overview',
  'my-data': 'my-data',
  'emergency-contacts': 'contacts',
  'medical-info': 'medical',
  'documents': 'documents',
  'subscription': 'subscription',
};

const tabToPath = {
  'overview': '/dashboard/overview',
  'my-data': '/dashboard/my-data',
  'contacts': '/dashboard/emergency-contacts',
  'medical': '/dashboard/medical-info',
  'documents': '/dashboard/documents',
  'subscription': '/dashboard/subscription',
};

const getTabFromPath = (pathname) => {
  const parts = pathname.replace(/\/+$/, '').split('/');
  const last = parts[parts.length - 1];
  return pathToTab[last] || 'overview';
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.pathname]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    navigate(tabToPath[tab] || '/dashboard/overview');
  }, [navigate]);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onTabChange={handleTabChange} />;
      case 'my-data':
        return <MyData />;
      case 'contacts':
        return <EmergencyContacts />;
      case 'medical':
        return <MedicalInfo />;
      case 'documents':
        return <Documents />;
      case 'subscription':
        return <Subscription />;
      default:
        return <Overview onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
