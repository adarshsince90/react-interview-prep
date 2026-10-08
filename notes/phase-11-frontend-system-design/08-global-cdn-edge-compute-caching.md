# 08: System Design: Global CDN Edge Compute & Caching Strategy

---

## 1. Why This Topic Exists

The laws of physics impose an immutable constraint on web application performance: **the speed of light through fiber-optic glass**. A data packet traveling from Sydney, Australia to an origin server in Virginia, USA takes approximately **160 milliseconds** for a single round-trip (RTT) under ideal physical conditions. When you compound TCP 3-way handshakes, TLS 1.3 cryptographic key exchanges, and multi-hop routing, a user on the opposite side of the planet waits upwards of **600 to 1,000ms** before receiving a single byte of HTML.

To deliver sub-second global web experiences, enterprises cannot route every request back to a centralized cloud origin. Instead, modern web architecture relies on a globally distributed network of **Content Delivery Network (CDN) Points of Presence (PoPs)** coupled with **Edge Compute runtimes** (Cloudflare Workers, Vercel Edge Runtime, Fastly Compute, AWS CloudFront).

However, modern Edge engineering is far more complex than caching static image files:
1. **The Dynamic Personalization Paradox:** Modern applications are personalized (user profiles, geo-pricing, A/B testing flags, authentication status). If you naively cache an HTML page at the CDN Edge, User B sees User A's private credit card data. Conversely, if you mark all HTML as `Cache-Control: private, no-store`, you sacrifice edge caching entirely, forcing every user back to the distant origin.
2. **Cache Invalidation Topologies:** "There are only two hard things in Computer Science: cache invalidation and naming things." In an enterprise with millions of dynamic product pages, purging caches by URL is too slow. Platforms must leverage **Surrogate-Keys (Cache-Tags)** to invalidate thousands of globally distributed edge nodes in under 150ms.
3. **Edge Compute vs Origin Balance:** Running compute directly at the Edge using V8 Isolates enables sub-5ms cold starts for auth verification, geo-routing, and HTML rewriting. But running heavy business logic at the Edge risks distributed database latency penalties.

Mastering edge compute and HTTP caching directives is mandatory for any frontend architect building planetary-scale web applications.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Architect a multi-tier global caching topology using Edge PoPs, Anycast routing, and Origin Shielding.
- Master HTTP/1.1 and RFC 5861 caching directives (`s-maxage`, `stale-while-revalidate`, `stale-if-error`, `immutable`).
- Leverage Edge Compute runtimes (V8 Isolates) for sub-5ms authentication validation, geo-redirection, and A/B test routing.
- Execute dynamic HTML transformation at the Edge using the streaming `HTMLRewriter` API without breaking origin caches.
- Implement fine-grained, instantaneous cache invalidation using **Surrogate-Keys / Cache-Tags**.
- Prevent catastrophic production failures including CDN Cache Poisoning and Personally Identifiable Information (PII) leakage.

---

## 3. Historical Evolution

The architecture of edge delivery has evolved across four distinct eras:

1. **The Static Asset CDN Era (1998–2010):**
   Early CDNs (Akamai, early Limelight) were used strictly as dumb distributed hard drives for static files (`.jpg`, `.css`, `.js`). Dynamic HTML, REST APIs, and application logic remained locked to centralized data center origins.
2. **The Programmable VCL & Reverse Proxy Era (2011–2017):**
   Platforms like Fastly popularized Varnish Configuration Language (VCL), allowing engineers to write programmable caching logic at the edge. However, VCL was domain-specific, difficult to test locally, and separated from frontend JavaScript codebases.
3. **The Edge Serverless V8 Isolate Era (2018–2022):**
   Cloudflare launched Cloudflare Workers, introducing lightweight V8 Isolates instead of heavy Node.js Docker containers. Cold starts dropped from 1,000ms to **less than 5ms**. Next.js introduced Edge Middleware, enabling frontend engineers to write TypeScript at the CDN edge within the same repository as their React components.
