# 06: Angular Route Guards & Interceptors vs React Routers & Middleware

---

## 1. Why This Topic Exists

In enterprise single-page applications, two architectural subsystems govern user navigation and network communication: **Routing** and **HTTP Interception**.

For an engineer with an **Angular** background, routing and network security are strictly formalized:
- **Angular Router:** Built into the framework core, routing is configuration-driven. Every route is guarded by strongly-typed functional guards (`CanActivateFn`, `CanDeactivateFn`, `CanMatchFn`) and pre-fetched using resolvers (`ResolveFn`).
- **Angular HttpInterceptor:** The `HttpClient` module funnels all network requests through an **Onion Architecture** of interceptor functions (`HttpInterceptorFn`). These interceptors seamlessly attach OAuth2 Bearer tokens, transform request headers, and centralize global HTTP error logging.

When transitioning to React, engineers frequently search in vain for a built-in `AngularRouter` or `HttpInterceptor`. Because React is a view library rather than a monolithic framework, routing and network interception have historically been solved across different layers:
1. **Client-Side Component Routing (React Router v6/v7):** Route protection is achieved through **Wrapper Layout Components**, **Compound Route Loaders**, and the `useBlocker` hook.
2. **Full-Stack Server & Edge Routing (Next.js App Router):** Route protection shifts fundamentally from client-side JavaScript to **Edge Middleware (V8 Isolates)**, intercepting incoming HTTP requests at the CDN boundary before any React components or HTML render.
3. **Network Interception:** Client-side HTTP interception is handled via custom `fetch` wrappers or Axios interceptors, while enterprise security increasingly adopts **Token-Mediating BFFs**.

Mastering these transitions is essential to prevent client-side redirect flash, secure enterprise API tokens, and eliminate unsaved form data loss.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Translate Angular route guards (`CanActivate`, `CanDeactivate`, `CanMatch`, `Resolve`) into idiomatic React patterns across both React Router and Next.js.
- Implement client-side dirty form protection (`CanDeactivate`) using React Router's `useBlocker` hook.
- Transition from client-side Angular `CanActivate` guards to Next.js **Edge Middleware**, eliminating unauthorized layout flashing (FOUC).
- Architect enterprise HTTP interception in React using custom fetch wrappers and Axios interceptors.
- Understand the paradigm shift from client-side token injection to **Token-Mediating BFF cookies**.
- Map frontend routing and interceptor patterns to ASP.NET Core **Action Filters**, **Authorization Middleware**, and `DelegatingHandler` pipelines.

---

## 3. Historical Evolution

The architecture of frontend navigation and request interception has evolved across three distinct eras:

1. **The Monolithic Configuration & Interceptor Era (Angular 2+ / 2016–2020):**
   Angular established the gold standard for enterprise SPA routing. Routes were defined in central configuration arrays. HTTP requests flowed through an immutable interceptor chain (`HttpRequest.clone()`). Route guards prevented unauthorized route activation client-side by inspecting local tokens before activating `<router-outlet>`.
2. **The Declarative Component Routing Era (React Router v4–v6 / 2017–2022):**
   React Router rejected static route configuration, arguing that "Everything is a Component." Routes were rendered as JSX elements (`<Route path="..." element={<Comp />} />`). Route guards were implemented as wrapper components (`<ProtectedRoute><Dashboard /></ProtectedRoute>`). While intuitive, this approach suffered from client-side "flash of unauthorized content" and waterfalls, where protected pages momentarily flashed before redirecting to `/login`.
3. **The Edge Middleware & Loader-Driven Era (2022–Present):**
   - **React Router v6.4+ / Remix** introduced **Data Loaders** (`loader()`), moving route gating and prefetching before component rendering.
   - **Next.js App Router** moved route gating completely out of the browser and into **Edge Middleware (V8 Isolates)**. Requests are intercepted at the CDN edge; unauthorized users are redirected in under 5ms without downloading any client bundle.

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Castle Gatehouse, Bouncer, and Exit Checkpoint

