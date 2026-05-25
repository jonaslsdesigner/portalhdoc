# 🏥 Portal HDOC Saúde — Intranet Corporativa

Sistema de intranet para colaboradores da empresa HDOC Saúde. Centraliza comunicação interna, gestão de pessoas, publicações, eventos e ferramentas do dia a dia.

---

## 📌 Visão Geral

| Item | Descrição |
|------|-----------|
| **Tipo** | Intranet corporativa (uso interno) |
| **Público** | Colaboradores da HDOC Saúde |
| **Objetivo** | Centralizar comunicação, RH, publicações e calendário em um único portal |
| **Status** | 🟡 Em desenvolvimento — Etapa 1 concluída |

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla, sem frameworks) |
| Backend / Banco | Supabase (PostgreSQL + Auth + Storage) |
| Hospedagem | Vercel ou Netlify (arquivos estáticos) |
| Fontes | Google Fonts — Sora + DM Sans |
| Ícones | SVG inline (sem dependências externas) |

---

## 📁 Estrutura de Arquivos

```
portal-hdoc/
├── index.html          # Página principal
├── styles.css          # Estilos globais (mobile-first)
├── app.js              # Lógica JS (calendário, sidebar, animações)
├── README.md           # Este arquivo
│
├── assets/             # (a criar)
│   ├── hero.jpg        # Foto do banner principal
│   ├── logo.svg        # Logo HDOC Saúde
│   └── icons/          # Ícones adicionais
│
├── pages/              # (a criar — Etapa 2+)
│   ├── login.html
│   ├── perfil.html
│   ├── membros.html
│   ├── publicacoes.html
│   └── admin/
│       └── index.html
│
└── js/                 # (a criar — Etapa 2+)
    ├── supabase.js     # Configuração e cliente Supabase
    ├── auth.js         # Login, logout, sessão
    ├── publicacoes.js  # CRUD de posts
    └── membros.js      # Listagem de colaboradores
```

---

## ✅ Etapa 1 — Concluída: Layout Base

### O que foi entregue

- **Topbar** — logo, navegação com dropdowns, badges de notificação, menu do usuário
- **Sidebar** — ícones com hover expandível no desktop; gaveta com overlay no mobile
- **Hero Banner** — foto de fundo com gradiente azul, animação de zoom e fade-in
- **Faixa de Avisos** — 3 tipos: info, warning, success
- **Painel Aniversariantes** — banner comemorativo, lista com avatares e badge "hoje"
- **Painel Tempo de Empresa** — badges por anos de empresa (1, 3, 5, 10+)
- **Feed de Publicações** — cards com tags, autor, data e layout responsivo
- **Calendário** — navegação entre meses, marcação de eventos, dia atual destacado
- **Bottom Nav Mobile** — 4 ícones fixos na base da tela
- **Animações de entrada** — via IntersectionObserver nos cards

### Dados desta etapa

Todos os dados são **estáticos (mock)**. Nenhuma integração real com banco de dados ainda.

---

## 🗺️ Roadmap

### Etapa 2 — Autenticação (próxima)
- [ ] Página de login (`login.html`)
- [ ] Integração com Supabase Auth
- [ ] Proteção de rotas (redirect se não autenticado)
- [ ] Logout e sessão persistente
- [ ] Carregamento do nome/avatar do usuário logado

### Etapa 3 — Dados Reais
- [ ] Buscar aniversariantes do banco
- [ ] Buscar eventos do calendário
- [ ] Feed de publicações (leitura)
- [ ] Membros da empresa

### Etapa 4 — CRUD de Publicações
- [ ] Criar, editar e excluir posts
- [ ] Upload de imagem para banner do post (Supabase Storage)
- [ ] Publicar avisos e banners principais

### Etapa 5 — Painel Admin
- [ ] Gerenciar colaboradores
- [ ] Controle de permissões (admin / colaborador)
- [ ] Configurações do portal

---

## 🗃️ Modelo de Banco de Dados (Supabase / PostgreSQL)

### `usuarios`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária (Supabase Auth) |
| nome | text | Nome completo |
| email | text | E-mail corporativo |
| cargo | text | Cargo na empresa |
| departamento | text | Setor |
| data_admissao | date | Data de entrada na empresa |
| data_nascimento | date | Para cálculo de aniversariantes |
| avatar_url | text | URL da foto (Supabase Storage) |
| role | text | `admin` ou `colaborador` |
| created_at | timestamp | Criação do registro |

### `publicacoes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Título da publicação |
| conteudo | text | Corpo do post |
| tag | text | `aviso`, `evento`, `ti`, `rh`, etc. |
| imagem_url | text | Banner opcional |
| autor_id | uuid | FK → usuarios.id |
| publicado | boolean | Visível ou rascunho |
| created_at | timestamp | Data de publicação |

### `eventos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| titulo | text | Nome do evento |
| data | date | Data do evento |
| tipo | text | `reuniao`, `prazo`, `feriado`, etc. |
| cor | text | Cor no calendário (`blue`, `green`, `orange`) |
| descricao | text | Detalhes opcionais |
| criado_por | uuid | FK → usuarios.id |

### `avisos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| texto | text | Mensagem do aviso |
| tipo | text | `info`, `warning`, `success` |
| ativo | boolean | Exibir ou não |
| expira_em | date | Data de expiração opcional |
| criado_por | uuid | FK → usuarios.id |

---

## 📱 Breakpoints Responsivos

| Breakpoint | Largura | Comportamento |
|------------|---------|---------------|
| Mobile | 375px | Bottom nav, sidebar oculta (gaveta) |
| Tablet | 768px | Sidebar aparece, top nav visível, grid 2 colunas |
| Desktop | 1024px | Sidebar com hover expandível, grid 3 colunas no feed |
| Wide | 1440px | Padding aumentado, layout mais espaçado |

---

## 🎨 Convenções de Código

### CSS
- **Mobile-first**: estilos base para mobile, `@media (min-width: X)` para cima
- **Variáveis CSS** em `:root` para todas as cores, espaçamentos e transições
- **Nomenclatura**: `.bloco`, `.bloco-elemento`, `.bloco--modificador` (BEM-like)
- **Sem `!important`** — especificidade resolvida por hierarquia

### JavaScript
- Vanilla JS puro — **sem jQuery, sem frameworks**
- `'use strict'` em todos os arquivos
- Funções nomeadas (sem arrow functions soltas no topo)
- Comentários `/* ── SEÇÃO ── */` para separar blocos
- TODOs marcados com `// TODO — Etapa X:`

---

## 🚀 Como Rodar Localmente

```bash
# 1. Clone ou baixe os arquivos
# 2. Abra a pasta no VS Code (ou editor de preferência)

# 3. Instale a extensão "Live Server" no VS Code
# 4. Clique com botão direito no index.html → "Open with Live Server"

# OU use o Python embutido:
python3 -m http.server 3000
# Acesse: http://localhost:3000
```

> **Importante:** abrir o `index.html` direto pelo navegador (`file://`) pode bloquear alguns recursos. Use sempre um servidor local.

---

## 🔗 Links

| Recurso | URL |
|---------|-----|
| Supabase | https://supabase.com |
| Documentação Supabase JS | https://supabase.com/docs/reference/javascript |
| Deploy Netlify Drop | https://app.netlify.com/drop |
| Google Fonts (Sora) | https://fonts.google.com/specimen/Sora |

---

## 👤 Desenvolvido por

**Jonas Lima** — Portal HDOC Saúde  
Versão atual: `v0.1.0` — Etapa 1 (Layout Base)
