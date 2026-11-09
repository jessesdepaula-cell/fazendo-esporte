'use client';

import React from 'react';
import Image from 'next/image';
import {
  Wrench,
  QrCode,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Building2,
  ArrowRight,
  BarChart3,
  Dumbbell,
  Award,
  ChevronRight,
  LogIn,
  Check,
  X,
  Zap,
  TrendingDown,
  Sparkles,
  PackageCheck
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white relative">
      
      {/* NAVBAR */}
      <header className="border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Image src="/logo.png" alt="Fazendo Esporte Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <div>
              <div className="text-base font-black tracking-wide text-white">FAZENDO ESPORTE</div>
              <div className="text-[11px] text-purple-300 font-medium">Manutenção & Locação Fitness</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/5521999995359?text=Olá%20Leandro,%20gostaria%20de%20um%20orçamento%20para%20manutenção%20ou%20locação%20da%20minha%20academia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>(21) 99999-5359</span>
            </a>

            <a
              href="/login"
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-orange-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Entrar no Sistema</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative pt-14 pb-16 px-4 md:px-8 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 mb-6 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              Tecnologia Exclusiva de Chamados via QR Code &middot; SLA de 24 Horas
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              A Parceria Definitiva em <br />
              <span className="text-orange-400">
                Manutenção & Locação Fitness
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
              Eliminamos o transtorno de máquinas paradas em academias e condomínios. 
              Com QR Code em cada aparelho, qualquer pessoa abre o chamado em 10 segundos e a 
              <strong> Fazendo Esporte atua em até 24 horas</strong>.
            </p>

            {/* TRUST PILLS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-4xl mx-auto text-left">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <Clock className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-sm font-extrabold text-white">SLA de até 24h</div>
                <div className="text-xs text-slate-400">Resposta e atendimento técnico ágil.</div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <QrCode className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm font-extrabold text-white">QR Code Inteligente</div>
                <div className="text-xs text-slate-400">Sem app, abre no navegador em 10s.</div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-sm font-extrabold text-white">Peças & Preventiva</div>
                <div className="text-xs text-slate-400">Revisão rigorosa de cabos e polias.</div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <BarChart3 className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-sm font-extrabold text-white">Relatórios em PDF</div>
                <div className="text-xs text-slate-400">Transparência total para os síndicos.</div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOCO NOVO 1: LOCAÇÃO & ALUGUEL INTELIGENTE DE MÁQUINAS */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-purple-500/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                Locação Operacional de Equipamentos
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 tracking-tight leading-snug">
                Equipe a Academia do seu Condomínio sem Descapitalizar o Caixa
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Por que desembolsar R$ 100 mil na compra de aparelhos que desvalorizam todo ano?
                Com a locação da <strong>Fazendo Esporte</strong>, seu condomínio recebe esteiras, bikes e estações de musculação profissionais com manutenção e peças 100% inclusas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-6 rounded-2xl transition-all shadow-md">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black mb-4">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white mb-2">Zero Aporte Inicial</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Não queime a reserva do condomínio nem aumente a taxa condominial. O aluguel entra como despesa ordinária previsível e cabe no orçamento mensal.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl transition-all shadow-md">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white mb-2">Manutenção Total Inclusa</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sem orçamentos surpresa de R$ 2.000 para trocar uma lona ou placa de esteira. Mão de obra técnica, revisões preventivas e peças correm por nossa conta.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all shadow-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black mb-4">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white mb-2">Troca Rápida de Aparelho</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Se um equipamento exigir reparo em bancada ou componente demorado, fazemos a substituição imediata. Seus moradores nunca ficam sem treinar.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all shadow-md">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white mb-2">Linha Profissional</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Equipamentos das marcas mais consagradas do mercado: esteiras Movement, bikes Schwinn e estações biomecânicas Buick de alta durabilidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BLOCO NOVO 2: COMPARATIVO MATADOR (COMPRAR PRÓPRIO VS. ALUGAR COM A FAZENDO ESPORTE) */}
        <section className="py-20 px-4 md:px-8 border-t border-slate-800 bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                Análise Financeira & Operacional
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 tracking-tight">
                Comprar Máquinas vs. Alugar com a Fazendo Esporte
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2">
                Descubra por que síndicos e gestores experientes optam pelo modelo de locação:
              </p>
            </div>

            {/* COMPARISON TABLE / GRID */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-800 bg-slate-950/80 p-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                <div>Critério Operacional</div>
                <div className="text-red-400 hidden md:block">Comprar Máquinas Próprias</div>
                <div className="text-emerald-400 hidden md:block">Alugar com a Fazendo Esporte</div>
              </div>

              {/* ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-5 border-b border-slate-800/80 gap-4 md:gap-0 items-center hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-extrabold text-white text-sm">Investimento Inicial</div>
                  <div className="text-xs text-slate-500">Impacto no caixa do condomínio</div>
                </div>
                <div className="text-xs text-slate-300 flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span><strong>R$ 80.000 a R$ 250.000</strong> à vista ou cotas extras pesadas para os moradores.</span>
                </div>
                <div className="text-xs text-emerald-300 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero investimento inicial.</strong> Mensalidade previsível no orçamento ordinário.</span>
                </div>
              </div>

              {/* ROW 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-5 border-b border-slate-800/80 gap-4 md:gap-0 items-center hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-extrabold text-white text-sm">Manutenção & Reparos</div>
                  <div className="text-xs text-slate-500">Custos de quebras e peças</div>
                </div>
                <div className="text-xs text-slate-300 flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Orçamentos avulsos caros, demora para aprovação e peças pagas pelo condomínio.</span>
                </div>
                <div className="text-xs text-emerald-300 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>100% Inclusa na mensalidade.</strong> Peças, lubrificação e reparos sem taxa extra.</span>
                </div>
              </div>

              {/* ROW 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-5 border-b border-slate-800/80 gap-4 md:gap-0 items-center hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-extrabold text-white text-sm">Tempo de Atendimento</div>
                  <div className="text-xs text-slate-500">Agilidade no conserto</div>
                </div>
                <div className="text-xs text-slate-300 flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Máquinas ficam semanas paradas com fita zebrada aguardando visita técnica.</span>
                </div>
                <div className="text-xs text-emerald-300 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>SLA Máximo de 24 Horas.</strong> Abertura via QR Code direto pelo morador.</span>
                </div>
              </div>

              {/* ROW 4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-5 gap-4 md:gap-0 items-center hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-extrabold text-white text-sm">Depreciação & Desvalorização</div>
                  <div className="text-xs text-slate-500">Ciclo de vida do aparelho</div>
                </div>
                <div className="text-xs text-slate-300 flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Em 3 a 5 anos o maquinário perde quase todo valor e vira sucata barulhenta.</span>
                </div>
                <div className="text-xs text-emerald-300 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Parque sempre atualizado.</strong> A Fazendo Esporte absorve a depreciação.</span>
                </div>
              </div>
            </div>

            {/* CALL TO ACTION PROPOSTA */}
            <div className="mt-10 text-center">
              <a
                href="https://wa.me/5521999995359?text=Olá%20Leandro,%20quero%20uma%20proposta%20de%20locação%20de%20equipamentos%20para%20meu%20condomínio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-xl shadow-orange-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Phone className="w-4 h-4" />
                <span>Solicitar Proposta de Locação para Meu Condomínio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="text-[11px] text-slate-500 mt-2">
                Atendimento consultivo direto com Leandro Amélio &middot; WhatsApp: (21) 99999-5359
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-4 md:px-8 bg-slate-900/40 border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                FLUXO TRANSPARENTE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                Como Funciona na Prática?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 relative">
                <div className="w-10 h-10 bg-purple-600/20 text-purple-400 border border-purple-500/40 rounded-xl flex items-center justify-center font-black text-base mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Aluno ou Instrutor Lê o QR Code
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aparelho deu problema? Basta apontar a câmera do celular para a etiqueta adesiva colada na máquina. O link abre instantaneamente.
                </p>
              </div>

              <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 relative">
                <div className="w-10 h-10 bg-orange-600/20 text-orange-400 border border-orange-500/40 rounded-xl flex items-center justify-center font-black text-base mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Máquina Identificada Automaticamente
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Não precisa digitar nome do aparelho nem modelo. O formulário já sabe qual é a máquina, permite anexar foto da avaria e envia o chamado.
                </p>
              </div>

              <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 relative">
                <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl flex items-center justify-center font-black text-base mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Atendimento em até 24h & Notificação
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O Leandro recebe o alerta no painel, notifica a academia que está atuando e realiza o conserto com rapidez e segurança comprovadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MARCAS E CLIENTES */}
        <section className="py-20 px-4 md:px-8 border-t border-slate-800 bg-slate-950">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
              CASO DE SUCESSO EM OPERAÇÃO
            </span>
            <h2 className="text-2xl font-black text-white mt-4 mb-8">
              Condomínio Varandas do Atlântico
            </h2>

            <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 text-left max-w-3xl mx-auto shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                  VA
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Condomínio Varandas do Atlântico</h3>
                  <p className="text-xs text-slate-400">Rio de Janeiro &middot; Gestão de 21 Equipamentos</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Parque completo monitorado com QR Codes individuais em cada esteira Movement, bikes Schwinn e estações Buick de musculação.
                A gestão predial conta com tranquilidade absoluta e suporte direto da Fazendo Esporte.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-800 pt-4">
                <div>
                  <div className="text-xl font-black text-orange-400">21</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Máquinas Atendidas</div>
                </div>
                <div>
                  <div className="text-xl font-black text-purple-400">24h</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">SLA Máximo</div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">100%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Disponibilidade</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BOTÃO FLUTUANTE DE WHATSAPP */}
      <aside className="fixed bottom-6 right-6 z-50 flex items-center">
        <a
          href="https://wa.me/5521999995359?text=Olá%20Leandro,%20vi%20o%20site%20da%20Fazendo%20Esporte%20e%20gostaria%20de%20um%20orçamento%20para%20minha%20academia"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com Leandro no WhatsApp"
          className="relative bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group shadow-emerald-500/40"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />

          {/* Official WhatsApp SVG Icon */}
          <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          
          <span className="font-black text-xs tracking-wide pr-1">
            Falar no WhatsApp
          </span>
        </a>
      </aside>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 md:px-8 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">FAZENDO ESPORTE</div>
              <div className="text-[11px] text-slate-400">
                Manutenção Especializada &middot; Gestão Inteligente
              </div>
              <div className="text-[10px] text-slate-500">
                Locação e Manutenção Inteligente &middot; Rio de Janeiro - RJ
              </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div>
              Responsável Técnico: <strong className="text-white">Leandro Amélio</strong>
            </div>
            <div>
              WhatsApp: <a href="https://wa.me/5521999995359" className="text-orange-400 font-bold hover:underline">(21) 99999-5359</a> &middot; E-mail: <span className="text-slate-300">amelioleandro@gmail.com</span>
            </div>
            <div className="text-purple-400 font-semibold">
              Instagram: @fazendoesporte
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
