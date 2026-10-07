# Chapter 07: Browser Networking & Network Stack (HTTP/1.1 vs HTTP/2 vs HTTP/3 QUIC, TCP Handshakes, Fetch Streams & Connection Pools)

> "A web application cannot run faster than the physical limits of light through fiber-optic cables and radio waves through the air. In enterprise systems, performance engineering begins at the transport layer: understanding how the browser negotiates TLS handshakes, multiplexes frames over binary streams, and leverages HTTP/3 QUIC to conquer packet loss."  
> — **Distributed Web Networking Principles**

---

## 1. Why This Topic Exists

Frontend performance discussions frequently focus on JavaScript bundle size and component rendering. Yet, the single largest source of user-perceived latency is often the **Browser Network Stack**:
1. **The Handshake Tax:** Before a single byte of HTML is transmitted, a browser establishing an unoptimized TCP + TLS 1.2 connection requires **3 to 4 complete round-trips (RTTs)** between the client and the server. If a mobile user in Tokyo connects to an origin server in Virginia (150ms round-trip time), the user waits **600ms just for the network handshake** before any data transfers!
2. **The 6-Connection Limit & Head-of-Line Blocking (HTTP/1.1):** Under HTTP/1.1, browsers enforce a strict limit of **6 concurrent TCP connections per origin**. If a page requests 60 images and scripts, 54 of them sit completely idle in a blocked queue.
3. **The Protocol Evolution (HTTP/2 vs. HTTP/3):** While HTTP/2 solved application-level blocking through **binary multiplexing**, it introduced a severe vulnerability: **TCP-level Head-of-Line Blocking**. A single dropped packet on a lossy cellular connection freezes *all* multiplexed streams! HTTP/3 (built on **QUIC over UDP**) was engineered specifically to solve this problem at the operating system transport layer.

Understanding how the browser’s **Network Process** manages connection pools, handles HTTP multiplexing, and streams data via the **Fetch Streams API** is an essential architectural capability.

---

## 2. Learning Objectives

- Dissect the 3 generations of HTTP protocols: **HTTP/1.1** (text-based, 6-conn limit), **HTTP/2** (binary framing, multiplexing), and **HTTP/3** (QUIC over UDP).
- Trace the network connection lifecycle: **DNS Resolution (DoH) $\rightarrow$ TCP 3-Way Handshake $\rightarrow$ TLS 1.3 Handshake $\rightarrow$ Request/Response Exchange**.
- Understand the difference between **Application Head-of-Line Blocking** (HTTP/1.1) and **Transport Head-of-Line Blocking** (HTTP/2 over TCP).
- Master how **HTTP/3 QUIC** solves packet drop stalls and enables **Connection Migration** across Wi-Fi and 5G cellular switches.
- Consume high-throughput, low-memory data streams using the **Web Streams API (`ReadableStream`)** and cancel requests with **`AbortController`**.
- Identify and eliminate legacy anti-patterns: why **Domain Sharding** (`cdn1.domain.com`, `cdn2.domain.com`) degrades HTTP/2 and HTTP/3 performance.
- Bridge architectural mental models directly to **Angular** (`HttpClient` connection lifecycles) and **.NET** (ASP.NET Core Kestrel HTTP/3 configuration and `SocketsHttpHandler` pooling).

---

## 3. Historical Evolution

