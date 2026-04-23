<div align="center">

# ✈️ TRIPDAN

**Planeje suas viagens com simplicidade.**

[![Frontend](https://img.shields.io/badge/frontend-Vercel-black?logo=vercel)](https://tripdan.vercel.app)
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7?logo=render&logoColor=white)](https://tripdan.onrender.com)
[![Version](https://img.shields.io/badge/version-0.0.1-blue)](https://github.com/notSoDaniel/tripdan/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[**Abrir o app →**](https://tripdan.vercel.app)

</div>

---

## Sobre

O **tripdan** é um gerenciador de viagens mobile-first. Em poucos toques você cria uma viagem, monta o checklist do que levar e controla os gastos — tudo em um só lugar.

## Funcionalidades

- 🗺️ **Viagens** — crie, edite e exclua viagens com destino, datas e status
- ✅ **Checklist** — liste o que levar, organize por categoria e marque conforme vai embalando
- 💰 **Gastos** — registre despesas previstas e reais, com barra de progresso e saldo automático

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Backend | Java 21, Quarkus 3.34, Hibernate Panache |
| Banco (dev) | H2 in-memory |
| Banco (prod) | PostgreSQL |
| Deploy frontend | Vercel |
| Deploy backend | Render |

## Rodando localmente

### Pré-requisitos

- Java 21
- Node 20+

### Backend

```bash
cd backend
./mvnw quarkus:dev
# API disponível em http://localhost:8080
# Swagger UI em http://localhost:8080/swagger-ui
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App disponível em http://localhost:5173
```

> O frontend já tem proxy configurado: chamadas para `/api` são redirecionadas automaticamente para `http://localhost:8080`.

## Arquitetura

```
tripdan/
├── backend/                    # Quarkus API REST
│   ├── src/main/java/com/tripdan/
│   │   ├── model/              # Entidades JPA (Trip, ChecklistItem, Expense)
│   │   ├── resource/           # Endpoints REST
│   │   └── filter/             # CORS filter
│   └── src/main/resources/
│       └── application.properties  # Perfis dev/test/prod
│
└── frontend/                   # React SPA
    └── src/
        ├── pages/              # TripList, TripForm, TripDetail
        ├── components/         # AppHeader, Logo, Footer
        └── services/api.js     # Camada de acesso à API
```

## Deploy

### Backend — Render

Variáveis de ambiente necessárias:

```
DB_URL       = jdbc:postgresql://<host>/<database>
DB_USER      = <usuario>
DB_PASSWORD  = <senha>
CORS_ORIGINS = https://tripdan.vercel.app
```

### Frontend — Vercel

Variáveis de ambiente necessárias:

```
VITE_API_URL = https://tripdan.onrender.com
```

> **Free tier:** o backend hiberna após 15 min sem uso. A primeira requisição pode levar ~30s. Para evitar, configure um ping periódico via [UptimeRobot](https://uptimerobot.com).

## Contribuindo

Este projeto segue o **Git Flow**:

```
main       → produção
develop    → integração
feature/*  → novas funcionalidades (abrir PR para develop)
fix/*      → correções de bug
```

A branch `main` é protegida — push direto bloqueado, PR com aprovação obrigatória.

## Changelog

### v0.0.2 — 2026-04-22
- Sistema de login e cadastro com e-mail e senha
- Autenticação via JWT (SmallRye JWT + RSA)
- Cada usuário vê apenas suas próprias viagens
- Perfil do usuário exibido no topo do app com botão de logout
- Proteção contra IDOR em checklist e gastos

### v0.0.1 — 2026-04-22
- Lançamento inicial
- CRUD de viagens
- Checklist de itens por categoria
- Controle de gastos com orçamento previsto vs real
- Deploy no Render (backend) e Vercel (frontend)
- Branding TRIPDAN com logo e header azul

---

<div align="center">
  Feito com ☕ por <a href="https://github.com/notSoDaniel">notSoDaniel</a>
</div>
