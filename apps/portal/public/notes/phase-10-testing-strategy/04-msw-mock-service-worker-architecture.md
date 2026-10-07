# Phase 10 — Topic 04: Mock Service Worker (MSW v2) Network Mocking Architecture

## 1. Why This Topic Exists
In naive frontend testing, mocking HTTP calls relies on module mocking: developers invoke `vi.mock('axios')` or stub global `fetch`.

This module-level mocking approach introduces fatal architectural flaws:
1. **Module Tight Coupling**: The moment a team refactors an API client from `axios` to native `fetch`, or swaps to `@tanstack/react-query` with a custom transport, every test breaks because the mock was tied to the internal library rather than the network contract.
2. **Missing Real Network Logic**: Module mocks bypass headers, authentication interceptors, query parameter serialization, status code handling, and response parsing. Tests pass in CI with mocked JSON objects, but production fails because an HTTP 204 No Content response broke the JSON deserializer.
3. **Fragmented Mock Duplication**: Teams maintain separate mocks for unit tests (Jest/Vitest), separate mocks for component previews (Storybook), and separate mocks for local development before the backend is deployed.

**Mock Service Worker (MSW v2)** revolutionized API mocking by intercepting requests at the **network level**. In the browser, it uses the standard Service Worker API; in Node.js (Vitest), it intercepts socket-level HTTP requests via `@mswjs/interceptors`.

Because MSW intercepts the actual network traffic, application code remains 100% agnostic to the fact that mocking is occurring. Architects must understand MSW v2’s handler architecture, dynamic overrides, and cross-environment reusability.

---

## 2. Learning Objectives
By completing this chapter, you will be able to:
- Contrast network-level request interception (MSW) with brittle module-level mocking (`vi.mock('axios')`).
- Master MSW v2 syntax: declarative `http` and `graphql` handlers, `HttpResponse.json()`, and status codes.
- Understand the dual-runtime architecture: Service Worker interception in browser runtimes vs. Node.js low-level socket interception (`msw/node`).
- Simulate realistic network failures: HTTP 401/403 auth errors, 500 internal errors, network disconnects (`HttpResponse.error()`), and latency jitter (`delay()`).
- Implement dynamic runtime overrides using `server.use()` to test edge cases in individual test files without affecting sibling suites.
- Share a single, authoritative mock handler registry across **Vitest tests**, **Storybook stories**, and **local development**.

---

## 3. Historical Evolution
```
+---------------------------------------------------------------------------------------------------+
| 2012 - 2016: Ad-Hoc Global Stubbing (sinon.stub, window.fetch overwrite)                          |
| Global `fetch` or `XMLHttpRequest` overwritten with mock functions. Brittle, prone to test bleed,|
| and bypassed real browser serialization.                                                          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2017 - 2020: Module Mocking (axios-mock-adapter, jest.mock('axios'))                              |
| Mocked specific HTTP client libraries. Created library lock-in: refactoring HTTP transport       |
| broke all tests. Required maintaining separate mocks for tests and Storybook.                     |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2020 - 2023: MSW v1 (The Service Worker Network Standard)                                         |
| Intercepted at network level via Service Worker in browser and Node HTTP module patching.         |
| Solved client coupling. Syntax used legacy `res(ctx.json(...))` response composition.             |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2023 - Present: MSW v2 (Web Standards & Fetch API Alignment)                                      |
| Re-architected on modern W3C standards: native `Request` and `Response` objects.                 |
| Standard `http` namespace, `HttpResponse.json()`, and full Node.js 18+ undici fetch alignment.    |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)
Think of network mocking architecture through physical engineering analogs:

### Analogy 1: The Kitchen Order Interceptor (Module Mocking vs. MSW)
Imagine a restaurant kitchen:
- **Module Mocking (`vi.mock('axios')`)**: You walk up to the head chef and tie their hands behind their back, replacing their hands with rubber mannequin hands that hold a pre-cooked plastic steak. The chef never reads the order slip, never lights the stove, and never tests the kitchen ventilation.
- **Network Interception (MSW)**: The chef cooks normally. However, at the kitchen pickup window (the network boundary), a courier intercepts the ticket and provides freshly prepared food without the chef ever knowing it was supplied by a staging kitchen. The chef's entire workflow executes normally: reading orders, seasoning, cooking, and plating.

### Analogy 2: The Railroad Signal Switch
When an electric train leaves the station on Track 4, it uses standard high-voltage rails.
MSW is an automated track switch placed outside the station gates:
- When the train requests `https://api.acme.com/users`, the switch smoothly diverts the electrical signal to a local mock siding (`mockHandler`).
- If an unhandled request occurs (`https://cdn.fonts.com`), the switch leaves the rail open, passing the request through to the real internet.
The train engine (your React app) never knows a switch diverted the track; it runs on standard steel rails.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### MSW Dual-Runtime Architecture: Browser vs. Node.js

