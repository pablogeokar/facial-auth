# FaceGuard - Sistema de Autenticação Facial

FaceGuard é uma aplicação moderna de autenticação e gestão de usuários baseada em reconhecimento facial. Utilizando tecnologias de ponta como **Fastify**, **Next.js 15+** e **face-api.js**, o sistema permite o cadastro de faces, verificação em tempo real e gerenciamento administrativo de usuários.

![Status do Projeto](https://img.shields.io/badge/status-ativo-success)
![Tech Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20Next.js%20%7C%20Fastify-blue)

---

## 🚀 Funcionalidades

- **Cadastro de Usuários (Enrollment):** Captura de dados biométricos faciais através da webcam e armazenamento de descritores (128-d).
- **Verificação Facial (Verification):** Autenticação instantânea comparando a face capturada com a base de dados utilizando um limiar de precisão ajustável.
- **Gestão de Usuários:** Interface administrativa para visualizar, editar status (Ativo, Suspenso, Bloqueado) e remover usuários.
- **Feedback Visual:** Diálogos animados e intuitivos para indicar sucesso, acesso negado ou usuários bloqueados.

---

## 🛠️ Tecnologias Utilizadas

### Backend (`/api`)
- **Fastify:** Framework web focado em performance e baixo overhead.
- **TypeScript:** Tipagem estática para maior segurança e produtividade.
- **face-api.js (TensorFlow.js):** Motor de reconhecimento facial rodando no lado do servidor com suporte a modelos pré-treinados (SSD Mobilenet v1, Face Landmark, Face Recognition).
- **Canvas:** Integração para processamento de imagens no ambiente Node.js.

### Frontend (`/web`)
- **Next.js 15+ (App Router):** Framework React para uma experiência de usuário fluida e otimizada.
- **Tailwind CSS 4:** Estilização moderna e responsiva com foco em utilitários.
- **React 19:** Utilizando as últimas funcionalidades como `use client` e hooks otimizados.

---

## 📂 Estrutura do Projeto

```text
facial-auth/
├── api/                # Servidor Backend (Fastify + face-api.js)
│   ├── src/            # Código fonte TypeScript
│   ├── models/         # Modelos pré-treinados do TensorFlow
│   └── scripts/        # Scripts de utilidade (ex: download de modelos)
├── web/                # Aplicação Frontend (Next.js)
│   ├── app/            # Páginas e componentes (App Router)
│   └── public/         # Ativos estáticos (Logos, imagens)
└── render.yaml         # Configuração para deploy no Render.com
```

---

## 🔧 Como Executar Localmente

### Pré-requisitos
- Node.js v20 ou superior
- pnpm (recomendado) ou npm/yarn

### 1. Configurar o Backend
```bash
cd api
pnpm install
# Os modelos serão baixados automaticamente no build
pnpm run dev
```
O servidor estará rodando em `http://localhost:3001`.

### 2. Configurar o Frontend
```bash
cd web
pnpm install
# Crie um arquivo .env com a URL da API
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env
pnpm run dev
```
Acesse `http://localhost:3000`.

---

## 🌐 Deploy

O projeto está configurado para deploy automático no **Render.com** através do arquivo `render.yaml`. 

- O backend deve ser exposto via porta `PORT` definida pelo ambiente.
- O frontend deve ter a variável `NEXT_PUBLIC_API_URL` apontando para a URL do backend gerada pelo Render.

---

## 📈 Melhorias Futuras

- [ ] Migrar o `userStore` de memória para um banco de dados relacional (ex: PostgreSQL) com suporte a vetores (pgvector).
- [ ] Implementar Liveness Detection para evitar fraudes com fotos ou vídeos.
- [ ] Adicionar suporte a múltiplos descritores por usuário para maior precisão em diferentes condições de iluminação.
- [ ] Implementar autenticação JWT para proteger as rotas administrativas.

---

Desenvolvido com ❤️ por Pablo George
