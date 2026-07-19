import React, { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Overview from '@/components/dashboard/Overview';
import MyData from '@/components/dashboard/MyData';
import EmergencyContacts from '@/components/dashboard/EmergencyContacts';
import MedicalInfo from '@/components/dashboard/MedicalInfo';
import Documents from '@/components/dashboard/Documents';
import Subscription from '@/components/dashboard/Subscription';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <div className="p-8 text-center text-gray-500">Erro ao carregar. <button onClick={() => this.setState({ hasError: false })} className="text-blue-600 underline ml-1">Tentar novamente</button></div> : this.props.children; }
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onTabChange={setActiveTab} />;
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
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <ErrorBoundary key={activeTab}>{renderContent()}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