```
BROWSER ENVIRONMENT (Storybook / Local Dev)
+-------------------------------------------------------------------------+
| [ Browser Main Thread: React App ]                                      |
| window.fetch('/api/users')                                              |
|            |                                                            |
|            v                                                            |
| [ Native Service Worker (mockServiceWorker.js) ]                        |
| Intercepts 'fetch' event at OS/Browser network layer                    |
|            |                                                            |
|            +---> Matches MSW Handler -> Returns Mock HttpResponse       |
|            +---> Unmatched -> Passes to real backend network            |
+-------------------------------------------------------------------------+

NODE.JS RUNTIME (Vitest / Test Runner)
+-------------------------------------------------------------------------+
| [ Test Runner Process: Vitest ]                                         |
| fetch('/api/users') or axios.get('/api/users')                          |
|            |                                                            |
|            v                                                            |
| [ @mswjs/interceptors ]                                                 |
| Monkey-patches Node.js low-level sockets:                               |
| - 'http.ClientRequest'                                                  |
| - 'https.ClientRequest'                                                 |
| - globalThis.fetch (undici)                                             |
|            |                                                            |
|            +---> Returns synthetic standard Web 'Response' object       |
+-------------------------------------------------------------------------+
```

### MSW v2 Web Standard Request Flow
In MSW v2, all handlers receive standard W3C `Request` objects and return standard W3C `Response` objects:

```typescript
http.get('/api/users/:id', async ({ request, params, cookies }) => {
  // 'request' is an instance of standard Request
  const authHeader = request.headers.get('Authorization');
  const { id } = params;

  if (!authHeader) {
    return new HttpResponse(null, { status: 401 });
  }

  // Returns standard Response wrapper
  return HttpResponse.json({ id, name: 'Alice' }, { status: 200 });
});
```

---

## 6. Runtime Flow & Execution Traces

### Trace: Request Interception and Test-Specific Override
```
Step 1: Test starts. Vitest loads setup file:
        const server = setupServer(...commonHandlers);
        server.listen({ onUnhandledRequest: 'error' });

Step 2: Specific test requires simulating an HTTP 500 error:
        server.use(
          http.get('/api/billing', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

Step 3: Component renders and executes:
        axios.get('/api/billing').catch(err => setHasError(true));

Step 4: Interceptor catches socket invocation:
        - Matches dynamic override registered in Step 2.
        - Synthesizes HTTP 500 Response.
        - Axios receives real HTTP 500 status code and throws AxiosError.

Step 5: Component error state activates:
        RTL asserts: expect(await screen.findByRole('alert')).toBeInTheDocument();

Step 6: afterEach runs:
        server.resetHandlers();
        // Dynamic HTTP 500 override is destroyed; returns to commonHandlers.
```

---

## 7. Memory Model & Interceptor Registry Layout

