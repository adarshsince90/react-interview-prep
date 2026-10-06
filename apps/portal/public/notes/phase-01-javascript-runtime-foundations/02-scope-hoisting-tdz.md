# Chapter 02: Scope, Hoisting, and the Temporal Dead Zone (TDZ)

> **First Principles:** The Internal Mechanics of Lexical Environments, VariableEnvironment Bifurcation, the V8 `Hole` Sentinel, and the Foundations of Closure Capture.

---

## 1. Why This Topic Exists

In statically compiled enterprise ecosystems such as **.NET / C#** or **Java**, variable scope and lifetime are enforced at compile time. If a developer attempts to read a local variable before declaring it, the **Roslyn** compiler immediately halts with `CS0103` (*The name does not exist in the current context*) or `CS0165` (*Use of unassigned local variable*). Block scope (`{ ... }`) is universal, and variable lifetime is deterministic.

In JavaScript, variable scoping has a complex, dual-layered history:
1. For two decades (1995–2015), JavaScript had **no block scope**. Variables declared with `var` leaked outside loops and conditionals, hoisting silently as `undefined` and introducing race conditions and closure bugs.
2. In 2015, **ECMAScript 6 (ES6)** introduced block-scoped bindings (`let`, `const`) and the **Temporal Dead Zone (TDZ)**.
3. Crucially, because the web cannot break backward compatibility, the JavaScript engine could not modify how `var` functioned. It had to support both legacy function-scoping and modern block-scoping simultaneously.

To reconcile both models without degrading performance, modern engines like **V8** redesigned the internal architecture of the **Execution Context** into two distinct data structures: **`VariableEnvironment`** and **`LexicalEnvironment`**. 

Mastering this distinction is not academic trivia; it is the prerequisite for understanding how JavaScript closures allocate heap memory, why `for` loops behave differently with `let` versus `var`, and why React hooks suffer from the infamous **stale closure** problem.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Deconstruct the two-phase lifecycle of an Execution Context to explain why **hoisting does not physically move code**.
- Analyze the internal engine difference between **`VariableEnvironment`** (for `var`) and **`LexicalEnvironment`** (for `let`/`const`).
- Trace how V8 implements the **Temporal Dead Zone (TDZ)** at the bytecode level using the internal sentinel pointer `v8::internal::Hole`.
- Contrast how `for (var ...)` versus `for (let ...)` allocates scope frames on the heap during asynchronous iteration.
- Explain why the introduction of the TDZ broke the historical safety invariant of the `typeof` operator.
- Connect lexical scope chains directly to the memory foundations of **Closures** and **React Hook render snapshots**.

---

## 3. Historical Evolution

```text
[1995: JavaScript 1.0 (Netscape Navigator)]
  - Only `var` existed.
  - Scoping was strictly Global or Functional. Curly braces `{ }` did NOT create a scope.
  - Variables declared inside `if` blocks or `for` loops leaked to the enclosing function.
       │
       ▼
[The "Hoisting" Confusion Era]
  - Developers struggled with `var` declarations returning `undefined` before their line of assignment.
  - Idiomatic workaround: The Douglas Crockford convention (declaring all variables at top of functions).
  - Common bug: Asynchronous callbacks inside loops sharing the exact same mutated `var` counter.
       │
       ▼
[2015: ECMAScript 6 (ES6 / ES2015)]
  - Introduction of `let` and `const`.
  - Introduction of true Block Scope (`{ }`, `if`, `for`, `switch`).
  - Introduction of the Temporal Dead Zone (TDZ) to enforce semantic integrity for `const`.
  - To maintain backward compatibility, the engine's Execution Context was split into
    `VariableEnvironment` (legacy) and `LexicalEnvironment` (modern).
```

---

## 4. First Principles

### 4.1 Lexical Scope (Static Scope)
JavaScript is **lexically scoped**. The scope of an identifier is determined entirely by where it is physically written in the source text at author time, **not** by where or how the function is invoked at runtime. V8 constructs the scope hierarchy during the AST parsing phase.

### 4.2 Hoisting as a Consequence of Two-Phase Execution
The engine **does not move code**. Hoisting is an observational side effect of the two-phase Execution Context lifecycle:
1. **Creation Phase:** V8 parses the context, allocates slots in memory for every identifier, and binds references.
2. **Execution Phase:** V8 executes the code line-by-line. Because identifiers were already allocated in memory during Phase 1, code can refer to them before their declaration line.

