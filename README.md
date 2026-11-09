# Fazendo Esporte &middot; Plataforma de Chamados QR Code & SLA 48h

Sistema inteligente de gestão, chamados via QR Code e monitoramento de equipamentos de academia para a **Fazendo Esporte** (**SFE - Serviços Fazendo Esporte**), liderada por **Leandro Amélio**.

Desenvolvido por **Jessé de Paula**.

---

## 🚀 Funcionalidades Principais

1. **Abertura de Chamados com Bloqueio de Senha por Condomínio via QR Code (`/qr/[code]`):**
   - Cada máquina possui um QR Code adesivado exclusivo.
   - Ao ler com a câmera do celular, o link abre no navegador identificando condomínio e máquina.
   - **Password Gate:** Exige a senha cadastrada para o condomínio pelo síndico/responsável, evitando chamados indevidos de alunos.
   - **Envio Simultâneo:** Ao submeter, cria o chamado no banco/Kanban com SLA de 48h e abre automaticamente o WhatsApp do Leandro com todo o texto formatado para envio direto.

2. **Quadro Kanban de Manutenção (`/admin`):**
   - Colunas: **A Fazer**, **Fazendo** e **Feito**.
   - **Cronômetro Regressivo de SLA de 48 horas**: permanece ativo e visível tanto em "A Fazer" quanto em "Fazendo".
   - **Tempo de Conclusão**: na coluna "Feito / Concluído", exibe exatamente em quanto tempo foi concluído (ex: *CONCLUÍDO EM 35H 12MIN*) e o saldo do SLA de 48h.
   - **Arquivamento Inteligente (+7 dias)**: exibe na coluna apenas os concluídos na última semana, movendo os anteriores para o histórico arquivado com botão de alternância.

3. **Módulo de Senhas de Clientes (`/admin/clientes`):**
   - Gestão de senhas exclusivas por condomínio/academia no menu lateral.
   - Botão rápido para copiar aviso pronto com link e senha para enviar ao síndico pelo WhatsApp.

4. **Menu Lateral Esquerdo Fixo e Reativo:**
   - Contadores "A Fazer" e "Fazendo" sincronizados em tempo real via Supabase Realtime.
   - Filtro por cliente e perfil do gestor fixos.

5. **Gerador de Folhas de Etiquetas QR Code A4 (`/admin/etiquetas`):**
   - Calibrado para exatamente **10 máquinas por folha A4** (2 colunas x 5 linhas) sem corte.
   - Botão para **Imprimir Etiqueta Completa** (com logo e instruções) e botão para **Imprimir Somente QR Codes** (com código da máquina abaixo).

6. **Emissor de Relatórios Executivos em PDF (`/admin/relatorios`):**
   - Comprovação do cumprimento de 100% do SLA de 48 horas, histórico de intervenções e métricas de disponibilidade para envio aos síndicos e gestores de academia.

7. **Site Institucional Oficial (`/`):**
   - "A parceria definitiva em manutenção, reforma e locação fitness."
   - Apresentação executiva, canais de contato e acesso ao painel.

---

## 🏢 Cliente Piloto: Condomínio Varandas do Atlântico
- **21 Equipamentos Cadastrados** (Movement, Buick, Schwinn, Supertech).
- Códigos: `VA-01` a `VA-21`.

---

## 🛠️ Stack Tecnológica
- **Frontend & Fullstack:** Next.js, React, TypeScript, Tailwind CSS
- **Ícones & UI:** Lucide React
- **QR Code Engine:** QRCode.js
- **Banco de Dados & Backend:** Supabase (PostgreSQL 17 com RLS e Realtime)
- **Hospedagem & Deploy:** Vercel