```
NODE.JS PROCESS HEAP (MSW INTERCEPTOR REGISTRY)

+--------------------------------------------------------------------------+
| MSW Server Instance (0x00FE99)                                           |
|                                                                          |
| Active Handler Stack (Array):                                            |
| [0] Dynamic Override (Pushed by server.use in Test #4)                    |
|     Path: "/api/billing" | Method: "GET" | Resolver: [Function: HTTP 500]|
|                                                                          |
| [1] Base Handler                                                         |
|     Path: "/api/billing" | Method: "GET" | Resolver: [Function: 200 JSON]|
|                                                                          |
| [2] Base Handler                                                         |
|     Path: "/api/users/:id" | Method: "GET" | Resolver: [Function]        |
|                                                                          |
| Socket Patch:                                                            |
| globalThis.fetch -> Wrapped with MSW async interceptor pointer           |
+--------------------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### The Unified Handler Architecture across Workflows
```
               [ shared/mocks/handlers.ts ]
          (Single Source of Truth Mock Registry)
                     /         |         \
                    /          |          \
                   v           v           v
          [ Vitest Tests ]  [ Storybook ]  [ Local Dev (Vite) ]
          setupServer()     mswLoader      setupWorker()
          Node socket       Service Worker Service Worker
          interception      interception   interception
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [TestingLab.tsx](../../apps/portal/src/features/visualizers/topic-10-testing/TestingLab.tsx) | Live in Portal: topic-10-testing

### Pattern 1: Authoritative Mock Handlers (`src/mocks/handlers.ts`)
```typescript
import { http, HttpResponse, delay } from 'msw';

export interface UserDTO {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export const handlers = [
  // 1. REST GET with route parameters
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json<UserDTO>({
      id: String(id),
      name: 'Dr. Jane Foster',
      role: 'admin'
    });
  }),

  // 2. REST POST with request body parsing & latency simulation
  http.post('/api/users', async ({ request }) => {
    // Standard async JSON parsing
    const body = (await request.json()) as { name: string; role: 'admin' | 'user' };
    
    // Simulate real network delay if testing spinners
    await delay(50);

    return HttpResponse.json<UserDTO>(
      {
        id: 'user-new-123',
        name: body.name,
        role: body.role
      },
      { status: 201 }
    );
  }),

  // 3. Simulating Network Disconnect
  http.get('/api/health-offline', () => {
    return HttpResponse.error(); // Simulates network drop / CORS error
  })
];
```

### Pattern 2: Global Test Server Setup (`src/mocks/server.ts`)
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

