# Topic 05: Session Management & Refresh Token Rotation (RTR)

## 1. Why This Topic Exists
In modern enterprise applications, users expect to remain logged into their dashboards across work sessions without being aggressively booted back to a login screen every 15 minutes. However, issuing a 30-day Access Token is an architectural disaster: because Access Tokens are stateless bearer credentials, if an attacker intercepts one, there is no standardized, zero-latency mechanism to revoke it until its expiration timestamp elapses.

To balance security and frictionless user experience, the industry pairs **short-lived Access Tokens** (5 to 15 minutes) with **long-lived Refresh Tokens** (days or weeks). But in browser environments where Refresh Tokens must occasionally be handled by client runtimes, a stolen refresh token represents a persistent compromise. 

The IETF standardized **Refresh Token Rotation (RFC 6749 & OAuth 2.0 BCP)** to eliminate this threat: every single time a refresh token is used to acquire a new access token, the old refresh token is invalidated and a cryptographically distinct, single-use replacement is returned. Understanding **Token Family Tracking**, **Reuse Detection**, and the **Web Locks API** race-condition coordination is essential for building resilient, enterprise-grade authentication lifecycles.

---

## 2. Learning Objectives
By mastering this chapter, you will be able to:
- Understand the mechanics of **Refresh Token Rotation (RTR)** as mandated by modern OAuth standards.
- Analyze **Token Family Hierarchies** and implement **Automatic Compromise Revocation** upon detection of token reuse.
- Solve the **Concurrent Request Race Condition** (Thundering Herd) during token rotation using the browser's native **Web Locks API** (`navigator.locks`).
- Implement cross-tab authentication state synchronization via `BroadcastChannel`.
- Differentiate between **Sliding Sessions** (activity-based extension) and **Absolute Session Expirations**.
- Design graceful logout and session termination flows across distributed browser tabs and server session caches.

---

## 3. Historical Evolution

