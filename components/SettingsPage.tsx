
import React, { useState } from 'react';
import { AppState, Brand, Model } from '../types';
import { Plus, Trash2, Smartphone, Tag, ShieldCheck, Database, Mail, Layers, Palette } from 'lucide-react';

interface SettingsPageProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ state, setState }) => {
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelColor, setNewModelColor] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedBrandForModel, setSelectedBrandForModel] = useState('');

  const DEVELOPER_EMAIL = 'cudacuashesamuelmalaicha126@gmail.com';

  const addBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const brand: Brand = { id: crypto.randomUUID(), name: newBrandName };
    setState(prev => ({ ...prev, brands: [...prev.brands, brand] }));
    setNewBrandName('');
  };

  const addModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim() || !selectedBrandForModel) return;
    const model: Model = { 
      id: crypto.randomUUID(), 
      brandId: selectedBrandForModel, 
      name: newModelName,
      color: newModelColor || 'N/A'
    };
    setState(prev => ({ ...prev, models: [...prev.models, model] }));
    setNewModelName('');
    setNewModelColor('');
  };

  const addAccessoryType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    if (state.accessoryTypes.includes(newTypeName.trim())) return;
    setState(prev => ({ ...prev, accessoryTypes: [...prev.accessoryTypes, newTypeName.trim()] }));
    setNewTypeName('');
  };

  const deleteBrand = (id: string) => {
    if (confirm('Atenção: Apagar uma marca pode afetar acessórios e modelos ligados. Continuar?')) {
      setState(prev => ({ 
        ...prev, 
        brands: prev.brands.filter(b => b.id !== id),
        models: prev.models.filter(m => m.brandId !== id)
      }));
    }
  };

  const deleteModel = (id: string) => {
    setState(prev => ({ ...prev, models: prev.models.filter(m => m.id !== id) }));
  };

  const deleteAccessoryType = (typeName: string) => {
    if (confirm(`Remover o tipo "${typeName}"? Acessórios existentes com este tipo não serão apagados, mas não poderá criar novos desse tipo.`)) {
      setState(prev => ({ ...prev, accessoryTypes: prev.accessoryTypes.filter(t => t !== typeName) }));
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `cudabiz_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const backupViaEmail = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const subject = encodeURIComponent(`CudaBiz Backup - ${new Date().toLocaleDateString('pt-PT')}`);
    const body = encodeURIComponent(`Segue abaixo os dados de backup do sistema CudaBiz:\n\n${dataStr}`);
    window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h2>
        <p className="text-slate-500">Configure marcas, modelos, tipos de produtos e gerencie seus dados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
        {/* Accessory Types Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900">Tipos de Acessório</h3>
          </div>
          
          <form onSubmit={addAccessoryType} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: Adaptador, Powerbank..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              <Plus size={20} />
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2">
            {state.accessoryTypes.map(type => (
              <div key={type} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg group">
                <span className="text-sm font-medium text-slate-700">{type}</span>
                <button onClick={() => deleteAccessoryType(type)} className="text-rose-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900">Gerir Marcas</h3>
          </div>
          
          <form onSubmit={addBrand} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: Xiaomi, Oppo..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              <Plus size={20} />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
            {state.brands.map(brand => (
              <div key={brand.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                <span className="text-sm font-medium text-slate-700">{brand.name}</span>
                <button onClick={() => deleteBrand(brand.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Models Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Smartphone size={20} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900">Gerir Modelos</h3>
          </div>
          
          <form onSubmit={addModel} className="space-y-3">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
              value={selectedBrandForModel}
              onChange={(e) => setSelectedBrandForModel(e.target.value)}
              required
            >
              <option value="">Selecionar Marca...</option>
              {state.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Nome do Modelo (Ex: S23, Pop 7...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <div className="flex-1 relative">
                   <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Cor (Ex: Preto, Azul...)"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newModelColor}
                    onChange={(e) => setNewModelColor(e.target.value)}
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold">
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </div>
          </form>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
            {state.models.map(model => {
              const brand = state.brands.find(b => b.id === model.brandId);
              return (
                <div key={model.id} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{brand?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{model.name}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium">{model.color}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteModel(model.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backup & System Info */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900">Backup e Segurança</h3>
              </div>
              <p className="text-sm text-slate-500">Exporte os dados localmente ou envie por email para o desenvolvedor como forma de backup de segurança.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={exportData}
                className="py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Database size={18} /> Exportar JSON
              </button>
              <button 
                onClick={backupViaEmail}
                className="py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={18} /> Backup via Email
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white flex flex-col justify-between">
             <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <h3 className="font-bold">Estado do Sistema CudaBiz</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Marcas Ativas</div>
                  <div className="text-2xl font-bold">{state.brands.length}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Modelos Reg.</div>
                  <div className="text-2xl font-bold">{state.models.length}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Transações</div>
                  <div className="text-2xl font-bold">{state.sales.length + state.entries.length}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Segurança</div>
                  <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded inline-block">ATIVADO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
