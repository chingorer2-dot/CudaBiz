
import { AppState } from './types';

const STORAGE_KEY = 'cudabiz_data';

const DEFAULT_STATE: AppState = {
  brands: [
    { id: 'b1', name: 'Samsung' },
    { id: 'b2', name: 'Apple' },
    { id: 'b3', name: 'Tecno' },
    { id: 'b4', name: 'Infinix' },
    { id: 'b5', name: 'Huawei' }
  ],
  models: [
    { id: 'm1', brandId: 'b1', name: 'Galaxy A10', color: 'Preto' },
    { id: 'm2', brandId: 'b1', name: 'Galaxy A51', color: 'Azul' },
    { id: 'm3', brandId: 'b2', name: 'iPhone 13', color: 'Branco' },
    { id: 'm4', brandId: 'b3', name: 'Spark 10', color: 'Dourado' }
  ],
  accessories: [],
  entries: [],
  sales: [],
  closures: [],
  accessoryTypes: ['Capa', 'Película', 'Carregador', 'Fone', 'Cabo', 'Outros']
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(saved);
    if (!parsed.accessoryTypes) parsed.accessoryTypes = DEFAULT_STATE.accessoryTypes;
    if (!parsed.closures) parsed.closures = [];
    // Ensure existing models have a color property
    if (parsed.models) {
      parsed.models = parsed.models.map((m: any) => ({
        ...m,
        color: m.color || 'N/A'
      }));
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
};
