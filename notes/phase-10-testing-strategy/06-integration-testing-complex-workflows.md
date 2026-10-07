# Phase 10 — Topic 06: Integration Testing Complex User Workflows

## 1. Why This Topic Exists
Testing individual components or pure utilities in isolation provides little guarantee that complex enterprise user workflows will function in production. In enterprise applications, high-value business operations—such as completing a multi-step checkout wizard, executing an optimistic state mutation that gracefully rolls back on network error, or navigating guarded router paths—span multiple interacting components, asynchronous networks, form validation libraries, and React Error Boundaries.

When teams lack a structured approach to workflow integration testing, they either:
1. Defer all workflow testing to slow, flaky end-to-end browser suites, or
2. Break workflows into artificial unit tests with hundreds of mocks, completely missing subtle timing races, focus management traps, and state synchronization bugs.

By writing **Component Integration Tests** that mount entire feature slices inside in-memory routing and state harnesses, architects can verify complex, multi-step business journeys in single-digit seconds with near-E2E confidence.

---

## 2. Learning Objectives
By completing this chapter, you will be able to:
- Architect and execute integration tests for **Multi-Step Wizards** preserving form state across sequential screen transitions.
- Test **Optimistic UI Updates and Rollbacks**: verify that the UI renders immediate optimistic feedback and accurately rolls back to previous state when an API call fails.
- Test **React Error Boundaries**: intentionally trigger runtime rendering errors in subtrees and verify fallback UI and recovery button actions.
- Test client-side routing transitions, URL state synchronization, and route guard redirects using **`MemoryRouter`**.
- Validate complex form workflows (React Hook Form / Zod) including asynchronous schema validation and field-level error messages.
- Test accessible **Modal Dialogs and Portals**: verify focus trapping, DOM unmounting, and keyboard Escape key dismissals within JSDOM / Happy-DOM.

---

## 3. Historical Evolution
```
+---------------------------------------------------------------------------------------------------+
| 2013 - 2017: Multi-Repo Manual Verification & Selenium Tests                                      |
| Multi-step workflows could only be tested via slow Selenium scripts. Staging environment outages   |
| and database state collisions meant tests failed more often due to infrastructure than bugs.      |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2018 - 2021: Component Unit Isolation & Mock Chains                                               |
| Teams broke wizards into isolated step components: Step1.test, Step2.test. Each test mocked the   |
| wizard state container. Result: Workflows passed tests, but failed when steps handed off state.   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2022 - Present: In-Memory Feature Slice Integration (RTL + MemoryRouter + MSW)                    |
| Mount entire feature slices in-memory. Realistic routing via MemoryRouter, zero-latency network   |
| via MSW, and authentic user interactions via @testing-library/user-event. Sub-second workflows.   |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)
Think of workflow integration testing through physical engineering analogs:

### Analogy 1: The Airport Baggage Conveyor System (The Multi-Step Workflow)
Imagine testing an automated airport baggage handling system:
- **Unit Testing**: Testing individual motorized rollers on a workbench. Do they spin when electric current is applied?
- **Workflow Integration Testing**: Placing a 25kg suitcase at Check-in Counter 4, having it pass through the barcode scanner (Step 1), divert through the X-ray inspection station (Step 2), navigate the sorting belt switch (Step 3), and slide down Chute 12 into the cargo cart.
Testing the rollers in isolation tells you nothing about whether the barcode scanner communicates with the sorting switch fast enough to divert the suitcase before it falls off the belt. **The value is in the handoff.**

### Analogy 2: The Safety Net and Trapeze Artist (Error Boundary Testing)
In a circus trapeze act:
- The acrobat (**The React Component**) attempts a triple flip.
- If the acrobat slips (**A Runtime Render Exception**), the circus does not catch fire and spectators do not get hurt.
- The safety net (**The React Error Boundary**) catches the acrobat, stabilizes them, and an assistant helps them climb back onto the ladder (**The "Try Again" Recovery Action**).
An integration test throws the acrobat into the net intentionally to prove the net holds the weight and the ladder works.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The Integration Test Harness Architecture
A resilient workflow integration test bundles the target feature inside real provider implementations rather than mocks:

```
+-------------------------------------------------------------------------+
| INTEGRATION TEST HARNESS                                                |
|                                                                         |
| MemoryRouter (initialEntries={['/checkout/step-1']})                    |
|   └── QueryClientProvider (queryClient with retry: false)               |
|         └── ThemeProvider & AuthProvider                                |
|               └── CheckoutFeatureSlice (The Real Feature Under Test)    |
|                     ├── Step 1: Customer Details                        |
|                     ├── Step 2: Shipping Method                         |
|                     └── Step 3: Payment & Order Confirmation            |
+-------------------------------------------------------------------------+
                                     |
                                     | Real Fetch Calls
                                     v
                  [ MSW Interceptor (Network Layer) ]
