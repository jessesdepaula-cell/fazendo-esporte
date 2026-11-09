# Fazendo Esporte &middot; Plataforma de Chamados QR Code & SLA 24h

Sistema inteligente de gestão, chamados via QR Code e monitoramento de equipamentos de academia para a **Fazendo Esporte** (**Manutenção & Locação de Equipamentos Fitness**), liderada por **Leandro Amélio**.

Desenvolvido por **Jessé de Paula**.

---

## 🚀 Funcionalidades Principais

1. **Abertura de Chamados sem Aplicativo via QR Code (`/qr/[code]`):**
   - Cada máquina possui um QR Code adesivado exclusivo.
   - Ao ler com a câmera do celular, o link abre no navegador com a máquina e o cliente automaticamente identificados.
   - Formulário ágil para envio de relato do defeito com foto da avaria e verificação anti-spam.
   - Garantia de atendimento com prazo SLA de até 24 horas.

2. **Quadro Kanban de Manutenção (`/admin`):**
   - Colunas: **A Fazer**, **Fazendo** e **Feito**.
   - **Contador regressivo de SLA de 24 horas em tempo real** em cada chamado na coluna "A Fazer".
   - Alerta visual verde &rarr; amarelo &rarr; vermelho crítico conforme a proximidade do vencimento do SLA.
   - Notificação automática disparada para o cliente quando o chamado vai para "Fazendo" (*"Estamos cientes da sua situação, nossa equipe técnica está atuando para resolver!"*) e para "Feito" (*"Manutenção concluída com sucesso! Equipamento liberado."*).

3. **Menu Lateral Esquerdo com Filtro por Cliente:**
   - Filtro dinâmico para alternar entre "Todos os Clientes" e condomínios/academias individuais (ex: **Condomínio Varandas do Atlântico**).

4. **Gerador de Folhas de Etiquetas QR Code A4 (`/admin/etiquetas`):**
   - Formatação automática em grade pronta para impressão e recorte em papel adesivo vinílico, com a marca da Fazendo Esporte e instruções claras.

5. **Emissor de Relatórios Executivos em PDF (`/admin/relatorios`):**
   - Comprovação do cumprimento de 100% do SLA de 24 horas, histórico de intervenções e métricas de disponibilidade para envio aos síndicos e gestores de academia.

6. **Site Institucional Oficial (`/`):**
   - Landing page executiva com apresentação de serviços, chamada para novos contratos no WhatsApp e link de acesso ao painel.

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
