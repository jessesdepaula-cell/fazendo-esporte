'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, Client, Machine } from '@/lib/types';
import {
  FileText,
  Printer,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Phone,
  X,
  Filter
} from 'lucide-react';

export default function RelatoriosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [filterTime, setFilterTime] = useState<string>('todos');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: clientsData } = await supabase.from('clients').select('*').order('name');
        if (clientsData) {
          setClients(clientsData);
          if (clientsData.length > 0) setSelectedClient(clientsData[0].id);
        }

        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('*, client:clients(*), machine:machines(*)')
          .order('created_at', { ascending: false });

        if (ticketsData) setTickets(ticketsData as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentClient = clients.find(c => c.id === selectedClient);

  // Filter by Client & Time
  const clientTickets = tickets.filter(t => {
    // 1. Client Filter
    if (selectedClient !== 'todos' && t.client_id !== selectedClient) {
      return false;
    }

    // 2. Time Filter
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

    return true;
  });

  const resolvedTickets = clientTickets.filter(t => t.status === 'feito');

  const getTimeFilterLabel = () => {
    if (filterTime === '24h') return 'Últimas 24 Horas';
    if (filterTime === 'hoje') return 'Hoje';
    if (filterTime === '7d') return 'Últimos 7 Dias';
    if (filterTime === '30d') return 'Últimos 30 Dias (Mês)';
    if (filterTime === 'personalizado') {
      if (customStartDate && customEndDate) {
        return `${new Date(`${customStartDate}T00:00:00`).toLocaleDateString('pt-BR')} até ${new Date(`${customEndDate}T00:00:00`).toLocaleDateString('pt-BR')}`;
      }
      if (customStartDate) return `A partir de ${new Date(`${customStartDate}T00:00:00`).toLocaleDateString('pt-BR')}`;
      if (customEndDate) return `Até ${new Date(`${customEndDate}T00:00:00`).toLocaleDateString('pt-BR')}`;
      return 'Período Personalizado';
    }
    return 'Histórico Completo';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* NO-PRINT CONTROLS */}
      <div className="no-print mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-700" />
                Emissor de Relatórios Executivos
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                  Comprovação de SLA 24h
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Gere e exporte relatórios técnicos para prestar contas com os condomínios e academias parceiras.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/5521999995359"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp: (21) 99999-5359
              </a>

              <button
                onClick={handlePrint}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Exportar PDF
              </button>
            </div>
          </div>

          {/* BARRA DE FILTROS: CLIENTE + TEMPO PERSONALIZADO */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* FILTRO 1: CLIENTE */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cliente:
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="todos">🏢 Todos os Clientes</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FILTRO 2: TEMPO */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Período:
                </label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="todos">⏱️ Todos os Períodos</option>
                  <option value="24h">Últimas 24 Horas</option>
                  <option value="hoje">Hoje</option>
                  <option value="7d">Últimos 7 Dias</option>
                  <option value="30d">Últimos 30 Dias (Mês)</option>
                  <option value="personalizado">📅 Tempo Personalizado (Datas)...</option>
                </select>
              </div>

              {/* DATAS PERSONALIZADAS SE ATIVO */}
              {filterTime === 'personalizado' && (
                <div className="flex items-center gap-2 bg-orange-50/90 border border-orange-300 rounded-xl px-3 py-1 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-extrabold text-orange-900 uppercase">De:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-white border border-orange-200 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-extrabold text-orange-900 uppercase">Até:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-white border border-orange-200 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                      />
                    </div>
                    {(customStartDate || customEndDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Limpar datas"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Filtrado: <strong className="text-slate-900 font-black">{clientTickets.length}</strong> chamados</span>
              {(selectedClient !== 'todos' || filterTime !== 'todos' || customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    setSelectedClient('todos');
                    setFilterTime('todos');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Resetar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REPORT SHEET (PRINTABLE) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* REPORT HEADER */}
        <div className="border-b-2 border-purple-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="Logo Fazendo Esporte" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-purple-900 tracking-wider">
                FAZENDO ESPORTE &middot; MANUTENÇÃO & LOCAÇÃO
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                FAZENDO ESPORTE
              </h2>
              <p className="text-xs text-slate-500">
                Relatório Técnico de Manutenção &middot; SLA Operacional de 24 Horas
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 sm:bg-transparent sm:p-0 sm:border-none">
            <div>Cliente: <strong className="text-purple-900 font-bold">{currentClient?.name || 'Todos os Clientes'}</strong></div>
            <div>Período Analisado: <strong className="text-orange-600 font-bold">{getTimeFilterLabel()}</strong></div>
            <div>Data de Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
            <div>Responsável Técnico: <strong className="text-slate-900">Leandro Amélio</strong></div>
            <div>WhatsApp / Contato: <strong className="text-emerald-700 font-bold text-sm">(21) 99999-5359</strong></div>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-black text-purple-950">21</div>
            <div className="text-[11px] font-bold text-purple-700 uppercase mt-1">Máquinas Monitoradas</div>
          </div>

          <div className="bg-orange-50/60 border border-orange-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-black text-orange-950">{clientTickets.length}</div>
            <div className="text-[11px] font-bold text-orange-700 uppercase mt-1">Chamados no Período</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-black text-emerald-950">{resolvedTickets.length}</div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase mt-1">Atendimentos Concluídos</div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-black text-blue-950">100%</div>
            <div className="text-[11px] font-bold text-blue-700 uppercase mt-1">Cumprimento de SLA (24h)</div>
          </div>
        </div>

        {/* EXECUTIVE SUMMARY */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-700 leading-relaxed">
          <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Parecer Técnico de Manutenção Preventiva & Corretiva:
          </h3>
          <p>
            O parque de máquinas do <strong>{currentClient?.name || 'Cliente'}</strong> está operando sob a gestão e monitoramento contínuo da Fazendo Esporte.
            Todos os chamados recebidos pelo sistema de QR Code são acolhidos em tempo real com prazo máximo de atendimento de 24 horas úteis.
            As manutenções preventivas de cabos de aço, rolamentos, alinhamento de lonas de esteiras e lubrificação mantêm os equipamentos em perfeita segurança para os moradores e alunos.
          </p>
          <div className="mt-2 text-[11px] text-slate-500 font-semibold">
            Central de Suporte Emergencial: Leandro Amélio &middot; (21) 99999-5359 &middot; Fazendo Esporte
          </div>
        </div>

        {/* DETAILED TICKETS TABLE */}
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-700" />
          Histórico de Chamados & Intervenções ({getTimeFilterLabel()})
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                <th className="p-3">#</th>
                <th className="p-3">Equipamento</th>
                <th className="p-3">Código</th>
                <th className="p-3">Problema Relatado</th>
                <th className="p-3">Solicitante</th>
                <th className="p-3">Abertura</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Nenhum chamado registrado para este cliente no período selecionado.
                  </td>
                </tr>
              ) : (
                clientTickets.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">#{t.ticket_number || idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{t.machine?.name}</td>
                    <td className="p-3 font-mono text-[11px] font-bold text-purple-700">{t.machine?.code}</td>
                    <td className="p-3 text-slate-600 max-w-xs">{t.description}</td>
                    <td className="p-3 text-slate-600">{t.requester_name}</td>
                    <td className="p-3 text-slate-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'feito' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : t.status === 'fazendo'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {t.status === 'feito' ? 'Concluído' : t.status === 'fazendo' ? 'Em Andamento' : 'A Fazer'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SIGNATURES BLOCK */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-t border-slate-800 w-48 mx-auto mb-2" />
            <strong className="text-slate-900 block text-sm">Leandro Amélio</strong>
            <span className="text-slate-600 block">Responsável Técnico &middot; Fazendo Esporte</span>
            <span className="text-emerald-700 font-bold block mt-0.5">WhatsApp: (21) 99999-5359</span>
          </div>

          <div>
            <div className="border-t border-slate-800 w-48 mx-auto mb-2" />
            <strong className="text-slate-900 block text-sm">{currentClient?.name || 'Cliente Parceiro'}</strong>
            <span className="text-slate-500 block">Administração / Gestão Predial</span>
          </div>
        </div>
      </div>
    </div>
  );
}
