import { create } from 'zustand';
import type {
  Structure,
  Cost,
  Revenue,
  ProjectTask,
  Partner,
  Supplier,
  Invoice,
  SupplierInvoice
} from '@shared/types';
interface DirectorStore {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  // Data
  structures: Structure[];
  costs: Cost[];
  revenues: Revenue[];
  tasks: ProjectTask[];
  partners: Partner[];
  suppliers: Supplier[];
  invoices: Invoice[];
  supplierInvoices: SupplierInvoice[];
  loading: boolean;
  error: string | null;
  // Actions
  setStructures: (structures: Structure[]) => void;
  setCosts: (costs: Cost[]) => void;
  setRevenues: (revenues: Revenue[]) => void;
  setTasks: (tasks: ProjectTask[]) => void;
  setPartners: (partners: Partner[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setSupplierInvoices: (supplierInvoices: SupplierInvoice[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // API Call helper
  fetchAllData: () => Promise<void>;
}
const saveLocalBackup = (key: string, data: any) => {
  try {
    localStorage.setItem(`tskb_backup_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save local backup for ${key}:`, e);
  }
};
const getLocalBackup = (key: string) => {
  try {
    const item = localStorage.getItem(`tskb_backup_${key}`);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn(`Failed to read local backup for ${key}:`, e);
    return null;
  }
};
export const useDirectorStore = create<DirectorStore>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  globalSearch: '',
  setGlobalSearch: (search) => set({ globalSearch: search }),
  structures: [],
  costs: [],
  revenues: [],
  tasks: [],
  partners: [],
  suppliers: [],
  invoices: [],
  supplierInvoices: [],
  loading: true,
  error: null,
  setStructures: (structures) => {
    set({ structures });
    saveLocalBackup('structures', structures);
  },
  setCosts: (costs) => {
    set({ costs });
    saveLocalBackup('costs', costs);
  },
  setRevenues: (revenues) => {
    set({ revenues });
    saveLocalBackup('revenues', revenues);
  },
  setTasks: (tasks) => {
    set({ tasks });
    saveLocalBackup('tasks', tasks);
  },
  setPartners: (partners) => {
    set({ partners });
    saveLocalBackup('partners', partners);
  },
  setSuppliers: (suppliers) => {
    set({ suppliers });
    saveLocalBackup('suppliers', suppliers);
  },
  setInvoices: (invoices) => {
    set({ invoices });
    saveLocalBackup('invoices', invoices);
  },
  setSupplierInvoices: (supplierInvoices) => {
    set({ supplierInvoices });
    saveLocalBackup('supplier-invoices', supplierInvoices);
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  fetchAllData: async () => {
    set({ loading: true });
    const maxRetries = 2;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    let lastError: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/all-data');
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          // Assegno simultaneamente tutti gli asset dello store con errore pulito
          set({
            structures: d.structures ?? [],
            costs: d.costs ?? [],
            revenues: d.revenues ?? [],
            tasks: d.tasks ?? [],
            partners: d.partners ?? [],
            suppliers: d.suppliers ?? [],
            invoices: d.invoices ?? [],
            supplierInvoices: d.supplierInvoices ?? [],
            error: null, // Azzeramento esplicito dell'errore
            loading: false
          });
          // Salvo tutti i backup locali in localStorage
          saveLocalBackup('structures', d.structures ?? []);
          saveLocalBackup('costs', d.costs ?? []);
          saveLocalBackup('revenues', d.revenues ?? []);
          saveLocalBackup('tasks', d.tasks ?? []);
          saveLocalBackup('partners', d.partners ?? []);
          saveLocalBackup('suppliers', d.suppliers ?? []);
          saveLocalBackup('invoices', d.invoices ?? []);
          saveLocalBackup('supplier-invoices', d.supplierInvoices ?? []);
          return; // Ritorno anticipato in caso di successo
        } else {
          throw new Error(json.error || 'Unknown response format');
        }
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          console.warn(`[API Quiet Retry] Attempt ${attempt + 1} failed. Retrying in 800ms...`);
          await delay(800);
        }
      }
    }
    console.warn('Network API failure after retries, loading local cache backups:', lastError);
    // Fallback simultaneo e controllato dei dati in locale
    set({
      structures: getLocalBackup('structures') ?? [],
      costs: getLocalBackup('costs') ?? [],
      revenues: getLocalBackup('revenues') ?? [],
      tasks: getLocalBackup('tasks') ?? [],
      partners: getLocalBackup('partners') ?? [],
      suppliers: getLocalBackup('suppliers') ?? [],
      invoices: getLocalBackup('invoices') ?? [],
      supplierInvoices: getLocalBackup('supplier-invoices') ?? [],
      error: 'Impossibile connettersi al server. Caricamento dei dati di backup locali offline.',
      loading: false
    });
  }
}));