Imagine an exclusive private club with strict security:
- **The Angular Model (The Interior Room Bouncer):**
  - A visitor walks through the front door of the building into the grand lobby.
  - When the visitor walks up to the VIP Lounge door, a bouncer stands in front of the door (`CanActivate`).
  - The bouncer checks the visitor's badge. If invalid, the bouncer escorts the visitor back to the lobby (`router.navigate(['/login'])`).
  - If a visitor tries to walk out of the conference room while leaving secret papers on the table, an exit guard stops them: "Did you save your work?" (`CanDeactivate`).
- **The Next.js Edge Middleware Model (The Perimeter Gatehouse):**
  - There is no bouncer standing in front of the interior VIP door.
  - Instead, there is an armed security gatehouse at the outer property fence, 2 miles away from the building (`The CDN Edge PoP`).
  - If an unauthenticated car approaches the gatehouse, the guard turns them away at the property line in 2 seconds. The car never enters the driveway, never parks, and never steps foot in the building.
- **The HTTP Interceptor Model (The Diplomatic Pouch Courier):**
  - Every letter leaving the building is handed to a diplomatic courier (`HttpInterceptor`).
  - The courier stamps the letter with a wax seal (`Authorization: Bearer <token>`), checks the destination address, and logs the shipment in a central ledger.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The Master Routing & Interceptor Rosetta Stone

| Angular Concept / Construct | React Router Equivalent | Next.js App Router Equivalent | Runtime Resolution Mechanic |
| :--- | :--- | :--- | :--- |
| **`CanActivateFn` (Auth Guard)** | **Route `loader()` or `<ProtectedRoute>` wrapper** | **Edge Middleware (`middleware.ts`)** | Angular evaluates client-side before activating ViewRef; Next.js evaluates at the CDN Edge before HTML generation. |
| **`CanDeactivateFn` (Unsaved Changes)** | **`useBlocker()` / `usePrompt()` hook** | **Native `window.onbeforeunload` + custom modal** | Intercepts navigation history pop/push events before updating the active URL. |
| **`CanMatchFn` (Feature Gating)** | **Dynamic route matching in `loader()`** | **Edge Middleware URL Rewrite (`NextResponse.rewrite`)** | Conditionally routes to different component branches based on feature flags or AB test cookies. |
| **`ResolveFn` (Route Prefetching)** | **Route `loader: async () => data`** | **Async React Server Components (`async function Page()`)** | Angular delays view activation until Observable emits; Next.js streams data directly on the server. |
| **`HttpInterceptorFn` (Token Injection)** | **Axios Request Interceptor or Custom `fetch` wrapper** | **Token-Mediating BFF (`route.ts`) / Server Actions** | Angular clones immutable `HttpRequest`; React BFF handles tokens in server session cookies. |
| **`<router-outlet>`** | **`<Outlet />` (React Router)** | **`{children}` prop in `layout.tsx`** | Container rendering active child route segment. |

---

## 6. Runtime Flow & Execution Traces

Let us compare how an unauthenticated user attempting to access a protected billing page (`/billing`) is handled across both architectures:

### The Angular CanActivate Guard Flow (Client-Side)

```
1. User clicks link to /billing
2. Angular Router intercepts URL change
3. Router checks route config: canActivate: [AuthGuard]
4. AuthGuard.canActivate() executes client-side:
   - Reads token from localStorage / AuthService
   - Token is expired!
   - Returns UrlTree: router.createUrlTree(['/login'])
5. Router cancels navigation to /billing
6. Router activates /login view
7. Angular Change Detection updates DOM
```

### The Next.js Edge Middleware Flow (Edge Network Perimeter)

```
1. Browser issues HTTP GET https://app.com/billing
2. Request hits topologically nearest CDN Edge PoP (V8 Isolate)
3. Next.js middleware.ts executes (< 3ms):
   - Inspects HttpOnly session cookie
   - Cookie missing or JWT signature invalid!
   - Returns immediate HTTP 307 Temporary Redirect: /login
4. Browser receives HTTP 307; redirects immediately
5. Browser loads /login HTML shell
```

**Key Architectural Invariant:** In Next.js Edge Middleware, **zero bytes of the protected `/billing` JavaScript bundle or HTML are ever transmitted to the client**. The client never downloads protected code, completely eliminating client-side flash of unauthorized content.

---

## 7. Memory Model & Heap Layout