```
+--------------------------------------------------------------------------------------------------+
|                                    CHRONOLOGICAL EVOLUTION                                       |
+--------------------------------------------------------------------------------------------------+
| 2012 - Static Refresh Tokens (RFC 6749): Clients issued a single, reusable refresh token.        |
|        Catastrophic in browser SPAs: An attacker stealing the token gained perpetual access.     |
|                                                                                                  |
| 2019 - OAuth 2.0 for Browser-Based Apps (IETF BCP): Introduced Refresh Token Rotation (RTR).    |
|        Mandated that each refresh token MUST be strictly single-use for public clients.          |
|                                                                                                  |
| 2020 - Identity Providers Standardize Reuse Detection: Auth0, Okta, and Entra ID implement      |
|        "Token Family" lineage tracking to automatically quarantine accounts when reuse occurs.   |
|                                                                                                  |
| 2022+ - Web Locks API Integration: Modern frontend clients replace buggy localStorage mutexes   |
|         with native OS-level atomic browser locks (`navigator.locks.request`) for token refresh.|
+--------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The Relay Race Baton Exchange (Token Rotation)
Imagine a marathon where runners pass a wooden baton:
- Traditional Static Refresh Token: One runner carries a titanium key and can use it at every checkpoint indefinitely. If a pickpocket steals it, they can run through checkpoints forever.
- **Refresh Token Rotation (RTR):** Every checkpoint requires you to hand in your current wooden baton (`RT_1`). In exchange, the guard hands you a bottle of water (`Access Token`) and a brand-new, uniquely carved wooden baton (`RT_2`), while the old baton is instantly thrown into the incinerator.

### Analogy 2: The Double-Spent Check and the Bank Alarm (Reuse Detection)
What happens if a pickpocket stole your old baton (`RT_1`) right before you reached the checkpoint?
1. You hand in `RT_1` and receive `RT_2`. You continue running legitimately.
2. Five minutes later, the thief runs up to the checkpoint and attempts to redeem the stolen `RT_1`.
3. The guard looks at the ledger: *"Wait! Baton RT_1 was already turned in and burned 5 minutes ago! This means a thief has cloned the baton!"*
4. **The Alarm Sounds (Family Revocation):** The guard does not just arrest the thief; the guard broadcasts an emergency lockdown to all checkpoints: **revoke all batons belonging to this team immediately!** Both the thief and the legitimate runner are forced off the course to report to security (forced re-login).

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. Token Family Lineage Tree & Reuse Detection
The Identity Provider organizes issued tokens into a directed lineage graph:

```
+--------------------------------------------------------------------------------------------------+
|                                    TOKEN FAMILY LINEAGE GRAPH                                    |
+--------------------------------------------------------------------------------------------------+
| Family ID: "fam_98234-contoso"                                                                   |
|                                                                                                  |
|   [RT_1] (Active at 09:00)                                                                       |
|      │                                                                                           |
|      │ User requests refresh at 09:10                                                            |
|      ▼                                                                                           |
|   [RT_2] (Active at 09:10; RT_1 invalidated)                                                     |
|      │                                                                                           |
|      │ User requests refresh at 09:20                                                            |
|      ▼                                                                                           |
|   [RT_3] (Active at 09:20; RT_2 invalidated)                                                     |
|                                                                                                  |
|                                                                                                  |
| [BREACH SCENARIO: Attacker presents spent token RT_2 at 09:25]                                   |
|   1. IdP recognizes RT_2 belongs to Family "fam_98234-contoso".                                  |
|   2. IdP detects RT_2 status is ALREADY_REVOKED.                                                 |
|   3. INTRUSION ALERT TRIGGERED!                                                                  |
|   4. IdP cascades revocation across ALL tokens in the family:                                    |
|      - Revokes RT_3 (Legitimate user's active token)                                             |
|      - Invalidates all associated Access Tokens                                                  |
|      - Forces immediate step-up interactive re-authentication                                    |
+--------------------------------------------------------------------------------------------------+
```

### 2. The Multi-Tab Race Condition (The Thundering Herd)
Without proper client-side locking, multiple tabs making concurrent API calls will destroy the token family:

```
Tab 1 (Dashboard)                     Tab 2 (Reports)                        Identity Provider
   |                                     |                                          |
   | 1. Token expired!                   | 1. Token expired!                        |
   | 2. POST /token (uses RT_1)          | 2. POST /token (uses RT_1)               |
   |------------------------------------------------------------------------------->|
   |                                     |                                          |
   | 3. Arrives 1st (Valid):             |                                          |
   |    IdP issues RT_2 & burns RT_1     |                                          |
   |<-------------------------------------------------------------------------------|
   |                                     |                                          |
   |                                     | 4. Arrives 2nd (RT_1 ALREADY SPENT!):    |
   |                                     |    IdP flags REUSE ATTACK!               |
   |                                     |    REVOKES ENTIRE USER SESSION!          |
   |                                     |<-----------------------------------------|
```

---

## 6. Runtime Flow & Execution Traces

### Resilient Mutex Lock Execution via Web Locks API

```
Browser Tab 1                            Browser Tab 2                          Identity Provider
      |                                        |                                        |
      | 1. API call: Token Expired             | 1. API call: Token Expired             |
      | 2. Request lock:                       | 2. Request lock:                       |
      |    navigator.locks.request('rt_lock')  |    navigator.locks.request('rt_lock')  |
      |    ===> LOCK GRANTED!                  |    ===> QUEUED / WAITING               |
      |                                        |                                        |
      | 3. POST /token with RT_1               |    [Blocked waiting for lock release]  |
      |-------------------------------------------------------------------------------->|
      | 4. Return new tokens:                  |                                        |
      |    Access Token + RT_2                 |                                        |
      |<--------------------------------------------------------------------------------|
      |                                        |                                        |
      | 5. Update shared storage with RT_2     |                                        |
      | 6. Release Lock                        |                                        |
      |--------------------------------------->| 7. LOCK GRANTED TO TAB 2!              |
      |                                        |                                        |
      |                                        | 8. Check shared storage:               |
      |                                        |    Token was ALREADY refreshed!        |
      |                                        | 9. Read fresh Access Token & EXIT      |
      |                                        |    (Zero duplicate network call!)      |
```

---

## 7. Memory Model & Heap Layout

### Web Locks Operating System Primitives
Unlike JavaScript polling loops (`setInterval` checking flags in `localStorage`), the **Web Locks API** operates through native operating system synchronization primitives managed by the browser engine:

```
[Browser Process: Storage & Process Coordinator]
├── LockManagerEngine (C++ Blink / Chromium)
│   └── LockEntry: "auth_token_refresh_lock"
│       ├── Mode: EXCLUSIVE
│       ├── Holder: ClientContext (Tab 1, Process ID 4120)
│       └── WaitQueue: [ClientContext (Tab 2, Process ID 4128)]
│
[V8 Thread Context (Tab 1)]
└── Holds active Execution Scope inside lock callback Promise
```
This guarantees that even if a tab crashes midway through execution, the browser engine automatically cleans up the lock, preventing eternal client deadlocks!

---

## 8. Visual Diagrams (ASCII / Text)

### Cross-Tab Session Synchronization Topology

```
+---------------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER ORIGIN                                    |
|                                                                                             |
|   +-----------------------+     +-----------------------+     +-----------------------+     |
|   |   Browser Tab 1       |     |   Browser Tab 2       |     |   Browser Tab 3       |     |
|   |   (Dashboard)         |     |   (Analytics)         |     |   (Settings)          |     |
|   +-----------+-----------+     +-----------+-----------+     +-----------+-----------+     |
|               |                             |                             |                 |
|               +----------------------+      |      +----------------------+                 |
|                                      |      |      |                                        |
|                                      v      v      v                                        |
|   +-------------------------------------------------------------------------------------+   |
|   |                     BROADCASTCHANNEL: `auth_session_channel`                        |   |
|   |                                                                                     |   |
|   |   Supported Events:                                                                 |   |
|   |   - `SESSION_REFRESHED` : Broadcasts new expiry timestamp & updates memory state.   |   |
|   |   - `SESSION_LOGOUT`    : User logged out in Tab 1; all sibling tabs tear down UI.  |   |
|   |   - `SESSION_EXPIRED`   : Invalidation triggered; redirects all tabs to login.      |   |
|   +-------------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------------+
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [LabComponent.tsx](../../apps/portal/src/features/visualizers/topic-07-security/LabComponent.tsx) | Live in Portal: `topic-07-security`

### Pattern 1: Production Multi-Tab Token Synchronizer (`sessionSync.ts`)

```typescript
export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}

export class MultiTabAuthCoordinator {
  private static LOCK_NAME = 'auth_refresh_mutex';
  private static CHANNEL_NAME = 'auth_session_channel';
  private channel: BroadcastChannel;
  private currentSession: AuthSession | null = null;

  constructor(private onSessionUpdate: (session: AuthSession) => void, private onLogout: () => void) {
    this.channel = new BroadcastChannel(MultiTabAuthCoordinator.CHANNEL_NAME);
    this.channel.onmessage = this.handleChannelMessage.bind(this);
  }

  private handleChannelMessage(event: MessageEvent): void {
    const { type, payload } = event.data;
    if (type === 'SESSION_REFRESHED') {
      this.currentSession = payload;
      this.onSessionUpdate(payload);
    } else if (type === 'SESSION_TERMINATED') {
      this.currentSession = null;
      this.onLogout();
    }
  }

  /**
   * Acquires a fresh access token safely across multiple concurrent browser tabs.
   */
  public async getValidAccessToken(
    refreshTokenFn: () => Promise<AuthSession>
  ): Promise<string> {
    const now = Date.now();
    // 1. If existing in-memory token is valid (with 30-second buffer), use it
    if (this.currentSession && this.currentSession.expiresAt - 30000 > now) {
      return this.currentSession.accessToken;
    }

    // 2. Browser supports Web Locks API: coordinate atomically across all tabs
    if ('locks' in navigator) {
      return await navigator.locks.request(MultiTabAuthCoordinator.LOCK_NAME, async () => {
        // Double-check: another tab might have refreshed while we were waiting for the lock!
        if (this.currentSession && this.currentSession.expiresAt - 30000 > Date.now()) {
          return this.currentSession.accessToken;
        }

        // Execute single network refresh
        const freshSession = await refreshTokenFn();
        this.currentSession = freshSession;

        // Broadcast to all other open tabs
        this.channel.postMessage({
          type: 'SESSION_REFRESHED',
          payload: freshSession,
        });

        return freshSession.accessToken;
      });
    }

    // Fallback for older browsers without Web Locks
    const freshSession = await refreshTokenFn();
    this.currentSession = freshSession;
    return freshSession.accessToken;
  }

  public notifyLogout(): void {
    this.currentSession = null;
    this.channel.postMessage({ type: 'SESSION_TERMINATED' });
  }

  public destroy(): void {
    this.channel.close();
  }
}
```

---

## 10. Angular Comparison

| Feature / Architecture | Modern React Implementation | Angular Enterprise Implementation |
| :--- | :--- | :--- |
| **Token Refresh Lifecycle** | Custom React Context + Web Locks API synchronization. | `OAuthService` configured with `setupAutomaticSilentRefresh()` in Angular Root Module. |
| **Multi-Tab Sync** | Native `BroadcastChannel` and `navigator.locks`. | RxJS `OAuthService.events` subscribing to `token_received` and `token_expires` streams. |
| **HTTP Interception** | TanStack Query `fetch` interceptor or Axios request middleware. | `HttpInterceptorFn` intercepting 401s, piping through RxJS `catchError` and `switchMap` to trigger token refresh. |
| **Session Timers** | Custom `setTimeout` / `setInterval` managed inside React hooks. | RxJS `timer()` observables emitting inside Angular NgZone to manage renewal timeouts. |

---

## 11. .NET Comparison

| Feature / Architecture | Frontend Session & RTR | ASP.NET Core & IdentityServer Architecture |
| :--- | :--- | :--- |
| **Token Rotation Policy** | Ephemeral token management in browser. | Duende IdentityServer / OpenIddict configured with `RefreshTokenUsage = TokenUsage.OneTimeOnly`. |
| **Sliding Expiration** | Client tracks user interaction and resets refresh timer. | `CookieAuthenticationOptions.SlidingExpiration = true` updating cookie lifetime when request threshold exceeded. |
| **Family Revocation** | IdP revokes token family on reuse. | ASP.NET Core `ITokenRevocationStore` invalidating refresh token hashes in database upon detection of duplicate consumption. |
| **Distributed Session Cache**| `BroadcastChannel` in browser. | Redis-backed distributed ticket store (`ITicketStore`) allowing atomic cluster-wide session invalidations. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. Network Jitter & The False Reuse Trap
In high-latency mobile or corporate proxy networks, a legitimate client might issue a refresh request, the server processes it and issues `RT_2`, but the network packet containing `RT_2` drops before reaching the phone. The phone retries with `RT_1`.
If the IdP is aggressively configured without a **Grace Period**, it will erroneously flag the user's retry as an attack and lock them out!
**Enterprise Remedy:** Configure your Identity Provider with a **Brief Reuse Leeway Window (e.g. 10 to 30 seconds)**. During this grace period, requests presenting the immediately superseded token return the newly issued token without triggering family revocation.

### 2. Tab Memory Leaks from Zombie Broadcast Channels
If an application instantiates a `new BroadcastChannel()` inside a React component without closing it in the `useEffect` cleanup return, every re-render or route transition leaks event listeners and channel handles in the browser engine.

---

## 13. Performance Considerations

### 1. Proactive vs Reactive Token Renewal
- **Reactive Renewal (Wait for 401):** The application sends an API request, waits 200ms for the server to return 401 Unauthorized, catches the error, pauses, refreshes the token (300ms), and replays the original request. Total user latency: **500ms+**.
- **Proactive Renewal (Timer / Sentinel):** A background worker inspects token expiration and silently refreshes the token **60 seconds before it expires**. The user's API calls **never experience 401 delays**.

---

## 14. Tradeoffs

| Mechanism | Advantages | Disadvantages / Trade-offs |
| :--- | :--- | :--- |
| **Refresh Token Rotation (RTR)** | Eliminates persistent credential theft; enables automated intrusion detection. | Requires strict race-condition handling across tabs and network retry logic. |
| **Grace Period Leeway** | Prevents false-positive user lockouts during network packet loss. | Opens a small 10–30s time window where an attacker holding a spent token could still refresh. |
| **Web Locks API** | Native, zero-CPU atomic cross-tab synchronization. | Modern browser only (Chrome 69+, Safari 15.4+, Firefox 96+); requires fallback on legacy. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Building a Mutex with LocalStorage Flags
- **The Mistake:** Using `localStorage.setItem('isRefreshing', 'true')` to synchronize tabs.
- **The Reality:** LocalStorage operations are not atomic. Two tabs can read `false` at the exact same microsecond, both write `true`, and both execute concurrent refreshes, triggering reuse detection. Use the native `navigator.locks` API.

### Trap 2: Re-executing Logout Only on the Active Tab
- **The Mistake:** Clicking logout clears state only in Tab 1, leaving Tab 2 and Tab 3 active and capable of sending authenticated requests until their local caches expire.
- **The Reality:** Enterprise applications must broadcast session termination immediately via `BroadcastChannel` or storage events to instantly clear UI state and redirect all sibling tabs to the login screen.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Staff/Principal Question: How do you architect an enterprise session management system that supports both activity-based sliding sessions and a hard 12-hour maximum corporate compliance limit across 10 open browser tabs?
**Architectural Answer:**
1. **Dual-Timestamp Session Envelope:** Maintain two timestamps in the session model:
   - `lastActivityTimestamp`: Updated on every user interaction (clicks, keystrokes, API calls).
   - `sessionAbsoluteCreatedAt`: Fixed immutable timestamp when the user originally signed in.
2. **Sliding Window Rules:** A background worker or API gateway evaluates:
   - If `currentTime - lastActivityTimestamp > 30 minutes`: Session has timed out due to inactivity -> Terminate.
   - If `currentTime - sessionAbsoluteCreatedAt > 12 hours`: Maximum corporate compliance lifespan reached -> Terminate regardless of activity.
3. **Cross-Tab Activity Pulse:** Active tabs debounce and broadcast `USER_ACTIVE` events across `BroadcastChannel` every 60 seconds, updating the shared `lastActivityTimestamp` so activity in one tab keeps all other tabs alive.
4. **Enforcement at the Gateway:** Client timers are purely for UI warnings; the backend API Gateway / BFF strictly enforces the identical 30-minute idle and 12-hour absolute thresholds on the session cookie to prevent client tampering.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Burned Letter" Mental Model
- **Token Rotation:** Every secret letter you receive gives you the address of the next letter and self-destructs immediately.
- **Reuse Detection:** If the post office discovers someone tried to mail a copy of a letter that was already burned, they shut down the entire mail route.
- **Web Locks API:** Only one runner is allowed to enter the post office at a time. Everyone else waits in line.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Refresh Token Rotation (RTR):** Single-use refresh token exchange protocol issuing a new refresh token on every cycle.
- **Token Family:** A tracked cryptographic lineage of refresh tokens originating from a single login event.
- **Reuse Detection:** Security mechanism revoking an entire token family if an already-consumed refresh token is presented.
- **Web Locks API (`navigator.locks`):** Native browser asynchronous lock coordinator preventing multi-tab race conditions.
- **BroadcastChannel:** High-performance, same-origin pub/sub message bus between browser tabs and workers.

---

## 19. Key Takeaways
1. Never use static refresh tokens in browser applications; enforce Refresh Token Rotation.
2. Reuse detection immediately revokes the entire token family when spent tokens are submitted.
3. Use `navigator.locks.request` to prevent multi-tab Thundering Herd race conditions during token refresh.
4. Keep all open tabs synchronized via `BroadcastChannel` for seamless global logouts.
5. Combine activity-based sliding timeouts with absolute maximum session limits for enterprise compliance.

---

## 20. Revision Sheet

```
+--------------------------------------------------------------------------------------------------+
|                                  SESSION & RTR CHEAT SHEET                                       |
+--------------------------------------------------------------------------------------------------+
| Refresh Token Rotation Flow:                                                                     |
| 1. Client sends `RT_A` to `/token`.                                                              |
| 2. IdP validates `RT_A`, issues `AT_2` + `RT_B`, and marks `RT_A` as REVOKED.                    |
| 3. If `RT_A` is received again -> IdP revokes `RT_B` and all related tokens immediately!         |
|                                                                                                  |
| Race Condition Prevention:                                                                       |
| ```typescript                                                                                    |
| await navigator.locks.request('token_refresh_lock', async () => {                               |
|   if (isTokenStillFresh()) return token;                                                         |
|   return await fetchNewToken();                                                                 |
| });                                                                                              |
| ```                                                                                              |
| Golden Rules:                                                                                    |
| - Always configure an IdP reuse grace period (10-30s) to absorb network retries.                 |
| - Close BroadcastChannel instances in cleanup handlers.                                          |
+--------------------------------------------------------------------------------------------------+
```
