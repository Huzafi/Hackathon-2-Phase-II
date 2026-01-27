# Research: Frontend Application and Integration

**Feature**: 003-frontend-integration
**Date**: 2026-01-21
**Status**: Phase 0 - Research Complete

## Research Topics

### 1. Testing Framework for Next.js App Router

**Decision**: Jest + React Testing Library + Playwright (E2E)

**Rationale**:
- Jest is the de facto standard for React/Next.js unit and integration testing
- React Testing Library promotes testing user behavior over implementation details
- Next.js 15+ has built-in support for Jest configuration
- Playwright provides robust E2E testing for authentication flows and full user journeys
- This combination covers unit, integration, and E2E testing needs

**Alternatives Considered**:
- **Vitest**: Faster than Jest, but Jest has better Next.js ecosystem support and documentation
- **Cypress**: Popular E2E tool, but Playwright has better TypeScript support and parallel execution
- **Testing Library alone**: Insufficient for E2E scenarios like authentication flows

**Implementation Notes**:
- Use Jest for component and hook testing
- Use React Testing Library for rendering and user interaction testing
- Use Playwright for E2E authentication and task management flows
- Mock API calls in unit tests, use real API in E2E tests

---

### 2. Next.js App Router Authentication Patterns

**Decision**: Middleware-based authentication with route groups

**Rationale**:
- Next.js middleware runs before page rendering, enabling server-side auth checks
- Route groups `(auth)` and `(protected)` provide clear separation of public and protected routes
- Middleware can redirect unauthenticated users before rendering protected pages
- This pattern prevents flash of unauthenticated content (FOUC)
- Aligns with Next.js 15+ App Router best practices

**Alternatives Considered**:
- **Client-side only auth**: Causes FOUC, poor UX, security risk (protected content briefly visible)
- **Server Components with auth checks**: Requires auth check in every protected page, repetitive
- **Higher-Order Components (HOC)**: Legacy pattern, not idiomatic for App Router

**Implementation Notes**:
- Create `middleware.ts` at root to check JWT token in cookies/headers
- Use route groups: `app/(auth)/` for public pages, `app/(protected)/` for authenticated pages
- Store JWT in httpOnly cookies for security (prevents XSS attacks)
- Redirect to `/signin` if token missing or invalid
- Redirect to `/tasks` if authenticated user visits `/signin` or `/signup`

---

### 3. API Client Layer with JWT Injection

**Decision**: Centralized API client with automatic JWT header injection

**Rationale**:
- Single source of truth for API configuration (base URL, headers, error handling)
- Automatic JWT injection eliminates repetitive code in every API call
- Centralized error handling for 401 (redirect to signin) and other errors
- Type-safe API calls with TypeScript interfaces
- Easy to mock for testing

**Alternatives Considered**:
- **Manual fetch in each component**: Repetitive, error-prone, hard to maintain
- **SWR/React Query without wrapper**: Still requires manual JWT injection in every call
- **GraphQL client**: Overkill for simple REST API, adds complexity

**Implementation Notes**:
- Create `lib/api/client.ts` with base fetch wrapper
- Read JWT from localStorage/cookies and inject into Authorization header
- Handle 401 errors globally (clear token, redirect to signin)
- Handle network errors with user-friendly messages
- Export typed API functions (e.g., `getTasks()`, `createTask()`, `updateTask()`)
- Use TypeScript interfaces for request/response types

**Example Structure**:
```typescript
// lib/api/client.ts
export async function apiClient(endpoint: string, options?: RequestInit) {
  const token = getToken(); // from localStorage or cookies
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// lib/api/tasks.ts
export async function getTasks(): Promise<Task[]> {
  return apiClient('/api/tasks');
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  return apiClient('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

### 4. Loading, Error, and Empty State Patterns

**Decision**: React Suspense + Error Boundaries + Conditional Rendering

**Rationale**:
- React Suspense provides declarative loading states for async components
- Error Boundaries catch rendering errors and display fallback UI
- Conditional rendering for empty states keeps component logic clear
- Next.js App Router has built-in support for `loading.tsx` and `error.tsx` files
- This pattern provides consistent UX across all pages

**Alternatives Considered**:
- **Manual loading flags in state**: Repetitive, easy to forget, inconsistent UX
- **Global loading spinner**: Poor UX, doesn't show which part is loading
- **No error handling**: Crashes the app, terrible UX

**Implementation Notes**:
- Use `loading.tsx` files in route directories for automatic loading UI
- Use `error.tsx` files in route directories for automatic error boundaries
- For component-level loading, use conditional rendering with loading state
- For empty states, check data length and render empty state message
- Provide retry buttons for error states
- Use skeleton loaders for better perceived performance

**Example Structure**:
```typescript
// app/(protected)/tasks/loading.tsx
export default function Loading() {
  return <TaskListSkeleton />;
}

