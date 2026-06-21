import React, { useMemo } from "react";
import {
  Home,
  Users,
  PiggyBank,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Settings,
  Bike,
  Compass,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useDirectorStore } from "@/store/useDirectorStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const activeTab = useDirectorStore((s) => s.activeTab);
  const setActiveTab = useDirectorStore((s) => s.setActiveTab);
  const structures = useDirectorStore((s) => s.structures);
  const tasks = useDirectorStore((s) => s.tasks);
  const invoices = useDirectorStore((s) => s.invoices);
  // Compute counters safely
  const pendingTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== "Completato").length;
  }, [tasks]);
  const activeStrCount = useMemo(() => {
    return structures.filter((s) => s.paymentStatus === "paid").length;
  }, [structures]);
  const pendingInvoicesCount = useMemo(() => {
    return invoices.filter((i) => i.status === "pending").length;
  }, [invoices]);
  const menuItems = [
    { id: "dashboard", label: "Mission Control", icon: Home },
    { id: "structures", label: "Attività Aderenti", icon: Users, badge: activeStrCount },
    { id: "ledger", label: "Registro Finanziario", icon: PiggyBank },
    { id: "roadmap", label: "Roadmap Progetto", icon: Briefcase, badge: pendingTasksCount },
    { id: "import", label: "Importatore CRM", icon: FileSpreadsheet },
    { id: "invoices", label: "Fatture & Partner", icon: FileText, badge: pendingInvoicesCount },
  ];
  return (
    <Sidebar className="border-r border-slate-800 bg-[#0F172A]">
      <SidebarHeader className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#F38020] to-orange-600 h-9 w-9 rounded-xl flex items-center justify-center shadow-md">
            <Bike className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">TSKBikeHub</span>
            <p className="text-[10px] text-orange-500 font-mono font-bold tracking-wider uppercase">DIRECTOR</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-2xs uppercase font-semibold px-3 mb-2 tracking-wider">
            Moduli di Controllo
          </SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={isActive}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#F38020] text-white shadow-md shadow-orange-500/10"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge !== undefined && item.badge > 0 && (
                    <SidebarMenuBadge className="bg-slate-950 text-orange-400 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-slate-800 my-4" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-2xs uppercase font-semibold px-3 mb-2 tracking-wider">
            Stato Sistema
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem className="px-3 py-1 flex items-center gap-2 text-2xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Durable Object Connesso</span>
            </SidebarMenuItem>
            <SidebarMenuItem className="px-3 py-1 flex items-center gap-2 text-2xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              <span>Offline Auto-Sinc attivo</span>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-800 p-4">
        <div className="text-center text-[10px] text-slate-500 font-mono">
          TSKBikeHub v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}