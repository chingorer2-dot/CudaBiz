
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, Accessory, StockEntry } from '../types';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ArrowUpCircle, Info, Pencil } from 'lucide-react';

interface StockManagementProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const StockManagement: React.FC<StockManagementProps> = ({ state, setState }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | 'Todos'>('Todos');
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  const [newAcc, setNewAcc] = useState({
    type: '',
    brandId: '',
    modelId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    initialQuantity: 0,
    lowStockThreshold: 3
  });

  const [editAcc, setEditAcc] = useState<Accessory | null>(null);

  useEffect(() => {
    if (state.accessoryTypes.length > 0 && !newAcc.type) {
      setNewAcc(prev => ({ ...prev, type: state.accessoryTypes[0] }));
    }
  }, [state.accessoryTypes]);

  const [entryQty, setEntryQty] = useState(0);
  const [entryCost, setEntryCost] = useState(0);

  const filteredAccessories = useMemo(() => {
    return state.accessories.filter(acc => {
      const brand = state.brands.find(b => b.id === acc.brandId)?.name.toLowerCase() || '';
      const model = state.models.find(m => m.id === acc.modelId)?.name.toLowerCase() || '';
      const matchesSearch = `${acc.type} ${brand} ${model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || acc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [state.accessories, state.brands, state.models, searchTerm, filterType]);

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.brandId || !newAcc.modelId || !newAcc.type) return;

    const accessory: Accessory = {
      id: crypto.randomUUID(),
      type: newAcc.type,
      brandId: newAcc.brandId,
      modelId: newAcc.modelId,
      purchasePrice: newAcc.purchasePrice,
      sellingPrice: newAcc.sellingPrice,
      quantity: newAcc.initialQuantity,
      lowStockThreshold: newAcc.lowStockThreshold
    };

    setState(prev => ({
      ...prev,
      accessories: [...prev.accessories, accessory]
    }));
    setIsAddModalOpen(false);
    setNewAcc({
      type: state.accessoryTypes[0] || '',
      brandId: '',
      modelId: '',
      purchasePrice: 0,
      sellingPrice: 0,
      initialQuantity: 0,
      lowStockThreshold: 3
    });
  };

  const handleEditAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAcc) return;

    setState(prev => ({
      ...prev,
      accessories: prev.accessories.map(acc => acc.id === editAcc.id ? editAcc : acc)
    }));
    setIsEditModalOpen(false);
    setEditAcc(null);
  };

  const handleStockEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccessory || entryQty <= 0) return;

    const entry: StockEntry = {
      id: crypto.randomUUID(),
      accessoryId: selectedAccessory.id,
      quantity: entryQty,
      cost: entryCost || selectedAccessory.purchasePrice * entryQty,
      date: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      entries: [...prev.entries, entry],
      accessories: prev.accessories.map(acc => 
        acc.id === selectedAccessory.id 
          ? { ...acc, quantity: acc.quantity + entryQty } 
          : acc
      )
    }));

    setIsEntryModalOpen(false);
    setSelectedAccessory(null);
    setEntryQty(0);
    setEntryCost(0);
  };

  const deleteAccessory = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este item?')) {
      setState(prev => ({
        ...prev,
        accessories: prev.accessories.filter(a => a.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventário de Stock</h2>
          <p className="text-slate-400">Gerencie seus acessórios e níveis de stock.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-900/20 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Novo Acessório
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por marca, modelo ou tipo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-500" />
          <select 
            className="flex-1 md:flex-none bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 focus:outline-none text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Todos">Todos os Tipos</option>
            {state.accessoryTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acessório</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Marca/Modelo/Cor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preço (C/V)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAccessories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum acessório encontrado.
                  </td>
                </tr>
              ) : (
                filteredAccessories.map((acc) => {
                  const brandName = state.brands.find(b => b.id === acc.brandId)?.name || 'N/A';
                  const modelObj = state.models.find(m => m.id === acc.modelId);
                  const modelName = modelObj?.name || 'N/A';
                  const modelColor = modelObj?.color || 'N/A';
                  const isLow = acc.quantity <= acc.lowStockThreshold;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/30 text-indigo-400">
                          {acc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{brandName}</div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400">{modelName}</span>
                           <span className="text-[10px] text-slate-500 bg-slate-800 px-1 rounded border border-slate-700">{modelColor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500">C: {acc.purchasePrice.toFixed(2)}</div>
                        <div className="text-sm font-bold text-emerald-400">V: {acc.sellingPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        {acc.quantity}
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-900/30 text-rose-400 border border-rose-900/50">
                            Stock Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedAccessory(acc);
                              setIsEntryModalOpen(true);
                            }}
                            className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Entrada de Stock"
                          >
                            <ArrowUpCircle size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setEditAcc(acc);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-amber-400 hover:bg-amber-900/30 rounded-lg transition-colors"
                            title="Editar Preços"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteAccessory(acc.id)}
                            className="p-2 text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Accessory Modal */}
      {isEditModalOpen && editAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Editar Acessório</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-slate-300"><Plus className="rotate-45" size={24} /></button>
            </div>
            <form onSubmit={handleEditAccessory} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="p-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-500 uppercase">
                    {editAcc.type} - {state.brands.find(b => b.id === editAcc.brandId)?.name} {state.models.find(m => m.id === editAcc.modelId)?.name} ({state.models.find(m => m.id === editAcc.modelId)?.color})
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Compra</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editAcc.purchasePrice}
                    onChange={(e) => setEditAcc({...editAcc, purchasePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Venda Padrão</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editAcc.sellingPrice}
                    onChange={(e) => setEditAcc({...editAcc, sellingPrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alerta Stock Baixo</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editAcc.lowStockThreshold}
                    onChange={(e) => setEditAcc({...editAcc, lowStockThreshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 bg-slate-800 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition-colors">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Accessory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Adicionar Novo Acessório</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-300"><Plus className="rotate-45" size={24} /></button>
            </div>
            <form onSubmit={handleAddAccessory} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.type}
                    onChange={(e) => setNewAcc({...newAcc, type: e.target.value})}
                  >
                    {state.accessoryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.brandId}
                    onChange={(e) => setNewAcc({...newAcc, brandId: e.target.value, modelId: ''})}
                    required
                  >
                    <option value="">Selecionar...</option>
                    {state.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modelo (com Cor)</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.modelId}
                    onChange={(e) => setNewAcc({...newAcc, modelId: e.target.value})}
                    disabled={!newAcc.brandId}
                    required
                  >
                    <option value="">{newAcc.brandId ? 'Selecionar...' : 'Primeiro selecione a marca'}</option>
                    {state.models.filter(m => m.brandId === newAcc.brandId).map(m => (
                      <option key={m.id} value={m.id}>{m.name} - {m.color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Compra</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.purchasePrice}
                    onChange={(e) => setNewAcc({...newAcc, purchasePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Venda</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.sellingPrice}
                    onChange={(e) => setNewAcc({...newAcc, sellingPrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qtd Inicial</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.initialQuantity}
                    onChange={(e) => setNewAcc({...newAcc, initialQuantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alerta Stock</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAcc.lowStockThreshold}
                    onChange={(e) => setNewAcc({...newAcc, lowStockThreshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 bg-slate-800 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition-colors">Guardar Acessório</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {isEntryModalOpen && selectedAccessory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Entrada de Stock</h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedAccessory.type} - {state.brands.find(b => b.id === selectedAccessory.brandId)?.name} {state.models.find(m => m.id === selectedAccessory.modelId)?.name} ({state.models.find(m => m.id === selectedAccessory.modelId)?.color})
              </p>
            </div>
            <form onSubmit={handleStockEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade Adicional</label>
                <input 
                  type="number" min="1" required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                  value={entryQty}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value);
                    setEntryQty(qty);
                    setEntryCost(qty * selectedAccessory.purchasePrice);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Total (MT)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={entryCost}
                  onChange={(e) => setEntryCost(parseFloat(e.target.value))}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEntryModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 bg-slate-800 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition-colors">Registar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
