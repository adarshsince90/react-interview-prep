# 01: Angular to React Architectural Mapping Guide

---

## 1. Why This Topic Exists

When an enterprise engineering organization initiates a frontend modernization or cross-framework migration, the most expensive bottleneck is rarely typing speed or library selection. It is the cognitive translation cost borne by senior engineers who have spent years internalizing the idioms, decorators, and runtime assumptions of one framework and must now architect production systems in another.

An engineer with 10+ years of **Angular** and **.NET** experience possesses deep, hard-won wisdom regarding modularity, dependency management, lifecycle boundaries, and enterprise governance. However, attempting a literal, one-to-one translation of Angular primitives into React leads to severe antipatterns:
- Attempting to recreate Angular's hierarchical dependency injection tree using giant, monolithic React Context providers, destroying render performance.
- Wrapping every helper in an imperative class instance because "services must be classes."
- Misunderstanding `useEffect` as a direct substitute for `ngOnInit` and `ngOnDestroy`, leading to race conditions and infinite re-render loops.
- Recreating `EventEmitter` objects inside props instead of passing simple callback functions.

This chapter serves as the authoritative **Architectural Rosetta Stone**. It translates every fundamental Angular concept into its idiomatic React equivalent, stripping away superficial syntax to focus on the underlying computational and runtime differences.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Map every core Angular decorator and construct (`@Component`, `@Input`, `@Output`, `@Injectable`, `@ViewChild`, `ng-content`) to its native React equivalent.
- Translate template-driven structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) into idiomatic, performant JSX expressions.
- Contrast Angular's imperative lifecycle hook sequence (`ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`) with React's declarative synchronization model (`useEffect`, `useLayoutEffect`).
- Replace Angular Pipes with pure memoized functional projections.
- Re-architect content projection (`<ng-content>`) using React Named Slots and Compound Component patterns.
- Bridge conceptual similarities between ASP.NET Core Blazor/Razor components, Angular, and React.

---

## 3. Historical Evolution

The divergence between Angular and React architecture reflects two distinct philosophical approaches to web engineering:

1. **The Comprehensive Enterprise Framework Philosophy (Angular 2+):**
   Born out of Google's enterprise software requirements in 2016, Angular was designed as a "batteries-included," highly opinionated framework. It mandated TypeScript, Object-Oriented Programming (OOP), heavy decorator metadata (`@Component`, `@Injectable`), and an ambient runtime monkey-patching engine (`Zone.js`). Every Angular project looked nearly identical because the framework dictated routing, HTTP, forms, and dependency injection.
2. **The Minimalist Mathematical Projection Philosophy (React):**
   Born out of Facebook's feed infrastructure, React explicitly rejected the "framework" label, positioning itself as a minimal library for building user interfaces. It embraced functional programming, immutable data, and declarative JSX. Instead of decorators and class hierarchies, React favored composition, pure functions, and JavaScript closures.
3. **The Convergence Era (2020–Present):**
   Angular 16–18 adopted standalone components (retiring `@NgModule`), fine-grained Signals, and `@defer` syntax—ironically moving closer to React's modular, functional philosophy. Meanwhile, the React ecosystem standardized on full-stack frameworks (Next.js) with strict routing and server-first conventions, bringing enterprise structure to React.

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Prefabricated Modular Factory vs The Precision Woodworking Workshop

Imagine two distinct manufacturing methodologies:
- **The Angular Methodology (The Heavy Prefabricated Factory):**
  - In an Angular factory, every station has rigid, specialized machinery. A machine labeled `@Injectable` only accepts certified power cables; a container labeled `@Component` requires an explicit blueprint file (`.html`), a styling docket (`.scss`), and a control manual (`.ts`).
  - Workers follow strict procedural manuals: Step 1: Hook up the electricity (`ngOnInit`); Step 2: Check the gauges (`ngOnChanges`); Step 3: Power down (`ngOnDestroy`).
  - If you need a hammer, you submit a request through the central logistics conduit (`Injector`).
- **The React Methodology (The Precision Woodworking Studio):**
  - In a React workshop, there are no rigid monolithic machines. There are only workbench clamps, sharp hand tools, and raw lumber (`pure functions` and `JavaScript objects`).
  - If you want a table, you run a block of wood through a precision planer: `UI = Planer(Wood)`. If the wood dimensions change, you plane it again.
  - To pass tools around, a master carpenter simply hands the tool directly to the apprentice as an argument (`Props`). There is no paperwork, no decorator stamp, and no central logistics department.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The Master Architectural Rosetta Stone

