import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import { RefreshCw } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark text-white">
        <div className="relative">
          <RefreshCw className="animate-spin text-primary opacity-20" size={80} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Cargando Sistema</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return user.role === 'admin' ? <AdminView /> : <UserView />;
}

export default App;
