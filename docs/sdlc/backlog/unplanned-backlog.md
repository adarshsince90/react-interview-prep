# Unplanned Backlog

All prior items have been resolved and moved to [`backlog.md`](./backlog.md).

| Item Reference | Topic / Component | Status | Target Destination |
| :--- | :--- | :--- | :--- |
| `image-5.png` | Dashboard Phase Card Fixed Heights & Internal Scrollbar | ✅ Resolved | [`backlog.md`](./backlog.md) |
| `image-6.png` | Mermaid Diagram Box `1. Browser Network` Excessive Height | ✅ Resolved | [`backlog.md`](./backlog.md) |
| `image-7.png` | Section 3 `main.tsx` Code Block Left Margin Alignment | ✅ Resolved | [`backlog.md`](./backlog.md) |

---

### Dashboard URL Navigation & Refresh Desynchronization
- **Reported Issue:**
  Once we move to Dashboard from any guides page (e.g., `http://localhost:5173/?topic=00-react-application-lifecycle-architecture#17-senior-level-mental-model-how-to-remember-this-forever-layer-3`), the browser URL does not change. When we hit refresh in dashboard, it takes us back to the guide page.
- **Root Cause:**
  1. Navbar logo click and Dashboard tab button were calling `setActiveView('dashboard')` without updating `window.history` or stripping query params/hashes.
  2. `handleNavigateHome()` only removed `searchParams.delete('topic')` on the existing URL, leaving the hash `#17-...` intact.
- **Status:** ✅ Resolved & Moved to [`docs/sdlc/backlog/backlog.md#item-ui-06-url-routing-synchronization-on-dashboard-navigation--refresh`](./backlog.md#item-ui-06-url-routing-synchronization-on-dashboard-navigation--refresh)
