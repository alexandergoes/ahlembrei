import React from 'react';
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react';
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

  const handleNotificationsClick = () => {
    toast({
      title: "🚧 Esta funcionalidade não está implementada ainda",
      description: "Mas não se preocupe! Você pode solicitar na sua próxima mensagem! 🚀",
    });
  };

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-6">
          <button
            onClick={handleNotificationsClick}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring"
          >
            <Bell className="w-6 h-6" />
          </button>

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