# Phase 10 — Topic 03: React Testing Library Philosophy & User-Centric Testing

## 1. Why This Topic Exists
For years, frontend testing was dominated by the "Implementation Detail" mindset. With libraries like Enzyme, developers tested whether a component had a specific internal state (`wrapper.state('isOpen')`), whether a sub-method was executed, or whether a child component received specific props.

This testing philosophy failed catastrophically in production:
1. **False Positives**: When a developer refactored an internal implementation (for example, switching from `useState` to `useReducer` or extracting logic into a custom hook), dozens of tests failed even though the user-facing UI worked perfectly.
2. **False Negatives**: Tests passed cleanly because internal state updated, but the user was unable to click the button in reality because it was missing an accessible label or was visually disabled.

**React Testing Library (RTL)** was created by Kent C. Dodds to invert this paradigm:
> *"The more your tests resemble the way your software is used, the more confidence they can give you."*

RTL does not test component instances, props, or state. It interacts exclusively with the rendered DOM as a human or assistive technology (screen reader) would: querying by accessibility roles, reading visible text, and dispatching real user interaction events.

Architects must master RTL’s query hierarchy, asynchronous waiting mechanics, and `userEvent` event chains to build resilient test suites that survive architectural refactorings.

---

## 2. Learning Objectives
By completing this chapter, you will be able to:
- Apply the core philosophy of React Testing Library: testing **user-observable behavior** rather than internal implementation details.
- Master the strict **Query Priority Hierarchy**: prioritize `getByRole` and `getByLabelText` over brittle selectors like `getByTestId`.
- Differentiate between query variants: `getBy*` (synchronous assert), `queryBy*` (assert non-existence), and `findBy*` (asynchronous wait).
- Replace naive `fireEvent` synthetic dispatches with `@testing-library/user-event` to simulate realistic multi-event browser interactions (hover, focus, keypress, blur).
- Correctly utilize asynchronous utilities (`waitFor`, `waitForElementToBeRemoved`) while avoiding common anti-patterns (such as putting side-effects inside `waitFor`).
- Debug test environments effectively using `screen.debug()` and `logTestingPlaygroundURL()`.

---