```text
WHAT BEGINNERS THINK HAPPENS:             WHAT V8 ACTUALLY DOES:
(Code is physically moved)                (Two-Phase Execution Context)

// Author code:                           Phase 1: Memory Allocation (Creation)
console.log(x);                           Allocates x ──▶ stores `undefined`
var x = 10;                               
                                          Phase 2: Evaluation (Execution)
// "Moved" by engine:                     Line 1: Reads x (finds `undefined`)
var x;                                    Line 2: Writes 10 into slot x
console.log(x);
x = 10;
```

---

## 5. Internal Working: `VariableEnvironment` vs. `LexicalEnvironment`

Inside the V8 C++ codebase, an active **Execution Context** contains two distinct environment records:

```text
┌─────────────────────────────────────────────────────────────┐
│                 V8 EXECUTION CONTEXT INTERNALS              │
├─────────────────────────────────────────────────────────────┤
│ 1. VariableEnvironment:                                     │
│    └── Manages legacy `var` declarations and functions.     │
│    └── Scoped strictly to the Function or Global level.     │
│    └── Completely ignores block boundaries ({ }, if, for).  │
├─────────────────────────────────────────────────────────────┤
│ 2. LexicalEnvironment:                                      │
│    └── Manages modern `let`, `const`, and `class` bindings. │
│    └── Scoped to individual BLOCKS ({ }, if, for, while).   │
│    └── Pushes a new scope frame when entering a block,      │
│        and pops it when exiting the block.                  │
├─────────────────────────────────────────────────────────────┤
│ 3. OuterEnv Reference (Scope Chain Pointer)                 │
│ 4. ThisBinding                                              │
└─────────────────────────────────────────────────────────────┘
```

### What Happens When Entering a Block?
When V8 encounters a block `{ ... }`:
- It **does not** allocate a heavy new Execution Context.
- It instantiates a lightweight, nested **`LexicalEnvironment`** record on the stack/heap.
- It sets the nested environment's `outer` pointer to the enclosing `LexicalEnvironment`.
- Any `let` or `const` is registered in this nested `LexicalEnvironment`.
- Any `var` bypasses the nested environment entirely and attaches to the enclosing function's **`VariableEnvironment`**!

```javascript
function demoScope() {
  var functionScoped = "I ignore blocks";

  if (true) {
    var leaked = "I also attach to demoScope's VariableEnvironment!";
    let blockScoped = "I live only in this block's LexicalEnvironment";
  }

  console.log(leaked);      // ✅ Works! Outputs: "I also attach to..."
  console.log(blockScoped); // ❌ ReferenceError: blockScoped is not defined
}
```

---

## 6. Runtime Flow: Hoisting Mechanics Breakdown

The behavior of identifiers during the **Creation Phase** differs fundamentally by declaration keyword:

| Declaration Type | Allocation Target | Creation Phase Initial Value | Read Before Declaration Line |
| :--- | :--- | :--- | :--- |
| **`function foo() {}`** | Heap / VariableEnv | Fully instantiated function pointer | **Succeeds** (Executes function) |
| **`var x = 10;`** | VariableEnvironment | `undefined` | **Succeeds** (Returns `undefined`) |
| **`let y = 20;`** | LexicalEnvironment | `v8::internal::Hole` (Uninitialized) | **Throws `ReferenceError`** (TDZ) |
| **`const z = 30;`** | LexicalEnvironment | `v8::internal::Hole` (Uninitialized) | **Throws `ReferenceError`** (TDZ) |
| **`class Bar {}`** | LexicalEnvironment | `v8::internal::Hole` (Uninitialized) | **Throws `ReferenceError`** (TDZ) |

### Function Declarations vs. Function Expressions
```javascript
// 1. Function Declaration (Fully Hoisted)
greet(); // ✅ Works! Outputs: "Hello"
function greet() {
  console.log("Hello");
}

// 2. Function Expression via var (Variable Hoisted as undefined)
farewell(); // ❌ TypeError: farewell is not a function!
var farewell = function() {
  console.log("Goodbye");
};
```
*Engine Mechanics:* In example 2, `farewell` is allocated in `VariableEnvironment` during Phase 1 with the value `undefined`. When line 8 attempts to evaluate `farewell()`, it executes `undefined()`, triggering a fatal `TypeError` before the assignment on line 9 can ever execute.

---

## 7. Memory Model & Bytecode: The Temporal Dead Zone