```text
ERA 1: HTTP/1.0 & Non-Persistent Connections (1996)
┌────────────────────────────────────────────────────────┐
│ New TCP connection created for EVERY single file.      │
│ - 50 assets = 50 TCP 3-way handshakes!                 │
│ - Enormous latency; completely unsustainable.          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 2: HTTP/1.1 Keep-Alive & Domain Sharding (1999 - 2015)
┌────────────────────────────────────────────────────────┐
│ Connection: keep-alive reuses TCP sockets.             │
│ - Max 6 TCP connections per origin.                    │
│ - Head-of-Line Blocking: Asset 2 waits for Asset 1.    │
│ - Workarounds: Domain sharding, image spriting, inlining│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 3: HTTP/2 Binary Multiplexing (2015 - 2020)
┌────────────────────────────────────────────────────────┐
│ Single TCP connection per origin. Binary framing layer.│
│ - Streams interleaved in parallel; 0 domain sharding.  │
│ - Flaw: TCP packet loss stalls ALL streams simultaneously│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 4: HTTP/3 & QUIC over UDP (2020 - Present)
┌────────────────────────────────────────────────────────┐
│ Replaces TCP with QUIC protocol running over UDP.      │
│ - Zero TCP Head-of-Line blocking (packet loss isolated)│
│ - 0-RTT Connection Resumption with TLS 1.3 built-in.   │
│ - Connection Migration across Wi-Fi/Cellular handover. │
└────────────────────────────────────────────────────────┘
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The 6 Caravans, The Bullet Train, and The Autonomous Drones

Imagine transporting 100 cargo crates from a warehouse across a river:
- **HTTP/1.1 is 6 Horse-Drawn Caravans:**  
  You are only permitted to put 6 caravans on the road at once (the 6-connection limit). Each caravan can carry only 1 crate at a time. If Caravan #1 gets a flat tire, all crates behind it on that single-lane road are stuck waiting (Head-of-Line Blocking). To bypass this, companies built 4 duplicate roads under different names (`cdn1.site.com`, `cdn2.site.com` - Domain Sharding).
- **HTTP/2 is a High-Speed Bullet Train:**  
  You build a single, ultra-fast steel railway track (one persistent TCP connection). The train has 100 interlinked cars (multiplexed streams). All 100 crates travel together simultaneously.  
  - *The Catch:* If a boulder falls on the tracks (a single dropped TCP packet), **the entire train must screech to a halt** until the conductor removes the boulder!
- **HTTP/3 QUIC is a Fleet of Autonomous Flying Drones:**  
  You abandon the railway completely and launch 100 independent flying drones over the open sky (UDP datagrams). Every drone flies directly to the destination. If Drone #14 is caught in a gust of wind (dropped packet), **only Drone #14 turns around to retry**. The other 99 drones arrive at full speed with zero delay!

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. The Connection Lifecycle & Handshake Latency

```text
HTTP/1.1 & HTTP/2 over TCP + TLS 1.2 (3 RTTs before Data!)
Client                                                  Server
  │ ──── SYN ─────────────────────────────────────────────► │ (TCP 3-Way Handshake)
  │ ◄─── SYN-ACK ────────────────────────────────────────── │ (1 RTT)
  │ ──── ACK + ClientHello ───────────────────────────────► │
  │ ◄─── ServerHello + Certificate ──────────────────────── │ (TLS Handshake: 2 RTTs)
  │ ──── ClientKeyExchange ───────────────────────────────► │
  │ ◄─── Finished ───────────────────────────────────────── │
  │ ──── HTTP GET /index.html ────────────────────────────► │ (3 RTTs to First Byte!)

HTTP/3 QUIC with TLS 1.3 (1 RTT Cold Start, 0-RTT Warm Resume!)
Client                                                  Server
  │ ──── QUIC Initial (Crypto ClientHello + Keys) ────────► │ (Combined QUIC + TLS 1.3)
  │ ◄─── QUIC Initial (ServerHello + Keys + Handshake) ─── │ (1 RTT Cold Start!)
  │ ──── HTTP/3 GET (DATA STREAM) ────────────────────────► │ (First Byte Transmitted!)
