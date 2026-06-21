import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  PiggyBank,
  TrendingUp,
  Bike,
  Briefcase,
  ShieldAlert,
  Download,
  PlusCircle,
  Trash2,
  ChevronRight,
  Plus,
  FileText,
  RefreshCw,
  Wallet,
  Handshake,
  CheckCircle,
  Clock,
  Edit3,
  X,
  TrendingDown
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import canvasConfetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useDirectorStore } from '@/store/useDirectorStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import type {
  Structure as Attivita,
  Cost,
  Revenue,
  ProjectTask,
  Invoice,
  Supplier,
  SupplierInvoice,
  BikeFriendlyFeatures
} from '@shared/types';
const PLAN_PRICES: Record<string, number> = {
  "NEGOZIO BICI / NOLEGGIO (179€)": 179,
  "BAR (99€)": 99,
  "RISTORANTE (99€)": 99,
  "CAMPING (99€)": 99,
  "OSTELLO (99€)": 99,
  "RIFUGIO (79€)": 79,
  "1 APPARTAMENTO (99€)": 99,
  "B&B/HOTEL 2/5 CAMERE (149€)": 149,
  "B&B/HOTEL DALLE 6 CAMERE (179€)": 179,
  "GUIDA IN BICI (99€)": 99,
  "NUTRIZIONISTA (99€)": 99,
  "BIOMECCANICO (99€)": 99,
  "Personalizzato": 0
};
const CATEGORY_OPTIONS = [
  "Hotel",
  "B&B",
  "Agriturismo",
  "Camping",
  "Ostello",
  "Appartamento",
  "Rifugio",
  "Bar",
  "Ristorante",
  "Negozio di bici",
  "Bike rent",
  "Nutrizionista",
  "Biomeccanico",
  "Guida in bici"
];
function getWeeklyPeriod(dateStr: string) {
  if (!dateStr) return { weekKey: 'unknown', label: 'In attesa' };
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { weekKey: 'unknown', label: 'In attesa' };
    }
    const tempDate = new Date(date.valueOf());
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const year = tempDate.getFullYear();
    const day = date.getDay();
    const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.getTime());
    monday.setDate(diffToMonday);
    const sunday = new Date(monday.getTime());
    sunday.setDate(monday.getDate() + 6);
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const startStr = `${monday.getDate()} ${months[monday.getMonth()]}`;
    const endStr = `${sunday.getDate()} ${months[sunday.getMonth()]}`;
    return {
      weekKey: `${year}-W${String(weekNo).padStart(2, '0')}`,
      label: `Settimana ${weekNo}: ${startStr} - ${endStr}`,
      year,
      weekNo
    };
  } catch (e) {
    return { weekKey: 'unknown', label: 'In attesa' };
  }
}
export function HomePage() {
  const activeTab = useDirectorStore((s) => s.activeTab);
  const setActiveTab = useDirectorStore((s) => s.setActiveTab);
  const globalSearch = useDirectorStore((s) => s.globalSearch);
  const setGlobalSearch = useDirectorStore((s) => s.setGlobalSearch);
  const structures = useDirectorStore((s) => s.structures);
  const setStructures = useDirectorStore((s) => s.setStructures);
  const costs = useDirectorStore((s) => s.costs);
  const setCosts = useDirectorStore((s) => s.setCosts);
  const revenues = useDirectorStore((s) => s.revenues);
  const setRevenues = useDirectorStore((s) => s.setRevenues);
  const tasks = useDirectorStore((s) => s.tasks);
  const setTasks = useDirectorStore((s) => s.setTasks);
  const partners = useDirectorStore((s) => s.partners);
  const suppliers = useDirectorStore((s) => s.suppliers);
  const setSuppliers = useDirectorStore((s) => s.setSuppliers);
  const invoices = useDirectorStore((s) => s.invoices);
  const setInvoices = useDirectorStore((s) => s.setInvoices);
  const supplierInvoices = useDirectorStore((s) => s.supplierInvoices);
  const setSupplierInvoices = useDirectorStore((s) => s.setSupplierInvoices);
  const error = useDirectorStore((s) => s.error);
  const loading = useDirectorStore((s) => s.loading);
  const fetchAllData = useDirectorStore((s) => s.fetchAllData);
  const [invoiceSubTab, setInvoiceSubTab] = useState<'client' | 'supplier'>('client');
  const [directorySubTab, setDirectorySubTab] = useState<'partners' | 'suppliers'>('partners');
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isNewStructureOpen, setIsNewStructureOpen] = useState(false);
  const [selectedFormCategories, setSelectedFormCategories] = useState<string[]>(["Hotel"]);
  const [isNewCostOpen, setIsNewCostOpen] = useState(false);
  const [isNewRevenueOpen, setIsNewRevenueOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isNewPassiveInvoiceOpen, setIsNewPassiveInvoiceOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [selectedPlanForNew, setSelectedPlanForNew] = useState<string>("B&B/HOTEL 2/5 CAMERE (149€)");
  const [amountPaidForNew, setAmountPaidForNew] = useState<number>(149);
  const [affiliatedFromForNew, setAffiliatedFromForNew] = useState<string>("call center");
  const [isEditStructureOpen, setIsEditStructureOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Attivita | null>(null);
  const [editFormCategories, setEditFormCategories] = useState<string[]>([]);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<string>("");
  const [amountPaidForEdit, setAmountPaidForEdit] = useState<number>(0);
  const [affiliatedFromForEdit, setAffiliatedFromForEdit] = useState<string>("call center");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvRawRows, setCsvRawRows] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    phone: '',
    email: '',
    category: '',
    city: '',
    plan: '',
    amountPaid: '',
    affiliatedFrom: ''
  });
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  useEffect(() => {
    const fixedPrice = PLAN_PRICES[selectedPlanForNew];
    if (selectedPlanForNew !== "Personalizzato") {
      setAmountPaidForNew(fixedPrice);
    }
  }, [selectedPlanForNew]);
  useEffect(() => {
    if (selectedPlanForEdit && selectedPlanForEdit !== "Personalizzato") {
      const fixedPrice = PLAN_PRICES[selectedPlanForEdit];
      setAmountPaidForEdit(fixedPrice);
    }
  }, [selectedPlanForEdit]);
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  const weeklyAffiliationData = useMemo(() => {
    const weeklyMap: Record<string, {
      weekKey: string;
      label: string;
      year: number;
      weekNo: number;
      'call center': number;
      'call center AI': number;
      'webinar 1': number;
      'webinar 2': number;
      'webinar 3': number;
      'altro': number;
      total: number;
    }> = {};
    structures.forEach(s => {
      const dateStr = s.membershipDate || s.subscriptionStart || new Date().toISOString().split('T')[0];
      const { weekKey, label, year, weekNo } = getWeeklyPeriod(dateStr);
      if (weekKey === 'unknown') return;
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          weekKey,
          label,
          year: year || 2024,
          weekNo: weekNo || 1,
          'call center': 0,
          'call center AI': 0,
          'webinar 1': 0,
          'webinar 2': 0,
          'webinar 3': 0,
          'altro': 0,
          total: 0
        };
      }
      const channelRaw = (s.affiliatedFrom || 'call center').toLowerCase().trim();
      let matchedChannel: 'call center' | 'call center AI' | 'webinar 1' | 'webinar 2' | 'webinar 3' | 'altro' = 'altro';
      if (channelRaw === 'call center ai' || channelRaw === 'call center AI') {
        matchedChannel = 'call center AI';
      } else if (channelRaw === 'call center' || channelRaw === 'callcenter') {
        matchedChannel = 'call center';
      } else if (channelRaw === 'webinar 1') {
        matchedChannel = 'webinar 1';
      } else if (channelRaw === 'webinar 2') {
        matchedChannel = 'webinar 2';
      } else if (channelRaw === 'webinar 3') {
        matchedChannel = 'webinar 3';
      } else {
        matchedChannel = 'altro';
      }
      weeklyMap[weekKey][matchedChannel]++;
      weeklyMap[weekKey].total++;
    });
    return Object.values(weeklyMap).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  }, [structures]);
  const handleOpenEditPanel = (structure: Attivita) => {
    setEditingStructure(structure);
    setEditFormCategories(structure.categories || ["Hotel"]);
    setSelectedPlanForEdit(structure.plan || "B&B/HOTEL 2/5 CAMERE (149€)");
    setAmountPaidForEdit(structure.amountPaid || 0);
    setAffiliatedFromForEdit(structure.affiliatedFrom || "call center");
    setIsEditStructureOpen(true);
    toast.info(`Modalità modifica attivata per: ${structure.name}`);
  };
  const handleCreateStructure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFormCategories.length === 0) {
      toast.error("Seleziona almeno una categoria per l'Attività");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name') as string,
      categories: selectedFormCategories,
      referent: fd.get('referent') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      website: fd.get('website') as string,
      address: fd.get('address') as string,
      city: fd.get('city') as string,
      province: fd.get('province') as string,
      region: fd.get('region') as string,
      plan: selectedPlanForNew,
      amountPaid: Number(amountPaidForNew),
      paymentMethod: fd.get('paymentMethod') as string,
      paymentStatus: (fd.get('paymentStatus') as any) || 'paid',
      subscriptionStart: (fd.get('subscriptionStart') as string) || new Date().toISOString().split('T')[0],
      subscriptionEnd: (fd.get('subscriptionEnd') as string) || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      autoRenewal: fd.get('autoRenewal') === 'true',
      affiliatedFrom: affiliatedFromForNew
    };
    if (!payload.name) {
      toast.error("Nome attività obbligatorio");
      return;
    }
    try {
      const res = await fetch('/api/structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Attività creata correttamente nel circuito!");
        canvasConfetti();
        fetchAllData();
        setIsNewStructureOpen(false);
        setSelectedFormCategories(["Hotel"]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const fallbackId = `struct-${Date.now()}`;
      const fallbackObj: Attivita = {
        id: fallbackId,
        name: payload.name,
        categories: payload.categories,
        referent: payload.referent,
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        address: payload.address,
        city: payload.city,
        province: payload.province,
        region: payload.region,
        country: "Italia",
        membershipDate: new Date().toISOString().split('T')[0],
        plan: payload.plan,
        amountPaid: payload.amountPaid,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentStatus as any,
        subscriptionStart: payload.subscriptionStart,
        subscriptionEnd: payload.subscriptionEnd,
        autoRenewal: payload.autoRenewal,
        features: {
          secureStorage: true,
          coveredStorage: false,
          bikeInRoom: false,
          maintenanceWork: false,
          bikeWash: false,
          laundryWash: false,
          earlyBreakfast: false,
          luggageTransfer: false,
          bikeRental: false,
          ebikeFriendly: false,
          ebikeCharging: false,
          customFeatures: []
        },
        affiliatedFrom: payload.affiliatedFrom
      };
      setStructures([fallbackObj, ...structures]);
      toast.success("Attività registrata localmente (modalità offline)!");
      setIsNewStructureOpen(false);
      setSelectedFormCategories(["Hotel"]);
    }
  };
  const handleUpdateStructure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStructure) return;
    if (editFormCategories.length === 0) {
      toast.error("Seleziona almeno una categoria per la modifica");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name') as string,
      categories: editFormCategories,
      referent: fd.get('referent') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      website: fd.get('website') as string,
      address: fd.get('address') as string,
      city: fd.get('city') as string,
      province: fd.get('province') as string,
      region: fd.get('region') as string,
      plan: selectedPlanForEdit,
      amountPaid: Number(amountPaidForEdit),
      paymentMethod: fd.get('paymentMethod') as string,
      paymentStatus: fd.get('paymentStatus') as any,
      subscriptionStart: fd.get('subscriptionStart') as string,
      subscriptionEnd: fd.get('subscriptionEnd') as string,
      autoRenewal: fd.get('autoRenewal') === 'true',
      affiliatedFrom: affiliatedFromForEdit
    };
    try {
      const res = await fetch(`/api/structures/${editingStructure.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Attività aggiornata con successo nel database!");
        setIsEditStructureOpen(false);
        setEditingStructure(null);
        fetchAllData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const updatedList = structures.map(s => {
        if (s.id === editingStructure.id) {
          return {
            ...s,
            ...payload,
            features: s.features
          };
        }
        return s;
      });
      setStructures(updatedList);
      toast.success("Attività salvata localmente (Modifica Offline)!");
      setIsEditStructureOpen(false);
      setEditingStructure(null);
    }
  };
  const handleCreateCost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      description: fd.get('description') as string,
      category: fd.get('category') as string,
      amount: Number(fd.get('amount') || 0),
      paidBy: (fd.get('paidBy') as any) || 'Marco',
      date: (fd.get('date') as string) || new Date().toISOString().split('T')[0],
      notes: (fd.get('notes') as string) || ''
    };
    if (!payload.description || !payload.amount) {
      toast.error("Descrizione e Importo obbligatori");
      return;
    }
    try {
      const res = await fetch('/api/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Spesa inserita correttamente!");
        fetchAllData();
        setIsNewCostOpen(false);
      }
    } catch (err) {
      const fallbackObj: Cost = {
        id: `cost-${Date.now()}`,
        ...payload
      };
      setCosts([fallbackObj, ...costs]);
      toast.success("Spesa registrata localmente!");
      setIsNewCostOpen(false);
    }
  };
  const handleCreateRevenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      structureName: fd.get('structureName') as string,
      amount: Number(fd.get('amount') || 0),
      type: (fd.get('type') as string) || 'Abbonamento',
      date: (fd.get('date') as string) || new Date().toISOString().split('T')[0],
      notes: (fd.get('notes') as string) || ''
    };
    if (!payload.structureName || !payload.amount) {
      toast.error("Nome cliente/attività e Importo obbligatori");
      return;
    }
    try {
      const res = await fetch('/api/revenues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ricavo registrato correttamente!");
        fetchAllData();
        setIsNewRevenueOpen(false);
      }
    } catch (err) {
      const fallbackObj: Revenue = {
        id: `rev-${Date.now()}`,
        ...payload
      };
      setRevenues([fallbackObj, ...revenues]);
      toast.success("Ricavo registrato localmente!");
      setIsNewRevenueOpen(false);
    }
  };
  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: (fd.get('title') as string) || '',
      description: (fd.get('description') as string) || '',
      area: (fd.get('area') as any) || 'Gestionale',
      priority: (fd.get('priority') as any) || 'Media',
      manager: (fd.get('manager') as string) || 'Admin',
      status: (fd.get('status') as any) || 'Da fare',
      startDate: (fd.get('startDate') as string) || new Date().toISOString().split('T')[0],
      expectedEndDate: (fd.get('expectedEndDate') as string) || '',
      completionPercent: Number(fd.get('completionPercent') || 0)
    };
    if (!payload.title.trim()) {
      toast.error("Il titolo dell'attività è obbligatorio");
      return;
    }
    if (payload.completionPercent < 0 || payload.completionPercent > 100) {
      toast.error("La percentuale di completamento deve essere un numero compreso tra 0 e 100");
      return;
    }
    if (payload.startDate && payload.expectedEndDate) {
      const start = new Date(payload.startDate);
      const end = new Date(payload.expectedEndDate);
      if (end.getTime() < start.getTime()) {
        toast.error("La data di fine prevista non può essere antecedente alla data di inizio");
        return;
      }
    }
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        toast.success("Attività aggiunta correttamente alla roadmap!");
        setTasks([...tasks, data.data]);
        setIsNewTaskOpen(false);
        fetchAllData();
      } else {
        throw new Error(data.error || "Impossibile salvare l'attività");
      }
    } catch (err) {
      const fallbackObj: ProjectTask = {
        id: `task-${Date.now()}`,
        ...payload
      };
      setTasks([...tasks, fallbackObj]);
      toast.success("Attività registrata localmente offline!");
      setIsNewTaskOpen(false);
    }
  };
  const handleUpdateTaskStatus = async (taskId: string, nextStatus: ProjectTask['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, completionPercent: nextStatus === 'Completato' ? 100 : undefined })
      });
      if (res.ok) {
        fetchAllData();
        toast.success(`Stato aggiornato a ${nextStatus}`);
      }
    } catch (err) {
      const updated = tasks.map(t => t.id === taskId ? { ...t, status: nextStatus, completionPercent: nextStatus === 'Completato' ? 100 : t.completionPercent } : t);
      setTasks(updated);
      toast.success(`Stato aggiornato localmente`);
    }
  };
  const handleToggleFeature = async (structureId: string, featureKey: keyof BikeFriendlyFeatures) => {
    const s = structures.find(x => x.id === structureId);
    if (!s) return;
    const currentVal = s.features[featureKey];
    if (typeof currentVal !== 'boolean') return;
    const updatedFeatures = {
      ...s.features,
      [featureKey]: !currentVal
    };
    try {
      const res = await fetch(`/api/structures/${structureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: updatedFeatures })
      });
      if (res.ok) {
        setStructures(structures.map(item => item.id === structureId ? { ...item, features: updatedFeatures } : item));
        toast.success("Caratteristica aggiornata!");
      }
    } catch (err) {
      const updated = structures.map(item => item.id === structureId ? { ...item, features: updatedFeatures } : item);
      setStructures(updated);
      toast.success("Caratteristica modificata localmente");
    }
  };
  const handleAddCustomFeature = async (structureId: string, featureText: string) => {
    if (!featureText.trim()) return;
    const s = structures.find(x => x.id === structureId);
    if (!s) return;
    const updatedFeatures = {
      ...s.features,
      customFeatures: [...(s.features.customFeatures || []), featureText.trim()]
    };
    try {
      const res = await fetch(`/api/structures/${structureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: updatedFeatures })
      });
      if (res.ok) {
        setStructures(structures.map(item => item.id === structureId ? { ...item, features: updatedFeatures } : item));
        toast.success("Caratteristica personalizzata aggiunta!");
      }
    } catch (err) {
      const updated = structures.map(item => item.id === structureId ? { ...item, features: updatedFeatures } : item);
      setStructures(updated);
      toast.success("Caratteristica personalizzata aggiunta localmente");
    }
  };
  const handleDeleteStructure = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questa attività?")) return;
    if (selectedStructureId === id) {
      setSelectedStructureId(null);
    }
    const updated = structures.filter(s => s.id !== id);
    setStructures(updated);
    toast.success("Attività eliminata permanentemente e istantaneamente dallo stato locale!");
    fetch(`/api/structures/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          toast.success("Cancellazione confermata con successo sul server!");
        } else {
          toast.error("Avviso: Errore di sincronizzazione sul server per la cancellazione.");
        }
        fetchAllData();
      })
      .catch(err => {
        console.error("Errore server in cancellazione:", err);
        toast.error("Impossibile contattare il server. Modifiche conservate offline.");
        fetchAllData();
      });
  };
  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      clientName: fd.get('clientName') as string,
      amount: Number(fd.get('amount') || 0),
      description: (fd.get('description') as string) || 'Abbonamento TSKBikeHub',
      date: (fd.get('date') as string) || new Date().toISOString().split('T')[0],
      status: (fd.get('status') as any) || 'pending'
    };
    if (!payload.clientName || !payload.amount) {
      toast.error("Nome cliente e Importo sono obbligatori");
      return;
    }
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Fattura generata correttamente!");
        fetchAllData();
        setIsNewInvoiceOpen(false);
      }
    } catch (err) {
      const fallbackObj: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `FAT-2024-${Math.floor(Math.random() * 900 + 100)}`,
        ...payload
      };
      setInvoices([fallbackObj, ...invoices]);
      toast.success("Fattura generata localmente!");
      setIsNewInvoiceOpen(false);
    }
  };
  const handleCreateSupplierInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const suppId = fd.get('supplierId') as string;
    const selectedSupp = suppliers.find(s => s.id === suppId);
    const payload = {
      supplierId: suppId,
      supplierName: selectedSupp ? selectedSupp.name : (fd.get('supplierNameCustom') as string || 'Generico'),
      invoiceNumber: fd.get('invoiceNumber') as string || `PASS-${Math.floor(Math.random() * 90000 + 10000)}`,
      date: fd.get('date') as string || new Date().toISOString().split('T')[0],
      amount: Number(fd.get('amount') || 0),
      description: fd.get('description') as string || 'Servizio passivo',
      paymentStatus: fd.get('paymentStatus') as any || 'pending',
      paidBy: fd.get('paidBy') as any || 'Marco'
    };
    if (!payload.supplierName || !payload.amount) {
      toast.error("Fornitore e Importo sono obbligatori");
      return;
    }
    try {
      const res = await fetch('/api/supplier-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Fattura passiva salvata correttamente!");
        fetchAllData();
        setIsNewPassiveInvoiceOpen(false);
      }
    } catch (err) {
      const fallbackObj: SupplierInvoice = {
        id: `pass-${Date.now()}`,
        ...payload
      };
      setSupplierInvoices([fallbackObj, ...supplierInvoices]);
      if (payload.paymentStatus === 'paid') {
        const autoCost: Cost = {
          id: `cost-auto-${Date.now()}`,
          date: payload.date,
          description: `[Auto-Bill Pay] ${payload.supplierName}: ${payload.description}`,
          category: "Software",
          amount: payload.amount,
          paidBy: payload.paidBy,
          supplierId: payload.supplierId,
          supplierName: payload.supplierName,
          notes: `Fattura passiva: ${payload.invoiceNumber}`
        };
        setCosts([autoCost, ...costs]);
      }
      toast.success("Fattura passiva salvata localmente!");
      setIsNewPassiveInvoiceOpen(false);
    }
  };
  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name') as string,
      category: fd.get('category') as string,
      referent: fd.get('referent') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      website: fd.get('website') as string,
      monthlyCost: Number(fd.get('monthlyCost') || 0),
      annualCost: Number(fd.get('annualCost') || 0),
      notes: fd.get('notes') as string || ''
    };
    if (!payload.name) {
      toast.error("Nome fornitore obbligatorio");
      return;
    }
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Nuovo Fornitore Registrato!");
        fetchAllData();
        setIsNewSupplierOpen(false);
      }
    } catch (err) {
      const fallbackObj: Supplier = {
        id: `vendor-${Date.now()}`,
        ...payload
      };
      setSuppliers([fallbackObj, ...suppliers]);
      toast.success("Fornitore salvato localmente!");
      setIsNewSupplierOpen(false);
    }
  };
  const handlePaySupplierInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/supplier-invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });
      if (res.ok) {
        toast.success("Fattura passiva saldata! Costo inserito nel ledger.");
        fetchAllData();
      }
    } catch (err) {
      const updatedList = supplierInvoices.map(s => {
        if (s.id === invoiceId) {
          const pays: SupplierInvoice = { ...s, paymentStatus: 'paid' };
          const autoCost: Cost = {
            id: `cost-auto-${Date.now()}`,
            date: pays.date,
            description: `[Auto-Bill Pay] ${pays.supplierName}: ${pays.description}`,
            category: "Software",
            amount: pays.amount,
            paidBy: pays.paidBy,
            supplierId: pays.supplierId,
            supplierName: pays.supplierName,
            notes: `Fattura passiva: ${pays.invoiceNumber}`
          };
          setCosts([autoCost, ...costs]);
          return pays;
        }
        return s;
      });
      setSupplierInvoices(updatedList);
      toast.success("Fattura pagata localmente.");
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const cleanText = text.replace(/\r/g, '');
      const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semiCount = (firstLine.match(/;/g) || []).length;
        const delimiter = semiCount > commaCount ? ';' : ',';
        const parseLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };
        const headers = parseLine(lines[0]);
        setCsvHeaders(headers);
        const intelligentMapping: Record<string, string> = {
          name: headers.find(h => h.toLowerCase().includes('nome') || h.toLowerCase().includes('attività') || h.toLowerCase().includes('struttura') || h.toLowerCase().includes('name')) || '',
          phone: headers.find(h => h.toLowerCase().includes('tel') || h.toLowerCase().includes('telefono') || h.toLowerCase().includes('phone')) || '',
          email: headers.find(h => h.toLowerCase().includes('mail') || h.toLowerCase().includes('email')) || '',
          category: headers.find(h => h.toLowerCase().includes('cat') || h.toLowerCase().includes('tipo') || h.toLowerCase().includes('categorie')) || '',
          city: headers.find(h => h.toLowerCase().includes('citt') || h.toLowerCase().includes('city') || h.toLowerCase().includes('comune')) || '',
          plan: headers.find(h => h.toLowerCase().includes('piano') || h.toLowerCase().includes('plan')) || '',
          amountPaid: headers.find(h => h.toLowerCase().includes('importo') || h.toLowerCase().includes('pagat') || h.toLowerCase().includes('amount')) || '',
          affiliatedFrom: headers.find(h => h.toLowerCase().includes('affilia') || h.toLowerCase().includes('provenien') || h.toLowerCase().includes('origin')) || ''
        };
        setColumnMapping(intelligentMapping);
        const rows = lines.slice(1).map(rowStr => {
          const cols = parseLine(rowStr);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = cols[i] || '';
          });
          return obj;
        });
        setCsvRawRows(rows);
        toast.info(`Letto file con ${rows.length} righe (Separatore rilevato: "${delimiter}").`);
      }
    };
    reader.readAsText(file);
  };
  useEffect(() => {
    if (csvRawRows.length === 0) return;
    const mapped = csvRawRows.map((rawRow, index) => {
      const rawCategoryString = rawRow[columnMapping.category] || 'Hotel';
      const parsedCategories = rawCategoryString.split(/[;,]/).map((c: string) => c.trim()).filter(Boolean);
      const mappedRow: any = {
        name: rawRow[columnMapping.name] || `Attività Importata ${index + 1}`,
        phone: rawRow[columnMapping.phone] || '',
        email: rawRow[columnMapping.email] || '',
        categories: parsedCategories.length > 0 ? parsedCategories : ['Hotel'],
        city: rawRow[columnMapping.city] || 'Da Definire',
        plan: rawRow[columnMapping.plan] || 'NEGOZIO BICI / NOLEGGIO (179€)',
        amountPaid: Number(rawRow[columnMapping.amountPaid]) || 0,
        affiliatedFrom: rawRow[columnMapping.affiliatedFrom] || 'call center'
      };
      const isDup = structures.some(s =>
        s.name.toLowerCase() === mappedRow.name.toLowerCase() ||
        (mappedRow.phone && s.phone === mappedRow.phone) ||
        (mappedRow.email && s.email.toLowerCase() === mappedRow.email.toLowerCase())
      );
      mappedRow._isDuplicate = isDup;
      return mappedRow;
    });
    setImportPreview(mapped);
  }, [columnMapping, csvRawRows, structures]);
  const handleImportSubmit = async () => {
    if (importPreview.length === 0) {
      toast.error("Nessun dato da importare");
      return;
    }
    try {
      const res = await fetch('/api/import-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importPreview })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Importazione completata con successo! Aggiornate attività.`);
        canvasConfetti();
        setUploadFile(null);
        setCsvRawRows([]);
        setImportPreview([]);
        fetchAllData();
      } else {
        throw new Error(data.error || "Errore sconosciuto durante l'importazione sul server");
      }
    } catch (err: any) {
      const updatedStrList = [...structures];
      let localsAdded = 0;
      let localsUpdated = 0;
      importPreview.forEach(item => {
        const matchIdx = updatedStrList.findIndex(s =>
          s.name.toLowerCase() === item.name.toLowerCase() ||
          (item.phone && s.phone === item.phone) ||
          (item.email && s.email.toLowerCase() === item.email.toLowerCase())
        );
        if (matchIdx !== -1) {
          updatedStrList[matchIdx] = {
            ...updatedStrList[matchIdx],
            categories: item.categories,
            city: item.city,
            plan: item.plan,
            amountPaid: Number(item.amountPaid) || updatedStrList[matchIdx].amountPaid,
            affiliatedFrom: item.affiliatedFrom || updatedStrList[matchIdx].affiliatedFrom
          };
          localsUpdated++;
        } else {
          updatedStrList.push({
            id: `struct-imp-${Math.random()}`,
            name: item.name,
            categories: item.categories,
            referent: 'Importato da CRM',
            phone: item.phone,
            email: item.email,
            website: '',
            address: '',
            city: item.city,
            province: 'ND',
            region: 'ND',
            country: 'Italia',
            membershipDate: new Date().toISOString().split('T')[0],
            plan: item.plan,
            amountPaid: Number(item.amountPaid) || 0,
            paymentMethod: 'Bonifico',
            paymentStatus: 'paid',
            subscriptionStart: new Date().toISOString().split('T')[0],
            subscriptionEnd: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
            autoRenewal: true,
            features: {
              secureStorage: true,
              coveredStorage: false,
              bikeInRoom: false,
              maintenanceWork: false,
              bikeWash: false,
              laundryWash: false,
              earlyBreakfast: false,
              luggageTransfer: false,
              bikeRental: false,
              ebikeFriendly: false,
              ebikeCharging: false,
              customFeatures: []
            },
            affiliatedFrom: item.affiliatedFrom || 'call center'
          });
          localsAdded++;
        }
      });
      setStructures(updatedStrList);
      toast.success(`Importazione locale completata: ${localsAdded} aggiunte, ${localsUpdated} aggiornate.`);
      setUploadFile(null);
      setCsvRawRows([]);
      setImportPreview([]);
    }
  };
  const handleDownloadDemoCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Nome Attività;Telefono;Email;Categoria;Citta;Piano;Importo Pagato;Affiliazione Da\n"
      + "Sport Hotel Olimpia;+39 0461 777888;olimpia@sporthotel.it;\"Hotel; Ristorante\";Cavalese;NEGOZIO BICI / NOLEGGIO (179€);179;call center AI\n"
      + "Rifugio Alpe Bike;+39 0342 999111;alpe@bikerifugio.com;\"Rifugio; Bar\";Livigno;RIFUGIO (79€);79;webinar 2\n"
      + "Grand Hotel Stelvio;+39 0342 123456;info@hotelstelvio.it;Hotel;Bormio;B&B/HOTEL DALLE 6 CAMERE (179€);179;call center";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tsk_crm_leads_esempio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const stats = useMemo(() => {
    const totalMarco = costs.filter(c => c.paidBy === 'Marco').reduce((acc, curr) => acc + curr.amount, 0);
    const totalSocio = costs.filter(c => c.paidBy === 'Socio').reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = totalMarco + totalSocio;
    const structureRevenues = structures.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const manualRevenues = revenues.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalRev = structureRevenues + manualRevenues;
    const netBalance = totalRev - totalSpent;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyCost = costs
      .filter(c => c.date.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyRev = revenues
      .filter(r => r.date.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + curr.amount, 0) +
      structures
      .filter(s => s.membershipDate && s.membershipDate.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const activeStructures = structures.filter(s => s.paymentStatus === 'paid');
    const expiringSoon = structures.filter(s => {
      if (!s.subscriptionEnd) return false;
      const end = new Date(s.subscriptionEnd);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    });
    const alreadyExpired = structures.filter(s => {
      if (!s.subscriptionEnd) return false;
      const end = new Date(s.subscriptionEnd);
      return end.getTime() < now.getTime();
    });
    const unpaidSupplierBills = supplierInvoices.filter(si => si.paymentStatus !== 'paid');
    const unpaidSupplierBillsAmount = unpaidSupplierBills.reduce((acc, curr) => acc + curr.amount, 0);
    const paidSupplierBillsAmount = supplierInvoices.filter(si => si.paymentStatus === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalMarco,
      totalSocio,
      totalSpent,
      totalRev,
      netBalance,
      monthlyCost,
      monthlyRev,
      registeredStr: structures.length,
      activeStr: activeStructures.length,
      expiringStr: expiringSoon.length,
      expiredStr: alreadyExpired.length,
      unpaidSupplierBillsCount: unpaidSupplierBills.length,
      unpaidSupplierBillsAmount,
      paidSupplierBillsAmount
    };
  }, [structures, costs, revenues, supplierInvoices]);
  const alertsList = useMemo(() => {
    const list: { id: string; type: 'warning' | 'info' | 'danger'; title: string; desc: string; tabTarget: string }[] = [];
    structures.forEach(s => {
      if (!s.subscriptionEnd) return;
      const days = Math.ceil((new Date(s.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24));
      if (days > 0 && days <= 30) {
        list.push({
          id: `exp-${s.id}`,
          type: days <= 15 ? 'danger' : 'warning',
          title: `Scadenza imminente: ${s.name}`,
          desc: `Il piano "${s.plan}" scade tra ${days} giorni (${s.subscriptionEnd}). Rinnovo: ${s.autoRenewal ? 'SI' : 'NO'}.`,
          tabTarget: 'structures'
        });
      } else if (days <= 0) {
        list.push({
          id: `expd-${s.id}`,
          type: 'danger',
          title: `Abbonamento SCADUTO: ${s.name}`,
          desc: `La licenza per l'attività è terminata il ${s.subscriptionEnd}. Canone dovuto: ${s.amountPaid} €.`,
          tabTarget: 'structures'
        });
      }
    });
    tasks.forEach(t => {
      if (t.status !== 'Completato' && t.expectedEndDate) {
        const isOverdue = new Date(t.expectedEndDate).getTime() < Date.now();
        if (isOverdue) {
          list.push({
            id: `task-ov-${t.id}`,
            type: 'danger',
            title: `Ritardo roadmap: ${t.title}`,
            desc: `Attività gestita da ${t.manager} doveva essere completata entro il ${t.expectedEndDate}.`,
            tabTarget: 'roadmap'
          });
        }
      }
    });
    invoices.forEach(i => {
      if (i.status === 'pending') {
        list.push({
          id: `inv-ov-${i.id}`,
          type: 'warning',
          title: `Fattura attiva in attesa: ${i.invoiceNumber}`,
          desc: `Da incassare ${i.amount} € da ${i.clientName}.`,
          tabTarget: 'invoices'
        });
      }
    });
    supplierInvoices.forEach(si => {
      if (si.paymentStatus !== 'paid') {
        list.push({
          id: `si-pend-${si.id}`,
          type: 'warning',
          title: `Fattura PASSIVA da pagare: ${si.invoiceNumber}`,
          desc: `Da liquidare ${si.amount} € a ${si.supplierName} (Socio Assegnatario: ${si.paidBy}).`,
          tabTarget: 'invoices'
        });
      }
    });
    return list;
  }, [structures, tasks, invoices, supplierInvoices]);
  const filteredStructures = useMemo(() => {
    if (!globalSearch) return structures;
    const q = globalSearch.toLowerCase();
    return structures.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.referent.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.plan.toLowerCase().includes(q) ||
      s.categories.some(c => c.toLowerCase().includes(q))
    );
  }, [structures, globalSearch]);
  const selectedStructure = useMemo(() => {
    return structures.find(s => s.id === selectedStructureId) || null;
  }, [structures, selectedStructureId]);
  const expenseByCategoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    costs.forEach(c => {
      cats[c.category] = (cats[c.category] || 0) + c.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [costs]);
  const monthlyFinancialTrend = useMemo(() => {
    const trend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('it-IT', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2);
      const monthlySpent = costs.filter(c => c.date.startsWith(key)).reduce((a, b) => a + b.amount, 0);
      const monthlyReceived = revenues.filter(r => r.date.startsWith(key)).reduce((a, b) => a + b.amount, 0) +
        structures.filter(s => s.membershipDate && s.membershipDate.startsWith(key)).reduce((a, b) => a + (Number(b.amountPaid) || 0), 0);
      trend.push({
        name: label,
        Spese: monthlySpent,
        Ricavi: monthlyReceived,
        Margine: monthlyReceived - monthlySpent
      });
    }
    return trend;
  }, [costs, revenues, structures]);
  const COLORS = ['#F38020', '#0EA5E9', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
  const CHANNEL_COLORS = {
    'call center': '#F38020',
    'call center AI': '#8B5CF6',
    'webinar 1': '#0EA5E9',
    'webinar 2': '#10B981',
    'webinar 3': '#EC4899',
    'altro': '#64748B'
  };
  return (
    <AppLayout container={true} className="bg-[#0F172A] min-h-screen text-slate-100 font-sans">
      <div className="space-y-6">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#F38020] to-orange-600 h-10 w-10 rounded-xl flex items-center justify-center shadow-md">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TSKBikeHub <span className="text-[#F38020] font-mono text-xs px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">DIRECTOR COCKPIT</span>
              </h1>
              <p className="text-2xs text-slate-400">Pannello Direzionale & Controllo dei Listini e Piani Commerciali</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative max-w-xs flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cerca attività, referente, città..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-9 h-9 w-full md:w-[240px] bg-slate-850 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-lg text-xs focus:ring-orange-500 focus:border-[#F38020]"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAllData}
              className="h-9 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Sincronizza
            </Button>
            <ThemeToggle className="static" />
          </div>
        </header>
        {error && !isBannerDismissed && !error.toLowerCase().includes('websocket') && !error.toLowerCase().includes('hmr') && (
          <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-yellow-950/20 shadow-lg backdrop-blur-sm p-4 relative flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-in">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-200 text-sm">Problema di connessione API (Sincronizzazione Limitata)</h4>
                <p className="text-xs text-amber-300 mt-1">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  toast.promise(fetchAllData(), {
                    loading: 'Tentativo di riconnessione API in corso...',
                    success: 'Riconnessione riuscita! Stato sincronizzato.',
                    error: 'Impossibile ricollegarsi. Rimani in modalità offline.'
                  });
                }}
                className="h-8 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/30 text-xs flex items-center gap-1.5 font-medium"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Riprova Ora
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsBannerDismissed(true)}
                className="h-8 w-8 text-amber-400 hover:text-white hover:bg-amber-500/10 rounded-full shrink-0"
                title="Nascondi avviso"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {alertsList.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm">
            <div className="bg-red-500/10 px-4 py-2.5 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-200">Rinnovi & Allarmi Direzionali ({alertsList.length})</span>
              </div>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">LIVE FEED</span>
            </div>
            <div className="p-3 max-h-[160px] overflow-y-auto divide-y divide-red-500/10">
              {alertsList.map(a => (
                <div key={a.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/20 px-2 rounded transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${a.type === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div>
                      <p className="font-semibold text-slate-200">{a.title}</p>
                      <p className="text-slate-400 text-[11px]">{a.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (a.tabTarget === 'invoices') {
                        setInvoiceSubTab(a.id.startsWith('si-') ? 'supplier' : 'client');
                      }
                      setActiveTab(a.tabTarget);
                    }}
                    className="h-7 text-[#F38020] hover:bg-[#F38020]/10 hover:text-orange-400 text-2xs"
                  >
                    Controlla <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <TabsList className="bg-transparent flex flex-wrap gap-1 h-auto p-0">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="structures" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <Users className="h-3.5 w-3.5 mr-1.5" /> Attività Aderenti
              </TabsTrigger>
              <TabsTrigger value="ledger" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <PiggyBank className="h-3.5 w-3.5 mr-1.5" /> Registro Finanziario
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Roadmap Avanzamento
              </TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Importatore CRM
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-[#F38020] data-[state=active]:text-white text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Fatture & Partner
              </TabsTrigger>
            </TabsList>
            <div className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-center md:text-right">
              Bilancio Netto Progetto: <span className={`font-bold ${stats.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.netBalance.toLocaleString('it-IT')} €</span>
            </div>
          </div>
          <TabsContent value="dashboard" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Attività Circuito</p>
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#F38020]" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{stats.registeredStr}</span>
                    <span className="text-xs text-green-400 font-medium">Attive: {stats.activeStr}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Strutture/Attività bike-friendly verificate</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Costi Totali</p>
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-red-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-white">{stats.totalSpent.toLocaleString('it-IT')} €</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-2xs text-slate-400">
                    <span className="text-orange-400">Marco: {stats.totalMarco} €</span>
                    <span className="text-sky-400">Socio: {stats.totalSocio} €</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ricavi Totali</p>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <PiggyBank className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{stats.totalRev.toLocaleString('it-IT')} €</span>
                    <span className="text-2xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Mese: {stats.monthlyRev} €</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Canoni canali e quote abbonamenti</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Scadenze & Task</p>
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-amber-400">{alertsList.length}</span>
                    <span className="text-xs text-red-400 font-medium">Passive in attesa: {stats.unpaidSupplierBillsCount}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Azioni pianificate del mese corrente</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-800 lg:col-span-2 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Trend Finanziario Sincronizzato</CardTitle>
                  <CardDescription className="text-2xs">Ricalcolo integrato delle entrate reali comprese le quote dei listini attività</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyFinancialTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                        <Bar dataKey="Ricavi" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spese" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">Ripartizione Costi Categoria</CardTitle>
                  <CardDescription className="text-2xs font-mono">Spesa complessiva: {stats.totalSpent} €</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                  <div className="h-[200px] w-full relative">
                    {expenseByCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseByCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {expenseByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                        Nessuna spesa nel database
                      </div>
                    )}
                  </div>
                  <div className="w-full mt-2 grid grid-cols-2 gap-2 text-[10px]">
                    {expenseByCategoryData.slice(0, 4).map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-300 truncate max-w-[80px]">{entry.name}</span>
                        <span className="text-slate-400 font-bold ml-auto">{entry.value}€</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F38020] flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5" /> Analisi Affiliazioni Settimanali e Distribuzione Canali CRM
                </h3>
                <p className="text-2xs text-slate-400">Analisi direzionale del ritmo di iscrizioni sul circuito e dell'efficacia dei canali di marketing integrati.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 lg:col-span-2 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <CardHeader className="bg-slate-950 border-b border-slate-800 py-3">
                      <CardTitle className="text-xs font-bold text-slate-200 uppercase">Storico Affiliazioni di Periodo</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-3">Intervallo Settimanale</th>
                            <th className="p-3 text-center">Totale Nuove</th>
                            <th className="p-3 text-center text-[#F38020]">Call Center</th>
                            <th className="p-3 text-center text-[#8B5CF6]">Call Center AI</th>
                            <th className="p-3 text-center text-[#0EA5E9]">Webinar 1</th>
                            <th className="p-3 text-center text-[#10B981]">Webinar 2</th>
                            <th className="p-3 text-center text-[#EC4899]">Webinar 3</th>
                            <th className="p-3 text-center text-slate-400">Altro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {weeklyAffiliationData.length > 0 ? (
                            weeklyAffiliationData.map((week) => (
                              <tr key={week.weekKey} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-semibold text-slate-200">{week.label}</td>
                                <td className="p-3 text-center font-bold text-orange-400 bg-orange-500/5">{week.total}</td>
                                <td className="p-3 text-center font-mono">{week['call center'] || '-'}</td>
                                <td className="p-3 text-center font-mono">{week['call center AI'] || '-'}</td>
                                <td className="p-3 text-center font-mono">{week['webinar 1'] || '-'}</td>
                                <td className="p-3 text-center font-mono">{week['webinar 2'] || '-'}</td>
                                <td className="p-3 text-center font-mono">{week['webinar 3'] || '-'}</td>
                                <td className="p-3 text-center font-mono text-slate-400">{week['altro'] || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-500">
                                Nessun dato di affiliazione registrato. Carica o crea nuove strutture per avviare il calcolo settimanale.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 border-t border-slate-800/60 text-2xs text-slate-500 flex justify-between items-center">
                    <span>Valori generati in tempo reale dall'anagrafica</span>
                    <span className="font-mono text-[10px] text-orange-400">Totale Strutture Monitorate: {structures.length}</span>
                  </div>
                </Card>
                <Card className="bg-slate-900 border-slate-800 rounded-xl flex flex-col">
                  <CardHeader className="bg-slate-950 border-b border-slate-800 py-3">
                    <CardTitle className="text-xs font-bold text-slate-200 uppercase">Performance Canali CRM</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                    <div className="h-[240px] w-full">
                      {weeklyAffiliationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyAffiliationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="weekKey" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', fontSize: '11px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Bar dataKey="call center" stackId="a" fill={CHANNEL_COLORS['call center']} name="Call Center" />
                            <Bar dataKey="call center AI" stackId="a" fill={CHANNEL_COLORS['call center AI']} name="Call Center AI" />
                            <Bar dataKey="webinar 1" stackId="a" fill={CHANNEL_COLORS['webinar 1']} name="Webinar 1" />
                            <Bar dataKey="webinar 2" stackId="a" fill={CHANNEL_COLORS['webinar 2']} name="Webinar 2" />
                            <Bar dataKey="webinar 3" stackId="a" fill={CHANNEL_COLORS['webinar 3']} name="Webinar 3" />
                            <Bar dataKey="altro" stackId="a" fill={CHANNEL_COLORS['altro']} name="Altro" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          Nessun dato grafico disponibile
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                      Questo grafico a barre impilate rappresenta visivamente il volume totale di leads convertite ogni settimana sul circuito TSKBikeHub.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="structures" className="space-y-6 focus-visible:outline-none">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Anagrafica Attività Aderenti</h2>
                <p className="text-xs text-slate-400">Elenco completo con opzioni di affiliazione dedicate, tariffari sempre editabili ed editing anagrafico.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={() => setIsNewStructureOpen(true)} className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">
                  <Plus className="h-4 w-4 mr-1" /> Nuova Attività
                </Button>
              </div>
            </div>
            {isNewStructureOpen && (
              <Card className="bg-slate-900 border-[#F38020]/50 p-6 rounded-xl animate-scale-in">
                <CardHeader className="p-0 pb-4 border-b border-slate-800">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-[#F38020]" /> Registra Nuova Attività con Canale di Affiliazione
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateStructure} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Nome Attività *</label>
                    <Input
                      name="name"
                      placeholder="Es. Bike Hotel Rosalpina"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Referente / Gestore</label>
                    <Input
                      name="referent"
                      placeholder="Nome e cognome"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Telefono Contatto</label>
                    <Input
                      name="phone"
                      placeholder="+39 0461 123456"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                      Categorie dell'Attività * (Seleziona una o più opzioni)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {CATEGORY_OPTIONS.map((catName) => {
                        const isChecked = selectedFormCategories.includes(catName);
                        return (
                          <label
                            key={catName}
                            className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors text-[10px] font-medium border ${
                              isChecked
                                ? "bg-[#F38020]/20 text-[#F38020] border-[#F38020]/40"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedFormCategories(selectedFormCategories.filter(x => x !== catName));
                                } else {
                                  setSelectedFormCategories([...selectedFormCategories, catName]);
                                }
                              }}
                              className="accent-[#F38020]"
                            />
                            <span>{catName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Ufficiale</label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="info@attivita.it"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Sito Web URL</label>
                    <Input
                      name="website"
                      placeholder="www.bikerisorsa.it"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Comune / Città</label>
                    <Input
                      name="city"
                      placeholder="Es. Predazzo"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Provincia (Sigla)</label>
                    <Input
                      name="province"
                      placeholder="Es. TN"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Indirizzo Completo</label>
                    <Input
                      name="address"
                      placeholder="Via Roma 15"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Piano di Abbonamento TSKBikeHub *</label>
                    <select
                      value={selectedPlanForNew}
                      onChange={(e) => setSelectedPlanForNew(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      {Object.keys(PLAN_PRICES).map(planName => (
                        <option key={planName} value={planName}>{planName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Importo Pagato (€) * (Sempre Editabile)</label>
                    <Input
                      type="number"
                      value={amountPaidForNew}
                      onChange={(e) => setAmountPaidForNew(Number(e.target.value))}
                      placeholder="Importo piano"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium focus:border-[#F38020]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Puoi modificare liberamente il canone d'ingresso concordato per questa attività.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Affiliazione da *</label>
                    <select
                      value={affiliatedFromForNew}
                      onChange={(e) => setAffiliatedFromForNew(e.target.value)}
                      className="w-full bg-white border border-[#F38020]/40 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="call center">Call Center</option>
                      <option value="call center AI">Call Center AI</option>
                      <option value="webinar 1">Webinar 1</option>
                      <option value="webinar 2">Webinar 2</option>
                      <option value="webinar 3">Webinar 3</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Metodo Pagamento</label>
                    <Input
                      name="paymentMethod"
                      placeholder="Bonifico, Stripe, etc."
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Stato Abbonamento</label>
                    <select
                      name="paymentStatus"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="paid">Attivo (Pagato)</option>
                      <option value="pending">In attesa</option>
                      <option value="failed">Scaduto / Sospeso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Scadenza Abbonamento</label>
                    <Input
                      name="subscriptionEnd"
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <Button type="button" variant="ghost" onClick={() => { setIsNewStructureOpen(false); setSelectedFormCategories(["Hotel"]); }} className="text-xs h-9">Annulla</Button>
                    <Button type="submit" className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">Registra Attività</Button>
                  </div>
                </form>
              </Card>
            )}
            {isEditStructureOpen && editingStructure && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <Card className="bg-[#1E293B] border-t-4 border-t-[#F38020] text-slate-100 max-w-4xl w-full p-6 rounded-xl space-y-4 shadow-2xl animate-scale-in my-8">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-[#F38020]" />
                      <div>
                        <h3 className="text-sm font-bold text-white">Modifica Anagrafica & Abbonamento</h3>
                        <p className="text-[11px] text-slate-400">ID Attività: {editingStructure.id}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setIsEditStructureOpen(false); setEditingStructure(null); }} className="text-slate-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <form onSubmit={handleUpdateStructure} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Nome Attività *</label>
                      <Input
                        name="name"
                        defaultValue={editingStructure.name}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Referente / Gestore</label>
                      <Input
                        name="referent"
                        defaultValue={editingStructure.referent}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Telefono Contatto</label>
                      <Input
                        name="phone"
                        defaultValue={editingStructure.phone}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                        Categorie dell'Attività (Seleziona una o più opzioni)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {CATEGORY_OPTIONS.map((catName) => {
                          const isChecked = editFormCategories.includes(catName);
                          return (
                            <label
                              key={catName}
                              className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors text-[10px] font-medium border ${
                                isChecked
                                  ? "bg-[#F38020]/20 text-[#F38020] border-[#F38020]/40"
                                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setEditFormCategories(editFormCategories.filter(x => x !== catName));
                                  } else {
                                    setEditFormCategories([...editFormCategories, catName]);
                                  }
                                }}
                                className="accent-[#F38020]"
                              />
                              <span>{catName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Ufficiale</label>
                      <Input
                        name="email"
                        type="email"
                        defaultValue={editingStructure.email}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Sito Web URL</label>
                      <Input
                        name="website"
                        defaultValue={editingStructure.website}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Comune / Città</label>
                      <Input
                        name="city"
                        defaultValue={editingStructure.city}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Provincia (Sigla)</label>
                      <Input
                        name="province"
                        defaultValue={editingStructure.province}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Indirizzo Completo</label>
                      <Input
                        name="address"
                        defaultValue={editingStructure.address}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Piano Commerciale *</label>
                      <select
                        value={selectedPlanForEdit}
                        onChange={(e) => setSelectedPlanForEdit(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                      >
                        {Object.keys(PLAN_PRICES).map(planName => (
                          <option key={planName} value={planName}>{planName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Importo Pagato (€) * (Sempre Editabile)</label>
                      <Input
                        type="number"
                        value={amountPaidForEdit}
                        onChange={(e) => setAmountPaidForEdit(Number(e.target.value))}
                        className="bg-white border border-slate-200 text-slate-900 text-xs h-9 font-medium focus:border-[#F38020]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#F38020] uppercase mb-1">Affiliazione da *</label>
                      <select
                        value={affiliatedFromForEdit}
                        onChange={(e) => setAffiliatedFromForEdit(e.target.value)}
                        className="w-full bg-white border border-[#F38020]/40 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                      >
                        <option value="call center">Call Center</option>
                        <option value="call center AI">Call Center AI</option>
                        <option value="webinar 1">Webinar 1</option>
                        <option value="webinar 2">Webinar 2</option>
                        <option value="webinar 3">Webinar 3</option>
                        <option value="altro">Altro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Metodo Pagamento</label>
                      <Input
                        name="paymentMethod"
                        defaultValue={editingStructure.paymentMethod}
                        className="bg-white border-slate-200 text-slate-900 font-medium text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Stato Pagamento</label>
                      <select
                        name="paymentStatus"
                        defaultValue={editingStructure.paymentStatus}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                      >
                        <option value="paid">Attivo (Pagato)</option>
                        <option value="pending">In attesa</option>
                        <option value="failed">Scaduto / Sospeso</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Inizio Abbonamento</label>
                      <Input
                        name="subscriptionStart"
                        type="date"
                        defaultValue={editingStructure.subscriptionStart}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Fine Abbonamento</label>
                      <Input
                        name="subscriptionEnd"
                        type="date"
                        defaultValue={editingStructure.subscriptionEnd}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Rinnovo Automatico</label>
                      <select
                        name="autoRenewal"
                        defaultValue={editingStructure.autoRenewal ? "true" : "false"}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                      >
                        <option value="true">SI (Rinnovo automatico)</option>
                        <option value="false">NO (Nessun rinnovo)</option>
                      </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-2 pt-3 border-t border-slate-700">
                      <Button type="button" variant="ghost" onClick={() => { setIsEditStructureOpen(false); setEditingStructure(null); }} className="text-xs h-9">Annulla</Button>
                      <Button type="submit" className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">Salva Modifiche</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Elenco Attività Registrate ({filteredStructures.length})</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Filtro: {globalSearch ? `"${globalSearch}"` : "Tutti"}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-4">Attività / Categorie</th>
                          <th className="p-4">Città</th>
                          <th className="p-4">Piano</th>
                          <th className="p-4">Scadenza</th>
                          <th className="p-4">Importo</th>
                          <th className="p-4 text-right">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredStructures.length > 0 ? (
                          filteredStructures.map(s => {
                            const isOverdue = s.subscriptionEnd && new Date(s.subscriptionEnd).getTime() < Date.now();
                            const daysLeft = s.subscriptionEnd ? Math.ceil((new Date(s.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24)) : 999;
                            return (
                              <tr
                                key={s.id}
                                onClick={() => setSelectedStructureId(s.id)}
                                className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${selectedStructureId === s.id ? 'bg-[#F38020]/5 border-l-2 border-l-[#F38020]' : ''}`}
                              >
                                <td className="p-4">
                                  <div className="font-semibold text-slate-200">{s.name}</div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(s.categories || ["Hotel"]).map((catItem, idx) => (
                                      <span key={idx} className="bg-slate-950 text-orange-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                                        {catItem}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-slate-300">{s.city}</div>
                                  <div className="text-[10px] text-slate-500">{s.region} ({s.province})</div>
                                </td>
                                <td className="p-4">
                                  <Badge className="bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[10px] truncate max-w-[140px]">
                                    {s.plan}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="font-mono text-slate-300">{s.subscriptionEnd || 'ND'}</div>
                                  {isOverdue ? (
                                    <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">SCADUTO</span>
                                  ) : daysLeft <= 30 ? (
                                    <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Scade a breve (-{daysLeft}d)</span>
                                  ) : (
                                    <span className="text-[9px] text-green-400 font-semibold">Attivo</span>
                                  )}
                                </td>
                                <td className="p-4 font-mono font-bold text-emerald-400">
                                  {s.amountPaid} €
                                </td>
                                <td className="p-4 text-right flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleOpenEditPanel(s)}
                                    className="h-7 w-7 text-sky-400 hover:bg-sky-500/10"
                                    title="Modifica Anagrafica"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteStructure(s.id)}
                                    className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              Nessuna attività trovata.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-1">
                {selectedStructure ? (
                  <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden sticky top-20">
                    <div className="p-4 bg-slate-950 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase bg-[#F38020]/20 text-[#F38020] px-2 py-0.5 rounded">Scheda Attività</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditPanel(selectedStructure)}
                          className="h-7 bg-slate-800 border-slate-700 hover:bg-slate-700 text-[10px] text-[#F38020]"
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> Modifica Anagrafica
                        </Button>
                      </div>
                      <h4 className="font-bold text-sm text-slate-200 mt-3">{selectedStructure.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                        {selectedStructure.categories.map((c, i) => (
                          <Badge key={i} className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px]">
                            {c}
                          </Badge>
                        ))}
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-400 mt-3 border-t border-slate-800/80 pt-2.5">
                        <p>Referente: <span className="text-white font-medium">{selectedStructure.referent || "Nessuno"}</span></p>
                        <p>Canale Affiliazione: <span className="text-orange-400 font-bold uppercase tracking-wider text-[10px]">{selectedStructure.affiliatedFrom || "call center"}</span></p>
                        <p>Piano: <span className="text-sky-400 font-mono">{selectedStructure.plan} ({selectedStructure.amountPaid}€)</span></p>
                        <p>Contatto: <span className="text-slate-300 font-mono">{selectedStructure.phone || selectedStructure.email || "Nessuno"}</span></p>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <Bike className="h-4 w-4 text-[#F38020]" />
                        Caratteristiche Bike Friendly (11 Requisiti)
                      </div>
                      <div className="space-y-3">
                        {[
                          { key: 'secureStorage', label: 'Ricovero bici sicuro' },
                          { key: 'coveredStorage', label: 'Ricovero coperto' },
                          { key: 'bikeInRoom', label: 'Accesso bici in camera' },
                          { key: 'maintenanceWork', label: 'Officina o manutenzione' },
                          { key: 'bikeWash', label: 'Lavaggio bici' },
                          { key: 'laundryWash', label: 'Lavaggio abbigliamento' },
                          { key: 'earlyBreakfast', label: 'Colazione anticipata' },
                          { key: 'luggageTransfer', label: 'Transfer bagagli' },
                          { key: 'bikeRental', label: 'Noleggio bici' },
                          { key: 'ebikeFriendly', label: 'E-bike Friendly' },
                          { key: 'ebikeCharging', label: 'Ricarica e-bike' }
                        ].map((feat) => {
                          const value = selectedStructure.features[feat.key as keyof BikeFriendlyFeatures];
                          return (
                            <div key={feat.key} className="flex items-center justify-between text-xs py-1 hover:bg-slate-800/30 px-2 rounded">
                              <span className="text-slate-300">{feat.label}</span>
                              <Checkbox
                                checked={!!value}
                                onCheckedChange={() => handleToggleFeature(selectedStructure.id, feat.key as keyof BikeFriendlyFeatures)}
                                className="border-slate-700 data-[state=checked]:bg-[#F38020]"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase">Dotazioni Personalizzate</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStructure.features.customFeatures?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-slate-950 text-slate-300 border-slate-800">
                              {tag}
                            </Badge>
                          )) ?? <span className="text-[11px] text-slate-500">Nessuna dotazione custom</span>}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Aggiungi caratteristica..."
                            id="custom-feat-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const el = e.currentTarget;
                                handleAddCustomFeature(selectedStructure.id, el.value);
                                el.value = '';
                              }
                            }}
                            className="h-8 bg-slate-950 border-slate-800 text-[11px] text-slate-200"
                          />
                          <Button
                            size="sm"
                            className="bg-slate-800 text-white h-8 hover:bg-slate-700 animate-fade-in"
                            onClick={() => {
                              const input = document.getElementById('custom-feat-input') as HTMLInputElement;
                              if (input && input.value) {
                                handleAddCustomFeature(selectedStructure.id, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-900 border-slate-800 p-6 text-center rounded-xl text-slate-500 text-xs">
                    Seleziona un'attività dall'elenco per visualizzare, abilitare e personalizzare le sue dotazioni e caratteristiche Bike-Friendly.
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ledger" className="space-y-6 focus-visible:outline-none">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Registro Spese & Ricavi Progetto</h2>
                <p className="text-xs text-slate-400">Inserisci le quote di investimento di Marco e del Socio, monitorando i ricavi reali delle attività.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsNewCostOpen(true)} className="bg-red-600 hover:bg-red-700 text-white text-xs h-9">
                  <Plus className="h-4 w-4 mr-1" /> Registra Costo
                </Button>
                <Button onClick={() => setIsNewRevenueOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9">
                  <Plus className="h-4 w-4 mr-1" /> Registra Ricavo (Entrata)
                </Button>
              </div>
            </div>
            {isNewCostOpen && (
              <Card className="bg-slate-900 border-red-500/40 p-6 rounded-xl animate-scale-in">
                <CardHeader className="p-0 pb-4 border-b border-slate-800">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" /> Registra Spesa di Progetto
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateCost} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Descrizione *</label>
                    <Input
                      name="description"
                      placeholder="Es. Licenza Cloudflare o Hosting"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Importo (€) *</label>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="150"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Categoria Spesa</label>
                    <select
                      name="category"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="Software">Software</option>
                      <option value="Hosting">Hosting</option>
                      <option value="AI">AI</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Telefonia">Telefonia</option>
                      <option value="Consulenza">Consulenza</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Pagato Da *</label>
                    <select
                      name="paidBy"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="Marco">Marco (Fondatore)</option>
                      <option value="Socio">Socio (Co-Founder)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Spesa</label>
                    <Input
                      name="date"
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Note / Dettagli</label>
                    <Input
                      name="notes"
                      placeholder="Dettagli fattura..."
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button type="button" variant="ghost" onClick={() => setIsNewCostOpen(false)} className="text-xs h-9">Annulla</Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-xs h-9">Salva Spesa</Button>
                  </div>
                </form>
              </Card>
            )}
            {isNewRevenueOpen && (
              <Card className="bg-slate-900 border-emerald-500/40 p-6 rounded-xl animate-scale-in">
                <CardHeader className="p-0 pb-4 border-b border-slate-800">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-emerald-500" /> Registra Entrata (Fattura Incassata Manuale)
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateRevenue} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Attività / Cliente *</label>
                    <Input
                      name="structureName"
                      placeholder="Es. Rifugio Alpe"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Importo Incassato (€) *</label>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="450"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Tipologia Entrata</label>
                    <select
                      name="type"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="Abbonamento">Abbonamento</option>
                      <option value="Sponsorizzazione">Sponsorizzazione</option>
                      <option value="Servizio Custom">Servizio Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Incasso</label>
                    <Input
                      name="date"
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Note e Riferimenti transazione</label>
                    <Input
                      name="notes"
                      placeholder="Riferimento bonifico o Stripe transazione..."
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button type="button" variant="ghost" onClick={() => setIsNewRevenueOpen(false)} className="text-xs h-9">Annulla</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9">Salva Ricavo</Button>
                  </div>
                </form>
              </Card>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-950 pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-white">Registro Spese (Costi Progetto)</CardTitle>
                      <CardDescription className="text-2xs">Investimenti diretti effettuati dai fondatori</CardDescription>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-400">
                      Marco: <span className="text-white font-bold">{stats.totalMarco} €</span> | Socio: <span className="text-white font-bold">{stats.totalSocio} €</span>
                    </div>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Descrizione</th>
                        <th className="p-3">Socio Pagatore</th>
                        <th className="p-3 text-right">Importo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {costs.length > 0 ? (
                        costs.map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-mono text-slate-400">{c.date}</td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-200">{c.description}</p>
                              <span className="text-[10px] text-red-400/80 bg-red-500/5 px-1 rounded">{c.category}</span>
                            </td>
                            <td className="p-3">
                              <Badge className={`text-[10px] ${c.paidBy === 'Marco' ? 'bg-orange-500/10 text-orange-400' : 'bg-sky-500/10 text-sky-400'} border-none`}>
                                {c.paidBy}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-bold text-red-400 font-mono">-{c.amount} €</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">Nessuna spesa inserita</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-950 pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-white">Canoni Totali Sincronizzati (Anagrafiche + Registro)</CardTitle>
                      <CardDescription className="text-2xs font-mono text-[#F38020]">Quota incassata totale: {stats.totalRev} €</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Data / Provenienza</th>
                        <th className="p-3">Attività o Descrizione</th>
                        <th className="p-3">Tipo / Piano</th>
                        <th className="p-3 text-right">Importo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {structures.map(s => (
                        <tr key={`str-rev-${s.id}`} className="hover:bg-slate-800/30 opacity-90">
                          <td className="p-3 font-mono text-slate-400">{s.membershipDate || 'Abbonamento'}</td>
                          <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                            {s.name} <Badge className="bg-emerald-500/10 text-emerald-400 text-[8px] scale-90 border-none">Anagrafica</Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] text-sky-400 bg-sky-500/5 px-1.5 py-0.5 rounded max-w-[150px] truncate block">{s.plan}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400 font-mono">+{s.amountPaid} €</td>
                        </tr>
                      ))}
                      {revenues.map(r => (
                        <tr key={`man-rev-${r.id}`} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-slate-400">{r.date}</td>
                          <td className="p-3 font-semibold text-slate-200">{r.structureName}</td>
                          <td className="p-3">
                            <span className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-1 rounded">{r.type}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400 font-mono">+{r.amount} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="roadmap" className="space-y-6 focus-visible:outline-none">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Stato Avanzamento Lavori TSKBikeHub</h2>
                <p className="text-xs text-slate-400">Pianificazione e stato dei vari ambiti: App Mobile, CRM Call Center, Gestionale, Social, Marketing.</p>
              </div>
              <Button onClick={() => setIsNewTaskOpen(true)} className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">
                <Plus className="h-4 w-4 mr-1" /> Nuova Attività
              </Button>
            </div>
            {isNewTaskOpen && (
              <Card className="bg-slate-900 border-[#F38020]/40 p-6 rounded-xl animate-scale-in">
                <CardHeader className="p-0 pb-4 border-b border-slate-800">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#F38020]" /> Crea Attività per la Roadmap
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateTask} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Titolo Attività *</label>
                    <Input
                      name="title"
                      placeholder="Es. Integrazione API Stripe Webhooks"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Ambito / Area</label>
                    <select
                      name="area"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="App Mobile">App Mobile</option>
                      <option value="CRM Call Center">CRM Call Center</option>
                      <option value="Gestionale">Gestionale</option>
                      <option value="Sito Web">Sito Web</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Commerciale">Commerciale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Priorità</label>
                    <select
                      name="priority"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded p-2 text-xs h-9 font-medium"
                    >
                      <option value="Bassa">Bassa</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Responsabile</label>
                    <Input
                      name="manager"
                      placeholder="Nome sviluppatore / manager"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Percentuale Completamento</label>
                    <Input
                      name="completionPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Inizio</label>
                    <Input
                      name="startDate"
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Data Fine Prevista</label>
                    <Input
                      name="expectedEndDate"
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Descrizione dell'Attività</label>
                    <Input
                      name="description"
                      placeholder="Descrivi il risultato atteso..."
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9 font-medium"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button type="button" variant="ghost" onClick={() => setIsNewTaskOpen(false)} className="text-xs h-9">Annulla</Button>
                    <Button type="submit" className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">Salva Attività di Roadmap / Task</Button>
                  </div>
                </form>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { status: 'Da fare', label: 'DA FARE', color: 'border-t-slate-500' },
                { status: 'In corso', label: 'IN CORSO', color: 'border-t-[#F38020]' },
                { status: 'In test', label: 'IN VERIFICA', color: 'border-t-sky-500' },
                { status: 'Completato', label: 'COMPLETATO', color: 'border-t-green-500' }
              ].map(col => {
                const columnTasks = tasks.filter(t => t.status === col.status);
                return (
                  <Card key={col.status} className={`bg-slate-900/60 border-slate-800 border-t-4 ${col.color} rounded-xl min-h-[400px] flex flex-col`}>
                    <CardHeader className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-row items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 tracking-wider">{col.label}</h3>
                      <Badge className="bg-slate-950 text-slate-400 font-mono text-[10px] border border-slate-800">
                        {columnTasks.length}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
                      {columnTasks.map(t => (
                        <div key={t.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 hover:border-slate-700 transition-all text-xs">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-slate-200">{t.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{t.description || 'Nessuna descrizione.'}</p>
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="text-[#F38020] bg-orange-500/5 px-1.5 py-0.5 rounded font-mono text-[9px]">{t.area}</span>
                            <span className="text-slate-400">Resp: {t.manager}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Avanzamento</span>
                              <span>{t.completionPercent}%</span>
                            </div>
                            <Progress value={t.completionPercent} className="h-1.5 bg-slate-800" />
                          </div>
                          <div className="flex justify-end gap-1 pt-1 border-t border-slate-800/60">
                            {col.status !== 'Da fare' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(t.id, col.status === 'In test' ? 'In corso' : col.status === 'Completato' ? 'In test' : 'Da fare')}
                                className="text-[9px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-400"
                              >
                                ◀ Indietro
                              </button>
                            )}
                            {col.status !== 'Completato' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(t.id, col.status === 'Da fare' ? 'In corso' : col.status === 'In corso' ? 'In test' : 'Completato')}
                                className="text-[9px] bg-[#F38020]/20 hover:bg-[#F38020] hover:text-white px-1.5 py-0.5 rounded text-[#F38020]"
                              >
                                Avanza ▶
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center text-[11px] text-slate-600 py-12">Nessun task in questa colonna</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="import" className="space-y-6 focus-visible:outline-none">
            <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-950 border-b border-slate-800 p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-[#F38020]" /> Importazione Lead & CRM Separato
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Importa gli elenchi dei lead acquisiti dal Call Center. Il sistema esegue un controllo automatico di prevenzione dei duplicati basato su Nome, Telefono ed Email.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadDemoCsv} className="bg-slate-900 text-slate-300 border-slate-800 text-xs">
                    <Download className="h-3.5 w-3.5 mr-1" /> Scarica CSV d'Esempio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-950/40">
                  <FileSpreadsheet className="h-10 w-10 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-300 font-semibold">Seleziona o trascina il file di report CRM</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Supporta formati CSV, XLSX o XLS con intestazione</p>
                  <div className="relative">
                    <input
                      type="file"
                      id="crm-file-upload"
                      onChange={handleFileChange}
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                    />
                    <Button onClick={() => document.getElementById('crm-file-upload')?.click()} className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9">
                      Seleziona File
                    </Button>
                  </div>
                  {uploadFile && (
                    <div className="mt-3 text-xs text-green-400 font-mono bg-green-500/10 px-3 py-1 rounded">
                      File Caricato: {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                {csvHeaders.length > 0 && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mappatura Colonne del Foglio di Calcolo</h3>
                    <p className="text-[11px] text-slate-500">Abbina le colonne del tuo file ai dati anagrafici di TSKBikeHub.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {[
                        { key: 'name', label: 'Nome Attività' },
                        { key: 'phone', label: 'Telefono Contatto' },
                        { key: 'email', label: 'Email di Riferimento' },
                        { key: 'category', label: 'Categorie (Multiselezione)' },
                        { key: 'city', label: 'Città / Comune' },
                        { key: 'plan', label: 'Piano' },
                        { key: 'amountPaid', label: 'Importo Pagato' },
                        { key: 'affiliatedFrom', label: 'Canale di Affiliazione' }
                      ].map(field => (
                        <div key={field.key} className="space-y-1">
                          <label className="block text-[11px] text-slate-400 font-semibold">{field.label}</label>
                          <select
                            value={columnMapping[field.key] || ''}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-1.5 text-xs h-8"
                          >
                            <option value="">-- Seleziona --</option>
                            {csvHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {importPreview.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Anteprima dei Dati da Importare ({importPreview.length} Attività rilevate)</h4>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <RefreshCw className="h-3 w-3 animate-spin" /> {importPreview.filter(i => i._isDuplicate).length} Aggiornamenti
                        </span>
                        <span className="flex items-center gap-1 text-green-400 font-semibold">
                          <PlusCircle className="h-3 w-3" /> {importPreview.filter(i => !i._isDuplicate).length} Nuove Inserite
                        </span>
                      </div>
                    </div>
                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
                      <table className="w-full text-left text-xs bg-slate-950/20">
                        <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                          <tr>
                            <th className="p-3">Attività / Categorie</th>
                            <th className="p-3">Città</th>
                            <th className="p-3">Email / Tel</th>
                            <th className="p-3">Piano / Valore</th>
                            <th className="p-3 text-right">Azione Rilevata</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {importPreview.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-900/40">
                              <td className="p-3">
                                <p className="font-semibold text-slate-200">{item.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.categories.map((c: string, idx: number) => (
                                    <span key={idx} className="bg-slate-900 text-orange-400 border border-slate-800 px-1 rounded text-[9px] font-mono">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-slate-300">{item.city}</td>
                              <td className="p-3 text-slate-400">
                                <div className="text-[11px]">{item.email}</div>
                                <div className="text-[10px]">{item.phone}</div>
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-200">
                                {item.plan} ({item.amountPaid} €)
                              </td>
                              <td className="p-3 text-right">
                                {item._isDuplicate ? (
                                  <Badge className="bg-amber-500/10 text-amber-400 border-none">Aggiorna</Badge>
                                ) : (
                                  <Badge className="bg-green-500/10 text-green-400 border-none">Nuovo</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setUploadFile(null);
                          setCsvRawRows([]);
                          setImportPreview([]);
                        }}
                        className="text-xs h-9"
                      >
                        Annulla
                      </Button>
                      <Button
                        onClick={handleImportSubmit}
                        className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9"
                      >
                        Conferma Importazione
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="invoices" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex gap-2">
                    <Button
                      variant={invoiceSubTab === 'client' ? 'default' : 'outline'}
                      onClick={() => setInvoiceSubTab('client')}
                      className={invoiceSubTab === 'client' ? 'bg-[#F38020] text-white' : 'text-slate-300'}
                    >
                      Fatture Attive (Clienti)
                    </Button>
                    <Button
                      variant={invoiceSubTab === 'supplier' ? 'default' : 'outline'}
                      onClick={() => setInvoiceSubTab('supplier')}
                      className={invoiceSubTab === 'supplier' ? 'bg-[#F38020] text-white' : 'text-slate-300'}
                    >
                      Fatture Passive (Fornitori)
                    </Button>
                  </div>
                  <Button
                    onClick={() => invoiceSubTab === 'client' ? setIsNewInvoiceOpen(true) : setIsNewPassiveInvoiceOpen(true)}
                    className="bg-[#F38020] hover:bg-orange-600 text-white text-xs h-9"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Nuova Fattura
                  </Button>
                </div>
                {invoiceSubTab === 'client' ? (
                  <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-300 uppercase">Fatture Attive Generate</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-3">Numero</th>
                            <th className="p-3">Cliente</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Stato</th>
                            <th className="p-3 text-right">Importo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-800/30">
                              <td className="p-3 font-mono text-slate-300">{inv.invoiceNumber}</td>
                              <td className="p-3 font-semibold text-slate-200">{inv.clientName}</td>
                              <td className="p-3 text-slate-400">{inv.date}</td>
                              <td className="p-3">
                                <Badge className={inv.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}>
                                  {inv.status === 'paid' ? 'Pagata' : 'In attesa'}
                                </Badge>
                              </td>
                              <td className="p-3 text-right font-bold text-emerald-400">{inv.amount} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-300 uppercase">Fatture Passive Fornitori</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-3">Numero</th>
                            <th className="p-3">Fornitore</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Stato</th>
                            <th className="p-3 text-right">Importo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {supplierInvoices.map(si => (
                            <tr key={si.id} className="hover:bg-slate-800/30">
                              <td className="p-3 font-mono text-slate-300">{si.invoiceNumber}</td>
                              <td className="p-3 font-semibold text-slate-200">{si.supplierName}</td>
                              <td className="p-3 text-slate-400">{si.date}</td>
                              <td className="p-3">
                                <Badge className={si.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}>
                                  {si.paymentStatus === 'paid' ? 'Pagata' : 'In attesa'}
                                </Badge>
                              </td>
                              <td className="p-3 text-right font-bold text-red-400">{si.amount} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase">Anagrafica Partner & Fornitori</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={directorySubTab === 'partners' ? 'default' : 'outline'}
                        onClick={() => setDirectorySubTab('partners')}
                        className="h-7 text-2xs"
                      >
                        Partner
                      </Button>
                      <Button
                        size="sm"
                        variant={directorySubTab === 'suppliers' ? 'default' : 'outline'}
                        onClick={() => setDirectorySubTab('suppliers')}
                        className="h-7 text-2xs"
                      >
                        Fornitori
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
                    {directorySubTab === 'partners' ? (
                      partners.map(p => (
                        <div key={p.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-200 text-xs">{p.name}</span>
                            <Badge className="bg-orange-500/10 text-[#F38020] border-none text-[9px]">{p.type}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">Referente: {p.referent}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.email} | {p.phone}</p>
                        </div>
                      ))
                    ) : (
                      suppliers.map(s => (
                        <div key={s.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-200 text-xs">{s.name}</span>
                            <Badge className="bg-sky-500/10 text-sky-400 border-none text-[9px]">{s.category}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">Costo Mensile: {s.monthlyCost} €</p>
                          <p className="text-[10px] text-slate-500 font-mono">{s.email}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="top-right" theme="dark" />
    </AppLayout>
  );
}