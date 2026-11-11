'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Machine, Client } from '@/lib/types';
import { generateQrDataUrl, generateQrBadgePng } from '@/lib/qr';
import { Printer, Building2, QrCode, Sparkles, Check, ArrowLeft, Download, Layers } from 'lucide-react';

export default function EtiquetasPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  // Print Mode: 'completo' (etiqueta rica) ou 'minimalista' (somente QR + código)
  const [printMode, setPrintMode] = useState<'completo' | 'minimalista'>('completo');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: clientsData } = await supabase.from('clients').select('*').order('name');
        if (clientsData) {
          setClients(clientsData);
          if (clientsData.length > 0) {
            setSelectedClient(clientsData[0].id);
          }
        }

        const { data: machinesData } = await supabase
          .from('machines')
          .select('*, client:clients(*)')
          .order('code');

        if (machinesData) {
          setMachines(machinesData as any);
          const qrs: Record<string, string> = {};
          const origin = 'https://fazendoesporte.com.br';
          for (const m of machinesData) {
            const url = `${origin}/qr/${m.code}`;
            qrs[m.id] = await generateQrDataUrl(url);
          }
          setQrMap(qrs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentClient = clients.find(c => c.id === selectedClient);
  const clientMachines = machines.filter(m => selectedClient === 'todos' || m.client_id === selectedClient);

  // Chunk machines into pages of exactly 10 machines (2 columns x 5 rows) for A4
  const chunkIntoPages = (items: Machine[], size = 10): Machine[][] => {
    const pages: Machine[][] = [];
    for (let i = 0; i < items.length; i += size) {
      pages.push(items.slice(i, i + size));
    }
    return pages;
  };

  const pages = chunkIntoPages(clientMachines, 10);

  const handlePrintFull = () => {
    setPrintMode('completo');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handlePrintQrOnly = () => {
    setPrintMode('minimalista');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleDownloadBadge = async (m: Machine) => {
    const rawQr = qrMap[m.id];
    if (!rawQr) return;

    const badgeDataUrl = await generateQrBadgePng({
      qrDataUrl: rawQr,
      companyName: 'FAZENDO ESPORTE',
      companySubtitle: 'SFE - Serviços Fazendo Esporte',
      clientName: m.client?.name || currentClient?.name || 'Cliente Fazendo Esporte',
      machineName: m.name,
      machineCode: m.code,
      category: m.category,
      phone: '(21) 99999-5359'
    });

    const safeName = m.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = badgeDataUrl;
    a.download = `Adesivo_QR_${m.code}_${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      {/* NO-PRINT HEADER BAR */}
      <div className="no-print mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              Gerador de Etiquetas QR Code
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                10 Etiquetas por Folha A4
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Impressão ajustada com exatidão: 10 etiquetas por folha (2 colunas x 5 linhas), sem cortar a 9ª e 10ª máquina.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SELETOR DE CLIENTE */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-500"
            >
              <option value="todos">🏢 Todos os Clientes ({machines.length} máq.)</option>
              {clients.map((c) => {
                const count = machines.filter(m => m.client_id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} máq.)
                  </option>
                );
              })}
            </select>

            {/* BOTÃO 1: IMPRIMIR ETIQUETA COMPLETA */}
            <button
              onClick={handlePrintFull}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              title="Imprime a etiqueta com cabeçalho, nome da máquina, instruções e telefone"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiquetas Completas (A4)
            </button>

            {/* BOTÃO 2: IMPRIMIR SOMENTE QR CODES */}
            <button
              onClick={handlePrintQrOnly}
              className="bg-slate-800 hover:bg-slate-900 text-purple-200 hover:text-white border border-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              title="Imprime versão minimalista com QR Code grande e o código abaixo"
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              Imprimir Somente QR Codes (A4)
            </button>
          </div>
        </div>

        {/* VISUAL TOGGLE & PRINT TIPS */}
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Modo de Visualização:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setPrintMode('completo')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  printMode === 'completo'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Etiqueta Completa
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('minimalista')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  printMode === 'minimalista'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Somente QR Code + Código
              </button>
            </div>
          </div>

          <div className="text-slate-500">
            Total: <strong className="text-slate-800">{clientMachines.length} etiquetas</strong> &middot;{' '}
            <strong className="text-purple-700 font-bold">{pages.length} folha(s) A4</strong> (10 etiquetas por folha)
          </div>
        </div>
      </div>

      {/* PRINT STYLES EMBEDDED */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 6mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            page-break-after: always;
            break-after: page;
            height: 284mm !important;
            max-height: 284mm !important;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 0 !important;
            margin: 0 !important;
          }
          .a4-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .label-card-full {
            height: 48mm !important;
            max-height: 48mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .label-card-minimal {
            height: 48mm !important;
            max-height: 48mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* PRINTABLE PAGES (EACH WITH EXACTLY 10 LABELS) */}
      <div className="space-y-8 print:space-y-0">
        {pages.map((pageMachines, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-sheet bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none"
          >
            {/* SHEET HEADER: APENAS NO MODO COMPLETO (No modo minimalista de só QR Code, não precisa de cabeçalho) */}
            {printMode === 'completo' && (
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-purple-900 text-xs flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                  <span className="font-black text-slate-900 tracking-wide text-xs">
                    FAZENDO ESPORTE &middot; SFE
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentClient?.name || 'Todas as Unidades'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-3">
                  <span>Página <strong>{pageIndex + 1}</strong> de <strong>{pages.length}</strong></span>
                  <span className="font-bold text-orange-600">SLA 48 Horas</span>
                </div>
              </div>
            )}

            {/* 10 LABELS GRID (2 COLUMNS X 5 ROWS) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 ${
              printMode === 'minimalista'
                ? 'gap-3 print:gap-2 my-auto'
                : 'gap-2.5 print:gap-1.5'
            }`}>
              {pageMachines.map((m) => {
                if (printMode === 'minimalista') {
                  // ================= MODO MINIMALISTA: ESTRITAMENTE O QR CODE + CÓDIGO ABAIXO =================
                  return (
                    <div
                      key={m.id}
                      className="label-card-minimal border-2 border-slate-300 print:border-slate-400 rounded-2xl p-2 bg-white flex flex-col items-center justify-center shadow-xs print:shadow-none mx-auto w-full max-w-[90mm]"
                    >
                      {qrMap[m.id] ? (
                        <img
                          src={qrMap[m.id]}
                          alt={`QR ${m.code}`}
                          className="w-24 h-24 print:w-[35mm] print:h-[35mm] object-contain"
                        />
                      ) : (
                        <div className="w-24 h-24 print:w-[35mm] print:h-[35mm] flex items-center justify-center text-[10px] text-slate-400">
                          Carregando...
                        </div>
                      )}
                      <span className="text-xs md:text-sm print:text-[12pt] font-mono font-black text-slate-900 mt-0.5 tracking-wider text-center">
                        {m.code}
                      </span>
                    </div>
                  );
                }

                // ================= MODO COMPLETO: ETIQUETA RICA INSTITUCIONAL =================
                return (
                  <div
                    key={m.id}
                    className="label-card-full border-2 border-purple-900 rounded-xl p-2 bg-gradient-to-br from-white to-purple-50/20 flex items-center justify-between gap-2 shadow-xs print:shadow-none"
                  >
                    <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between h-full">
                      {/* BRAND HEADER */}
                      <div className="flex items-center gap-1 text-[8.5px] font-black text-purple-900 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                        FAZENDO ESPORTE &middot; SFE
                      </div>

                      <div className="text-[8.5px] text-slate-500 truncate leading-tight">
                        {m.client?.name}
                      </div>

                      {/* MACHINE NAME */}
                      <h3 className="text-[10px] font-black text-slate-900 leading-tight truncate my-0.5">
                        {m.name}
                      </h3>

                      <div className="flex items-center gap-1.5">
                        <span className="bg-purple-900 text-white font-mono text-[8.5px] font-extrabold px-1.5 py-0.2 rounded">
                          {m.code}
                        </span>
                        <span className="text-[8px] text-slate-500 truncate">
                          {m.location || m.category}
                        </span>
                      </div>

                      {/* CALL TO ACTION */}
                      <div className="bg-orange-500 text-white text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded tracking-tight inline-block w-fit mt-0.5">
                        📲 Escaneie o QR p/ abrir chamado
                      </div>

                      <div className="text-[7.5px] text-purple-900 font-bold">
                        SLA até 48h &middot; (21) 99999-5359
                      </div>
                    </div>

                    {/* QR CODE BOX */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0 bg-white p-1 rounded-lg border border-purple-300">
                      {qrMap[m.id] ? (
                        <img
                          src={qrMap[m.id]}
                          alt={`QR ${m.code}`}
                          className="w-[18mm] h-[18mm] object-contain"
                        />
                      ) : (
                        <div className="w-[18mm] h-[18mm] flex items-center justify-center text-[9px] text-slate-400">
                          ...
                        </div>
                      )}
                      <span className="text-[8.5px] font-mono font-black text-slate-800 mt-0.5">
                        {m.code}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
