export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
// TSKBikeHub Custom Types
export interface BikeFriendlyFeatures {
  secureStorage: boolean;      // Ricovero bici sicuro
  coveredStorage: boolean;     // Ricovero coperto
  bikeInRoom: boolean;         // Accesso bici in camera
  maintenanceWork: boolean;    // Officina o manutenzione
  bikeWash: boolean;           // Lavaggio bici
  laundryWash: boolean;        // Lavaggio abbigliamento
  earlyBreakfast: boolean;     // Colazione anticipata
  luggageTransfer: boolean;    // Transfer bagagli
  bikeRental: boolean;         // Noleggio bici
  ebikeFriendly: boolean;      // E-bike friendly
  ebikeCharging: boolean;      // Ricarica e-bike
  customFeatures: string[];    // Caratteristiche personalizzate
}
export interface Structure {
  id: string;
  name: string;
  categories: string[]; // Multi-category schema enhancement supporting selectable tags
  referent: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  province: string;
  region: string;
  country: string;
  // Commercial Data
  membershipDate: string; // Data adesione
  plan: string; // Basic, Gold, Premium, Platinum
  amountPaid: number; // Importo pagato
  paymentMethod: string; // Bonifico, Stripe, PayPal, Contanti
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  subscriptionStart: string; // Data inizio abbonamento
  subscriptionEnd: string; // Data scadenza abbonamento
  autoRenewal: boolean; // Rinnovo automatico (SI/NO)
  // Bike friendly specs
  features: BikeFriendlyFeatures;
  affiliatedFrom?: string; // Canale di provenienza dell'affiliazione
}
export interface Supplier {
  id: string;
  name: string;
  category: string; // Software, Hosting, AI, Marketing, Telefonia, Consulenza, Altro
  referent: string;
  email: string;
  phone: string;
  website: string;
  monthlyCost: number;
  annualCost: number;
  notes: string;
}
export interface Cost {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paidBy: 'Marco' | 'Socio';
  supplierId?: string;
  supplierName?: string;
  notes: string;
}
export interface Revenue {
  id: string;
  date: string;
  structureId?: string;
  structureName: string;
  amount: number;
  type: string; // Abbonamento, Sponsorizzazione, Altro
  plan?: string;
  notes: string;
}
export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  area: 'App Mobile' | 'CRM Call Center' | 'Gestionale' | 'Sito Web' | 'Social Media' | 'Partnership' | 'Marketing' | 'Commerciale';
  priority: 'Bassa' | 'Media' | 'Alta' | 'Urgente';
  manager: string; // Responsabile
  status: 'Idea' | 'Da fare' | 'In corso' | 'In test' | 'Completato' | 'Bloccato';
  startDate: string;
  expectedEndDate: string;
  completionPercent: number; // Percentuale completamento (0-100)
}
export interface Partner {
  id: string;
  name: string;
  type: string; // Turistico, Tecnologico, Commerciale, Associazione, Altro
  referent: string;
  email: string;
  phone: string;
  agreementDate: string;
  status: 'Attivo' | 'In trattativa' | 'Sospeso';
  notes: string;
}
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
}
export interface SupplierInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  description: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paidBy: 'Marco' | 'Socio';
}