```

### Optimistic UI & Rollback Mechanics Under Test
When testing optimistic UI with TanStack Query:
1. User clicks "Favorite" button.
2. `onMutate` immediately writes the optimistic record to the query cache: the UI updates the heart icon to filled.
3. MSW intercepts the HTTP request and returns an HTTP 500 Internal Server Error.
4. `onError` executes: restores the previous cache snapshot captured in `onMutate`.
5. The UI automatically rolls back: the heart icon reverts to unfilled, and an error toast displays to the user.

---

## 6. Runtime Flow & Execution Traces

### Trace: Multi-Step Checkout Wizard Workflow
```
Step 1: Test renders feature inside MemoryRouter at '/checkout':
        render(<CheckoutFlow />, { wrapper: TestHarness });

Step 2: Step 1 Screen is active:
        expect(screen.getByRole('heading', { name: /shipping address/i })).toBeInTheDocument();
        await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace');
        await user.type(screen.getByLabelText(/postal code/i), '94107');
        await user.click(screen.getByRole('button', { name: /continue to shipping/i }));

Step 3: Internal state preserved; Router navigates to '/checkout/shipping':
        // Assert Step 1 unmounted and Step 2 mounted
        expect(await screen.findByRole('heading', { name: /select delivery/i })).toBeInTheDocument();
        await user.click(screen.getByRole('radio', { name: /express overnight/i }));
        await user.click(screen.getByRole('button', { name: /continue to payment/i }));

Step 4: Step 3 Review & Submit:
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument(); // Verifies state handoff!
        expect(screen.getByText('Express Overnight')).toBeInTheDocument();

Step 5: User clicks "Confirm Order":
        MSW handles POST /api/orders and returns { orderId: 'ORD-992' }.
        expect(await screen.findByRole('heading', { name: /order confirmed/i })).toBeInTheDocument();
        expect(screen.getByText('ORD-992')).toBeInTheDocument();
```

---

## 7. Memory Model & Virtual DOM Portal Layout

```
JSDOM DOCUMENT TREE (PORTAL & MODAL LAYOUT)

<body>
  <!-- Standard Root Mount Container -->
  <div id="root">
    <main>
      <h1>Customer Dashboard</h1>
      <button role="button">Delete Account</button>
    </main>
  </div>

  <!-- React Portal Destination Node -->
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">Confirm Deletion</h2>
    <p>Are you sure you want to delete your account?</p>
    <button role="button">Cancel</button>
    <button role="button">Confirm Delete</button>
  </div>
</body>

Key Assertion Invariant:
screen.getByRole('dialog') successfully queries the portal node in JSDOM
because RTL queries document.body, regardless of React root hierarchy.
```

---

## 8. Visual Diagrams (ASCII / Text)

### Optimistic Mutation & Rollback Cycle Under Test
```
[ User Clicks 'Like' ]
          |
          v
[ 1. onMutate: Cache Updated Optimistically ]
          |
          +---> UI immediately shows: 'Liked (101)'
          |
[ 2. HTTP POST /api/likes ]
          |
          v (MSW returns HTTP 500 Error)
[ 3. onError: Rollback Cache Snapshot ]
          |
          +---> UI rolls back: 'Like (100)'
          |
[ 4. Error Toast Notification ]
          +---> UI displays: 'Could not update like. Please try again.'
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [TestingLab.tsx](../../apps/portal/src/features/visualizers/topic-10-testing/TestingLab.tsx) | Live in Portal: topic-10-testing

### Pattern 1: Testing Optimistic Updates with Rollback
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LikeButton } from './LikeButton';

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

