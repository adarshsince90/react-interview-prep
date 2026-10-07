# Chapter 09: Browser Storage Architecture (Cookie Jars & SameSite, Storage Quotas, IndexedDB Transactional Engine & OPFS)

> "Browser storage is not a monolithic disk drive; it is a specialized memory hierarchy spanning network transport cookies, synchronous main-thread key-value stores, transactional LevelDB databases, and raw binary file system sandboxes. Choosing the wrong tier results in either security disaster, main-thread freezing, or sudden data eviction by the browser's operating system."  
> — **Client-Side Data Architecture Principles**

---

## 1. Why This Topic Exists

Modern web applications are increasingly expected to function as local-first, offline-resilient, data-intensive systems (e.g., Figma, linear editors, offline enterprise CRMs, medical record systems).

However, browser storage is fraught with architectural traps:
1. **The `localStorage` Synchronous I/O Disaster:** `localStorage` is completely synchronous and runs on the browser's **Main Thread**. Reading or writing a 4 MB string blocks the JavaScript engine, halting animations, delaying user input, and failing Interaction to Next Paint (**INP**) audits.
2. **The 4KB Cookie Network Overhead:** Developers frequently store client state in cookies. But cookies are transmitted in the HTTP request headers of **every single sub-resource request** (images, scripts, CSS, API calls), wasting megabytes of cellular bandwidth.
3. **The Safari ITP Eviction Threat:** Apple Safari's **Intelligent Tracking Prevention (ITP)** aggressively purges all client-side writable storage (`localStorage`, `IndexedDB`) after **7 days of user inactivity** for sites arrived at via cross-site tracking links!
4. **The WebAssembly File System Revolution (OPFS):** Running full relational databases (SQLite) inside the browser via WebAssembly requires raw, synchronous, sub-millisecond disk access that traditional asynchronous APIs cannot provide.

Mastering the 4 core storage tiers—**Cookies, Web Storage, IndexedDB, and the Origin Private File System (OPFS)**—is essential for designing robust, high-performance data architectures.

---

## 2. Learning Objectives

- Dissect the 4 primary browser storage tiers: **Cookies**, **Web Storage (`localStorage` / `sessionStorage`)**, **IndexedDB**, and the **Origin Private File System (OPFS)**.
- Understand storage quotas, persistence guarantees (`navigator.storage.persist()`), and the browser's Least Recently Used (**LRU**) disk eviction algorithm.
- Master the **IndexedDB Transactional Engine**: object stores, auto-commit lifecycle, indexes, and handling multi-tab version upgrade deadlocks (`onversionchange`).
- Leverage **OPFS (`FileSystemSyncAccessHandle`)** in Web Workers for bare-metal binary performance and in-browser SQLite WASM databases.
- Enforce strict cookie security: **`HttpOnly`**, **`Secure`**, **`SameSite`**, and the tamper-proof prefixes **`__Secure-`** and **`__Host-`**.
- Defend against browser eviction policies and Safari Intelligent Tracking Prevention (ITP).
- Bridge architectural mental models directly to **Angular** (offline service stores) and **.NET** (Blazor `ProtectedLocalStorage` and EF Core SQLite in WebAssembly).

---

## 3. Historical Evolution

