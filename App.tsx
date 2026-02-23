
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  History,
  LogOut,
  Menu,
  X,
  Lock,
  FileText
} from 'lucide-react';
import { AppState } from './types';
import { loadState, saveState } from './storage';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import SalesManagement from './components/SalesManagement';
import SettingsPage from './components/SettingsPage';
import HistoryPage from './components/HistoryPage';
import ReportsPage from './components/ReportsPage';

const ACTIVATION_CODE = 'lucia86&@.com';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'sales' | 'history' | 'settings' | 'reports'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivated, setIsActivated] = useState<boolean>(() => {
    return localStorage.getItem('cudabiz_activated') === 'true';
  });
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (activationInput === ACTIVATION_CODE) {
      setIsActivated(true);
      localStorage.setItem('cudabiz_activated', 'true');
      setActivationError(false);
    } else {
      setActivationError(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'stock', label: 'Inventário', icon: Package },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const lowStockAlerts = useMemo(() => {
    return state.accessories.filter(acc => acc.quantity <= acc.lowStockThreshold);
  }, [state.accessories]);

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Lock size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">CudaBiz Ativação</h1>
            <p className="text-slate-500 mt-2">Introduza o código de ativação do desenvolvedor para aceder ao sistema.</p>
          </div>
          <form onSubmit={handleActivation} className="space-y-4">
            <div>
              <input 
                type="password"
                placeholder="Código de Ativação"
                className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3 text-center text-lg font-bold focus:outline-none transition-all ${activationError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-slate-100 focus:border-indigo-600'}`}
                value={activationInput}
                onChange={(e) => {
                  setActivationInput(e.target.value);
                  setActivationError(false);
                }}
              />
              {activationError && <p className="text-rose-500 text-xs font-bold mt-2 uppercase tracking-tight">Código Incorreto</p>}
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">ATIVAR SISTEMA</button>
          </form>
          <div className="pt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">© 2024 CudaBiz Management System</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="lg:hidden fixed top-4 left-4 z-50 print:hidden">
        <button onClick={toggleSidebar} className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">CudaBiz</h1>
                <p className="text-xs text-slate-500 mt-1">Gestão de Acessórios</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <item.icon size={20} /> {item.label}
                  {item.id === 'stock' && lowStockAlerts.length > 0 && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">{lowStockAlerts.length}</span>}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-slate-100">
            <button onClick={() => { setIsActivated(false); localStorage.removeItem('cudabiz_activated'); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
              <LogOut size={20} /> <span className="text-sm font-medium">Sair (Bloquear)</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="p-4 md:p-8 max-w-7xl mx-auto print:p-0">
          {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} onNavigate={setActiveTab} />}
          {activeTab === 'stock' && <StockManagement state={state} setState={setState} />}
          {activeTab === 'sales' && <SalesManagement state={state} setState={setState} />}
          {activeTab === 'history' && <HistoryPage state={state} />}
          {activeTab === 'reports' && <ReportsPage state={state} />}
          {activeTab === 'settings' && <SettingsPage state={state} setState={setState} />}
        </div>
      </main>
    </div>
  );
};

export default App;
