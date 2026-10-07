# 04: Angular Hierarchical Dependency Injection vs React Composition & Context

---

## 1. Why This Topic Exists

In enterprise software engineering, **Inversion of Control (IoC)** and **Dependency Injection (DI)** are universally regarded as foundational architectural pillars. For over two decades, enterprise ecosystems like **.NET** (`IServiceCollection`, Autofac) and **Angular** (Hierarchical Injectors, `@Injectable`) have relied on formal DI containers to decouple business logic from presentation, manage object lifetimes, and facilitate unit testing through mock injection.

When an engineer trained in Angular and .NET transitions to React, they are often stunned to discover that **React has no built-in Dependency Injection container.** There is no `@Injectable`, no injector tree, and no `providers: []` array.

This absence frequently leads experienced architects to commit three critical mistakes:
1. **Reinventing the Container:** Attempting to force heavy third-party DI containers (like InversifyJS or TSyringe) into React components, fighting React's functional lifecycle and complicating bundle sizes.
2. **The "Context as DI" Trap:** Creating a monolithic "Mega-Context" at the application root that provides all services, inadvertently forcing every component across the entire application to re-render whenever any service state mutates.
3. **Over-Engineering Through Abstraction:** Building deep class inheritance hierarchies and interface indirection for simple presentation widgets that could be composed directly using native JSX props.

React solves the problem of code reuse, decoupling, and testing through a completely different paradigm: **Pure Component Composition, JavaScript Closures, and Scoped React Context**. This chapter delivers the definitive comparison between Angular's Hierarchical DI and React's composition architecture.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Deconstruct the differences between Angular's **Hierarchical Injector Tree** (ModuleInjector vs ElementInjector) and React's **Context Tree**.
- Replace complex Angular provider recipes (`useClass`, `useValue`, `useFactory`, `InjectionToken`) with idiomatic React custom hooks and factory functions.
- Eliminate "Context Provider Hell" using Component Composition, Named Slots, and Compound Component patterns.
- Compare service lifetime scopes: Singleton, Scoped, and Transient across Angular, React, and ASP.NET Core.
- Architect clean, hermetic unit tests in React without relying on verbose `TestBed` injection harnesses.
- Implement the Strategy Pattern in React using first-class JSX component props.

---

## 3. Historical Evolution

The divergence in dependency management between Angular and React traces back to fundamental software design philosophies:

1. **The Classic Enterprise Java/C# Heritage (Angular 2+ / 2016):**
   Angular was designed by engineers deeply influenced by Spring and enterprise .NET. It adopted strict Inversion of Control, decorators, and a hierarchical injector tree mirroring the DOM. Angular argued that components should never instantiate their own dependencies (`new MyService()`), but should instead receive them through constructor injection. This enabled enterprise teams to swap implementations (e.g., mock HTTP clients during testing) without altering component code.
2. **The Functional Composition Heritage (React / 2013–Present):**
   React drew inspiration from functional programming (Lisp, Haskell, Scheme). In functional programming, dependency injection is simply **Function Currying and Higher-Order Functions**. If Component A needs a capability from Component B, Component B simply passes it down as an argument (`Prop`). To solve deep prop drilling without passing props through 10 intermediate components, React introduced the **Context API** (`createContext`), creating a scoped lexical broadcast channel down the Fiber tree.

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### The Central Logistics Pneumatic Tube vs Passing Tools by Hand

Imagine two distinct manufacturing floors:
- **The Angular Model (The Central Logistics Pneumatic System):**
  - Every workbench has a brass pneumatic tube terminal mounted on the wall (`Constructor Injection`).
  - When an assembler needs a torque wrench (`@Inject(WrenchToken)`), they send a coded request through the tube.
  - The request travels up the factory's hierarchy:
    1. First, it checks the local workstation drawer (`ElementInjector`).
    2. If not found, it checks the department stockroom (`Parent ElementInjector`).
    3. If still not found, it routes to the central factory warehouse (`Root ModuleInjector`).
  - The technician never touches the manager or knows where the wrench came from; the system delivers the wrench through the tube.
