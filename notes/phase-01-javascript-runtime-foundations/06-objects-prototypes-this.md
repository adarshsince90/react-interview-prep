# Chapter 06: Objects, Prototypes, Prototype Chains & `this` Mechanics

> **First Principles:** The 5-Layer Pedagogy: The "Office Desk & Central Supply Room" Analogy, The "Stage Microphone" Rule, Delegative Prototypal Traversal vs. C# MethodTables, V8 Shapes & Prototype Inline Caches, Prototype Pollution, and Why React Abandoned `this`.

---

## 1. Why This Topic Exists

Coming from an enterprise backend background in **C# / .NET, Java, and Angular**, you are deeply accustomed to **Classical Object-Oriented Programming (OOP)**:
- Classes are rigid, compile-time blueprints.
- In the CLR, an object instance in the GC heap carries an object header containing a `TypeHandle` pointing to its `MethodTable`. Inheritance is a static type hierarchy established at compile time.
- `this` in C# is statically bound: inside an instance method, `this` unconditionally refers to that specific heap instance.

In JavaScript, **everything you know about classes and `this` is completely inverted:**
1. **JavaScript has NO runtime classes.** Even with ES6 `class`, it is 100% syntactic sugar over **Delegative Prototypal Chains**.
2. **`this` is NOT statically bound.** It is not determined by where a function is declared; it is dynamically determined by **how the function is invoked at the call site**.

In early web development (1995 Netscape), machines had 16 megabytes of RAM. If every object created in a webpage copied all of its own methods, memory would be exhausted immediately. JavaScript needed a mechanism where thousands of objects could **share behavior without copying it**. That mechanism is the **Prototype Chain**.

Furthermore, understanding `this` is the exact reason early React class components required tedious manual bindings (`this.handleClick = this.handleClick.bind(this)`), and why modern React abandoned `this` entirely in favor of closures and hooks.

---

## 2. Learning Objectives

By the end of this chapter, you will be able to:
- Contrast **Classical Inheritance** (.NET CLR `MethodTable`) with **Delegative Prototypal Inheritance** (JavaScript fallback pointers).
- Differentiate between `[[Prototype]]` (`__proto__`) and `Function.prototype` without hesitation.
- Trace how V8 optimizes prototype lookups using **Hidden Classes (`Shapes`)** and **Prototype Chain Inline Caches (IC)**, and understand what causes de-optimization.
- Master the **4 Rules of `this` Binding** (New, Explicit, Implicit, Default) and explain why Arrow Functions possess no `this`.
- Diagnose and eliminate the **"Lost Context" bug** in asynchronous callbacks and React event listeners.
- Defend against **Prototype Pollution vulnerabilities** in enterprise Node.js microservices using `Object.create(null)` and `Map`.
- Implement a complete polyfill for `Function.prototype.bind` from first principles.

---

## 3. Historical Evolution

```text
[1995: Self Language Influence & Mocha/LiveScript]
  - Brendan Eich draws inspiration from Self (a prototype-based language) to build a dynamic,
    classless object model without compilation or rigid type schemas.
       │
       ▼
[1999: ES3 Prototype Foundations]
  - Formalizes `Function.prototype`, `Object.prototype`, and constructor functions with `new`.
  - Delegation is established via internal `[[Prototype]]` links.
       │
       ▼
[2009: ES5 `Object.create`]
  - Introduces `Object.create(proto)`, allowing developers to create objects directly linked
    to a prototype without using constructor functions or `new`.
  - Introduces `Function.prototype.bind()`.
       │
       ▼
[2015: ES6 `class` Syntactic Sugar & Arrow Functions]
  - Adds `class`, `extends`, and `super` keywords. Under the hood, the engine still uses prototypes.
  - Introduces Arrow Functions (`() => {}`), eliminating dynamic `this` by adopting lexical scope.
       │
       ▼
[2018+: The React Hook Revolution (Death of `this`)]
  - React 16.8 deprecates class components in favor of functional components with hooks.
  - Eliminates the need for `.bind(this)` constructors; embraces closures over prototype `this`.
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)

### Analogy 1: The "Office Desk & Central Supply Room" (Prototypes)

Imagine you work in a company office:
1. You have your **own desk drawer** (`Own Properties`).
2. If you need a **stapler**, you look in your own drawer.
3. If it’s not there, you don't panic. You look at a sticky note on your desk that points to your **Team Lead's desk** (`[[Prototype]]`).
4. You check your Lead's drawer. If it’s not there, their desk has a note pointing to the **Central Supply Room** (`Object.prototype`).
5. You check the Supply Room. If it’s not there, the trail ends (`null`). You report: *"We don't have this item"* (`undefined`).

> **The First Principle of Delegation:** You **never copied** the stapler into your drawer. You just followed the trail of sticky notes until you found it! That trail is the **Prototype Chain**.

```text
  Your Desk                   Team Lead's Desk               Central Supply Room