4. **The Full-Stack Edge & Streaming Personalization Era (2023–Present):**
   Modern edge architectures blend server-side rendering, streaming HTML, and edge data persistence (Cloudflare D1, KV, Upstash Redis). Edge runtimes stream personalized React Server Components (RSC) while caching static UI shells at global edge PoPs via Cache-Tags.

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Central Library, Neighborhood Bookmobiles, and Custom Stampers

Imagine a massive National Library located in Washington, D.C.:
- **The Central Library (The Origin Server):** Holds the master printing presses and ancient archives. If an elementary school student in Tokyo wants to read a popular children's book, flying to Washington, D.C. takes 14 hours (160ms network round-trip).
- **The Neighborhood Bookmobile (The Global CDN Edge PoP):** The library operates 300 bookmobiles stationed in every major city worldwide (Anycast routing). When a child in Tokyo requests the popular book, they walk two minutes to the local bookmobile and read the cached copy instantly (2ms edge latency).
- **The Delivery Truck & Expiration Tag (`Cache-Control: s-maxage`):** The central library stamps books: "Valid for 1 week." After a week, the bookmobile driver checks with headquarters to see if a revised edition has been published.
- **The Borrow-While-Reprinting Rule (`stale-while-revalidate`):** If a child wants a book whose stamp just expired, the bookmobile clerk hands them the slightly older copy *immediately* (zero wait time), while quietly radioing headquarters in the background to order the new edition for tomorrow.
- **The Edge Book Stamper (Edge Compute & HTMLRewriter):** The bookmobile clerk has a rapid ink stamp. Before handing the generic book to the child, the clerk stamps the child's local name and neighborhood library card number onto the cover (Edge Personalization), ensuring the interior book remains universal and cached for everyone.

---

## 5. Internal Working & Engine Architecture (Layer 2)

A planetary-scale CDN Edge architecture operates across three distinct caching and execution tiers:

```
[ GLOBAL CLIENTS ] (Tokyo, London, São Paulo, New York)
        |
        v  (Anycast DNS Routing -> Routes to closest physical PoP)
+-------------------------------------------------------------+
| 1. CDN EDGE POP (Points of Presence - 300+ Cities)          |
|                                                             |
|   +-------------------------------------------------------+ |
|   | EDGE COMPUTE (V8 Isolate Runtime - <5ms Cold Start)   | |
|   |  - Authenticates session cookie / verifies JWT        | |
|   |  - Evaluates A/B testing cookies & geo-location flags  | |
|   |  - Executes URL rewrites and header mutations         | |
|   +-------------------------------------------------------+ |
|                               |                             |
|                               v                             |
|   +-------------------------------------------------------+ |
|   | EDGE HTTP CACHE STORE (SSD / NVMe In-Memory Cache)    | |
|   |  - Evaluates Cache-Control: s-maxage, SWR directives  | |
|   |  - Cache-Tag / Surrogate-Key indexing table           | |
|   |  - HIT: Returns 200 OK directly (< 5ms response)      | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
        |
        | (On Cache MISS or SWR background revalidation)
        v
+-------------------------------------------------------------+
| 2. ORIGIN SHIELD / REGIONAL TIER CACHE                      |
|    - Concentrates cache misses from 300 Edge PoPs           |
|    - Request Coalescing (Collapses 1,000 requests into 1)   |
|    - Shields primary backend database from Thundering Herds |
+-------------------------------------------------------------+
        |
        v (Private Cloud Interconnect / AWS Direct Connect)
+-------------------------------------------------------------+
| 3. PRIMARY CLOUD ORIGIN (Next.js Node.js / ASP.NET Core)    |
|    - Generates dynamic HTML / RSC Flight payloads           |
|    - Attaches Cache-Control & Surrogate-Key headers         |
+-------------------------------------------------------------+
```

### 1. Anycast Routing & Edge PoPs
When a user queries `example.com`, Anycast DNS advertises the exact same IP address from hundreds of data centers globally. The internet's Border Gateway Protocol (BGP) automatically routes the user's TCP packets to the **topologically nearest CDN PoP** (typically < 10ms away).

