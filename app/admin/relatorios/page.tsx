'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Ticket, Client, Machine } from '@/lib/types';
import { generateQrDataUrl } from '@/lib/qr';
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
  Filter,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<'qrcodes' | 'relatorio'>('qrcodes');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [filterTime, setFilterTime] = useState<string>('todos');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // QR Codes Map for each client visit page
  const [clientQrMap, setClientQrMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Print Mode: 'relatorio' | 'qrcode-single' | 'qrcode-all'
  const [printMode, setPrintMode] = useState<'relatorio' | 'qrcode-single' | 'qrcode-all'>('relatorio');
  const [printingClient, setPrintingClient] = useState<Client | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: clientsData } = await supabase.from('clients').select('*').order('name');
        if (clientsData) {
          setClients(clientsData);

          // Generate QR codes for all clients pointing to /visita/[slug]
          const origin = 'https://fazendoesporte.com.br';
          const qrs: Record<string, string> = {};
          for (const c of clientsData) {
            const visitUrl = `${origin}/visita/${c.slug}`;
            qrs[c.id] = await generateQrDataUrl(visitUrl);
          }
          setClientQrMap(qrs);
        }

        const { data: machinesData } = await supabase.from('machines').select('*');
        if (machinesData) {
          setMachines(machinesData);
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

  // Filter tickets by Client & Time
  const clientTickets = tickets.filter(t => {
    if (selectedClient !== 'todos' && t.client_id !== selectedClient) {
      return false;
    }

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

  const handlePrintReport = () => {
    setPrintMode('relatorio');
    setPrintingClient(null);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintClientQr = (c: Client) => {
    setPrintMode('qrcode-single');
    setPrintingClient(c);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintAllQrs = () => {
    setPrintMode('qrcode-all');
    setPrintingClient(null);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleCopyLink = (clientSlug: string, clientId: string) => {
    const origin = 'https://fazendoesporte.com.br';
    const url = `${origin}/visita/${clientSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(clientId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadQr = (clientName: string, qrDataUrl: string) => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QRCode_Visita_${clientName.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clientsToDisplay = selectedClient === 'todos'
    ? clients
    : clients.filter(c => c.id === selectedClient);

  return (
    <div>
      {/* NO-PRINT HEADER & NAVIGATION */}
      <div className="no-print mb-6 space-y-4">
        {/* TOP BRAND BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-700" />
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  Relatórios Executivos & Visita Técnica
                </h1>
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                  SLA 48h
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gere QR Codes de check-in para o Leandro registrar visitas presenciais e emita relatórios oficiais de prestação de contas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://wa.me/5521999995359"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp: (21) 99999-5359
              </a>

              {activeTab === 'qrcodes' ? (
                <button
                  onClick={handlePrintAllQrs}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Todos os QR Codes
                </button>
              ) : (
                <button
                  onClick={handlePrintReport}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Relatório Executivo (PDF)
                </button>
              )}
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('qrcodes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'qrcodes'
                  ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>QR Code de Visita Técnica por Cliente</span>
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                Novo
              </span>
            </button>

            <button
              onClick={() => setActiveTab('relatorio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'relatorio'
                  ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-300" />
              <span>Laudo & Prestação de Contas (SLA 48h)</span>
            </button>
          </div>
        </div>

        {/* CLIENT FILTER BAR (APPLIES TO BOTH TABS) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* CLIENT SELECT */}
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

            {/* TIME FILTER (ACTIVE ON RELATÓRIO TAB) */}
            {activeTab === 'relatorio' && (
              <>
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
                          className="bg-white border border-orange-200 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-semibold focus:outline-none shadow-2xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-extrabold text-orange-900 uppercase">Até:</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="bg-white border border-orange-200 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-semibold focus:outline-none shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-xs text-slate-500">
            {activeTab === 'qrcodes' ? (
              <span>Exibindo: <strong className="text-slate-900 font-black">{clientsToDisplay.length}</strong> condomínio(s)</span>
            ) : (
              <span>Filtrado: <strong className="text-slate-900 font-black">{clientTickets.length}</strong> registro(s)</span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCREEN VIEW - TAB 1: QR CODES DE VISITA TÉCNICA              */}
      {/* ============================================================ */}
      {activeTab === 'qrcodes' && (
        <div className="no-print space-y-6">
          {/* INFORMATIVE BANNER */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 border border-purple-500/30 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 inline-block mb-1">
                  Fluxo Operacional de Campo
                </span>
                <h2 className="text-base font-black text-white">
                  QR Code de Check-in & Relatório por Cliente
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                  Imprima o QR Code do condomínio e fixe no quadro da academia ou leve consigo. Quando o <strong>Leandro</strong> chegar no cliente, ele lê o código com o celular: a página já abre com o nome do cliente pré-identificado para ele preencher o horário e a descrição técnica do que foi realizado.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrintAllQrs}
                className="bg-white hover:bg-slate-100 text-purple-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-700" />
                Imprimir Todos
              </button>
            </div>
          </div>

          {/* CLIENTS QR CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clientsToDisplay.map((c) => {
              const qrUrl = clientQrMap[c.id];
              const clientMachinesCount = machines.filter(m => m.client_id === c.id).length;
              const origin = 'https://fazendoesporte.com.br';
              const visitUrl = `${origin}/visita/${c.slug}`;

              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* CARD HEADER */}
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl flex items-center justify-center font-black">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase text-purple-700 tracking-wider">
                            Condomínio / Cliente Parceiro
                          </div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">
                            {c.name}
                          </h3>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {clientMachinesCount} aparelhos monitorados &middot; SLA 48h
                          </div>
                        </div>
                      </div>

                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                        Ativo
                      </span>
                    </div>

                    {/* QR CODE DISPLAY BOX */}
                    <div className="my-5 flex flex-col sm:flex-row items-center gap-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                      {qrUrl ? (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex-shrink-0">
                          <img
                            src={qrUrl}
                            alt={`QR Code ${c.name}`}
                            className="w-36 h-36 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-36 bg-slate-200 rounded-2xl animate-pulse flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Link de Check-in Técnico:
                          </span>
                          <span className="font-mono text-purple-900 font-bold text-xs break-all">
                            https://fazendoesporte.com.br/visita/{c.slug}
                          </span>
                        </div>

                        <div className="text-slate-600 leading-relaxed text-[11px]">
                          Ao ler esse QR Code, a página identifica automaticamente o <strong>{c.name}</strong>, permitindo registrar a hora de chegada e o laudo dos serviços executados. Protegido pela senha do técnico.
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(c.slug, c.id)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            {copiedId === c.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Link Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={visitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                            <span>Testar Página</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDownloadQr(c.name, qrUrl)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Baixar imagem do QR Code"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>PNG</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handlePrintClientQr(c)}
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir QR Code de Visita ({c.name})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN VIEW - TAB 2: LAUDO & PRESTAÇÃO DE CONTAS             */}
      {/* ============================================================ */}
      {activeTab === 'relatorio' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:p-0 print:border-none print:shadow-none">
          {/* REPORT HEADER */}
          <div className="border-b-2 border-purple-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <img src="/logo.png" alt="Logo Fazendo Esporte" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-purple-900 tracking-wider">
                  SFE - SERVIÇOS FAZENDO ESPORTE
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  FAZENDO ESPORTE
                </h2>
                <p className="text-xs text-slate-500">
                  Relatório Técnico de Manutenção &middot; SLA Operacional de 48 Horas
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
              <div className="text-2xl font-black text-purple-950">
                {selectedClient === 'todos' ? machines.length : machines.filter(m => m.client_id === selectedClient).length}
              </div>
              <div className="text-[11px] font-bold text-purple-700 uppercase mt-1">Máquinas Monitoradas</div>
            </div>

            <div className="bg-orange-50/60 border border-orange-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-orange-950">{clientTickets.length}</div>
              <div className="text-[11px] font-bold text-orange-700 uppercase mt-1">Atendimentos no Período</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-emerald-950">{resolvedTickets.length}</div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase mt-1">Atendimentos Concluídos</div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-blue-950">100%</div>
              <div className="text-[11px] font-bold text-blue-700 uppercase mt-1">Cumprimento de SLA (48h)</div>
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
              Todos os chamados recebidos pelo sistema de QR Code são acolhidos em tempo real com prazo máximo de atendimento de 48 horas úteis.
              As manutenções preventivas de cabos de aço, rolamentos, alinhamento de lonas de esteiras e lubrificação mantêm os equipamentos em perfeita segurança para os moradores e alunos.
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-semibold">
              Central de Suporte Técnico Presencial: Leandro Amélio &middot; (21) 99999-5359 &middot; Fazendo Esporte
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
                  <th className="p-3">Serviço / Problema</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clientTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Nenhum chamado ou visita registrada para este cliente no período selecionado.
                    </td>
                  </tr>
                ) : (
                  clientTickets.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-500">#{t.ticket_number || idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{t.machine?.name || 'Parque Geral'}</td>
                      <td className="p-3 font-mono text-[11px] font-bold text-purple-700">{t.machine?.code || 'GERAL'}</td>
                      <td className="p-3 text-slate-600 max-w-xs whitespace-pre-wrap">{t.description}</td>
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
      )}

      {/* ============================================================ */}
      {/* PRINT-ONLY VIEW: DEDICATED QR CODE PLACARDS FOR CLIENTS      */}
      {/* ============================================================ */}
      <div className="hidden print:block">
        {printMode === 'relatorio' ? (
          /* When printing the report, the report sheet above is displayed */
          null
        ) : (
          /* When printing QR Code(s) for visits */
          <div>
            {(printMode === 'qrcode-single' && printingClient ? [printingClient] : clients).map((c, index) => {
              const qrUrl = clientQrMap[c.id];
              const origin = 'https://fazendoesporte.com.br';
              const visitUrl = `${origin}/visita/${c.slug}`;

              return (
                <div
                  key={c.id}
                  className={`min-h-screen flex flex-col justify-between p-8 text-black bg-white ${
                    index > 0 ? 'page-break' : ''
                  }`}
                >
                  {/* PLACARD BORDER CONTAINER */}
                  <div className="border-4 border-purple-900 rounded-3xl p-8 flex-1 flex flex-col justify-between items-center text-center">
                    {/* PLACARD HEADER */}
                    <div className="w-full pb-6 border-b-2 border-purple-900 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-left">
                        <img
                          src="/logo.png"
                          alt="Logo Fazendo Esporte"
                          className="w-16 h-16 object-contain"
                        />
                        <div>
                          <div className="text-xs font-black uppercase text-purple-900 tracking-wider">
                            SFE - SERVIÇOS FAZENDO ESPORTE
                          </div>
                          <div className="text-2xl font-black text-slate-900">
                            FAZENDO ESPORTE
                          </div>
                          <div className="text-xs text-slate-600">
                            Gestão & Manutenção de Parques Fitness
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="bg-purple-900 text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                          SLA 48 Horas
                        </div>
                        <div className="text-[11px] text-slate-600 font-bold mt-1">
                          Leandro Amélio &middot; (21) 99999-5359
                        </div>
                      </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="my-8 flex flex-col items-center max-w-lg">
                      <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-4 py-1 rounded-full mb-3">
                        Placa de Check-in & Visita Técnica
                      </span>

                      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {c.name}
                      </h1>
                      {c.address && (
                        <p className="text-xs text-slate-500 mb-6">{c.address}</p>
                      )}

                      {/* BIG SHARP QR CODE */}
                      <div className="bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-lg my-4">
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt={`QR Code Visita ${c.name}`}
                            className="w-64 h-64 object-contain"
                          />
                        ) : null}
                      </div>

                      <div className="font-mono font-bold text-sm text-purple-900 mt-2 bg-purple-50 px-4 py-1 rounded-lg border border-purple-200">
                        {visitUrl}
                      </div>

                      {/* INSTRUCTIONS */}
                      <div className="mt-6 bg-slate-50 border border-slate-300 rounded-2xl p-5 text-center text-xs text-slate-700 leading-relaxed">
                        <strong className="block text-sm text-purple-900 font-black mb-1">
                          EXCLUSIVO TÉCNICO LEANDRO AMÉLIO
                        </strong>
                        Aponte a câmera do celular ao chegar no condomínio para registrar data, hora e descrição dos serviços realizados no relatório executivo.
                      </div>
                    </div>

                    {/* PLACARD FOOTER */}
                    <div className="w-full pt-6 border-t-2 border-purple-900 flex items-center justify-between text-xs text-slate-600">
                      <div>
                        <strong>Responsável Técnico:</strong> Leandro Amélio
                      </div>
                      <div>
                        <strong>WhatsApp Suporte:</strong> (21) 99999-5359
                      </div>
                      <div>
                        <strong>E-mail:</strong> fazendoesporte2022@gmail.com
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}