- **The React Model (Direct Workshop Hand-Off & The Shop Radio):**
  - There are no pneumatic tubes and no central warehouse registry.
  - If a master carpenter wants an apprentice to use a specialized chisel, they simply place the chisel directly into the apprentice's hands as an argument: `<Apprentice chisel={fineChisel} />` (`Component Props & Composition`).
  - If the entire workshop needs to know the current factory shift time without the foreman walking to every bench, the foreman plays the announcement over the **Shop Radio** (`React Context`). Any bench that tunes their radio (`useContext`) hears the broadcast directly.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### Angular Hierarchical Injector vs React Context Tree

```
ANGULAR HIERARCHICAL INJECTOR RESOLUTION:
[ Root ModuleInjector ] (Singletons: AuthService, HttpClient)
         │
         ▼
[ Feature ModuleInjector ] (BillingService)
         │
         ▼
[ ElementInjector: ParentComponent ] (Local State / Overridden Token)
         │  (@Self(), @SkipSelf(), @Optional() modifiers)
         ▼
[ ElementInjector: ChildComponent ] (Consumes resolved instance)

-------------------------------------------------------------------------

REACT CONTEXT & COMPOSITION RESOLUTION:
<App>
  <AuthContext.Provider value={auth}>          <--- Context Broadcast 1
    <Header />
    <DashboardLayout>
      <BillingContext.Provider value={billing}> <--- Context Broadcast 2
        <InvoiceWidget
          renderAction={(inv) => <PayButton />} <--- Direct Slot Composition!
        />
      </BillingContext.Provider>
    </DashboardLayout>
  </AuthContext.Provider>
</App>
```

### The Architectural Provider Rosetta Stone

| Angular DI Construct | Angular Implementation | React Idiomatic Equivalent | Runtime Resolution Mechanic |
| :--- | :--- | :--- | :--- |
| **`providedIn: 'root'`** | Singleton service available across entire application. | **Exported TypeScript Module / Zustand Store** | Pure JavaScript ESM singleton; imported directly via `import { api } from '@/shared/api'`. |
| **`useClass: MockService`** | Swaps implementation class in injector. | **Module Mocking (`vi.mock`) or Prop Injection** | Unit tests mock the imported module directly at the ESM boundary or pass mock objects as props. |
| **`useValue: CONFIG_TOKEN`** | Injects static configuration object or primitives. | **React Context (`<ConfigContext.Provider>`)** | Context traverses the Fiber `return` pointers upwards to find the nearest matching Provider. |
| **`useFactory: (dep) => ...`** | Dynamically constructs service based on dependencies. | **Custom Hook (`useBillingService()`)** | Custom hook executes inside the component, composing other hooks and returning the configured instance. |
| **ElementInjector (Scoped)** | `providers: [LocalService]` on component decorator. | **Nested Context Provider (`<LocalProvider>`)** | Scoped to a specific JSX subtree; unmounts when the parent component unmounts. |
| **Multi-Provider (`multi: true`)** | Injects array of plugins implementing an interface. | **Array Prop (`plugins={[p1, p2]}`) or Registry Map** | Components iterate over array props or query a `Map` registry directly. |

---

## 6. Runtime Flow & Execution Traces

Let us trace how a child component resolves an Authentication Service across both architectures:

### The Angular DI Resolution Trace

```
1. ChildComponent instantiated via constructor(private auth: AuthService)
2. Angular inspects TypeScript metadata (Design:paramtypes)
3. Queries ElementInjector attached to ChildComponent's DOM node:
   - Does ChildComponent provide AuthService? NO.
4. Traverses up ElementInjector parent chain:
   - Checks ParentComponent ElementInjector: NO.
5. Escapes to ModuleInjector tree:
   - Checks FeatureModule: NO.
   - Checks Root ModuleInjector (AppModule): FOUND AuthService instance!
6. Injects cached singleton instance into constructor.
```

### The React Context & Hook Resolution Trace

```
1. ChildComponent executes: const auth = useAuth();
2. useAuth() internally executes: useContext(AuthContext);
3. React inspects the current Fiber node's return pointers:
   - Walks up the Fiber tree: Fiber -> ParentFiber -> LayoutFiber...
4. Finds nearest Fiber whose type is AuthContext.Provider.
5. Reads Provider's memoizedProps.value.
6. Returns value directly to the component stack frame (< 0.01ms).
```

---

## 7. Memory Model & Heap Layout

