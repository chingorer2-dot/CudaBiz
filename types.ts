
export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  color: string;
}

export interface Accessory {
  id: string;
  type: string;
  brandId: string;
  modelId: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
}

export interface StockEntry {
  id: string;
  accessoryId: string;
  quantity: number;
  cost: number;
  date: string;
}

export interface Sale {
  id: string;
  accessoryId: string;
  quantity: number;
  unitPrice: number; // The actual price it was sold for (allows discounts)
  totalPrice: number;
  profit: number;
  date: string;
  stockBefore: number; // Snapshot of stock before the sale
  stockAfter: number;  // Snapshot of stock after the sale
}

export interface DailyClosure {
  id: string;
  date: string;
  totalSales: number;
  totalProfit: number;
  itemsSold: number;
  closedAt: string;
}

export interface AppState {
  brands: Brand[];
  models: Model[];
  accessories: Accessory[];
  entries: StockEntry[];
  sales: Sale[];
  closures: DailyClosure[];
  accessoryTypes: string[];
}
