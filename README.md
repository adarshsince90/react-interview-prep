# Frontend Engineering Handbook

> A deep-first-principles learning repository for transitioning from **Senior Angular + .NET Engineer** to **Senior React + Next.js Engineer**, with a strong focus on architecture, runtime internals, enterprise engineering, performance, and interview preparation.

---

# Why This Repository Exists

Most React learning resources focus on:

- React APIs
- Hook syntax
- Building small applications
- Framework-specific tutorials

While useful, these approaches often create engineers who know:

```jsx
useState()
useEffect()
useMemo()
useCallback()
```

but struggle to answer:

- Why React re-renders
- Why Hooks depend on closures
- Why dependency arrays exist
- How React scheduling works
- How Fiber works
- Why Next.js exists
- How Server Components work
- How rendering strategies affect performance
- How enterprise React applications are structured

This repository takes a different approach.

Instead of learning React from the outside in, we learn it from the inside out:

```text
JavaScript Runtime
        ↓
Browser Platform
        ↓
React Mental Model
        ↓
React Internals
        ↓
State Management
        ↓
Next.js
        ↓
Enterprise Architecture
        ↓
Performance
        ↓
Interview Preparation
```

The goal is not memorization.

The goal is understanding.

---

# Target Audience

This repository is designed for engineers who already have software engineering experience and want to deeply understand React and modern frontend architecture.

Ideal readers include:

- Senior Angular Developers
- Senior .NET Engineers
- Full Stack Engineers
- Software Architects
- Technical Leads
- Enterprise Developers
- Engineers preparing for React/Next.js interviews

Especially engineers coming from:

```text
Angular
ASP.NET Core
Java
Spring Boot
Enterprise Architecture
Microservices
```

backgrounds.

---

# Learning Philosophy

This repository follows a strict principle:

> Understand WHY before learning HOW.

Every topic is studied using first principles.

For every concept, we answer:

- Why does it exist?
- What problem does it solve?
- What came before it?
- Why wasn't the previous solution sufficient?
- How does it work internally?
- What are the tradeoffs?
- How is it used in enterprise systems?
- How does React relate to Angular?
- How does React relate to .NET?

---

# How We Learn

Every chapter follows a consistent deep-dive structure.

```text
1. Why This Topic Exists

2. Learning Objectives

3. Historical Evolution

4. First Principles

5. Internal Working

6. Runtime Flow

7. Memory Model

8. Visual Diagrams

9. Real World Usage

10. Angular Comparison

11. .NET Comparison

12. Enterprise Perspective

13. Performance Considerations

14. Tradeoffs

15. Common Mistakes

16. Interview Questions

17. Senior-Level Mental Model

18. Key Takeaways

19. Revision Sheet
```

---

# Learning Workflow

Each topic follows a two-step process.

---

## Step 1: Deep Dive Discussion

We first discuss the topic in depth.

Goals:

- Build mental models
- Explore internals
- Clarify doubts
- Connect concepts
- Understand tradeoffs

No markdown file is generated during this stage.

Example:

```text
Topic:
Closures

Discussion:
- Why closures exist
- Lexical environments
- Runtime behavior
- Memory retention
- React Hook relationship
- Stale closures
- Enterprise implications
```

---

## Step 2: Handbook Generation

After discussion is complete:

- Generate handbook-quality markdown
- Include all insights
- Include diagrams
- Include interview questions
- Include revision notes
- Save into repository

---

# Repository Roadmap

---

## Phase 00
### Angular → React Transition

Purpose:

Understand the mental model shift required when moving from Angular to React.

Topics:

- Angular vs React Mental Model
- Change Detection vs Reconciliation
- RxJS vs React State
- NgRx vs Redux Toolkit
- Services vs Custom Hooks
- Signals vs React State
- Guards vs Middleware
- Enterprise Architecture Comparison

Goal:

```text
Angular Thinking
        ↓
React Thinking
```

---

## Phase 01
### JavaScript Runtime Foundations

The single most important phase in the repository.

Most React concepts become obvious after mastering JavaScript internals.

Topics:

- Execution Model
- Scope
- Hoisting
- TDZ
- Closures
- Event Loop
- Promises
- Async/Await
- Objects
- Prototypes
- this
- Functional Programming
- ES6+
- Memory Management
- Modules
- Browser Networking