### 2. The HTTP Caching Directive Contract
Edge caches evaluate specific response headers emitted by the origin server:
- `public`: Indicates the response may be cached by shared CDN edge caches.
- `private`: Strictly forbids shared CDN caching. Only the individual user's browser may cache the response.
- `max-age=60`: Browser client must consider response fresh for 60 seconds.
- `s-maxage=3600`: **Shared CDN Edge Caches** consider response fresh for 1 hour, ignoring the browser's shorter `max-age`.
- `stale-while-revalidate=86400` (RFC 5861): If a request arrives after `s-maxage` expires, the Edge **instantly serves the stale cached response**, then asynchronously fetches a fresh copy from origin in the background.
- `immutable`: Informs browsers that the file content will never change (used for hashed static bundles: `main.a8f9c1.js`). The browser never sends conditional `If-None-Match` requests.

### 3. V8 Isolates vs Node.js Containers
Edge Compute does not run heavy Docker containers or full Node.js processes. Instead, platforms run **V8 Isolates**:
- An Isolate is a discrete instance of Google's V8 engine with its own memory heap.
- Thousands of Isolates run inside a single host process.
- **Cold start latency is under 5ms** (vs 500–2,000ms for Docker/Node containers).
- Memory footprint is tiny (~5 MB per isolate vs 150 MB for Node.js).
- Executes modern Web Standard APIs (`fetch`, `Request`, `Response`, `TransformStream`, `crypto`).

### 4. Surrogate-Keys / Cache-Tags
Instead of tracking URL strings, origins tag responses with domain identifiers:
```http
HTTP/1.1 200 OK
Cache-Control: public, s-maxage=31536000, stale-while-revalidate=60
Cache-Tag: product_1092, category_footwear, merchant_nike
```
When an administrator updates the price of product 1092, the backend makes an authenticated API call to the CDN: `POST /purge { tags: ["product_1092"] }`. Within 150ms, all 300 edge data centers globally purge or mark that specific product as stale, while preserving all other cached catalog pages.

---

## 6. Runtime Flow & Execution Traces

Let us trace a user loading a product page using `stale-while-revalidate` (SWR) where the edge cache has just expired:

```
Time   Actor              Action                                           Latency
0.0ms  User Browser       GET /products/running-shoe                       -
2.1ms  Edge PoP (London)  Receives request; inspects Edge SSD Cache        -
2.5ms  Edge Cache         Found entry! (s-maxage expired 4 mins ago)       -
2.6ms  Edge Cache         Detects stale-while-revalidate=86400 is valid    -
2.7ms  Edge PoP           RETURNS STALE 200 OK TO BROWSER IMMEDIATELY       2.7ms (Instant!)
2.8ms  Edge PoP (Worker)  Spawns asynchronous background revalidation task -
3.0ms  Edge Worker        Dispatches background fetch to Origin (US-East)  -
85.0ms Origin Server      Generates fresh HTML with updated inventory      -
165ms  Edge Worker        Receives fresh response; updates Edge Cache      -
166ms  Edge Cache         Fresh version stored for all subsequent users    -
```

**Key Architectural Invariant:** The London user received an instant, sub-3ms response because the Edge served the stale cache immediately. The origin was called completely out-of-band in the background.

---

## 7. Memory Model & Heap Layout

