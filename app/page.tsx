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
  Sparkles,
  BarChart3,
  Dumbbell,
  Award,
  ChevronRight,
  LogIn
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      
      {/* NAVBAR */}
      <header className="border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Image src="/logo.png" alt="Fazendo Esporte Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <div className="text-base font-black tracking-wide text-white">FAZENDO ESPORTE</div>
              <div className="text-[11px] text-purple-300 font-medium">Vibranium Equipamentos Esportivos</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/5521999995359?text=Olá%20Leandro,%20gostaria%20de%20um%20orçamento%20para%20manutenção%20da%20minha%20academia"
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
        <section className="relative pt-12 pb-20 px-4 md:px-8 overflow-hidden">
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

            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
              Eliminamos o transtorno de máquinas paradas em academias e condomínios. 
              Com QR Code em cada aparelho, qualquer pessoa abre o chamado em 10 segundos e a 
              <strong> Fazendo Esporte atua em até 24 horas</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a
                href="/login"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                Entrar no Sistema
              </a>

              <a
                href="https://wa.me/5521999995359?text=Olá%20Leandro,%20vi%20o%20site%20da%20Fazendo%20Esporte%20e%20quero%20conhecer%20os%20planos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                WhatsApp: (21) 99999-5359
              </a>
            </div>

            {/* TRUST PILLS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <Clock className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-sm font-extrabold text-white">SLA de até 24h</div>
                <div className="text-xs text-slate-400">Resposta e atendimento técnico ágil.</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <QrCode className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm font-extrabold text-white">QR Code Inteligente</div>
                <div className="text-xs text-slate-400">Sem app, abre no navegador em 10s.</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-sm font-extrabold text-white">Peças & Preventiva</div>
                <div className="text-xs text-slate-400">Revisão rigorosa de cabos e polias.</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <BarChart3 className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-sm font-extrabold text-white">Relatórios em PDF</div>
                <div className="text-xs text-slate-400">Transparência total para os síndicos.</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 px-4 md:px-8 bg-slate-900/40 border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                FLUXO TRANSPARENTE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
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
        <section className="py-16 px-4 md:px-8 border-t border-slate-800">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              CASO DE SUCESSO EM OPERAÇÃO
            </span>
            <h2 className="text-2xl font-black text-white mt-1 mb-8">
              Condomínio Varandas do Atlântico
            </h2>

            <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 text-left max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg">
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
                VIBRANIUM ALUGUEL DE EQUIPAMENTOS ESPORTIVOS LTDA
              </div>
              <div className="text-[10px] text-slate-500">
                CNPJ: 64.427.706/0001-17 &middot; Rua Camboriú, 102 - Jacarezinho, Rio de Janeiro - RJ
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