```

### 2. HTTP/2 Binary Framing & Multiplexing
HTTP/2 converts plain-text HTTP messages into binary frames:
- **`HEADERS` Frame:** Contains compressed HTTP headers via **HPACK** (an algorithm that maintains a dynamic shared table between client and server to avoid re-transmitting redundant cookie/header strings).
- **`DATA` Frame:** Contains payload chunks (HTML, JSON, images).
- **Stream Interleaving:** Chunks from Stream 1, Stream 3, and Stream 5 are chopped into frames and interleaved across a single TCP socket. The receiver reassembles them using the 31-bit Stream ID.

### 3. HTTP/3 QUIC: Solving Transport Head-of-Line Blocking
In HTTP/2 over TCP:
- TCP guarantees byte-ordered delivery. If TCP packet #4 is dropped by network noise, TCP buffers packets #5 through #20 in the OS kernel until packet #4 is retransmitted. Even though Stream 3 only needed packet #5, Stream 3 is frozen!
- In **HTTP/3 QUIC**:
  - QUIC runs over **UDP**, bypassing the operating system's strict sequential byte stream.
  - QUIC implements its own stream-aware packet loss recovery.
  - If a packet containing Stream 1 data is dropped, **only Stream 1 is paused**. Stream 2, Stream 3, and Stream 4 continue processing at full line speed!

---

## 6. Runtime Flow & Execution Traces

### Execution Trace: Consuming a Large Data Stream with Fetch Streams

```text
1. Frontend calls: const response = await fetch('/api/analytics-stream');
2. Network Process receives 200 OK headers.
3. Response body is exposed as a Web Standard `ReadableStream`.
4. JavaScript acquires reader lock: `const reader = response.body.getReader()`.

5. Stream Chunk Processing Loop:
   -> reader.read() called.
   -> Network Process receives 64 KB chunk over HTTP/2 DATA frame.
   -> Passes chunk across IPC pipe to Renderer process as Uint8Array.
   -> reader.read() resolves with: { value: Uint8Array(65536), done: false }.
   -> TextDecoder transforms bytes to string and updates UI chart in real time.

6. User navigates away:
   -> AbortController.abort() fired.
   -> Network Process immediately sends HTTP/2 `RST_STREAM` frame to server.
   -> Server terminates database query. Network bandwidth saved instantly!
```

---

## 7. Memory Model & Network Process Socket Management

Inside Chromium's **Network Process**:
- Maintains a global **`ClientSocketPool`**.
- For **HTTP/1.1**: Tracks active TCP sockets per host. Caps active sockets at 6 per origin; subsequent requests are placed into a pending FIFO queue.
- For **HTTP/2 and HTTP/3**: Reuses a single multiplexed session per origin (`SpdySession` / `QuicChromiumClientSession`).
- **Memory Buffer Management:** Employs backpressure. If JavaScript is slow to consume stream chunks, the Network Process suspends reading from the OS socket buffer, signaling TCP window reduction back to the origin server.

---

## 8. Visual Diagrams (ASCII / Text)

### HTTP/1.1 vs. HTTP/2 vs. HTTP/3 Multiplexing Comparison

```text
HTTP/1.1: 6 Connections Max (Head-of-Line Blocked)
Conn 1: [--- Request 1 ---][--- Request 7 ---][--- Request 13 ---]
Conn 2: [--- Request 2 ---][--- Request 8 ---][--- Request 14 ---]
Conn 3: [--- Request 3 ---][--- Request 9 ---][--- Request 15 ---]
(Requests 7-60 wait in line!)

HTTP/2: 1 Single Connection (Binary Multiplexed)
Conn 1: [H1][D1][H2][D3][D1][H4][D2][D4][D3]... (All interleaved!)
⚠️ If a single TCP packet drops -> ENTIRE CONNECTION STALLS!