### What is the TDZ?
The **Temporal Dead Zone (TDZ)** is not a physical region of memory; it is a **temporal (time-based) span** between when an Execution Context enters a scope and when the variable's declaration statement is evaluated.

```javascript
{
  // ──▶ 1. Scope entered. TDZ for `salary` begins.
  //       V8 allocates slot in LexicalEnvironment: salary = <The Hole>

  const getBonus = () => salary * 0.1; // Declared, but NOT invoked. Valid!

  // console.log(salary); ❌ THROW ReferenceError (TDZ Violation)

  let salary = 100000; 
  // ──▶ 2. TDZ ends! Slot updated from <The Hole> to 100000.

  console.log(salary);     // ✅ 100000
  console.log(getBonus()); // ✅ 10000
}
```

### V8 Ignition Bytecode Implementation: The "Hole"
Inside V8, memory slots for uninitialized `let` and `const` variables are populated with a C++ sentinel pointer: `v8::internal::Hole`.

When Ignition evaluates variable access, it issues the bytecode instruction:
`LdaCurrentContextSlot [slot_index]`

The V8 runtime executes this guard check:
```cpp
// Conceptual V8 Engine Check
Object value = context->get(slot_index);
if (value == ReadOnlyRoots::the_hole_value()) {
    // Variable is in the Temporal Dead Zone!
    ThrowReferenceError(variable_name);
}
return value;
```

Only when the declaration line is reached does Ignition issue `StaCurrentContextSlot`, overwriting `the_hole` with the evaluated value and officially ending the TDZ.

---

## 8. Visual Diagrams

### Scope Chains and Identifier Resolution
When a variable is resolved, V8 walks up the **Scope Chain** via the `outer` reference pointer:

```text
[Inner Function Scope: LexicalEnvironment]
  ├── localTax: 0.05
  └── outer: ──────────────────────────────┐
                                           ▼
             [Parent Function Scope: LexicalEnvironment]
               ├── baseRate: 1.10
               └── outer: ──────────────────────────────┐
                                                        ▼
                          [Global Scope: LexicalEnvironment]
                            ├── companyName: "Enterprise Corp"
                            └── outer: null (Terminates lookup)
```
If the identifier is not found after reaching `outer: null`, V8 throws `ReferenceError: identifier is not defined`.

---

### Loop Scoping: `var` vs. `let` in the Engine

```text
CASE A: for (var i = 0; i < 3; i++)
Heap / Context:
┌────────────────────────────────────────┐
│ Function VariableEnvironment           │
│   └── i: 3 (Single slot mutated 3x)    │
└────────────────────────────────────────┘
Callbacks at t=100ms all read the SAME slot: Outputs 3, 3, 3.

──────────────────────────────────────────────────────────────────────────

CASE B: for (let i = 0; i < 3; i++)
V8 allocates a NEW LexicalEnvironment frame per iteration:
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│ Iteration 0 Frame      │  │ Iteration 1 Frame      │  │ Iteration 2 Frame      │
│   └── i: 0             │  │   └── i: 1             │  │   └── i: 2             │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
Callback 0 reads Frame 0    Callback 1 reads Frame 1    Callback 2 reads Frame 2
Outputs: 0, 1, 2.
```

---

## 9. Real-World Usage

### Encapsulation via Block Scopes
Before ES6, Immediately Invoked Function Expressions (IIFEs) were required to prevent variables from polluting outer scopes. Block scope eliminates this ceremony:

```typescript
// Legacy Enterprise Pattern (IIFE):
(function() {
  var temporarySecret = loadSecret();
  initializeSystem(temporarySecret);
})();

// Modern Clean Enterprise Pattern:
{
  const temporarySecret = loadSecret();
  initializeSystem(temporarySecret);
} // temporarySecret is immediately eligible for Garbage Collection
```

---

## 10. Angular Comparison

| Dimension | Angular (TypeScript) | JavaScript Runtime (V8) |
| :--- | :--- | :--- |
| **Class Field Scope** | TypeScript enforces `private`, `protected`, and `public` at compile time via Roslyn-like AST validation. | At runtime, standard class fields attach to the instance. True runtime encapsulation requires ES2022 private fields (`#field`). |
| **Template Scoping** | Angular templates create local template variable scopes (e.g., `*ngFor="let item of items"`). | Angular compiles `let item` into a nested JavaScript function or block scope in the generated template instructions. |
| **Dependency Injection** | Hierarchical Injectors mimic a scope chain: Component Injector $\to$ Parent Injector $\to$ Root Injector. | Natural Scope Chain: Nested LexicalEnvironment $\to$ Parent LexicalEnvironment $\to$ Global Scope. |