Goal:

Understand how JavaScript actually executes.

---

## Phase 02
### Browser Platform

React runs inside a browser.

To understand React deeply, we must understand the platform it runs on.

Topics:

- Browser Architecture
- DOM
- Rendering Pipeline
- Layout
- Paint
- Composite
- Events
- Event Delegation
- Service Workers
- Fetch API
- CORS
- Storage

Goal:

Understand browser internals.

---

## Phase 03
### React Foundations

Topics:

- Why React Exists
- History of React
- JSX
- Components
- Props
- State
- Hooks
- Context
- Forms
- Render Cycle

Goal:

Build React mental models.

---

## Phase 04
### React Rendering Internals

The most important React phase for senior engineers.

Topics:

- Virtual DOM
- Reconciliation
- Fiber
- Scheduler
- Render Phase
- Commit Phase
- Concurrent Rendering
- Suspense
- Transitions

Goal:

Understand how React works internally.

---

## Phase 05
### State Management

Topics:

- useState
- useReducer
- Context API
- Redux Toolkit
- Zustand
- Jotai
- Signals Comparison

Goal:

Know which state management solution to use and when.

---

## Phase 06
### Data Fetching & Server State

Topics:

- Client State vs Server State
- TanStack Query
- Query Cache
- Mutations
- Revalidation
- Optimistic Updates
- API Layer Design

Goal:

Understand modern data-fetching architecture.

---

## Phase 07
### Next.js Foundations

Topics:

- Why Next.js Exists
- App Router
- Layouts
- Metadata
- Middleware
- Routing

Goal:

Understand React Platform Engineering.

---

## Phase 08
### Next.js Rendering & Server Components

Topics:

- CSR
- SSR
- SSG
- ISR
- Hydration
- Streaming
- Server Components
- Client Components
- Server Actions
- Edge Runtime

Goal:

Understand how modern React applications are delivered.

---

## Phase 09
### Authentication & Security

Topics:

- JWT
- OAuth2
- OIDC
- Session Auth
- Token Auth
- NextAuth / Auth.js
- Entra ID
- Route Protection
- Middleware Security
- XSS
- CSRF
- CORS

Goal:

Build production-grade authentication systems.

---

## Phase 10
### Performance Engineering

Topics:

- Re-renders
- useMemo
- useCallback
- React.memo
- Bundle Optimization
- Code Splitting
- Web Vitals
- Profiling

Goal:

Understand performance from first principles.

---

## Phase 11
### Enterprise React Architecture

Topics:

- Feature-Based Architecture
- Domain-Driven Frontend
- Design Systems
- Shared Libraries
- Monorepos
- Nx
- Turborepo
- Micro Frontends
- Module Federation

Goal:

Design applications at scale.

---

## Phase 12
### Testing Strategy

Topics:

- Testing Pyramid
- Jest
- Testing Library
- Component Testing
- Integration Testing
- Playwright
- E2E Testing

Goal:

Build confidence through testing.

---

## Phase 13
### Frontend System Design

Topics:

- Large Scale Applications
- Multi-Tenant Systems
- Offline Applications
- Real-Time Applications
- Dashboard Design
- BFF Pattern
- Scaling Frontends

Goal:

Prepare for architect-level discussions.

---

## Phase 14
### Interview Preparation

Topics:

- JavaScript Interviews
- React Interviews
- Next.js Interviews
- Senior Scenarios
- Lead Scenarios
- Architect Scenarios
- System Design Questions

Goal:

Prepare for:

- Senior Engineer Interviews
- Staff Engineer Interviews
- Lead Engineer Interviews
- Architect Interviews

---

# Recommended Learning Sequence

Follow this order strictly.

```text
Phase 00
Angular → React

Phase 01
JavaScript Runtime

Phase 02
Browser Platform

Phase 03
React Foundations

Phase 04
React Internals

Phase 05
State Management

Phase 06
Server State

Phase 07
Next.js Foundations

Phase 08
Next.js Rendering

Phase 09
Authentication

Phase 10
Performance

Phase 11
Architecture

Phase 12
Testing

Phase 13
System Design

Phase 14
Interview Preparation
```
