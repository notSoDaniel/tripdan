# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**tripdan** is a mobile-first trip planning app. The repo has two independent sub-projects:

- `backend/` — Quarkus 3.34 (Java 21, Maven), REST API on port **8080**
- `frontend/` — React 19 + Vite 8 + Tailwind CSS v4, dev server on port **5173**

## Development commands

### Backend

Maven is not on the system PATH. Use the wrapper:

```bash
# Dev mode (hot reload, H2 in-memory, Swagger UI at /swagger-ui)
cd backend && ./mvnw quarkus:dev

# Run tests
cd backend && ./mvnw test

# Production build (outputs to target/quarkus-app/)
cd backend && ./mvnw package -DskipTests
```

### Frontend

```bash
cd frontend && npm run dev      # dev server with HMR
cd frontend && npm run build    # production build → dist/
cd frontend && npm run lint     # ESLint
```

## Architecture

### Backend

Panache Active Record pattern — entities extend `PanacheEntity` and carry their own finders. No repository layer.

```
model/
  User.java           — usuário com email, passwordHash, role (USER|ADMIN), createdAt
  Trip.java           — root aggregate; owns checklist + expenses via OneToMany(CASCADE ALL); campo userId para isolamento por dono
  ChecklistItem.java  — child of Trip; @JsonIgnore on trip field (breaks circular ref)
  Expense.java        — child of Trip; @JsonIgnore on trip field; type=PLANNED|ACTUAL enables budget vs actual tracking
resource/
  AuthResource.java          — POST /api/auth/register, /login, /bootstrap (cria primeiro ADMIN; auto-desativa)
  TripResource.java          — CRUD /api/trips; @Authenticated; filtra por userId; GET methods force-init lazy collections
  ChecklistResource.java     — /api/trips/{tripId}/checklist; PATCH /{itemId}/toggle flips checked; IDOR check
  ExpenseResource.java       — /api/trips/{tripId}/expenses; GET /summary returns {planned, actual, balance}; IDOR check
  AdminResource.java         — @RolesAllowed("ADMIN"); GET /api/admin/users|trips, PUT /role, DELETE /users/{id}
```

**Key constraint:** Quarkus RESTEasy Reactive serializes responses *outside* the transaction boundary. Lazy collections on `Trip` must be force-initialized inside `@Transactional` GET methods (`trip.checklistItems.size()`), or they throw `LazyInitializationException`.

**Bean validation gotcha:** `@NotNull` must not be placed on `@ManyToOne trip` fields in child entities — the resource sets the field after deserialization, so validation fires before assignment.

**CORS:** Tratado via `filter/CorsFilter.java` — `ContainerResponseFilter` + `ContainerRequestFilter` com `@PreMatching`. **Não usar** `quarkus.http.cors.*` em `application.properties`: a config nativa foi tentada e quebrou todo o CORS (inclusive login/register), possivelmente por conflito com `quarkus-smallrye-jwt`. O filtro JAX-RS funciona para todos os fluxos normais; se um endpoint retornar 500 sem CORS, investigar exceção não tratada na raiz.

**JWT:** Assina com RSA. Em dev/test usa `dev-private.pem`/`dev-public.pem` commitados. Em prod, setar `SMALLRYE_JWT_SIGN_KEY` e `MP_JWT_VERIFY_PUBLICKEY` como variáveis de ambiente (base64 DER, sem headers PEM). Roles são passadas no claim `groups` do JWT para que `@RolesAllowed` funcione.

### Database profiles

| Profile | DB | Schema strategy |
|---|---|---|
| `%dev` | H2 in-memory | `drop-and-create` (data lost on restart) |
| `%test` | H2 in-memory | `drop-and-create` |
| `%prod` | PostgreSQL | `update` (requires `DB_URL`, `DB_USER`, `DB_PASSWORD` env vars) |

> **Atenção prod:** o `update` do Hibernate nem sempre adiciona colunas novas automaticamente. Ao adicionar campos a entidades existentes, rodar o ALTER TABLE manualmente no banco de produção antes do deploy para garantir.