┌──────────────┐             ┌──────────────────┐           ┌────────────────────┐
│ myCar Object │             │ Vehicle.prototype│           │  Object.prototype  │
├──────────────┤             ├──────────────────┤           ├────────────────────┤
│ model: "SUV" │             │ drive: function()│           │ toString()         │
│              │             │ honk: function() │           │ hasOwnProperty()   │
│ [[Prototype]]├────────────▶│ [[Prototype]]    ├──────────▶│ [[Prototype]]: null│
└──────────────┘             └──────────────────┘           └────────────────────┘
```

---

### Analogy 2: The "Stage Microphone" (`this`)

In C#, a method belongs to a class. In JavaScript, **functions are independent entities passed around like tennis balls**. 

Because a function isn't permanently anchored to an object, it needs to know: **"Who am I working for right now?"** That is what `this` is.

Imagine a **Microphone** on a concert stage:
- A song (function) has lyrics, but it doesn't own a voice.
- **`this` is simply whoever is currently holding the microphone!**
- If **Alice** holds the mic and sings → `this` is Alice (`alice.sing()`).
- If Alice hands the mic to **Bob** → `this` is now Bob (`bob.sing()`).
- If the mic is **dropped on the floor** with nobody holding it → in strict mode, nobody gets the credit (`this` is `undefined`).

---

## 5. Internal Working & Engine Architecture (Layer 2)

### 1. `prototype` vs. `[[Prototype]]` (`__proto__`)

The single greatest point of confusion for engineers is differentiating these two properties:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. [[Prototype]] (Internal slot, exposed as __proto__)                 │
│    - The actual hidden pointer EVERY object has pointing to its parent.│
│    - Used for property lookup delegation.                              │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Function.prototype                                                  │
│    - A property that exists ONLY on Function objects.                  │
│    - It is NOT the function's own prototype!                           │
│    - It is the "Starter Pack" object that will become the              │
│      [[Prototype]] of any instance created with `new FunctionName()`. │
└────────────────────────────────────────────────────────────────────────┘
```

#### The Canonical Memory Triangle
```javascript
function User(name) {
  this.name = name;
}
User.prototype.sayHi = function() {
  return `Hi, I am ${this.name}`;
};

const alice = new User("Alice");
```

```text
 [alice Instance]
 ├── name: "Alice"
 └── [[Prototype]] (or __proto__)
           │
           ▼
 [User.prototype Object] ◀─────────────────── User.prototype
 ├── sayHi: function()
 ├── constructor: ──────────────────────────▶ [User Function Object]
 └── [[Prototype]]                                  │
           │                                        └── [[Prototype]]
           ▼                                                │
 [Object.prototype] ◀───────────────────────────────────────┘
 ├── toString: function()
 ├── hasOwnProperty: function()
 └── [[Prototype]]: null (Top of Chain)
```

---

### 2. The 4 Rules of `this` Binding

To know who holds the microphone, **inspect the call site (where the function is called with `()`):**

```text
Priority 1: `new` Binding
   └── Was the function called with `new`? (new User())
       `this` = The newly created object instance.

Priority 2: Explicit Binding
   └── Was it called with `.call()`, `.apply()`, or a hard `.bind()`?
       `this` = The explicitly passed object argument.

Priority 3: Implicit Binding
   └── Is there an object to the LEFT of the dot? (user.greet())
       `this` = The context object before the dot (`user`).

Priority 4: Default Binding
   └── Standalone invocation with NO dot? (greet())
       `this` = `undefined` (in strict mode `'use strict'`)
                `window` / `global` (in non-strict mode).
```

