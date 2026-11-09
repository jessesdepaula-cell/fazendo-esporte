'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Client, Machine } from '@/lib/types';
import {
  Building2,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Check,
  Copy,
  Plus,
  Search,
  Lock,
  Phone,
  Mail,
  MapPin,
  Dumbbell,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Passwords edit state: { [clientId]: password }
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Client Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: clientsData, error: cErr } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      const { data: machinesData, error: mErr } = await supabase
        .from('machines')
        .select('id, client_id');

      if (clientsData) {
        setClients(clientsData);
        const passMap: Record<string, string> = {};
        clientsData.forEach((c) => {
          passMap[c.id] = c.access_password || '123456';
        });
        setPasswords(passMap);
      }

      if (machinesData) {
        setMachines(machinesData as any);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordChange = (clientId: string, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [clientId]: value
    }));
  };

  const toggleShowPassword = (clientId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleSavePassword = async (client: Client) => {
    const newPass = (passwords[client.id] || '').trim();
    if (!newPass) {
      alert('A senha não pode ficar em branco.');
      return;
    }

    try {
      setSavingId(client.id);
      const { error } = await supabase
        .from('clients')
        .update({ access_password: newPass })
        .eq('id', client.id);

      if (error) {
        console.error(error);
        alert('Erro ao salvar senha no banco de dados.');
      } else {
        setSavedSuccessId(client.id);
        setTimeout(() => setSavedSuccessId(null), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar senha.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCopyInstructions = (client: Client) => {
    const pass = passwords[client.id] || client.access_password || '123456';
    const text = `*FAZENDO ESPORTE - ACESSO EXCLUSIVO DO SÍNDICO / ADMINISTRAÇÃO*\n\n` +
      `Olá! Seguem os dados de acesso para abertura e acompanhamento de chamados de manutenção para o *${client.name}*:\n\n` +
      `🔑 *Senha de Acesso:* ${pass}\n\n` +
      `📱 *Como funciona:* Ao ler o QR Code de qualquer aparelho da academia com a câmera do celular, digite a senha acima para liberar o formulário. O chamado é enviado diretamente para nosso sistema com SLA de até 24 horas!\n\n` +
      `WhatsApp Suporte: (21) 99999-5359`;

    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      alert('Informe o nome do condomínio ou empresa.');
      return;
    }

    try {
      setCreating(true);
      const slug = newClientName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const initialPassword = newPassword.trim() || `${slug.split('-')[0]}@2026`;

      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: newClientName.trim(),
          slug,
          contact_name: newContactName.trim() || null,
          contact_phone: newContactPhone.trim() || null,
          contact_email: newContactEmail.trim() || null,
          address: newAddress.trim() || 'Rio de Janeiro - RJ',
          access_password: initialPassword,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        alert('Erro ao criar cliente: ' + error.message);
      } else {
        alert(`Condomínio "${newClientName}" cadastrado com sucesso!`);
        setIsModalOpen(false);
        setNewClientName('');
        setNewContactName('');
        setNewContactPhone('');
        setNewContactEmail('');
        setNewPassword('');
        setNewAddress('');
        await loadData();
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado ao salvar cliente.');
    } finally {
      setCreating(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.contact_name && c.contact_name.toLowerCase().includes(q)) ||
      (c.contact_phone && c.contact_phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            Senhas & Acesso dos Clientes
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Controle de Acesso QR
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre a senha exclusiva de cada condomínio para garantir que somente os síndicos e responsáveis abram chamados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Condomínio / Cliente
          </button>
        </div>
      </div>

      {/* WHY THIS MATTERS EXPLANATION BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              Proteção Anti-Spam por Senha Operacional
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Ao escanear o QR Code de um equipamento, o morador ou visitante vê a página protegida e só pode prosseguir informando a <strong>senha do condomínio</strong>. Dessa forma, você evita que alunos e frequentadores abram solicitações indevidas.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs text-purple-200 flex items-center gap-2 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Filtro Ativo em Todos os QR Codes</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por condomínio, síndico ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-800">{filteredClients.length}</strong> condomínios cadastrados
        </div>
      </div>

      {/* CLIENTS CARDS / LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const clientMachinesCount = machines.filter((m) => m.client_id === client.id).length;
          const isShow = showPassword[client.id] || false;
          const isSaving = savingId === client.id;
          const isSuccess = savedSuccessId === client.id;
          const isCopied = copiedId === client.id;

          return (
            <div
              key={client.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* TOP BAR */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm border border-purple-200">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">{client.name}</h2>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                        slug: {client.slug}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5 flex-shrink-0">
                    <Dumbbell className="w-3.5 h-3.5 text-purple-600" />
                    {clientMachinesCount} Aparelhos
                  </span>
                </div>

                {/* CONTACT DETAILS */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Responsável:</span>
                    <strong className="text-slate-800">{client.contact_name || 'Administração / Síndico'}</strong>
                  </div>
                  {client.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.contact_phone}</span>
                    </div>
                  )}
                  {client.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-purple-600 font-mono text-[11px]">{client.contact_email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PASSWORD CONFIGURATION BOX */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Senha de Acesso do Condomínio
                  </span>
                  {isSuccess && (
                    <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3" /> Senha Atualizada!
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isShow ? 'text' : 'password'}
                      value={passwords[client.id] || ''}
                      onChange={(e) => handlePasswordChange(client.id, e.target.value)}
                      placeholder="Defina a senha..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword(client.id)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      title={isShow ? 'Ocultar Senha' : 'Ver Senha'}
                    >
                      {isShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSavePassword(client)}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                    title="Salvar Senha"
                  >
                    {isSaving ? (
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Salvar</span>
                  </button>
                </div>

                {/* QUICK WHATSAPP INSTRUCTIONS BUTTON */}
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyInstructions(client)}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5 transition-colors bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Mensagem Copiada!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Copiar Mensagem com Senha p/ Síndico</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/admin/etiquetas?cliente=${client.id}`}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Ver Etiquetas</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL NOVO CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Cadastrar Novo Condomínio
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Condomínio / Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Condomínio Royal Blue"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Contato / Síndico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Roberto Síndico"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp do Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (21) 98888-7777"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail de Notificação
                  </label>
                  <input
                    type="email"
                    placeholder="sindico@condominio.com"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    Senha de Acesso do QR *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: royal@2026"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endereço / Bairro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Barra da Tijuca, Rio de Janeiro - RJ"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:from-orange-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {creating ? 'Salvando...' : 'Cadastrar Condomínio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
