'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, TicketStatus, Client } from '@/lib/types';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  Phone,
  Building2,
  Wrench,
  Camera,
  RefreshCw,
  BellRing,
  Filter,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Search,
  Calendar
} from 'lucide-react';

export default function KanbanPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClientId, setFilterClientId] = useState<string>('todos');
  const [filterTime, setFilterTime] = useState<string>('todos');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Timer tick for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to sidebar client filter
  useEffect(() => {
    const handleFilter = (e: any) => {
      setFilterClientId(e.detail || 'todos');
    };
    window.addEventListener('filter-client', handleFilter);
    return () => window.removeEventListener('filter-client', handleFilter);
  }, []);

  // Load clients
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('clients').select('*').order('name');
      if (data) setClients(data);
    }
    loadClients();
  }, []);

  // Load tickets
  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*, client:clients(*), machine:machines(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
      } else if (data) {
        setTickets(data as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadTickets();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tickets-updated'));
      }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Move ticket status
  const updateTicketStatus = async (ticket: Ticket, newStatus: TicketStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'fazendo') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'feito') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id);

      if (error) {
        alert('Erro ao atualizar status.');
        return;
      }

      // Update machine status
      if (newStatus === 'fazendo') {
        await supabase
          .from('machines')
          .update({ status: 'em_manutencao' })
          .eq('id', ticket.machine_id);

        showToast(
          `Notificação enviada para ${ticket.client?.name}: "Estamos cientes da sua situação, nossa equipe técnica está atuando para resolver!"`,
          'info'
        );
      } else if (newStatus === 'feito') {
        await supabase
          .from('machines')
          .update({ status: 'operacional' })
          .eq('id', ticket.machine_id);

        showToast(
          `Notificação de Conclusão enviada para ${ticket.client?.name}: "Manutenção da máquina ${ticket.machine?.name} concluída com sucesso! Equipamento liberado."`,
          'success'
        );
      }

      loadTickets();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tickets-updated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message: string, type: 'info' | 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 6000);
  };

  // Filter tickets by Company, Time & Search
  const filteredTickets = tickets.filter((t) => {
    // 1. Company Filter
    if (filterClientId !== 'todos' && t.client_id !== filterClientId) {
      return false;
    }

    // 2. Time Filter
    if (filterTime !== 'todos') {
      const ticketTime = new Date(t.created_at).getTime();
      const now = currentTime;
      const diffMs = now - ticketTime;

      if (filterTime === '48h' || filterTime === '24h') {
        if (diffMs > 48 * 60 * 60 * 1000) return false;
      } else if (filterTime === 'hoje') {
        const ticketDate = new Date(t.created_at).toDateString();
        const todayDate = new Date().toDateString();
        if (ticketDate !== todayDate) return false;
      } else if (filterTime === '7d') {
        if (diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (filterTime === '30d') {
        if (diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      } else if (filterTime === 'urgente') {
        if (t.status !== 'a_fazer') return false;
        const deadline = new Date(t.sla_deadline).getTime();
        const remainingHours = (deadline - now) / (1000 * 3600);
        if (remainingHours > 4) return false;
      } else if (filterTime === 'personalizado') {
        const ticketDate = new Date(t.created_at);
        if (customStartDate) {
          const start = new Date(`${customStartDate}T00:00:00`);
          if (ticketDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(`${customEndDate}T23:59:59`);
          if (ticketDate > end) return false;
        }
      }
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMachine = t.machine?.name?.toLowerCase().includes(q) || t.machine?.code?.toLowerCase().includes(q);
      const matchRequester = t.requester_name?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchClient = t.client?.name?.toLowerCase().includes(q);
      if (!matchMachine && !matchRequester && !matchDesc && !matchClient) {
        return false;
      }
    }

    return true;
  });

  const [showArchived, setShowArchived] = useState<boolean>(false);

  const aFazerTickets = filteredTickets.filter((t) => t.status === 'a_fazer');
  const fazendoTickets = filteredTickets.filter((t) => t.status === 'fazendo');
  
  // Concluídos: exibe por padrão os últimos 7 dias. Chamados com +7 dias vão para o Arquivo Histórico
  const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
  const allFeitoTickets = filteredTickets.filter((t) => t.status === 'feito');
  const feitoTickets = allFeitoTickets.filter((t) => {
    const compDate = t.completed_at ? new Date(t.completed_at).getTime() : new Date(t.created_at).getTime();
    return compDate >= sevenDaysAgo;
  });
  const arquivadosTickets = allFeitoTickets.filter((t) => {
    const compDate = t.completed_at ? new Date(t.completed_at).getTime() : new Date(t.created_at).getTime();
    return compDate < sevenDaysAgo;
  });

  // Helper for SLA countdown calculation (48 Hours)
  const getSlaRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const diff = deadline - currentTime;

    if (diff <= 0) {
      return { expired: true, text: 'SLA EXPIRADO', hours: 0, minutes: 0, seconds: 0, percent: 100 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Percent of 48h consumed
    const totalSlaSeconds = 48 * 3600;
    const consumed = (totalSlaSeconds - totalSeconds) / totalSlaSeconds;
    const percent = Math.min(100, Math.max(0, consumed * 100));

    return {
      expired: false,
      text: `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`,
      hours,
      minutes,
      seconds,
      percent
    };
  };

  // Helper for Completion Time metrics in Column 3 (Feito)
  const getCompletionStats = (ticket: Ticket) => {
    const created = new Date(ticket.created_at).getTime();
    const completed = ticket.completed_at ? new Date(ticket.completed_at).getTime() : currentTime;
    const deadline = new Date(ticket.sla_deadline).getTime();

    const elapsedMs = Math.max(0, completed - created);
    const elapsedHours = Math.floor(elapsedMs / (1000 * 3600));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 3600)) / (1000 * 60));

    const remainingMs = deadline - completed;
    const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 3600)));
    const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 3600)) / (1000 * 60)));

    const withinSla = remainingMs >= 0;

    const elapsedText = elapsedHours > 0 
      ? `${elapsedHours}h ${elapsedMinutes}min` 
      : `${elapsedMinutes} min`;

    return {
      elapsedHours,
      elapsedMinutes,
      elapsedText,
      remainingHours,
      remainingMinutes,
      withinSla
    };
  };

  return (
    <div>
      {/* NOTIFICATION TOAST (POPUP) */}
      {notificationToast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-2xl border text-white flex items-start gap-3 animate-slide-up ${
          notificationToast.type === 'success' 
            ? 'bg-emerald-900 border-emerald-500 shadow-emerald-900/40' 
            : 'bg-purple-900 border-purple-500 shadow-purple-900/40'
        }`}>
          <BellRing className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-orange-300 uppercase tracking-wider mb-0.5">
              Notificação Automática Disparada!
            </div>
            <p className="text-slate-100">{notificationToast.message}</p>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            Quadro de Manutenção &middot; Kanban
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full border border-orange-200">
              SLA 48H Ativo
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os chamados abertos via QR Code em tempo real. Cada chamado possui até 48 horas para atendimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTickets}
            className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          <a
            href="/qr/VA-13"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Simular Leitura QR Code
          </a>
        </div>
      </div>

      {/* BARRA DE FILTROS: EMPRESA & TEMPO */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* FILTRO 1: EMPRESA (CLIENTE) */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 transition-all">
              <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Filtro de Empresa
                </span>
                <select
                  value={filterClientId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterClientId(val);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('filter-client', { detail: val }));
                    }
                  }}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value="todos">🏢 Todas as Empresas ({tickets.length} chamados)</option>
                  {clients.map((c) => {
                    const count = tickets.filter(t => t.client_id === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count} chamados)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* FILTRO 2: TEMPO / PERÍODO */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 transition-all">
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
                  <option value="urgente">🔥 SLA Urgente (&lt; 4h)</option>
                  <option value="personalizado">📅 Tempo Personalizado (Datas)...</option>
                </select>
              </div>
            </div>

            {/* SELEÇÃO DE DATAS PERSONALIZADAS */}
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

            {/* BUSCA RÁPIDA (MÁQUINA OU SOLICITANTE) */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar máquina ou chamado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all w-48 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* STATUS COUNT & RESET */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Exibindo <strong className="text-slate-900 font-black">{filteredTickets.length}</strong> de {tickets.length} chamados
            </div>

            {(filterClientId !== 'todos' || filterTime !== 'todos' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterClientId('todos');
                  setFilterTime('todos');
                  setSearchQuery('');
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('filter-client', { detail: 'todos' }));
                  }
                }}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <X className="w-3 h-3" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KANBAN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* ==================== COLUNA 1: A FAZER ==================== */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                1. A Fazer (Novos Chamados)
              </h2>
            </div>
            <span className="bg-orange-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
              {aFazerTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {aFazerTickets.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                Nenhum chamado pendente no momento.
              </div>
            ) : (
              aFazerTickets.map((ticket) => {
                const sla = getSlaRemaining(ticket.sla_deadline);
                const isUrgent = sla.hours < 4 || sla.expired;

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all relative overflow-hidden ${
                      isUrgent 
                        ? 'border-red-400 bg-red-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* SLA COUNTDOWN BANNER */}
                    <div className={`p-2.5 rounded-lg mb-3 flex items-center justify-between text-xs font-bold ${
                      sla.expired
                        ? 'bg-red-600 text-white animate-pulse'
                        : isUrgent
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-purple-50 text-purple-900 border border-purple-200'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        SLA Restante:
                      </span>
                      <span className="font-mono text-sm tracking-tight">
                        {sla.text}
                      </span>
                    </div>

                    {/* CLIENT & MACHINE INFO */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 truncate">
                        <Building2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        {ticket.client?.name}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0">
                        {ticket.machine?.code}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {ticket.machine?.name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 leading-relaxed">
                      &ldquo;{ticket.description}&rdquo;
                    </p>

                    {/* PHOTO THUMBNAIL IF PRESENT */}
                    {ticket.photo_url && (
                      <div className="mb-3">
                        <button
                          onClick={() => setSelectedPhoto(ticket.photo_url)}
                          className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 relative group block"
                        >
                          <img
                            src={ticket.photo_url}
                            alt="Foto do defeito"
                            className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Camera className="w-3.5 h-3.5" /> Ver Foto
                          </div>
                        </button>
                      </div>
                    )}

                    {/* REQUESTER DETAILS */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Solicitante:</span>
                        <strong className="text-slate-800">{ticket.requester_name}</strong>
                      </div>

                      {ticket.requester_phone && (
                        <a
                          href={`https://wa.me/55${ticket.requester_phone.replace(/\D/g, '')}?text=Olá%20${ticket.requester_name},%20aqui%20é%20o%20Leandro%20da%20Fazendo%20Esporte%20sobre%20a%20máquina%20${ticket.machine?.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Zap
                        </a>
                      )}
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      onClick={() => updateTicketStatus(ticket, 'fazendo')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Mover para Fazendo (Avisar Cliente)
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================== COLUNA 2: FAZENDO ==================== */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-spin" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                2. Fazendo (Em Atendimento)
              </h2>
            </div>
            <span className="bg-blue-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
              {fazendoTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {fazendoTickets.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-400">
                Nenhum chamado em atendimento no momento.
              </div>
            ) : (
              fazendoTickets.map((ticket) => {
                const sla = getSlaRemaining(ticket.sla_deadline);
                const isUrgent = sla.hours < 8 || sla.expired;

                return (
                  <div
                    key={ticket.id}
                    className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                  >
                    {/* CRONÔMETRO CONTINUA VISÍVEL EM FAZENDO! */}
                    <div className={`p-2.5 rounded-lg mb-2.5 flex items-center justify-between text-xs font-bold ${
                      sla.expired
                        ? 'bg-red-600 text-white animate-pulse'
                        : isUrgent
                        ? 'bg-orange-100 text-orange-900 border border-orange-300'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                        <span>SLA Restante:</span>
                      </span>
                      <span className="font-mono text-sm tracking-tight font-black">
                        {sla.text}
                      </span>
                    </div>

                    <div className="bg-blue-50/70 text-blue-800 border border-blue-100 text-[11px] font-semibold px-2.5 py-1 rounded-lg mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Em Atendimento Técnico
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                        Cliente Notificado
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {ticket.client?.name}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        {ticket.machine?.code}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mb-2">
                      {ticket.machine?.name}
                    </h3>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mb-3">
                      &ldquo;{ticket.description}&rdquo;
                    </p>

                    <div className="text-[11px] text-slate-500 mb-3 space-y-1">
                      <div>Solicitante: <strong>{ticket.requester_name}</strong></div>
                      {ticket.started_at && (
                        <div className="text-slate-400">
                          Iniciado em: {new Date(ticket.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => updateTicketStatus(ticket, 'feito')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Marcar como Feito (Notificar Conclusão)
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================== COLUNA 3: FEITO ==================== */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                3. Feito (Últimos 7 dias)
              </h2>
            </div>
            <span className="bg-emerald-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
              {feitoTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {feitoTickets.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-400">
                Nenhum chamado concluído nos últimos 7 dias.
              </div>
            ) : (
              feitoTickets.map((ticket) => {
                const stats = getCompletionStats(ticket);

                return (
                  <div
                    key={ticket.id}
                    className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all"
                  >
                    {/* TEMPO DE CONCLUSÃO EM DESTAQUE */}
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 mb-2.5">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-900 mb-0.5">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          CONCLUÍDO EM {stats.elapsedText.toUpperCase()}
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                          {stats.withinSla ? 'Dentro do SLA' : 'SLA Excedido'}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        {stats.withinSla 
                          ? `Restavam ${stats.remainingHours}h de prazo (SLA 48h)` 
                          : `Concluído após o prazo de 48h`}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {ticket.client?.name}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        {ticket.machine?.code}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      {ticket.machine?.name}
                    </h3>

                    <p className="text-xs text-slate-500 mb-2">
                      Defeito resolvido: &ldquo;{ticket.description}&rdquo;
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                      <span>Atendido por: Leandro Amélio</span>
                      <span className="text-emerald-600 font-bold">Liberado p/ uso</span>
                    </div>
                  </div>
                );
              })
            )}

            {/* SEÇÃO DE ARQUIVADOS (+7 DIAS) */}
            {arquivadosTickets.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full text-center text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 py-2 px-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>{showArchived ? 'Ocultar Arquivados' : `📦 Ver Histórico Arquivado (+7 dias: ${arquivadosTickets.length})`}</span>
                </button>

                {showArchived && (
                  <div className="space-y-2 mt-3 animate-in fade-in duration-200">
                    {arquivadosTickets.map((ticket) => {
                      const stats = getCompletionStats(ticket);
                      return (
                        <div key={ticket.id} className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 text-xs opacity-80">
                          <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                            <span>{ticket.machine?.name} ({ticket.machine?.code})</span>
                            <span className="text-emerald-700 font-mono text-[11px]">Em {stats.elapsedText}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>{ticket.client?.name}</span>
                            <span>{ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString('pt-BR') : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PHOTO ZOOM MODAL */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-800">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhoto} alt="Avaria ampliada" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