### The Arrow Function Exception: Lexical `this`
Arrow functions (`() => {}`) **do not have a `this` binding**. 
They do not participate in the 4 rules. They resolve `this` **lexically** through the scope chain from the enclosing scope where they were defined, exactly like a variable in a closure.
- Calling `.call()`, `.apply()`, or `.bind()` on an arrow function **has zero effect on `this`**.

---

## 6. Runtime Flow & Execution Traces

### Execution Trace: The "Lost Context" Trap

```javascript
const user = {
  name: "Adarsh",
  greet() {
    console.log(`Hello, I am ${this.name}`);
  }
};

user.greet(); // Call 1

const looseGreet = user.greet;
looseGreet(); // Call 2

setTimeout(user.greet, 100); // Call 3
```

#### Step-by-Step Call-Site Resolution:

1. **Call 1 (`user.greet()`):**  
   - Inspect call site: `user.greet()`.  
   - Is there an object to the left of the dot? **Yes (`user`)**.  
   - Rule 3 (Implicit Binding) applies → `this === user`.  
   - Logs: `"Hello, I am Adarsh"`.

2. **Call 2 (`looseGreet()`):**  
   - `looseGreet` is assigned the raw function pointer.  
   - Inspect call site: `looseGreet()`.  
   - Is there a dot? **No.** Called with `new`? **No.** Explicit `.call`? **No.**  
   - Rule 4 (Default Binding) applies → In strict mode, `this === undefined`.  
   - Throws: `TypeError: Cannot read properties of undefined (reading 'name')`.

3. **Call 3 (`setTimeout(user.greet, 100)`):**  
   - `user.greet` is passed as an argument. The reference is copied.  
   - When the timer fires, the Host Environment executes: `callback()`.  
   - Standalone invocation! Rule 4 applies → `this === undefined`.

---

## 7. Memory Model & V8 Hidden Classes (`Shapes`)

How does V8 avoid walking the prototype chain on every method call?

```text
[Call Site: alice.sayHi()]
           │
           ▼
[V8 Inline Cache Check]
- Does alice have Shape #1? (YES)
- Does User.prototype have Shape #2? (YES)
           │
           ├─▶ FAST PATH (Cache Hit): Direct jump to JIT-compiled machine code!
           │
           └─▶ SLOW PATH (Cache Miss / Polled Prototype Chain):
               Traverse pointers: alice ──▶ User.prototype ──▶ Object.prototype
```

### Prototype Inline Caches (IC)
When V8 compiles a prototype method call:
- It records the **Shape** of the instance and the **Shape** of the prototype.
- As long as neither object is mutated, V8 bypasses pointer traversal completely and executes the cached method directly.
- **The Performance Trap:** If an application mutates a prototype at runtime (`User.prototype.newMethod = ...`), V8 invalidates the entire transition tree. All downstream call sites de-optimize back to interpreted bytecode!

---

## 8. Visual Diagrams

### The Complete Call-Site `this` Decision Tree

```text
                       [ Function Call Site ]
                                 │
                     Was it called with `new`?
                                 ├──▶ YES: `this` = Newly allocated object
                                 │
                                 └──▶ NO
                                       │
                      Called with .call(), .apply(), or .bind()?
                                       ├──▶ YES: `this` = Explicitly passed target
                                       │
                                       └──▶ NO
                                             │
                             Is there an Object LEFT of the dot?
                                             ├──▶ YES: `this` = Context object (obj.fn())
                                             │
                                             └──▶ NO: Standalone call (fn())
                                                   │
                                                   ├── Strict Mode: `this` = undefined
                                                   └── Non-Strict:  `this` = globalThis / window
```

---

## 9. Real World Usage & Production Patterns

### Polyfilling `Function.prototype.bind` from First Principles

Understanding how to implement `.bind()` proves mastery of closures and `this`:

```javascript
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFunction = this; // Capture the function to be bound

  if (typeof originalFunction !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  return function boundFunction(...callArgs) {
    // Check if invoked via `new` (Constructor call)
    if (this instanceof boundFunction) {
      return new originalFunction(...boundArgs, ...callArgs);
    }

    // Apply explicit binding with combined arguments
    return originalFunction.apply(context, [...boundArgs, ...callArgs]);
  };
};
```

---

## 10. Angular Comparison: Classes vs. Prototypes

