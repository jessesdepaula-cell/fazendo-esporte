'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Machine, Client } from '@/lib/types';
import { generateQrDataUrl } from '@/lib/qr';
import { Printer, Building2, QrCode, Sparkles, Check, ArrowLeft } from 'lucide-react';

export default function EtiquetasPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fazendoesporte.com.br';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* NO-PRINT HEADER BAR */}
      <div className="no-print mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              Gerador de Folhas de Etiquetas QR Code
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Padrão A4 Adesivo
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gere folhas prontas para impressão e recorte para colar diretamente nas máquinas das academias.
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
              Imprimir Folha A4
            </button>
          </div>
        </div>

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 flex items-center justify-between">
          <span>
            💡 <strong>Dica de Impressão:</strong> Ao clicar em Imprimir, selecione <em>Destino: Salvar como PDF</em> ou sua impressora de etiquetas. Deixe a opção <em>Gráficos de plano de fundo</em> ativada.
          </span>
          <span className="font-bold">Total: {clientMachines.length} etiquetas</span>
        </div>
      </div>

      {/* PRINTABLE SHEET CONTAINER (A4 GRID) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        
        {/* PRINT HEADER ONLY VISIBLE ON PRINT */}
        <div className="hidden print:flex items-center justify-between pb-4 mb-4 border-b-2 border-purple-900">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-base font-black text-slate-900">FAZENDO ESPORTE &middot; ETIQUETAS QR CODE</div>
              <div className="text-xs text-slate-600">Cliente: <strong>{currentClient?.name || 'Geral'}</strong></div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>SLA Técnico: <strong>24 Horas</strong></div>
            <div>WhatsApp: (21) 99999-5359</div>
          </div>
        </div>

        {/* ETIQUETAS GRID (2 colunas em A4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          {clientMachines.map((m) => (
            <div
              key={m.id}
              className="border-2 border-purple-900/60 rounded-xl p-3.5 bg-gradient-to-br from-white to-purple-50/30 flex items-center justify-between gap-3 shadow-xs print:shadow-none break-inside-avoid"
            >
              <div className="flex-1 min-w-0 pr-2">
                {/* BRAND HEADER */}
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-extrabold text-purple-900 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  FAZENDO ESPORTE
                </div>

                <div className="text-[10px] text-slate-500 truncate mb-1">
                  {m.client?.name}
                </div>

                {/* MACHINE NAME */}
                <h3 className="text-xs font-black text-slate-900 mb-1 leading-tight">
                  {m.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-900 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {m.code}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {m.location}
                  </span>
                </div>

                {/* INSTRUCTION BADGE */}
                <div className="bg-orange-500 text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-md tracking-tight leading-tight inline-block">
                  📲 Leia o QR Code para abrir chamado
                </div>

                <div className="text-[9px] text-purple-800 font-bold mt-1.5">
                  Atendimento em até 24h &middot; (21) 99999-5359
                </div>
              </div>

              {/* QR CODE BOX */}
              <div className="flex flex-col items-center flex-shrink-0 bg-white p-2 rounded-lg border border-purple-200">
                {qrMap[m.id] ? (
                  <img
                    src={qrMap[m.id]}
                    alt={`QR ${m.code}`}
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-400">
                    Carregando...
                  </div>
                )}
                <span className="text-[9px] font-mono font-bold text-slate-600 mt-0.5">
                  {m.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
