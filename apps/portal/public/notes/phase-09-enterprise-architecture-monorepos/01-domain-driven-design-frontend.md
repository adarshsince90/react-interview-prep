# Topic 01: Domain-Driven Design (DDD) in Frontend Applications

## 1. Why This Topic Exists
For years, frontend development organized code around technical concerns rather than business domains. Folders like `/components`, `/containers`, `/reducers`, `/services`, and `/utils` proliferated. In large enterprise applications spanning hundreds of screens and multiple cross-functional feature teams, this technical bucket organization collapses into an unmaintainable tangled web: changing a customer billing calculation requires touching 15 files scattered across 10 folders, with zero boundaries preventing a checkout component from directly mutating inventory state.

Eric Evans' **Domain-Driven Design (DDD)** revolutionizes frontend architecture by organizing software around business domains, bounded contexts, and ubiquitous language. Applying DDD to modern React applications introduces **Entities**, **Value Objects**, **Aggregates**, **Domain Services**, and **Anti-Corruption Layers (ACL)** to the client tier. 

This architecture insulates core business logic from UI rendering volatility, isolates volatile backend API schemas behind translation boundaries, and enables multiple autonomous engineering teams to scale without stepping on each other's toes.

---

## 2. Learning Objectives
By mastering this chapter, you will be able to:
- Dissect the core strategic and tactical patterns of **Domain-Driven Design** tailored for frontend web runtimes.
- Define explicit **Bounded Contexts** (e.g. Catalog, Billing, Fulfillment) that decouple feature sub-trees.
- Model immutable **Entities** (identity-driven) and **Value Objects** (attribute-driven) in TypeScript.
- Implement **Aggregates** and **Domain Invariants** that ensure client state is always valid before reaching persistence.
- Build an **Anti-Corruption Layer (ACL)** that transforms volatile backend REST/GraphQL payloads into clean, domain-specific models.
- Differentiate between **Domain Services** (pure business rules) and **Application Services / Use Cases** (orchestration, I/O, UI state).

---

## 3. Historical Evolution

```
+--------------------------------------------------------------------------------------------------+
|                                    CHRONOLOGICAL EVOLUTION                                       |
+--------------------------------------------------------------------------------------------------+
| 2003 - Eric Evans Publishes "Domain-Driven Design": Established bounded contexts, ubiquitous      |
|        language, and layered architecture for enterprise backend systems.                        |
|                                                                                                  |
| 2013 - The Frontend "Technical Bucket" Era: React apps organized strictly by file type            |
|        (`/components`, `/actions`, `/reducers`). Resulted in monolithic spaghetti codebases.    |
|                                                                                                  |
| 2018 - Emergence of Domain-Centric Modules: Frontend architects begin grouping code by feature    |
|        modules (`/features/billing`, `/features/auth`), introducing early domain boundaries.    |
|                                                                                                  |
| 2021 - Feature-Sliced Design (FSD) Standard: Formalized layered, domain-driven directory        |
|        conventions for frontend applications across the global open-source community.            |
|                                                                                                  |
| 2024+ - Full-Stack Isomorphic DDD with RSC: Shared domain entities and validation invariants    |
|         reused across Next.js Server Components, Server Actions, and client UI components.      |
+--------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The Kitchen Spice Rack vs The Recipe Station (Technical Buckets vs Bounded Contexts)
Imagine a commercial restaurant preparing 500 meals an hour:
- **Technical Bucket Organization:** You put all metal spoons in one warehouse, all glass jars in a second warehouse 2 miles away, all powders in a third warehouse, and all water taps in a fourth warehouse. Every time a chef needs to make a bowl of soup, they must run across 4 warehouses to assemble the ingredients.
- **Bounded Contexts (Recipe Stations):** You build dedicated, self-contained stations: The Sushi Station, The Pastry Station, and The Grill Station. The Pastry Station has its own flour, sugar, bowls, and whisks. The Pastry Chef never touches the raw fish, and the Sushi Chef never touches the confectioners' sugar.

### Analogy 2: The Customs Translator at the Border (The Anti-Corruption Layer)
Imagine trade between two foreign nations:
- Nation A (Your React Frontend) speaks clean, modern English.
- Nation B (The Legacy 15-Year-Old Backend SOAP API) speaks an archaic dialect where user names are encoded as `TXT_USR_NM_V2` and status codes are raw integers (`1 = ACTIVE, 4 = VOID, 9 = FRAUD`).
- **Without an ACL:** Your entire React UI code is polluted with `if (apiData.TXT_USR_NM_V2 && apiData.STATUS_CD === 4)`. If the backend team updates their database column, your entire frontend crashes in 50 places!
- **With an ACL (The Translator):** At the network gateway boundary, a dedicated translator parses `apiData` and converts it into a clean TypeScript Domain Entity: `{ name: string, isVoided: boolean }`. The rest of your application never sees or knows about `TXT_USR_NM_V2`.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. Strategic DDD: Bounded Contexts in Frontend Topologies
A Bounded Context defines a linguistic and conceptual boundary where terms have an unambiguous, uniform meaning:

```
+--------------------------------------------------------------------------------------------------+
|                                    ENTERPRISE BOUNDED CONTEXTS                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   [CATALOG BOUNDED CONTEXT]                      [BILLING BOUNDED CONTEXT]                       |
|   ├── "Product" Entity:                          ├── "Product" (BillingItem) Entity:             |
|   │   - id: ProductId                            │   - sku: SkuCode                              |
|   │   - title: string                            │   - unitPrice: Money (Value Object)           |
|   │   - highResImages: ImageUrl[]                │   - taxCategory: TaxCode                      |
|   │   - seoDescription: string                   │   (Zero image or SEO data needed!)            |
|                                                                                                  |
|                                         │                                                        |
|                                         ▼ (Shared Context Map / Domain Events)                   |
|                                                                                                  |
|   [FULFILLMENT BOUNDED CONTEXT]                                                                  |
|   ├── "Package" Entity:                                                                          |
|   │   - weight: Weight (kg)                                                                      |
|   │   - dimensions: BoxDimensions                                                                |
|   │   - shippingBarcode: Barcode                                                                 |
|   │   (Zero marketing or tax data needed!)                                                       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### 2. Tactical DDD Building Blocks