## 3. Historical Evolution
```
+---------------------------------------------------------------------------------------------------+
| 2014 - 2017: The Enzyme Era (Shallow Rendering & State Peeking)                                   |
| Tested internal component mechanics: `wrapper.state()`, `wrapper.instance()`, `wrapper.find('Sub')`.|
| Fragile: Any refactoring of component internals broke tests, even if the UI worked perfectly.     |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2018 - 2021: The React Testing Library Paradigm Shift                                             |
| Kent C. Dodds created RTL. Eliminated shallow rendering; mounted real component trees into JSDOM.|
| Introduced queries based on accessibility standards (`getByRole`, `getByLabelText`).              |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2022 - Present: userEvent v14 & Unified Testing Ecosystem                                         |
| `@testing-library/user-event` v14 introduced asynchronous, realistic event chains that accurately|
| model browser event loops, focus management, text selection, and keyboard accessibility.          |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. First Principles & Intuitive Physical Analogies (Layer 1)
Think of React Testing Library through physical engineering analogs:

### Analogy 1: The ATM Customer vs. The Bank Technician
- **The Enzyme / Implementation Approach (The Technician)**: Unscrews the ATM's metal casing with a screwdriver, attaches a digital probe to PCB Circuit #4, and checks if capacitor C3 holds 5.1 volts when a button is pressed. If the bank upgrades from PCB Circuit #4 to an integrated microchip, the test fails, even if the ATM dispenses cash identically.
- **The RTL / User-Centric Approach (The Customer)**: Stands in front of the ATM, inserts a card, types the 4-digit PIN using the physical keypad, presses the "Withdraw $100" button on the screen, and checks if $100 bills appear in the dispensing slot. As long as cash dispenses, the customer does not care what microchip is inside.

### Analogy 2: Finding a Book in a Library (The Query Hierarchy)
Imagine you enter a public library:
1. **`getByRole` (The Signpost)**: You look up at the ceiling signs: *"Fiction Section"*, *"Information Desk"*, *"Checkout Register"*. Accessible roles tell everyone what an area is designed to do.
2. **`getByLabelText` (The Shelf Label)**: You walk up to a shelf labeled *"Science Fiction"*. Form inputs must have labels.
3. **`getByText` (The Book Cover)**: You search for the title printed on the book cover.
4. **`getByTestId` (The Barcode on the Back)**: If you were blindfolded and forced to scan secret invisible barcodes glued to the floor (`data-testid="bookshelf-3"`), you could find the shelf, but you wouldn't know if a human could actually find it. Use `data-testid` only as an absolute last resort when semantic HTML cannot represent the element.

---

## 5. Internal Working & Engine Architecture (Layer 2)

### The Three Query Types & Their Error Handling Mechanics
Understanding when each query throws is critical to writing bug-free tests:

```
+---------------+------------------------+--------------------------+-----------------------+
| Query Type    | 0 Elements Found       | Exactly 1 Element Found  | >1 Elements Found     |
+---------------+------------------------+--------------------------+-----------------------+
| getBy...      | THROWS Error           | Returns Element Node     | THROWS Error          |
| queryBy...    | Returns null (No error)| Returns Element Node     | THROWS Error          |
| findBy...     | THROWS Error (timeout) | Returns Promise<Node>    | THROWS Error          |
+---------------+------------------------+--------------------------+-----------------------+
```

### The Query Selection Decision Matrix
```
Do you expect the element to be present immediately?
├── YES -> Use `getBy*` (e.g. `screen.getByRole('button')`)
└── NO
    ├── Do you expect it to NEVER be in the DOM?
    │   └── Use `queryBy*` (e.g. `expect(screen.queryByText(/error/)).not.toBeInTheDocument()`)
    └── Do you expect it to appear ASYNCHRONOUSLY after data fetch?
        └── Use `findBy*` (e.g. `await screen.findByRole('heading')`)
```

### `userEvent` vs `fireEvent`: The Event Chain Mechanics
When a user clicks a button in a real browser:
- `fireEvent.click(button)`: Directly calls `button.dispatchEvent(new MouseEvent('click'))`. It skips hover, pointerdown, focus, mousedown, mouseup, and keydown events.
- `await user.click(button)`: Executes the full authentic browser interaction chain:
  1. Checks if element is visible and un-disabled (pointer-events check).
  2. Moves mouse pointer (dispatches `pointerover`, `mouseover`, `pointermove`).
  3. Dispatches `pointerdown`, `mousedown`.
  4. Moves browser focus to element (dispatches `focus`, `focusin`).
  5. Dispatches `pointerup`, `mouseup`.
  6. Dispatches `click`.

---

## 6. Runtime Flow & Execution Traces

### Trace: Execution of an Asynchronous Interaction in RTL
```
Step 1: Test executes user interaction:
        const user = userEvent.setup();
        render(<UserProfile userId="123" />);
        await user.click(screen.getByRole('button', { name: /load details/i }));

Step 2: Component triggers async data fetch:
        Component sets isLoading = true; React renders <Spinner /> to DOM.

Step 3: Test runner reaches async assertion:
        const userName = await screen.findByText('Alice Smith');

Step 4: 'findByText' internal execution loop:
        - Internally calls waitFor(() => getByText('Alice Smith')).
        - Initial check: getByText throws "Cannot find element".
        - Registers a MutationObserver on document.body.
        - Waits for DOM mutations or runs interval check every 50ms.

Step 5: MSW network mock resolves; Component updates state; React reconciles:
        Spinner unmounts; <h2>Alice Smith</h2> mounts into the DOM.

Step 6: MutationObserver fires:
        findByText re-evaluates getByText('Alice Smith').
        Element found! Promise resolves with HTMLHeadingElement node.

Step 7: Assertion passes. Total elapsed time: ~35ms.
```

---

## 7. Memory Model & Accessibility Object Tree (AOM)

```
DOM TREE (C++ / JSDOM)               ACCESSIBILITY TREE (Computed by RTL)