| Angular Concept / Primitive | React Idiomatic Equivalent | Underlying Runtime Difference |
| :--- | :--- | :--- |
| **`@Component({ ... })`** | **Functional Component (`const Comp: FC`)** | Angular allocates a persistent class instance on the heap; React executes an ephemeral function that terminates in microseconds. |
| **`@Input()`** | **Component Props (`props.item`)** | Angular sets mutable instance properties; React receives an immutable, frozen prop object for that single render frame. |
| **`@Output() emit = new EventEmitter()`** | **Callback Props (`onAction: (val) => void`)** | Angular uses RxJS Subject instances; React passes raw JavaScript function references directly. |
| **`@Injectable({ providedIn: 'root' })`** | **Custom Hook (`useService()`) or Zustand Store** | Angular traverses a hierarchical injector tree; React uses module-level closures or React Context tree lookup. |
| **`@ViewChild('ref')`** | **`useRef<HTMLDivElement>(null)`** | Angular resolves queries after view check; React updates `.current` during the synchronous DOM Commit phase. |
| **`*ngIf="condition"`** | **Logical AND / Ternary (`{condition && <Comp />}`)** | Angular manipulates a dynamic `ViewContainerRef`; React simply omits the element descriptor from the returned JSX tree. |
| **`*ngFor="let item of list; trackBy: fn"`** | **`list.map(item => <Comp key={item.id} />)`** | Angular uses an internal diffing algorithm over collections; React relies on the reconciler's `key` attribute. |
| **`<ng-content select="[header]">`** | **Props Children / Named Slots (`header={<Slot />}`)** | Angular projects DOM nodes via template selectors; React passes ReactElements as arbitrary JavaScript properties. |
| **`ngOnInit()`** | **`useEffect(() => { ... }, [])`** | Angular fires synchronously after property initialization; React fires asynchronously after the first DOM Paint. |
| **`ngOnChanges(changes)`** | **State derivation or `useEffect(..., [dep])`** | Angular inspects previous vs current property values; React re-evaluates the entire component body on new props. |
| **`ngOnDestroy()`** | **`useEffect` cleanup return (`return () => cleanup()`)** | Angular tears down instance memory; React executes the returned closure function when the Fiber unmounts. |
| **Angular Pipe (`{{ val \| currency }}`)** | **Pure Helper Function or `useMemo`** | Angular evaluates pipes during dirty checking; React evaluates inline pure functions during rendering. |
| **`@NgModule`** | **ES Modules (`import`/`export`) & FSD Slices** | Angular bundled declarations into logical containers; React uses standard JavaScript modularity. |

---

## 6. Runtime Flow & Execution Traces

Let us trace the initialization, update, and teardown of a User Card component across both engines:

### Angular Component Lifecycle (Object-Oriented, Persistent)

```
1. Construction:       new UserCardComponent(injector) -> Heap allocated at 0x00A1
2. Input Binding:      userCard.user = inputUser;
3. ngOnInit():         Executes imperative setup logic (fetches initial data)
4. Template Linking:   Template views linked to class fields
5. Event Fired:        User clicks button -> Zone.js intercepts microtask
6. Change Detection:   ngDoCheck() -> Evaluates template expressions against 0x00A1
7. Teardown:           ngOnDestroy() -> Unsubscribes RxJS subscriptions; instance GC'd
```

### React Component Lifecycle (Functional, Ephemeral)

```
1. Invocation:         UserCard({ user }) called by React Reconciler
2. Stack Evaluation:   Body executes top-to-bottom:
                       - useState retrieves current state from Fiber.memoizedState
                       - useMemo evaluates derived values
                       - Returns lightweight JSX element tree descriptor
3. Reconciler Diff:    Compares returned VDOM against previous Fiber tree
4. Commit Phase:       Mutates physical DOM (surgical node update)
5. Layout / Paint:     Browser paints updated pixels to screen
6. Passive Effects:    useEffect callback fires asynchronously on background task
```

---

## 7. Memory Model & Heap Layout