```text
ERA 1: Netscape Cookies & The 4KB Limit (1994 - 2005)
┌────────────────────────────────────────────────────────┐
│ document.cookie                                        │
│ - Max 4 KB per cookie; max ~50 cookies per domain.     │
│ - Transmitted automatically over every HTTP request.   │
│ - Zero query capabilities; clumsy string parsing.      │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 2: HTML5 Web Storage & WebSQL Dead-End (2009 - 2015)
┌────────────────────────────────────────────────────────┐
│ localStorage / sessionStorage (5MB synchronous).       │
│ WebSQL: In-browser SQLite standard (Abandoned by W3C   │
│ because only SQLite implemented it).                   │
│ - localStorage became ubiquitous despite blocking main  │
│   thread on disk I/O.                                  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 3: IndexedDB Standardized NoSQL (2015 - 2021)
┌────────────────────────────────────────────────────────┐
│ Asynchronous transactional LevelDB wrapper.            │
│ - Hundreds of megabytes of storage; indexes & cursors. │
│ - Clunky event-based API; requires Promise wrappers.   │
│ - Suffered from multi-tab versioning deadlocks.        │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
ERA 4: Origin Private File System & SQLite WASM (2021 - Present)
┌────────────────────────────────────────────────────────┐
│ OPFS (FileSystemSyncAccessHandle in Web Workers).      │
│ - Bare-metal binary file access inside private sandbox.│
│ - Full SQLite compiled to WebAssembly running at       │
│   near-native C performance in the browser!            │
└────────────────────────────────────────────────────────┘
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The 4 Storage Containers of the Traveling Consultant

Imagine an enterprise consultant traveling between corporate offices:

```text
1. COOKIES         == The Security Badge on Your Lanyard (Shown at every door)
2. LOCALSTORAGE    == The Paper Post-It Notes on Your Laptop Lid (Fast, tiny, blocks you)
3. INDEXEDDB       == The Rolling Metal Filing Cabinet (Thousands of categorized files)
4. OPFS            == The Encrypted External SSD Drive (Gigabytes of raw binary data)
```

1. **Cookies (The Lanyard Badge):**  
   Every time you walk through any door in the company (every HTTP request), the guard looks at the badge on your neck. It’s tiny (4 KB) and strictly for identification. If you start taping heavy books to your lanyard badge, your neck breaks!
2. **Web Storage (`localStorage` - The Post-It Notes):**  
   Right in front of your eyes on the desk. You can grab a number instantly (`localStorage.getItem('token')`). But you can only write short text strings. And while you are reading a post-it note, **your hands are completely frozen**—you cannot type or answer the phone (blocks the Main Thread).
3. **IndexedDB (The Rolling Filing Cabinet):**  
   A heavy, multi-drawer metal filing cabinet in your office. It holds thousands of client folders, indexed by Customer ID and Zip Code. When you request a file, you send an assistant down the hall asynchronously. You keep working while the assistant retrieves the file.
4. **OPFS (The Encrypted External SSD):**  
   A high-speed solid-state drive plugged directly into a background laboratory computer (Web Worker). It speaks raw binary bytes directly to the disk controller with microsecond latency.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. The Definitive Browser Storage Architecture Matrix

| Storage Technology | Capacity Cap | Main Thread Blocking? | Persistence Type | Primary Enterprise Use Case |
| :--- | :--- | :---: | :--- | :--- |
| **Cookies** | 4 KB per cookie | Non-blocking | Network Transport | Session IDs, Auth Tokens, CSRF Secrets |
| **`sessionStorage`** | 5 MB per tab | **YES (Sync Block)** | Tab Lifespan | Multi-step form wizards, active filter state |
| **`localStorage`** | 5 MB - 10 MB | **YES (Sync Block)** | Persistent (LRU) | Theme preferences, lightweight non-sensitive flags |
| **IndexedDB** | Up to 60% of disk | **NO (Async)** | Persistent (LRU) | Offline document caches, sync outboxes, CAD files |
| **OPFS** | Gigabytes (Quota) | **NO (In Worker)** | Persistent (LRU) | In-browser SQLite WASM, video editing caches |

---

### 2. Under the Hood: Chromium's Storage Architecture

In Chromium (Chrome, Edge):
- **IndexedDB is powered by LevelDB:** Blink uses Google's high-performance LSM-tree (Log-Structured Merge-tree) storage engine, writing to `.leveldb` directory structures on the user’s local disk.
- **Cookies are stored in an SQLite Database:** The Network Process maintains a local SQLite file (`Cookies.sqlite`) protected by OS encryption (DPAPI on Windows, Keychain on macOS).
- **The Storage Quota Manager:**  
  Chromium pools all origin storage under a global quota manager:
  - By default, an origin can consume up to **60% of total available disk space**.
  - Under disk pressure, the browser executes an **LRU Eviction Algorithm**: the least-recently used origins have their temporary storage completely wiped without warning!
  - **The Solution:** Call `navigator.storage.persist()`. When granted, the browser guarantees that the origin's data will **never be evicted** by automatic disk-cleanup routines.

---

### 3. The IndexedDB Transactional Lifecycle & Auto-Commit

IndexedDB operates on strict ACID transaction contracts:

```text
1. Transaction Created:
   const tx = db.transaction(['invoices'], 'readwrite');
   const store = tx.objectStore('invoices');

