'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/types';
import {
  LayoutDashboard,
  Wrench,
  QrCode,
  FileText,
  Globe,
  Building2,
  Bell,
  Clock,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Phone,
  ShieldAlert,
  Plus
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientSlug, setSelectedClientSlug] = useState<string>('todos');
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);

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
  }, []);

  const navItems = [
    {
      label: 'Painel Kanban & SLA',
      href: '/admin',
      icon: LayoutDashboard,
      badge: openTicketsCount > 0 ? `${openTicketsCount} A Fazer` : undefined,
      badgeColor: 'bg-orange-500 text-white'
    },
    {
      label: 'Parque de Máquinas',
      href: '/admin/maquinas',
      icon: Wrench,
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
    },
    {
      label: 'Ver Site Institucional',
      href: '/',
      icon: Globe,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* MOBILE TOPBAR */}
      <div className="md:hidden bg-slate-900 border-b border-purple-500/20 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg p-0.5 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <div className="text-sm font-black text-white">FAZENDO ESPORTE</div>
            <div className="text-[10px] text-purple-300">Painel do Leandro Amélio</div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between
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
              <div className="text-[11px] text-purple-400 font-semibold">Central de Manutenção 24h</div>
              <div className="text-[10px] text-slate-500">Leandro Amélio</div>
            </div>
          </div>

          {/* SLA MONITOR BADGE */}
          <div className="bg-gradient-to-r from-purple-950/80 to-slate-800/80 border border-purple-500/30 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5 text-orange-400">
                <Clock className="w-3.5 h-3.5" />
                SLA Operacional (24h)
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

          {/* CLIENTS FILTER SECTION */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span>Filtrar por Cliente</span>
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedClientSlug('todos');
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('filter-client', { detail: 'todos' }));
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                  selectedClientSlug === 'todos'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <span>🏢 Todos os Clientes</span>
                <span className="text-[10px] bg-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded">
                  Geral
                </span>
              </button>

              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClientSlug(c.slug);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('filter-client', { detail: c.id }));
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedClientSlug === c.slug
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded flex-shrink-0">
                    21 máq.
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Navegação
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

        {/* SIDEBAR FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold text-[11px]">Sistema Online & Sincronizado</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Vibranium Aluguel de Equipamentos<br />
            Suporte Técnico: (21) 99999-5359
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP STATUS BAR */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3.5 items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Visualizando:
            </div>
            <div className="bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              {selectedClientSlug === 'todos' ? 'Todos os Clientes' : 'Condomínio Varandas do Atlântico'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              SLA Máximo: 24 Horas
            </div>

            <a
              href="https://wa.me/5521999995359"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp Leandro
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
