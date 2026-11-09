'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Machine, Client } from '@/lib/types';
import { generateQrDataUrl, generateQrBadgePng } from '@/lib/qr';
import {
  Wrench,
  QrCode,
  Building2,
  Search,
  Filter,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Sparkles
} from 'lucide-react';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [selectedMachineQr, setSelectedMachineQr] = useState<Machine | null>(null);
  const [downloadingBadge, setDownloadingBadge] = useState<string | null>(null);

  const handleDownloadBadge = async (m: Machine, fullBadge = true) => {
    try {
      setDownloadingBadge(m.id);
      const rawQr = qrMap[m.id];
      if (!rawQr) return;

      let urlToDownload = rawQr;
      let filename = `qrcode_${m.code}.png`;

      if (fullBadge) {
        urlToDownload = await generateQrBadgePng({
          qrDataUrl: rawQr,
          companyName: 'FAZENDO ESPORTE',
          companySubtitle: 'SFE - Serviços Fazendo Esporte',
          clientName: m.client?.name || 'Cliente Fazendo Esporte',
          machineName: m.name,
          machineCode: m.code,
          category: m.category,
          phone: '(21) 99999-5359'
        });
        const safeName = m.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        filename = `Adesivo_QR_${m.code}_${safeName}.png`;
      }

      const a = document.createElement('a');
      a.href = urlToDownload;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating badge:', err);
    } finally {
      setDownloadingBadge(null);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load clients
        const { data: clientsData } = await supabase.from('clients').select('*').order('name');
        if (clientsData) setClients(clientsData);

        // Load machines
        const { data: machinesData } = await supabase
          .from('machines')
          .select('*, client:clients(*)')
          .order('code');

        if (machinesData) {
          setMachines(machinesData as any);
          
          // Generate QR code data URLs for machines
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

  const filteredMachines = machines.filter((m) => {
    const matchClient = selectedClient === 'todos' || m.client_id === selectedClient;
    const matchCategory = categoryFilter === 'todas' || m.category === categoryFilter;
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      (m.brand && m.brand.toLowerCase().includes(search.toLowerCase()));

    return matchClient && matchCategory && matchSearch;
  });

  const categories = Array.from(new Set(machines.map((m) => m.category))).filter(Boolean);

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            Parque de Máquinas & QR Codes
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200">
              {machines.length} Cadastradas
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cada equipamento possui um identificador exclusivo e seu respectivo QR Code vinculado ao cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/etiquetas"
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir Folha de Adesivos (A4)
          </a>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SEARCH */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
        </div>

        {/* CLIENT FILTER */}
        <div>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          >
            <option value="todos">🏢 Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY FILTER */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          >
            <option value="todas">🏷️ Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MACHINES TABLE / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((m) => {
          const qrDataUrl = qrMap[m.id];
          return (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-extrabold px-2 py-0.5 rounded">
                    {m.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'operacional' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : m.status === 'em_manutencao'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    {m.status === 'operacional' ? '● Operacional' : m.status === 'em_manutencao' ? '● Em Reparo' : '● Aguardando'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-semibold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {m.client?.name}
                </div>

                <h3 className="text-sm font-black text-slate-900 mb-2 leading-snug">
                  {m.name}
                </h3>

                <div className="text-xs text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Categoria:</span>
                    <strong className="text-slate-700">{m.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Marca:</span>
                    <strong className="text-slate-700">{m.brand || 'Buick / Movement'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Localização:</span>
                    <strong className="text-slate-700">{m.location}</strong>
                  </div>
                </div>
              </div>

              {/* QR CODE ACTION BAR */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMachineQr(m)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-2 rounded-xl border border-purple-200 flex items-center gap-1.5 transition-all flex-1 justify-center"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Ver QR
                </button>

                <button
                  onClick={() => handleDownloadBadge(m, true)}
                  disabled={downloadingBadge === m.id}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-2 rounded-xl border border-orange-200 flex items-center gap-1.5 transition-all flex-1 justify-center disabled:opacity-50"
                  title="Baixar Etiqueta Adesiva Completa (Empresa + Máquina + QR)"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingBadge === m.id ? 'animate-bounce' : ''}`} />
                  {downloadingBadge === m.id ? 'Gerando...' : 'Baixar Adesivo'}
                </button>

                <a
                  href={`/qr/${m.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold transition-all"
                  title="Abrir página de chamado da máquina"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR CODE MODAL PREVIEW */}
      {selectedMachineQr && (
        <div 
          onClick={() => setSelectedMachineQr(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center border border-slate-200 cursor-default"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
              {selectedMachineQr.client?.name}
            </span>

            <h3 className="text-base font-black text-slate-900 mb-1">
              {selectedMachineQr.name}
            </h3>

            <div className="inline-block bg-slate-100 text-slate-800 font-mono text-xs font-bold px-3 py-1 rounded-md mb-4">
              Código: {selectedMachineQr.code}
            </div>

            {/* QR CODE IMAGE */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center mb-4">
              {qrMap[selectedMachineQr.id] ? (
                <img
                  src={qrMap[selectedMachineQr.id]}
                  alt={`QR Code ${selectedMachineQr.code}`}
                  className="w-48 h-48 object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Gerando QR...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mb-5">
              Aponte a câmera do celular para este QR Code para testar a abertura do chamado de manutenção.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleDownloadBadge(selectedMachineQr, true)}
                disabled={downloadingBadge === selectedMachineQr.id}
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${downloadingBadge === selectedMachineQr.id ? 'animate-bounce' : ''}`} />
                {downloadingBadge === selectedMachineQr.id 
                  ? 'Gerando Etiqueta com Empresa e Modelo...' 
                  : 'Baixar Etiqueta Completa (Empresa + Modelo)'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadBadge(selectedMachineQr, false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Apenas QR Code
                </button>

                <button
                  onClick={() => setSelectedMachineQr(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
