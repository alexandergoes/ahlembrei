import React from 'react';
import { ChevronDown, LogOut, User, Menu, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = ({ onMenuClick, activeTab, onTabChange }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login');
      toast({
        title: "Você saiu!",
        description: "Até a próxima!",
      });
    }
  };

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-6">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="hidden sm:inline font-medium">{user?.user_metadata?.full_name || user?.email}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  user?.plan === 'premium'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : user?.plan === 'basic'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}>
                  {user?.plan === 'free' ? 'Grátis' : user?.plan === 'basic' ? 'Básico' : 'Premium'}
                </span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onTabChange('my-data')}>
                <User className="w-4 h-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;