| Dimension | Angular (TypeScript / OOP) | React (Functional / Hooks) |
| :--- | :--- | :--- |
| **Component Architecture** | `@Component class MyComponent`: Relies entirely on `this.property`. | Pure Functions: State managed via `useState`, closures, and Fiber nodes. |
| **Context Loss Danger** | Passing component methods to RxJS (`obs$.subscribe(this.handler)`) loses `this` unless using arrow functions. | No `this` context to lose. Event handlers are simple closures capturing scope. |
| **Inheritance Pattern** | Classical `extends BaseComponent`: Deep inheritance trees common in enterprise. | Composition over Inheritance: Custom Hooks compose logic without class hierarchies. |

---

## 11. .NET Comparison: CLR Type Safety vs. Prototype Delegation

| Feature | .NET / CLR (C#) | JavaScript (V8 Engine) |
| :--- | :--- | :--- |
| **Type Definition** | Static `TypeHandle` pointing to a read-only `MethodTable` in PE metadata. | Dynamic bags of properties linked via mutable `[[Prototype]]` pointers. |
| **`this` Semantics** | Statically bound to the calling instance at compile time. | Dynamically bound at runtime based on the call-site invocation pattern. |
| **Method Resolution** | Virtual dispatch via `vtable` indices calculated at compile time. | Dynamic prototype chain traversal optimized by Prototype Inline Caches. |
| **Type Mutation** | Immutable at runtime (cannot add methods to a class without emit/reflection). | Prototype objects are open and mutable at runtime by default. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The Catastrophic Security Risk: Prototype Pollution

In enterprise Node.js and Next.js applications, recursive merge utilities (such as unpatched versions of Lodash `_.merge`) exposed severe vulnerabilities:

```javascript
// Attacker sends malicious JSON payload:
const untrustedPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');

// Vulnerable recursive merge utility:
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') {
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

merge({}, untrustedPayload);

// 💥 PRODUCTION COLLAPSE:
const normalUser = {};
console.log(normalUser.isAdmin); // true! Every object in the process is now compromised!
```

### The Architectural Defenses:
1. **Use Pure Dictionaries (No Prototype):**
   ```javascript
   const safeMap = Object.create(null); // No [[Prototype]] link to Object.prototype!
   ```
2. **Use Native `Map`:**
   Prefer `new Map()` over plain objects for user-controlled key-value caches.
3. **Freeze the Prototype:**
   ```javascript
   Object.freeze(Object.prototype); // Prevents any runtime mutation
   ```

---

## 13. Performance Considerations

### 1. Prototype Chain Traversal Cost ($O(N)$)
Keep prototype chains shallow (1-2 levels max). Deep prototype chains cause cache misses in V8's Inline Caches, forcing the engine to perform expensive pointer lookups.

### 2. Arrow Functions in Class Properties (Memory Churn)
```javascript
class LargeTable {
  // ❌ Anti-pattern in high-instance classes:
  // Creates a brand new function instance per object! (1,000 objects = 1,000 functions)
  handleClick = () => { console.log(this.id); };

  // ✅ Prototype Method:
  // Shared once on LargeTable.prototype! (1,000 objects = 1 function)
  handleClick() { console.log(this.id); }
}
```

---

## 14. Tradeoffs

| Architectural Approach | Advantages | Engineering Tradeoffs |
| :--- | :--- | :--- |
| **Prototype Delegation (`class` / prototypes)** | Memory efficiency: Methods shared across all instances on one prototype. | Complex `this` binding rules; susceptible to lost context in callbacks. |
| **Closure Factories (Custom Hooks)** | Bulletproof encapsulation; no `this` binding traps; true runtime privacy. | Function objects re-allocated per instance; requires `useCallback` to stabilize references. |
| **`Object.create(null)`** | Zero prototype pollution risk; fast, clean dictionary lookups. | Missing utility methods like `.hasOwnProperty()`, `.toString()`. |

---

## 15. Common Mistakes & Interview Traps

### Trap 1: The Event Listener "Lost Context" in React
```javascript
// ❌ FAILS IN CLASS COMPONENTS: this is undefined when clicked!
<button onClick={this.handleSubmit}>Submit</button>

// ✅ FIX 1: Bind in constructor
this.handleSubmit = this.handleSubmit.bind(this);

// ✅ FIX 2: Class field arrow function
handleSubmit = () => { this.setState(...); };
```

### Trap 2: Believing `myCar.drive = fn` Modifies the Prototype
Assigning to an object property **never modifies the prototype**. It creates an "own property" directly on that instance, shadowing the prototype property.

### Trap 3: Calling `bind` on an Arrow Function
```javascript
const arrow = () => console.log(this.name);
const bound = arrow.bind({ name: "Alice" });
bound(); // Ignores { name: "Alice" }! Arrow functions cannot be rebound.
```

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Q1 (Senior Level): "Trace and explain the output of each line."

```javascript
const person = {
  name: "Adarsh",
  regular() { return `I am ${this.name}`; },
  arrow: () => `I am ${this.name}`
};

const outsider = { name: "Outsider" };

console.log(person.regular());
console.log(person.arrow());

const detached = person.regular;
console.log(detached());

console.log(person.regular.call(outsider));
console.log(person.arrow.call(outsider));
```

> **Staff Engineer Answer:**  
> 1. `person.regular()`: Rule 3 (Implicit Binding). Object left of dot is `person`. → **`"I am Adarsh"`**.
> 2. `person.arrow()`: Arrow functions have no `this`. It resolves lexically to the enclosing module/global scope. → **`"I am undefined"`** (or empty string in browser window).
> 3. `detached()`: Rule 4 (Default Binding). Standalone invocation without dot. In strict mode, `this` is `undefined`. → **Throws `TypeError`** (or `"I am undefined"` in non-strict).
> 4. `person.regular.call(outsider)`: Rule 2 (Explicit Binding). Forces `this === outsider`. → **`"I am Outsider"`**.
> 5. `person.arrow.call(outsider)`: Arrow functions ignore `.call()`. Still resolves lexically. → **`"I am undefined"`**.

---

### Q2 (Lead Level): "Why did React transition from Class Components to Functional Components with Hooks? Explain from an engine and architectural perspective."

> **Staff Engineer Answer:**  
> React abandoned classes for three fundamental architectural reasons:
> 1. **`this` Binding Bugs & Ergonomics:** Developers constantly stumbled over the "Lost Context" problem when passing handlers to DOM elements, requiring verbose `.bind(this)` boilerplate in constructors.
> 2. **Compiler Optimization & Minification:** JavaScript classes are difficult for bundlers (like Terser or Rollup) to minify safely. Prototype method names cannot be mangled easily because they are public strings on prototypes. Functional components and hooks minify significantly better.
> 3. **Logic Reuse without Wrapper Hell:** In classes, sharing stateful logic required complex patterns like Higher-Order Components (HOCs) or Render Props, producing deeply nested virtual DOM trees ("wrapper hell"). Custom Hooks allow stateful logic composition purely through closures without modifying component hierarchies.

---

### Q3 (Architect Level): "An enterprise application parses dynamic user schemas into JSON and caches them in a shared object dictionary. Over time, memory climbs and downstream API calls crash with mysterious runtime properties. Walk through your diagnostic approach and architectural redesign."

> **Staff Engineer Answer:**  
> 
> **Diagnosis:**  
> 1. The application is likely suffering from **Prototype Pollution**. When parsing dynamic JSON schemas, unvalidated keys such as `__proto__` or `constructor.prototype` are modifying the global `Object.prototype`.
> 2. This pollutes every object in the V8 isolate, leading to unexpected properties leaking into clean objects.
> 3. Furthermore, mutating `Object.prototype` invalidates V8's Shape trees, causing widespread **JIT de-optimization (bailout)** and triggering high memory and CPU spikes.
> 
> **Architectural Redesign:**
> 1. **Sanitize Schema Keys:** Enforce JSON schema validation that strips `__proto__`, `constructor`, and `prototype` keys during ingestion.
> 2. **Replace Plain Objects with `Map`:** For dynamic caching, use native `new Map()`, which does not use prototype-based string key lookups.
> 3. **Prototype-Free Dictionaries:** Where plain objects are mandatory, instantiate them via `Object.create(null)` to sever the link to `Object.prototype`.
> 4. **Defensive Freezing:** In application bootstrap code, execute `Object.freeze(Object.prototype)` to fail-fast if any rogue dependency attempts prototype mutation.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Layer 3)