```
ANGULAR INJECTOR HEAP GRAPH:
+---------------------------------------------------------------+
| V8 Heap (Persistent Injector Records)                         |
|                                                               |
|  RootInjector (Record<Token, Instance>)                       |
|    ├── AuthService -> Instance at 0x00F1                      |
|    ├── HttpClient -> Instance at 0x00F2                       |
|    └── Router -> Instance at 0x00F3                           |
|                                                               |
|  ElementInjector (Attached to DOM ViewRef)                    |
|    ├── parentInjector -> [Pointer to RootInjector]            |
|    └── localRecords -> Map<Token, Instance>                   |
+---------------------------------------------------------------+

REACT CONTEXT HEAP GRAPH:
+---------------------------------------------------------------+
| V8 Heap (Fiber Tree Dependencies)                             |
|                                                               |
|  FiberNode (AuthContext.Provider)                             |
|    └── memoizedProps: { value: { user: "Adarsh", role: "Admin"} }
|                                                               |
|  FiberNode (ChildComponent)                                   |
|    └── dependencies: [ContextDependencyRecord]                |
|          └── context: -> [Pointer to AuthContext]             |
|                                                               |
|  * Subscriptions tracked directly on Fiber linked list        |
+---------------------------------------------------------------+
```

---

## 8. Visual Diagrams (ASCII / Text)

### The "Context Hell" Antipattern vs Modular Composition

```
THE "CONTEXT HELL" ANTIPATTERN (Monolithic Pseudo-DI):
<ThemeProvider>
  <AuthProvider>
    <UserPreferencesProvider>
      <CartProvider>
        <InventoryProvider>
          <NotificationProvider>
            <ModalProvider>
              <AnalyticsProvider>
                <App /> <--- 8 levels of nested wrappers! Every change re-renders children!
              </AnalyticsProvider>
            </ModalProvider>
          </NotificationProvider>
        </InventoryProvider>
      </CartProvider>
    </UserPreferencesProvider>
  </AuthProvider>
</ThemeProvider>

-------------------------------------------------------------------------

THE ENTERPRISE CLEAN COMPOSITION PATTERN:
1. Pure ESM Singletons for Stateless Services:
   import { analytics } from '@/shared/analytics'; // 0 Context needed!

2. Atomic External Stores (Zustand):
   const user = useUserStore(state => state.user); // 0 Provider needed!

3. Scoped Context ONLY for Subtree UI Workflows:
   <CheckoutWizard session={session}>
     <StepOne />
   </CheckoutWizard>
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [CanvasDesignLab.tsx](../../apps/portal/src/features/visualizers/topic-11-system-design/CanvasDesignLab.tsx) | Live in Portal: topic-11-system-design

### Side-by-Side Architectural Transformation: Service Injection & Mocking

Below is an enterprise-grade comparison demonstrating how to replace Angular's `@Injectable` and provider tokens with idiomatic React Context and custom hooks:

#### 1. The Angular Service & InjectionToken Pattern (`order.service.ts`)

```typescript
// Angular 17+ InjectionToken & Service Provider
import { Injectable, InjectionToken, inject } from '@angular/core';

export interface OrderApiConfig {
  baseUrl: string;
  timeoutMs: number;
}

export const ORDER_CONFIG_TOKEN = new InjectionToken<OrderApiConfig>('ORDER_CONFIG_TOKEN');

@Injectable({ providedIn: 'root' })
export class OrderService {
  private config = inject(ORDER_CONFIG_TOKEN);

  async submitOrder(orderId: string): Promise<boolean> {
    console.log(`Submitting ${orderId} to ${this.config.baseUrl}`);
    return true;
  }
}
```

#### 2. The Idiomatic React Context & Hook Pattern (`OrderServiceContext.tsx`)

```typescript
// React 19 Scoped Context & Custom Factory Hook
import React, { createContext, useContext, useMemo, ReactNode } from 'react';

export interface OrderApiConfig {
  baseUrl: string;
  timeoutMs: number;
}

export interface OrderServiceContract {
  submitOrder: (orderId: string) => Promise<boolean>;
}

// 1. Create Context with explicit null check for fail-fast safety
const OrderServiceContext = createContext<OrderServiceContract | null>(null);

// 2. Factory function creating the service implementation
function createOrderService(config: OrderApiConfig): OrderServiceContract {
  return {
    async submitOrder(orderId: string): Promise<boolean> {
      console.log(`Submitting ${orderId} to ${config.baseUrl}`);
      return true;
    },
  };
}

