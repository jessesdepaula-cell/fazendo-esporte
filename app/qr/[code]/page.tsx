'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Machine, Client } from '@/lib/types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload, 
  Send, 
  Phone, 
  Building2, 
  Wrench, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  LogIn,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  MessageSquare
} from 'lucide-react';

export default function QrReportPage() {
  const params = useParams();
  const codeParam = params?.code as string;

  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password Gate States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<any>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  useEffect(() => {
    async function loadMachine() {
      if (!codeParam) return;
      try {
        setLoading(true);
        const cleanParam = decodeURIComponent(codeParam).trim();
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanParam);

        let query = supabase
          .from('machines')
          .select('*, client:clients(*)');

        if (isUuid) {
          query = query.eq('id', cleanParam);
        } else {
          query = query.ilike('code', cleanParam);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
          console.error('Error fetching machine:', error);
          setError('Máquina não encontrada no sistema. Verifique o código do QR Code.');
        } else {
          setMachine(data);
          setClient(data.client);

          // Check if already authorized for this client in this browser session
          if (data.client?.id && typeof window !== 'undefined') {
            const stored = sessionStorage.getItem(`sfe_auth_${data.client.id}`);
            if (stored === 'true') {
              setIsAuthorized(true);
            }
          }
        }
      } catch (err: any) {
        console.error('Unexpected error loading machine:', err);
        setError('Erro ao carregar dados da máquina.');
      } finally {
        setLoading(false);
      }
    }
    loadMachine();
  }, [codeParam]);

  // Handle password gate submission
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const expectedPassword = (client.access_password || '123456').trim();
    if (passwordInput.trim() === expectedPassword) {
      setIsAuthorized(true);
      setPasswordError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`sfe_auth_${client.id}`, 'true');
      }
    } else {
      setPasswordError('Senha incorreta para este condomínio. Solicite a senha à administração ou ao síndico.');
    }
  };

  // Handle Photo input (simulate base64 or upload)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Por favor, informe seu nome.');
    if (!description.trim()) return alert('Por favor, descreva o problema apresentado.');
    if (!captchaChecked) return alert('Por favor, marque a confirmação de segurança.');

    if (!machine || !client) return;

    try {
      setSubmitting(true);
      // SLA de 48 Horas
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          client_id: client.id,
          machine_id: machine.id,
          status: 'a_fazer',
          requester_name: name.trim(),
          requester_phone: phone.trim() || null,
          description: description.trim(),
          photo_url: photoUrl || null,
          sla_hours: 48,
          sla_deadline: deadline,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting ticket:', error);
        alert('Erro ao enviar chamado. Tente novamente.');
      } else {
        // Update machine status
        await supabase
          .from('machines')
          .update({ status: 'aguardando_manutencao' })
          .eq('id', machine.id);

        // Prepara mensagem oficial formatada para o WhatsApp do Leandro
        const ticketNum = data?.ticket_number ? `#${data.ticket_number}` : 'REGISTRADO';
        const zapMsg = `🚨 *NOVO CHAMADO TÉCNICO - FAZENDO ESPORTE*\n\n` +
          `🏢 *Condomínio:* ${client.name}\n` +
          `🏋️ *Equipamento:* ${machine.name}\n` +
          `🏷️ *Código:* ${machine.code} (${machine.category})\n\n` +
          `👤 *Responsável / Solicitante:* ${name.trim()}\n` +
          `📱 *Telefone de Contato:* ${phone.trim() || 'Não informado'}\n\n` +
          `⚠️ *Problema Relatado:*\n"${description.trim()}"\n\n` +
          `⏱️ *Prazo SLA de Atendimento:* até 48 Horas\n` +
          `🔢 *Protocolo:* ${ticketNum}\n\n` +
          `_A solicitação já foi registrada no sistema Fazendo Esporte._`;

        const waLink = `https://wa.me/5521999995359?text=${encodeURIComponent(zapMsg)}`;
        setWhatsappUrl(waLink);
        setTicketCreated(data);

        // Dispara o WhatsApp imediatamente
        if (typeof window !== 'undefined') {
          const win = window.open(waLink, '_blank');
          if (!win) {
            window.location.href = waLink;
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium text-sm">Identificando equipamento via QR Code...</p>
      </div>
    );
  }

  if (error || !machine || !client) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">QR Code Não Reconhecido</h1>
        <p className="text-slate-600 max-w-sm mb-6 text-sm">{error}</p>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-left max-w-sm w-full text-xs text-slate-500 mb-6">
          <strong>Precisa de suporte urgente?</strong><br />
          Entre em contato direto com a Fazendo Esporte:<br />
          WhatsApp: <a href="https://wa.me/5521999995359" className="text-purple-600 font-bold underline">(21) 99999-5359</a>
        </div>
      </div>
    );
  }

  // ==================== TELA DE SUCESSO ====================
  if (ticketCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-center">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Chamado #{ticketCreated.ticket_number || 'REGISTRADO'}
          </span>

          <h2 className="text-2xl font-black text-white mb-2">
            Chamado Aberto com Sucesso!
          </h2>

          <p className="text-slate-300 text-sm mb-6">
            A solicitação já entrou no Kanban da <strong className="text-orange-400">Fazendo Esporte</strong> e a equipe técnica já está acionada.
          </p>

          {/* SLA BOX DE 48 HORAS */}
          <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Compromisso SLA de 48 Horas
                </div>
                <div className="text-sm font-semibold text-white">
                  Atendimento em até 48 horas úteis
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              O condomínio será notificado automaticamente assim que a equipe técnica iniciar o atendimento.
            </p>
          </div>

          {/* MACHINE SUMMARY */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Condomínio:</span>
              <span className="text-white font-medium">{client.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Equipamento:</span>
              <span className="text-purple-300 font-semibold">{machine.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Código:</span>
              <span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">{machine.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Solicitante:</span>
              <span className="text-white">{name}</span>
            </div>
          </div>

          {/* BOTAO PARA ENVIAR/REABRIR NO WHATSAPP DO LEANDRO */}
          <a
            href={whatsappUrl || 'https://wa.me/5521999995359'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all text-sm mb-3"
          >
            <Phone className="w-4 h-4" />
            Abrir WhatsApp do Leandro Novamente
          </a>

          <p className="text-[11px] text-slate-400">
            A mensagem com todos os dados preenchidos já foi aberta no seu WhatsApp para você enviar ao Leandro.
          </p>
        </div>
      </div>
    );
  }

  // ==================== TELA 1: BLOQUEIO POR SENHA DO CLIENTE ====================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-8 selection:bg-purple-600 selection:text-white">
        {/* HEADER BRAND */}
        <div className="max-w-md mx-auto w-full text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl p-1.5 shadow-lg shadow-purple-500/20 mx-auto mb-3 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo Fazendo Esporte" width={48} height={48} className="object-contain" priority />
          </div>
          <div className="text-base font-black text-white tracking-wide">FAZENDO ESPORTE</div>
          <div className="text-xs text-purple-300">SFE - Serviços Fazendo Esporte</div>
        </div>

        {/* PASSWORD GATE CARD */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* ACCENT LINE */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-purple-600" />

            {/* IDENTIFIED CONDOMINIUM & MACHINE */}
            <div className="bg-purple-950/60 border border-purple-800/40 rounded-xl p-3.5 mb-5 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-400" />
                Condomínio Identificado
              </div>
              <div className="text-sm font-black text-white">
                {client.name}
              </div>
              <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                <span>{machine.name}</span>
                <span className="font-mono bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">
                  {machine.code}
                </span>
              </div>
            </div>

            {/* SECURITY WARNING */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-white">
                Acesso Restrito ao Responsável
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Para evitar chamados não autorizados por alunos e frequentadores, digite a <strong>senha cadastrada pela administração deste condomínio</strong> para liberar a solicitação.
              </p>
            </div>

            {/* PASSWORD FORM */}
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                  Senha de Acesso do Condomínio
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite a senha..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-400 mt-2 flex items-start gap-1.5 bg-red-950/40 p-2.5 rounded-lg border border-red-800/40">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar e Abrir Solicitação</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
              Não sabe a senha? Solicite ao síndico ou contate a Fazendo Esporte pelo WhatsApp:{' '}
              <a href="https://wa.me/5521999995359" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold hover:underline">
                (21) 99999-5359
              </a>
            </div>
          </div>
        </div>

        <footer className="text-center py-4 text-[11px] text-slate-500">
          <p>Fazendo Esporte &middot; SFE - Serviços Fazendo Esporte</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Rio de Janeiro - RJ</p>
        </footer>
      </div>
    );
  }

  // ==================== TELA 2: FORMULÁRIO COMPLETO LIBERADO ====================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* HEADER TOP BRANDING */}
      <header className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 border-b border-purple-500/20 px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow">
              <Image src="/logo.png" alt="Fazendo Esporte Logo" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                FAZENDO ESPORTE
                <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.2 rounded">SLA 48H</span>
              </div>
              <div className="text-[11px] text-purple-200">
                Central de Manutenção & Chamados
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acesso Autorizado</span>
          </div>
        </div>
      </header>

      {/* FORM BODY */}
      <main className="max-w-md mx-auto w-full p-4 flex-1">
        {/* MACHINE IDENTIFICATION CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-950/50 border border-purple-500/30 rounded-2xl p-4 mb-4 shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {client.name}
            </span>
            <span className="bg-purple-900/80 text-purple-200 font-mono text-xs font-bold px-2 py-0.5 rounded border border-purple-700">
              {machine.code}
            </span>
          </div>

          <h2 className="text-lg font-black text-white mb-1 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            {machine.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Categoria: <strong className="text-white">{machine.category}</strong></span>
            {machine.brand && <span>&middot; Marca: <strong className="text-white">{machine.brand}</strong></span>}
          </div>
        </div>

        {/* SLA ALERT BANNER (48H) */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-5 flex items-center gap-3 text-xs text-orange-200">
          <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div>
            <strong>Garantia Fazendo Esporte:</strong> A partir do envio deste chamado, nossa equipe técnica atua em até <strong>48 horas</strong>.
          </div>
        </div>

        {/* PROBLEM REPORT FORM */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Dados da Solicitação
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Seu Nome Completo (Responsável / Síndico) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Silva (Síndico)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp de Contato *
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: (21) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Descrição do Problema no Aparelho *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que está quebrado ou avariado (ex: lona esquentando, cabo desfiado, barulho no pedal...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* FOTO OPCIONAL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Foto do Aparelho / Defeito (Opcional)</span>
              <span className="text-[10px] text-purple-400 font-normal">Ajuda no diagnóstico</span>
            </label>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 transition-all">
                <Camera className="w-4 h-4 text-orange-400" />
                <span>{photoUrl ? 'Alterar Foto' : 'Tirar Foto ou Galeria'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {isUploading && (
                <span className="text-xs text-purple-400 animate-pulse">Carregando imagem...</span>
              )}

              {photoUrl && !isUploading && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Anexada
                </span>
              )}
            </div>
          </div>

          {/* RECAPTCHA / CONFIRMAÇÃO DE SEGURANÇA */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <input
                type="checkbox"
                required
                checked={captchaChecked}
                onChange={(e) => setCaptchaChecked(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
              />
              <span className="text-xs text-slate-300">
                Confirmo a abertura deste chamado para a equipe <strong>Fazendo Esporte</strong>.
              </span>
            </label>
          </div>

          {/* BOTAO DE ENVIO: KANBAN + DISPARO AUTOMATICO PARA O WHATSAPP DO LEANDRO */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gravando no Kanban & Abrindo WhatsApp...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Chamado & Abrir WhatsApp do Leandro</span>
              </>
            )}
          </button>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-4 border-t border-slate-900 text-[11px] text-slate-500">
        <p>Fazendo Esporte &middot; SFE - Serviços Fazendo Esporte</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Rio de Janeiro - RJ</p>
      </footer>
    </div>
  );
}