---

## 11. .NET Comparison

| Feature | .NET / C# | JavaScript (V8 Engine) |
| :--- | :--- | :--- |
| **Scope Enforcement** | Enforced at compile time by Roslyn (`CS0103`). Illegal variable access fails compilation. | Enforced at runtime via the Temporal Dead Zone guard (`the_hole` check) throwing `ReferenceError`. |
| **Hoisting** | Non-existent. Source order is strictly enforced; variables cannot be referenced prior to declaration. | Built into the execution model via Phase 1 (Creation Phase) memory allocation. |
| **Loop Variable Capture** | Since C# 5.0, `foreach` and `for` closures capture a fresh variable copy per iteration. | `let` allocates a new `LexicalEnvironment` per iteration; `var` shares a single mutable slot. |
| **Closure Representation** | Captured variables are compiled into fields of a synthetic display class: `<>c__DisplayClass`. | Captured variables are stored in an internal, heap-allocated V8 `Context` object. |

---

## 12. Enterprise Perspective

1. **Elimination of `var` via Static Linting:**
   In enterprise repositories, `var` should be banned via ESLint rules (`no-var: "error"`). Allowing `var` introduces accidental variable leaking across switch-case blocks and conditional logic.
2. **Memory Footprint of High-Frequency Loop Scopes:**
   While `let` in loops prevents closure capture bugs, if a loop runs 500,000 times and creates closures inside the body, V8 must allocate 500,000 `LexicalEnvironment` frames on the heap, triggering aggressive GC scavenge cycles.
3. **Foundation for Module Bundling:**
   ES Modules (`import`/`export`) rely on static lexical scoping. Bundlers like Webpack, Rollup, and Turbopack exploit lexical scope analysis to perform **Tree-Shaking (Dead Code Elimination)**.

---

## 13. Performance Considerations

```text
┌────────────────────────────────────────────────────────┐
│               IDENTIFIER LOOKUP OVERHEAD               │
├──────────────────────┬─────────────────────────────────┤
│ Scope Depth          │ Lookup Mechanism                │
├──────────────────────┼─────────────────────────────────┤
│ Local Scope (Depth 0)│ Direct Stack / Register Offset  │
│                      │ (Fastest: O(1))                 │
├──────────────────────┼─────────────────────────────────┤
│ Nested Outer Scope   │ Pointer Dereference through     │
│ (Depth 1 to N)       │ Context Link Chain (O(D))       │
├──────────────────────┼─────────────────────────────────┤
│ Global Scope         │ Property lookup on Global       │
│                      │ Object / Hash Map (Slowest)     │
└──────────────────────┴─────────────────────────────────┘
```

- **Avoid Deep Scope Chains in Hot Loops:** Accessing global identifiers inside high-throughput algorithmic loops forces V8 to traverse the scope chain repeatedly. Cache outer variables locally:
  ```javascript
  // Slower: Traverses scope chain to global 'Math' on every iteration
  for (let i = 0; i < 1000000; i++) { Math.floor(i); }

  // Faster: Local reference cached at Depth 0
  const floor = Math.floor;
  for (let i = 0; i < 1000000; i++) { floor(i); }
  ```

---

## 14. Tradeoffs

| Feature | Architectural Benefit | Incurred Cost / Tradeoff |
| :--- | :--- | :--- |
| **Temporal Dead Zone** | Guarantees semantic integrity for `const`; catches initialization bugs early. | Broke historical runtime safety of `typeof`; requires runtime guard checks in bytecode. |
| **Block-Scoped `let` in Loops** | Prevents variable capture bugs in asynchronous callbacks. | Allocates a new LexicalEnvironment frame on every iteration when closures are present. |
| **Lexical (Static) Scoping** | Allows deterministic code reasoning and build-time optimization (tree-shaking). | Functions retain their author-time lexical environment, leading to potential stale closure retention. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: The Historical `typeof` Safety Fallacy
Historically, `typeof` was guaranteed never to throw an error, even for undeclared identifiers. The TDZ breaks this guarantee:

```javascript
console.log(typeof undeclaredIdentifier); // ✅ Returns "undefined" (Safe)

console.log(typeof tdzIdentifier);        // ❌ Throws ReferenceError!
let tdzIdentifier = 42;
```

---

### Trap 2: Parameter Default Value TDZ
Function parameters form their own intermediate scope between the outer context and the function body:

