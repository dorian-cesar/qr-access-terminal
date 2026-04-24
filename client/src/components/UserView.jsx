import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, RefreshCw, User as UserIcon, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const UserView = () => {
  const { user, logout } = useAuth();
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/qr-data`);
      setQrValue(res.data.qrValue);
    } catch (error) {
      console.error('Error fetching QR data', error);
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth loading feel
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  return (
    <div className="min-h-screen bg-dark flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-lg shadow-secondary/5">
            <UserIcon size={24} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">{user.name}</h2>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Building size={14} />
              <span>{user.company}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
        >
          <LogOut size={22} />
        </button>
      </header>

      {/* QR Card Container */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md glass-card overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-amber-600 p-6 text-black">
            <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wider">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Pase Digital
            </h3>
            <p className="text-black/70 text-sm font-medium mt-1">Válido para Terminal Sur</p>
          </div>

          <div className="p-8 flex flex-col items-center">
            <div className="relative group">
              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />

              <div className="bg-white p-6 rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                {loading ? (
                  <div className="w-56 h-56 flex items-center justify-center bg-gray-50 rounded-xl">
                    <RefreshCw className="animate-spin text-primary" size={48} />
                  </div>
                ) : (
                  <div className="relative">
                    <QRCodeSVG
                      value={qrValue}
                      size={224}
                      level="H"
                      fgColor="#000000"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                      <img src="/logo.png" className="w-12 h-12" alt="" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 w-full space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">ID Trabajador</p>
                  <p className="text-white font-mono">{user.rut}</p>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Acceso</p>
                  <p className="text-secondary font-bold">AUTORIZADO</p>
                </div>
              </div>

              <button
                onClick={fetchQR}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-400 hover:border-secondary/30 hover:text-secondary transition-all"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Actualizar Código
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="mt-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <span>Escanea para abrir el torniquete</span>
          <ArrowRight size={14} />
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">© 2026 Desarrollado por Wit.la</p>
      </footer>
    </div>
  );
};

export default UserView;