```
V8 ISOLATE AT THE CDN EDGE POP:
+---------------------------------------------------------------+
| V8 ISOLATE INSTANCE (Capped at 128 MB RAM)                    |
|                                                               |
|  [ Request Context ]                                          |
|    ├── URL: "https://shop.com/products/shoe"                  |
|    ├── Geo-Location Header: { country: "GB", city: "London" } |
|    └── User-Agent: Modern Mobile Safari                       |
|                                                               |
|  [ Lightweight Middleware Logic ]                             |
|    ├── JWT Verification (Web Crypto HMAC-SHA256)              |
|    └── A/B Experiment Cookie Evaluator (Deterministic Hash)   |
+---------------------------------------------------------------+
| EDGE POP LOCAL STORAGE ENGINE (Off JS Heap)                   |
|                                                               |
|  [ NVMe / SSD Cache Tier ]                                    |
|    ├── Cached HTML Documents (Compressed Brotli)              |
|    ├── Tag Invalidation Map (Inverted Index of Cache-Tags)    |
|    └── Origin Shield Request Collapser Locks                  |
+---------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### Dynamic Edge Personalization with HTMLRewriter

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Browser (London)<br/>Visits /dashboard with JWT cookie
    participant Edge as CDN Edge PoP (London)<br/>V8 Isolate + SSD Cache
    participant Origin as Origin Server (Virginia)<br/>Static Shell with Placeholders

    Browser->>Edge: 1. GET /dashboard (Cookie: auth_token=jwt_xyz)
    Note over Edge: 2. Cache HIT! Reads generic cached HTML shell<br/>3. Web Crypto verifies JWT -> user: "Adarsh"
    Note over Edge: 4. HTMLRewriter streaming parser rewrites on-the-fly:<br/>&lt;span id="user"&gt;Guest&lt;/span&gt; -> &lt;span id="user"&gt;Adarsh&lt;/span&gt;
    Edge-->>Browser: 5. Streams personalized HTML directly to client (&lt; 5ms)
    Note over Edge,Origin: Zero origin roundtrip required! Origin remains idle in Virginia.
```

<details className="raw-schematic-details">
<summary>📄 View Raw ASCII Schematic</summary>

```
BROWSER (London)                     CDN EDGE POP (London)               ORIGIN SERVER (Virginia)
+--------------+                   +----------------------+             +-----------------------+
|              |                   |                      |             |                       |
|  User visits |                   |  1. Checks Cache     |             |  Origin holds static  |
|  /dashboard  |                   |     HIT! (Cached     |             |  template with        |
|              |                   |     generic shell)   |             |  placeholders:        |
|              |                   |                      |             |  <span id="user">     |
+--------------+                   +----------------------+             +-----------------------+
       |                                      |
       | 1. GET /dashboard                    |
       |    Cookie: auth_token=jwt_xyz        |
       |------------------------------------->|
       |                                      | 2. Edge V8 Isolate verifies JWT
       |                                      |    Extracts user: "Adarsh"
       |                                      |
       |                                      | 3. HTMLRewriter intercepts cached HTML stream
       |                                      |    Transforms:
       |                                      |    <span id="user">Guest</span>
       |                                      |    into:
       |                                      |    <span id="user">Adarsh</span>
       |                                      |
       | 4. Streams Personalized HTML (< 5ms) |
       |<-------------------------------------|
```

</details>

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Production Implementation: Edge Middleware & HTMLRewriter Engine

Below is a complete, production-ready Cloudflare Worker / Vercel Edge script demonstrating edge cookie authentication, streaming HTML rewriting, and Cache-Tag emission:

#### 1. Edge Middleware with `HTMLRewriter` (`edgeWorker.ts`)

```typescript
// edgeWorker.ts - High-Speed Edge Personalization & Caching Worker

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Bypass Edge Cache for API mutations
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // 2. Extract Authentication & Geo Context
    const cookieHeader = request.headers.get('Cookie') || '';
    const sessionMatch = cookieHeader.match(/session_user=([^;]+)/);
    const userName = sessionMatch ? decodeURIComponent(sessionMatch[1]) : null;
    const country = request.headers.get('cf-ipcountry') || 'US';

    // 3. Check Edge Cache for the Universal Page Shell
    const cache = (caches as any).default;
    const cacheKey = new Request(url.origin + url.pathname, request);
    let cachedResponse = await cache.match(cacheKey);

    if (!cachedResponse) {
      // Cache Miss: Fetch from Central Origin
      const originResponse = await fetch(request);

      // Clone response to populate cache while preserving streaming to client
      cachedResponse = new Response(originResponse.body, originResponse);

      // Enforce Edge SWR Caching Directives
      cachedResponse.headers.set(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=86400'
      );
      cachedResponse.headers.set('Cache-Tag', 'page_home, site_shell');

      // Asynchronously store in edge cache
      ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
    }

    // 4. Dynamic Edge Personalization via Streaming HTMLRewriter
    // Modifies HTML stream on the fly without breaking edge cache purity!
    const rewriter = new HTMLRewriter()
      .on('#user-greeting', {
        element(el) {
          if (userName) {
            el.setInnerContent(`Welcome back, ${userName}!`);
          } else {
            el.setInnerContent('<a href="/login">Sign In</a>', { html: true });
          }
        },
      })
      .on('#geo-banner', {
        element(el) {
          if (country === 'GB') {
            el.setInnerContent('Free shipping to the United Kingdom on orders over £50!');
          } else {
            el.setInnerContent('Global express shipping available.');
          }
        },
      });

    // Return rewritten HTML stream to client (sub-10ms response time)
    return rewriter.transform(cachedResponse);
  },
};
```