```
ANGULAR HEAP TOPOLOGY (Class Instance + Injector Graph):
+---------------------------------------------------------------+
| Heap Memory (Long-Lived Component Instance)                  |
|                                                               |
|  UserCardComponent (0x00A1)                                   |
|    ├── user: { id: "u1", name: "Alice" }                      |
|    ├── authService: -> [Pointer to Root Injector Service]     |
|    ├── changeDetectorRef: -> [Pointer to ViewRef]             |
|    └── subscription: -> [RxJS Subscription Record]            |
|                                                               |
|  * Stays allocated in Old Space until route navigation        |
+---------------------------------------------------------------+

REACT HEAP TOPOLOGY (Decoupled Fiber + Closure Scope):
+---------------------------------------------------------------+
| FiberNode (Persistent Framework Internal Structure)           |
|   ├── memoizedState: [Hook 1] -> [Hook 2] -> null             |
|   ├── memoizedProps: { user: { id: "u1", name: "Alice" } }   |
|   └── stateNode: HTMLDivElement (Real DOM)                    |
+---------------------------------------------------------------+
| Call Stack (Microsecond Lifetime):                            |
|   UserCard() runs -> returns { type: 'div', props: ... }      |
|   Stack frame discarded immediately.                          |
+---------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### Content Projection vs Named Props Slot Composition

```
ANGULAR CONTENT PROJECTION (<ng-content>):
Parent Template:
  <app-dialog>
    <div header>Enterprise Settings</div>
    <div body>Configuration controls...</div>
  </app-dialog>

Child Template (dialog.component.html):
  <div class="modal">
    <header><ng-content select="[header]"></ng-content></header>
    <main><ng-content select="[body]"></ng-content></main>
  </div>

-------------------------------------------------------------------------

REACT NAMED SLOTS COMPOSITION (First-Class JavaScript Props):
Parent Component (App.tsx):
  <Dialog
    header={<h2>Enterprise Settings</h2>}
    body={<ConfigControls />}
    footer={<ActionButtons />}
  />

Child Component (Dialog.tsx):
  export const Dialog: FC<{ header: ReactNode; body: ReactNode; footer?: ReactNode }> = ({
    header,
    body,
    footer
  }) => (
    <div className="modal">
      <header>{header}</header>
      <main>{body}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Side-by-Side Architectural Transformation: Enterprise Data Table

Below is a complete, production-grade enterprise comparison translating a complex Angular component into idiomatic React:

#### 1. The Angular Implementation (`user-table.component.ts`)

```typescript
// Angular 17+ Standalone Component
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';

export interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <h3>{{ title | uppercase }}</h3>
      
      <div *ngIf="loading" class="spinner">Loading users...</div>

      <table *ngIf="!loading">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users; trackBy: trackById" [class.inactive]="!user.active">
            <td>{{ user.name }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button (click)="onSelect(user)">Select</button>
            </td>
          </tr>
        </tbody>
      </table>

      <ng-content select="[footer]"></ng-content>
    </div>
  `,
  styles: [`
    .inactive { opacity: 0.5; }
    .table-container { padding: 1rem; }
  `]
})
export class UserTableComponent implements OnInit, OnDestroy {
  @Input({ required: true }) title: string = '';
  @Output() userSelected = new EventEmitter<User>();

  private userService = inject(UserService);
  private sub?: Subscription;

  users: User[] = [];
  loading = true;

  ngOnInit(): void {
    this.sub = this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSelect(user: User): void {
    this.userSelected.emit(user);
  }

  trackById(index: number, user: User): string {
    return user.id;
  }
}
```

#### 2. The Idiomatic React 19 Implementation (`UserTable.tsx`)

```typescript
// React 19 Functional Component
import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useUserService } from '../hooks/useUserService';

export interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

interface UserTableProps {
  title: string;
  onUserSelected: (user: User) => void;
  footerSlot?: ReactNode;
}

