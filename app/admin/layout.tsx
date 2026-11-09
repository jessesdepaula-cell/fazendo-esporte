'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/types';
import {
  LayoutDashboard,
  Wrench,
  QrCode,
  FileText,
  Globe,
  Building2,
  Clock,
  Menu,
  X,
  Phone,
  LogOut,
  User,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [machinesCount, setMachinesCount] = useState<number>(0);
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);

  // Authentication State
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verifySession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }
      setCurrentUserEmail(data.session.user.email || 'Fazendoesporte2022@gmail.com');
      setCheckingAuth(false);
    }

    verifySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else if (session) {
        setCurrentUserEmail(session.user.email || 'Fazendoesporte2022@gmail.com');
        setCheckingAuth(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    async function loadClientsAndStats() {
      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (clientsData) {
        setClients(clientsData);
      }

      // Load machines count
      const { count: mCount } = await supabase
        .from('machines')
        .select('*', { count: 'exact', head: true });
      if (mCount !== null) {
        setMachinesCount(mCount);
      }

      // Load tickets counts
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('status');

      if (ticketsData) {
        setOpenTicketsCount(ticketsData.filter(t => t.status === 'a_fazer').length);
        setInProgressCount(ticketsData.filter(t => t.status === 'fazendo').length);
      }
    }

    loadClientsAndStats();

    // Listen to local event when status changes in Kanban
    const handleLocalUpdate = () => {
      loadClientsAndStats();
    };
    window.addEventListener('tickets-updated', handleLocalUpdate);

    // Subscribe to realtime ticket changes in Supabase
    const channel = supabase
      .channel('layout-tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadClientsAndStats();
        }
      )
      .subscribe();

    // Periodic safety poll every 5 seconds
    const interval = setInterval(loadClientsAndStats, 5000);

    return () => {
      window.removeEventListener('tickets-updated', handleLocalUpdate);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const navItems = [
    {
      label: 'Dashboard (Visão Geral)',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: 'Geral',
      badgeColor: 'bg-purple-900/60 text-purple-200 border border-purple-500/30'
    },
    {
      label: 'Quadro Kanban (SLA 48h)',
      href: '/admin',
      icon: Clock,
      badge: openTicketsCount > 0 ? `${openTicketsCount} A Fazer` : undefined,
      badgeColor: 'bg-orange-500 text-white'
    },
    {
      label: 'Parque de Máquinas',
      href: '/admin/maquinas',
      icon: Wrench,
      badge: machinesCount > 0 ? `${machinesCount} máq.` : 'Máquinas',
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      label: 'Senhas de Clientes',
      href: '/admin/clientes',
      icon: KeyRound,
      badge: 'Acesso QR',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      label: 'Gerador de Etiquetas QR',
      href: '/admin/etiquetas',
      icon: QrCode,
      badge: 'Imprimir A4',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      label: 'Relatórios Executivos',
      href: '/admin/relatorios',
      icon: FileText,
      badge: 'PDF',
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      label: 'Ver Site Institucional',
      href: '/',
      icon: Globe,
    }
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-xl flex items-center justify-center mb-4 animate-pulse">
          <Image src="/logo.png" alt="Logo" width={52} height={52} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
          <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Verificando Acesso Operacional...</span>
        </div>
        <p className="text-xs text-purple-400 font-medium">Fazendo Esporte &middot; Leandro Amélio</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100 flex flex-col md:flex-row print:h-auto print:overflow-visible print:bg-white">
      {/* MOBILE TOPBAR */}
      <div className="md:hidden print:hidden bg-slate-900 border-b border-purple-500/20 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg p-0.5 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <div className="text-sm font-black text-white">FAZENDO ESPORTE</div>
            <div className="text-[10px] text-purple-300">SFE - Serviços Fazendo Esporte</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSignOut}
            title="Sair do painel"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (FIXED VIEWPORT HEIGHT - NEVER ROLLS OFF SCREEN) */}
      <aside className={`
        print:hidden
        fixed md:relative inset-y-0 left-0 z-40
        w-72 h-full bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex-1 overflow-y-auto">
          {/* BRAND HEADER */}
          <div className="hidden md:flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
            <div className="w-11 h-11 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Image src="/logo.png" alt="Logo" width={38} height={38} className="object-contain" />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-wide">FAZENDO ESPORTE</div>
              <div className="text-[11px] text-purple-400 font-semibold">SFE - Serviços Fazendo Esporte</div>
              <div className="text-[10px] text-slate-500">Leandro Amélio</div>
            </div>
          </div>

          {/* SLA MONITOR BADGE */}
          <div className="bg-gradient-to-r from-purple-950/80 to-slate-800/80 border border-purple-500/30 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5 text-orange-400">
                <Clock className="w-3.5 h-3.5" />
                SLA Operacional (48h)
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                100% OK
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-lg font-black text-orange-400">{openTicketsCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">A Fazer</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-lg font-black text-blue-400">{inProgressCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fazendo</div>
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Módulos do Sistema
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR FOOTER & USER PROFILE (ALWAYS PINNED AT BOTTOM) */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 text-xs flex-shrink-0">
          <div className="flex items-center justify-between mb-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                LA
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Leandro Amélio</div>
                <div className="text-[10px] text-purple-300 font-mono truncate">{currentUserEmail}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sair do Sistema"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sessão Ativa</span>
            </div>
            <span className="text-slate-500 font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (INDEPENDENT RIGHT-SIDE SCROLL) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-100 print:bg-white print:overflow-visible print:h-auto print:p-0">
        {/* TOP STATUS BAR */}
        <header className="print:hidden hidden md:flex bg-white border-b border-slate-200 px-6 py-3.5 items-center justify-between shadow-xs sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
              Fazendo Esporte &middot; Central de Gestão & Manutenção
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
              SLA 48H Ativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              SLA Máximo: 48 Horas
            </div>

            <a
              href="https://wa.me/5521999995359"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp: (21) 99999-5359
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6 flex-1 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