<div>                                [RootWebArea]
  <nav>                                └── [Navigation: "Main Nav"]
    <a href="/home">Home</a>                └── [Link: "Home"]
  </nav>
  <main>                               └── [Main Landmark]
    <h1>Dashboard</h1>                      ├── [Heading Level 1: "Dashboard"]
    <form>                                  └── [Form]
      <label for="email">Email</label>           ├── [TextBox: "Email"] (Accessible Name)
      <input id="email" type="email" />          └── [Button: "Submit"]
      <button type="submit">Submit</button>
    </form>
  </main>
</div>

RTL evaluates queries against the Accessibility Tree (AOM):
- screen.getByRole('textbox', { name: /email/i }) -> Matches [TextBox: "Email"]
- screen.getByRole('button', { name: /submit/i })  -> Matches [Button: "Submit"]
```

---

## 8. Visual Diagrams (ASCII / Text)

### The Official RTL Query Priority Hierarchy
```
HIGHEST PRIORITY (Accessible to everyone - Screen Readers, Assistive Tech, and Users)
+------------------------------------------------------------------------------------+
| 1. getByRole: screen.getByRole('button', { name: /submit/i })                      |
|    Forces semantic HTML (button, heading, dialog, alert, textbox).                |
+------------------------------------------------------------------------------------+
| 2. getByLabelText: screen.getByLabelText(/password/i)                             |
|    Forces proper <label for="..."> association for form inputs.                    |
+------------------------------------------------------------------------------------+
| 3. getByPlaceholderText: screen.getByPlaceholderText(/search/i)                   |
|    Use only if input has no label (e.g. search bars).                              |
+------------------------------------------------------------------------------------+
| 4. getByText: screen.getByText(/terms of service/i)                                |
|    Standard non-interactive display text (paragraphs, spans).                      |
+------------------------------------------------------------------------------------+
| 5. getByDisplayValue: screen.getByDisplayValue('alice@acme.com')                   |
|    Used to verify existing pre-filled form values.                                 |
+------------------------------------------------------------------------------------+
LOWEST PRIORITY (Implementation Detail - Not accessible to users)
+------------------------------------------------------------------------------------+
| 6. getByAltText: screen.getByAltText(/company logo/i)                              |
|    Images and graphics alt tags.                                                   |
+------------------------------------------------------------------------------------+
| 7. getByTitle: screen.getByTitle(/close tooltip/i)                                 |
|    SVG or button tooltip titles.                                                   |
+------------------------------------------------------------------------------------+
| 8. getByTestId: screen.getByTestId('custom-drag-handle')                           |
|    LAST RESORT ONLY! Used when element has no semantic role or visible text.      |
+------------------------------------------------------------------------------------+
```

---

## 9. Real World Usage & Production Patterns

> 🧪 **Companion Interactive Lab:** [TestingLab.tsx](../../apps/portal/src/features/visualizers/topic-10-testing/TestingLab.tsx) | Live in Portal: topic-10-testing

### Pattern 1: Complete Form Interaction with `userEvent` and Accessibility Queries
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

test('submits user credentials and handles validation errors', async () => {
  // Always initialize userEvent.setup() before rendering
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(<LoginForm onSubmit={onSubmitMock} />);

  // 1. Query elements by accessible role and label
  const emailInput = screen.getByRole('textbox', { name: /email address/i });
  const passwordInput = screen.getByLabelText(/^password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

  // 2. Perform realistic multi-event user typing
  await user.type(emailInput, 'architect@enterprise.com');
  await user.type(passwordInput, 'Secret123!');
  await user.click(submitButton);

  // 3. Verify callback behavior
  expect(onSubmitMock).toHaveBeenCalledTimes(1);
  expect(onSubmitMock).toHaveBeenCalledWith({
    email: 'architect@enterprise.com',
    password: 'Secret123!'
  });

  // 4. Verify no error message exists in the DOM using queryBy
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
```