2. Operations Enqueued:
   store.put({ id: 101, amount: 450 });
   store.put({ id: 102, amount: 890 });

3. The Auto-Commit Trap:
   In IndexedDB, a transaction COMMITS AUTOMATICALLY as soon as the
   JavaScript event loop finishes its current microtask tick with no active requests!
   ⚠️ If you call `await fetch('/api/verify')` inside an open transaction,
   the event loop advances, and IndexedDB immediately AUTO-COMMITS and closes!
   Subsequent writes will throw: `TransactionInactiveError`!
```

---

## 6. Runtime Flow & Execution Traces

### Execution Trace: Initializing and Querying IndexedDB via Cursors

```text
1. Open Database:
   -> window.indexedDB.open('EnterpriseDB', 2);
   -> If version changed: onupgradeneeded fires.
   -> Creates Object Store 'customers' with keyPath: 'id'.
   -> Creates Index 'by_company' on field 'companyId'.

2. Open Read Transaction:
   -> const tx = db.transaction('customers', 'readonly');
   -> const store = tx.objectStore('customers');
   -> const index = store.index('by_company');

3. Query Range via Index:
   -> const request = index.getAll(IDBKeyRange.only('acme_corp'));
   -> LevelDB executes B-Tree range scan in background thread.
   -> Zero main-thread CPU blocking!

4. Completion:
   -> request.onsuccess resolves.
   -> V8 parses LevelDB records into native JavaScript objects.
   -> UI renders 500 customers at 120 FPS!
```

---

## 7. Memory Model & Cryptographic Cookie Hardening

### The Modern Cookie Security Prefix Standard

To defeat cookie-injection and subdomain-poisoning attacks, modern browsers enforce strict **Cookie Prefixes**:

```text
1. The __Secure- Prefix:
   Set-Cookie: __Secure-session=abc; Secure; Path=/; SameSite=Lax
   - MUST have the `Secure` flag.
   - MUST be transmitted exclusively over HTTPS.

2. The __Host- Prefix (The Gold Standard):
   Set-Cookie: __Host-auth=xyz; Secure; Path=/; SameSite=Lax
   - MUST have the `Secure` flag.
   - MUST be transmitted exclusively over HTTPS.
   - MUST have `Path=/` (cannot be scoped to subdirectories).
   - MUST NOT have a `Domain` attribute!
   - BENEFIT: A compromised subdomain (e.g., `blog.enterprise.com`) is
     PHYSICALLY FORBIDDEN by the browser from overwriting a __Host- cookie on `enterprise.com`!
```

---

## 8. Visual Diagrams (ASCII / Text)

### OPFS (Origin Private File System) Architecture with SQLite WASM

```text
MAIN BROWSER THREAD                                    BACKGROUND WEB WORKER
┌──────────────────────────────────────────┐          ┌──────────────────────────────────────────┐
│ React / Angular UI Component             │          │ SQLite WebAssembly Engine (.wasm)        │
│                                          │          │                                          │
│ Dispatch SQL Query:                      │          │ Executes SQL: SELECT * FROM Transactions │
│ worker.postMessage({ sql: 'SELECT...' }) ┼─────────►│                                          │
│                                          │          │ Synchronous File System Access:          │
│ 100% Free Main Thread!                   │          │ const handle = file.createSyncAccessHandle();
│ Zero Layout / Paint Freezing!            │          │ handle.read(buffer, { at: 0 });          │
│                                          │          └────────────────────┬─────────────────────┘
└──────────────────────────────────────────┘                               │
                                                                           ▼ (Raw Binary I/O)
                                                      ┌──────────────────────────────────────────┐
                                                      │ ORIGIN PRIVATE FILE SYSTEM (SANDBOX)     │
                                                      │ /db.sqlite (Direct OS Kernel File I/O)   │
                                                      │ - Sub-millisecond read/write latency     │
                                                      │ - Zero IPC serialization overhead        │
                                                      └──────────────────────────────────────────┘
