'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, TicketStatus } from '@/lib/types';
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
  Sparkles
} from 'lucide-react';

export default function KanbanPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClientId, setFilterClientId] = useState<string>('todos');
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

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterClientId === 'todos') return true;
    return t.client_id === filterClientId;
  });

  const aFazerTickets = filteredTickets.filter((t) => t.status === 'a_fazer');
  const fazendoTickets = filteredTickets.filter((t) => t.status === 'fazendo');
  const feitoTickets = filteredTickets.filter((t) => t.status === 'feito');

  // Helper for SLA countdown calculation
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

    // Percent of 24h consumed
    const consumed = (24 * 3600 - totalSeconds) / (24 * 3600);
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
              SLA 24H Ativo
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os chamados abertos via QR Code em tempo real. Cada chamado possui até 24 horas para atendimento.
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
                      "{ticket.description}"
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
              fazendoTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold p-2 rounded-lg mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Cliente Notificado
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">
                      Em Rota / Peça
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
                    "{ticket.description}"
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
              ))
            )}
          </div>
        </div>

        {/* ==================== COLUNA 3: FEITO ==================== */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                3. Feito (Concluído)
              </h2>
            </div>
            <span className="bg-emerald-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
              {feitoTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {feitoTickets.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-400">
                Nenhum chamado concluído recentemente.
              </div>
            ) : (
              feitoTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all opacity-90"
                >
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold p-2 rounded-lg mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Reparo Concluído
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      Dentro do SLA
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

                  <h3 className="text-sm font-black text-slate-900 mb-1">
                    {ticket.machine?.name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-2">
                    Defeito resolvido: "{ticket.description}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                    <span>Atendido por: Leandro Amélio</span>
                    <span className="text-emerald-600 font-bold">Liberado p/ uso</span>
                  </div>
                </div>
              ))
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