test('optimistically increments like count, then rolls back on network error', async () => {
  const user = userEvent.setup();

  // 1. Simulate server failure on like endpoint
  server.use(
    http.post('/api/posts/1/like', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderWithQuery(<LikeButton postId="1" initialLikes={10} />);
  const button = screen.getByRole('button', { name: /like/i });

  expect(button).toHaveTextContent('10 Likes');

  // 2. Click button
  await user.click(button);

  // 3. Immediately assert optimistic state BEFORE server responds
  // (In-memory update occurs synchronously in onMutate)
  expect(button).toHaveTextContent('11 Likes');

  // 4. Assert rollback after HTTP 500 error triggers onError handler
  expect(await screen.findByText('10 Likes')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent(/failed to update like/i);
});
```

### Pattern 2: Testing React Error Boundaries & Recovery
```tsx
import { Component, ReactNode, ErrorInfo } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress test log noise if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Faulty component that throws conditionally
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Explosion!');
  }
  return <div>Component is healthy</div>;
}

test('catches rendering crash, shows fallback UI, and recovers', async () => {
  const user = userEvent.setup();
  
  // Prevent React from logging uncaught exception to console during test
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const { rerender } = render(
    <ErrorBoundary>
      <BombComponent shouldThrow={false} />
    </ErrorBoundary>
  );

  expect(screen.getByText('Component is healthy')).toBeInTheDocument();

  // Trigger fatal render exception
  rerender(
    <ErrorBoundary>
      <BombComponent shouldThrow={true} />
    </ErrorBoundary>
  );

  // Assert Error Boundary captured error and displayed fallback
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();

  // Test recovery: repair component and click "Try Again"
  rerender(
    <ErrorBoundary>
      <BombComponent shouldThrow={false} />
    </ErrorBoundary>
  );
  await user.click(screen.getByRole('button', { name: /try again/i }));

  expect(screen.getByText('Component is healthy')).toBeInTheDocument();
  spy.mockRestore();
});
```

### Pattern 3: Testing Modals and Keyboard Escape Dismissal
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal } from './ConfirmationModal';

test('opens modal dialog, traps focus, and dismisses on Escape key', async () => {
  const user = userEvent.setup();
  render(<ConfirmationModal />);

  // Open modal
  await user.click(screen.getByRole('button', { name: /delete profile/i }));

  // Modal dialog renders to DOM (via React Portal)
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /confirm deletion/i })).toBeInTheDocument();

  // Test keyboard Escape dismissal
  await user.keyboard('{Escape}');

  // Modal unmounts from DOM
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

---

## 10. Angular Comparison
For an engineer transitioning from enterprise Angular:

| Architectural Concept | Enterprise Angular Testing | Modern React Workflow Testing |
| :--- | :--- | :--- |
| **Routing Harness** | `RouterTestingModule.withRoutes([...])`. | `MemoryRouter` with `initialEntries={['/path']}`. |
| **Error Handling** | `ErrorHandler` service provider override. | Testing React class `<ErrorBoundary>` fallbacks directly in RTL. |
| **Forms Testing** | Reactive Forms testing (`formGroup.controls.email.setValue(...)`). | Accessible DOM interactions via `@testing-library/user-event`. |
| **Portal / Overlays** | Angular CDK Overlay (`OverlayContainer.getContainerElement()`). | Direct `document.body` queries in RTL (`screen.getByRole('dialog')`). |

---

## 11. .NET Comparison
For a Senior .NET / ASP.NET Core Architect:

| Architectural Concept | .NET / Blazor Testing | React Workflow Testing |
| :--- | :--- | :--- |
| **Multi-Step Testing** | State machine tests or Blazor component cascading parameters. | Multi-screen integration tests with `MemoryRouter` and real stores. |
| **Optimistic Concurrency**| Unit of Work rollback or EF Core transaction rollback. | TanStack Query `onError` snapshot restoration tested via MSW HTTP 500. |
| **Exception Handling** | Testing ASP.NET Core `ExceptionHandlerMiddleware`. | Testing React `<ErrorBoundary>` fallback UI rendering. |
| **Route Guards** | Testing `AuthorizeRouteView` or custom authorization policies. | Testing route redirect components (`<Navigate to="/login" replace />`). |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The "Silent Wizard State Loss" Vulnerability
- In complex onboarding and financial checkout wizards, users frequently navigate backwards using the browser "Back" button or breadcrumbs.
- If the form state was stored in local component state (`useState`) within individual step components rather than a persistent slice or URL state, navigating backward permanently erases user input.
- **Enterprise Mitigation**: Integration tests must explicitly simulate backwards navigation:
  ```typescript
  await user.click(screen.getByRole('button', { name: /next/i }));
  await user.click(screen.getByRole('button', { name: /previous/i }));
  expect(screen.getByLabelText(/email/i)).toHaveValue('saved@acme.com');
  ```

### The Unhandled Error Boundary Cascade
- If an enterprise application has only one top-level Error Boundary at the root of the app, any minor widget crash (e.g. an unhandled null exception inside an avatar badge) unmounts the **entire application**, presenting a white screen or global error page to the customer.
- **Enterprise Mitigation**: Place granular Error Boundaries around self-contained widgets (e.g., `<SidebarErrorBoundary>`, `<FeedErrorBoundary>`). Write integration tests asserting that when a feed crashes, the primary navigation bar remains fully interactive.

---

## 13. Performance Considerations
- **Console Error Suppression**: When testing Error Boundaries, React intentionally prints the full stack trace to `console.error`. In test suites with 50 error boundary tests, this floods CI terminal logs with thousands of lines of red text. Spy on `console.error` via `vi.spyOn(console, 'error').mockImplementation(() => {})` and restore it immediately after the test.
- **MemoryRouter vs BrowserRouter**: Never use `BrowserRouter` in Vitest/JSDOM tests; always use `MemoryRouter`. `MemoryRouter` operates entirely in memory without touching browser `window.history`, preventing cross-test URL pollution.

---

## 14. Tradeoffs

| Architecture Choice | Primary Benefit | Operational Cost / Drawback |
| :--- | :--- | :--- |
| **Feature Integration Tests** | Tests real state handoffs; high confidence; catches optimistic bugs. | Setup requires wrapping in providers (Router, QueryClient); slightly slower than unit tests. |
| **E2E Playwright Tests** | Tests real browser layout and real database persistence. | High execution time; expensive cloud compute; potential environmental flakiness. |
| **Step-by-Step Unit Tests** | Quick to run; simple isolated component harnesses. | Zero confidence in state handoff between wizard screens. |

---

## 15. Common Mistakes & Interview Traps
- **Trap 1: Not testing the rollback state in optimistic updates.**
  - *Symptom*: Developers test that clicking "Like" increments the count, but never simulate an HTTP error to verify that it reverts back.
  - *Fix*: Use MSW `server.use(http.post(..., 500))` to verify both optimistic increment and rollback restoration.
- **Trap 2: Using `BrowserRouter` in tests.**
  - *Symptom*: Route transitions in Test A bleed into Test B because `window.history` is global.
  - *Fix*: Use `MemoryRouter` with `initialEntries`.
- **Trap 3: Forgetting to restore `console.error` spies.**
  - *Symptom*: Unrelated errors in subsequent tests are silently hidden.
  - *Fix*: Always call `spy.mockRestore()` in `afterEach` or finally blocks.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior Level): How do you test that an optimistic UI update correctly rolls back when a backend API request fails?
**Answer**:
We test the 4-phase transaction contract:
1. **Initial Baseline**: Render the component with an in-memory `QueryClientProvider` and assert the initial count (e.g. `10 Likes`).
2. **Mock Network Error**: Configure MSW using `server.use()` to intercept the mutation endpoint and return an HTTP 500 error.
3. **Optimistic Immediate State**: Simulate user interaction (`await user.click(likeBtn)`). Synchronously assert that the UI immediately updates to `11 Likes` before the network returns.
4. **Rollback & Error Notification**: Await the failed promise resolution using `await screen.findByText('10 Likes')`. Assert that:
   - The like count reverted to the original baseline (`10 Likes`).
   - An accessible error alert (`role="alert"`) displays explaining the failure.
This verifies that `onMutate` captured the correct context snapshot and `onError` applied the rollback.

### Question 2 (Lead Level): How do you structure integration tests for a 5-step wizard to guarantee that state is not lost when users navigate back and forth?
**Answer**:
We treat the wizard as a single cohesive **Feature Slice**:
1. **Single Mounting Harness**: We mount the root `<OnboardingWizard />` wrapped in a `MemoryRouter` and real state store (Zustand or Context), without mocking the child step components.
2. **Sequential Traversal**: We use `userEvent` to fill out Step 1, click "Next", verify Step 2 appears, fill out Step 2, and click "Next" to reach Step 3.
3. **Bi-Directional Verification**: We simulate clicking the "Back" button to return to Step 2, asserting that Step 2's inputs retain their previously entered values. We click "Back" again to Step 1, verify Step 1's values are intact, and then click "Next" repeatedly back to Step 3.
4. **Final Submission**: We fill out the final step and click "Submit", verifying that the payload sent to MSW contains the consolidated data from all 5 steps. This guarantees that step unmounting does not dispose of wizard state.

### Question 3 (Architect Level): How do you test Error Boundaries to ensure resilience against partial UI failure without crashing the whole application?
**Answer**:
To verify partial failure resilience:
1. **Create Fault Injection Components**: In test utilities, create a `<CrashTrigger shouldCrash={boolean} />` component that throws an error when a prop is toggled.
2. **Mount Composite Layout**: Render the full layout containing the protected widget alongside unrelated widgets (e.g., `<Header />`, `<Sidebar />`, and `<ProtectedWidget><CrashTrigger /></ProtectedWidget>`).
3. **Trigger Error & Assert Isolation**: Trigger the crash and assert:
   - The `<ProtectedWidget>` renders the designated fallback UI (`role="alert"`).
   - The `<Header />` and `<Sidebar />` remain fully mounted, interactive, and functional in the DOM.
4. **Test Self-Healing Recovery**: Assert that the fallback UI provides an action (e.g. "Retry"), trigger the retry, and verify that the widget unmounts the error state and recovers normal rendering.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Baggage Carousel & Safety Net" Rule
- **A multi-step wizard is an Airport Baggage Carousel**: Never test the rollers independently; test that the suitcase moves across all transfer belts to the airplane without falling through the cracks.
- **An Error Boundary is the Trapeze Safety Net**: Intentionally drop the acrobat in your tests to prove the net catches them and they can climb back onto the ladder.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
- **Feature Slice Testing**: Mounting an entire domain workflow (wizards, forms, routers) in-memory rather than testing individual sub-components in isolation.
- **MemoryRouter**: In-memory React Router implementation that stores history internally in an array, making it perfect for tests.
- **Optimistic Rollback**: Reverting UI state back to its previous valid snapshot when a speculative mutation fails on the server.
- **Error Boundary**: A React component that catches JavaScript errors anywhere in its child component tree, logs the errors, and displays a fallback UI.
- **Focus Trap**: An accessibility mechanism ensuring keyboard focus cannot leave an active modal dialog.

---

## 19. Key Takeaways
- Test multi-step workflows by mounting the entire feature slice inside a `MemoryRouter` harness.
- Always test both the optimistic state update AND the rollback recovery on HTTP 500 failure.
- Verify that Error Boundaries catch child rendering crashes while keeping sibling widgets interactive.
- Use `MemoryRouter` with `initialEntries` to test client-side routing transitions and guard redirects.
- Test modal portals for proper ARIA roles, focus management, and Escape key dismissal.

---

## 20. Revision Sheet
- **Q: Which router should always be used in Vitest/RTL tests?**
  *A:* `MemoryRouter`.
- **Q: How do you verify an optimistic rollback in RTL?**
  *A:* Click the action, assert the optimistic update immediately, then await the rollback to the original count via `findByText` after MSW returns an error.
- **Q: Why does React log console errors during Error Boundary tests?**
  *A:* React intentionally logs unhandled component render errors; spy on `console.error` and mock it to keep CI logs clean.
- **Q: Can React Testing Library query elements rendered into React Portals outside the root container?**
  *A:* Yes, because RTL queries against `document.body` by default, finding portals rendered into body.
- **Q: How do you simulate pressing the Escape key using `userEvent`?**
  *A:* `await user.keyboard('{Escape}')`.