```

---

## 9. Real World Usage & Production Patterns

### Pattern 1: Production-Grade Asynchronous Storage with `idb-keyval`

Never use raw `localStorage` in modern web applications. Use a Promise-based IndexedDB wrapper:

```typescript
// utils/storage.ts
import { get, set, del } from 'idb-keyval';

export async function saveOfflineDraft<T>(draftId: string, data: T): Promise<void> {
  // Asynchronous write directly to IndexedDB (LevelDB)
  // Does NOT block the main thread!
  await set(`draft:${draftId}`, data);
}

export async function loadOfflineDraft<T>(draftId: string): Promise<T | undefined> {
  return get<T>(`draft:${draftId}`);
}

export async function deleteOfflineDraft(draftId: string): Promise<void> {
  await del(`draft:${draftId}`);
}
```

### Pattern 2: Requesting Persistent Storage Against Browser Eviction

```typescript
// utils/quotaManager.ts
export async function ensurePersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    // 1. Check if storage is already persistent
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      console.log('Storage is already persistent and immune to eviction.');
      return true;
    }

    // 2. Request persistent storage permission from the browser
    const granted = await navigator.storage.persist();
    console.log(`Persistent storage request: ${granted ? 'GRANTED' : 'DENIED'}`);
    return granted;
  }
  return false;
}