export const UserTable: React.FC<UserTableProps> = ({
  title,
  onUserSelected,
  footerSlot
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userService = useUserService();

  // Replaces ngOnInit / ngOnDestroy lifecycle
  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      try {
        const data = await userService.fetchUsers();
        if (!isCancelled) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) setLoading(false);
      }
    }

    loadUsers();

    // Replaces ngOnDestroy unsubscribe
    return () => {
      isCancelled = true;
    };
  }, [userService]);

  // Replaces Angular UppercasePipe
  const formattedTitle = useMemo(() => title.toUpperCase(), [title]);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{formattedTitle}</h3>

      {loading ? (
        <div className="spinner">Loading users...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ opacity: user.active ? 1 : 0.5 }}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => onUserSelected(user)}>
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Replaces <ng-content select="[footer]"> */}
      {footerSlot && <div className="footer-container">{footerSlot}</div>}
    </div>
  );
};
```

---

## 10. Angular Comparison

For an experienced Angular developer, the cognitive shift requires abandoning the "Component as an Object" framework:

| Angular Architecture Construct | Angular Operational Mechanics | React Strategic Adaptation |
| :--- | :--- | :--- |
| **Two-Way Binding (`[(ngModel)]`)** | Syntactic sugar for property binding plus event listener (`[ngModel]` + `(ngModelChange)`). | **Explicit Unidirectional Flow:** Value prop passed down (`value={val}`), change handler passed up (`onChange={e => setVal(e.target.value)}`). |
| **Zone.js Ambient Tracking** | Patches all asynchronous browser tasks; triggers change detection automatically when promises resolve or timers fire. | **Explicit State Dispatch:** React *only* re-renders when a `setState()` action is explicitly dispatched or props change. |
| **Hierarchical Dependency Injection** | Injectors form a tree matching the DOM; child components inherit or override services provided by parent modules or components. | **React Context & Custom Hooks:** Context provides value downward through the Fiber tree; custom hooks encapsulate reusable domain logic. |
| **ChangeDetectionStrategy.OnPush** | Component is skipped during dirty checking unless an `@Input()` reference changes or an event fires inside the template. | **`React.memo()`:** Component skips re-execution if shallow comparison of previous props matches incoming props (`oldProps === newProps`). |

---

## 11. .NET Comparison

For engineers experienced with .NET, ASP.NET Core, and Blazor, comparing Angular and React clarifies fundamental architectural boundaries:

| .NET / C# Architecture Pattern | Angular Equivalent | React Functional Equivalent |
| :--- | :--- | :--- |
| **ASP.NET Core Dependency Injection (`IServiceCollection`)** | Hierarchical Injectors (`providedIn: 'root'`, `@Injectable()`). | React Context (`createContext`) paired with custom factory hooks. |
| **Blazor Server / WebAssembly Components** | Stateful Component Classes with `@code { ... }` blocks and `[Parameter]` attributes. | Pure Functional Components with TypeScript interface props. |
| **C# 9+ Records & `with` Expressions** | Deep Object copying or manual clone utilities. | Immutable spread operator (`{ ...state, updated: true }`) or Immer proxies. |
| **LINQ Projections (`.Select()`, `.Where()`)** | RxJS pipe operators (`map()`, `filter()`). | Native JavaScript functional array methods (`.map()`, `.filter()`). |
| **Action & Func Delegates (`Action<T>`)** | `@Output() EventEmitter<T>`. | Callback props (`(data: T) => void`). |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

Migrating large enterprise systems from Angular to React carries distinct architectural risks:

### 1. The Context Re-Render Cascade (Pseudo-DI Disaster)
- **The Risk:** Angular developers frequently attempt to replace Angular's DI system by placing an entire application's state, API clients, and mutable objects into a single global React Context at the root.
- **The Failure Mode:** Whenever *any* property inside the monolithic Context changes, **every single component subscribing to that Context re-renders**, completely defeating memoization and causing severe frame drops across large tables.
- **The Enterprise Defense:** Split contexts by frequency of change (e.g., `AuthContext` for static credentials vs `LiveTradesContext` for streaming data). For high-frequency state, bypass React Context entirely and use atomic external stores like **Zustand** with fine-grained selectors.

### 2. Stale Closure Traps in Asynchronous Effects
- **The Risk:** Angular developers are accustomed to reading `this.someProperty` inside asynchronous callbacks (like `setTimeout` or RxJS subscriptions), where `this` always points to the latest live instance value on the heap.
- **The Failure Mode:** In React, a function declared inside a component captures variables by value from that specific render frame. When the asynchronous callback resolves 3 seconds later, it accesses the **stale captured value** from the past, causing subtle race conditions.
- **The Enterprise Defense:** Use `useRef` when you need a mutable, live pointer that persists across render executions without triggering re-renders, or use functional state updaters: `setCount(prev => prev + 1)`.

---

## 13. Performance Considerations

```
ARCHITECTURAL OVERHEAD COMPARISON:
-------------------------------------------------------------
Framework Bundle Footprint:   Angular (~120 KB core) vs React (~42 KB core)
Zone.js Monkey-Patching Tax:  Angular: Intercepts all browser async tasks
                              React: Zero ambient patching (0 overhead)