```
+-----------------------------------------------------------------------------------------------+
| Building Block | Definition & Invariants                                                      |
+-----------------------------------------------------------------------------------------------+
| Entity         | An object defined by its immutable Identity (`id: UserId`).                  |
|                | Two entities with identical properties but different IDs are distinct.       |
|                                                                                               |
| Value Object   | An immutable object defined strictly by its Attributes (e.g. `Money`, `Email`)|
|                | Has no identity. Two Value Objects with identical attributes are identical.  |
|                                                                                               |
| Aggregate      | A cluster of Entities and Value Objects with a designated **Aggregate Root**. |
|                | External code can ONLY reference the Root; invariants enforced inside root.  |
|                                                                                               |
| Domain Service | Pure business logic that spans multiple aggregates (e.g. `CurrencyConverter`).|
|                                                                                               |
| Anti-Corruption| Translation layer converting raw API DTOs into rich domain entities.         |
| Layer (ACL)    |                                                                              |
+-----------------------------------------------------------------------------------------------+
```

---

## 6. Runtime Flow & Execution Traces

### The Clean Architecture Layered Request & Mutation Flow

```
User Action (Click "Place Order")            Application Service (Use Case)         Domain Model (Aggregate Root)
         |                                                 |                                      |
         | 1. Dispatches UI Action:                        |                                      |
         |    `placeOrderUseCase.execute(cartId)`          |                                      |
         |------------------------------------------------>|                                      |
         |                                                 | 2. Fetches Cart Aggregate            |
         |                                                 |    from Repository                   |
         |                                                 |--+                                   |
         |                                                 |  |                                   |
         |                                                 |<-+                                   |
         |                                                 |                                      |
         |                                                 | 3. Invoke Domain Method:             |
         |                                                 |    `cart.checkout(paymentMethod)`    |
         |                                                 |------------------------------------->|
         |                                                 |                                      | 4. Validate Domain Invariant:
         |                                                 |                                      |    - Cart items > 0?
         |                                                 |                                      |    - Total > minimum?
         |                                                 |                                      |    - Transition state to
         |                                                 |                                      |      CHECKOUT_PENDING
         |                                                 | 5. Emits Domain Event:               |
         |                                                 |    `OrderPlacedEvent`                |
         |                                                 |<-------------------------------------|
         |                                                 |
         |                                                 | 6. Persist via OrderRepository (API)
         |                                                 | 7. Return Result DTO to React View
         | 8. UI re-renders order confirmation             |
         |<------------------------------------------------|
```

---

## 7. Memory Model & Heap Layout

### Value Object Referential Equality & Immutability