### Pattern 2: Correct Usage of `waitFor` (Avoiding Traps)
```tsx
// Anti-Pattern: Putting user actions inside waitFor
// BAD: await waitFor(() => user.click(button));

// Anti-Pattern: Multiple independent assertions inside one waitFor
// BAD: await waitFor(() => { expect(a).toBe(1); expect(b).toBe(2); });

// CORRECT PATTERN: Use findBy* for single elements, or single assertion in waitFor
test('displays asynchronous notification toast', async () => {
  const user = userEvent.setup();
  render(<NotificationCenter />);

  await user.click(screen.getByRole('button', { name: /trigger alert/i }));

  // findBy automatically handles the asynchronous wait loop
  const toast = await screen.findByRole('status');
  expect(toast).toHaveTextContent(/system updated successfully/i);

  // Asserting disappearance via waitForElementToBeRemoved
  await waitForElementToBeRemoved(() => screen.queryByRole('status'));
});
```

### Pattern 3: Interactive Playground Debugging
```typescript
import { screen } from '@testing-library/react';

test('debugging complex component trees', () => {
  render(<ComplexDataGrid />);

  // Outputs formatted HTML to the terminal console
  screen.debug();

  // Generates a clickable link to Testing Playground (visual query builder)
  // screen.logTestingPlaygroundURL();
});
```

---

## 10. Angular Comparison
For an engineer transitioning from enterprise Angular:

| Architectural Concept | Enterprise Angular Testing | Modern React Testing Library |
| :--- | :--- | :--- |
| **Component DOM Access** | `fixture.debugElement.nativeElement.querySelector('.btn')`. | Semantic accessibility queries: `screen.getByRole('button')`. |
| **Simulating Clicks** | `button.click()` or `debugElement.triggerEventHandler('click')`. | Real multi-event chains: `await user.click(button)`. |
| **Asynchronous Updates** | `fakeAsync` + `tick(500)` or `fixture.whenStable()`. | `await screen.findByRole(...)` or `await waitFor(...)`. |
| **Component Instance** | Direct access: `fixture.componentInstance.myMethod()`. | Zero component instance access; test purely via rendered DOM. |

---

## 11. .NET Comparison
For a Senior .NET / Blazor Architect:

| Architectural Concept | .NET (bUnit / Blazor Testing) | React Testing Library |
| :--- | :--- | :--- |
| **Component Harness** | `ctx.RenderComponent<Counter>()`. | `render(<Counter />)`. |
| **DOM Queries** | CSS / semantic queries: `cut.Find("button")`. | Accessibility AOM queries: `screen.getByRole("button")`. |
| **Assertions** | `cut.MarkupMatches("<h3>Count: 1</h3>")`. | `expect(screen.getByRole('heading')).toHaveTextContent('Count: 1')`. |
| **Asynchronous Renders** | `cut.WaitForAssertion(() => ...)` or `cut.WaitForState(...)`. | `await waitFor(() => ...)` and `await screen.findBy*(...)`. |

---

## 12. Enterprise Perspective & Production Risks (Layer 4)

### The "Accessibility as a Byproduct" Enterprise Advantage
- In enterprise development, building for accessibility (WCAG 2.2 AA) is often seen as a costly chore that gets deprioritized by product managers.
- When teams adopt React Testing Library with strict query rules (`getByRole` as mandatory), **developers cannot write passing tests for inaccessible markup**:
  - If a button is built as `<div onClick={...}>Submit</div>`, `screen.getByRole('button')` throws an error.
  - If an input lacks `<label for="...">`, `screen.getByLabelText()` fails.
- RTL transforms accessibility compliance into an automated byproduct of everyday unit testing, mitigating enterprise ADA and EAA legal liabilities.

### The `data-testid` Proliferation Anti-Pattern
- In poorly governed codebases, developers take the path of least resistance by slapping `data-testid="submit-btn"` onto every HTML tag.
- This defeats RTL's philosophy: a button could have `opacity: 0`, `aria-hidden: true`, or `display: none`, but `getByTestId` will find it and the test will pass while real users and screen readers are completely blocked.
- **Enterprise Mitigation**: Configure ESLint rules (`testing-library/prefer-screen-queries`, `testing-library/no-node-access`) and restrict `data-testid` to non-semantic graphics or complex canvas overlays.