HTTP/3 QUIC: 1 Connection over UDP (Isolated Streams)
Stream 1: [D1][D1][D1] (Dropped packet -> Only Stream 1 retries!)
Stream 2: [D2][D2][D2] (Continues flowing at full speed! 🚀)
Stream 3: [D3][D3][D3] (Continues flowing at full speed! 🚀)
```

---

## 9. Real World Usage & Production Patterns

### Pattern 1: High-Performance Streaming Fetch Consumer with Cancellation

```typescript
// utils/streamConsumer.ts
export async function streamNdJson<T>(
  url: string,
  onRecord: (record: T) => void,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(url, { signal });

  if (!response.ok || !response.body) {
    throw new Error(`Stream request failed: ${response.statusText}`);
  }

  // Acquire reader lock on the Web Standard ReadableStream
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      // Read next incoming chunk from Network Process
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep uncompleted line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          onRecord(JSON.parse(line));
        }
      }
    }
  } finally {
    // Release reader lock
    reader.releaseLock();
  }
}
```

### Pattern 2: Inspecting Protocols in Chrome DevTools

1. Open DevTools $\rightarrow$ **Network Panel**.
2. Right-click any table header (e.g., Name, Status) and check **`Protocol`**.
3. Inspect values:
   - `http/1.1`: Legacy text protocol (capped at 6 connections).
   - `h2`: HTTP/2 (binary multiplexed over TCP).
   - `h3`: HTTP/3 (QUIC over UDP).

---

## 10. Angular Comparison

| Dimension | Browser Network Stack | Angular (v17+) |
| :--- | :--- | :--- |
| **Request Primitive** | Native Web Standards `fetch()` and `ReadableStream`. | `HttpClient` using RxJS `Observable<T>` wrappers. |
| **Stream Cancellation** | `AbortController.abort()` emitting TCP `RST_STREAM`. | Unsubscribing from RxJS Observable (`takeUntilDestroyed()`) invokes `xhr.abort()`. |
| **Connection Pooling** | Browser Network Process manages sockets globally. | Angular has no socket control; delegates entirely to browser network stack. |
| **Progress Tracking** | Monitor `ReadableStream` chunk byte lengths. | Angular `HttpClient` supports `reportProgress: true` for upload/download events. |

---

## 11. .NET Comparison

| Dimension | Browser Network Stack | ASP.NET Core & .NET 9/10 |
| :--- | :--- | :--- |
| **HTTP/3 Support** | Browser automatically negotiates `h3` via `Alt-Svc` header. | Kestrel configured with `HttpProtocols.Http1AndHttp2AndHttp3`. |
| **Connection Pooling** | `ClientSocketPool` inside Chromium Network Process. | `SocketsHttpHandler` managed by `IHttpClientFactory` pooling sockets. |
| **Binary Streams** | Web Standard `ReadableStream<Uint8Array>`. | `System.IO.Pipelines` (`PipeReader` / `PipeWriter`) and `IAsyncEnumerable<T>`. |
| **TCP Keep-Alive** | Browser handles socket timeouts (typically 45–120s). | Kestrel `Limits.KeepAliveTimeout` configuring server socket retention. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. The Domain Sharding Performance Regression Anti-Pattern
- **The Failure Mode:** An enterprise migrated from HTTP/1.1 to HTTP/2/3, but retained legacy Domain Sharding (`cdn1.domain.com`, `cdn2.domain.com`, `cdn3.domain.com`).
- **The Performance Disaster:**  
  - In HTTP/1.1, domain sharding bypassed the 6-connection limit.
  - In HTTP/2 and HTTP/3, domain sharding **forces the browser to open multiple separate connections**!
  - It destroys multiplexing, incurs multiple expensive TLS handshakes, disables HPACK header compression sharing, and increases mobile battery drain.
- **The Fix:** Consolidate all static assets onto a **single unified origin domain** (`cdn.domain.com`) in HTTP/2 and HTTP/3.

### 2. The UDP Firewall Block (HTTP/3 Fallback Failure)
- **The Failure Mode:** Corporate enterprise firewalls often block outbound **UDP port 443** traffic, believing UDP is uninspected or insecure.
- **The Mitigation:** Modern browsers handle this automatically:
  1. The browser initially connects via TCP using HTTP/2.
  2. The server advertises HTTP/3 availability via the response header: `Alt-Svc: h3=":443"; ma=86400`.
  3. The browser attempts a background QUIC UDP handshake. If the firewall drops UDP packets, the browser seamlessly falls back to HTTP/2 without failing the user request.

---

## 13. Performance Considerations

```text
Protocol Benchmark Comparison (Cold Start over 100ms RTT 4G Mobile)
┌───────────────────────────────────────┬──────────────┬──────────────┬─────────────┐
│ Protocol                              │ Handshake    │ 50 Small Imgs│ 1% Pkt Loss │
├───────────────────────────────────────┼──────────────┼──────────────┼─────────────┤
│ HTTP/1.1 (6 Connections max)          │ 300 ms (3 RTT│ 1,850 ms     │ Very Slow   │
│ HTTP/2 (Multiplexed over TCP)         │ 200 ms (2 RTT│ 320 ms       │ 780 ms (HOL)│
│ HTTP/3 QUIC (0-RTT Resume over UDP)   │ 100 ms (1 RTT│ 240 ms       │ 250 ms (0HOL│
└───────────────────────────────────────┴──────────────┴──────────────┴─────────────┘
```

HTTP/3 QUIC maintains high throughput even under severe real-world mobile packet loss.

---

## 14. Tradeoffs

| Protocol | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **HTTP/1.1** | Ubiquitous; simple plaintext debugging; supported by legacy reverse proxies. | Severe Head-of-Line blocking; 6-connection limit; uncompressed redundant headers. |
| **HTTP/2** | Binary multiplexing; HPACK compression; single persistent TCP connection. | Vulnerable to TCP transport head-of-line blocking under packet loss. |
| **HTTP/3 QUIC** | Eliminates transport HOL blocking; 0-RTT handshakes; cellular-to-Wi-Fi connection migration. | UDP blocked by restrictive corporate firewalls; higher server CPU cost to process UDP packets. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Believing HTTP/2 Eliminated ALL Head-of-Line Blocking
- **Scenario:** The interviewer asks: *"Does HTTP/2 have Head-of-Line blocking?"*
- **Candidate Answer:** *"No, HTTP/2 multiplexing completely eliminated it."*
- **Correction:** **WRONG.** HTTP/2 eliminated *Application-Layer* Head-of-Line blocking (in the browser). But because HTTP/2 runs over standard TCP, it introduced **Transport-Layer Head-of-Line blocking**. A single lost TCP packet halts all multiplexed streams! Only **HTTP/3 QUIC** truly eliminated transport head-of-line blocking.

### Trap 2: Using Domain Sharding on Modern Web Applications
- **Scenario:** A candidate recommends splitting image downloads across `img1.domain.com` and `img2.domain.com` to speed up HTTP/2 downloads.
- **The Reality:** **Anti-pattern.** Domain sharding destroys HTTP/2 performance by forcing duplicate TCP and TLS handshakes and fragmenting HPACK compression tables.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior): "How does HTTP/3 QUIC implement Connection Migration when a mobile device switches from Wi-Fi to 5G?"
**Architectural Answer:**  
In traditional TCP (HTTP/1.1 and HTTP/2), a connection is defined by a 4-tuple: `(Source IP, Source Port, Destination IP, Destination Port)`. When a user walks out of their house and transitions from Wi-Fi to 5G cellular, their mobile device is assigned a **new Source IP address**. This invalidates the TCP 4-tuple, severing all active TCP sockets. In-flight downloads break, and the browser must negotiate fresh TCP and TLS handshakes from scratch.  
In **HTTP/3 QUIC**, connections are identified by an opaque **64-bit Connection ID (CID)** rather than an IP address. When the device’s IP changes, the client transmits datagrams containing the identical CID to the server. The server verifies the cryptographic CID and seamlessly continues streaming in-flight data **without dropping the connection or re-authenticating**!

### Question 2 (Lead): "How does HPACK header compression work in HTTP/2, and why was it vulnerable to the CRIME attack?"
**Architectural Answer:**  
- **HPACK Architecture:** HTTP/2 maintains two tables between client and server: a **Static Table** (predefined indices for common headers like `:method: GET`) and a **Dynamic Table** (stores custom headers seen during the session, like cookies). Instead of sending a 500-byte `Cookie` header on every request, HTTP/2 sends a 2-byte integer pointer referencing the dynamic table index.
- **The Security Vulnerability:** Compression algorithms (like gzip/DEFLATE) shorten byte sequences by finding duplicate substrings. In attacks like **CRIME**, an attacker injects guessed characters alongside private secret tokens (like session cookies). By measuring whether the compressed payload size grew or shrank, the attacker can deduce the cookie byte by byte! HPACK was designed specifically to defeat CRIME by using static Huffman coding and prohibiting dictionary compression across security boundaries.

### Question 3 (Architect): "How would you design a global Edge CDN and networking topology to guarantee sub-50ms TTFB globally for a financial application?"
**Architectural Answer:**  
1. **Anycast Edge Network:** Deploy Anycast DNS via Cloudflare or Azure Front Door, routing users to the nearest physical CDN Point of Presence (PoP) in < 10ms.
2. **TLS 1.3 & HTTP/3 QUIC:** Enable HTTP/3 with 0-RTT session resumption at the Edge PoP, terminating client handshakes locally in 1 RTT.
3. **Persistent Origin Backhaul:** Maintain persistent, pre-warmed TCP/TLS connection pools across the cloud provider’s private high-speed fiber backhaul between Edge PoPs and origin backend servers.
4. **Early Hints (HTTP 103):** When the initial request arrives, the server immediately emits an `HTTP 103 Early Hints` response containing `Link: </style.css>; rel=preload`, instructing the client to begin downloading critical assets while the server computes dynamic data.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The Memory Peg: "The Highway, The Train, and The Drone Fleet"
- **HTTP/1.1 is the 6-Lane Highway:** Only 6 cars at a time. If car 1 breaks down, everyone behind it stops.
- **HTTP/2 is the Interlinked High-Speed Train:** 100 cars on 1 track. Fast, but 1 fallen rock on the track stops the whole train.
- **HTTP/3 QUIC is the Autonomous Drone Fleet:** Flying over UDP. No tracks, no roads. If 1 drone is hit by a bird, the other 99 land on time!

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Head-of-Line Blocking:** A performance bottleneck where a single blocked request halts all subsequent requests in line.
- **QUIC:** Quick UDP Internet Connections—a multiplexed transport protocol built on top of UDP with integrated TLS 1.3.
- **Connection Migration:** QUIC’s ability to maintain active connections across changing IP addresses using Connection IDs.
- **HPACK:** The HTTP/2 compression format that eliminates redundant header bandwidth.
- **The "Aha!" Insight:** HTTP/3 doesn't replace the web—it **replaces TCP**! By moving from TCP to UDP, browsers conquered packet loss lag on mobile networks forever!

---

## 19. Key Takeaways

1. **HTTP/1.1 is limited to 6 concurrent TCP connections per origin;** requests are queued sequentially.
2. **HTTP/2 introduced binary multiplexing on a single connection,** but remains vulnerable to TCP transport head-of-line blocking under packet loss.
3. **HTTP/3 QUIC runs over UDP,** isolating packet loss to individual streams and enabling seamless connection migration.
4. **Never use Domain Sharding in modern HTTP/2 or HTTP/3 applications;** it degrades multiplexing.
5. **Use the Web Streams API (`ReadableStream`)** to process large payloads chunk by chunk with minimal memory consumption.
6. **Use `AbortController`** to cancel in-flight network requests and emit HTTP/2 `RST_STREAM` frames when components unmount.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER NETWORKING CHEAT SHEET                                  │
├───────────────────────┬──────────────┬──────────────────┬──────────────────────────────┤
│ Protocol              │ Transport    │ Handshake Latency│ Head-of-Line Blocking?       │
├───────────────────────┼──────────────┼──────────────────┼──────────────────────────────┤
│ HTTP/1.1              │ TCP + TLS    │ 3 RTTs           │ YES (Application level)      │
│ HTTP/2                │ TCP + TLS    │ 2 RTTs           │ YES (Transport packet loss)  │
│ HTTP/3                │ QUIC (UDP)   │ 1 RTT (0-RTT)    │ NO (Completely eliminated!)  │
├───────────────────────┴──────────────┴──────────────────┴──────────────────────────────┤
│ Fetch Streaming Template:                                                              │
│   const res = await fetch(url, { signal: abortController.signal });                    │
│   const reader = res.body.getReader();                                                 │
│   while (true) {                                                                       │
│     const { value, done } = await reader.read();                                       │
│     if (done) break;                                                                   │
│     // Process Uint8Array chunk                                                        │
│   }                                                                                    │
│                                                                                        │
│ Anti-Pattern Avoidance:                                                                │
│   ❌ Domain Sharding (cdn1, cdn2) --> Use single origin for optimal multiplexing       │
│                                                                                        │
│ Golden Architectural Rule:                                                             │
│   "Terminate handshakes at the edge; multiplex over HTTP/2; stream via QUIC."          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