#### 2. Origin Cache-Tag Controller (`next.config.js` / Route Handler)

```typescript
// app/api/products/[id]/route.ts - Origin Route emitting Cache-Tags
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await fetchProductFromDatabase(params.id);

  return NextResponse.json(product, {
    headers: {
      // Browser caches for 60s; Edge caches for 24 hours; SWR for 7 days
      'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800',
      // Surrogate-Keys for surgical global invalidation
      'Cache-Tag': `product_${product.id}, category_${product.category}, vendor_${product.vendorId}`,
      'CDN-Cache-Control': 'public, s-maxage=86400',
    },
  });
}

async function fetchProductFromDatabase(id: string) {
  return { id, name: 'Pro Running Shoes', category: 'footwear', vendorId: 'nike_01' };
}
```

---

## 10. Angular Comparison

For senior engineers with an Angular background, edge caching architectures compare directly with Angular SSR and deployment strategies:

| Architectural Dimension | Angular Deployment Approach | Modern React / Edge Architecture |
| :--- | :--- | :--- |
| **Edge Rendering Runtime** | **Angular Universal on Node.js:** Traditionally deployed as a monolithic Node.js container behind an NGINX reverse proxy or AWS CloudFront distribution. | **Next.js on V8 Isolates:** Code executes natively inside Cloudflare Workers or Vercel Edge Runtime with sub-5ms cold starts. |
| **Asset Hashing & Immutability** | Angular CLI automatically appends build hashes (`main.e8b901.js`), allowing `Cache-Control: public, max-age=31536000, immutable`. | Identical bundling mechanics in Vite and Webpack, leveraging immutable caching for static chunks. |
| **HTML Transformation** | Angular DOM manipulation requires spinning up full JSDOM or Domino on the server to alter HTML nodes before emission. | **`HTMLRewriter` Web Standard:** Low-level C++ streaming parser modifying HTML tokens in-flight without building a DOM tree in memory. |

---

## 11. .NET Comparison

For engineers experienced with ASP.NET Core and Microsoft Azure, edge caching concepts map to Azure Front Door and modern .NET caching primitives:

| .NET Enterprise Caching Concept | .NET Architecture Technology | Web / Edge Compute Equivalent |
| :--- | :--- | :--- |
| **Global Anycast Edge** | **Azure Front Door (AFD):** Microsoft's global Anycast CDN and edge routing engine. | **Cloudflare / Fastly / AWS CloudFront** global edge network. |
| **Cache-Tag Invalidation** | **ASP.NET Core Output Caching (`OutputCache` with Tags):** Added in .NET 7/8 (`policy.Tag("products")`). | **Surrogate-Keys / Cache-Tags:** Emitting `Cache-Tag` headers and purging via CDN REST APIs. |
| **Conditional Requests** | `ETag` and `If-None-Match` handling returning HTTP 304 Not Modified from ASP.NET Core middleware. | Native Edge ETag evaluation returning 304 directly from PoP without hitting origin. |
| **Edge Compute Engine** | Azure Front Door Rules Engine or Azure Functions @ Edge (running on Windows/Linux containers). | **V8 Isolates:** Lightweight, sub-millisecond JavaScript execution environments running at the CDN edge. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