---

## 13. Performance Considerations
- **`userEvent` Typing Delays**: By default, `userEvent.type(input, 'long string')` simulates human typing speed by yielding between keystrokes. In massive test suites, typing 50 characters across 200 tests adds seconds of idle wait time. Use `userEvent.setup({ delay: null })` to execute keystroke chains instantly while preserving full event dispatch fidelity.
- **`waitFor` Timeout Budget**: `waitFor` defaults to a 1000ms timeout with a 50ms polling interval. Avoid nesting multiple `waitFor` statements sequentially; compose single asynchronous assertions to avoid burning CPU cycles in worker threads.

---

## 14. Tradeoffs

| Approach | Primary Benefit | Operational Cost / Drawback |
| :--- | :--- | :--- |
| **Accessible Role Queries (`getByRole`)** | Enforces WCAG accessibility; refactor-proof; tests real user experience. | Requires developers to learn standard ARIA roles (e.g. `banner`, `main`, `status`). |
| **Test IDs (`getByTestId`)** | Trivial to write; never breaks when visible text or HTML tags change. | Zero confidence in accessibility; misses broken labels; implementation-coupled. |
| **`userEvent`** | Real browser dispatch chains (focus, blur, hover, keypress). | Asynchronous (`await` required on all actions); slightly slower than synthetic events. |
| **`fireEvent`** | Instant synchronous dispatch; fast execution. | Does not trigger real browser behaviors (focus, blur, keyboard selection). |

---

## 15. Common Mistakes & Interview Traps
- **Trap 1: Using `fireEvent` instead of `userEvent`.**
  - *Symptom*: Form submission tests pass, but production fails because browser validation or focus events weren't triggered.
  - *Fix*: Always use `const user = userEvent.setup()` and `await user.click(...)`.
- **Trap 2: Using `queryBy*` for existence assertions.**
  - *Symptom*: `expect(screen.queryByRole('button')).toBeInTheDocument()`. If the element is missing, the error message simply says "expected null to be in the document," providing zero clue why.
  - *Fix*: Use `screen.getByRole('button')`. If it's missing, it prints the entire DOM tree and lists all available accessible roles.
- **Trap 3: Performing side-effects inside `waitFor`.**
  - *Symptom*: `await waitFor(() => { user.click(btn); expect(...); })`. The click runs 20 times in a loop as `waitFor` polls, triggering duplicate mutations!
  - *Fix*: Actions go outside `waitFor`; only assertions go inside `waitFor`.

---

## 16. Interview Questions & Architectural Answers (Senior, Lead, Architect - Layer 5)

### Question 1 (Senior Level): What is the difference between `getBy*`, `queryBy*`, and `findBy*` in React Testing Library, and when should each be used?
**Answer**:
1. **`getBy*`**: Synchronously queries for an element. If 0 elements or >1 elements match, it immediately throws an error containing the current DOM tree. Use this as your **default query** when you expect the element to already exist in the DOM.
2. **`queryBy*`**: Synchronously queries for an element. If 0 elements match, it returns `null` instead of throwing. Use this **exclusively for asserting non-existence**:
   ```typescript
   expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
   ```
3. **`findBy*`**: Asynchronously queries for an element by returning a Promise that wraps `getBy*` inside `waitFor()`. It retries until the element appears or the timeout (default 1000ms) expires. Use this when querying for elements that appear **after asynchronous events** (data fetching, animations, lazy loading):
   ```typescript
   const heading = await screen.findByRole('heading', { name: /welcome/i });
   ```

### Question 2 (Lead Level): Why does `getByRole('button', { name: /save/i })` provide significantly higher test resilience than `getByText('Save')` or `getByTestId('save-btn')`?
**Answer**:
`getByRole` queries the Accessibility Object Model (AOM) rather than raw DOM strings or arbitrary attributes:
1. **Semantic HTML Enforcement**: `getByRole('button')` guarantees that the element is an actual `<button>` (or an element with `role="button"` and keyboard accessibility). `getByText('Save')` could match a non-interactive `<span>Save</span>` that a keyboard user cannot trigger.
2. **Accessible Name Computation**: The `{ name: /save/i }` option calculates the element's **accessible name** as computed by the browser's accessibility engine. It matches whether the text comes from children (`<button>Save</button>`), an `aria-label` (`<button aria-label="Save file"><Icon /></button>`), or an `aria-labelledby` reference.
3. **Resilience to Visual Redesign**: If a designer replaces the visible text "Save" with an icon and an `aria-label="Save"`, tests using `getByRole` continue to pass without modification, whereas `getByText` breaks.