Collection Reconciliation:    Angular trackBy vs React key prop
Reference Equality Speed:     Both achieve O(1) Object.is shallow checks
-------------------------------------------------------------
```

### Strategic Optimizations:
1. **Always Supply Stable Keys in Arrays:**
   Never use array index (`map((item, index) => <Comp key={index} />)`) if items can be sorted, deleted, or filtered. Always use stable domain IDs (`item.id`), mirroring Angular's `trackBy` function.
2. **Colocate State as Close as Possible:**
   Avoid lifting state to global stores if it is only consumed by a single widget or modal. Keep transient form state local to the component.

---

## 14. Tradeoffs

| Architectural Dimension | Angular Strategy | React Strategy |
| :--- | :--- | :--- |
| **Project Standardization** | Extreme consistency; opinionated CLI, structure, routing, and HTTP client. | High flexibility; requires explicit enterprise architecture standards (e.g. Feature-Sliced Design). |
| **Modularity & Bundle Size** | Traditionally heavier; relies on tree-shaking decorators and standalone components. | Ultra-lightweight core; only pays for what is explicitly imported. |
| **Learning Curve for OOP Engineers** | Low initial friction for Java / C# developers due to classes, decorators, and DI. | Steeper initial friction; requires embracing functional programming and closure physics. |
| **Refactoring & Type Safety** | Robust compile-time template checking via TypeScript language service. | Superior JSX refactoring; templates are 100% pure TypeScript without custom DSL parser gaps. |

---

## 15. Common Mistakes & Interview Traps

- **Trap 1: "React is just the View in MVC, so we need to build our own Controller classes."**
  *Why it fails:* Treating React components as dumb templates driven by external imperative Controller classes leads to synchronization hell. React's component model is declarative; state *is* the model, and UI is its mathematical projection.
- **Trap 2: Translating `EventEmitter` to RxJS Subjects in Props.**
  *Why it fails:* In React, pass simple callback functions (`onSelect: (user) => void`). Do not instantiate RxJS `Subject` instances inside props; this adds unnecessary memory overhead and requires manual subscription management.
- **Trap 3: Using `useEffect` for Data Derivation.**
  *Why it fails:* In Angular, developers frequently listen to `@Input()` changes via `ngOnChanges` and update another property. In React, do not write `useEffect(() => { setFullName(first + ' ' + last) }, [first, last])`. Derive it synchronously during render: `const fullName = `${first} ${last}`;`.
- **Trap 4: Forgetting the Cleanup Return in `useEffect`.**
  *Why it fails:* If you add an event listener or start a WebSocket connection in `useEffect` without returning a cleanup function, every re-render stacks a duplicate connection, creating massive memory leaks.

---

## 16. Interview Questions & Architectural Answers

### Question 1 (Senior Level): How does React's component lifecycle differ fundamentally from Angular's lifecycle hooks?
**Answer**:
- **Angular's Model:** Angular components are long-lived class instances residing on the V8 heap. Its lifecycle hooks (`ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`) are imperative procedure checkpoints triggered chronologically as the framework instantiates, mutates, and destroys that persistent object.
- **React's Model:** React functional components are ephemeral mathematical projections (`UI = f(state)`). The component function runs from top to bottom on every render pass, creating a fresh stack frame and returning a virtual DOM element tree before terminating in microseconds.
- **Synchronization over Lifecycle:** Instead of imperative lifecycle checkpoints, React uses **Synchronization Effects** (`useEffect`). `useEffect` declares what external systems (DOM listeners, network sockets) should be kept in sync with the current component state, and provides a cleanup function to tear down the synchronization when dependencies change or the component unmounts.

### Question 2 (Lead Level): How do you map Angular's Hierarchical Dependency Injection system to a clean React architecture?
**Answer**:
We use a **Hybrid Layered Approach**:
1. **Domain Services as Pure Singletons or Module Exports:** Stateless utility services and API clients (e.g., `HttpClient`, `TelemetryService`) are authored as pure TypeScript modules or configured singletons, imported directly via standard ESM syntax (`import { api } from '@/shared/api'`), requiring zero framework injection machinery.
2. **Stateful Scoped Services via React Context:** When a service must be scoped to a specific subtree (such as an Order Wizard or Modal flow), we wrap that subtree in a dedicated `ContextProvider`. Child components consume the service via a custom hook (`useWizardContext()`).
3. **Inversion of Control via Component Composition:** Instead of injecting service tokens to alter behavior, React favors component composition: passing components as props (Named Slots) or compound components, completely eliminating deep DI chains.
4. **Mocking in Tests:** Because functions and modules are native ESM, unit tests substitute dependencies using module-level mocks (Vitest `vi.mock()`) or MSW network-level interception without needing Angular's verbose `TestBed.configureTestingModule()`.

### Question 3 (Architect Level): How do you guide a team of 30 enterprise Angular developers transitioning to React without incurring code quality debt?
**Answer**:
1. **Architectural Standard Mandate:** Adopt a formal architectural framework like **Feature-Sliced Design (FSD)**. This provides the strict directory structure, boundary enforcement, and layer encapsulation that enterprise Angular engineers expect, preventing codebase entropy.
2. **Eliminate the "Class Reflex":** Establish strict ESLint rules enforcing functional components and prohibiting stateful class instances within UI directories.
3. **Mandate Custom Hooks for Logic:** Prohibit components from containing raw asynchronous `fetch` calls or complex business math. Require logic to be encapsulated in domain-specific custom hooks (`useWorkOrderWorkflow()`), separating presentation from state management.
4. **Tooling & TypeScript Strictness:** Enforce `strict: true` and ESLint rules for React Hooks (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`).
5. **Architectural Pair Programming & Rosetta Stone Workshops:** Run interactive code refactoring sessions walking through real-world transformations (e.g. converting an Angular reactive form and NgRx store to React Hook Form and Zustand).

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors)

