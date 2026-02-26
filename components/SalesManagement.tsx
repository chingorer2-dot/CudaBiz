
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, Sale, Accessory } from '../types';
import { Search, ShoppingBag, Plus, Minus, Tag, DollarSign, Wallet, AlertCircle } from 'lucide-react';

interface SalesManagementProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SalesManagement: React.FC<SalesManagementProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcc, setSelectedAcc] = useState<Accessory | null>(null);
  const [saleQty, setSaleQty] = useState(1);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (selectedAcc) {
      setCustomPrice(selectedAcc.sellingPrice);
    }
  }, [selectedAcc]);

  const filteredAccessories = useMemo(() => {
    if (!searchTerm) return [];
    return state.accessories.filter(acc => {
      const brand = state.brands.find(b => b.id === acc.brandId)?.name.toLowerCase() || '';
      const model = state.models.find(m => m.id === acc.modelId)?.name.toLowerCase() || '';
      return `${acc.type} ${brand} ${model}`.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [state.accessories, state.brands, state.models, searchTerm]);

  const handleSale = () => {
    if (!selectedAcc || saleQty <= 0 || saleQty > selectedAcc.quantity) return;

    const actualPrice = customPrice || selectedAcc.sellingPrice;
    const total = saleQty * actualPrice;
    const costTotal = saleQty * selectedAcc.purchasePrice;
    const profit = total - costTotal;

    const stockBefore = selectedAcc.quantity;
    const stockAfter = selectedAcc.quantity - saleQty;

    const newSale: Sale = {
      id: crypto.randomUUID(),
      accessoryId: selectedAcc.id,
      quantity: saleQty,
      unitPrice: actualPrice,
      totalPrice: total,
      profit: profit,
      date: new Date().toISOString(),
      stockBefore,
      stockAfter
    };

    setState(prev => ({
      ...prev,
      sales: [...prev.sales, newSale],
      accessories: prev.accessories.map(acc => 
        acc.id === selectedAcc.id 
          ? { ...acc, quantity: acc.quantity - saleQty } 
          : acc
      )
    }));

    // Reset
    setSelectedAcc(null);
    setSearchTerm('');
    setSaleQty(1);
    setIsConfirming(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Registo de Venda</h2>
          <p className="text-slate-400">Efetue vendas e aplique descontos conforme necessário.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Search size={18} className="text-indigo-400" />
              1. Selecionar Acessório
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Digitar marca, modelo ou tipo..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {searchTerm && filteredAccessories.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-500 italic">
                  Nenhum item encontrado com este termo.
                </div>
              )}
              {filteredAccessories.map(acc => {
                const brand = state.brands.find(b => b.id === acc.brandId)?.name;
                const modelObj = state.models.find(m => m.id === acc.modelId);
                const isSelected = selectedAcc?.id === acc.id;
                const outOfStock = acc.quantity === 0;

                return (
                  <button
                    key={acc.id}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedAcc(acc);
                      setSaleQty(1);
                    }}
                    className={`
                      text-left p-4 rounded-2xl border-2 transition-all group
                      ${isSelected ? 'border-indigo-600 bg-indigo-900/30' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}
                      ${outOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 bg-indigo-900/30 rounded-md">
                        {acc.type}
                      </span>
                      <span className={`text-xs font-bold ${acc.quantity <= acc.lowStockThreshold ? 'text-rose-400' : 'text-slate-500'}`}>
                        {acc.quantity} em stock
                      </span>
                    </div>
                    <div className="font-bold text-white">{brand}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-400">{modelObj?.name}</div>
                      <div className="text-[10px] text-slate-500 italic">({modelObj?.color})</div>
                    </div>
                    <div className="mt-3 text-lg font-black text-indigo-400">{acc.sellingPrice.toFixed(2)} MT</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm sticky top-4 transition-all ${!selectedAcc ? 'opacity-50' : ''}`}>
            <h3 className="font-bold text-white flex items-center gap-2 mb-6">
              <ShoppingBag size={18} className="text-indigo-400" />
              Resumo da Venda
            </h3>

            {!selectedAcc ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={32} className="text-slate-700" />
                </div>
                <p className="text-sm">Selecione um produto para continuar</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Produto</div>
                  <div className="font-bold text-white">
                    {selectedAcc.type} - {state.brands.find(b => b.id === selectedAcc.brandId)?.name} {state.models.find(m => m.id === selectedAcc.modelId)?.name}
                  </div>
                  <div className="text-xs text-slate-400">Cor: {state.models.find(m => m.id === selectedAcc.modelId)?.color}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-3">Quantidade</div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSaleQty(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"><Minus size={16} /></button>
                      <span className="text-xl font-bold w-6 text-center text-white">{saleQty}</span>
                      <button onClick={() => setSaleQty(prev => Math.min(selectedAcc.quantity, prev + 1))} className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400"><Plus size={16} /></button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-3">Preço Unit. (MT)</div>
                    <input 
                      type="number" 
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    />
                    <div className="text-[10px] text-slate-500 mt-1">Padrão: {selectedAcc.sellingPrice.toFixed(2)}</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-bold">Total Final</span>
                    <span className="text-2xl font-black text-indigo-400">{(customPrice * saleQty).toFixed(2)} MT</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-400 font-bold bg-emerald-900/30 p-2 rounded-lg">
                    <span>LUCRO ESTIMADO</span>
                    <span>{((customPrice - selectedAcc.purchasePrice) * saleQty).toFixed(2)} MT</span>
                  </div>
                </div>

                <button onClick={() => setIsConfirming(true)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 active:scale-95 transition-all">Confirmar Venda</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isConfirming && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-8 text-center space-y-6 border border-slate-800">
            <div className="w-20 h-20 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-400"><Wallet size={40} /></div>
            <div>
              <h3 className="text-2xl font-bold text-white">Confirmar Pagamento?</h3>
              <p className="text-slate-400 mt-2">A venda de {saleQty} {selectedAcc.type} será registada.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl space-y-2">
              <div className="text-sm text-slate-500 font-medium">TOTAL A RECEBER</div>
              <div className="text-4xl font-black text-white">{(customPrice * saleQty).toFixed(2)} MT</div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsConfirming(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-300">Voltar</button>
              <button onClick={handleSale} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg">Sim, Finalizar!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