Operating global edge caching and compute layers introduces severe enterprise risks:

### 1. The PII Cache Leakage Catastrophe (Session Bleed)
- **The Risk:** An engineer carelessly sets `Cache-Control: public, s-maxage=3600` on an account profile page (`/account/billing`) or fails to strip the `Set-Cookie` header.
- **The Failure Mode:** The CDN caches User A's billing page at the London PoP. The next 500 users who visit `/account/billing` in London are served User A's cached page, viewing their full name, home address, and masked credit card details.
- **The Enterprise Defense:** Enforce an automated CI/CD header audit gate. Any endpoint serving Personally Identifiable Information (PII) must be strictly stamped with `Cache-Control: private, no-store, must-revalidate`. CDNs must be configured to automatically strip `Set-Cookie` headers from any response tagged as `public`.

### 2. CDN Cache Poisoning via Unkeyed Headers
- **The Risk:** An attacker sends an HTTP request with an unkeyed header (e.g. `X-Forwarded-Host: evil.com` or `X-Original-URL`).
- **The Failure Mode:** The origin server reflects the header into an inline `<script src="...">` tag. The CDN caches this poisoned response and serves malicious JavaScript to all subsequent visitors worldwide.
- **The Enterprise Defense:** Configure CDN cache keys to strictly ignore untrusted HTTP headers, or explicitly include all headers that influence HTML generation within the **Vary Header** (`Vary: Accept-Encoding, X-Forwarded-Proto`).

### 3. The Stale-While-Revalidate Thundering Herd
- **The Risk:** A high-traffic home page (10,000 requests/sec) expires its `s-maxage` timer.
- **The Failure Mode:** If the CDN does not implement **Request Coalescing (Origin Shielding)**, hundreds of simultaneous edge PoPs attempt to revalidate with the origin at the exact same millisecond, crashing the backend database.
- **The Enterprise Defense:** Enable **Origin Shielding** and **Request Collapsing** on the CDN. Only a single background fetch is permitted to reach the origin; all other requests await that single revalidation result.

---

## 13. Performance Considerations

```
PLANETARY-SCALE PERFORMANCE BUDGET:
-------------------------------------------------------------
Edge Cache Hit Latency:         < 10ms worldwide (p95)
Edge Cold Start Latency:        < 5ms (V8 Isolate)
Origin Shielding Offload Ratio: > 95% of traffic absorbed at edge
Global Cache Purge Speed:       < 150ms propagation across all PoPs
Time to First Byte (TTFB):      < 80ms globally on Cache HIT
-------------------------------------------------------------
```

### Strategic Optimizations:
1. **Tiered Caching / Origin Shield:**
   Designate a centralized CDN PoP (e.g., US-East) as the "Origin Shield." All 300 edge PoPs query the shield instead of querying the actual application database directly, reducing origin load by 98%.
2. **Early Hints (HTTP 103):**
   Before the origin finishes rendering dynamic HTML, the CDN edge immediately sends an `HTTP 103 Early Hints` response containing `Link: </style.css>; rel=preload`. The browser begins downloading critical CSS and fonts while the origin continues computing.
3. **Brotli & Zstandard Edge Compression:**
   Perform dynamic Brotli level 11 compression at the Edge. Edge workers compress payloads once and cache the compressed binary stream, reducing wire transfer sizes by 25% compared to standard Gzip.

---

## 14. Tradeoffs

| Architecture Choice | Advantages | Costs / Tradeoffs |
| :--- | :--- | :--- |
| **Edge Compute (V8 Isolates)** | Sub-5ms cold starts; planetary proximity; handles auth and A/B routing with zero layout shift. | Limited CPU execution budget (typically 50ms); restricted Node.js native binary support; small memory limit. |
| **`stale-while-revalidate` (SWR)** | Sub-10ms TTFB worldwide; completely shields users from origin latency spikes. | Users may momentarily view slightly stale data; requires asynchronous revalidation infrastructure. |
| **Cache-Tags / Surrogate-Keys** | Surgical, instantaneous invalidation of millions of URLs in under 150ms. | Requires careful origin header instrumentation; tag mapping metadata consumes CDN memory. |
| **HTMLRewriter Streaming** | High-speed edge personalization without busting shared edge caches. | Only modifies HTML text; cannot execute complex React component state logic or deep database joins. |