### The "Decorator Factory vs Pure Woodworking Studio" Anchor
- **Angular:** A factory with heavy, labeled machinery (`@Component`, `@Injectable`). You follow a strict procedural manual (`ngOnInit`, `ngOnDestroy`).
- **React:** A clean workbench with hand tools. You run wood through the planer (`UI = f(State)`). When you need something done, you pass the tool directly as a prop. No stamps, no decorators, and no factory bureaucracy.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Ephemeral Execution:** The concept that a React component function executes and disappears in microseconds, retaining state exclusively via persistent Fiber pointers.
- **Named Slots:** Passing React elements as named props (`header={<Header />}`) to achieve flexible, type-safe content projection.
- **Unidirectional Data Flow:** Data strictly flows down via props; notifications strictly flow up via callback functions.
- **Closure Scope:** The lexical environment preserved when a function is created, capturing variables from the render pass in which it was declared.
- **Synchronization Effect:** React's `useEffect` primitive, which synchronizes external imperative systems with declarative state.

---

## 19. Key Takeaways

1. **Functions, Not Classes:** React components are not persistent objects on the heap; they are ephemeral functions projecting UI from state.
2. **Callbacks, Not EventEmitters:** Pass standard callback functions for child-to-parent communication; do not instantiate RxJS subjects in props.
3. **Synchronous Derivation:** Never use `useEffect` to derive state from props; calculate derived values directly in the render body.
4. **Named Slots for Projection:** Recreate Angular's `<ng-content>` using standard JSX props, enabling compile-time TypeScript type safety.
5. **Strict Key Props:** Always provide stable, unique `key` props for mapped arrays, matching Angular's `trackBy` function to prevent DOM reconciliation bugs.

---

## 20. Revision Sheet

- **Q: What is the React equivalent of Angular's `@Input()` decorator?**
  *A:* Component props passed into the function argument (`const MyComp: FC<Props> = ({ item }) => ...`).
- **Q: What is the React equivalent of Angular's `@Output()` with `EventEmitter`?**
  *A:* Callback functions passed as props (`onAction: (data) => void`).
- **Q: How does React replace Angular's `<ng-content select="[slot]">`?**
  *A:* First-class JSX named slot props (e.g., `headerSlot={<Header />}`).
- **Q: Why should you avoid using `useEffect` as a direct replacement for `ngOnInit` when deriving values?**
  *A:* Because deriving state via `useEffect` introduces an unnecessary extra render cycle and potential UI flicker; derived state should be calculated synchronously during the component's render execution.
- **Q: What React hook replaces Angular's `@ViewChild('ref')`?**
  *A:* `useRef<HTMLElement>(null)`.