```
ANGULAR ROUTER HEAP MODEL (Client Memory):
+---------------------------------------------------------------+
| V8 Heap (Browser Memory)                                      |
|                                                               |
|  [ Router Service ]                                           |
|    ├── RouterStateSnapshot (Active ActivatedRoute Tree)       |
|    ├── RouteConfig Array (150+ route definitions on heap)     |
|    └── Interceptor Chain (Array of HttpInterceptorFn pointers)|
|                                                               |
|  * All route guards and interceptors live in client heap      |
+---------------------------------------------------------------+

NEXT.JS EDGE MIDDLEWARE TOPOLOGY:
+---------------------------------------------------------------+
| CDN EDGE V8 ISOLATE (Zero Client Heap Footprint)              |
|                                                               |
|  [ middleware.ts Execution Context ]                          |
|    ├── Verifies cryptographic HMAC-SHA256 cookie signature    |
|    └── Terminates in < 2ms; destroys Isolate memory           |
+---------------------------------------------------------------+
| CLIENT BROWSER HEAP (Only Receives Public / Authorized Code)  |
|  * Completely unburdened by perimeter security logic          |
+---------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### The HTTP Interceptor Pipeline: Angular vs Token-Mediating BFF

```
ANGULAR HTTP INTERCEPTOR PIPELINE (Client-Side Token Handling):
[ Component ]
      │
      ▼
[ HttpClient.get() ]
      │
      ▼
[ AuthInterceptor ] ──▶ clones request; adds "Authorization: Bearer <JWT>"
      │                 (JWT stored in client localStorage / memory)
      ▼
[ LoggingInterceptor ]
      │
      ▼
[ Browser fetch / XHR ] ──▶ Public Internet ──▶ [ Backend API ]

-------------------------------------------------------------------------

REACT / NEXT.JS TOKEN-MEDIATING BFF (Zero Client-Side Token Exposure):
[ React Component ]
      │
      ▼
[ fetch('/api/billing') ] (Cookie: __Host-session=encrypted_id)
      │
      ▼ (Public Internet)
+-----------------------------------------------------------------------+
| NEXT.JS BFF (Server Tier / VPC Edge)                                  |
|   1. Decrypts __Host-session cookie in private memory                 |
|   2. Retrieves internal raw OAuth2 Bearer JWT from Redis              |
|   3. Calls microservice: GET http://billing.internal (Bearer JWT)      |
|   4. Returns sanitized DTO to client                                  |
+-----------------------------------------------------------------------+
      │
      ▼
[ Backend Microservice ] (Never exposed to public internet)
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Side-by-Side Architectural Transformation: Guard & Interceptor

Below is an enterprise-grade comparison illustrating route protection and HTTP interception across Angular and React:

#### 1. The Angular Implementation (`auth.guard.ts` & `jwt.interceptor.ts`)

```typescript
// Angular 17+ Functional Guard & Interceptor
import { CanActivateFn, Router, inject } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

// 1. CanActivate Route Guard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login preserving returnUrl query parameter
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

// 2. HTTP Interceptor
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
```

#### 2. The Modern React Implementation: Next.js Edge Middleware (`middleware.ts`)

```typescript
// Next.js Edge Middleware (Edge V8 Isolate)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected route prefixes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/billing');

  if (isProtectedRoute) {
    // Read encrypted session cookie
    const sessionToken = request.cookies.get('__Host-session-token')?.value;

    if (!sessionToken) {
      // Redirect to login with returnUrl
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Optimization: Negative lookahead matcher skips static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### 3. Client-Side HTTP Interceptor Wrapper in React (`apiClient.ts`)

```typescript
// Enterprise Fetch Interceptor Client (Client-Side)
type FetchArgs = Parameters<typeof fetch>;