```
[V8 Heap: Value Object Allocation]
├── Money Value Object (Immutable):
│   ├── amount: 1500 (stored in cents to prevent floating point errors)
│   ├── currency: "USD"
│   └── equals(other: Money): boolean ===> Evaluates value equality, not reference pointer!
│
├── Attempted Invalidation:
│   `money.amount = 2000;` ===> TypeError: Cannot assign to read only property (Object.freeze)
│
└── Functional Transformation:
    `const newTotal = money.add(taxMoney);` ===> Creates NEW Value Object instance; old is untouched!
```

---

## 8. Visual Diagrams (ASCII / Text)

### The Layered Clean Architecture Onion for Frontend

```
+---------------------------------------------------------------------------------------------+
|                                  THE CLEAN ARCHITECTURE ONION                               |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
|   +-------------------------------------------------------------------------------------+   |
|   | 1. FRAMEWORK & UI LAYER (Outermost - Volatile)                                      |   |
|   |    - React Components (JSX, Tailwind CSS, Material UI)                              |   |
|   |    - Next.js Pages & Routers                                                        |   |
|   |                                                                                     |   |
|   |   +-----------------------------------------------------------------------------+   |   |
|   |   | 2. APPLICATION / USE CASE LAYER (Orchestration)                            |   |   |
|   |   |    - `CheckoutUseCase`, `AuthenticateUserUseCase`                           |   |   |
|   |   |    - TanStack Query Hooks, Zustand State Stores                             |   |   |
|   |   |                                                                             |   |   |
|   |   |   +---------------------------------------------------------------------+   |   |   |
|   |   |   | 3. DOMAIN LAYER (Innermost - 100% Pure & Framework-Agnostic)        |   |   |   |
|   |   |   |    - Entities (`User`, `Order`, `Invoice`)                          |   |   |   |
|   |   |   |    - Value Objects (`Email`, `Money`, `Currency`)                   |   |   |   |
|   |   |   |    - Domain Invariants & Pure Business Rules                        |   |   |   |
|   |   |   |    - ZERO React imports! ZERO Axios imports! ZERO Browser DOM!      |   |   |   |
|   |   |   +---------------------------------------------------------------------+   |   |   |
|   |   +-----------------------------------------------------------------------------+   |   |
|   +-------------------------------------------------------------------------------------+   |
|                                                                                             |
|   DEPENDENCY INVERSION PRINCIPLE: All dependencies point strictly INWARDS!                  |
|   The Domain Layer knows NOTHING about React, JSX, or HTTP!                                 |
+---------------------------------------------------------------------------------------------+
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [LabComponent.tsx](../../apps/portal/src/features/visualizers/topic-09-architecture/LabComponent.tsx) | Live in Portal: `topic-09-architecture`

### Pattern 1: Pure TypeScript Domain Entity and Value Object (`domain/billing.ts`)

```typescript
/**
 * Value Object: Money.
 * Immutable, self-validating, encapsulates currency math without floating point errors.
 */
export class Money {
  public readonly amountInCents: number;
  public readonly currency: string;

  private constructor(amountInCents: number, currency: string) {
    if (amountInCents < 0) {
      throw new Error('Money amount cannot be negative');
    }
    this.amountInCents = Math.round(amountInCents);
    this.currency = currency.toUpperCase();
    Object.freeze(this); // Guarantee immutability
  }

  public static fromDollars(dollars: number, currency = 'USD'): Money {
    return new Money(dollars * 100, currency);
  }

  public static fromCents(cents: number, currency = 'USD'): Money {
    return new Money(cents, currency);
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: Cannot add ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amountInCents === other.amountInCents && this.currency === other.currency;
  }

  public format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amountInCents / 100);
  }
}

/**
 * Aggregate Root: Order Entity.
 * Owns line items and enforces domain invariants.
 */
export class Order {
  public readonly id: string;
  private lineItems: Array<{ id: string; name: string; price: Money }>;
  private isSubmitted: boolean = false;

  constructor(id: string) {
    this.id = id;
    this.lineItems = [];
  }

  public addLineItem(id: string, name: string, price: Money): void {
    if (this.isSubmitted) {
      throw new Error('Domain Invariant Violation: Cannot modify an already submitted order');
    }
    this.lineItems.push({ id, name, price });
  }

  public calculateTotal(): Money {
    return this.lineItems.reduce(
      (acc, item) => acc.add(item.price),
      Money.fromCents(0, 'USD')
    );
  }

  public submit(): void {
    if (this.lineItems.length === 0) {
      throw new Error('Domain Invariant Violation: Cannot submit an empty order');
    }
    this.isSubmitted = true;
  }