---

## 15. Common Mistakes & Interview Traps

- **Trap 1: Caching `Set-Cookie` headers on public responses.**
  *Why it fails:* If an origin emits `Set-Cookie: session=xyz` on a response with `Cache-Control: public`, the CDN caches that exact cookie. Every subsequent visitor inherits the original user's session!
- **Trap 2: Purging caches by URL during catalog updates.**
  *Why it fails:* A single product appears on category pages, search results, recommendations, and home pages. Purging by URL requires knowing and invalidating 5,000 distinct URLs. Always use Cache-Tags.
- **Trap 3: Running heavy database queries directly from Edge Workers.**
  *Why it fails:* Running an Edge Worker in Sydney that connects to a Postgres database in Virginia defeats the purpose of the edge; the database query takes 160ms over the wire. Edge compute should only query local edge KV stores or read-replicas.
- **Trap 4: Missing `Vary: Accept-Encoding`.**
  *Why it fails:* A client requesting Brotli could receive an uncompressed or Gzip-compressed cached response if the cache key does not vary by encoding.

---

## 16. Interview Questions & Architectural Answers

### Question 1 (Senior Level): How does the `stale-while-revalidate` HTTP Cache-Control directive work, and why is it critical for Core Web Vitals?
**Answer**:
1. **RFC 5861 Specification:** The directive takes the form: `Cache-Control: max-age=60, stale-while-revalidate=86400`.
2. **Fresh Window:** For the first 60 seconds, the response is fresh and served directly from cache.
3. **Stale Window:** Between 60 seconds and 86,460 seconds, the response is technically stale, but the CDN or browser **immediately returns the cached response to the client** (achieving sub-10ms Time to First Byte - TTFB).
4. **Background Revalidation:** Concurrently, the cache engine fires a non-blocking background HTTP request to the origin server to fetch the latest version and update the cache for future visitors.
5. **Core Web Vitals Impact:** It eliminates origin latency spikes for end users, guaranteeing optimal First Contentful Paint (FCP) and Largest Contentful Paint (LCP) while ensuring data remains fresh within a bounded window.

### Question 2 (Lead Level): How do you design a global caching strategy for an E-Commerce site that provides personalized prices and carts without disabling edge caching?
**Answer**:
We use the **Hollow Shell & Edge Personalization Pattern**:
1. **Universal Shell Caching:** The origin emits the product page HTML without user-specific pricing or cart counts. This response is marked `Cache-Control: public, s-maxage=86400` with Cache-Tags (`Cache-Tag: product_44`). The CDN caches this shell across all 300 global edge PoPs.
2. **Edge Personalization via `HTMLRewriter`:**
   - An Edge Worker intercepts the cached HTML stream.
   - It reads the user's localized geo-currency cookie or auth JWT.
   - Using streaming HTMLRewriter, it replaces `<span id="price">` with the localized currency format, streaming the result to the user in under 10ms.