export class ApiClient {
  private static async executeIntercepted(input: FetchArgs[0], init?: FetchArgs[1]): Promise<Response> {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;

    // 1. Request Interceptor: Attach headers
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const config: RequestInit = {
      ...init,
      headers,
    };

    // 2. Execute Request
    const response = await fetch(input, config);

    // 3. Response Interceptor: Global Error & Token Expiration Handling
    if (response.status === 401) {
      console.warn('Session expired. Redirecting to login...');
      if (typeof window !== 'undefined') {
        window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    return response;
  }

  public static get(url: string, init?: RequestInit): Promise<Response> {
    return this.executeIntercepted(url, { ...init, method: 'GET' });
  }

  public static post(url: string, body: any, init?: RequestInit): Promise<Response> {
    return this.executeIntercepted(url, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
```

---

## 10. Angular Comparison

For an experienced Angular developer, transitioning routing mental models requires understanding the boundary between client and edge:

| Architectural Dimension | Angular Router & Interceptors | Modern React / Next.js Architecture |
| :--- | :--- | :--- |
| **Guard Execution Context** | 100% in the client browser main thread after the application bundle boots. | **Edge Middleware (Next.js):** Executes at CDN edge before client bundle or HTML downloads. |
| **Unsaved Form Protection** | **`CanDeactivateFn`:** Intercepts router state transition before leaving view. | **React Router `useBlocker`** or native `window.addEventListener('beforeunload')`. |
| **Data Prefetching** | **`ResolveFn`:** Route transition pauses until observable completes. | **React Server Components (RSC):** Data fetched directly on server; streamed via Suspense. |
| **Network Interception** | Immutable `HttpRequest.clone()` passed through `HttpHandler` onion chain. | Custom `fetch` interceptor wrapper, Axios interceptors, or Token-Mediating BFF. |

---

## 11. .NET Comparison

For engineers experienced with ASP.NET Core, frontend routing and interceptor patterns align directly with CLR pipelines:

| .NET / C# Architecture Pattern | Angular Equivalent | React / Next.js Equivalent |
| :--- | :--- | :--- |
| **`[Authorize]` Attribute / Authorization Filters** | `CanActivateFn` route guards. | Next.js Edge Middleware / React Router `loader()`. |
| **`DelegatingHandler` in `IHttpClientFactory`** | `HttpInterceptorFn` pipeline. | Custom `fetch` interceptor pipeline or Axios interceptors. |
| **ASP.NET Core Endpoint Routing (`MapControllers`)** | `Routes` configuration array in `RouterModule`. | Next.js File-System-Based Routing (`app/` directory). |
| **Razor Components `@page "/billing"`** | `@Component({ template: ... })` with route path. | `page.tsx` within route segment folder. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

Operating routing and authentication interceptors at enterprise scale involves critical production risks:

### 1. The Client-Side Flash of Unauthorized Content (FOUC)
- **The Risk:** Implementing authentication guards purely via client-side React wrapper components:
  ```tsx
  if (!isAuthenticated) return <Navigate to="/login" />;
  ```
- **The Failure Mode:** The browser downloads the protected dashboard JavaScript chunk, executes initial rendering, and *then* checks authentication. For 100–300ms, the protected layout flashes on screen before the redirect fires, leaking sensitive UI structures and damaging user experience.
- **The Enterprise Defense:** Move route protection to **Next.js Edge Middleware**. The Edge verifies the session cookie and issues an HTTP 307 redirect *before* the browser ever downloads a single byte of protected code.

### 2. The Silent Token Expiration Deadlock in Interceptors
- **The Risk:** An HTTP interceptor catches a 401 Unauthorized, initiates an asynchronous token refresh, but does not queue subsequent concurrent requests.
- **The Failure Mode:** If a dashboard fires 5 parallel API calls, all 5 receive 401s and trigger 5 concurrent refresh token requests (Thundering Herd). In refresh token rotation (RTR) architectures, the second request invalidates the entire token family, logging the user out.
- **The Enterprise Defense:** Implement a **Token Refresh Mutex** using the Web Locks API (`navigator.locks.request`) or an in-memory promise lock, ensuring only one refresh occurs while other requests wait.

---

## 13. Performance Considerations

```
ROUTING LATENCY BUDGET:
-------------------------------------------------------------
Edge Middleware Evaluation:     < 5ms (V8 Isolate at nearest PoP)
Client-Side Route Transition:   < 16ms (Instant Virtual DOM swap)
Server Component Prefetch:      Streamed via HTTP Chunked Transfer Encoding
Client Bundle Elimination:      Edge redirects download 0 KB of protected code
-------------------------------------------------------------
```

### Strategic Optimizations:
1. **Edge Middleware Matcher Filtering:**
   Never run Edge Middleware on static assets. Use negative lookahead matchers:
   `matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']`. This prevents middleware from executing on CSS, images, and fonts, slashing CDN compute costs.
2. **Intent-Driven Route Prefetching:**
   React Router and Next.js automatically prefetch linked route bundles when a user hovers over a `<Link>`. Ensure data prefetching is idempotent so hovering does not trigger unwanted database mutations.

---

## 14. Tradeoffs

| Architecture Choice | Advantages | Costs / Tradeoffs |
| :--- | :--- | :--- |
| **Edge Middleware (Next.js)** | Zero client bundle leakage; zero FOUC; sub-5ms redirection; eliminates client auth code. | Requires Edge-compatible hosting (Vercel, Cloudflare); cannot access Node.js native binary libraries. |
| **Client-Side Wrapper Components** | Works on static hosting (S3, GitHub Pages); simple React code; no server required. | Risk of FOUC; leaks protected JavaScript bundles to unauthorized clients; slower redirects. |
| **Angular Config Guards** | Strongly typed; centralized route table; mature lifecycle hooks out of the box. | Executes client-side; heavier framework bundle; requires Angular runtime initialization. |
| **Token-Mediating BFF** | 100% immune to client XSS token theft; tokens never enter the browser; HttpOnly cookies. | Requires maintaining a server/BFF tier; cannot run on purely static CDN hosting. |

---

## 15. Common Mistakes & Interview Traps

- **Trap 1: "Client-side route guards provide security."**
  *Why it fails:* "UI hiding is not security." If an unauthorized user inspects browser memory or reconstructs API endpoints, they can bypass any client-side guard. Security must always be enforced at the Edge Middleware and backend API boundary.
- **Trap 2: Forgetting to encode `returnUrl` in redirects.**
  *Why it fails:* Redirecting to `/login` without preserving the original destination forces the user to navigate back to their deep page manually after authenticating, destroying UX.
- **Trap 3: Running heavy database queries inside Next.js Edge Middleware.**
  *Why it fails:* Edge Middleware must complete in < 50ms. Making cross-region database queries from Edge Workers introduces severe network latency. Edge Middleware should only verify cryptographic cookies or check Edge KV caches.

---

## 16. Interview Questions & Architectural Answers

### Question 1 (Senior Level): How do you migrate an Angular `CanActivate` guard to a Next.js App Router application?
**Answer**:
1. **Perimeter Shift to Edge Middleware:** In Angular, `CanActivateFn` runs client-side inside the browser after the application boots. In Next.js, we migrate this logic to **Edge Middleware (`middleware.ts`)**.
2. **Cookie Verification at the Edge:** The middleware intercepts incoming requests at the CDN Edge before HTML generation or bundle download. It inspects the `__Host-session` cookie and verifies cryptographic signatures using the Web Cryptography API (`crypto.subtle`).
3. **Instant Redirection:** If unauthenticated, the middleware returns `NextResponse.redirect(new URL('/login', request.url))`. The browser receives an immediate HTTP 307 redirect, achieving zero layout flash (zero FOUC) and eliminating unauthorized bundle downloads.
4. **Defense-in-Depth:** For fine-grained role checks (RBAC), we supplement Edge Middleware with declarative checks inside Server Components and Server Actions before data operations execute.

### Question 2 (Lead Level): How do you implement the equivalent of Angular's `CanDeactivate` guard in React to protect users from losing unsaved form data?
**Answer**:
In modern React Router (v6.4+ / v7):
1. **The `useBlocker` Hook:** We utilize the native `useBlocker` hook:
   ```tsx
   const blocker = useBlocker(
     ({ currentLocation, nextLocation }) =>
       isFormDirty && currentLocation.pathname !== nextLocation.pathname
   );
   ```
2. **Controlled Modal Dialog:** When `blocker.state === 'blocked'`, the application renders an enterprise confirmation modal: "You have unsaved changes. Are you sure you want to leave?".
   - If the user confirms: `blocker.proceed()`.
   - If the user cancels: `blocker.reset()`.
3. **Browser Tab Close Protection:** Because `useBlocker` only intercepts client-side SPA navigation, we supplement it with a native `window.addEventListener('beforeunload', e => { if (isFormDirty) e.preventDefault(); })` inside `useEffect`, protecting users who accidentally close the browser tab or hit browser reload.

### Question 3 (Architect Level): How do you design an enterprise HTTP interception strategy in React when replacing Angular's `HttpInterceptor`?
**Answer**:
We employ a **Two-Tier Strategy based on Hosting Architecture**:
1. **Architecture A: Full-Stack / BFF Pattern (Recommended):**
   - We eliminate client-side token injection entirely.
   - The browser communicates with the Next.js / Node BFF using encrypted `HttpOnly; Secure; SameSite=Lax` session cookies.
   - The BFF acts as the **Token-Mediating Interceptor**: it validates the cookie, extracts internal OAuth bearer tokens from a secure server-side cache (Redis), and forwards requests to internal microservices with `Authorization: Bearer <JWT>`. This completely eliminates client-side XSS token theft.
2. **Architecture B: Pure SPA with External Gateway:**
   - We create an **Axios Instance or Fetch Wrapper (`ApiClient`)** configured with request and response interceptors.
   - *Request Interceptor:* Dynamically attaches the bearer token from secure memory and stamps distributed tracing headers (`traceparent`).
   - *Response Interceptor:* Intercepts HTTP 401s, uses a **Web Lock (`navigator.locks.request`)** to serialize a single background token refresh call, and replays queued requests transparently upon token renewal.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors)

### The "Perimeter Gatehouse vs Interior Bouncer" Anchor
- **Angular (`CanActivate`):** The interior bouncer standing in the lobby. The visitor already entered the building; the bouncer stops them at the VIP door and walks them back out.
- **Next.js (`Edge Middleware`):** The perimeter gatehouse at the property fence (CDN Edge). Checks credentials at the gate; if unapproved, the visitor is turned around 2 miles away. They never step foot on the property.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **FOUC (Flash of Unauthorized Content):** A brief visual glitch where a protected screen renders for milliseconds before a client-side redirect fires.
- **Edge Middleware:** Code running on lightweight V8 Isolates at CDN Points of Presence, intercepting requests before they reach origin servers.
- **`useBlocker`:** React Router hook that intercepts SPA navigation history transitions based on a predicate function.
- **Token-Mediating BFF:** An architecture where server-side backend-for-frontend layers manage raw OAuth tokens, shielding browsers behind encrypted session cookies.
- **Onion Architecture:** Design pattern where requests pass inward through a series of concentric interceptors, and responses pass back outward in reverse order.

---

## 19. Key Takeaways

1. **Move Guards to the Edge:** Replace client-side Angular `CanActivate` guards with Next.js Edge Middleware to eliminate FOUC and prevent protected bundle leakage.
2. **`useBlocker` for Unsaved Forms:** Replicate Angular `CanDeactivate` using React Router's `useBlocker` hook paired with `window.onbeforeunload`.
3. **Prefer Token-Mediating BFFs:** Eliminate client-side JWT handling in interceptors; let server BFFs attach bearer tokens using secure `HttpOnly` session cookies.
4. **Filter Middleware Matchers:** Always use negative lookaheads in Edge Middleware matchers to bypass static assets and prevent unnecessary compute overhead.
5. **Serialize Token Refreshes:** Always use mutex locks when handling 401 interceptor refreshes to avoid Thundering Herd token family invalidations.

---

## 20. Revision Sheet

- **Q: What is the primary architectural advantage of Next.js Edge Middleware over Angular `CanActivate` guards?**
  *A:* Edge Middleware evaluates at the CDN boundary before HTML or JavaScript bundles are downloaded, eliminating unauthorized client-side FOUC and reducing client bundle exposure.
- **Q: How do you intercept SPA navigation when a user has unsaved form changes in React Router?**
  *A:* Using the `useBlocker()` hook to block history transitions and show a confirmation modal.
- **Q: What React feature replaces Angular's `ResolveFn` in Next.js App Router?**
  *A:* Async React Server Components (`async function Page()`), which fetch data directly on the server before streaming HTML to the client.
- **Q: What is the risk of handling token refreshes inside client-side HTTP interceptors without a mutex?**
  *A:* Multiple concurrent 401s will trigger multiple simultaneous refresh calls, triggering Refresh Token Rotation (RTR) fraud detection and invalidating the user's session.
- **Q: What HTTP status code is used by Edge Middleware for temporary authentication redirects?**
  *A:* HTTP 307 Temporary Redirect (preserves HTTP method).