// app/(protected)/tasks/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Failed to load tasks</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}

// components/tasks/TaskList.tsx
export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState message="No tasks yet. Create your first task!" />;
  }

  return <ul>{tasks.map(task => <TaskItem key={task.id} task={task} />)}</ul>;
}
```

---

### 5. Responsive Design Patterns in Next.js/React

**Decision**: Tailwind CSS with mobile-first responsive utilities

**Rationale**:
- Tailwind CSS provides utility classes for responsive breakpoints (sm, md, lg, xl)
- Mobile-first approach ensures good mobile UX (most users on mobile)
- No custom CSS needed, faster development
- Built-in dark mode support (if needed in future)
- Excellent TypeScript support and IntelliSense
- Next.js has built-in Tailwind CSS support

**Alternatives Considered**:
- **CSS Modules**: More verbose, requires custom media queries, harder to maintain
- **Styled Components**: Runtime overhead, not ideal for Next.js App Router (server components)
- **Plain CSS**: No utility classes, requires writing custom responsive CSS

**Implementation Notes**:
- Install Tailwind CSS via Next.js setup
- Use mobile-first breakpoints: base (mobile), `sm:` (640px+), `md:` (768px+), `lg:` (1024px+)
- Use Tailwind's responsive utilities for layout, typography, spacing
- Use CSS Grid and Flexbox utilities for complex layouts
- Test on multiple screen sizes (320px, 768px, 1024px, 1920px)

**Example Responsive Patterns**:
```tsx
// Mobile: stack vertically, Desktop: side-by-side
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

// Mobile: full width, Desktop: centered with max width
<div className="w-full max-w-4xl mx-auto px-4 md:px-8">
  Content
</div>

// Mobile: small text, Desktop: larger text
<h1 className="text-2xl md:text-4xl font-bold">Title</h1>
```

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| Testing | Jest + React Testing Library + Playwright | Comprehensive coverage (unit, integration, E2E) |
| Authentication | Middleware + Route Groups | Server-side auth checks, no FOUC |
| API Client | Centralized client with JWT injection | DRY, type-safe, consistent error handling |
| State Handling | Suspense + Error Boundaries + Conditional | Declarative, consistent UX |
| Responsive Design | Tailwind CSS (mobile-first) | Fast development, utility-first, built-in support |

---

## Dependencies to Add

Based on research, the following dependencies should be added to `frontend/package.json`:

**Production Dependencies**:
- `tailwindcss` - Responsive design utilities
- `@tailwindcss/forms` - Form styling (optional but recommended)
- `clsx` or `classnames` - Conditional class names

**Development Dependencies**:
- `jest` - Testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Custom Jest matchers
- `@playwright/test` - E2E testing
- `@types/jest` - TypeScript types for Jest

---

## Open Questions Resolved

1. **Q: Should JWT be stored in localStorage or cookies?**
   - **A**: Use httpOnly cookies for security (prevents XSS). If not possible, use localStorage with caution.

2. **Q: Should we use Server Components or Client Components for task list?**
   - **A**: Use Server Components for initial render (better performance), Client Components for interactive features (create, update, delete).

3. **Q: How to handle token expiration?**
   - **A**: Backend returns 401 when token expires. Frontend catches 401, clears token, redirects to signin.

4. **Q: Should we implement optimistic updates?**
   - **A**: Out of scope for MVP. Use standard request-response pattern with loading states.

5. **Q: How to handle concurrent edits (two tabs)?**
   - **A**: Out of scope for MVP. Backend will handle last-write-wins. Future: add version field or timestamps.

---

## Next Steps

Phase 0 research is complete. All NEEDS CLARIFICATION items resolved. Proceed to Phase 1:
1. Generate `data-model.md` (frontend data structures and types)
2. Generate `contracts/` (API endpoint specifications)
3. Generate `quickstart.md` (setup and development guide)
4. Update agent context with new technologies