### 🧠 Memory Anchor #1: The Drawer vs. The Supply Room
- **Reading** searches up the chain: *My Drawer → Team Lead → Supply Room*.
- **Writing** ALWAYS stops at your own drawer: *Setting `myCar.color = 'red'` puts red paint in your own drawer; it never touches the supply room!*

### 🧠 Memory Anchor #2: Look Left of the Dot!
At the exact moment of execution:
- `user.speak()` → Dot exists! Look left → `user` holds the microphone.
- `const fn = user.speak; fn();` → No dot! The mic was dropped on the floor → `this` is `undefined`!

### 🧠 Memory Anchor #3: Arrow Functions Have No Microphone
Arrow functions do not participate in call-site binding. They are deaf to `.call()`, `.apply()`, and `.bind()`. They inherit `this` from the room where they were born.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)

### Core Vocabulary (1-2 Liners)
- **`[[Prototype]]`:** The hidden internal pointer on every object pointing to its delegation parent.
- **`Function.prototype`:** The blueprint object linked to instances created by constructor functions with `new`.
- **Implicit Binding:** Rule where `this` resolves to the context object immediately preceding the dot.
- **Explicit Binding:** Forcing `this` using `.call()`, `.apply()`, or `.bind()`.
- **Lexical `this`:** The behavior of arrow functions adopting `this` from their outer scope.
- **Prototype Pollution:** A critical vulnerability where an attacker mutates `Object.prototype` via unvalidated keys.
- **Inline Cache (IC):** V8's optimization technique that caches property memory offsets to bypass prototype traversal.

