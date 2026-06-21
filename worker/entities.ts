import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Structure, Cost, Revenue, ProjectTask, Partner, Supplier, Invoice, SupplierInvoice } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// Keep existing entities to avoid breaking template requirements
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// TSKBikeHub Entities
// 1. Structure (Attività) Registry Entity
export class StructureEntity extends IndexedEntity<Structure> {
  static readonly entityName = "structure";
  static readonly indexName = "structures";
  static readonly initialState: Structure = {
    id: "",
    name: "",
    categories: ["Hotel"],
    referent: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    province: "",
    region: "",
    country: "Italia",
    membershipDate: "",
    plan: "Gold",
    amountPaid: 0,
    paymentMethod: "Bonifico",
    paymentStatus: "pending",
    subscriptionStart: "",
    subscriptionEnd: "",
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
    affiliatedFrom: ""
  };
}
// 2. Cost Entity
export class CostEntity extends IndexedEntity<Cost> {
  static readonly entityName = "cost";
  static readonly indexName = "costs";
  static readonly initialState: Cost = {
    id: "",
    date: "",
    description: "",
    category: "Software",
    amount: 0,
    paidBy: "Marco",
    notes: ""
  };
}
// 3. Revenue Entity
export class RevenueEntity extends IndexedEntity<Revenue> {
  static readonly entityName = "revenue";
  static readonly indexName = "revenues";
  static readonly initialState: Revenue = {
    id: "",
    date: "",
    structureName: "",
    amount: 0,
    type: "Abbonamento",
    notes: ""
  };
}
// 4. Project Task Entity
export class ProjectTaskEntity extends IndexedEntity<ProjectTask> {
  static readonly entityName = "task";
  static readonly indexName = "tasks";
  static readonly initialState: ProjectTask = {
    id: "",
    title: "",
    description: "",
    area: "Gestionale",
    priority: "Media",
    manager: "Admin",
    status: "Da fare",
    startDate: "",
    expectedEndDate: "",
    completionPercent: 0
  };
}
// 5. Partner Entity
export class PartnerEntity extends IndexedEntity<Partner> {
  static readonly entityName = "partner";
  static readonly indexName = "partners";
  static readonly initialState: Partner = {
    id: "",
    name: "",
    type: "Commerciale",
    referent: "",
    email: "",
    phone: "",
    agreementDate: "",
    status: "Attivo",
    notes: ""
  };
}
// 6. Vendor / Supplier Entity
export class VendorEntity extends IndexedEntity<Supplier> {
  static readonly entityName = "supplier";
  static readonly indexName = "suppliers";
  static readonly initialState: Supplier = {
    id: "",
    name: "",
    category: "Software",
    referent: "",
    email: "",
    phone: "",
    website: "",
    monthlyCost: 0,
    annualCost: 0,
    notes: ""
  };
}
// 7. Invoice Entity
export class InvoiceEntity extends IndexedEntity<Invoice> {
  static readonly entityName = "invoice";
  static readonly indexName = "invoices";
  static readonly initialState: Invoice = {
    id: "",
    invoiceNumber: "",
    date: "",
    clientName: "",
    amount: 0,
    description: "",
    status: "pending"
  };
}
// 8. Supplier Invoice Entity
export class SupplierInvoiceEntity extends IndexedEntity<SupplierInvoice> {
  static readonly entityName = "supplier_invoice";
  static readonly indexName = "supplier_invoices";
  static readonly initialState: SupplierInvoice = {
    id: "",
    supplierId: "",
    supplierName: "",
    invoiceNumber: "",
    date: "",
    amount: 0,
    description: "",
    paymentStatus: "pending",
    paidBy: "Marco"
  };
}