  public getItems() {
    return [...this.lineItems];
  }
}
```

### Pattern 2: Anti-Corruption Layer (ACL) Adapter (`acl/orderAcl.ts`)

```typescript
import { Money, Order } from '../domain/billing';

// Raw, volatile backend DTO from legacy REST API
interface RawBackendOrderDto {
  ORDER_ID: string;
  ORDER_STATUS: number; // 1 = ACTIVE, 2 = SUBMITTED
  ITEMS: Array<{
    ITEM_ID: string;
    ITEM_DESC: string;
    PRICE_AMT: number;
    CURR_CD: string;
  }>;
}

/**
 * Anti-Corruption Layer (ACL) Adapter.
 * Shielding domain entities from messy, volatile backend contracts.
 */
export class OrderAclAdapter {
  public static toDomain(dto: RawBackendOrderDto): Order {
    const order = new Order(dto.ORDER_ID);

    for (const rawItem of dto.ITEMS) {
      const money = Money.fromDollars(rawItem.PRICE_AMT, rawItem.CURR_CD);
      order.addLineItem(rawItem.ITEM_ID, rawItem.ITEM_DESC, money);
    }

    if (dto.ORDER_STATUS === 2) {
      order.submit();
    }

    return order;
  }

  public static toDto(domain: Order): Record<string, unknown> {
    return {
      ORDER_ID: domain.id,
      TOTAL_CENTS: domain.calculateTotal().amountInCents,
      ITEMS_COUNT: domain.getItems().length,
    };
  }
}
```

---

## 10. Angular Comparison

| Architecture Concept | Modern React DDD Implementation | Angular Enterprise Implementation |
| :--- | :--- | :--- |
| **Domain Layer Isolation** | Pure TypeScript classes inside framework-agnostic `/domain` directory. | Angular Core Library (`libs/domain`) created via Nx containing pure models and rules. |
| **Dependency Injection** | React Context or custom functional Composition Roots. | Native Angular Hierarchical Dependency Injection (`@Injectable({ providedIn: 'root' })`). |
| **Anti-Corruption Layer** | Custom mapper classes or functional pipeline adapters. | Angular `HttpInterceptorFn` or Injectable Data Adapters (`EntityAdapter<T>`). |
| **State Separation** | Application Services / Custom hooks encapsulating Zustand/TanStack Query. | Facade Pattern services (`OrderFacade`) orchestrating NgRx Store and Signal states. |

---

## 11. .NET Comparison

| DDD Concept | Frontend React Architecture | .NET 10 / ASP.NET Core Clean Architecture |
| :--- | :--- | :--- |
| **Domain Project** | Pure TypeScript `/domain` directory (zero React imports). | `Core.Domain.csproj` class library with zero external NuGet dependencies. |
| **Value Objects** | Immutable TypeScript classes with `Object.freeze()`. | C# `record struct` or classes inheriting from base `ValueObject` implementing `IEquatable<T>`. |
| **Use Cases / App Services**| Use case classes or custom hooks (`useCheckout()`). | MediatR Request Handlers (`IRequestHandler<CheckoutCommand, Result>`). |
| **Repository Pattern** | Interface `OrderRepository` implemented via `FetchOrderRepository`. | Repository interfaces (`IOrderRepository`) implemented via Entity Framework Core (`OrderDbContext`). |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### 1. Over-Engineering Traps (Premature DDD)
Applying full-scale Tactical DDD (Aggregates, Value Objects, Repositories) to a simple CRUD contact-us form or a read-only marketing blog is architectural bloat.
**Enterprise Rule of Thumb:** 
- Use DDD when **business logic is rich, complex, and evolving** (Checkout engines, insurance calculation, multi-currency accounting).
- Use simple direct data binding for static, read-heavy display pages.

### 2. Leaking UI Concerns into Domain Entities
A developer adds `isLoading: boolean` or `selectedColor: string` directly into the `Order` domain entity.
- This corrupts the domain model with transient presentation concerns!
- **Remedy:** Keep UI state strictly in React component state (`useState`) or UI view-models; Domain entities must model **only core business truth**.

---

## 13. Performance Considerations

### 1. Object Instantiation vs Plain JSON
Instantiating 10,000 domain classes (`new ProductEntity(...)`) in an array consumes slightly more V8 heap memory than raw JSON objects.
- For bulk data grids with 50,000 items, parse into lean plain objects.
- For core transactional workflows (Cart, Checkout, User Settings), wrap in rich Domain Entities.

---

## 14. Tradeoffs

| Architecture Choice | Advantages | Disadvantages / Trade-offs |
| :--- | :--- | :--- |
| **Full Clean Architecture / DDD**| Maximum testability; zero framework lock-in; long-term maintainability. | Higher initial boilerplate; requires disciplined team alignment. |
| **Direct Component-to-API Fetching**| Fast initial prototype speed; zero abstraction layers. | Unmaintainable at scale; UI breaks whenever API schemas change. |
| **Anti-Corruption Layer (ACL)** | Shields frontend from backend refactors completely. | Requires mapping overhead on every network round-trip. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: Importing React or Hooks into Domain Entities
- **The Mistake:** Writing `import { useState } from 'react'` inside `domain/Order.ts`.
- **The Reality:** The domain layer must remain **100% pure TypeScript**. If React is replaced with Next.js, React Native, or Vue, the domain layer should compile with zero code changes.

### Trap 2: Using Primitive Types for Domain Concepts
- **The Mistake:** Typing `price: number` and `email: string` everywhere.
- **The Reality:** Leads to currency math bugs (`0.1 + 0.2 = 0.30000000000000004`) and invalid email formats. Use **Value Objects** (`Money`, `EmailAddress`) that encapsulate validation and formatting.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Staff/Principal Question: How do you architect an Anti-Corruption Layer (ACL) in a React application undergoing an enterprise migration from a legacy monolithic REST API to a modern GraphQL microservices architecture?
**Architectural Answer:**
1. **Define the Canonical Domain Interface:** Define rich, UI-independent TypeScript Domain Entities and Repository interfaces (`IUserRepository`, `IOrderRepository`) representing business requirements.
2. **Decouple the UI Layer:** All React components and custom hooks interact exclusively with the Domain Entities and Repository interfaces, never touching raw network queries.
3. **Dual-Adapter Pipeline:**
   - Implement `LegacyRestOrderRepository` mapping legacy REST endpoints through an ACL adapter to Domain Entities.
   - Implement `GraphQLOrderRepository` mapping modern GraphQL queries through a new ACL adapter to the **identical Domain Entities**.
4. **Feature-Flagged Cutover:** Use a runtime configuration toggle or LaunchDarkly feature flag to switch the active repository implementation at the composition root without modifying a single line of React UI code.
5. **Outcome:** Zero UI regressions during a multi-quarter backend migration.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Embassy Isolation" Mental Model
- **The Domain Layer:** The sovereign territory inside the embassy walls. It follows its own constitution (business rules).
- **The ACL:** The armed security gate at the embassy entrance. Diplomats entering from the outside world must exchange their foreign currency and passports for embassy badges before entering.
- **The React UI:** The public press room where announcements are made.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

- **Bounded Context:** Explicit boundary within which a domain model applies cleanly.
- **Entity:** An object defined by persistent, immutable identity (`id`).
- **Value Object:** An immutable object defined entirely by its attributes (`Money`, `Email`).
- **Aggregate Root:** The primary entity governing transactions within a cluster of related entities.
- **Anti-Corruption Layer (ACL):** Adapter translating external API data into clean internal domain models.

---

## 19. Key Takeaways
1. Organize enterprise frontend code by business domains, not technical file types.
2. Keep the core domain layer 100% pure TypeScript with zero framework dependencies.
3. Use Value Objects (`Money`) to eliminate primitive obsession and floating point currency errors.
4. Always isolate volatile backend APIs behind an Anti-Corruption Layer (ACL).
5. Enforce business invariants inside Aggregate Roots before persisting state.

---

## 20. Revision Sheet

```
+--------------------------------------------------------------------------------------------------+
|                                      FRONTEND DDD CHEAT SHEET                                    |
+--------------------------------------------------------------------------------------------------+
| Layer Invariants:                                                                                |
| - Domain Layer      : Pure TS only! Entities, Value Objects. NO React! NO Axios!                 |
| - Application Layer : Use cases, state stores, orchestrates domain logic.                        |
| - Infrastructure    : Repositories, HTTP clients, ACL adapters.                                  |
| - Presentation      : React components, JSX, Tailwind styles.                                    |
|                                                                                                  |
| Quick Checklist:                                                                                 |
| 1. Is it immutable with no ID? ===> Value Object (e.g. `Money`).                                 |
| 2. Does it have an ID?         ===> Entity (e.g. `User`).                                        |
| 3. Does it protect child rules?===> Aggregate Root (e.g. `Order`).                               |
| 4. Translating dirty API data? ===> Anti-Corruption Layer (ACL).                                 |
+--------------------------------------------------------------------------------------------------+
```
