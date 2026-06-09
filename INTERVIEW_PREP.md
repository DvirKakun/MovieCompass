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
15. [Why This Stack? — Technology Justifications](#15-why-stack)
16. [Design Patterns Deep Dive](#16-patterns)
17. [Architecture & System-Design Questions](#17-system-design)
18. [Core Syntax & Language Features (explained)](#18-syntax)
19. [Code Walkthrough — Line by Line](#19-walkthrough)
20. [React Hooks — Complete Reference](#20-hooks)
21. [Custom Hooks — Complete Reference](#21-custom-hooks)
22. [Context Management — Deep Dive](#22-context)
23. [More React Patterns in This Project](#23-react-patterns)
24. [Backend Syntax & Patterns — Deep Dive](#24-backend-deep)
25. [Why JWT? — Authentication Deep Dive](#25-jwt)

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

<a name="15-why-stack"></a>
## 15. Why This Stack? — Technology Justifications

This is one of the **most common interview themes**: "Why did you choose X and not Y?" Have a crisp,
trade-off-aware answer for every major technology. Never answer "because it's popular" — always give a
*reason tied to this project* plus the *alternative you rejected and why*.

### 🟢 Why MongoDB (and not PostgreSQL / MySQL / a relational DB)?

> "I chose MongoDB because the **data model fits a document store naturally**. A user in MovieCompass is
> essentially one self-contained document: profile fields plus **embedded arrays** — `favorite_movies`,
> `watchlist`, and `ratings` (an array of `{movie_id, rating}` sub-documents). All of that lives in a
> single document, so the common operation — *load everything about the current user* — is **one query,
> no JOINs**."

Back it up with specifics from your code:
- **Schema flexibility:** users have different shapes — a Google OAuth user has `google_id` and no
  `hashed_password`; a local user is the reverse; `auth_provider` can be `local`, `google`, or `both`.
  A document model absorbs that without `ALTER TABLE` migrations or nullable-column sprawl.
- **Atomic array operators:** you use Mongo's `$addToSet`, `$pull`, and the positional `$` operator
  (`ratings.$.rating`) to add/remove favorites and update a specific rating **atomically in the
  database** — no read-modify-write race. That's a genuinely good fit for the feature set.
- **The movie data itself isn't in Mongo** — it's fetched live from TMDB. Mongo only stores *user* data
  (IDs + preferences), which is a small, denormalized, read-heavy workload. Perfect for a document DB.

**Q: When would MongoDB be the *wrong* choice here?**
> "If the app grew relational features — e.g. 'users who rated this movie also liked…', social graphs,
> friend networks, or complex analytical queries across users — a relational DB (or a graph DB) would
> shine because those are JOIN-heavy and benefit from a fixed schema and referential integrity. Mongo
> also doesn't give me multi-document ACID transactions by default, and there's **no enforced schema at
> the DB level** — my Pydantic models are the only thing guaranteeing shape. For money or
> inventory-style data I'd pick Postgres."

**Q: MongoDB vs PostgreSQL's JSONB — couldn't Postgres do both?**
> "Fair point — Postgres with `JSONB` columns gives you document-style flexibility *and* relational
> power, and many teams default to it for that reason. I went with Mongo because the access pattern is
> almost purely document-shaped and I wanted the ergonomic array update operators. If I expected to mix
> relational and document workloads, Postgres + JSONB would be the safer, more future-proof bet."

**Q: How do you model the rating update — and why is it interesting?**
> "Adding a rating checks if one exists for that `movie_id`: if yes, it uses a filtered update with the
> **positional `$` operator** to set just that element (`{'ratings.$.rating': value}`); if no, it
> `$addToSet`s a new sub-document. Both are single atomic DB operations — I never load the array into
> the app, mutate it, and write it back, which would be racy under concurrent requests."

**Q: Why Atlas (cloud) and not a Mongo container in compose?**
> "I deliberately kept Mongo external — managed Atlas gives me backups, replication, monitoring, and TLS
> without ops work, and it means the database survives `docker-compose down`. The trade-off is a hard
> dependency on an external service and network latency; for purely local dev you could point the same
> connection string at a local Mongo container."

---

### 🟢 Why FastAPI (and not Flask / Django / Express / Node)?

> "FastAPI gave me three things that directly shaped this project: **native async**, **Pydantic-based
> validation and serialization**, and **automatic OpenAPI docs**. Since the backend is heavily I/O-bound
> — it's mostly orchestrating calls to TMDB, MongoDB, the LLM, and SMTP — `async`/`await` lets me run
> those concurrently (`asyncio.gather`) instead of blocking per request."

Specifics to cite:
- **Pydantic v2 is built in.** My request/response models, validation rules (`SharedValidators` mixin),
  and serialization all come from the same type definitions. Define the model once and I get request
  parsing, validation, error messages, and JSON responses — no separate serializer layer like Django
  REST Framework needs.
- **Dependency Injection.** `Depends(get_current_user)` cleanly injects the authenticated user into any
  endpoint and auto-returns 401/403. Reusable, testable, and self-documenting.
- **Automatic interactive docs.** `/docs` (Swagger) and `/redoc` are generated from the type hints —
  zero extra work, and great for a frontend dev consuming the API.
- **Type hints = editor + runtime safety.** The same annotations drive autocomplete, validation, and docs.

**Q: FastAPI vs Flask?**
> "Flask is synchronous-first and minimal — you bolt on validation (marshmallow), serialization, and
> docs yourself. FastAPI bakes in async, validation, and OpenAPI. For an I/O-bound, API-first service
> like this, FastAPI removes a lot of boilerplate. Flask would've meant more glue code for the same
> result."

**Q: FastAPI vs Django / Django REST Framework?**
> "Django is 'batteries-included' — ORM, admin, auth, migrations. That's powerful for a content-heavy,
> DB-centric app with a relational schema. But it's heavier than I needed, opinionated toward its ORM
> (which is relational, not Mongo), and async support is newer/partial. My app is a thin, async API
> layer over external services with a document DB — FastAPI is the leaner fit. If I needed a built-in
> admin panel and relational models, Django would win."

**Q: FastAPI vs Node/Express (staying all-JavaScript)?**
> "A valid alternative — one language across the stack reduces context-switching, and Node is excellent
> for I/O concurrency. I chose Python because the **AI/LLM ecosystem is Python-first** (`pydantic-ai`,
> the Ollama/OpenAI clients, data tooling), and Pydantic + FastAPI gave me stronger built-in validation
> and auto-docs than a typical Express setup, where I'd add `zod`/`joi` + `swagger-jsdoc` manually. The
> trade-off is two languages to maintain."

**Q: FastAPI runs on Uvicorn — what is that?**
> "Uvicorn is an **ASGI** server (Asynchronous Server Gateway Interface). Unlike WSGI (Flask/Django's
> traditional sync interface), ASGI supports async request handling and long-lived connections. FastAPI
> is an ASGI framework, and Uvicorn is the server process that actually runs it — that's the
> `CMD ["uvicorn", "app.main:application", ...]` in my Dockerfile."

---

### 🟢 Why React (and not Vue / Angular / Svelte)?

> "React for the **ecosystem and component model**. The huge library ecosystem (Radix/shadcn, Framer
> Motion, React Router), the largest hiring pool, and a mental model — components + hooks +
> unidirectional data flow — I'm most productive in. Vue and Svelte are excellent and arguably simpler
> for small apps; Angular is heavier and more opinionated (good for large enterprise teams). For a
> SPA this size with rich third-party UI needs, React hit the sweet spot."

**Q: React 19 specifically — anything notable?**
> "I'm on React 19. I'm not leaning on the newest features like the `use` hook or Actions heavily, but
> being current means access to the latest concurrent rendering and the improved ref/Context handling.
> My patterns (Context + reducers, `use-context-selector`) are version-agnostic."

### 🟢 Why Vite (and not Create React App / Webpack)?

> "Vite for **dev speed**. It serves source over native ES modules with esbuild for instant cold starts
> and near-instant HMR, versus CRA/Webpack which bundle everything up front and get slow as the app
> grows. For production it bundles with Rollup (tree-shaking, code-splitting). CRA is also effectively
> deprecated now. My `vite.config.ts` is minimal — the React plugin plus an `@` path alias."

### 🟢 Why Tailwind (and not CSS Modules / styled-components / plain CSS)?

> "Utility-first Tailwind keeps styles **colocated** with markup, eliminates naming overhead, and purges
> unused CSS at build time for a tiny bundle. Versus styled-components, there's **no runtime CSS-in-JS
> cost**. It pairs perfectly with shadcn/ui, which ships Tailwind-styled components I own. The downside —
> long className strings — I manage with component extraction and `tailwind-merge`/`cn()`."

### 🟢 Why a local LLM via Ollama (and not the OpenAI API)?

> "Covered in §9: **cost** (no per-token billing), **privacy** (user preference data never leaves my
> infra), and **offline capability**. Trade-off is hosting a heavy 7B model and lower quality than
> GPT-4-class. Because Ollama exposes an OpenAI-compatible endpoint, swapping to OpenAI is a one-line
> base-URL change."

### One-liner cheat sheet

| Choice | One-sentence justification | Main alternative rejected |
|---|---|---|
| **MongoDB** | User = one document with embedded arrays; atomic array ops; flexible auth schema | Postgres (relational/JSONB) |
| **FastAPI** | Async + Pydantic validation + auto OpenAPI for an I/O-bound API | Flask / Django / Express |
| **React** | Ecosystem, hiring pool, component+hooks model | Vue / Angular / Svelte |
| **Vite** | Instant dev server + HMR; CRA is dead | Webpack / CRA |
| **Tailwind** | Colocated, zero-runtime, purged CSS; pairs with shadcn | styled-components / CSS Modules |
| **Ollama/Mistral** | Free, private, offline; OpenAI-compatible API | OpenAI API |
| **Context+useReducer** | Right-sized state without Redux boilerplate | Redux / Zustand / React Query |
| **JWT** | Stateless, scales horizontally, no server session store | Server-side sessions |

---

<a name="16-patterns"></a>
## 16. Design Patterns Deep Dive

Interviewers often ask "what design patterns did you use?" Name them explicitly — it signals you think
in patterns, not just code.

| Pattern | Where in your code | What to say |
|---|---|---|
| **Reducer / Flux pattern** | All 5 contexts (`useReducer` + typed actions) | "Predictable state via pure reducers, dispatched actions, single source of truth — Redux's model without the library." |
| **Provider pattern** | Every Context provider in `App.tsx` | "Inject cross-cutting state into the tree without prop-drilling." |
| **Container/Presentational split** | `pages/` (smart) vs `components/ui/` (dumb) | "Pages orchestrate data + actions; UI components are pure and reusable." |
| **Custom hooks (composition)** | `useInfiniteScroll`, `useFetchOnView`, `useAuthSubmit` | "Encapsulate and reuse stateful logic; hooks compose instead of inherit." |
| **Facade** | `authFetch` | "One function hides token injection, error handling, and redirect-on-401 behind a `fetch`-like API." |
| **Registry / Service Locator** | `logoutRegistry`, `setGlobalNavigate` | "Module-level registry lets non-React code reach React-owned functions." |
| **Adapter** | `transformBackendErrors`, the `raw → UserProfile` mapping | "Adapts the backend's snake_case contract to the frontend's camelCase model." |
| **Optimistic update** | `toggleMovieOnServer`, `setMovieRating` | "Update UI first, reconcile with server, roll back on failure." |
| **Repository / layered service** | backend `services/*` over `pymongo` | "Endpoints never touch the DB directly; services encapsulate persistence." |
| **Dependency Injection** | FastAPI `Depends(get_current_user)` | "Framework injects auth; endpoints declare what they need." |
| **Strategy (lite)** | `auth_provider` (`local`/`google`/`both`) branching | "Different auth strategies behind one user model." |
| **Mixin** | `SharedValidators` Pydantic base | "Share field validators across multiple schemas via inheritance." |
| **Singleton (module)** | `settings`, the Mongo `client` at import time | "One shared instance per process — though it hurts testability (see weaknesses)." |
| **Observer** | `IntersectionObserver` in scroll hooks; reducer subscriptions | "Browser notifies on intersection; components subscribe to context slices." |

**Q: What's the most important pattern in your frontend, and why?**
> "The **reducer + domain-split context** pattern. It gives me Redux-style predictability — every state
> change is a pure function of (state, action) — while keeping unrelated state in separate providers so
> updates stay localized. Layered on top is the **Map-based cache** inside those reducers, which is my
> hand-rolled equivalent of a query cache."

**Q: Did you use any anti-patterns, knowingly?**
> "A couple I'd flag honestly: the module-level **registry/global-navigate** pattern is effectively
> hidden global mutable state with an init-order dependency — convenient but not pure. And
> `registerLogout(logout)` runs on every render instead of inside an effect. Both work, but I know why
> they're smells and how I'd refactor them."

---

<a name="17-system-design"></a>
## 17. Architecture & System-Design Questions

These are higher-altitude questions about how the system fits together and how it would scale. Even for
a frontend role, showing this thinking sets you apart.

**Q: Walk me through what happens, end to end, when a user opens the dashboard.**
> "The browser loads the SPA. `ProtectedRoute` checks `isAuthenticated`; if there's a token but no user
> in state, it calls `fetchUserProfile()` → `authFetch('/users/me')` with the Bearer token. FastAPI's
> `get_current_user` dependency verifies the JWT, loads the user from Mongo, checks `is_verified`, and
> returns it. Meanwhile `MoviesContext` fetches popular movies from `/movies/popular`, which the backend
> proxies from TMDB. Cards render from state; scrolling triggers the IntersectionObserver sentinel to
> fetch the next page, which is deduped and merged into the cache."

**Q: Why does the backend proxy TMDB instead of the frontend calling TMDB directly?**
> "Three reasons. **(1) Secret protection** — the TMDB API key stays server-side; it'd be exposed in
> the browser if the frontend called TMDB directly. **(2) A stable internal contract** — I reshape
> TMDB's responses into my own `Movie`/`MovieResponse` schemas, so the frontend depends on *my* API, not
> TMDB's, and I can swap data sources later. **(3) Server-side orchestration** — things like
> recommendations need to combine TMDB + LLM + user data, which has to happen on the backend anyway."

**Q: How would you scale this to 100k users?**
> "Several layers. **Caching:** add Redis to cache TMDB responses (genres, popular, movie details rarely
> change) so I'm not re-hitting TMDB and getting rate-limited. **DB:** Mongo Atlas scales horizontally
> via sharding; my queries are already keyed by indexed `id`/`email`. **Async correctness:** swap
> `pymongo` for **Motor** so DB calls don't block the event loop. **Backend:** it's stateless (JWT
> auth, no server sessions), so I can run N replicas behind a load balancer. **Frontend:** serve the
> static build from a CDN. **AI:** the LLM is the bottleneck — I'd cache recommendations per user and
> regenerate only when preferences change, and run Ollama on dedicated GPU nodes or move to a hosted
> inference API."

**Q: Your backend is stateless — why does that matter?**
> "Auth state lives entirely in the JWT the client holds, not in server memory. So any backend instance
> can serve any request — no sticky sessions, no shared session store. That's what makes horizontal
> scaling trivial: just add more containers behind a load balancer."

**Q: How do the frontend and backend stay in sync on the API contract?**
> "Today it's manual — I keep TypeScript types in `types/` mirroring the Pydantic schemas, and a custom
> error envelope (`{errors:[{field,message}]}`) both sides agree on. The improvement would be to
> **generate** the TS client/types from FastAPI's OpenAPI schema (e.g. `openapi-typescript`), so the
> contract is single-sourced and drift is impossible."

**Q: What happens if TMDB or Ollama is down?**
> "TMDB: `make_request` maps upstream errors to proper HTTP codes and raises `HTTPException`, so the
> frontend gets a clean error and shows a toast rather than crashing. Ollama: the recommendation flow is
> wrapped in try/except with a **fallback** to favorites-based recs or an empty list — a degraded but
> non-broken experience. What's missing is **retries with backoff** and a **circuit breaker** so I don't
> hammer a failing dependency; I'd add those (and a timeout on every external call) for production."

**Q: How do you handle secrets and configuration across environments?**
> "Backend config is centralized in a Pydantic `BaseSettings` class that reads from `.env` / environment
> variables — one typed object (`settings`) used everywhere. Frontend uses Vite env vars (`VITE_`-
> prefixed, exposed via `import.meta.env`). The known issue is that the Docker *build* copies `.env` into
> the image for the test stage — secrets shouldn't live in image layers; I'd inject them only at runtime."

**Q: Where are the trust boundaries / what's your security model?**
> "Public, unauthenticated endpoints: all `/movies/*` and the `/auth/*` flows. Everything under
> `/users/me` requires a valid JWT via the `get_current_user` dependency. Passwords are bcrypt-hashed
> (never stored plaintext). Email verification gates login. Validation happens at the schema boundary
> with Pydantic (`extra='forbid'` rejects unexpected fields). The weak spots I'd harden: token storage
> (localStorage→httpOnly cookie), add rate limiting, refresh tokens, and HTTPS termination via a
> reverse proxy."

**Q: If two requests modify the same user's watchlist concurrently, what happens?**
> "Because I use Mongo's atomic `$addToSet`/`$pull` operators, the database serializes those updates
> correctly — no lost writes from a read-modify-write race. On the frontend, rapid optimistic toggles
> could still race at the network layer; I'd debounce them and/or key requests so the last intent wins."

**Q: How is pagination implemented across the system?**
> "Page-based. The frontend tracks `currentPage`/`hasMore` per collection in the reducer, requests
> `?page=N`, and the backend forwards it to TMDB. `hasMore` is inferred from whether a page returned any
> results. The cache merges + dedupes pages. A more robust approach for large/changing datasets would be
> **cursor-based** pagination, but page-based is fine for TMDB's model."

---

<a name="18-syntax"></a>
## 18. Core Syntax & Language Features (explained)

This section explains the **language features and syntax** your code leans on, so when an interviewer
points at a line and asks "what does this do?", you have a crisp answer. Grouped by language.

### TypeScript / JavaScript

**Optional chaining `?.`**
```ts
errData.errors?.[0]?.message
```
> "Safely reads a deeply nested value. If `errors` is `undefined`/`null`, the whole expression
> short-circuits to `undefined` instead of throwing `Cannot read property '0' of undefined`. The
> `?.[0]` form is optional chaining on an array index."

**Nullish coalescing `??`**
```ts
state.castsLoading.get(movieId) ?? false
```
> "Returns the right side only when the left is `null` or `undefined`. Unlike `||`, it does **not**
> treat `0`, `''`, or `false` as 'empty' — important here because a legit `false` should be kept, not
> replaced."

**Spread `...` for immutable updates**
```ts
return { ...state, popularLoading: true };
[...prevMovies, ...movies.filter(...)]
new Map(state.casts).set(id, value)
```
> "Reducers must return **new** references so React detects the change. Object spread copies the old
> state and overrides specific keys; array spread builds a new array; `new Map(old)` shallow-clones a
> Map. I never mutate state in place."

**Destructuring**
```ts
const { movies, page, hasMore } = action.payload;
const { access_token, user } = result;
```
> "Pulls fields out of an object/array into local variables in one line — used heavily in reducers and
> API response handling."

**Discriminated unions (typed reducer actions)**
```ts
type MoviesAction =
  | { type: "FETCH_POPULAR_PAGE_SUCCESS"; payload: { movies: Movie[]; page: number; hasMore: boolean } }
  | { type: "FETCH_CAST_ERROR"; payload: { movieId: number; error: string } };
```
> "Each variant shares a literal `type` field (the *discriminant*). Inside `switch (action.type)`,
> TypeScript **narrows** the payload to the matching shape, so the compiler knows the exact fields
> available in each `case`. This is the backbone of type-safe reducers."

**Generics**
```ts
const MoviesContext = createContext<MoviesContextType | undefined>(undefined);
const ids = new Set<number>(...);
```
> "`<T>` parameterizes a type. `createContext<T|undefined>` makes the context value strongly typed;
> `Set<number>` guarantees only numbers go in. My `useMovies()` hook then narrows `T|undefined` to `T`
> by throwing if the context is missing."

**`async`/`await` + `try/catch/finally`**
```ts
try { const res = await authFetch(...); ... }
catch (err) { showError(...) }
finally { dispatch({ type:"SET_LOADING", payload:false }) }
```
> "`await` pauses the async function until the Promise settles, letting me write asynchronous code
> linearly. `finally` always runs — perfect for turning off loading spinners whether the call
> succeeded or failed."

**`type` vs `interface` and `import type`**
```ts
import type { Movie, MoviesAction } from "../types/movies";
```
> "`import type` imports only the type, which the bundler **erases** at build time (required by
> `verbatimModuleSyntax`). I use `interface` for object shapes I might extend and `type` for unions
> like the action types."

**Non-null assertion `!`**
```ts
state.user!.watchlist
document.getElementById("root")!
```
> "Tells the compiler 'I know this isn't null here.' I use it sparingly when I've already guarded
> (`if (!state.user) return`) but TS can't prove it across an async boundary. It's a known smell — it
> bypasses the null check, so I only use it where I've verified the invariant."

**Array methods**
```ts
movies.filter(m => !ids.has(m.id))     // dedupe
ratings.find(r => r.movie_id === id)   // lookup
action.payload.forEach(g => map.set(g.id, g.name))  // build map
```
> "Functional, non-mutating array operations — `filter` for dedup during pagination, `find` for rating
> lookups, `forEach` to populate the genre Map. They read declaratively and avoid manual index loops."

### React

**`useReducer`**
```ts
const [state, dispatch] = useReducer(moviesReducer, initialState);
```
> "Manages complex state via a pure `(state, action) => newState` function. I dispatch typed actions;
> the reducer is the single place state transitions happen — predictable and testable."

**`useCallback` / `useMemo`**
```ts
const fetchMoviesByIds = useCallback(async (ids) => {...}, [state.fetchedMoviesById]);
const contextValue = useMemo(() => ({ state, fetchGenres, ... }), [state, fetchMoviesByIds]);
```
> "`useCallback` memoizes a function's identity across renders (so consumers relying on stable refs
> don't re-render); `useMemo` memoizes a computed value (the context object). Both take a dependency
> array — they recompute only when a dep changes."

**`useEffect` + cleanup**
```ts
useEffect(() => {
  observer.observe(el);
  return () => observer.disconnect();   // cleanup on unmount / dep change
}, [hasMore, isLoading, isFetching]);
```
> "Runs side effects after render. The returned function is the **cleanup**, run before the next effect
> and on unmount — here it disconnects the IntersectionObserver to avoid leaks."

**`useRef`**
```ts
const sentinelRef = useRef<HTMLDivElement|null>(null);
const fetchedRef = useRef(false);
```
> "A mutable container that persists across renders **without** triggering a re-render. I use it for DOM
> node references (the scroll sentinel) and for a 'have I already fetched?' flag that shouldn't cause
> renders."

**Context provider/consumer**
```ts
<MoviesContext.Provider value={contextValue}>{children}</MoviesContext.Provider>
export function useMovies(){ const c = useContext(MoviesContext); if(!c) throw...; return c; }
```
> "Provider injects a value into the subtree; the custom hook reads it and throws a helpful error if
> used outside the provider — which also narrows the type from `T|undefined` to `T`."

### Python (backend)

**Decorators**
```python
@router.post("/token", response_model=UserTokenResponse)
@field_validator("password", "new_password", mode="before", check_fields=False)
```
> "A decorator wraps a function to add behavior. `@router.post(...)` registers the route + declares the
> response schema (which drives validation and OpenAPI docs). `@field_validator` registers a Pydantic
> validator for named fields."

**Type hints + `Optional` / `List`**
```python
def find_user_by_id(user_id: str) -> Optional[User]:
favorite_movies: List[int] = []
```
> "Python type hints. `Optional[User]` is `User | None`; `List[int]` is a list of ints. FastAPI and
> Pydantic *use these at runtime* for validation and serialization — they're not just documentation."

**`async def` + `await` + `asyncio.gather`**
```python
tasks = [fetch_movie_details(mid) for mid in movie_ids]
movies = await asyncio.gather(*tasks, return_exceptions=True)
```
> "Defines a coroutine. `asyncio.gather(*tasks)` runs many coroutines **concurrently** and waits for
> all — turning N sequential network calls into N parallel ones. `return_exceptions=True` means one
> failure doesn't cancel the rest; I filter out the failures afterward."

**Pydantic `BaseModel` + `ConfigDict`**
```python
class UserCreate(SharedValidators):
    email: EmailStr
    model_config = ConfigDict(extra="forbid")
```
> "Declarative schema. `EmailStr` validates email format. `extra='forbid'` rejects any field not in the
> model (security — no mass-assignment). `Field(default_factory=lambda: str(uuid4()))` generates an ID
> if none is supplied."

**Dict unpacking `**`**
```python
Movie(**movie_data)
{**db_updates_username, **db_updates_password, **db_updates_profile}
```
> "`**` unpacks a dict into keyword arguments — `Movie(**data)` constructs the model from a dict. The
> second form merges several dicts into one (later keys win)."

**FastAPI `Depends` + `Query`**
```python
current_user: User = Depends(get_current_user)
page: int = Query(1, ge=1)
```
> "`Depends` is dependency injection — FastAPI resolves `get_current_user` and injects the result.
> `Query(1, ge=1)` declares a query param with a default of 1 and a 'greater-or-equal 1' constraint,
> auto-returning 422 on violation."

**MongoDB operators**
```python
users_collection.find_one_and_update({"id": uid}, {"$addToSet": {"favorite_movies": mid}}, return_document=AFTER)
{"$pull": {"ratings": {"movie_id": mid}}}
{"$set": {"ratings.$.rating": value}}   # positional operator
```
> "`$addToSet` adds to an array only if absent (no duplicates); `$pull` removes matching elements;
> `$set` with the positional `$` updates the array element matched by the query. `find_one_and_update`
> with `ReturnDocument.AFTER` returns the **updated** document in one atomic round-trip."

---

<a name="19-walkthrough"></a>
## 19. Code Walkthrough — Line by Line

Be ready to *narrate* your most important files. For each, here's the "what + why" an interviewer wants.

### A. `authFetch` — the authenticated fetch wrapper (`api/authFetch.ts`)
```ts
export async function authFetch(path, opts = {}, showError?) {
  const token = localStorage.getItem("access_token");        // 1
  if (!token) { callLogout(); showError?.(...); redirect(); return new Promise(()=>{}); } // 2
  const res = await fetch(`${BACKEND_URL}${path}`, {          // 3
    ...opts,
    headers: { ...opts.headers, Authorization: `Bearer ${token}` },
  });
  if (res.ok) return res;                                     // 4
  if (res.status === 401 || res.status === 403 || (await isTokenError(res))) { // 5
    callLogout(); showError?.("Session expired..."); redirect(); return new Promise(()=>{});
  }
  return res;                                                 // 6
}
```
1. Read the JWT from localStorage.
2. **No token** → log out, optionally toast, redirect to login, and return a **never-resolving promise**
   so the caller's `await` halts (see §7 — I'd refactor this to throw).
3. Do the real request, **spreading caller options** and **injecting the `Authorization: Bearer` header**.
4. Happy path — return the response.
5. **Auth failure** (401/403 or a backend `{field:"token"}` error) → same logout/redirect flow.
6. **Other errors** (404/500) → return the response and let the caller handle it (e.g. show a field error).

> "This is the single choke-point for authenticated requests: token injection + centralized
> session-expiry handling, so no component repeats that logic."

### B. The reducer Map-cache + dedupe (`MoviesContext.tsx`)
```ts
case "FETCH_POPULAR_PAGE_SUCCESS": {
  const { movies, page, hasMore } = action.payload;
  const ids = new Set(state.popularMovies.map(m => m.id));      // existing ids
  const merged = [...state.popularMovies, ...movies.filter(m => !ids.has(m.id))]; // append new only
  return { ...state, popularMovies: merged, popularCurrentPage: page, popularHasMore: hasMore, popularLoading: false };
}
```
> "On each page load I build a `Set` of ids I already have (O(1) lookups), filter the incoming page to
> only new movies, and append. This prevents duplicate cards from overlapping TMDB pages — which would
> also break React's `key` uniqueness. The per-genre and per-movie caches use `new Map(old).set(k, v)`
> for the same immutable-update reason."

### C. Optimistic update with rollback (`UserContext.tsx`)
```ts
async function toggleMovieOnServer(movieId, list) {
  dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId });   // 1 optimistic flip
  const listAfter = list === "watchlist" ? state.user!.watchlist : state.user!.favoriteMovies;
  const verb = listAfter.includes(movieId) ? "DELETE" : "PUT";  // 2 choose verb
  try {
    await authFetch(`/users/me/${list==="watchlist"?"watchlist":"favorite"}/${movieId}`, { method: verb }, showError);
  } catch {
    dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId });  // 3 revert on failure
    showError("Failed to update");
  }
}
```
1. **Flip the UI first** so the toggle feels instant.
2. Decide PUT vs DELETE. *(Honest caveat: `state.user` here is the snapshot from before the dispatch —
   a stale-closure subtlety I'd clean up; see §4.)*
3. If the request fails, **dispatch the same toggle again to undo it** and surface an error.

> "Optimistic UI for perceived speed, with a guaranteed rollback path so the UI never lies about server
> state for long."

### D. `useInfiniteScroll` (`hooks/useInfiniteScroll.tsx`)
```ts
observerRef.current = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    observerRef.current?.unobserve(el);              // stop watching during fetch
    loadNextPage().finally(() => observerRef.current?.observe(el)); // re-watch after
  }
}, { rootMargin });                                   // rootMargin "600px" → prefetch early
observerRef.current.observe(el);
return () => observerRef.current?.disconnect();       // cleanup
```
> "A sentinel `<div>` sits at the bottom of the list. When it enters the viewport (with a 600px margin,
> so I fetch *before* the user reaches the end), I unobserve it, load the next page, then re-observe.
> `loadNextPage` also guards on `isFetching/isLoading/hasMore` to prevent duplicate requests. Cleanup
> disconnects the observer to avoid leaks. I chose IntersectionObserver over scroll listeners because
> it's async and off the main thread."

### E. JWT create + verify (`services/security.py`)
```python
def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})                                  # standard exp claim
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)  # HS256 sign

def verify_user_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id: raise HTTPException(400, ...)
    except JWTError: raise HTTPException(400, "Invalid or expired token")
    return user_id
```
> "I sign a JWT with the user id in the `sub` claim and an `exp` expiry, using HS256 (symmetric — the
> same `SECRET_KEY` signs and verifies). `jwt.decode` validates the signature *and* expiry; an invalid
> or expired token raises `JWTError`, which I translate into a clean 400. The token is stateless — the
> server stores nothing, which is what makes the backend horizontally scalable."

### F. Atomic rating upsert (`services/user.py`)
```python
existing = users_collection.find_one({"id": user.id, "ratings.movie_id": mid})
if existing:
    users_collection.find_one_and_update(
        {"id": user.id, "ratings.movie_id": mid},
        {"$set": {"ratings.$.rating": new_rating}})   # update the matched array element
else:
    users_collection.find_one_and_update(
        {"id": user.id}, {"$addToSet": {"ratings": entry}})  # add new entry
```
> "If the user already rated this movie, I match the array element by `ratings.movie_id` and update just
> that element with the **positional `$`**. Otherwise I `$addToSet` a new rating. Both are single atomic
> DB operations — I never load the array into Python and write it back, which would be racy."

### G. The recommendation pipeline (`services/ollama_recommender.py` + `endpoints/users.py`)
> "Resolve the user's favorite/watchlist/rated movie IDs into titles → bucket ratings into
> high/medium/low → build a prompt that emphasizes favorites and high ratings and lists movies to avoid
> → run a `pydantic-ai` Agent against Mistral (temp 0.2 for consistency) → parse the JSON array (regex
> fallback for malformed output) → dedupe and cap at 20 → back in the endpoint, search TMDB for each
> title to convert names into real movie objects. The whole thing is wrapped in try/except with a
> favorites-based fallback and finally an empty list, so it degrades gracefully and never 500s."

---

<a name="20-hooks"></a>
## 20. React Hooks — Complete Reference

Hooks are functions that let a **function component** "hook into" React state and lifecycle. Two rules
govern all of them:
1. **Only call hooks at the top level** — never inside loops, conditions, or nested functions. React
   identifies each hook by its **call order**, so the order must be identical on every render.
2. **Only call hooks from React functions** — components or other hooks (this is why `authFetch` can't
   use them and needs the registry bridge from §7).

> **Why the rules?** React stores hook state in an internal array indexed by call order. If you called a
> hook conditionally, the indices would shift between renders and React would hand back the wrong
> state — leading to bugs like "my state randomly belongs to a different variable."

Below, every built-in hook this project uses, in the format **Syntax → When → Why → Without it →
Example**.

---

### `useState`
**Syntax**
```ts
const [value, setValue] = useState<T>(initialValue);
setValue(next);                 // replace
setValue(prev => prev + 1);     // functional update (uses latest value)
```
**When:** simple, local, independent pieces of UI state (a toggle, an input, a "isFetching" flag).
**Why:** calling the setter tells React this component must re-render with the new value. React
*preserves* the value across renders (a plain variable would reset to its initial value every render).
**Without it:** if you used a normal `let x = 0`, changing it would **not** re-render the component, and
the value would reset on the next render — the UI would never update.
**In the project:** `useInfiniteScroll` uses `const [isFetching, setIsFetching] = useState(false)` to
track an in-flight page load and block duplicate fetches.
```ts
const [isFetching, setIsFetching] = useState(false);
const loadNextPage = async () => {
  if (isFetching || isLoading || !hasMore) return; // guard
  setIsFetching(true);
  try { await fetchFn(); } finally { setIsFetching(false); }
};
```
> **Functional updates matter:** use `setX(prev => ...)` when the next value depends on the previous one,
> to avoid stale-state bugs from batched updates.

---

### `useReducer`
**Syntax**
```ts
const [state, dispatch] = useReducer(reducer, initialState);
// reducer: (state, action) => newState   (must be PURE)
dispatch({ type: "SET_LOADING", payload: true });
```
**When:** complex state with many sub-fields and many transition types, or when the next state depends on
the previous one in non-trivial ways. **This project's primary state tool** — all 5 contexts use it.
**Why:** centralizes every state transition in one pure function, so logic is predictable, testable, and
co-located. It scales far better than juggling 15 `useState` calls.
**Without it:** you'd have many `useState`s and update logic scattered across event handlers — hard to
follow, easy to create inconsistent states (e.g. forgetting to clear an error when starting a fetch).
**In the project:** `MoviesContext` has ~20 action types (genres, popular, by-genre, search, casts,
reviews) all funneled through one reducer with immutable updates.
```ts
function moviesReducer(state, action) {
  switch (action.type) {
    case "FETCH_POPULAR_PAGE_START": return { ...state, popularLoading: true, popularError: null };
    case "FETCH_POPULAR_PAGE_SUCCESS": { /* dedupe + merge */ return {...state, ...}; }
    default: return state;   // ALWAYS return current state for unknown actions
  }
}
```
> **Reducer must be pure:** no `fetch`, no mutation, no `Date.now()` inside it — same input → same output.
> Side effects live in the action creators (the context functions), not the reducer.

**`useState` vs `useReducer`:** "useState for a few independent values; useReducer when state transitions
are complex or interdependent. A reducer is essentially `useState` with the update logic extracted into a
named, testable function."

---

### `useContext` (and `use-context-selector`)
**Syntax**
```ts
const value = useContext(MyContext);
// project also uses:
import { useContext } from "use-context-selector";
const watchlist = useContextSelector(UserStateContext, s => s.user?.watchlist);
```
**When:** share state/functions with a deep subtree without **prop-drilling** (passing props through many
intermediate components that don't care about them).
**Why:** any descendant can read the context directly. The project uses it for auth/user data, movie
caches, the modal, and toasts — all needed in many far-apart places.
**Without it:** you'd thread `user`, `logout`, `showError`, etc. through every layer as props — verbose,
fragile, and a maintenance nightmare (a new prop means editing every component in the chain).
**The catch:** plain `useContext` re-renders **every consumer** whenever the provider value changes. See
§22 for how the project fixes this with split contexts + `use-context-selector`.
> **Custom-hook wrapper pattern:** every context exposes a `useX()` hook that throws if used outside its
> provider — this gives a clear error and **narrows the type** from `T | undefined` to `T`.

---

### `useEffect`
**Syntax**
```ts
useEffect(() => {
  // side effect (subscriptions, fetches, DOM, timers)
  return () => { /* cleanup */ };   // optional
}, [dep1, dep2]);                    // dependency array
```
**Dependency array semantics:**
- `[]` → run **once** after mount (and cleanup on unmount).
- `[a, b]` → run after mount and whenever `a` or `b` changes.
- *omitted* → run after **every** render (rarely what you want).

**When:** synchronize a component with something **outside** React — network requests, event listeners,
observers, timers, manual DOM, `localStorage`.
**Why:** rendering must be pure; effects are where side effects belong, run *after* the DOM is painted.
**Without it:** putting a fetch or subscription directly in the component body runs it on **every render**
(infinite loops, duplicate listeners, memory leaks). And without the **cleanup** return, observers/timers
pile up and leak.
**In the project:**
```ts
// useInfiniteScroll — set up an observer, clean it up when deps change/unmount
useEffect(() => {
  const el = sentinelRef.current; if (!el) return;
  observerRef.current?.disconnect();
  observerRef.current = new IntersectionObserver(([entry]) => {...}, { rootMargin });
  observerRef.current.observe(el);
  return () => observerRef.current?.disconnect();   // cleanup prevents leaks
}, [hasMore, isLoading, isFetching]);

// ProtectedRoute — react to auth state changes
useEffect(() => {
  if (!isAuthenticated && !isLoading) { token ? fetchUserProfile() : navigate("/auth?mode=login"); }
}, [isAuthenticated, isLoading, ...]);
```
> **Cleanup + StrictMode:** in dev, React 18/19 StrictMode mounts→unmounts→remounts each component to
> surface missing cleanup. The project's observer hooks disconnect on cleanup, so they're StrictMode-safe.
> **Stale closures:** an effect captures the variables from the render it ran in; that's why the
> dependency array must list everything the effect reads, or you'll act on outdated values.

---

### `useCallback`
**Syntax**
```ts
const memoizedFn = useCallback(() => { /* ... */ }, [deps]);
```
**When:** you need a function to keep the **same identity** across renders — because it's a dependency of
another hook, or passed to a memoized/`use-context-selector` consumer.
**Why:** a function defined in a component body is **recreated every render** (new reference). If that
function is in a dependency array or context value, the new reference triggers re-runs/re-renders.
`useCallback` returns the *same* function instance until its deps change.
**Without it:** in the project, the action functions in `UserContext` would get a new identity every
render, defeating the split-context optimization and causing action-only consumers (movie cards) to
re-render needlessly; and `fetchMoviesByIds` (a dep of `useMemo`) would change every render, recomputing
the context value constantly.
**In the project:**
```ts
const fetchMoviesByIds = useCallback(async (ids) => {...}, [state.fetchedMoviesById]);
const logout = useCallback(() => { localStorage.removeItem("access_token"); dispatch({type:"CLEAR_USER"}); }, []);
```
> **Don't over-use it.** `useCallback` has its own cost; it's only worthwhile when the stable identity
> actually matters (deps arrays, memoized children, context values). Wrapping every function is noise.

---

### `useMemo`
**Syntax**
```ts
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```
**When:** (1) caching an expensive computation, or (2) keeping an **object/array identity stable** so it
doesn't trigger downstream re-renders.
**Why:** like `useCallback` but for values. The project uses it mainly for reason (2).
**Without it:** the `MoviesContext` `value={{ state, fetchGenres, ... }}` object would be a **new object
every render**, so *every* consumer of that context re-renders on every provider render — exactly the
performance trap context is infamous for.
**In the project:**
```ts
const contextValue = useMemo(
  () => ({ state, fetchGenres, fetchPopularPage, /* ...all actions */, fetchMoviesByIds }),
  [state, fetchMoviesByIds]   // new object only when state or that fn changes
);
return <MoviesContext.Provider value={contextValue}>{children}</MoviesContext.Provider>;
```
> **`useCallback(fn, d)` === `useMemo(() => fn, d)`** — `useCallback` is just sugar for memoizing a
> function. Same dependency-array rules apply.

---

### `useRef`
**Syntax**
```ts
const ref = useRef<T>(initialValue);
ref.current;            // read/write — does NOT trigger re-render
<div ref={ref} />       // attach to a DOM node
```
**When:** (1) reference a DOM element, or (2) hold a mutable value that should **persist across renders
but not cause re-renders** (flags, previous values, timer IDs, observer instances).
**Why:** unlike state, mutating `ref.current` is invisible to React's render cycle — perfect for
"bookkeeping" values.
**Without it:** using `useState` for a "did I already fetch?" flag would re-render on every change (and
could loop); using a plain variable would reset every render and lose the value.
**In the project:**
```ts
// useFetchOnView — fire exactly once, ever
const ref = useRef<HTMLDivElement|null>(null);   // DOM node (the sentinel)
const fetchedRef = useRef(false);                 // persistent flag, no re-render
... if (entry.isIntersecting && !fetchedRef.current) { fetchedRef.current = true; fetchFn(); }

// useInfiniteScroll — keep the observer instance across renders
const observerRef = useRef<IntersectionObserver|null>(null);
```
> **Refs vs state in one line:** "State is for values the UI renders from; refs are for values you need to
> remember but that shouldn't, by themselves, cause a render."

---

<a name="21-custom-hooks"></a>
## 21. Custom Hooks — Complete Reference

A **custom hook** is just a function whose name starts with `use` and that calls other hooks. It's how
you **extract and reuse stateful logic** between components — the modern replacement for old
mixins/HOCs/render-props. It returns whatever you want (values, functions, refs).

> **Why custom hooks instead of utility functions?** Because they can *call hooks* (`useState`,
> `useEffect`, …). A plain function can't hold state or subscribe to effects; a custom hook can, and each
> component that calls it gets its **own isolated copy** of that state.

This project has 6 custom hooks. For each: **what it does → why it exists → what breaks without it.**

---

### `useInfiniteScroll` — reusable infinite scrolling
```ts
const { sentinelRef, isFetching } = useInfiniteScroll({ fetchFn, hasMore, isLoading, rootMargin });
// usage: <div ref={sentinelRef} /> at the bottom of the list
```
- **What:** wraps an `IntersectionObserver` that calls `fetchFn` when a sentinel element nears the
  viewport (600px early via `rootMargin`), with guards against duplicate loads.
- **Why it exists:** popular movies, genre pages, and search all need identical "load more on scroll"
  behavior. The hook encapsulates the observer setup, the `isFetching` guard, the unobserve-during-fetch
  trick, and cleanup — so each list is one line, not 30 duplicated lines.
- **Without it:** every paginated list would re-implement observer logic (or worse, scroll-event
  listeners with `getBoundingClientRect`), and you'd inevitably get duplicate-page bugs and leaks.

---

### `useFetchOnView` — fetch once when visible (lazy loading)
```ts
const ref = useFetchOnView(() => fetchMovieCast(movie.id));
// <div ref={ref} /> — fetch fires the first time it scrolls into view, then never again
```
- **What:** fires a fetch **exactly once** when an element first enters the viewport, using a
  `fetchedRef` boolean so re-renders never re-trigger it.
- **Why it exists:** lazy-load per-item data (e.g. a movie's cast) only when the user actually scrolls to
  it — saving needless API calls for items never seen.
- **Without it:** you'd either fetch everything up front (slow, wasteful) or risk re-fetching on every
  render. The `useRef` flag is what makes "exactly once" reliable across React's re-render churn and
  StrictMode double-invoke.

---

### `useAuthSubmit` — login/signup form submission
```ts
const { handleSubmit, isLoading } = useAuthSubmit();
// <form onSubmit={handleSubmit}>
```
- **What:** the whole auth submit pipeline — reads `FormData`, branches login vs signup (form-encoded
  OAuth2 vs JSON), posts to the right endpoint, stores the JWT on success, maps backend errors to form
  fields, shows toasts, and navigates.
- **Why it exists:** keeps a large, stateful, side-effect-heavy flow out of the form component, which
  stays focused on markup. Composes `useAuth` (form state), `useUserActions` (fetch profile), `useMessages`
  (toasts), and `useNavigate`.
- **Without it:** the `AuthForm` component would balloon with networking, error-mapping, token storage,
  and navigation logic — mixing concerns and making the form hard to test or reuse.

---

### `useAuthMode` — login/signup mode synced to the URL
```ts
const { isLogin, direction, handleModeChange } = useAuthMode();
```
- **What:** reads `?mode=signup|login` from the URL (`useSearchParams`), sets the reducer mode on mount,
  handles an `?error=` param (showing it once then stripping it from the URL), and exposes
  `handleModeChange` that updates both state *and* the URL (and sets the slide `direction` for animation).
- **Why it exists:** makes the auth mode **shareable/bookmarkable and back-button friendly** — the URL is
  the source of truth, not just internal state.
- **Without it:** refreshing or sharing a link would lose the login/signup mode; the error param would
  re-show on every refresh; and animation direction logic would be duplicated in the component.

---

### `useProfileForm` — profile update form logic
```ts
const { handleSubmit, resetForm, isLoading, errors, getFieldError, clearMessages } = useProfileForm();
```
- **What:** collects only the **changed** profile fields from `FormData` (trims, skips empties), bails if
  nothing changed, and calls `updateUserProfile`. Exposes loading/error/success state from `UserContext`.
- **Why it exists:** centralizes "diff the form, submit only deltas" logic and bridges the form UI to the
  user context. `handleSubmit`/`resetForm` are wrapped in `useCallback` for stable identities.
- **Without it:** the profile page would re-implement field extraction + change-detection and wire up
  context state manually — repeated and error-prone (e.g. accidentally PATCHing empty fields).

---

### `useAuthContent` — presentational content selector
```ts
const content = useAuthContent(isLogin);  // { title, subtitle, description, features[], cta, ... }
```
- **What:** returns the correct copy/icons for the login vs signup view. *Technically it calls no other
  hooks* — it's a content map behind a hook-named function for API consistency.
- **Why it exists:** keeps marketing copy out of the JSX so the sidebar component just renders
  `content.title`, etc., and switching modes swaps all text at once.
- **Without it:** the copy would be inline conditional ternaries scattered through the JSX — harder to
  edit and to keep the two modes in sync.
> **Honest note:** since it uses no hooks, it could be a plain `getAuthContent(isLogin)` function. Naming
> it `use*` is a minor stylistic choice — a fair thing to acknowledge in an interview.

---

<a name="22-context"></a>
## 22. Context Management — Deep Dive

### The problem Context solves: prop-drilling
Without Context, to get `user` or `showError` to a deeply nested component you pass it as a prop through
**every** intermediate component, even ones that don't use it. That's "prop-drilling" — verbose, and
every new shared value means editing the whole chain. Context provides a value to an entire subtree;
any descendant reads it directly.

### The provider tree (`App.tsx`)
```
<Router>
 <AuthProvider>            // auth FORM ui state (login/signup toggle, password visibility)
  <MessageProvider>        // global toasts — provided high so everything can showError/showSuccess
   <UserProvider>          // authenticated user + profile + watchlist/fav/ratings + AI recs
    <MoviesProvider>       // TMDB data + client-side caches
     <MovieModalProvider>  // movie detail modal + trailer cache
       <Routes/>
```
**Why this order matters:** a provider can only consume contexts **above** it. `UserProvider` calls
`useMessages()` (to show errors) and `useNavigate()`, so it must sit **below** `MessageProvider` and
**inside** `Router`. Get the order wrong and you get "must be used within a Provider" crashes.

### The core Context performance problem
> "Plain React Context re-renders **every** consumer whenever the provider's `value` changes — regardless
> of which part of the value they use. With a frequently-changing value (like the user object), that
> causes app-wide re-render storms."

This project applies **three** mitigations:

**1) Stabilize the `value` with `useMemo`** (so it's not a brand-new object each render):
```ts
const contextValue = useMemo(() => ({ state, ...actions }), [state, fetchMoviesByIds]);
```
Without this, the provider hands down a new object reference every render → all consumers re-render even
when nothing they care about changed.

**2) Split State and Actions into separate contexts** (`UserContext`, `MovieModalContext`):
```ts
const UserStateContext   = createContext<UserState|undefined>(undefined);    // changes often
const UserActionsContext = createContext<Actions|undefined>(undefined);      // stable (memoized)
...
<UserStateContext.Provider value={state}>
  <UserActionsContext.Provider value={{ logout, toggleToFavorite, ... }}>
```
- Components that only need **actions** (e.g. a `MovieCard` calling `toggleToFavorite` or `openModal`)
  subscribe to the *Actions* context, which **never changes** → they don't re-render when state updates.
- Only components that read **state** re-render on state changes.
> "It's the same principle as Redux separating `dispatch` (stable) from `state` (changing)."

**3) `use-context-selector`** (`UserContext`): lets a component subscribe to a **slice** of context:
```ts
const watchlist = useContextSelector(UserStateContext, s => s.user?.watchlist);
```
Now the component re-renders **only when that slice changes**, not on every user-object mutation. This is
the granular fix React's built-in `useContext` lacks (React's own `useContextSelector` is still
experimental, hence the library).

### Each context's job (quick map)
| Context | State shape highlights | Notable technique |
|---|---|---|
| `AuthContext` | `isLogin`, `showPassword`, `errors`, `direction` | plain context + reducer (form UI only) |
| `MessageContext` | `messages[]` | `REPLACE_ALL_MESSAGES` shows one toast at a time; auto-dismiss via `setTimeout` |
| `UserContext` | `user`, `isAuthenticated`, `aiRecommendations`, `profileFieldErrors` | **split State/Actions** + `use-context-selector` + optimistic updates |
| `MoviesContext` | Maps for genres/popular/by-genre/search/casts/reviews | `useMemo` value + Map-based cache + dedupe |
| `MovieModalContext` | `selectedMovie`, `isOpen`, trailer Maps | **split State/Actions**; stable actions via `useMemo([])` |

### When NOT to use Context
> "Context is for **low-frequency, widely-needed** state (auth, theme, current user). For
> high-frequency server data with caching/refetching needs, a dedicated tool (React Query) is better —
> it handles caching, dedup, and background refresh that I hand-rolled here. And for purely local state,
> `useState` in the component is correct — lifting everything into context is an anti-pattern."

---

<a name="23-react-patterns"></a>
## 23. More React Patterns in This Project

**Controlled vs uncontrolled forms**
> "The auth and profile forms are **uncontrolled** — I read values from the DOM via `new
> FormData(e.currentTarget)` on submit, instead of binding each input to `useState`. Pros: far fewer
> re-renders (no state update per keystroke) and less code. Cons: I can't easily validate/transform on
> every keystroke. For these simple forms it's the right trade-off; a complex wizard would justify
> controlled inputs or a form library like React Hook Form."

**Conditional rendering**
```tsx
{isLoading && <Spinner />}
{error ? <Error msg={error} /> : <List items={items} />}
{user?.watchlist.length === 0 && <EmptyState />}
```
> "Use `&&` for show/hide, ternaries for either/or. I guard on loading/error/empty in that order so the
> UI always reflects the current async phase."

**Lists & keys**
> "Every `.map` to JSX needs a stable, unique `key` — I use movie `id`, never the array index, because
> index keys break when the list reorders or items are inserted/removed, causing React to reuse the wrong
> DOM node and component state. My pagination dedupe also keeps keys unique."

**Composition with `children`**
```tsx
<ProtectedRoute><DashboardLayout /></ProtectedRoute>
function ProtectedRoute({ children }: { children: ReactNode }) { ...; return <>{children}</>; }
```
> "I compose via the `children` prop and React Router's `<Outlet/>` for nested routes, rather than
> inheritance. 'Composition over inheritance' is the React way — wrappers like `ProtectedRoute` add
> behavior around whatever they wrap."

**Layout / nested routes (`<Outlet/>`)**
> "`/dashboard` renders `DashboardLayout`, and its child routes (search, watchlist, favorites, ratings,
> profile) render into the layout's `<Outlet/>`. Shared chrome (sidebar/navbar) renders once; only the
> outlet swaps on navigation."

**Accessibility via primitives (Radix/shadcn)**
> "The movie detail modal is a Radix `Dialog` — I get focus-trapping, `Esc`-to-close, scroll-locking,
> and ARIA roles for free. The rating control is a Radix `Select`; the avatar uses Radix `Avatar` with a
> fallback. Building these from scratch accessibly is hard; the primitives handle it."

**Animation pattern (Framer Motion)**
> "The login↔signup transition uses a `direction` value (`+1`/`-1`) from the auth reducer to drive a
> slide animation, so the panels slide the correct way depending on which mode you came from."

**Render-bridge to non-React code (Registry pattern)**
> "Covered in §7: `authFetch` lives outside the component tree, so I register `logout` and `navigate`
> into module-level slots from inside providers (`registerLogout`, `setGlobalNavigate`). It's how
> non-component code triggers React-owned behavior."

**Error/empty/loading states as first-class UI**
> "Every async slice in my reducers tracks `loading`/`error` (often per-id via Maps), and components
> render skeletons (shadcn `Skeleton`) while loading and a toast/empty state on error — so the UI is
> never blank or frozen during I/O."

**What's missing (be honest):** "No **Error Boundary** (a class component or `react-error-boundary` to
catch render-time crashes and show a fallback), no `React.lazy`/`Suspense` **code-splitting** (the whole
app ships in one bundle), and no `React.memo` on heavy list items. All three are things I'd add to harden
and speed up the app."

---

<a name="24-backend-deep"></a>
## 24. Backend Syntax & Patterns — Deep Dive

### Layered architecture (the request's journey)
```
HTTP request
  → endpoints/*.py   (routing, params, response_model)        "the controller"
    → services/*.py  (business logic, talks to DB/TMDB/LLM)    "the service layer"
      → schemas/*.py (Pydantic validation + serialization)     "the data contract"
        → core/config.py (typed settings)
```
> "Endpoints stay thin — they parse input and call a service. Services hold the logic and are the only
> layer that touches MongoDB/TMDB. Schemas define the shapes that flow between them. This separation
> means I can test business logic without HTTP, and swap the web layer or DB without rewriting logic."

### FastAPI routing & `APIRouter`
```python
router = APIRouter()
@router.get("/popular", response_model=MovieResponse)
async def get_popular_movies(page: int = Query(1, ge=1)):
    return MovieResponse(movies=await fetch_popular_movies(page))
# main.py: application.include_router(movies.router, prefix="/movies")
```
> "`APIRouter` groups related routes; `include_router(..., prefix="/movies")` mounts them. `response_model`
> tells FastAPI the output schema — it validates and **filters** the response (so secrets like
> `hashed_password` never leak even if present on the object) and documents it in OpenAPI."

### Dependency Injection (`Depends`)
```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user_id = verify_user_token(token)          # decode/verify JWT
    user = find_user_by_id(user_id)
    if not user.is_verified: raise HTTPException(403, ...)
    return user
# any protected endpoint:
async def read_users_me(current_user: User = Depends(get_current_user)): ...
```
> "`Depends` resolves a dependency before the handler runs and injects the result. `OAuth2PasswordBearer`
> auto-extracts the `Authorization: Bearer <token>` header (and powers the Swagger 'Authorize' button).
> One declaration — `Depends(get_current_user)` — secures any endpoint and yields an authenticated user.
> Dependencies are reusable, testable, and self-documenting."

### Pydantic models, validators, and the mixin
```python
class SharedValidators(BaseModel):
    @field_validator("password", "new_password", mode="before", check_fields=False)
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8: raise ValueError("Password must be at least 8 characters long")
        ...

class UserCreate(SharedValidators):
    email: EmailStr
    model_config = ConfigDict(extra="forbid")
```
> "Pydantic validates and parses request bodies from type hints. `@field_validator` adds custom rules;
> `mode='before'` runs before type coercion, `check_fields=False` lets the **mixin** declare validators
> for fields it doesn't itself define (so `UserCreate`, `UpdateUserProfile`, etc. share one set of
> rules — DRY). `extra='forbid'` rejects unexpected fields, preventing mass-assignment. `EmailStr`
> validates email format. A raised `ValueError` becomes a 422 my custom handler reshapes."

### Async + concurrency
```python
async def fetch_multiple_movies_details(ids):
    tasks = [fetch_movie_details(i) for i in ids]
    movies = await asyncio.gather(*tasks, return_exceptions=True)  # parallel
    return [m for m in movies if isinstance(m, Movie)]
```
> "FastAPI is async-native (ASGI). `aiohttp` makes non-blocking HTTP calls and `asyncio.gather` runs many
> at once, so fetching 20 movies is ~1 round-trip of latency instead of 20 sequential ones.
> `return_exceptions=True` keeps one failure from killing the batch. **Caveat:** my MongoDB calls use
> sync `pymongo`, which blocks the event loop — the correct fix is the async `Motor` driver (see §12)."

### Centralized exception handling → consistent error contract
```python
@application.add_exception_handler(RequestValidationError, validation_exception_handler)
# reshapes everything to: { "errors": [ { "field": "...", "message": "..." } ] }
```
> "I register handlers that turn both Pydantic validation errors and my `HTTPException`s into one
> envelope: `{errors:[{field,message}]}`. The frontend's `transformBackendErrors` maps those fields to
> form inputs. One predictable shape across the whole API."

### Background tasks & scheduled jobs
```python
background_tasks.add_task(send_verification_email, email, link)   # after response, non-blocking
scheduler.add_job(delete_unverified_users, "cron", hour=3)        # APScheduler daily cleanup
```
> "`BackgroundTasks` runs work *after* the response is sent — signup returns instantly while the email
> sends in the background. APScheduler runs a daily cron that deletes unverified users older than 24h.
> The `@app.on_event('startup'/'shutdown')` hooks start/stop the scheduler (these are deprecated now —
> I'd migrate to the `lifespan` API)."

### Config as typed settings (`BaseSettings`)
```python
class Settings(BaseSettings):
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    class Config: env_file = ".env"
settings = Settings()   # one shared, validated, typed object
```
> "Pydantic `BaseSettings` reads env vars / `.env` and **validates types at startup** — a missing or
> malformed var fails fast rather than blowing up mid-request. Everything imports the one `settings`
> instance."

---

<a name="25-jwt"></a>
## 25. Why JWT? — Authentication Deep Dive

This is a **very common interview question**, and you asked it directly: *why use a JWT instead of just
sending the (encrypted) username + password on every request?*

### What a JWT is
> "A JSON Web Token is a signed, self-contained token with three base64url parts: **header** (algorithm),
> **payload** (claims like `sub`=user id and `exp`=expiry), and **signature**. My backend signs it with a
> server secret using HS256. The signature lets the server verify the token is authentic and untampered
> **without a database lookup** — change one byte of the payload and the signature no longer matches."

```python
to_encode = { "sub": user.id, "exp": <now + 30min> }
token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")     # login: issue once
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])    # each request: verify
```

### Why NOT send username + password on every request?

**1) Credentials exposure & attack surface.**
> "Sending the password on every request means it's transmitted, logged, and held in memory **constantly**
> — every request is another chance for it to leak (proxy logs, error logs, browser history, a
> compromised intermediary). With JWT, the password crosses the wire **once** at login. The token is a
> short-lived, revocable-by-expiry **proxy** for the credentials, scoped and disposable."

**2) 'Encrypting' the password client-side doesn't help.**
> "If the frontend encrypts the password, then the encrypted blob *becomes* the password — an attacker
> who captures it can just replay it ('replay attack'). Client-side encryption also can't be trusted by
> the server (the client controls the key). The real transport security is **HTTPS/TLS**, which already
> encrypts everything in transit. So re-sending credentials adds risk without adding protection."

**3) You'd have to verify the password every request — expensively.**
> "Password verification uses **bcrypt**, which is *deliberately slow* (a security feature against brute
> force) — tens of milliseconds per check. Doing that on every API call would wreck performance. Verifying
> a JWT signature is sub-millisecond CPU work. So JWT is both safer *and* faster."

**4) Statelessness → horizontal scalability.**
> "The JWT carries the identity, so the server stores **no session**. Any backend instance can verify any
> request with just the secret — no shared session store, no sticky sessions. That's what lets me run N
> backend containers behind a load balancer (see §17). Server-side sessions would need a shared store
> (Redis/DB) and a lookup per request."

**5) Decoupling & expiry.**
> "The token has a built-in `exp`, so access auto-expires (mine: 30 min) without server bookkeeping. It
> also cleanly supports third-party logins — my Google OAuth flow mints the *same* kind of JWT after
> Google verifies the user, so the rest of the app treats local and Google users identically."

### The honest trade-offs (mention these — it shows depth)
> "JWTs are **hard to revoke before expiry** — since the server keeps no state, a stolen token is valid
> until it expires. Mitigations: keep access tokens short-lived and add a **refresh token** (rotating,
> revocable) — which my project currently lacks (§12). And storing the JWT in **localStorage** exposes it
> to XSS; an `httpOnly` cookie is safer. So JWT solves the *credential-transmission* and *scalability*
> problems well, but token storage and revocation are where I'd harden it."

### Session (stateful) vs JWT (stateless) — the one-liner
| | Server-side session | JWT (this project) |
|---|---|---|
| Where identity lives | server store (Redis/DB), client holds a session id | inside the signed token the client holds |
| Per-request cost | DB/cache lookup | verify signature (CPU only) |
| Scaling | needs shared session store / sticky sessions | stateless — any instance, no shared store |
| Revocation | easy (delete session) | hard (must wait for expiry / maintain a denylist) |
| Best for | server-rendered apps, need instant revoke | APIs, SPAs, microservices, horizontal scale |

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
