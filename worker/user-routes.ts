import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  UserEntity,
  ChatBoardEntity,
  StructureEntity,
  CostEntity,
  RevenueEntity,
  ProjectTaskEntity,
  PartnerEntity,
  VendorEntity,
  InvoiceEntity,
  SupplierInvoiceEntity
} from "./entities";
import { Index, ok, bad, notFound, isStr } from './core-utils';
import type {
  Structure,
  Cost,
  Revenue,
  ProjectTask,
  Partner,
  Supplier,
  Invoice,
  SupplierInvoice
} from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  if ((app as any).__user_routes_registered) {
    return;
  }
  (app as any).__user_routes_registered = true;

  // Seed initial demo data helper for TSKBikeHub on first load with persistent seed marker
  const ensureTSKBikeHubSeed = async (env: Env) => {
    const seedMarker = new Index<any>(env, "sys-seeded");
    if (await seedMarker.exists()) {
      return;
    }
    // 1. Structures Seed
    const demoStructures = [
      {
        id: "struct-1",
        name: "Grand Hotel Stelvio",
        categories: ["Hotel", "Ristorante", "Guida in bici"],
        referent: "Gianni Rossi",
        phone: "+39 0342 123456",
        email: "info@hotelstelvio.it",
        website: "www.hotelstelvio.it",
        address: "Via Passo Stelvio 12",
        city: "Bormio",
        province: "SO",
        region: "Lombardia",
        country: "Italia",
        membershipDate: "2024-01-15",
        plan: "B&B/HOTEL DALLE 6 CAMERE (179€)",
        amountPaid: 179,
        paymentMethod: "Bonifico",
        paymentStatus: "paid" as const,
        subscriptionStart: "2024-01-15",
        subscriptionEnd: "2025-01-15",
        autoRenewal: true,
        features: {
          secureStorage: true,
          coveredStorage: true,
          bikeInRoom: true,
          maintenanceWork: true,
          bikeWash: true,
          laundryWash: true,
          earlyBreakfast: true,
          luggageTransfer: true,
          bikeRental: false,
          ebikeFriendly: true,
          ebikeCharging: true,
          customFeatures: ["Guida Cicloturistica convenzionata", "Mappe GPX personalizzate"]
        },
        affiliatedFrom: "call center"
      },
      {
        id: "struct-2",
        name: "B&B Al Cavallino",
        categories: ["B&B", "Bike rent"],
        referent: "Claudio Bianchi",
        phone: "+39 0464 987654",
        email: "cavallino@gardabike.it",
        website: "www.cavallinogardabike.it",
        address: "Piazza Catullo 4",
        city: "Riva del Garda",
        province: "TN",
        region: "Trentino-Alto Adige",
        country: "Italia",
        membershipDate: "2024-05-10",
        plan: "B&B/HOTEL 2/5 CAMERE (149€)",
        amountPaid: 149,
        paymentMethod: "Stripe",
        paymentStatus: "paid" as const,
        subscriptionStart: "2024-05-10",
        subscriptionEnd: "2024-11-10",
        autoRenewal: false,
        features: {
          secureStorage: true,
          coveredStorage: true,
          bikeInRoom: false,
          maintenanceWork: true,
          bikeWash: true,
          laundryWash: false,
          earlyBreakfast: true,
          luggageTransfer: false,
          bikeRental: true,
          ebikeFriendly: true,
          ebikeCharging: true,
          customFeatures: ["Ricarica rapida Bosch"]
        },
        affiliatedFrom: "webinar 1"
      },
      {
        id: "struct-3",
        name: "Camping Trail Paradise",
        categories: ["Camping", "Bar"],
        referent: "Marta Verdi",
        phone: "+39 0564 333444",
        email: "marta@trailparadise.it",
        website: "www.trailparadise.it",
        address: "Loc. Punta Ala",
        city: "Castiglione della Pescaia",
        province: "GR",
        region: "Toscana",
        country: "Italia",
        membershipDate: "2023-10-01",
        plan: "CAMPING (99€)",
        amountPaid: 99,
        paymentMethod: "PayPal",
        paymentStatus: "paid" as const,
        subscriptionStart: "2023-10-01",
        subscriptionEnd: "2024-10-01",
        autoRenewal: true,
        features: {
          secureStorage: true,
          coveredStorage: false,
          bikeInRoom: false,
          maintenanceWork: true,
          bikeWash: true,
          laundryWash: true,
          earlyBreakfast: false,
          luggageTransfer: false,
          bikeRental: false,
          ebikeFriendly: false,
          ebikeCharging: false,
          customFeatures: []
        },
        affiliatedFrom: "call center AI"
      }
    ];
    for (const s of demoStructures) {
      await StructureEntity.create(env, s);
    }
    // 2. Costs Seed
    const demoCosts = [
      {
        id: "cost-1",
        date: "2024-04-10",
        description: "Hosting Cloudflare Workers & Durable Objects",
        category: "Hosting",
        amount: 25,
        paidBy: "Marco" as const,
        notes: "Fattura ricorrente mensile"
      },
      {
        id: "cost-2",
        date: "2024-04-12",
        description: "Licenze CRM Twilio & Telecomunicazioni",
        category: "Telefonia",
        amount: 120,
        paidBy: "Socio" as const,
        notes: "Servizio Call Center"
      },
      {
        id: "cost-3",
        date: "2024-04-15",
        description: "Consulenza legale contrattualistica partner",
        category: "Consulenza",
        amount: 450,
        paidBy: "Marco" as const,
        notes: "Una tantum"
      },
      {
        id: "cost-4",
        date: "2024-04-18",
        description: "Sviluppo Modulo AI Risposte automatiche",
        category: "AI",
        amount: 350,
        paidBy: "Socio" as const,
        notes: "Integrazione GPT-4o"
      }
    ];
    for (const c of demoCosts) {
      await CostEntity.create(env, c);
    }
    // 3. Revenues Seed
    const demoRevs = [
      {
        id: "rev-1",
        date: "2024-04-01",
        structureName: "Grand Hotel Stelvio",
        amount: 179,
        type: "Abbonamento",
        plan: "B&B/HOTEL DALLE 6 CAMERE (179€)",
        notes: "Attivazione annuale"
      },
      {
        id: "rev-2",
        date: "2024-04-05",
        structureName: "B&B Al Cavallino",
        amount: 149,
        type: "Abbonamento",
        plan: "B&B/HOTEL 2/5 CAMERE (149€)",
        notes: "Pacchetto con servizi marketing inclusi"
      },
      {
        id: "rev-3",
        date: "2024-04-10",
        structureName: "Val Tellina Cycling Club",
        amount: 300,
        type: "Sponsorizzazione",
        notes: "Sponsorizzazione tabellone events"
      }
    ];
    for (const r of demoRevs) {
      await RevenueEntity.create(env, r);
    }
    // 4. Tasks Seed
    const demoTasks = [
      {
        id: "task-1",
        title: "Sincronizzazione API Importatore CRM",
        description: "Sviluppare la validazione e la mappatura dinamica dei file XLS/CSV dei lead.",
        area: "CRM Call Center" as const,
        priority: "Alta" as const,
        manager: "Marco",
        status: "In corso" as const,
        startDate: "2024-04-01",
        expectedEndDate: "2024-04-20",
        completionPercent: 75
      },
      {
        id: "task-2",
        title: "Integrazione Mappe Offline",
        description: "Rendere disponibili le mappe GPX dei percorsi bike anche in assenza di rete cellulare.",
        area: "App Mobile" as const,
        priority: "Urgente" as const,
        manager: "Socio",
        status: "Da fare" as const,
        startDate: "2024-04-05",
        expectedEndDate: "2024-05-15",
        completionPercent: 15
      },
      {
        id: "task-3",
        title: "Rilascio della Landing Page e-Bike friendly",
        description: "Nuovo layout orientato ai turisti stranieri con filtri avanzati ricariche veloci.",
        area: "Sito Web" as const,
        priority: "Media" as const,
        manager: "Marco",
        status: "Completato" as const,
        startDate: "2024-03-10",
        expectedEndDate: "2024-03-28",
        completionPercent: 100
      },
      {
        id: "task-4",
        title: "Campagna Marketing Facebook & Instagram",
        description: "Generazione lead per strutture ricettive del Trentino e dell'Alto Adige.",
        area: "Marketing" as const,
        priority: "Media" as const,
        manager: "Marta Marketing",
        status: "In test" as const,
        startDate: "2024-04-08",
        expectedEndDate: "2024-04-30",
        completionPercent: 90
      }
    ];
    for (const t of demoTasks) {
      await ProjectTaskEntity.create(env, t);
    }
    // 5. Partners Seed
    const demoPartners = [
      {
        id: "partner-1",
        name: "Azienda Promozione Turistica Trentino",
        type: "Turistico",
        referent: "Lucia Trentini",
        email: "lucia@apt.trentino.it",
        phone: "+39 0461 445566",
        agreementDate: "2024-02-10",
        status: "Attivo" as const,
        notes: "Patrocinio e condivisione database percorsi ufficiali"
      },
      {
        id: "partner-2",
        name: "Bosch eBike Systems Italia",
        type: "Tecnologico",
        referent: "Ing. Stefano Rossi",
        email: "stefano.rossi@bosch.it",
        phone: "+39 02 667788",
        agreementDate: "2024-03-01",
        status: "In trattativa" as const,
        notes: "Fornitura stazioni di ricarica rapida convenzionate per strutture Gold/Premium"
      }
    ];
    for (const p of demoPartners) {
      await PartnerEntity.create(env, p);
    }
    // 6. Vendors Seed
    const demoVendors = [
      {
        id: "vendor-1",
        name: "Cloudflare Inc.",
        category: "Hosting",
        referent: "Enterprise Support",
        email: "billing@cloudflare.com",
        phone: "None",
        website: "cloudflare.com",
        monthlyCost: 25,
        annualCost: 300,
        notes: "Storage Durable Objects e CDN"
      },
      {
        id: "vendor-2",
        name: "Twilio API Suite",
        category: "Software",
        referent: "Client Manager IT",
        email: "sales-it@twilio.com",
        phone: "+39 02 888999",
        website: "twilio.com",
        monthlyCost: 120,
        annualCost: 1440,
        notes: "Gestione SMS ed IVR per call center"
      }
    ];
    for (const v of demoVendors) {
      await VendorEntity.create(env, v);
    }
    // 7. Invoices Seed
    const demoInvoices = [
      {
        id: "inv-1",
        invoiceNumber: "FAT-2024-001",
        date: "2024-04-01",
        clientName: "Grand Hotel Stelvio",
        amount: 179,
        description: "Abbonamento annuale TSKBikeHub - B&B/HOTEL DALLE 6 CAMERE",
        status: "paid" as const
      },
      {
        id: "inv-2",
        invoiceNumber: "FAT-2024-002",
        date: "2024-04-05",
        clientName: "B&B Al Cavallino",
        amount: 149,
        description: "Abbonamento semestrale + Opzioni promozionali B&B/HOTEL 2/5 CAMERE",
        status: "paid" as const
      },
      {
        id: "inv-3",
        invoiceNumber: "FAT-2024-003",
        date: "2024-04-12",
        clientName: "Camping Trail Paradise",
        amount: 99,
        description: "Quota adesione CAMPING scaduta - Sollecito inviato",
        status: "pending" as const
      }
    ];
    for (const i of demoInvoices) {
      await InvoiceEntity.create(env, i);
    }
    // 8. Supplier Invoices Seed
    const demoPassive = [
      {
        id: "pass-1",
        supplierId: "vendor-1",
        supplierName: "Cloudflare Inc.",
        invoiceNumber: "INV-CF-88902",
        date: "2024-04-10",
        amount: 25,
        description: "Hosting Cloudflare Workers & Durable Objects",
        paymentStatus: "paid" as const,
        paidBy: "Marco" as const
      },
      {
        id: "pass-2",
        supplierId: "vendor-2",
        supplierName: "Twilio API Suite",
        invoiceNumber: "INV-TW-77612",
        date: "2024-04-12",
        amount: 120,
        description: "Licenze CRM Twilio & Telecomunicazioni",
        paymentStatus: "paid" as const,
        paidBy: "Socio" as const
      },
      {
        id: "pass-3",
        supplierId: "vendor-2",
        supplierName: "Twilio API Suite",
        invoiceNumber: "INV-TW-90111",
        date: "2024-04-25",
        amount: 140,
        description: "Quote SMS straordinarie",
        paymentStatus: "pending" as const,
        paidBy: "Marco" as const
      }
    ];
    for (const p of demoPassive) {
      await SupplierInvoiceEntity.create(env, p);
    }
    // Salva il marcatore persistente di avvenuto seeding
    await seedMarker.save({ seeded: true });
  };
  // ---------------- UNIFIED ALL DATA API ----------------
  app.get('/api/all-data', async (c) => {
    try {
      await ensureTSKBikeHubSeed(c.env);
      const [
        structuresRes,
        costsRes,
        revenuesRes,
        tasksRes,
        partnersRes,
        suppliersRes,
        invoicesRes,
        supplierInvoicesRes
      ] = await Promise.all([
        StructureEntity.list(c.env),
        CostEntity.list(c.env),
        RevenueEntity.list(c.env),
        ProjectTaskEntity.list(c.env),
        PartnerEntity.list(c.env),
        VendorEntity.list(c.env),
        InvoiceEntity.list(c.env),
        SupplierInvoiceEntity.list(c.env)
      ]);
      return ok(c, {
        structures: structuresRes.items,
        costs: costsRes.items,
        revenues: revenuesRes.items,
        tasks: tasksRes.items,
        partners: partnersRes.items,
        suppliers: suppliersRes.items,
        invoices: invoicesRes.items,
        supplierInvoices: supplierInvoicesRes.items
      });
    } catch (e) {
      return bad(c, e instanceof Error ? e.message : 'Impossibile raggruppare i dati');
    }
  });
  // ---------------- STRUCTURES API ----------------
  app.get('/api/structures', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await StructureEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/structures', async (c) => {
    const payload = await c.req.json() as Partial<Structure>;
    if (!payload.name) return bad(c, "Name is required");
    const id = payload.id || `struct-${crypto.randomUUID()}`;
    const newStructure: Structure = {
      id,
      name: payload.name,
      categories: payload.categories || ["Hotel"],
      referent: payload.referent || "",
      phone: payload.phone || "",
      email: payload.email || "",
      website: payload.website || "",
      address: payload.address || "",
      city: payload.city || "",
      province: payload.province || "",
      region: payload.region || "",
      country: payload.country || "Italia",
      membershipDate: payload.membershipDate || new Date().toISOString().split('T')[0],
      plan: payload.plan || "Basic",
      amountPaid: payload.amountPaid || 0,
      paymentMethod: payload.paymentMethod || "Bonifico",
      paymentStatus: payload.paymentStatus || "pending",
      subscriptionStart: payload.subscriptionStart || new Date().toISOString().split('T')[0],
      subscriptionEnd: payload.subscriptionEnd || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      autoRenewal: payload.autoRenewal !== undefined ? payload.autoRenewal : true,
      features: payload.features || {
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
      affiliatedFrom: payload.affiliatedFrom || ""
    };
    const created = await StructureEntity.create(c.env, newStructure);
    return ok(c, created);
  });
  app.put('/api/structures/:id', async (c) => {
    const id = c.req.param('id');
    const payload = await c.req.json() as Partial<Structure>;
    const entity = new StructureEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, "Attività non trovata");
    const updated = await entity.mutate(s => ({
      ...s,
      ...payload,
      id, // protect ID
      categories: payload.categories || s.categories,
      features: payload.features ? { ...s.features, ...payload.features } : s.features,
      affiliatedFrom: payload.affiliatedFrom !== undefined ? payload.affiliatedFrom : s.affiliatedFrom
    }));
    return ok(c, updated);
  });
  app.delete('/api/structures/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await StructureEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- COSTS API ----------------
  app.get('/api/costs', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await CostEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/costs', async (c) => {
    const payload = await c.req.json() as Partial<Cost>;
    if (!payload.description || !payload.amount) return bad(c, "Description and Amount are required");
    const newCost: Cost = {
      id: `cost-${crypto.randomUUID()}`,
      date: payload.date || new Date().toISOString().split('T')[0],
      description: payload.description,
      category: payload.category || "Software",
      amount: Number(payload.amount),
      paidBy: payload.paidBy || "Marco",
      supplierId: payload.supplierId,
      supplierName: payload.supplierName,
      notes: payload.notes || ""
    };
    const created = await CostEntity.create(c.env, newCost);
    return ok(c, created);
  });
  app.delete('/api/costs/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CostEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- REVENUES API ----------------
  app.get('/api/revenues', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await RevenueEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/revenues', async (c) => {
    const payload = await c.req.json() as Partial<Revenue>;
    if (!payload.structureName || !payload.amount) return bad(c, "Structure Name and Amount are required");
    const newRev: Revenue = {
      id: `rev-${crypto.randomUUID()}`,
      date: payload.date || new Date().toISOString().split('T')[0],
      structureName: payload.structureName,
      amount: Number(payload.amount),
      type: payload.type || "Abbonamento",
      plan: payload.plan,
      notes: payload.notes || ""
    };
    const created = await RevenueEntity.create(c.env, newRev);
    return ok(c, created);
  });
  app.delete('/api/revenues/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await RevenueEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- TASKS / ROADMAP API ----------------
  app.get('/api/tasks', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await ProjectTaskEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/tasks', async (c) => {
    const payload = await c.req.json() as Partial<ProjectTask>;
    if (!payload.title) return bad(c, "Task Title is required");
    const newTask: ProjectTask = {
      id: `task-${crypto.randomUUID()}`,
      title: payload.title,
      description: payload.description || "",
      area: payload.area || "Gestionale",
      priority: payload.priority || "Media",
      manager: payload.manager || "Admin",
      status: payload.status || "Da fare",
      startDate: payload.startDate || new Date().toISOString().split('T')[0],
      expectedEndDate: payload.expectedEndDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      completionPercent: payload.completionPercent !== undefined ? Number(payload.completionPercent) : 0
    };
    const created = await ProjectTaskEntity.create(c.env, newTask);
    return ok(c, created);
  });
  app.put('/api/tasks/:id', async (c) => {
    const id = c.req.param('id');
    const payload = await c.req.json() as Partial<ProjectTask>;
    const entity = new ProjectTaskEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, "Task not found");
    const updated = await entity.mutate(t => ({
      ...t,
      ...payload,
      id // protect id
    }));
    return ok(c, updated);
  });
  app.delete('/api/tasks/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ProjectTaskEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- PARTNERS API ----------------
  app.get('/api/partners', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await PartnerEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/partners', async (c) => {
    const payload = await c.req.json() as Partial<Partner>;
    if (!payload.name) return bad(c, "Partner Name is required");
    const newPartner: Partner = {
      id: `partner-${crypto.randomUUID()}`,
      name: payload.name,
      type: payload.type || "Commerciale",
      referent: payload.referent || "",
      email: payload.email || "",
      phone: payload.phone || "",
      agreementDate: payload.agreementDate || new Date().toISOString().split('T')[0],
      status: payload.status || "Attivo",
      notes: payload.notes || ""
    };
    const created = await PartnerEntity.create(c.env, newPartner);
    return ok(c, created);
  });
  app.delete('/api/partners/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await PartnerEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- SUPPLIERS API ----------------
  app.get('/api/suppliers', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await VendorEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/suppliers', async (c) => {
    const payload = await c.req.json() as Partial<Supplier>;
    if (!payload.name) return bad(c, "Supplier Name is required");
    const newSupplier: Supplier = {
      id: `vendor-${crypto.randomUUID()}`,
      name: payload.name,
      category: payload.category || "Software",
      referent: payload.referent || "",
      email: payload.email || "",
      phone: payload.phone || "",
      website: payload.website || "",
      monthlyCost: Number(payload.monthlyCost || 0),
      annualCost: Number(payload.annualCost || 0),
      notes: payload.notes || ""
    };
    const created = await VendorEntity.create(c.env, newSupplier);
    return ok(c, created);
  });
  app.delete('/api/suppliers/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await VendorEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- INVOICES API (Active Clients) ----------------
  app.get('/api/invoices', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await InvoiceEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/invoices', async (c) => {
    const payload = await c.req.json() as Partial<Invoice>;
    if (!payload.clientName || !payload.amount) return bad(c, "Client Name and Amount are required");
    const nextNum = `FAT-2024-${Math.floor(Math.random() * 900 + 100)}`;
    const newInvoice: Invoice = {
      id: `inv-${crypto.randomUUID()}`,
      invoiceNumber: payload.invoiceNumber || nextNum,
      date: payload.date || new Date().toISOString().split('T')[0],
      clientName: payload.clientName,
      amount: Number(payload.amount),
      description: payload.description || "Abbonamento TSKBikeHub",
      status: payload.status || "pending"
    };
    const created = await InvoiceEntity.create(c.env, newInvoice);
    return ok(c, created);
  });
  app.put('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const payload = await c.req.json() as Partial<Invoice>;
    const entity = new InvoiceEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, "Fattura non trovata");
    const updated = await entity.mutate(inv => ({
      ...inv,
      ...payload,
      id // protect id
    }));
    return ok(c, updated);
  });
  app.delete('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await InvoiceEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ---------------- SUPPLIER INVOICES (Passive Bills) API ----------------
  app.get('/api/supplier-invoices', async (c) => {
    await ensureTSKBikeHubSeed(c.env);
    const result = await SupplierInvoiceEntity.list(c.env);
    return ok(c, result.items);
  });
  app.post('/api/supplier-invoices', async (c) => {
    const payload = await c.req.json() as Partial<SupplierInvoice>;
    if (!payload.supplierName || !payload.amount) return bad(c, "Supplier Name and Amount are required");
    const nextId = `pass-${crypto.randomUUID()}`;
    const newInvoice: SupplierInvoice = {
      id: nextId,
      supplierId: payload.supplierId || "",
      supplierName: payload.supplierName,
      invoiceNumber: payload.invoiceNumber || `PASS-${Math.floor(Math.random() * 90000 + 10000)}`,
      date: payload.date || new Date().toISOString().split('T')[0],
      amount: Number(payload.amount),
      description: payload.description || "Servizio passivo",
      paymentStatus: payload.paymentStatus || "pending",
      paidBy: payload.paidBy || "Marco"
    };
    const created = await SupplierInvoiceEntity.create(c.env, newInvoice);
    if (newInvoice.paymentStatus === "paid") {
      const autoCost: Cost = {
        id: `cost-auto-${crypto.randomUUID()}`,
        date: newInvoice.date,
        description: `[Auto-Bill Pay] ${newInvoice.supplierName}: ${newInvoice.description}`,
        category: "Software",
        amount: newInvoice.amount,
        paidBy: newInvoice.paidBy,
        supplierId: newInvoice.supplierId,
        supplierName: newInvoice.supplierName,
        notes: `Fattura passiva: ${newInvoice.invoiceNumber}`
      };
      await CostEntity.create(c.env, autoCost);
    }
    return ok(c, created);
  });
  app.put('/api/supplier-invoices/:id', async (c) => {
    const id = c.req.param('id');
    const payload = await c.req.json() as Partial<SupplierInvoice>;
    const entity = new SupplierInvoiceEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, "Fattura passiva non trovata");
    const prev = await entity.getState();
    const updated = await entity.mutate(si => ({
      ...si,
      ...payload,
      id // protect id
    }));
    if (payload.paymentStatus === "paid" && prev.paymentStatus !== "paid") {
      const autoCost: Cost = {
        id: `cost-auto-${crypto.randomUUID()}`,
        date: updated.date,
        description: `[Auto-Bill Pay] ${updated.supplierName}: ${updated.description}`,
        category: "Software",
        amount: updated.amount,
        paidBy: updated.paidBy,
        supplierId: updated.supplierId,
        supplierName: updated.supplierName,
        notes: `Fattura passiva: ${updated.invoiceNumber}`
      };
      await CostEntity.create(c.env, autoCost);
    }
    return ok(c, updated);
  });
  // ---------------- IMPORT CRM ROUTE ----------------
  app.post('/api/import-crm', async (c) => {
    try {
      const payload = await c.req.json() as { items: any[] };
      if (!payload.items || !Array.isArray(payload.items)) {
        return bad(c, "Items array is required");
      }
      const existing = await StructureEntity.list(c.env);
      for (const item of payload.items) {
        if (!item || !item.name) continue;
        const match = existing.items.find(s =>
          (s.name && s.name.toLowerCase() === item.name.toLowerCase()) ||
          (item.phone && s.phone && s.phone === item.phone) ||
          (item.email && s.email && s.email.toLowerCase() === item.email.toLowerCase())
        );
        if (match) {
          const entity = new StructureEntity(c.env, match.id);
          await entity.mutate(s => ({
            ...s,
            categories: item.categories || s.categories,
            city: item.city || s.city,
            plan: item.plan || s.plan,
            amountPaid: Number(item.amountPaid) || s.amountPaid,
            affiliatedFrom: item.affiliatedFrom || s.affiliatedFrom || "call center"
          }));
        } else {
          const newId = `struct-imp-${crypto.randomUUID()}`;
          const newStruct: Structure = {
            id: newId,
            name: item.name,
            categories: item.categories || ["Hotel"],
            referent: "Importato da CRM",
            phone: item.phone || "",
            email: item.email || "",
            website: "",
            address: "",
            city: item.city || "Da Definire",
            province: "ND",
            region: "ND",
            country: "Italia",
            membershipDate: new Date().toISOString().split('T')[0],
            plan: item.plan || "NEGOZIO BICI / NOLEGGIO (179€)",
            amountPaid: Number(item.amountPaid) || 0,
            paymentMethod: "Bonifico",
            paymentStatus: "paid",
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
            affiliatedFrom: item.affiliatedFrom || "call center"
          };
          await StructureEntity.create(c.env, newStruct);
        }
      }
      return ok(c, { imported: payload.items.length });
    } catch (e) {
      return bad(c, e instanceof Error ? e.message : 'Errore durante l\'importazione');
    }
  });
}