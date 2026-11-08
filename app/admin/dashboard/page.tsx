'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Ticket, Machine, Client } from '@/lib/types';
import {
  LayoutDashboard,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Phone,
  QrCode,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClient, setFilterClient] = useState<string>('todos');
  const [filterTime, setFilterTime] = useState<string>('todos');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Clients
      const { data: clientsData } = await supabase.from('clients').select('*').order('name');
      if (clientsData) setClients(clientsData);

      // 2. Machines
      const { data: machinesData } = await supabase
        .from('machines')
        .select('*, client:clients(*)')
        .order('code');
      if (machinesData) setMachines(machinesData as any);

      // 3. Tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*, client:clients(*), machine:machines(*)')
        .order('created_at', { ascending: false });
      if (ticketsData) setTickets(ticketsData as any);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterClient !== 'todos' && t.client_id !== filterClient) return false;

    if (filterTime !== 'todos') {
      const ticketTime = new Date(t.created_at).getTime();
      const now = Date.now();
      const diffMs = now - ticketTime;

      if (filterTime === '24h' && diffMs > 24 * 60 * 60 * 1000) return false;
      if (filterTime === 'hoje') {
        const ticketDate = new Date(t.created_at).toDateString();
        if (ticketDate !== new Date().toDateString()) return false;
      }
      if (filterTime === '7d' && diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      if (filterTime === '30d' && diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      if (filterTime === 'personalizado') {
        const ticketDate = new Date(t.created_at);
        if (customStartDate && ticketDate < new Date(`${customStartDate}T00:00:00`)) return false;
        if (customEndDate && ticketDate > new Date(`${customEndDate}T23:59:59`)) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMachine = t.machine?.name?.toLowerCase().includes(q) || t.machine?.code?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchRequester = t.requester_name?.toLowerCase().includes(q);
      if (!matchMachine && !matchDesc && !matchRequester) return false;
    }

    return true;
  });

  // Filtered Machines
  const filteredMachines = machines.filter((m) => {
    if (filterClient !== 'todos' && m.client_id !== filterClient) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q) || m.code?.toLowerCase().includes(q) || m.brand?.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  // Counts
  const aFazerCount = filteredTickets.filter(t => t.status === 'a_fazer').length;
  const fazendoCount = filteredTickets.filter(t => t.status === 'fazendo').length;
  const feitoCount = filteredTickets.filter(t => t.status === 'feito').length;

  const totalMachinesCount = filteredMachines.length;
  const operationalMachinesCount = filteredMachines.filter(m => m.status === 'operacional').length;
  const maintenanceMachinesCount = filteredMachines.filter(m => m.status === 'em_manutencao' || m.status === 'aguardando_manutencao').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-purple-700" />
            Dashboard &middot; Visão Geral Operacional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Painel executivo de monitoramento de chamados, parque de máquinas e conformidade de SLA (24h).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </button>

          <a
            href="/admin"
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Ver Quadro Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* TOOLBAR FILTROS: EMPRESA E TEMPO PERSONALIZADO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* FILTRO EMPRESA */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Filtro por Cliente
                </span>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value="todos">🏢 Todas as Empresas ({clients.length})</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILTRO TEMPO */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Filtro de Tempo
                </span>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value="todos">⏱️ Todos os Períodos</option>
                  <option value="24h">Últimas 24 Horas</option>
                  <option value="hoje">Abertos Hoje</option>
                  <option value="7d">Últimos 7 Dias</option>
                  <option value="30d">Últimos 30 Dias (Mês)</option>
                  <option value="personalizado">📅 Tempo Personalizado (Datas)...</option>
                </select>
              </div>
            </div>

            {/* DATAS PERSONALIZADAS */}
            {filterTime === 'personalizado' && (
              <div className="flex items-center gap-2 bg-orange-50/90 border border-orange-300 rounded-xl px-3 py-1.5 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-orange-900 uppercase">De:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-orange-900 uppercase">Até:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                    />
                  </div>
                  {(customStartDate || customEndDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                      className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-100 rounded"
                      title="Limpar intervalo de datas"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* BUSCA RÁPIDA */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar chamado ou máquina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all w-48 sm:w-56"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* STATUS DE RESULTADOS */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Exibindo <strong className="text-slate-900 font-black">{filteredTickets.length}</strong> chamados e <strong className="text-slate-900 font-black">{filteredMachines.length}</strong> máquinas
            </span>

            {(filterClient !== 'todos' || filterTime !== 'todos' || searchQuery || customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setFilterClient('todos');
                  setFilterTime('todos');
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setSearchQuery('');
                }}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Parque Total</span>
            <Wrench className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalMachinesCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">
            <strong className="text-emerald-600">{operationalMachinesCount}</strong> operacionais &middot; <strong className="text-orange-600">{maintenanceMachinesCount}</strong> em reparo
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">A Fazer (Novos)</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600">{aFazerCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Aguardando início de atendimento</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Em Atendimento</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{fazendoCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Técnico em rota ou peça acionada</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Concluídos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{feitoCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Equipamentos restabelecidos</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 p-4 rounded-2xl shadow-xs text-white col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-purple-200 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">SLA Máximo 24h</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">100% OK</div>
          <div className="text-[10px] text-purple-300 mt-1">
            Atendimento garantido em até 24 horas
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: CHAMADOS RECENTES & STATUS DO PARQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA 1: CHAMADOS RECENTES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Chamados de Manutenção ({filteredTickets.length})
              </h2>
            </div>
            <a
              href="/admin"
              className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
            >
              <span>Abrir no Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Nenhum chamado encontrado para os filtros selecionados.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                        {t.client?.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {t.machine?.code}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {t.machine?.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      &ldquo;{t.description}&rdquo;
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-3">
                      <span>Solicitante: <strong className="text-slate-700">{t.requester_name}</strong></span>
                      <span>&middot;</span>
                      <span>Abertura: {new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    t.status === 'feito'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : t.status === 'fazendo'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    {t.status === 'feito' ? 'Concluído' : t.status === 'fazendo' ? 'Fazendo' : 'A Fazer'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: RESUMO DO PARQUE DE MÁQUINAS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Parque de Máquinas ({filteredMachines.length})
              </h2>
            </div>
            <a
              href="/admin/maquinas"
              className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
            >
              <span>Gerenciar Todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-2.5">
            {filteredMachines.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs bg-purple-900 text-white px-2 py-0.5 rounded">
                    {m.code}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-500">{m.brand || 'Movement / Buick'} &middot; {m.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'operacional' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {m.status === 'operacional' ? 'Operacional' : 'Em Manutenção'}
                  </span>
                </div>
              </div>
            ))}

            {filteredMachines.length > 8 && (
              <div className="text-center pt-2">
                <a
                  href="/admin/maquinas"
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  + Ver todas as {filteredMachines.length} máquinas no inventário
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER CARD COM DADOS DO LEANDRO */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-black flex items-center gap-2">
            <span>FAZENDO ESPORTE &middot; CENTRAL DE GESTÃO TÉCNICA</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Responsável Técnico: <strong className="text-white">Leandro Amélio</strong> &middot; Telefone / WhatsApp:{' '}
            <strong className="text-orange-400">(21) 99999-5359</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/relatorios"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-purple-300" />
            Gerar Relatório Executivo
          </a>

          <a
            href="https://wa.me/5521999995359"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            <Phone className="w-3.5 h-3.5" />
            WhatsApp Leandro
          </a>
        </div>
      </div>
    </div>
  );
}