// 3. Provider Component
export const OrderServiceProvider: React.FC<{
  config: OrderApiConfig;
  children: ReactNode;
}> = ({ config, children }) => {
  // Memoize service instance so reference remains stable across renders
  const service = useMemo(() => createOrderService(config), [config.baseUrl, config.timeoutMs]);

  return (
    <OrderServiceContext.Provider value={service}>
      {children}
    </OrderServiceContext.Provider>
  );
};

// 4. Custom Hook Consumer with Fail-Fast Invariant
export function useOrderService(): OrderServiceContract {
  const service = useContext(OrderServiceContext);
  if (!service) {
    throw new Error('useOrderService must be used within an <OrderServiceProvider>');
  }
  return service;
}
```

---

## 10. Angular Comparison

For an experienced Angular developer, transitioning from DI to composition requires unlearning the reflex to create service classes for everything:

| Architectural Dimension | Angular Hierarchical DI | React Composition & Context |
| :--- | :--- | :--- |
| **Service Definition** | Class decorated with `@Injectable({ providedIn: 'root' })`. | Exported plain functions, TypeScript modules, or custom hooks. |
| **Resolution Direction** | Upward traversal through `ElementInjector` and `ModuleInjector` trees. | Upward traversal through the Fiber tree (`return` pointers) matching Context. |
| **Override Granularity** | Overridden in component `providers: [ChildService]`. | Overridden by nesting a second `<MyContext.Provider>` lower in the JSX tree. |
| **Testing Paradigm** | `TestBed.configureTestingModule({ providers: [...] })`. | Direct prop injection or module-level mocking (`vi.mock('@/api')`). |

---

## 11. .NET Comparison

For engineers experienced with ASP.NET Core, understanding the lifetime mappings between .NET, Angular, and React solidifies architecture design:

| Lifetime Scope | ASP.NET Core (`IServiceCollection`) | Angular DI | React Idiomatic Equivalent |
| :--- | :--- | :--- | :--- |
| **Singleton** | `services.AddSingleton<T>()` (Single instance across entire application). | `@Injectable({ providedIn: 'root' })`. | **Plain ESM Module Export** (`export const api = ...`) or root Zustand store. |
| **Scoped** | `services.AddScoped<T>()` (One instance per HTTP Request). | Scoped to a route or parent component's `providers: []`. | **React Context Provider** (`<WizardContext.Provider>`) scoped to a subtree. |
| **Transient** | `services.AddTransient<T>()` (Fresh instance allocated on every injection). | Default behavior when listed in `providers: []` of multiple components. | **Custom Hook invocation** (`useTransientCalculator()`) allocating state per component. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

Deploying large React enterprise applications without a clear understanding of context vs composition introduces severe risks:

### 1. The Context Re-Render Avalanche
- **The Risk:** Placing an object with 20 properties into React Context (e.g. `{ user, theme, cart, notifications, liveQuotes }`).
- **The Failure Mode:** When `liveQuotes` updates at 10 ticks/second, React forces **every single component that calls `useContext(MyContext)` to re-render**, even if the component only cares about `theme`. This devastates CPU performance and causes massive frame drops.
- **The Enterprise Defense:** Follow the **Split Context Rule**: Never combine high-frequency state (quotes, timers) with low-frequency state (auth, theme) in the same provider. For complex global state, use **Zustand** with fine-grained selectors (`useStore(s => s.theme)`), which bypasses React Context entirely and prevents unnecessary component re-renders.

### 2. Missing Context Provider Crash in Production
- **The Risk:** A developer places a component inside a new page or modal but forgets to wrap that modal in the required `<OrderServiceProvider>`.
- **The Failure Mode:** The component attempts to read a property on `undefined`, throwing a fatal `TypeError: Cannot read properties of undefined` that unmounts the entire application.
- **The Enterprise Defense:** Always enforce the **Fail-Fast Invariant** inside custom hooks:
  ```typescript
  export function useOrderService() {
    const ctx = useContext(OrderServiceContext);
    if (!ctx) throw new Error('useOrderService must be used within <OrderServiceProvider>');
    return ctx;
  }
  ```

---

## 13. Performance Considerations

```
DEPENDENCY RESOLUTION PERFORMANCE:
-------------------------------------------------------------
Angular Injector Lookup:       O(D) traversal up DOM depth (compiled in ViewDef)
React Context Lookup:          O(F) traversal up Fiber return pointers (< 0.01ms)
Static ESM Import:             O(1) direct module memory reference (0 overhead)
Context Value Stability:       Must be wrapped in useMemo to prevent re-render thrashing
-------------------------------------------------------------
```

### Strategic Optimizations:
1. **Always Memoize Context Provider Values:**
   Never write `<MyContext.Provider value={{ user, login }}>`. The object literal `{ user, login }` allocates a fresh heap reference on every render, forcing all consumers to re-render even if `user` didn't change. Always write:
   `const value = useMemo(() => ({ user, login }), [user]);`.
2. **Prefer Composition Over Context:**
   If Component A only needs to pass a `<Button />` to Component C through Component B, do not create a Context. Pass the button as a prop: `<ComponentB actionSlot={<Button />} />`.

---

## 14. Tradeoffs

| Architecture Choice | Advantages | Costs / Tradeoffs |
| :--- | :--- | :--- |
| **Angular Hierarchical DI** | Extreme decoupling; central configuration; effortless implementation swapping; enterprise consistency. | Heavy framework boilerplate; runtime reflection overhead; verbose testing setups (`TestBed`). |
| **React Composition & Props** | Zero runtime framework cost; 100% type-safe compile-time checking; self-documenting; trivial to test. | Prop drilling across many layers if architectural boundaries are poorly designed. |
| **React Context** | Solves prop drilling for ambient subtree data (themes, locales, auth); built into the core library. | Risk of re-render avalanches if state changes frequently; requires memoization discipline. |
| **External Stores (Zustand)** | Fine-grained selector subscriptions; zero provider nesting; concurrent-safe; extreme performance. | Introduces an external library dependency; state lives outside the React Fiber tree. |

---

## 15. Common Mistakes & Interview Traps

- **Trap 1: "React doesn't have DI, so we should install InversifyJS or TSyringe."**
  *Why it fails:* Class-based DI containers fight React's functional lifecycle, create memory leaks with closures, and confuse team members. In React, composition, ESM modules, and custom hooks solve 100% of DI requirements natively.
- **Trap 2: Combining Dispatch and State in a single Context.**
  *Why it fails:* Components that only need to trigger actions (e.g. `dispatch({ type: 'LOGOUT' })`) will still re-render whenever state changes! Always split into `StateContext` and `DispatchContext`.
- **Trap 3: Using React Context for High-Frequency Streaming Data.**
  *Why it fails:* Context is not a state management library; it is a dependency injection and broadcast mechanism. Putting 60 FPS WebSocket streams in Context causes render cascades. Use external stores.

---

## 16. Interview Questions & Architectural Answers

### Question 1 (Senior Level): How do you implement Inversion of Control (IoC) in React without a traditional Dependency Injection container?
**Answer**:
In React, Inversion of Control is achieved through three primary techniques:
1. **First-Class Component Composition (Slots):** Instead of a parent component injecting a service to decide which button or card to render, the consumer passes the completed component directly as a prop (`actionSlot={<ExportButton />}`). The parent controls the layout, while the consumer controls the implementation.
2. **Compound Components:** Using shared context across a coordinated family of components (e.g., `<Select>`, `<Select.Option>`). The parent coordinates state while allowing consumers to assemble children flexibly.
3. **Custom Hooks as Injectable Adapters:** Business logic is encapsulated in custom hooks (`usePaymentGateway()`). If an implementation needs to change, the component simply swaps the hook import or receives the hook adapter as a prop, achieving full decoupling without container overhead.

### Question 2 (Lead Level): How do you prevent the "Context Re-render Avalanche" in a large enterprise React application?
**Answer**:
1. **Split Contexts by Domain and Volatility:** Never create a single global application context. Separate static/rarely-changing data (`ThemeContext`, `AuthContext`) from dynamic data (`CartContext`, `QuotesContext`).
2. **Separate State and Dispatch:** Split contexts into `StateContext` (for data values) and `DispatchContext` (for callback actions). Components that only trigger mutations consume the `DispatchContext` and never re-render when state changes.
3. **Memoize Provider Values:** Wrap the context value object in `useMemo` so its heap reference remains stable unless dependencies change.
4. **Use Atomic State Stores (Zustand) for High-Frequency Data:** Move complex or frequently changing state out of React Context into Zustand. Zustand uses `useSyncExternalStore` with fine-grained selectors, re-rendering only the specific components whose selected properties changed.

### Question 3 (Architect Level): How does unit testing in React compare to Angular's `TestBed` when dealing with external service dependencies?
**Answer**:
- **Angular's Approach:** Angular requires `TestBed.configureTestingModule()`. Because components rely on constructor injection, tests must mock providers using `providers: [{ provide: ApiService, useValue: mockApi }]`. If a module has 15 transitive dependencies, `TestBed` setup becomes slow, verbose, and brittle.
- **React's Approach:** React achieves vastly simpler, faster hermetic testing:
  1. *Prop Injection:* Components that accept dependencies as props are tested by passing plain mock JavaScript objects (`<OrderCard api={mockApi} />`).
  2. *Module-Level Mocking:* For components importing services directly from ESM modules, modern test runners (Vitest/Jest) mock the module at the import boundary: `vi.mock('@/api', () => ({ fetchOrders: vi.fn() }))`.
  3. *Network-Level Interception (MSW):* The industry best practice is **Mock Service Worker (MSW)**. Rather than mocking TypeScript classes, MSW intercepts network requests at the browser socket layer. Components run against real hooks and real services, maximizing test confidence without any framework injection harnesses.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors)

### The "Pneumatic Logistics Tube vs Handing Tools by Hand" Anchor
- **Angular DI:** The brass pneumatic tube terminal on the wall. Send a coded token into the pipe (`@Inject(Token)`); the factory logistics warehouse routes the wrench down to your desk.
- **React Composition:** Master carpenter handing the chisel directly to the apprentice as an argument (`<Apprentice chisel={fineChisel} />`). If everyone needs the shift time, tune into the Shop Radio (`React Context`). Simple, physical, and direct.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Inversion of Control (IoC):** Architectural pattern where the control flow of a program is inverted; dependencies are supplied to a component rather than instantiated internally.
- **Hierarchical Injector:** A tree of dependency containers mirroring the component tree, enabling scoped overrides at different DOM levels.
- **Compound Components:** A React pattern where multiple components work together using a shared implicit context (e.g. `<Tabs>` and `<Tab>`).
- **Fail-Fast Invariant:** Throwing a descriptive runtime error immediately if a custom hook is consumed outside its required Context Provider.
- **Zustand Selector:** Subscribing to a specific slice of external state to prevent re-renders when unrelated properties change.

---

## 19. Key Takeaways

1. **Composition Over Containers:** React does not need a heavy DI container; component composition and JavaScript modules solve dependency management natively.
2. **Context is Scoped Broadcast:** Use React Context for ambient, rarely-changing subtree data (auth, themes), not as a global dumping ground for all state.
3. **Always Split Contexts:** Separate high-frequency state from low-frequency state, and separate state values from dispatch actions to prevent render cascades.
4. **Memoize Provider Values:** Always wrap context provider value objects in `useMemo` to preserve referential stability across render passes.
5. **Simpler Hermetic Testing:** Eliminate verbose `TestBed` harnesses; test React components using direct prop injection, ESM module mocks, or Mock Service Worker (MSW).

---

## 20. Revision Sheet

- **Q: What is the React equivalent of Angular's `@Injectable({ providedIn: 'root' })`?**
  *A:* A standard ES Module export (singleton) or a root Zustand external store.
- **Q: What causes the "Context Re-render Avalanche" in React?**
  *A:* Combining multiple properties (some changing frequently) into a single Context object, causing all consumers to re-render whenever any property mutates.
- **Q: How do you enforce that a custom hook is only used within its provider?**
  *A:* Check `if (!context) throw new Error('useMyHook must be used within MyProvider');`.
- **Q: What pattern replaces Angular's multi-provider plugin architecture in React?**
  *A:* Passing an array of plugin objects or components directly via props (`plugins={[pluginA, pluginB]}`).
- **Q: Why is testing faster and less brittle in React than in Angular?**
  *A:* Because React components do not require configuring an Angular `TestBed` container; dependencies can be mocked via simple prop injection, Vitest module mocks, or MSW.
