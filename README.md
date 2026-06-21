# TSKBikeHub Director

[aureliabutton]

TSKBikeHub Director is the central control hub and executive administration platform designed for the TSKBikeHub network. Unlike the operational call-center CRM, this director-level cockpit provides high-level telemetry, structural visibility, and financial governance over the entire project.

The system empowers administrators to monitor registered bike-friendly hotels and structures, track operational costs split by founders (Marco and Partner/Socio), visualize revenue models, oversee project roadmap tasks (spanning Mobile App, CRM, Web, and Social), generate professional invoices, and import raw CRM directories via smart column-mapping spreadsheet wizards.

---

## 🌟 Key Features

### 1. Dashboard Principale (Mission Control)
* High-density telemetry counters tracking active, total, and expiring structures.
* Financial overview cards visualizing absolute expenditures, monthly trends, and net balances.
* Actionable, automated alerts highlighting expiring subscriptions (30-day window), delayed project tasks, and outstanding invoices.

### 2. Gestione Strutture & Bike Features
* Complete searchable, sortable, and paginated registry for all subscribing bike-friendly structures.
* 11-point interactive Bike-Friendly checklist (secure bike storage, e-bike charging, luggage transfer, customized amenities, etc.).
* Automated commercial tier tracking (Piani) and renewal status warnings (Expiring in 30 days, 15 days, or Overdue).

### 3. Costi & Ricavi (Financial Ledger)
* Double-entry accounting system tracking real-time expenditures and receipts.
* Precise split ownership calculations tracking founder contributions ("Marco" vs. "Socio") and total project assets.
* Interactive analytic charts detailing monthly expenses, category ratios, and annual trends.

### 4. Roadmap Progetto (Kanban & Timeline)
* Multi-dimensional development planner covering Web, Mobile App, CRM, and Social tasks.
* Interactive drag-and-drop Kanban board, structured table lists, and timeline Gantt-style trackers.
* Priority levels, percentage completion indicators, and assignment tracking.

### 5. CRM Data Import Engine
* Intuitive client-side XLSX/XLS/CSV importer.
* Interactive visual column-mapping helper matches external sheets with system fields.
* Real-time duplicate validation against structure name, phone, or email to safeguard database integrity.

### 6. Fatture & Partner Directory
* Instant custom invoice creator with interactive billing sheets and dynamic PDF-view generation.
* Central directories organizing strategic regional partners and SaaS/hosting providers (with monthly/annual recurring costs).

---

## 🛠️ Technology Stack

### Frontend Architecture
* **React 18** with **React Router 6** (Optimized single-page layout structure)
* **Tailwind CSS** & **ShadCN UI** (Custom theme configured with a premium trail-orange accent `#F38020`, slate-grays, and active cyber indicators)
* **Zustand** (Ultra-efficient, subscription-based reactive state manager)
* **React Query (TanStack Query v5)** (Optimized state synchronization with backend endpoints)
* **Recharts 2.15** (Responsive visual data charts)
* **Framer Motion 12** (Micro-interactions, smooth hover elevations, and page transition animations)
* **Zod** (Robust parsing and schema matching for CRM integrations)

### Backend Service (Cloudflare Edge)
* **Hono Router** running on high-performance Cloudflare Workers.
* **Cloudflare Durable Objects** implementing isolated entity persistence via an expert transactional Indexed DB abstraction.
* Strict JSON formatting sharing schemas (`ApiResponse<T>`) between Client and Worker.

---

## 🚀 Installation & Local Development

This project uses **Bun** for rapid package management and local script execution.

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed globally.

### 1. Clone & Setup
Install the preconfigured workspace dependencies:
```bash
bun install
```

### 2. Run Locally
Launch both the Hono Workers backend environment and Vite development server:
```bash
bun run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the TSKBikeHub Director app.

---

## 📁 Codebase Structure

```text
├── shared/
│   ├── types.ts          # Shared TypeScript interfaces for API contracts
│   └── mock-data.ts      # Template fallback and seeding records
├── src/
│   ├── components/
│   │   ├── layout/       # Standard layout wrapper with collapsible sidebars
│   │   ├── ui/           # Preinstalled ShadCN UI primitives
│   │   ├── AppSidebar    # Customized platform sidebar
│   │   └── ThemeToggle   # Quick dark/light contrast toggle helper
│   ├── hooks/            # Custom themes and reactive breakpoints
│   ├── lib/              # Client API methods & Tailwind utility merges
│   ├── pages/
│   │   └── HomePage.tsx  # Central application hub with tab controllers
│   ├── main.tsx          # Router initialization and error wrappers
│   └── App.css           # General overrides
├── worker/
│   ├── index.ts          # Cloudflare Worker orchestrator (logger, CORS)
│   ├── core-utils.ts     # Core Transactional Durable Object indexing library
│   ├── entities.ts       # Database structures for Costs, Tasks, and Hotels
│   └── user-routes.ts    # Hono API controller endpoints
```

---

## ☁️ Deployment

Deploy directly to your Cloudflare account using Wrangler bindings:

```bash
bun run deploy
```

[aureliabutton]