---

### The 4 "Aha!" Breakthrough Insights

> #### 💡 Aha! #1: "JavaScript doesn't have classes; it has live objects talking to other live objects."
> ES6 `class` is syntax sugar. At runtime, there are no static types or compiled schemas; there are only live objects delegating property lookups through hidden `[[Prototype]]` pointers.

> #### 💡 Aha! #2: "`this` is determined by HOW a function is called, NOT where it was written."
> Unlike C#, JavaScript functions do not own their `this`. The calling syntax at the exact moment of invocation determines who holds the microphone.

> #### 💡 Aha! #3: "Arrow functions don't 'bind' `this`; they literally don't have one."
> An arrow function treats `this` exactly like a local variable in a closure. It simply walks up the lexical scope chain to find it.

> #### 💡 Aha! #4: "`Object.create(null)` is an object without a past."
> It has no `[[Prototype]]` link to `Object.prototype`. It is immune to prototype pollution because it has no supply room to delegate to.

---

## 19. Key Takeaways

1. Prototypal inheritance is **delegative behavior sharing**, not classical type copying.
2. `[[Prototype]]` is the actual fallback link; `Function.prototype` is the starter pack handed out during `new`.
3. `this` binding follows 4 priority rules: `new` → Explicit (`call`/`apply`/`bind`) → Implicit (`obj.fn()`) → Default (`undefined` in strict mode).
4. Arrow functions possess no `this` and cannot be rebound.
5. In React, the difficulty of managing `this` in class components directly drove the creation of **Functional Components and Hooks**.
6. Guard enterprise code against **Prototype Pollution** by using `Map` or `Object.create(null)`.

---

## 20. Revision Sheet

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                PROTOTYPES & THIS CHEAT SHEET                               │
├──────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ Property Lookup              │ Traverses up [[Prototype]] until null ($O(N)$)              │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Property Assignment          │ Stops at own object (never mutates prototype)               │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Secret Object Link           │ `obj.__proto__` === `Constructor.prototype`                 │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Priority 1 `this`            │ `new Constructor()` ──▶ Newly created instance              │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Priority 2 `this`            │ `fn.call(ctx)`, `fn.apply(ctx)`, `fn.bind(ctx)` ──▶ `ctx`   │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Priority 3 `this`            │ `obj.method()` ──▶ `obj` (Look left of the dot)             │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Priority 4 `this`            │ Standalone `fn()` ──▶ `undefined` (Strict) / `window`       │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Arrow Function `this`        │ Lexical (Inherited from outer enclosing scope)              │
├──────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Safe Dictionary              │ `Object.create(null)` (No prototype, zero pollution)        │
└──────────────────────────────┴─────────────────────────────────────────────────────────────┘
```