### Question 3 (Architect Level): How do you enforce user-centric testing standards across an engineering organization of 100+ developers?
**Answer**:
We implement a three-tiered organizational governance strategy:
1. **Automated Static Guardrails (ESLint)**:
   We configure `eslint-plugin-testing-library` with strict rules:
   - `testing-library/prefer-screen-queries`: Enforces `screen` over destructuring from `render()`.
   - `testing-library/prefer-user-event`: Bans `fireEvent` across the entire codebase.
   - `testing-library/no-wait-for-side-effects`: Prevents actions inside `waitFor`.
   - `testing-library/prefer-presence-queries`: Enforces `getBy` for presence and `queryBy` for absence.
2. **Test ID Disincentivization**: We mandate in our style guide that any use of `data-testid` requires an inline comment explaining why semantic HTML / ARIA cannot fulfill the query requirement, reviewed during PR approval.
3. **Internal Custom Render Wrappers**: Provide a standard corporate `@acme/test-utils` library exporting a customized `render` function pre-configured with theme providers, TanStack Query clients, and router memory contexts, ensuring every developer writes high-level integration tests with zero boilerplate.

---

## 17. Senior-Level Mental Model & "How to Remember This Forever" (Memory Anchors - Layer 3)

### The "Screen Reader & Customer" Rule
- **Think like a blind customer using a screen reader**:
- You don't know what CSS classes exist.
- You don't know what React state variables are named.
- You listen for **Roles** (*"Button"*, *"Dialog"*), **Labels** (*"Username"*), and **Status messages**.
- If a screen reader cannot find the button, your test should not be able to find it either.

---

## 18. Core Vocabulary & "Aha!" Breakthrough Insights (Refresher)
- **Accessible Name**: The text string computed by the browser representing an element in the accessibility tree (derived from text content, `aria-label`, or `<label>`).
- **userEvent**: The official library for dispatching realistic browser event chains (hover, focus, typing, clicking).
- **fireEvent**: Primitive utility dispatching synthetic DOM events without browser side-effects.
- **waitFor**: Utility that retries an assertion until it passes or times out.
- **Implementation Details**: Code specifics that users do not observe (state variable names, component hierarchy, private methods).

---

## 19. Key Takeaways
- Never test implementation details (internal state, private methods); test observable DOM behavior.
- Query elements using accessibility roles (`getByRole`, `getByLabelText`) to enforce semantic HTML and WCAG compliance.
- Reserve `queryBy*` exclusively for asserting non-existence (`not.toBeInTheDocument()`).
- Always use `@testing-library/user-event` over `fireEvent` to simulate realistic browser interaction chains.
- Never place side-effects (e.g. `user.click`) inside `waitFor` callbacks.

---

## 20. Revision Sheet
- **Q: What is the core philosophy of React Testing Library?**
  *A:* "The more your tests resemble the way your software is used, the more confidence they can give you."
- **Q: Which query should you use to check that a modal is NOT in the DOM?**
  *A:* `screen.queryByRole('dialog')` with `expect(...).not.toBeInTheDocument()`.
- **Q: Why is `userEvent` preferred over `fireEvent`?**
  *A:* `userEvent` dispatches the entire chain of realistic browser events (hover, focus, mousedown, mouseup, click) rather than a single synthetic event.
- **Q: What is the highest-priority query in RTL?**
  *A:* `getByRole`.
- **Q: What happens if you execute `user.click(btn)` inside `waitFor(() => ...)`?**
  *A:* The click action runs repeatedly on every polling interval until the timeout expires, causing unintended multiple executions.
