# MovieCompass — Frontend Interview Prep Guide

> A complete, brutally honest study guide for defending this project in a frontend
> developer interview. It covers architecture, the React/TypeScript frontend in depth,
> the FastAPI backend, the Ollama/Mistral AI layer, Docker, and a long list of **real
> questions interviewers ask** — each with a model answer grounded in *your actual code*.

---

## Table of Contents

1. [30-Second & 2-Minute Pitch](#1-pitch)
2. [Architecture — The Big Picture](#2-architecture)
3. [Frontend Deep Dive](#3-frontend)
4. [State Management (the heart of the FE story)](#4-state)
5. [Performance Patterns](#5-performance)
6. [TypeScript Questions](#6-typescript)
7. [Authentication Flow (end to end)](#7-auth)
8. [Backend (what a frontend dev should know)](#8-backend)
9. [The AI / Ollama Layer](#9-ai)
10. [Docker & DevOps](#10-docker)
11. [Testing](#11-testing)
12. [Known Weaknesses & Trade-offs (interviewers LOVE these)](#12-weaknesses)
13. [Rapid-Fire Q&A Bank](#13-rapidfire)
14. [Questions YOU should ask them](#14-ask-back)

---

<a name="1-pitch"></a>
## 1. The Pitch

**30-second version:**
> "MovieCompass is a full-stack, AI-powered movie discovery platform. The frontend is a
> React 19 + TypeScript SPA built with Vite, Tailwind, and shadcn/ui. It talks to a
> FastAPI (Python) backend that integrates the TMDB API for movie data, MongoDB for user
> data, JWT + Google OAuth2 for auth, and a locally-hosted Mistral LLM via Ollama for
> personalized recommendations. The whole thing is containerized with Docker Compose."

**2-minute version — add:**
- Frontend state is managed entirely with **React Context + `useReducer`** (no Redux), with a
  client-side caching layer built on JS `Map`s for movies, casts, reviews, and trailers.
- I implemented **optimistic UI** for watchlist/favorites/ratings, **infinite scroll** with
  `IntersectionObserver`, and a centralized **`authFetch`** wrapper that injects the JWT and
  auto-logs-out on token expiry.
- The backend is **layered** (endpoints → services → schemas), fully async for I/O via
  `aiohttp`/`asyncio.gather`, validates everything with **Pydantic v2**, and ships with a
  **multi-stage Docker build that runs the test suite as a build gate**.

---

<a name="2-architecture"></a>
## 2. Architecture — The Big Picture

```
React SPA (Vite)  ⇄  FastAPI backend  ⇄  MongoDB Atlas
   :5173               :8000                (users)
                         │  ⇅
                         ├── TMDB API   (movie data)
                         ├── Ollama/Mistral :11434  (AI recs)
                         └── Gmail SMTP  (email verify / reset)
```

Four Docker services in `docker-compose.yml`: **ollama**, **backend**, **frontend**.
MongoDB is *external* (Atlas) — deliberately not in compose.

**Q: Is this really "microservices"?**
> Honest answer: "The README calls it microservices, but it's more accurately a **service-oriented /
> multi-container architecture**. There's one backend monolith plus two supporting services (the LLM
> and the DB). True microservices would split auth, movies, and users into independently deployable
> services with their own datastores. For a project this size, a modular monolith is the right call —
> microservices would be over-engineering."

**Q: Why separate the AI into its own container?**
> "Ollama runs a 7B-parameter model that needs its own runtime, model weights (cached in a Docker
> volume so they survive restarts), and a long startup. Isolating it means the backend stays light,
> and I can scale or swap the model independently. The backend talks to it over an OpenAI-compatible
> HTTP API."

---

<a name="3-frontend"></a>
## 3. Frontend Deep Dive

### Stack
- **React 19**, **TypeScript 5.8**, **Vite 6** (build + dev server)
- **Tailwind CSS 3.4** + **shadcn/ui** (components built on **Radix UI** primitives)
- **Framer Motion** (animations), **React Router 7**, **lucide-react** (icons)
- **`use-context-selector`** (selective context subscriptions — see §5)

### Folder structure (feature-first)
```
src/
├── api/         authFetch.ts, logoutRegistry.ts   ← networking + auth plumbing
├── contexts/    Auth, User, Movies, MovieModal, Message  ← global state
├── hooks/       useInfiniteScroll, useFetchOnView, useAuthSubmit, ...
├── components/   feature folders (auth/, dashboard/, search/, ui/, ...)
├── pages/        route-level screens
├── types/        shared TS types per domain
└── data/         constants, static content
```

**Q: Why this structure?**
> "I grouped by **feature/domain** rather than by file type, so everything for, say, the auth flow
> lives together. The `ui/` folder holds the generic shadcn primitives (Button, Dialog, Card), and
> `components/<feature>/` holds composed, app-specific components. Cross-cutting logic lives in
> `contexts/`, `hooks/`, and `api/`."

**Q: What is shadcn/ui and why use it over a component library like MUI?**
> "shadcn/ui isn't an installed dependency — it's a set of **copy-in** components built on Radix UI
> primitives and styled with Tailwind. The code lives in *my* repo (`components/ui/`), so I own it and
> can customize freely. Radix gives me accessibility (focus traps, ARIA, keyboard nav) for free on
> things like the movie detail Dialog and the rating Select. Versus MUI, I avoid a heavy runtime CSS-in-JS
> dependency and get full control of styling through Tailwind."

---

<a name="4-state"></a>
## 4. State Management — the heart of the frontend story

There is **no Redux/Zustand/React Query**. State is split across **five Context providers**, each
backed by `useReducer`. Provider nesting (in `App.tsx`):

```
AuthProvider → MessageProvider → UserProvider → MoviesProvider → MovieModalProvider
```

| Context | Responsibility | Pattern |
|---|---|---|
| `AuthContext` | Auth *form* UI state (login/signup toggle, password visibility, errors) | single context + reducer |
| `MessageContext` | Global toast/notification system | single context + reducer |
| `UserContext` | Authenticated user data, profile, AI recs, watchlist/fav/ratings | **split State/Actions contexts** + `use-context-selector` |
| `MoviesContext` | TMDB data + **client-side cache** (popular, by-genre, search, casts, reviews) | single context + reducer + `useMemo` |
| `MovieModalContext` | Movie detail modal open/close + trailer cache | **split State/Actions contexts** |

**Q: Why Context + useReducer instead of Redux?**
> "For this app's size, Redux would be boilerplate overhead. `useReducer` gives me the same predictable
> reducer pattern — actions, pure reducers, a single dispatch — without the library. I split state into
> *domain-specific* contexts so unrelated updates don't cause global re-renders, and I addressed the
> classic Context performance pitfall with `use-context-selector` and split state/action contexts."

**Q: Why not React Query / SWR for the server state?**
> "Honest answer: React Query would actually be a **great fit** here and would replace a lot of my
> hand-rolled code — caching, deduplication, loading/error states, and pagination are exactly what it
> solves. I built it manually with reducers + `Map`-based caches to demonstrate I understand the
> underlying mechanics, but in production I'd reach for React Query (or RTK Query) to delete ~40% of
> my context code and get request cancellation, stale-while-revalidate, and retries for free."

### The reducer + cache pattern (MoviesContext)
State holds `Map`s keyed by id, e.g. `moviesByGenre: Map<genreId, Movie[]>`, `casts: Map<movieId, Cast[]>`,
plus per-key `loading`/`error`/`page`/`hasMore` Maps. Each fetch:
1. dispatches a `..._START` action,
2. fetches, **deduplicates** against existing ids (`new Set(prev.map(m => m.id))`),
3. dispatches `..._SUCCESS` merging new data into a **new Map** (to keep references immutable).

**Q: Why create a new `Map` on every update instead of mutating?**
> "React's reducer relies on **referential identity** to know state changed. If I mutated the existing
> Map (`state.casts.set(...)`) and returned the same state object, React might bail out of the re-render.
> So I do `new Map(state.casts).set(id, value)` — a shallow copy with the one change. It's immutable
> update semantics, same as spreading an object or array."

**Q: How do you prevent duplicate movies during infinite scroll?**
> "Each `_SUCCESS` reducer builds a `Set` of existing ids and filters incoming results: 
> `movies.filter(m => !ids.has(m.id))`. TMDB pages can overlap or re-order, so this guards against
> rendering the same card twice (which would also violate React's `key` uniqueness)."

### Optimistic UI (UserContext)
`toggleMovieOnServer`, `setMovieRating`, `removeMovieRating` all **dispatch the local state change
first**, then fire the network request, and **revert on failure**:

```ts
dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId });  // optimistic
try { await authFetch(...) }
catch { dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId }); /* revert */ }
```

**Q: Walk me through your optimistic update. What's the risk?**
> "I update the UI immediately so toggling a favorite feels instant, then sync the server in the
> background. On error I dispatch the inverse action to roll back. The subtle risk is **stale closures**:
> inside the async function I read `state.user!` which is the snapshot from *before* the dispatch, so I
> compute the HTTP verb from the pre-flip list. It works, but a cleaner approach would derive the
> intended action up front or use a functional reducer that returns the next list. I'd also debounce
> rapid toggles to avoid racing requests."

---

<a name="5-performance"></a>
## 5. Performance Patterns

### a) `use-context-selector` (UserContext)
The user object updates often (ratings, watchlist). A plain context would re-render **every** consumer
on any change.

**Q: What problem does `use-context-selector` solve?**
> "React's built-in Context re-renders **all** consumers whenever the provider value changes, regardless
> of which slice they actually use. `use-context-selector` lets a component subscribe to a *selector* of
> the context, so it only re-renders when that specific slice changes. I used it for `UserContext` because
> the user object mutates frequently."

### b) Split State / Actions contexts (UserContext, MovieModalContext)
Actions (functions) are **stable** and memoized; state changes constantly. Splitting them means
components that only need actions (e.g. a `MovieCard` that calls `openModal`) never re-render when
state changes.

**Q: Why two contexts — `UserStateContext` and `UserActionsContext`?**
> "Components like movie cards only need *action* functions (`toggleToFavorite`, `openModal`), not the
> state. If actions and state shared one context, a state change would re-render those cards needlessly.
> By memoizing the actions object and putting it in its own provider, action-only consumers stay inert
> during state updates. It's the same idea as separating dispatch from state."

### c) `useMemo` on context value (MoviesContext)
The provider's `value` is wrapped in `useMemo([state, fetchMoviesByIds])` so a new object isn't created
every render.

### d) IntersectionObserver hooks
- **`useInfiniteScroll`** — observes a sentinel div; when it enters the viewport (with a `600px`
  `rootMargin` to prefetch early), calls `fetchFn`. It **unobserves during the fetch** and re-observes
  after, plus guards with `isFetching`/`isLoading`/`hasMore` to prevent duplicate page loads.
- **`useFetchOnView`** — fires a fetch **exactly once** when an element scrolls into view (uses a
  `fetchedRef` boolean so re-renders don't re-trigger). Used for lazy-loading per-movie data like cast.

**Q: Why IntersectionObserver instead of a scroll event listener?**
> "Scroll listeners fire on every pixel and force you to read layout (`getBoundingClientRect`), which
> can cause jank and layout thrashing. `IntersectionObserver` is **async and off the main thread** — the
> browser tells me when the sentinel crosses a threshold. The `rootMargin` lets me prefetch the next
> page *before* the user hits the bottom, so scrolling feels seamless."

### e) Client-side caching
Casts, reviews, trailers, and movies-by-id are cached in Maps and **short-circuit** before fetching:
`if (state.casts.has(movieId) || state.castsLoading.get(movieId)) return;`

---

<a name="6-typescript"></a>
## 6. TypeScript Questions

Config highlights (`tsconfig.app.json`): `strict: true`, `noUnusedLocals/Parameters`,
`moduleResolution: "bundler"`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`,
`noFallthroughCasesInSwitch`, `jsx: "react-jsx"`, `noEmit` (Vite/esbuild transpiles; `tsc -b` only type-checks).

**Q: What does `strict: true` actually turn on?**
> "It's an umbrella for `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`,
> `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, and `alwaysStrict`. The big
> one is `strictNullChecks` — `null`/`undefined` aren't assignable to other types, which forces me to
> handle `state.user` possibly being `null` everywhere."

**Q: You use `import type {...}` a lot. Why?**
> "With `verbatimModuleSyntax`, type-only imports must be explicitly marked so the bundler can **erase**
> them entirely from the output (they have no runtime presence). It avoids accidental runtime imports of
> things that are only types and prevents circular-dependency issues."

**Q: How are your reducer actions typed?**
> "As **discriminated unions** — each action has a literal `type` field, and TypeScript narrows the
> payload based on it inside the `switch`. So in `case 'FETCH_GENRE_PAGE_SUCCESS'`, TS knows
> `action.payload` has `{ genreId, page, movies, hasMore }`. Combined with `noFallthroughCasesInSwitch`,
> the compiler catches missing breaks and unhandled cases."

**Q: Where do you use generics?**
> "The contexts are typed with `createContext<T | undefined>(undefined)`, and the custom hooks throw if
> used outside their provider, narrowing `T | undefined` to `T`. The fetch helpers return typed shapes
> like `MoviesResponse`. I could push generics further — e.g. a generic `useCache<K, V>` hook to replace
> the repeated Map-cache logic."

**Q: Honest TS weakness in your code?**
> "I use `any` in the `catch (err: any)` blocks and error parsers (`getErrorMessage`). It's pragmatic
> because caught values are `unknown` by default and could be anything, but the stricter, correct
> approach is `catch (err: unknown)` followed by type narrowing (`err instanceof Error`). I do narrow
> with `instanceof Response` in places, so the pattern is half-there."

---

<a name="7-auth"></a>
## 7. Authentication Flow (end to end)

### Email/password login
1. `useAuthSubmit` posts form-encoded creds to `POST /auth/token` (OAuth2 password grant).
2. Backend `authenticate_user` verifies the bcrypt hash, checks `is_verified`, returns a **JWT**
   (`sub = user.id`, 30-min expiry, HS256).
3. Frontend stores `access_token` in **`localStorage`**, then calls `fetchUserProfile()`.

### Google OAuth2 (authorization code flow)
1. `GET /auth/google/login` → redirects to Google consent.
2. Google redirects back to `GET /auth/google/callback?code=...`.
3. Backend exchanges the code for a Google access token, fetches userinfo, upserts the user, mints
   our own JWT, and redirects to `FRONTEND_URL/auth/callback#access_token=...`.
4. `GoogleCallbackHandler` reads the token from the **URL hash**, stores it, fetches the profile.

**Q: Why put the token in the URL *hash* (`#`) and not a query param?**
> "The fragment after `#` is **never sent to the server** in subsequent requests and doesn't land in
> server access logs the way query strings do. It's a slightly safer place to hand a token to a SPA. The
> handler immediately parses it out of `window.location.hash` and moves it to storage."

### `authFetch` — the centralized authenticated client (`api/authFetch.ts`)
```ts
const token = localStorage.getItem("access_token");
if (!token) { callLogout(); redirect("/auth?mode=login"); return new Promise(()=>{}); }
const res = await fetch(`${BACKEND_URL}${path}`, {...opts, headers:{...opts.headers, Authorization:`Bearer ${token}`}});
if (res.ok) return res;
if (res.status === 401 || res.status === 403 || await isTokenError(res)) {
  callLogout(); showError("Session expired"); redirect(...); return new Promise(()=>{});
}
return res; // other errors → caller handles
```

**Q: Why does `authFetch` return `new Promise(() => {})` on auth failure?**
> "It returns a **forever-pending promise** so the calling code's `await` never resolves after I've
> already triggered a logout + redirect. It stops the rest of the function from running with bad data
> mid-redirect. It's a clever hack, but it's unusual — a cleaner design would `throw` a typed
> `AuthError` and let callers `catch` it, or use an `AbortController`. The pending promise can in
> theory leak if the component unmounts."

**Q: Explain the `logoutRegistry` / `setGlobalNavigate` pattern.**
> "`authFetch` lives **outside** the React tree, so it can't call hooks like `useNavigate` or access the
> `UserContext` `logout`. To bridge that, I register the `logout` function and the router's `navigate`
> into module-level variables (`registerLogout`, `setGlobalNavigate`) from inside the providers. Then
> `authFetch` can invoke them via `callLogout()` / `globalNavigate(...)`. It breaks the
> non-component-can't-use-hooks barrier without prop-drilling or a circular import. The trade-off is
> hidden global state and an init-order dependency."

**Q: JWT in `localStorage` — what's wrong with that, and how would you fix it?**
> "It's the **#1 security critique** of this project, and I'd raise it before they do. `localStorage` is
> readable by any JavaScript on the page, so a single XSS vulnerability leaks the token. The industry-
> standard fix is to store the token in an **`httpOnly`, `Secure`, `SameSite` cookie** so JS can't read
> it, and pair it with CSRF protection. I'd also add a **short-lived access token + refresh token**
> rotation so a leaked access token expires fast. I chose localStorage for simplicity and because it
> sidesteps CORS+credentials cookie complexity in a split-origin dev setup, but I understand the
> trade-off."

**ProtectedRoute:** checks `isAuthenticated`; if not but a token exists, calls `fetchUserProfile()` to
rehydrate; otherwise redirects to `/auth?mode=login`. Shows a spinner while `isLoading`.

**Email verification & password reset:** signup sends a JWT-bearing link via Gmail SMTP (fired through
FastAPI **`BackgroundTasks`** so the request returns immediately). A daily **APScheduler** cron deletes
unverified users older than 24h.

---

<a name="8-backend"></a>
## 8. Backend (what a frontend dev should confidently explain)

**Layered architecture:** `api/endpoints/*` (routing) → `services/*` (business logic) →
`schemas/*` (Pydantic models) → `core/config.py` (settings). Auth is injected via a FastAPI
**dependency** `get_current_user` (`Depends(oauth2_scheme)`).

**Q: How does FastAPI's dependency injection work here?**
> "`get_current_user` is a dependency that extracts the bearer token (`OAuth2PasswordBearer`), verifies
> the JWT, loads the user from Mongo, and checks `is_verified`. Any endpoint that declares
> `current_user: User = Depends(get_current_user)` gets an authenticated user injected — and
> automatically returns 401/403 otherwise. It's reusable, testable, and self-documenting in Swagger."

**Q: Sync vs async in the backend — explain.**
> "TMDB calls are fully async: `aiohttp` for HTTP and `asyncio.gather` to fan out parallel requests —
> e.g. `fetch_multiple_movies_details` fetches many movies concurrently. **But** the MongoDB access uses
> **`pymongo`, which is synchronous**, inside `async def` handlers. That's a real flaw: a blocking DB
> call stalls the event loop. The correct fix is **Motor** (async MongoDB driver) or running sync calls
> in a threadpool. I'd call this out proactively."

**Q: How is validation handled?**
> "Pydantic v2 models. I have a `SharedValidators` mixin with `@field_validator(..., check_fields=False)`
> so the same username/password/phone rules apply across `UserCreate`, `UpdateUserProfile`, etc. without
> duplication. `model_config = ConfigDict(extra='forbid')` rejects unexpected fields. Validation errors
> are caught by a custom exception handler that reshapes them into a consistent
> `{ errors: [{ field, message }] }` envelope the frontend can map to form fields."

**Q: How do frontend and backend agree on error shape?**
> "Custom handlers (`validation_exception_handler`, `http_exception_handler`) normalize *everything* to
> `{ errors: [{field?, message}] }`. On the frontend, `transformBackendErrors` maps snake_case fields
> (`first_name`) to camelCase form fields (`firstName`) and shows them inline; errors without a `field`
> become a global toast. That contract is the glue between the two halves."

**Endpoints you should be able to name:** `/auth/*` (signup, token, google, verify-email, forgot/reset
password), `/users/me` (+ watchlist/favorite/rating sub-routes, recommendations),
`/movies/*` (popular, genre, search, by-ids, cast, reviews, trailer).

---

<a name="9-ai"></a>
## 9. The AI / Ollama Layer (`services/ollama_recommender.py`)

**Flow:**
1. Gather the user's favorites, watchlist, and ratings; resolve their TMDB **titles**.
2. **Bucket ratings** into high (8–10), medium (6–7), low (1–5).
3. Build an "enhanced prompt" that emphasizes favorites + highly-rated films, includes watchlist as
   "interest," and lists movies to **avoid** (disliked + already-known, to prevent duplicates).
4. Run a **`pydantic-ai` `Agent`** against **Mistral** served by Ollama over an OpenAI-compatible API
   (`temperature: 0.2` for consistency, `max_tokens: 768`).
5. Parse the model's JSON array (with a regex fallback for malformed output), dedupe, cap at 20 titles.
6. Back in the endpoint, **search TMDB** for each title to turn names into real movie objects with
   posters/ids, then return them.

**Q: Why a *local* LLM (Ollama/Mistral) instead of the OpenAI API?**
> "Cost and privacy. No per-token billing, no sending user preference data to a third party, and it works
> offline. Trade-offs: I host a 7B model (heavy, slower, needs the container), and quality is below
> GPT-4-class models. Because Ollama exposes an OpenAI-compatible endpoint, I could swap to OpenAI by
> changing one base URL."

**Q: How do you handle the LLM returning garbage / non-JSON?**
> "Defense in depth: a strict system prompt demanding *only* a JSON array, low temperature for
> determinism, a `parse_json_array` that first tries `JSON.loads` then **regex-extracts** the first
> `[...]` block, a dedupe pass, and a hard cap of 20. If everything fails it returns `[]`, and the
> endpoint **falls back** to favorites-based recs or an empty list — it never crashes the request."

**Q: What's slow about the recommendation endpoint?**
> "After the LLM returns titles, I search TMDB for each one **sequentially** in a loop. That's up to 20
> serial network round-trips. I'd parallelize with `asyncio.gather` (like I already do elsewhere) to cut
> latency dramatically. The LLM call itself is also the dominant cost — I'd cache recommendations per
> user and only regenerate when their preferences change."

---

<a name="10-docker"></a>
## 10. Docker & DevOps

**`docker-compose.yml`:** `ollama` (healthcheck on :11434, model volume), `backend` (waits for
`ollama: service_healthy`), `frontend` (waits for backend). Mongo is external (Atlas).

**Backend `Dockerfile` — multi-stage:**
```
base    → install deps
test    → copy app+tests, RUN pytest (endpoints, services, integration); build FAILS if tests fail
runtime → copy app from test stage (no tests), slim final image
```

**Q: Why a multi-stage build, and why run tests *inside* the build?**
> "Multi-stage keeps the final image **small and clean** — the test code and dev artifacts never ship to
> the runtime image. Running `pytest` in the `test` stage makes the **build itself a quality gate**: if
> any test fails, `docker build` fails and the broken image is never produced. It's a poor-man's CI baked
> into the image pipeline."

**Q: Walk through the Ollama container startup.**
> "A custom `entrypoint.sh` checks whether the Mistral model exists in the mounted volume. If not, it
> starts a temporary `ollama serve`, waits for the API (curl retry loop), pulls the model, kills the
> temp server, then `exec ollama serve` in the foreground. The model lives in a named volume
> (`ollama-models`) so it's only downloaded once and survives restarts. The compose `healthcheck` gates
> the backend from starting until Ollama responds."

**Frontend `Dockerfile`:** `npm ci` → `npm run build` (tsc type-check + Vite build) → serve the static
`dist/` with `serve`. Package files are copied first for **layer caching** so deps only reinstall when
`package.json` changes.

**Q: A security issue in the backend Dockerfile?**
> "Yes — `COPY .env ./` bakes secrets (JWT `SECRET_KEY`, DB string, Google secret) **into an image
> layer**. Anyone with the image can extract them. Secrets should be injected at **runtime** via env
> vars / Docker secrets / a vault, never copied into the image. Compose already does `env_file` at
> runtime for the actual services, so the build-time copy (needed because tests import settings) is the
> liability — I'd inject a dummy/test env for the test stage instead."

---

<a name="11-testing"></a>
## 11. Testing

**Backend** has three suites: `tests/endpoints`, `tests/services`, `tests/integration`. The integration
`conftest.py` is worth studying:
- **`mongomock`** replaces MongoDB with an in-memory fake (via `monkeypatch.setattr`).
- Email sending is **stubbed** to a no-op that records the last message.
- TMDB `make_request` is **monkeypatched** to return canned fixtures (no real network).
- A `TestClient` (Starlette) drives the app; a `make_token` helper mints JWTs for authed requests.

**Q: How do you test without hitting MongoDB / TMDB / Gmail?**
> "Dependency seams + monkeypatching. `mongomock` gives an in-memory Mongo; I patch the module-level
> `users_collection`. TMDB's single `make_request` choke-point is patched to return fixtures, so I test
> business logic deterministically and offline. Emails are stubbed. This is fast and hermetic — no
> flaky network."

**Q: Biggest testing gap?**
> "**No frontend tests at all.** I'd add Vitest + React Testing Library for the reducers (pure functions —
> easy, high-value), the custom hooks, and `authFetch`; plus Playwright for the critical auth + browse
> flows. The reducers especially are pure and trivial to unit test."

---

<a name="12-weaknesses"></a>
## 12. Known Weaknesses & Trade-offs (raise these BEFORE they do)

Interviewers respect self-awareness more than a flawless façade. Have 4–5 of these ready:

| # | Issue | Better approach |
|---|---|---|
| 1 | **JWT in `localStorage`** → XSS-exfiltratable | `httpOnly`+`Secure`+`SameSite` cookie + CSRF token |
| 2 | **No refresh tokens** — 30-min expiry forces re-login | short access token + rotating refresh token |
| 3 | **`pymongo` (sync) inside async handlers** blocks the event loop | **Motor** async driver, or threadpool offload |
| 4 | **`.env` copied into Docker image** = secrets in a layer | runtime injection / Docker secrets / vault |
| 5 | **Search filters ignored** — `/movies/search` accepts `genre/min_rating/year` but `search_movies` never uses them | pass through to TMDB `discover` or filter results |
| 6 | **Sequential TMDB lookups** in recommendations (up to 20 serial calls) | `asyncio.gather` to parallelize; cache recs |
| 7 | **No server-side caching** of TMDB → repeated identical calls | Redis / in-memory TTL cache |
| 8 | **Hand-rolled server-state** (caching/dedup/pagination) | React Query / RTK Query |
| 9 | **No frontend tests** | Vitest + RTL + Playwright |
| 10 | **`@app.on_event` deprecated** | FastAPI `lifespan` context manager |
| 11 | **`any` in catch blocks** | `unknown` + narrowing |
| 12 | **No rate limiting / no HTTPS termination shown** | reverse proxy (nginx/traefik) + slowapi |
| 13 | **`registerLogout(logout)` runs every render** in UserContext | call inside `useEffect` once |
| 14 | **`authFetch` returns never-resolving promise** | throw typed `AuthError`; handle in callers |
| 15 | **CORS hardcoded to localhost**; same with origins | env-driven allowed origins |

**Q: If you rebuilt this today, what would you change first?**
> "Three things: (1) move auth tokens to httpOnly cookies with refresh rotation; (2) swap `pymongo` for
> Motor so the async story is real end-to-end; (3) adopt React Query on the frontend to replace my manual
> caching contexts. Those three address the most serious security, performance, and maintainability gaps
> respectively."

---

<a name="13-rapidfire"></a>
## 13. Rapid-Fire Q&A Bank

**React / JS**

- **Controlled vs uncontrolled inputs?** "Auth form uses `FormData` off the form element (uncontrolled),
  reading values on submit — less re-rendering. Profile form is more controlled via `useProfileForm`."
- **Why `key` in lists?** "React uses `key` to match elements across renders for efficient reconciliation;
  I use stable movie ids, never array index, and dedupe to keep them unique."
- **What is `StrictMode` doing?** "In dev it double-invokes effects/renders to surface impure logic and
  cleanup bugs. My IntersectionObserver hooks clean up on unmount, so they're StrictMode-safe."
- **`useCallback` vs `useMemo`?** "`useCallback` memoizes a function identity, `useMemo` a computed value.
  I `useCallback` the context action functions so split-context consumers stay stable, and `useMemo` the
  Movies context `value` object."
- **Closures / stale state?** "Covered in the optimistic-update answer — async functions capture the state
  snapshot at call time; deps arrays and functional updates mitigate it."
- **Event loop / microtasks?** "Relevant to `asyncio.gather` on the backend and Promise ordering in
  `authFetch`."

**CSS / UI**

- **Why Tailwind?** "Utility-first → no context-switching to CSS files, no naming bikeshedding, dead-code
  elimination via PomCSS purge, consistent design tokens. Trade-off: verbose className strings, mitigated
  by extracting components and `cn()`/`tailwind-merge`."
- **How do you do animations?** "Framer Motion for the auth mode-toggle slide (`direction` in AuthContext
  drives the transition), modal transitions, and list reveals."
- **Responsive/mobile?** "Tailwind breakpoints, mobile-first; separate `AuthMobileHeader` vs sidebar."
- **Accessibility?** "Radix primitives under shadcn give focus management, ARIA roles, and keyboard nav on
  Dialog/Select/Avatar for free."

**Routing**

- **How does protected routing work?** "`ProtectedRoute` wraps the `/dashboard` layout route; nested
  routes (search, watchlist, favorites, ratings, profile) render in its `<Outlet>`. Unknown paths
  `Navigate` to `/`."

**General**

- **How do you handle loading & errors?** "Every async slice tracks `loading`/`error` in its reducer;
  UI shows skeletons (shadcn `Skeleton`) and a global toast system (`MessageContext`) for errors."
- **How is config managed?** "Backend: Pydantic `BaseSettings` reads `.env`. Frontend: Vite env vars
  (`import.meta.env.VITE_BACKEND_URL`) exposed only when prefixed `VITE_`."

---

<a name="14-ask-back"></a>
## 14. Smart Questions to Ask the Interviewer

- "How is state management handled in your codebase — Redux, Zustand, React Query, or Context?"
- "What's your approach to auth token storage and refresh on the frontend?"
- "Do you colocate tests with components, and what's your coverage philosophy?"
- "How do you handle server-state caching and request deduplication?"
- "What does your component library / design system story look like — bespoke, shadcn, or a vendor lib?"
- "How are frontend and backend error contracts defined and kept in sync?"

---

## Final tips

- **Lead with trade-offs.** For every choice (Context vs Redux, local LLM vs OpenAI, localStorage vs
  cookies), state *why* and *what you'd do differently at scale*. That signals senior thinking.
- **Know your three flagship FE features cold:** the optimistic-update + revert flow, the
  `Map`-based caching + dedup reducer pattern, and the `authFetch` + `logoutRegistry` global-bridge.
- **Don't oversell "microservices."** Call it a multi-container / service-oriented architecture.
- **Be ready to whiteboard** the auth flow (login → JWT → localStorage → authFetch → 401 → logout) and
  the infinite-scroll IntersectionObserver lifecycle.

Good luck — you built something genuinely full-stack and non-trivial. Own the trade-offs and you'll do great. 🎬