```javascript
// ❌ FAILS: 'b' is accessed while in its TDZ
function calculate(a = b, b = 10) {
  return a + b;
}
calculate(); // ReferenceError: Cannot access 'b' before initialization

// ✅ SUCCEEDS: 'a' has already been evaluated and initialized
function calculate(a = 10, b = a) {
  return a + b;
}
calculate(); // 20
```

---

### Trap 3: Shadowing inside `switch` Statements
A `switch` block shares a **single `LexicalEnvironment`** across all `case` clauses:

```javascript
switch (command) {
  case "START":
    let timeout = 1000; // Allocated in the switch's LexicalEnvironment
    break;
  case "STOP":
    let timeout = 5000; // ❌ SyntaxError: Identifier 'timeout' has already been declared!
    break;
}

// ✅ FIX: Create explicit block scopes per case
switch (command) {
  case "START": {
    let timeout = 1000;
    break;
  }
  case "STOP": {
    let timeout = 5000;
    break;
  }
}
```

---

## 16. Interview Questions & Architectural Answers

### Q1 (Senior Level): "Why does `for (var i = 0; i < 3; i++)` log `3, 3, 3` inside a `setTimeout`, while `for (let i = 0; i < 3; i++)` logs `0, 1, 2`?"
> **Staff Engineer Answer:** 
> When using `var`, the variable `i` is bound to the enclosing function’s `VariableEnvironment`. There is only one physical memory slot for `i`. The loop executes synchronously to completion, mutating that single slot to `3`. When the `setTimeout` macrotasks execute later, all three callbacks resolve `i` via their scope chain to that same single slot, reading `3`.
> 
> When using `let`, the ECMAScript specification mandates that the engine create a **brand-new `LexicalEnvironment` record for every iteration** of the loop. Each iteration’s callback closes over its own distinct lexical frame containing the value of `i` specific to that iteration (`0`, `1`, and `2`), resulting in independent outputs.

---

### Q2 (Lead Level): "What is the Temporal Dead Zone (TDZ) and what problem does it solve for `const`?"
> **Staff Engineer Answer:** 
> The TDZ is the temporal window between entering a scope and executing the variable's declaration statement. 
> 
> It was introduced primarily to guarantee the semantic integrity of `const`. If `const` hoisted identically to `var`, accessing it before declaration would yield `undefined`, and subsequent execution of the declaration would assign its actual value. This would mean a `const` identifier held two distinct values over time (`undefined`, then its assigned value), breaking the fundamental invariant of an immutable binding. The TDZ ensures that uninitialized variables throw a `ReferenceError` if accessed before initialization.

---

### Q3 (Architect Level): "Explain the engine-level distinction between `VariableEnvironment` and `LexicalEnvironment` inside V8 Execution Contexts."
> **Staff Engineer Answer:** 
> Every V8 Execution Context maintains two parallel environment records to support modern ES6 block scoping without breaking legacy ES5 code:
> 1. **`VariableEnvironment`**: Manages legacy `var` declarations and function declarations. It is strictly function-scoped or globally scoped and completely ignores block boundaries (`{ }`).
> 2. **`LexicalEnvironment`**: Manages block-scoped `let`, `const`, and `class` declarations. When a block is entered, a new child `LexicalEnvironment` is linked to the active environment; when the block exits, the child environment is popped.
> 
> This bifurcation allows V8 to resolve legacy `var` identifiers without dynamic scope allocation while supporting fine-grained block scoping and TDZ checks for modern identifiers.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever"

> **The Hotel Room Key Analogy:**
> - Declaring a variable with `var` is like receiving a **master key** that unlocks every door on that entire floor (function scope). It doesn't matter what room you walk into; the key operates across all barriers.
> - Declaring a variable with `let` or `const` is like a **keycard to a specific room** (block scope). The keycard is physically invalid outside that exact room.
> - The **Temporal Dead Zone** is the interval between booking the hotel room (memory allocated during the Creation Phase) and picking up the keycard at the front desk (Execution Phase initialization). The room exists, your name is on it, but if you try to open the door before checking in, the security alarm sounds (`ReferenceError`).

### 🧠 How to Remember This Forever (The Memory Anchors)

- **Memory Anchor #1: The Velvet Rope & Security Guard Rule (TDZ)**  
  `var` is checking into a motel where the door is left unlocked and a complimentary bottle of water (`undefined`) sits on the table before you arrive. `let` and `const` have a **velvet rope and a security guard** blocking the door until your declaration line executes. If you try to peek inside early (even using `typeof`), the security guard tackles you (`ReferenceError`).

