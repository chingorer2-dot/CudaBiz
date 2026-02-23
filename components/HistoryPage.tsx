
import React, { useState, useMemo } from 'react';
import { AppState, Sale, StockEntry } from '../types';
import { ShoppingCart, Package, Calendar, ArrowRight, Download } from 'lucide-react';

interface HistoryPageProps {
  state: AppState;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ state }) => {
  const [view, setView] = useState<'sales' | 'entries'>('sales');

  const sortedSales = useMemo(() => 
    [...state.sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.sales]
  );

  const sortedEntries = useMemo(() => 
    [...state.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.entries]
  );

  const getAccLabel = (accId: string) => {
    const acc = state.accessories.find(a => a.id === accId);
    if (!acc) return 'Item removido';
    const brand = state.brands.find(b => b.id === acc.brandId)?.name || 'N/A';
    const model = state.models.find(m => m.id === acc.modelId)?.name || 'N/A';
    return `${acc.type} - ${brand} ${model}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Movimentações</h2>
          <p className="text-slate-500">Acompanhe todas as vendas e entradas efetuadas.</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
          <button 
            onClick={() => setView('sales')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'sales' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShoppingCart size={16} /> Vendas
          </button>
          <button 
            onClick={() => setView('entries')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'entries' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Package size={16} /> Entradas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {view === 'sales' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Acessório</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Qtd</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedSales.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhuma venda registada.</td></tr>
                ) : (
                  sortedSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(sale.date).toLocaleDateString('pt-PT')}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {new Date(sale.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{getAccLabel(sale.accessoryId)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">{sale.quantity}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">{sale.totalPrice.toFixed(2)} MT</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+{sale.profit.toFixed(2)} MT</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Acessório</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Qtd Entr.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Preço Unit.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedEntries.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhuma entrada registada.</td></tr>
                ) : (
                  sortedEntries.map(entry => {
                    const unitPrice = entry.quantity > 0 ? entry.cost / entry.quantity : 0;
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(entry.date).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase">
                            {new Date(entry.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{getAccLabel(entry.accessoryId)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-center">+{entry.quantity}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{unitPrice.toFixed(2)} MT</td>
                        <td className="px-6 py-4 text-sm font-black text-rose-600">{entry.cost.toFixed(2)} MT</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