export async function logStorageEstimate(): Promise<void> {
  if (navigator.storage && navigator.storage.estimate) {
    const { quota, usage } = await navigator.storage.estimate();
    const usedMB = Math.round((usage || 0) / 1024 / 1024);
    const totalMB = Math.round((quota || 0) / 1024 / 1024);
    console.log(`Storage Usage: ${usedMB} MB of ${totalMB} MB total quota.`);
  }
}
```

---

## 10. Angular Comparison

| Dimension | Browser Storage Subsystem | Angular (v17+) |
| :--- | :--- | :--- |
| **State Persistence** | IndexedDB / OPFS / Web Storage. | Angular Services (`@Injectable({ providedIn: 'root' })`) hydrate state from IndexedDB. |
| **Main Thread Blocking** | `localStorage.getItem()` freezes the main thread. | Reading `localStorage` inside Angular component constructors blocks Change Detection hydration. |
| **Offline Synchronization** | Service Worker background sync + IndexedDB outbox. | Angular Service Worker (`@angular/pwa`) manages asset caching; custom NgRx effects sync data. |
| **Enterprise Persistence** | Native `navigator.storage.persist()` API. | Wrapped in an Angular Application Initializer (`APP_INITIALIZER`) before UI bootstrap. |

---

## 11. .NET Comparison

| Dimension | Browser Storage Subsystem | ASP.NET Core & Blazor |
| :--- | :--- | :--- |
| **Secure Cookie Storage** | Encrypted `HttpOnly`, `SameSite=Lax` cookies. | ASP.NET Core Cookie Authentication encrypted via Data Protection API (DPAPI). |
| **Blazor State Storage** | `localStorage` and `sessionStorage`. | Blazor `ProtectedLocalStorage` providing automated cryptographic encryption of client values. |
| **Relational Database** | OPFS running SQLite WebAssembly. | EF Core with SQLite running natively in Blazor WebAssembly over OPFS! |
| **Storage Abstraction** | W3C Web Storage and IDB APIs. | `IDistributedCache` on server; custom JSInterop abstractions on client. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. The Multi-Tab IndexedDB Version Upgrade Deadlock
- **The Failure Mode:** An enterprise pushes a new deployment that updates the IndexedDB schema from Version 1 to Version 2. A user has 4 tabs of the application open simultaneously.
- **The Disaster:** Tab 1 initiates `indexedDB.open('DB', 2)`. The browser fires `onblocked` because Tabs 2, 3, and 4 still hold active database connections to Version 1. The database freezes permanently across all tabs!
- **The Architectural Fix:** Every enterprise application **must handle `onversionchange`**:
  ```typescript
  db.onversionchange = () => {
    db.close();
    alert('A new version of this application is available. Please reload.');
  };
  ```

### 2. The Safari ITP 7-Day Purge Disaster
- **The Failure Mode:** A user uses an offline-first notes application in Safari. They go on vacation for 8 days.
- **The Disaster:** Safari's Intelligent Tracking Prevention (ITP) identifies the site as inactive and **unconditionally purges all IndexedDB data and localStorage**, wiping out the user's un-synchronized offline work!
- **The Mitigation:**  
  1. Detect Safari via user-agent or feature detection.
  2. Actively call `navigator.storage.persist()`.
  3. Ensure critical data is synchronized to the backend server before the user navigates away.

---

## 13. Performance Considerations

```text
I/O Latency Benchmark: Reading 1,000 Records (Total Size: 5 MB)
┌───────────────────────────────────────┬──────────────┬───────────────────────────┐
│ Storage Mechanism                     │ Read Latency │ Main Thread Impact        │
├───────────────────────────────────────┼──────────────┼───────────────────────────┤
│ localStorage.getItem() (Sync JSON)    │ 48 ms        │ Main Thread Frozen (Jank!)│
│ IndexedDB (Asynchronous LevelDB)      │ 12 ms        │ 0 ms (Zero freeze)        │
│ OPFS with SQLite WASM (In Worker)     │ 1.8 ms       │ 0 ms (Zero freeze)        │
└───────────────────────────────────────┴──────────────┴───────────────────────────┘
```

---

## 14. Tradeoffs

| Technology | Pros | Cons |
| :--- | :--- | :--- |
| **Cookies** | Automatic transport to server; protected by `HttpOnly` against XSS. | Tiny 4 KB limit; overhead on every HTTP request; vulnerable to CSRF if misconfigured. |
| **`localStorage`** | Simple synchronous API; persistent across sessions. | Blocks the Main Thread; strings only; 5 MB limit; vulnerable to XSS token theft. |
| **IndexedDB** | Huge capacity (gigabytes); asynchronous; structured indexing and querying. | Verbose transaction API; multi-tab upgrade deadlocks; vulnerable to Safari ITP purge. |
| **OPFS** | Near-native C binary read/write speeds; supports multi-megabyte SQLite databases. | Only synchronous inside Web Workers; relatively new API. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Storing JWT Access Tokens in `localStorage`
- **Scenario:** A developer stores authentication tokens in `localStorage` for convenience: `localStorage.setItem('token', jwt)`.
- **The Vulnerability:** **CRITICAL SECURITY RISK.** Any XSS flaw allows attacker JavaScript to execute `localStorage.getItem('token')` and permanently exfiltrate the credentials. Sensitive authentication tokens must reside in **`HttpOnly` cookies**!

### Trap 2: Believing `sessionStorage` Survives Across Tabs
- **Scenario:** A developer opens a link in a new browser tab and expects `sessionStorage` to be available.
- **The Reality:** **It is completely empty.** `sessionStorage` is strictly scoped to the **individual browser tab / window session**. Duplicating a tab copies the state, but opening a fresh tab creates an empty storage bucket.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior): "Why is reading large datasets from `localStorage` considered an architectural anti-pattern for performance?"
**Architectural Answer:**  
`localStorage` is a synchronous, blocking API that runs directly on the browser's **Main Thread**. When you call `localStorage.getItem()`, the browser’s JavaScript engine freezes execution while the operating system reads the file from physical disk. If the stored payload is several megabytes or the user’s disk is under high I/O pressure, the main thread can freeze for 50ms to 200ms, causing dropped animation frames and failing Core Web Vitals **INP** audits. Large datasets should always be stored asynchronously in **IndexedDB**.

### Question 2 (Lead): "How do you handle IndexedDB schema migrations and avoid database upgrade deadlocks in multi-tab applications?"
**Architectural Answer:**  
1. **Schema Migration:** Increment the database version number in `indexedDB.open('AppDB', newVersion)`. Define table schema alterations inside the `onupgradeneeded` lifecycle handler.
2. **Preventing Deadlocks:**
   - Attach an **`onversionchange`** listener to every open database connection:
     ```typescript
     db.onversionchange = () => { db.close(); notifyUserToReload(); };
     ```
   - When a new tab requests an upgrade, existing tabs gracefully close their connections, unblocking the upgrade.
   - Attach an **`onblocked`** listener to the opening tab to alert the user if background tabs are slow to close.

### Question 3 (Architect): "How would you architect an enterprise, local-first web application that stores 500 MB of relational records with sub-millisecond query performance?"
**Architectural Answer:**  
1. **Engine Selection:** Compile **SQLite to WebAssembly** with official OPFS (Origin Private File System) VFS bindings.
2. **Web Worker Offloading:** Run the SQLite WASM instance inside a dedicated **Web Worker**. The worker opens an exclusive `FileSystemSyncAccessHandle` to the private database file in OPFS.
3. **Zero Main-Thread Blocking:** The UI thread communicates with the worker asynchronously via `Comlink` or typed `postMessage` RPC. Complex SQL joins and transactions execute against raw binary disk blocks in microseconds without dropping a single UI frame.
4. **Eviction Defense:** Request persistent quota upfront via `navigator.storage.persist()`.
5. **Synchronization Layer:** Background Sync Worker reads local change outbox tables and synchronizes delta mutations to the central cloud database using conflict-resolution CRDTs or version vectors.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The Memory Peg: "The Four Storage Lockers"
- **Cookies:** The Passport Lanyard. Shown to every server guard on every step.
- **LocalStorage:** The Post-It Note. Quick to read, but you must freeze and drop everything while reading.
- **IndexedDB:** The Industrial Warehouse. Giant filing cabinets with barcode scanners (indexes).
- **OPFS:** The High-Speed SSD Drive in the Lab. Raw binary speed for heavy engines (SQLite WASM).

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **IndexedDB:** The standard browser asynchronous NoSQL database supporting object stores, indexes, and transactions.
- **OPFS (Origin Private File System):** A high-performance, private file storage sandbox optimized for direct binary access in Web Workers.
- **Storage Quota:** The browser-enforced disk space allocated to an origin (typically up to 60% of total disk).
- **`__Host-` Cookie:** The most secure cookie prefix, guaranteeing HTTPS, root path, and immunity from subdomain tampering.
- **The "Aha!" Insight:** `localStorage` is not free—it is a synchronous disk read on your animation thread! For anything larger than a user theme preference, always use IndexedDB!

---

## 19. Key Takeaways

1. **Never store authentication tokens in `localStorage`;** use `HttpOnly`, `SameSite=Lax` cookies with `__Host-` prefixes.
2. **`localStorage` is synchronous and blocks the main thread;** offload structured data to IndexedDB.
3. **Always handle `onversionchange` in IndexedDB** to prevent multi-tab database upgrade deadlocks.
4. **Call `navigator.storage.persist()`** to shield local databases from automatic browser LRU disk cleanup and Safari ITP purges.
5. **Use OPFS (Origin Private File System) in Web Workers** to run SQLite WASM databases at bare-metal speeds in the browser.
6. **IndexedDB transactions auto-commit on event loop ticks;** never `await fetch()` inside an active readwrite transaction.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER STORAGE ARCHITECTURE CHEAT SHEET                        │
├─────────────────────┬──────────────┬──────────────────┬────────────────────────────────┤
│ Storage Tier        │ Limit        │ Thread Model     │ Primary Use Case               │
├─────────────────────┼──────────────┼──────────────────┼────────────────────────────────┤
│ Cookies             │ 4 KB         │ Network Headers  │ Session IDs, Auth Tokens       │
│ localStorage        │ 5 MB         │ Synchronous Main │ Light UI flags, Theme mode     │
│ sessionStorage      │ 5 MB (Tab)   │ Synchronous Main │ Single-tab wizard forms        │
│ IndexedDB           │ Gigabytes    │ Asynchronous     │ Large datasets, offline caches │
│ OPFS (File System)  │ Gigabytes    │ Sync in Workers  │ SQLite WASM, raw binary files  │
├─────────────────────┴──────────────┴──────────────────┴────────────────────────────────┤
│ Secure Cookie Standard:                                                                │
│   Set-Cookie: __Host-auth=token; Secure; Path=/; SameSite=Lax; HttpOnly                │
│                                                                                        │
│ Persistent Storage Request:                                                            │
│   const isPersisted = await navigator.storage.persist();                               │
│                                                                                        │
│ Golden Architectural Rule:                                                             │
│   "Cookies for identity; IndexedDB for offline data; OPFS for high-speed engines."     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