// Start interceptor before all tests
beforeAll(() => {
  // 'error' enforces that any unhandled network request fails the test immediately
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any per-test runtime overrides after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up and restore original network sockets
afterAll(() => {
  server.close();
});
```

### Pattern 3: Per-Test Dynamic Error Override (`server.use`)
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { CheckoutButton } from './CheckoutButton';

test('renders accessible error toast when server returns 402 Payment Required', async () => {
  const user = userEvent.setup();

  // Dynamically override handler for this test only
  server.use(
    http.post('/api/checkout', () => {
      return HttpResponse.json(
        { errorCode: 'CARD_DECLINED', message: 'Insufficient funds' },
        { status: 402 }
      );
    })
  );

  render(<CheckoutButton amount={9900} />);
  await user.click(screen.getByRole('button', { name: /pay/i }));

  // Verify UI handled HTTP 402 gracefully
  const errorAlert = await screen.findByRole('alert');
  expect(errorAlert).toHaveTextContent(/insufficient funds/i);
});
```

---

## 10. Angular Comparison
For an engineer transitioning from enterprise Angular:

| Architectural Concept | Enterprise Angular Testing | Modern React with MSW |
| :--- | :--- | :--- |
| **HTTP Mocking Mechanism** | `HttpClientTestingModule` & `HttpTestingController`. | **Mock Service Worker (MSW v2)**. |
| **Interception Level** | Angular dependency injection layer (`HttpHandler` chain). | Operating System / Browser Network Socket layer. |
| **Mock Scoping** | Manual flush per test: `httpMock.expectOne('/api').flush(data)`. | Declarative route handlers returning `HttpResponse.json()`. |
| **Cross-Tool Sharing** | Mocks only work inside Angular Karma/Jest unit tests. | Same handlers work in Vitest, Storybook, and local Vite dev. |

---

## 11. .NET Comparison
For a Senior .NET / ASP.NET Core Architect:

| Architectural Concept | .NET / C# Testing | React / MSW Testing |
| :--- | :--- | :--- |
| **HTTP Interception** | `DelegatingHandler` / `HttpMessageHandler` in `HttpClient`. | Service Worker in browser, `@mswjs/interceptors` in Node. |
| **Mocking Library** | `RichardSzalay.MockHttp` or WireMock.NET. | Mock Service Worker (MSW v2). |
| **Response Syntax** | `mockHttp.When("/api").Respond("application/json", "{...}")`. | `http.get('/api', () => HttpResponse.json({...}))`. |
| **Integration Server** | `TestServer` spinning up in-memory ASP.NET middleware pipeline. | Node socket monkey-patch returning W3C `Response` objects. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The Silent Unhandled Request Threat
- If MSW is initialized with default settings, unmatched requests will simply fall through to the network.
- In CI environments without internet access, these unhandled requests trigger cryptic DNS lookup errors or 30-second socket timeouts that cause random test flakiness.
- **Enterprise Mitigation**: Always initialize MSW with strict enforcement:
  ```typescript
  server.listen({ onUnhandledRequest: 'error' });
  ```
  Any code triggering an unregistered network endpoint immediately fails the test with the exact URL and method displayed in the error trace.

### Mock Drift vs. Real Backend APIs
- A danger of mock-driven testing is **Mock Drift**: the backend API updates a schema (e.g., changing `status: "active"` to `status: "ACTIVE"`), but the frontend MSW mock continues returning `"active"`.
- Tests pass in CI, but production breaks immediately upon deployment.
- **Enterprise Mitigation**: Bind MSW response handlers to TypeScript types generated directly from OpenAPI / Swagger backend specs, or validate mock payloads with **Zod schemas**.

---

## 13. Performance Considerations
- **Avoid Heavy Artificial Delays in Unit Tests**: While `await delay(1000)` is useful in Storybook to observe loading skeletons, keeping artificial delays in automated test suites adds minutes to CI runs. Omit delays or set `delay(0)` in test suites.
- **Memory Footprint of Node Interceptors**: MSW intercepts requests via socket wrapping. Calling `server.resetHandlers()` in `afterEach()` ensures dynamically added route handlers from `server.use()` are purged from memory, preventing memory leaks across large suites.

---

## 14. Tradeoffs

| Approach | Primary Benefit | Operational Cost / Drawback |
| :--- | :--- | :--- |
| **MSW Network Mocking** | 100% decoupling from API client library; shared across tests, Storybook, and dev. | Requires learning MSW v2 syntax; small setup overhead. |
| **Module Mocking (`vi.mock('axios')`)** | Trivial one-line setup for basic tests. | Brittle; breaks on refactoring; bypasses network headers and response parsing. |
| **Live Staging Backend** | 100% authentic integration testing against real database. | Slow; flaky; state collisions across concurrent CI builds; requires network access. |

---

## 15. Common Mistakes & Interview Traps
- **Trap 1: Using MSW v1 syntax in modern projects.**
  - *Symptom*: Calling `rest.get()` or `res(ctx.json())` throws deprecation or runtime errors in MSW v2.
  - *Fix*: Use MSW v2: `http.get()` and `HttpResponse.json()`.
- **Trap 2: Forgetting `server.resetHandlers()` in `afterEach`.**
  - *Symptom*: A per-test error mock (`server.use(http.get(..., 500))`) persists into subsequent test files, causing unrelated tests to fail.
  - *Fix*: Always call `server.resetHandlers()` in `afterEach()`.
- **Trap 3: Not setting `onUnhandledRequest: 'error'`.**
  - *Symptom*: Typo in URL (`/api/usr` instead of `/api/user`) falls through silently, resulting in an obscure timeout or unhandled exception.
  - *Fix*: Pass `{ onUnhandledRequest: 'error' }` to `server.listen()`.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior Level): Why is network-level mocking with MSW superior to mocking `fetch` or `axios` with `vi.mock()`?
**Answer**:
Mocking an HTTP client library (`vi.mock('axios')`) introduces three architectural defects:
1. **Implementation Coupling**: The test suite becomes tightly coupled to the specific HTTP client. If you refactor to native `fetch`, or a third-party library inside a dependency uses `fetch` while you mock `axios`, all tests break.
2. **Loss of Transport Realism**: Module mocks bypass network interceptors, authentication header injection, query string encoding, and HTTP status code branches.
3. **Mock Duplication**: Module mocks cannot be reused in Storybook or local development.
MSW operates at the **network protocol level** (Service Worker in browsers, socket interception in Node). The application executes its real networking code, interceptors, and error handlers unmodified. Furthermore, the exact same handlers run in Vitest, Storybook component documentation, and local developer setups.

### Question 2 (Lead Level): How do you test error handling and edge cases for a specific test without polluting the global mock handler registry?
**Answer**:
We use MSW’s **`server.use()` runtime override pattern**:
1. We define standard success responses in a global `handlers.ts` array loaded by `setupServer(...handlers)`.
2. In a test file validating an edge case (e.g. HTTP 403 Forbidden or network disconnect), we call `server.use()` inside that specific test:
   ```typescript
   server.use(
     http.get('/api/account', () => {
       return new HttpResponse(null, { status: 403 });
     })
   );
   ```
3. `server.use()` prepends this handler to the front of the active matching stack, superseding the base handler for subsequent requests.
4. In the global `afterEach()` hook, we call `server.resetHandlers()`. This resets the handler stack back to its original baseline, guaranteeing zero test pollution across files.

### Question 3 (Architect Level): How do you guarantee that MSW mock handlers do not drift out of sync with evolving backend production APIs?
**Answer**:
To eliminate **Mock Drift** across enterprise teams:
1. **Contract-Driven Generation (OpenAPI / TypeSpec)**: The backend engineering team maintains authoritative OpenAPI 3.1 specifications. In CI, we use tools like `msw-auto-mock` or `openapi-typescript` to generate TypeScript types and MSW response templates directly from the OpenAPI schema.
2. **Runtime Contract Validation (Zod)**: In our mock handlers, we validate mock responses against domain Zod schemas. If the schema changes and the mock does not match, the test fails immediately.
3. **Consumer-Driven Contract Testing (Pact)**: For mission-critical service boundaries, we run Pact contract verification tests in CI. The consumer (frontend MSW interactions) publishes contract expectations to a Pact Broker; the backend CI validates its real controller endpoints against the contract before releasing new API versions.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Kitchen Pickup Window" Rule
- **Never tie the chef's hands** (Never mock the internal API client).
- **Intercept the dish at the kitchen pickup window** (Intercept at the network boundary).
- If you intercept at the window, the chef cooks normally, seasonings are applied, and recipes can change without redesigning the dining room.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
- **MSW (Mock Service Worker)**: An API mocking library that intercepts requests at the network level using Service Workers in the browser and socket interception in Node.
- **HttpResponse.json()**: MSW v2 standard factory method creating a W3C-compliant Response object with serialized JSON.
- **server.use()**: Method to dynamically prepend test-specific request handlers at runtime.
- **server.resetHandlers()**: Method to purge runtime overrides and restore the initial handler stack.
- **Mock Drift**: The discrepancy that occurs over time when mock data diverges from real production API contracts.

---

## 19. Key Takeaways
- Intercept HTTP requests at the network level (MSW), never at the module level (`vi.mock('axios')`).
- MSW v2 adheres strictly to standard Fetch API `Request` and `Response` objects.
- Use `server.use()` to test edge-case errors (401, 500, network disconnects) in individual tests without state pollution.
- Always call `server.resetHandlers()` in `afterEach()` and configure `{ onUnhandledRequest: 'error' }`.
- Share identical mock handlers across Vitest tests, Storybook previews, and local development.

---

## 20. Revision Sheet
- **Q: How does MSW intercept requests in the browser?**
  *A:* Via the native browser Service Worker API (`mockServiceWorker.js`).
- **Q: How does MSW intercept requests in Node.js (Vitest)?**
  *A:* Via `@mswjs/interceptors`, which intercepts low-level Node.js HTTP/HTTPS sockets and global `fetch`.
- **Q: What is the MSW v2 syntax for returning a JSON response with status 201?**
  *A:* `HttpResponse.json(data, { status: 201 })`.
- **Q: What method temporarily overrides a mock handler for a single test?**
  *A:* `server.use(...)`.
- **Q: How do you prevent unexpected unhandled network calls from passing through during tests?**
  *A:* Pass `{ onUnhandledRequest: 'error' }` to `server.listen()`.
