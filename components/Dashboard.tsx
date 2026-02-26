
import React, { useMemo, useState } from 'react';
import { AppState, Sale, Accessory, DailyClosure } from '../types';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpCircle,
  ArrowDownCircle,
  CalendarCheck,
  History
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  state: AppState;
  setState?: React.Dispatch<React.SetStateAction<AppState>>;
  onNavigate: (tab: 'dashboard' | 'stock' | 'sales' | 'history' | 'settings' | 'reports') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setState, onNavigate }) => {
  const [showClosureModal, setShowClosureModal] = useState(false);

  // Calculate the "Current Session" stats (since the last closure)
  const stats = useMemo(() => {
    // Get the timestamp of the last closure, or the beginning of time if none
    const lastClosureDate = state.closures.length > 0 
      ? new Date([...state.closures].sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())[0].closedAt)
      : new Date(0);

    const sessionSales = state.sales.filter(s => new Date(s.date) > lastClosureDate);
    const sessionEntries = state.entries.filter(e => new Date(e.date) > lastClosureDate);
    
    const totalSession = sessionSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const profitSession = sessionSales.reduce((acc, s) => acc + s.profit, 0);
    const lowStock = state.accessories.filter(a => a.quantity <= a.lowStockThreshold).length;
    
    const totalQtyOut = sessionSales.reduce((acc, s) => acc + s.quantity, 0);
    const totalQtyIn = sessionEntries.reduce((acc, e) => acc + e.quantity, 0);

    return { 
      totalSession, 
      profitSession, 
      lowStock, 
      salesCount: sessionSales.length, 
      totalQtyOut, 
      totalQtyIn,
      lastClosureDate
    };
  }, [state.sales, state.entries, state.accessories, state.closures]);

  const handleCloseDay = () => {
    if (!setState) return;
    
    const newClosure: DailyClosure = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      totalSales: stats.totalSession,
      totalProfit: stats.profitSession,
      itemsSold: stats.totalQtyOut,
      closedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      closures: [...prev.closures, newClosure]
    }));
    setShowClosureModal(false);
    alert('Dia encerrado com sucesso! O balanço foi arquivado e uma nova sessão iniciada automaticamente.');
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySales = state.sales.filter(s => s.date.startsWith(date));
      return {
        name: date.split('-').slice(1).reverse().join('/'),
        vendas: daySales.reduce((acc, s) => acc + s.totalPrice, 0),
        lucro: daySales.reduce((acc, s) => acc + s.profit, 0),
      };
    });
  }, [state.sales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Balanço da Sessão Atual</h2>
          <p className="text-slate-400">
            {stats.lastClosureDate.getTime() === 0 
              ? 'Acompanhe as vendas em tempo real.' 
              : `Desde o último encerramento (${stats.lastClosureDate.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowClosureModal(true)}
            disabled={stats.salesCount === 0 && stats.totalQtyIn === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg ${
              (stats.salesCount === 0 && stats.totalQtyIn === 0) 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <CalendarCheck size={18} />
            Encerrar e Iniciar Novo Dia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-900/30 text-indigo-400 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Vendas da Sessão</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalSession.toFixed(2)} MT</h3>
            </div>
          </div>
          <div className="flex items-center text-xs text-slate-500 font-medium">
            {stats.salesCount} transações nesta jornada
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-900/30 text-emerald-400 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Lucro Acumulado</p>
              <h3 className="text-2xl font-bold text-white">{stats.profitSession.toFixed(2)} MT</h3>
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-500 font-medium">
            Lucro das vendas atuais
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-900/30 text-blue-400 rounded-xl">
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Entrada Stock</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalQtyIn} <span className="text-sm font-normal text-slate-500">un.</span></h3>
            </div>
          </div>
          <div className="text-xs text-blue-500 font-medium">Produtos repostos na sessão</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-900/30 text-orange-400 rounded-xl">
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Saída Stock</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalQtyOut} <span className="text-sm font-normal text-slate-500">un.</span></h3>
            </div>
          </div>
          <div className="text-xs text-orange-500 font-medium">Itens vendidos na sessão</div>
        </div>
      </div>

      {showClosureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-6 border border-slate-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-400 mb-4">
                <CalendarCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white">Encerrar e Arquivar</h3>
              <p className="text-slate-400 mt-2">Deseja arquivar os totais desta sessão? O sistema iniciará automaticamente uma nova contagem, mantendo o stock atualizado.</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Vendas Totais</span>
                <span className="font-bold text-white">{stats.totalSession.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Lucro Total</span>
                <span className="font-bold text-emerald-400">{stats.profitSession.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Itens Vendidos</span>
                <span className="font-bold text-white">{stats.totalQtyOut} un.</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowClosureModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-300">Cancelar</button>
              <button onClick={handleCloseDay} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Confirmar e Abrir Novo Dia</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-lg">Evolução de Vendas (7 Dias)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="lucro" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="font-bold text-white text-lg mb-6">Histórico de Encerramentos</h3>
          <div className="space-y-4">
            {state.closures.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm italic">Nenhum arquivamento realizado.</p>
            ) : (
              [...state.closures].sort((a,b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()).slice(0, 5).map((closure) => (
                <div key={closure.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(closure.closedAt).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Arquivado</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-black text-white">{closure.totalSales.toFixed(2)} MT</span>
                    <span className="text-xs font-bold text-emerald-400">+{closure.totalProfit.toFixed(2)} MT</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