### Frontend

Single-page app with React Router v7. All API calls go through `src/services/api.js`, which proxies `/api` → `http://localhost:8080` via Vite's dev server proxy.

```
pages/
  TripList.jsx    — home screen; lists trips do usuário logado
  TripForm.jsx    — create + edit (shared, driven by presence of :id param)
  TripDetail.jsx  — trip view with two tabs: Checklist and Expenses
  LoginPage.jsx   — formulário de login
  RegisterPage.jsx — formulário de cadastro
  AdminPage.jsx   — painel admin com abas Usuários e Viagens; acessível só por ADMIN
context/
  AuthContext.jsx — armazena token, email e role no localStorage; expõe logout; dispara auth:unauthorized no 401
components/
  AppHeader.jsx   — header com gradiente azul, nuvens, logo, perfil do usuário e botão logout; badge Admin + link para /admin se ADMIN
  BottomNav.jsx   — navegação inferior; item "Painel" visível só para ADMIN
  ProtectedRoute.jsx — redireciona para /login se sem token; AdminRoute redireciona para / se não for ADMIN
  Footer.jsx      — fixed bottom bar mostrando "tripdan v0.0.3"
services/
  api.js          — thin fetch wrapper; endpoints: api.auth, api.trips, api.checklist, api.expenses, api.admin
```

**Tailwind note:** Uses Tailwind v4 (`@import "tailwindcss"` in `index.css`, configured via `@tailwindcss/vite` plugin). No `tailwind.config.js`. `color-scheme` is forced to `light` — dark mode is not implemented.

## Git workflow

This project uses **Git Flow**:

- `main` — production-ready code only
- `develop` — integration branch; all features merge here
- `feature/<name>` — branch off `develop` for new features
- `release/<version>` — branch off `develop` when preparing a release; merges into both `main` and `develop`
- `hotfix/<name>` — branch off `main` for urgent production fixes; merges into both `main` and `develop`

Never commit features directly to `main` or `develop`.

Após o merge de qualquer branch em `develop` ou `main`, apagar a branch imediatamente (local e remote).

## Roadmap — próximas features (v0.0.4+)

As features abaixo estão planejadas mas ainda não implementadas. Cada uma deve seguir Git Flow em sua própria branch:

| Feature | Branch | Status |
|---|---|---|
| ~~Perfis de usuário (comum e administrador)~~ | ~~`feature/user-roles`~~ | **Concluído em v0.0.3** |
| Melhorias visuais (a detalhar com o usuário) | `feature/ui-improvements` | pendente |
| Editar itens de checklist e gastos | `feature/edit-items` | pendente |
| Média de gasto por dia de viagem | `feature/expense-average` | pendente |
| Gráficos de resumo de gastos | `feature/expense-charts` | pendente |

> Antes de iniciar `feature/ui-improvements`, perguntar ao usuário quais aspectos visuais quer melhorar (animações, espaçamentos, cores, loading states, etc.).

## Deploy

- **Backend:** `backend/Dockerfile` (multi-stage, eclipse-temurin:21-alpine). Targets Render. Variáveis de ambiente necessárias:
  - `DB_URL`, `DB_USER`, `DB_PASSWORD` — conexão PostgreSQL
  - `SMALLRYE_JWT_SIGN_KEY` — chave privada RSA em base64 DER (sem headers PEM)
  - `MP_JWT_VERIFY_PUBLICKEY` — chave pública RSA em base64 DER (sem headers PEM)
- **Frontend:** `frontend/vercel.json` (Vercel). Redireciona todas as rotas para `index.html` para SPA routing. Set `VITE_API_URL` com a URL do backend no Render.
- **Primeiro admin em produção:** `POST /api/auth/bootstrap` com `{"email":"...","password":"..."}`. Funciona apenas se não houver nenhum ADMIN no banco. Auto-desativa após o primeiro uso.