3. **Client-Side Micro-Hydration:** Dynamic, highly volatile data (like the user's live shopping cart count) is fetched via a lightweight, un-cached client-side JSON endpoint (`/api/cart`) or read directly from a browser session cookie, keeping the massive HTML document fully edge-cached.

### Question 3 (Architect Level): How do you architect a global cache invalidation pipeline that purges content within 200 milliseconds across a worldwide CDN?
**Answer**:
1. **Surrogate-Keys / Cache-Tags Instrumentation:** During server rendering or API generation, the origin attaches semantic tags to responses via the `Cache-Tag` or `Surrogate-Key` header (e.g., `Cache-Tag: entity_user_88, collection_articles`).
2. **CDN Tag Inverted Index:** The CDN edge stores an inverted index mapping each tag to its corresponding cache keys in memory or high-speed NVMe storage.
3. **Event-Driven Purge Webhook:** When an entity mutation occurs in the backend database (e.g. an article is edited in the CMS):
   - A transactional outbox event or Kafka event fires.
   - A dedicated Purge Service issues an authenticated HTTP POST request to the CDN Invalidation API: `POST /cdn/purge { tags: ["entity_user_88"] }`.
4. **Anycast Control Plane Broadcast:** The CDN control plane distributes the purge instruction over high-speed WebSocket or gRPC control channels to all global edge PoPs.
5. **Soft Purge Execution:** The edge marks the matching entries as expired rather than deleting them immediately. This allows the edge to serve them via `stale-while-revalidate` while fetching the fresh copy, preventing an origin thundering herd.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors)

### The "Neighborhood Bookmobile & Custom Stamper" Anchor
- **The Central Library:** Central origin server (14-hour flight away).
- **The Bookmobile:** Global Edge PoP (2-minute walk).
- **The Expiration Tag (`s-maxage`):** Valid for a fixed window.
- **The Borrow-While-Reprinting Rule (`stale-while-revalidate`):** Take the slightly older book today; we will order the new one quietly in the background for tomorrow.
- **The Ink Stamper (`HTMLRewriter`):** Stamping the child's personal name on the universal book cover before handing it over, keeping the pages inside universal for everyone.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Anycast Routing:** A network addressing technique where a single IP address is shared by multiple physical servers globally, automatically routing packets to the topologically closest server.
- **V8 Isolate:** A lightweight, sandboxed V8 runtime instance that boots in <5ms, powering modern Edge Compute.
- **`s-maxage`:** Cache directive specifying freshness specifically for shared public caches (CDNs), overriding `max-age`.
- **Surrogate-Key (Cache-Tag):** Metadata header tagging cached responses with semantic identifiers for grouped invalidation.
- **Origin Shielding:** A centralized CDN caching tier placed between edge PoPs and the origin server to collapse duplicate cache misses and shield origin databases.

---

## 19. Key Takeaways

1. **Leverage Physics with Anycast:** Terminate client TLS handshakes and serve cached responses at the nearest physical Edge PoP to bypass speed-of-light latency penalties.
2. **Default to SWR:** Combine `s-maxage` with `stale-while-revalidate` to deliver sub-10ms Time to First Byte (TTFB) while maintaining bounded freshness.
3. **Tag, Don't URL Purge:** Instrument origin responses with `Cache-Tag` / Surrogate-Keys to enable surgical global invalidation in under 200ms.
4. **Never Leak PII to Public Caches:** Strictly enforce `Cache-Control: private, no-store` on user-specific data and ensure CDNs strip `Set-Cookie` headers on public responses.
5. **Personalize at the Edge:** Use V8 Isolates and streaming `HTMLRewriter` to inject user-specific greetings and localized pricing into universal, cached HTML shells.

---

## 20. Revision Sheet

- **Q: What is the difference between `max-age` and `s-maxage`?**
  *A:* `max-age` applies to all caches including private browser caches; `s-maxage` applies exclusively to shared public intermediate caches (like CDNs) and overrides `max-age`.
- **Q: How does `stale-while-revalidate` improve Core Web Vitals?**
  *A:* It serves the expired cached response immediately (sub-10ms TTFB), then updates the cache asynchronously in the background, eliminating origin wait times.
- **Q: Why do V8 Isolates boot faster than Node.js Docker containers?**
  *A:* Isolates are lightweight JavaScript execution contexts inside an already running C++ process, booting in under 5ms without OS or container initialization overhead.
- **Q: What is a Cache-Tag / Surrogate-Key?**
  *A:* A response header containing semantic labels that allows a CDN to purge thousands of related cached pages simultaneously with a single API call.
- **Q: What happens if a public CDN caches a response containing a `Set-Cookie` header?**
  *A:* Session bleed: all subsequent visitors receive that cached cookie, potentially taking over the original user's authenticated session.
