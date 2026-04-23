import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  QrCode, 
  Plus, 
  Save, 
  LogOut,
  ChevronRight,
  Search,
  Menu,
  X,
  ShieldCheck,
  Edit2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const AdminView = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [qrToken, setQrToken] = useState('');
  
  // Forms
  const [companyForm, setCompanyForm] = useState({ name: '', rut: '' });
  const [userForm, setUserForm] = useState({ name: '', rut: '', password: '', companyId: '', role: 'user' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [compRes, userRes, qrRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/companies`),
        axios.get(`${API_BASE_URL}/api/admin/users`),
        axios.get(`${API_BASE_URL}/api/admin/qr-token`)
      ]);
      setCompanies(compRes.data);
      setUsers(userRes.data);
      setQrToken(qrRes.data.value);
    } catch (error) {
      console.error('Error fetching admin data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/admin/companies`, companyForm);
      setCompanyForm({ name: '', rut: '' });
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/admin/users/${editingUserId}`, userForm);
        alert('Usuario actualizado');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/users`, userForm);
        alert('Usuario creado');
      }
      setUserForm({ name: '', rut: '', password: '', companyId: '', role: 'user' });
      setIsEditing(false);
      setEditingUserId(null);
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const handleEditUser = (u) => {
    setIsEditing(true);
    setEditingUserId(u.id);
    setUserForm({
      name: u.name,
      rut: u.rut,
      password: '', // Leave empty unless changing
      companyId: u.companyId,
      role: u.role
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateQR = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/qr-token`, { value: qrToken });
      alert('Token de QR actualizado');
    } catch (error) { alert('Error actualizando token'); }
  };

  const menuItems = [
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'settings', label: 'Configuración', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-dark flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-dark-card p-4 flex justify-between items-center border-b border-white/5 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black">
            <QrCode size={18} />
          </div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-dark-card border-r border-white/5 z-40 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden lg:flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Gestión</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Administrador</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <tab.icon size={22} />
                <span className="text-sm tracking-wide">{tab.label}</span>
                {activeTab === tab.id && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            ))}
          </nav>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'companies' && (
            <motion.div 
              key="companies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-white">Empresas</h2>
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" />
                  <input type="text" placeholder="Buscar empresa..." className="input-field pl-12 md:w-64" />
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="glass-card p-6 md:p-8 sticky top-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                      <Plus size={20} className="text-primary" /> Enrolar Empresa
                    </h3>
                    <form onSubmit={handleCreateCompany} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
                        <input 
                          className="input-field"
                          type="text" 
                          value={companyForm.name}
                          onChange={e => setCompanyForm({...companyForm, name: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">RUT</label>
                        <input 
                          className="input-field"
                          type="text" 
                          placeholder="76.123.456-K"
                          value={companyForm.rut}
                          onChange={e => setCompanyForm({...companyForm, rut: e.target.value})}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full py-4">Registrar Empresa</button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-gray-500 uppercase text-xs font-black tracking-[0.2em] px-2 flex items-center gap-2">
                    Lista de Empresas <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {companies.map(c => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        key={c.id} 
                        className="bg-dark-card border border-white/5 p-6 rounded-3xl flex justify-between items-center group cursor-pointer hover:border-primary/20 transition-all"
                      >
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">{c.rut}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 text-gray-600 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-white">Usuarios</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="glass-card p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                      </h3>
                      {isEditing && (
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setUserForm({ name: '', rut: '', password: '', companyId: '', role: 'user' });
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Cancelar Edición
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleSubmitUser} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                        <input className="input-field" type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">RUT</label>
                        <input className="input-field" type="text" value={userForm.rut} onChange={e => setUserForm({...userForm, rut: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Password {isEditing && <span className="text-[10px] lowercase opacity-50">(dejar vacío para no cambiar)</span>}
                        </label>
                        <input 
                          className="input-field" 
                          type="password" 
                          value={userForm.password} 
                          onChange={e => setUserForm({...userForm, password: e.target.value})} 
                          required={!isEditing} 
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Empresa</label>
                        
                        {/* Custom Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="input-field flex justify-between items-center text-left"
                          >
                            <span className={userForm.companyId ? "text-white" : "text-gray-500"}>
                              {userForm.companyId 
                                ? companies.find(c => c.id === parseInt(userForm.companyId))?.name || 'Seleccionar Empresa'
                                : 'Seleccionar Empresa'}
                            </span>
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isCompanyDropdownOpen && (
                              <>
                                {/* Overlay to close */}
                                <div className="fixed inset-0 z-40" onClick={() => setIsCompanyDropdownOpen(false)} />
                                
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                  <div className="max-h-60 overflow-y-auto py-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUserForm({...userForm, companyId: ''});
                                        setIsCompanyDropdownOpen(false);
                                      }}
                                      className="w-full px-5 py-3 text-left text-sm text-gray-400 hover:bg-secondary/10 hover:text-secondary transition-colors"
                                    >
                                      Seleccionar Empresa
                                    </button>
                                    {companies.map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          setUserForm({...userForm, companyId: c.id.toString()});
                                          setIsCompanyDropdownOpen(false);
                                        }}
                                        className={`
                                          w-full px-5 py-3 text-left text-sm transition-all
                                          ${userForm.companyId === c.id.toString() 
                                            ? 'bg-secondary text-black font-bold' 
                                            : 'text-gray-300 hover:bg-secondary/10 hover:text-secondary'}
                                        `}
                                      >
                                        {c.name}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <button type="submit" className="btn-primary w-full py-4">
                        {isEditing ? 'Actualizar Usuario' : 'Enrolar Trabajador'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-gray-500 uppercase text-xs font-black tracking-[0.2em] px-2">Nómina de Personal</h3>
                  <div className="overflow-hidden glass-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase">Trabajador</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase">Empresa</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase">Rol</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-6">
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.rut}</p>
                              </td>
                              <td className="p-6">
                                <span className="text-sm text-gray-300">{u.Company?.name || 'Administración'}</span>
                              </td>
                              <td className="p-6">
                                <span className={`
                                  text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter
                                  ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'}
                                `}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-6 text-center">
                                <button 
                                  onClick={() => handleEditUser(u)}
                                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                                  title="Editar usuario"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-black text-white mb-8">Seguridad</h2>
              <div className="glass-card p-8 md:p-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="p-5 rounded-[2rem] bg-secondary/10 text-secondary shadow-lg shadow-secondary/5">
                    <QrCode size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Token Maestro</h3>
                    <p className="text-gray-400 text-sm mt-1">Código de validación global para el sistema de torniquetes.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Código de Acceso Actual</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        value={qrToken}
                        onChange={e => setQrToken(e.target.value)}
                        className="input-field flex-1 font-mono text-xl tracking-widest"
                      />
                      <button onClick={handleUpdateQR} className="btn-secondary flex items-center justify-center gap-2">
                        <Save size={20} /> Guardar
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 animate-pulse shrink-0" />
                    <p className="text-amber-500/80 text-sm leading-relaxed">
                      <strong>Importante:</strong> Al modificar este token, todos los QRs generados previamente quedarán obsoletos. Los trabajadores deberán actualizar su aplicación para poder ingresar.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminView;
