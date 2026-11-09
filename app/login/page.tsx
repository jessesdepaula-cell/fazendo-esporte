'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('Fazendoesporte2022@gmail.com');
  const [password, setPassword] = useState('@Leandro951');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/admin');
      }
    }
    checkAuth();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        setSuccessMsg('Autenticado com sucesso! Redirecionando para o painel...');
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg('Falha na conexão com o servidor de autenticação. Tente novamente.');
      setLoading(false);
    }
  }

  function fillLeandroCredentials() {
    setEmail('Fazendoesporte2022@gmail.com');
    setPassword('@Leandro951');
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 px-4 py-8">
      {/* TOP HEADER */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-6">
        <a href="/" className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-white transition-colors">
          <span>&larr; Voltar ao site</span>
        </a>
        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          Acesso Seguro B3 / SSL
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* ACCENT TOP BAR */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-purple-600" />

          {/* LOGO & HEADING */}
          <div className="flex flex-col items-center text-center mb-6 pt-2">
            <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-lg flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Logo Fazendo Esporte"
                width={54}
                height={54}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              FAZENDO ESPORTE
            </h1>
            <p className="text-xs text-purple-300 font-semibold mt-0.5">
              Central de Gestão Técnica & SLA 48h
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Painel operacional exclusivo de <strong>Leandro Amélio</strong>
            </p>
          </div>

          {/* MESSAGES */}
          {errorMsg && (
            <div className="mb-5 bg-red-950/80 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Erro no Acesso:</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QUICK PRE-FILL ACTION */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={fillLeandroCredentials}
                className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium"
              >
                Preencher credenciais do Leandro
              </button>
              <span className="text-[11px] text-slate-500">
                Sessão segura 24h
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* CREDENTIALS INFO BOX */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Usuário cadastrado:{' '}
              <span className="font-mono text-purple-300 font-bold">Fazendoesporte2022@gmail.com</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              SFE - Serviços Fazendo Esporte
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-500 pt-6">
        Desenvolvido com excelência técnica por <strong>Jessé de Paula</strong> &middot; Fazendo Esporte &copy; 2026
      </footer>
    </div>
  );
}
