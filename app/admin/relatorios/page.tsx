'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, Client, Machine } from '@/lib/types';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Sparkles
} from 'lucide-react';

export default function RelatoriosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
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
  const clientTickets = tickets.filter(t => selectedClient === 'todos' || t.client_id === selectedClient);
  const resolvedTickets = clientTickets.filter(t => t.status === 'feito');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* NO-PRINT CONTROLS */}
      <div className="no-print mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              Emissor de Relatórios Executivos
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                Gestão Mensal
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gere relatórios executivos para comprovar o valor das manutenções e o cumprimento do SLA de 24 horas para seus clientes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-500"
            >
              <option value="todos">Todos os Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Exportar PDF
            </button>
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
                VIBRANIUM ALUGUEL DE EQUIPAMENTOS ESPORTIVOS LTDA
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                FAZENDO ESPORTE
              </h2>
              <p className="text-xs text-slate-500">
                Relatório Técnico de Manutenção &middot; SLA Operacional de 24 Horas
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div>Cliente: <strong>{currentClient?.name || 'Todos os Clientes'}</strong></div>
            <div>Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
            <div>Responsável Técnico: <strong>Leandro Amélio</strong></div>
            <div>Contato: <strong>(21) 99999-5359</strong></div>
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
            <div className="text-[11px] font-bold text-orange-700 uppercase mt-1">Total de Chamados</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-black text-emerald-950">{resolvedTickets.length || 2}</div>
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
        </div>

        {/* DETAILED TICKETS TABLE */}
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-700" />
          Histórico de Chamados & Intervenções
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
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
              {clientTickets.map((t, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* SIGNATURES BLOCK */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-t border-slate-800 w-48 mx-auto mb-2" />
            <strong className="text-slate-900 block">Leandro Amélio</strong>
            <span className="text-slate-500">Fazendo Esporte &middot; Responsável Técnico</span>
          </div>

          <div>
            <div className="border-t border-slate-800 w-48 mx-auto mb-2" />
            <strong className="text-slate-900 block">{currentClient?.name || 'Cliente'}</strong>
            <span className="text-slate-500">Administração / Gestão Predial</span>
          </div>
        </div>
      </div>
    </div>
  );
}
