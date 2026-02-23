
import React, { useState, useMemo } from 'react';
import { AppState, Sale, StockEntry } from '../types';
import { FileText, Printer, Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ReportsPageProps {
  state: AppState;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ state }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const reportData = useMemo(() => {
    let sales: Sale[] = [];
    let entries: StockEntry[] = [];
    let title = "";

    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    if (reportType === 'daily') {
      const target = `${year}-${month}-${day}`;
      sales = state.sales.filter(s => s.date.startsWith(target));
      entries = state.entries.filter(e => e.date.startsWith(target));
      title = `Relatório Diário - ${day}/${month}/${year}`;
    } else if (reportType === 'monthly') {
      const target = `${year}-${month}`;
      sales = state.sales.filter(s => s.date.startsWith(target));
      entries = state.entries.filter(e => e.date.startsWith(target));
      title = `Relatório Mensal - ${month}/${year}`;
    } else {
      const target = `${year}`;
      sales = state.sales.filter(s => s.date.startsWith(target));
      entries = state.entries.filter(e => e.date.startsWith(target));
      title = `Relatório Anual - ${year}`;
    }

    const totalSales = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const totalItemsSold = sales.reduce((acc, s) => acc + s.quantity, 0);
    const totalCostOfEntries = entries.reduce((acc, e) => acc + e.cost, 0);
    const totalItemsIn = entries.reduce((acc, e) => acc + e.quantity, 0);

    return { 
      sales, 
      entries, 
      title, 
      totalSales, 
      totalProfit, 
      totalItemsSold, 
      totalCostOfEntries, 
      totalItemsIn 
    };
  }, [state.sales, state.entries, reportType, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios de Gestão</h2>
          <p className="text-slate-500">Visualize e imprima resumos de desempenho periódicos.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Printer size={20} />
          Imprimir Relatório
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end print:hidden">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período do Relatório</label>
          <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button 
              onClick={() => setReportType('daily')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Diário
            </button>
            <button 
              onClick={() => setReportType('monthly')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setReportType('yearly')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Anual
            </button>
          </div>
        </div>
        <div className="w-full sm:w-auto space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar Data Base</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              className="w-full sm:w-auto pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 print:p-0 print:border-none print:shadow-none space-y-8 overflow-hidden print:overflow-visible">
        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{reportData.title}</h1>
            <p className="text-slate-500 font-medium mt-1">CudaBiz - Sistema de Gestão de Acessórios</p>
          </div>
          <div className="text-right">
             <div className="text-xs font-bold text-slate-400 uppercase">Documento Gerado em</div>
             <div className="text-sm font-bold text-slate-900">{new Date().toLocaleString('pt-PT')}</div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl space-y-1">
             <div className="text-xs font-bold text-slate-500 uppercase">Vendas Totais</div>
             <div className="text-2xl font-black text-slate-900">{reportData.totalSales.toFixed(2)} MT</div>
          </div>
          <div className="p-6 bg-emerald-50 rounded-2xl space-y-1">
             <div className="text-xs font-bold text-emerald-600 uppercase">Lucro Total</div>
             <div className="text-2xl font-black text-emerald-700">{reportData.totalProfit.toFixed(2)} MT</div>
          </div>
          <div className="p-6 bg-blue-50 rounded-2xl space-y-1">
             <div className="text-xs font-bold text-blue-600 uppercase">Produtos Vendidos</div>
             <div className="text-2xl font-black text-blue-700">{reportData.totalItemsSold} un.</div>
          </div>
          <div className="p-6 bg-orange-50 rounded-2xl space-y-1">
             <div className="text-xs font-bold text-orange-600 uppercase">Custo Entradas</div>
             <div className="text-2xl font-black text-orange-700">{reportData.totalCostOfEntries.toFixed(2)} MT</div>
          </div>
        </div>

        {/* Sales Table - Full Details */}
        <div className="space-y-6">
           <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Detalhes das Vendas (Relatório Completo)
           </h3>
           <div className="overflow-x-auto print:overflow-visible">
             <table className="w-full text-left text-[9px] sm:text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 font-bold uppercase text-[8px] print:text-[8px]">
                    <th className="py-2 px-1">Data</th>
                    <th className="py-2 px-1">Produto</th>
                    <th className="py-2 px-1">Marca</th>
                    <th className="py-2 px-1">Modelo/Cor</th>
                    <th className="py-2 px-1 text-center">Qtd</th>
                    <th className="py-2 px-1">Preço Unit.</th>
                    <th className="py-2 px-1">Valor Total</th>
                    <th className="py-2 px-1">Custo</th>
                    <th className="py-2 px-1">Lucro</th>
                    <th className="py-2 px-1 text-center">St. Antes</th>
                    <th className="py-2 px-1 text-center">St. Depois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.sales.length === 0 ? (
                    <tr><td colSpan={11} className="py-8 text-center text-slate-400 italic text-sm">Sem vendas registradas neste período.</td></tr>
                  ) : (
                    reportData.sales.map((sale) => {
                      const acc = state.accessories.find(a => a.id === sale.accessoryId);
                      const brand = state.brands.find(b => b.id === acc?.brandId)?.name || 'N/A';
                      const model = state.models.find(m => m.id === acc?.modelId);
                      const unitCost = sale.quantity > 0 ? (sale.totalPrice - sale.profit) / sale.quantity : 0;
                      
                      return (
                        <tr key={sale.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-1 whitespace-nowrap">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                          <td className="py-2 px-1 font-semibold">{acc?.type || 'Removido'}</td>
                          <td className="py-2 px-1">{brand}</td>
                          <td className="py-2 px-1">{model?.name} ({model?.color})</td>
                          <td className="py-2 px-1 text-center font-bold">{sale.quantity}</td>
                          <td className="py-2 px-1 whitespace-nowrap">{sale.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-1 font-bold whitespace-nowrap">{sale.totalPrice.toFixed(2)}</td>
                          <td className="py-2 px-1 whitespace-nowrap">{unitCost.toFixed(2)}</td>
                          <td className="py-2 px-1 font-bold text-emerald-600 whitespace-nowrap">{sale.profit.toFixed(2)}</td>
                          <td className="py-2 px-1 text-center font-medium text-slate-400">{sale.stockBefore !== undefined ? sale.stockBefore : '-'}</td>
                          <td className="py-2 px-1 text-center font-medium text-indigo-600">{sale.stockAfter !== undefined ? sale.stockAfter : '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
             </table>
           </div>
        </div>

        {/* Entries Table */}
        <div className="space-y-6">
           <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingDown size={20} className="text-rose-600" /> Detalhes das Entradas (Reposição)
           </h3>
           <div className="overflow-x-auto print:overflow-visible">
             <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Data/Hora</th>
                    <th className="py-3 px-2">Acessório</th>
                    <th className="py-3 px-2">Qtd</th>
                    <th className="py-3 px-2 text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.entries.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400 italic">Sem entradas registradas neste período.</td></tr>
                  ) : (
                    reportData.entries.map((entry) => {
                      const acc = state.accessories.find(a => a.id === entry.accessoryId);
                      const brand = state.brands.find(b => b.id === acc?.brandId)?.name || 'N/A';
                      const model = state.models.find(m => m.id === acc?.modelId);
                      return (
                        <tr key={entry.id}>
                          <td className="py-3 px-2">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="py-3 px-2 font-bold">{acc?.type} - {brand} {model?.name} ({model?.color})</td>
                          <td className="py-3 px-2">+{entry.quantity}</td>
                          <td className="py-3 px-2 text-right font-black text-rose-600">{entry.cost.toFixed(2)} MT</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
             </table>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center italic">
           <div>Relatório gerado automaticamente pelo sistema CudaBiz.</div>
           <div>Assinatura do Responsável: _____________________________________</div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
