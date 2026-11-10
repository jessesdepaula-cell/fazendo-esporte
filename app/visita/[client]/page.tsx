'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Client, Machine } from '@/lib/types';
import {
  Building2,
  Clock,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Send,
  Phone,
  ArrowLeft,
  Sparkles,
  FileText,
  UserCheck,
  Check,
  RefreshCw,
  Share2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function VisitaTecnicaPage() {
  const params = useParams();
  const router = useRouter();
  const clientParam = params?.client as string;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTime, setVisitTime] = useState<string>('');
  const [technicianName, setTechnicianName] = useState('Leandro Amélio');
  const [serviceType, setServiceType] = useState('Preventiva Programada');
  const [selectedMachineId, setSelectedMachineId] = useState('geral');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'feito' | 'fazendo'>('feito');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedVisit, setSubmittedVisit] = useState<any>(null);

  // Quick Chips for rapid description insertion
  const quickChips = [
    'Lubrificação geral de esteiras com silicone especial',
    'Ajuste, alinhamento e tensão de lonas de esteiras',
    'Inspeção e regulagem de cabos de aço e roldanas',
    'Reaperto de parafusos, pinos seletores e bancos',
    'Revisão preventiva completa de todo o parque fitness',
    'Testes de carga e funcionamento 100% aprovados',
    'Equipamentos limpos, revisados e liberados para uso'
  ];

  useEffect(() => {
    // Set default current date and time
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setVisitDate(`${yyyy}-${mm}-${dd}`);

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    setVisitTime(`${hh}:${min}`);
  }, []);

  useEffect(() => {
    async function loadClientAndMachines() {
      if (!clientParam) return;
      try {
        setLoading(true);
        const clean = decodeURIComponent(clientParam).trim().toLowerCase();
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean);

        let query = supabase.from('clients').select('*');
        if (isUuid) {
          query = query.eq('id', clean);
        } else {
          query = query.ilike('slug', clean);
        }

        let { data: clientData, error: clientErr } = await query.maybeSingle();

        // Fallback: search by name substring if not found
        if (!clientData) {
          const { data: allClients } = await supabase.from('clients').select('*');
          if (allClients && allClients.length > 0) {
            clientData = allClients.find((c) =>
              c.slug?.toLowerCase().includes(clean) ||
              c.name?.toLowerCase().includes(clean) ||
              clean.includes(c.slug?.toLowerCase())
            ) || allClients[0];
          }
        }

        if (!clientData) {
          setError('Cliente não encontrado no sistema Fazendo Esporte.');
          return;
        }

        setClient(clientData);

        // Fetch machines for this client
        const { data: machinesData } = await supabase
          .from('machines')
          .select('*')
          .eq('client_id', clientData.id)
          .order('code');

        if (machinesData) {
          setMachines(machinesData);
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados do cliente:', err);
        setError('Ocorreu um erro ao carregar os dados do cliente.');
      } finally {
        setLoading(false);
      }
    }

    loadClientAndMachines();
  }, [clientParam]);

  const handleSetTimeToNow = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    setVisitTime(`${hh}:${min}`);
  };

  const handleAddQuickChip = (text: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `• ${text}`;
      return `${trimmed}\n• ${text}`;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    if (!description.trim()) {
      alert('Por favor, descreva o relatório do que foi realizado na visita.');
      return;
    }

    try {
      setSubmitting(true);

      // Determine target machine
      let targetMachineId = selectedMachineId !== 'geral' ? selectedMachineId : (machines[0]?.id || null);
      const targetMachine = machines.find((m) => m.id === targetMachineId);

      const formattedDescription = `[VISITA TÉCNICA PRESENCIAL - ${serviceType.toUpperCase()}]
Horário da Visita: ${visitTime}h | Data: ${visitDate}
Técnico: ${technicianName}
Equipamento: ${selectedMachineId === 'geral' ? 'Parque Geral da Academia' : `${targetMachine?.code} - ${targetMachine?.name}`}

Relatório dos Serviços Executados:
${description.trim()}`;

      const payload: any = {
        client_id: client.id,
        machine_id: targetMachineId,
        status: status,
        requester_name: `${technicianName} (Responsável Técnico)`,
        requester_phone: '21999995359',
        description: formattedDescription,
        photo_url: photoUrl || null,
        sla_hours: 48,
        started_at: `${visitDate}T${visitTime}:00Z`,
        completed_at: status === 'feito' ? new Date().toISOString() : null,
        resolution_notes: status === 'feito'
          ? `Visita técnica presencial realizada por ${technicianName} em ${visitDate} às ${visitTime}. Serviços concluídos com sucesso.`
          : null
      };

      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert([payload])
        .select()
        .single();

      if (ticketError) {
        console.error('Erro ao salvar ticket no Supabase:', ticketError);
        throw ticketError;
      }

      // Also save to localStorage for local history & fast access
      try {
        const localRecord = {
          id: ticketData?.id || Date.now().toString(),
          ticket_number: ticketData?.ticket_number || null,
          client_id: client.id,
          client_name: client.name,
          client_slug: client.slug,
          visit_date: visitDate,
          visit_time: visitTime,
          technician_name: technicianName,
          service_type: serviceType,
          machine_name: selectedMachineId === 'geral' ? 'Parque Geral' : targetMachine?.name,
          description: description.trim(),
          status: status,
          photo_url: photoUrl || null,
          created_at: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem('sfe_executive_visits') || '[]');
        existing.unshift(localRecord);
        localStorage.setItem('sfe_executive_visits', JSON.stringify(existing.slice(0, 100)));
      } catch (lsErr) {
        console.warn('LocalStorage save warning:', lsErr);
      }

      // Dispatch event to inform admin layout/kanban
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tickets-updated'));
      }

      setSubmittedVisit({
        id: ticketData?.id,
        ticket_number: ticketData?.ticket_number,
        clientName: client.name,
        visitDate,
        visitTime,
        technicianName,
        serviceType,
        machineName: selectedMachineId === 'geral' ? 'Parque Geral da Academia' : targetMachine?.name,
        description: description.trim(),
        status
      });
    } catch (err: any) {
      console.error('Erro ao registrar visita:', err);
      alert('Erro ao salvar o relatório: ' + (err.message || 'Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!submittedVisit) return '#';
    const text = `*RELATÓRIO DE VISITA TÉCNICA - FAZENDO ESPORTE* 🏋️‍♂️

🏢 *Cliente:* ${submittedVisit.clientName}
📅 *Data:* ${submittedVisit.visitDate} às ${submittedVisit.visitTime}h
👨‍🔧 *Responsável Técnico:* ${submittedVisit.technicianName}
🛠️ *Tipo de Atendimento:* ${submittedVisit.serviceType}
📍 *Equipamento(s):* ${submittedVisit.machineName}

📋 *Relatório dos Serviços Realizados:*
${submittedVisit.description}

✅ *Status:* Equipamentos 100% Revisados e Liberados para Uso!
📞 *Central Fazendo Esporte:* (21) 99999-5359`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-xl flex items-center justify-center mb-4 animate-pulse">
          <Image src="/logo.png" alt="Logo" width={52} height={52} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
          <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Identificando Cliente & Carregando Dados...</span>
        </div>
        <p className="text-xs text-purple-400 font-medium">SFE - Serviços Fazendo Esporte</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4 border border-red-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white mb-2">Cliente Não Encontrado</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">{error || 'Verifique o QR Code ou selecione um cliente no painel.'}</p>
        <button
          onClick={() => router.push('/admin/relatorios')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          Voltar para Relatórios Executivos
        </button>
      </div>
    );
  }

  // SUCCESS CONFIRMATION SCREEN
  if (submittedVisit) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 py-10">
        <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-purple-500 to-orange-500" />

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Visita Técnica Registrada
            </span>
            <h1 className="text-2xl font-black text-white mt-2">
              Relatório Executivo Salvo!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Os dados foram registrados no sistema e já constam no histórico oficial de prestação de contas.
            </p>
          </div>

          {/* SUMMARY CARD */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Cliente:
              </span>
              <strong className="text-white font-bold text-sm">{submittedVisit.clientName}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Data & Hora:
              </span>
              <strong className="text-slate-200">
                {submittedVisit.visitDate} às {submittedVisit.visitTime}h
              </strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Responsável Técnico:
              </span>
              <strong className="text-slate-200">{submittedVisit.technicianName}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                Atendimento:
              </span>
              <strong className="text-purple-300">{submittedVisit.serviceType}</strong>
            </div>

            <div className="pt-1">
              <span className="text-slate-400 block mb-1">Serviços Executados:</span>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                {submittedVisit.description}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-3">
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Enviar Comprovante no WhatsApp do Síndico / Gestor
            </a>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setSubmittedVisit(null);
                  setDescription('');
                  setPhotoUrl('');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Nova Visita
              </button>
              <button
                onClick={() => router.push('/admin/relatorios')}
                className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold py-3 px-4 rounded-xl border border-purple-500/30 transition-all cursor-pointer"
              >
                Ver Relatórios
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VISIT REPORTING FORM
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-16">
      <div className="max-w-xl mx-auto">
        {/* BRAND TOPBAR */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Image src="/logo.png" alt="Logo" width={38} height={38} className="object-contain" priority />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-wide">FAZENDO ESPORTE</div>
              <div className="text-[11px] text-purple-400 font-semibold">SFE - Serviços Fazendo Esporte</div>
              <div className="text-[10px] text-slate-400">Leandro Amélio &middot; (21) 99999-5359</div>
            </div>
          </div>

          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Check-in Técnico
          </span>
        </div>

        {/* IDENTIFIED CLIENT HEADER CARD */}
        <div className="bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 inline-block mb-1.5">
                Cliente Identificado via QR Code
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                {client.name}
              </h1>
              {client.address && (
                <p className="text-xs text-slate-400 mt-1">{client.address}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-300">{machines.length} Aparelhos</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Gestão Fazendo Esporte</div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-7 shadow-xl space-y-5">
          {/* DATE & TIME ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Data da Visita *
              </label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  Horário de Chegada *
                </label>
                <button
                  type="button"
                  onClick={handleSetTimeToNow}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Hora Atual
                </button>
              </div>
              <input
                type="time"
                required
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* TECHNICIAN & SERVICE TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Responsável Técnico *
              </label>
              <input
                type="text"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
                Tipo de Atendimento *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Preventiva Programada">🔧 Manutenção Preventiva Programada</option>
                <option value="Vistoria e Lubrificação Geral">🧴 Vistoria & Lubrificação Geral</option>
                <option value="Chamado Corretivo / Conserto">⚡ Chamado Corretivo / Conserto</option>
                <option value="Troca de Peças / Cabos">🔩 Troca de Peças / Cabos de Aço</option>
                <option value="Regulagem e Ajuste Fino">📐 Regulagem e Ajuste de Aparelhos</option>
                <option value="Atendimento Emergencial">🚨 Atendimento Emergencial</option>
              </select>
            </div>
          </div>

          {/* EQUIPMENT SELECTOR (OPTIONAL / GENERAL) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Equipamento(s) Envolvido(s)
            </label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="geral">🏋️ Todo o Parque de Máquinas (Academia Geral)</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} ({m.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Deixe em "Todo o Parque" para revisões gerais ou selecione a máquina específica se o serviço foi pontual.
            </p>
          </div>

          {/* DESCRIPTION TEXTAREA & QUICK CHIPS */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                Descrição do Relatório / O que foi feito *
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Toque nos atalhos abaixo</span>
            </label>

            {/* QUICK PRE-FILL CHIPS */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddQuickChip(chip)}
                  className="bg-slate-800/90 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/80 hover:border-purple-500/50 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Realizada manutenção preventiva nas esteiras RT150 com aplicação de silicone especial para esteiras. Ajustada a tensão e alinhamento das lonas. Verificados cabos do cross-over e reaperto dos parafusos do banco de supino. Todo o parque testado e operando 100%..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
            />
          </div>

          {/* STATUS SELECTION */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Status da Intervenção
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('feito')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  status === 'feito'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  status === 'feito' ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'
                }`}>
                  {status === 'feito' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">Concluído & Liberado</div>
                  <div className="text-[10px] text-slate-400">100% Operacional</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('fazendo')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  status === 'fazendo'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-md shadow-blue-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  status === 'fazendo' ? 'border-blue-400 bg-blue-500 text-slate-950' : 'border-slate-600'
                }`}>
                  {status === 'fazendo' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">Em Atendimento</div>
                  <div className="text-[10px] text-slate-400">Retorno / Peça Pendente</div>
                </div>
              </button>
            </div>
          </div>

          {/* OPTIONAL PHOTO */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              Foto do Serviço / Comprovação (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>{photoUrl ? 'Trocar Foto' : 'Tirar Foto / Escolher'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <div className="flex items-center gap-2">
                  <img src={photoUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-purple-500" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-500 via-purple-600 to-purple-700 hover:from-orange-600 hover:to-purple-800 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gravando Relatório no Sistema...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gravar Relatório de Visita Técnica</span>
              </>
            )}
          </button>
        </form>

        {/* FOOTER INFO */}
        <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
          <p>Fazendo Esporte &middot; Gestão Especializada de Parques Fitness</p>
          <p>Leandro Amélio &middot; WhatsApp: (21) 99999-5359</p>
        </div>
      </div>
    </div>
  );
}