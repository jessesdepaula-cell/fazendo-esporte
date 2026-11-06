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
  Sparkles
} from 'lucide-react';

export default function QrReportPage() {
  const params = useParams();
  const codeParam = params?.code as string;

  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<any>(null);

  useEffect(() => {
    async function loadMachine() {
      if (!codeParam) return;
      try {
        setLoading(true);
        // Query by code or id
        const { data, error } = await supabase
          .from('machines')
          .select('*, client:clients(*)')
          .or(`code.eq.${codeParam},id.eq.${codeParam}`)
          .single();

        if (error || !data) {
          setError('Máquina não encontrada no sistema. Verifique o código do QR Code.');
        } else {
          setMachine(data);
          setClient(data.client);
        }
      } catch (err: any) {
        setError('Erro ao carregar dados da máquina.');
      } finally {
        setLoading(false);
      }
    }
    loadMachine();
  }, [codeParam]);

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
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          client_id: client.id,
          machine_id: machine.id,
          status: 'a_fazer',
          requester_name: name,
          requester_phone: phone || null,
          description: description,
          photo_url: photoUrl || null,
          sla_hours: 24,
          sla_deadline: deadline,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting ticket:', error);
        alert('Erro ao enviar chamado. Tente novamente.');
      } else {
        // Also update machine status
        await supabase
          .from('machines')
          .update({ status: 'aguardando_manutencao' })
          .eq('id', machine.id);

        setTicketCreated(data);
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

  if (error || !machine) {
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

  // SUCCESS SCREEN
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
            A equipe da <strong className="text-orange-400">Fazendo Esporte</strong> já recebeu o seu alerta e o técnico já foi acionado.
          </p>

          {/* SLA BOX */}
          <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Compromisso SLA de 24 Horas
                </div>
                <div className="text-sm font-semibold text-white">
                  Atendimento em até 24 horas úteis
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              O condomínio e o solicitante serão notificados automaticamente assim que a manutenção entrar em andamento.
            </p>
          </div>

          {/* MACHINE SUMMARY */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente:</span>
              <span className="text-white font-medium">{client?.name}</span>
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

          <a
            href="https://wa.me/5521999995359?text=Olá%20Leandro,%20acabei%20de%20abrir%20o%20chamado%20para%20a%20máquina%20"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Phone className="w-4 h-4" />
            Falar com Leandro Amélio no WhatsApp
          </a>
        </div>
      </div>
    );
  }

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
                <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.2 rounded">SLA 24H</span>
              </div>
              <div className="text-[11px] text-purple-200">
                Central de Manutenção & Chamados
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/5521999995359" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"
          >
            <Phone className="w-3 h-3" />
            Suporte
          </a>
        </div>
      </header>

      {/* MAIN FORM CONTAINER */}
      <main className="max-w-md mx-auto w-full p-4 flex-1">
        {/* IDENTIFIED MACHINE CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 rounded-2xl p-4 mb-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              {client?.name}
            </div>
            <span className="bg-purple-900/80 text-purple-200 border border-purple-600/40 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md">
              {machine.code}
            </span>
          </div>

          <h1 className="text-xl font-black text-white flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-purple-400" />
            {machine.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              Setor: <strong className="text-slate-200">{machine.location}</strong>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              Marca: <strong className="text-slate-200">{machine.brand || 'Profissional'}</strong>
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Equipamento Reconhecido
            </span>
            <span className="text-orange-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Prazo: até 24h
            </span>
          </div>
        </div>

        {/* SLA BADGE */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3.5 py-2.5 mb-5 flex items-center gap-3 text-xs text-orange-200">
          <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 animate-pulse" />
          <div>
            <strong>Garantia Fazendo Esporte:</strong> A partir do envio deste chamado, a nossa assistência técnica atua em até <strong>24 horas</strong>.
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Informações do Chamado
            </h2>

            {/* SEU NOME */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seu Nome Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos (Professor) ou Mariana (Moradora A-204)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* SEU WHATSAPP */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seu WhatsApp / Telefone (Opcional)
              </label>
              <input
                type="tel"
                placeholder="(21) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Para receber aviso no WhatsApp quando o conserto for iniciado.
              </p>
            </div>

            {/* DESCRIÇÃO DO DEFEITO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Qual é o defeito apresentado? *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Descreva o que está acontecendo: ex: cabo de aço desfiando, barulho alto na polia, esteira travando, banco rasgado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            {/* UPLOAD DE FOTO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foto do Problema (Recomendado)
              </label>
              
              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-purple-500/50">
                  <img src={photoUrl} alt="Foto da avaria" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/40 hover:bg-slate-800/70">
                  <Camera className="w-6 h-6 text-purple-400 mb-1.5" />
                  <span className="text-xs font-medium text-slate-300">
                    {isUploading ? 'Processando imagem...' : 'Tirar foto ou escolher da galeria'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Ajuda o Leandro a já levar a peça certa
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* RECAPTCHA / BOT CHECK */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                <input
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200">Não sou um robô</span>
                  <p className="text-[11px] text-slate-400">Confirmo que esta máquina está com defeito e necessita de reparo.</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-purple-400 ml-auto" />
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando chamado...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Chamado de Manutenção
              </>
            )}
          </button>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-4 border-t border-slate-900 text-[11px] text-slate-500">
        <p>Fazendo Esporte &middot; Vibranium Aluguel de Equipamentos Esportivos Ltda</p>
        <p className="text-[10px] text-slate-600 mt-0.5">CNPJ: 64.427.706/0001-17 &middot; Rio de Janeiro - RJ</p>
      </footer>
    </div>
  );
}