- **Memory Anchor #2: The Polaroid Camera Rule (`let` in Loops)**  
  `var i` inside a `for` loop is a single shared whiteboard: each iteration erases and overwrites the exact same number. `let i` is a **Polaroid camera**: every single iteration snaps a brand-new, independent photograph on fresh film (`LexicalEnvironment`), so asynchronous callbacks capture their own private snapshot!

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

### Core Vocabulary (1-2 Liners)

- **Lexical Scope**: Scope defined strictly at author time by the physical placement of blocks in code.
- **Environment Record**: The internal dictionary data structure that maps variable names to values inside an Execution Context.
- **VariableEnvironment**: The internal store that holds legacy function-scoped `var` variables.
- **LexicalEnvironment**: The internal store that holds modern block-scoped `let`, `const`, and `class` variables.
- **Hoisting**: An observational artifact of the Creation Phase allocating memory for identifiers before code runs.
- **Temporal Dead Zone (TDZ)**: The time interval between scope entry and declaration line evaluation where accessing a variable throws a `ReferenceError`.
- **The "Hole" (`v8::internal::Hole`)**: The physical C++ sentinel pointer placed in memory by V8 to represent an uninitialized TDZ variable.

---

### The 3 "Aha!" Breakthrough Insights

> #### 💡 Aha! #1: "Hoisting is a myth invented by teachers—V8 doesn't move your code."
> V8 does not physically rearrange your source code. Because Execution Contexts have two phases (**Creation** and **Execution**), memory allocation happens before the first line of code runs. "Hoisting" is simply what happens when you read a variable that was allocated during Phase 1 before its assignment line in Phase 2.

> #### 💡 Aha! #2: "The TDZ was invented specifically so `const` wouldn't be a lie."
> If `const` hoisted as `undefined` like `var`, it would hold `undefined` on line 1 and `"secret"` on line 2—meaning it changed values! The TDZ was created so that reading a `const` before assignment triggers an immediate crash rather than returning a temporary default value.

> #### 💡 Aha! #3: "Why `let` in a loop fixes async closures: V8 allocates a brand-new Lexical Environment per iteration."
> In `for (var i = 0; i < 3; i++)`, there is only **one** variable `i` shared across the entire function. In `for (let i = 0; i < 3; i++)`, the engine allocates a **brand-new `LexicalEnvironment` frame on the heap for every single loop iteration**. Each asynchronous callback captures a different memory address.

---

## 19. Key Takeaways

1. **Hoisting does not move code.** Identifiers are allocated memory during the **Creation Phase** of an Execution Context before the **Execution Phase** begins.
2. `var` declarations are stored in **`VariableEnvironment`** (function-scoped); `let` and `const` are stored in **`LexicalEnvironment`** (block-scoped).
3. The **Temporal Dead Zone** protects the semantic contract of `const` and prevents silent reads of uninitialized memory.
4. Accessing a TDZ variable triggers a check against V8's internal **`the_hole`** sentinel, throwing a `ReferenceError`.
5. `for (let ...)` allocates an independent `LexicalEnvironment` frame **per loop iteration**, preventing closure mutation traps.
6. Lexical Environments form a **singly-linked chain** that serves as the direct physical foundation for JavaScript Closures.

---

## 20. Revision Sheet

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SCOPE, HOISTING & TDZ CHEAT SHEET                       │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ Scoping Model                │ Lexical Scope (Determined at Author Time)    │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Legacy Storage Engine        │ VariableEnvironment (var, Function Scoped)   │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Modern Storage Engine        │ LexicalEnvironment (let/const, Block Scoped) │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Hoisting Initial State (var) │ Allocated and initialized to `undefined`     │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Hoisting Initial State (let) │ Allocated and initialized to `the_hole` (TDZ)│
├──────────────────────────────┼──────────────────────────────────────────────┤
│ TDZ Access Violation         │ Throws `ReferenceError` (Cannot access)      │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ `typeof` in TDZ              │ NOT SAFE: Throws `ReferenceError`            │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Loop Iteration Behavior      │ `var` = 1 Shared Slot; `let` = New Frame/Iter│
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Identifier Resolution        │ Scope Chain walk: Inner ──▶ Parent ──▶ Global│
└──────────────────────────────┴──────────────────────────────────────────────┘
```
