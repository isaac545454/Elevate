# Advanced Patterns

## Protected Routes

```tsx
 
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
```

```tsx
 
{ path: "/dashboard", element: <ProtectedRoute><DashboardPageRoute /></ProtectedRoute> }
```

---

## Lazy Loading (code-split per page)

```tsx
 
import { lazy, Suspense } from "react";

const DashboardPageRoute = lazy(() => import("@/pages/dashboard/page"));

{ 
  path: "/dashboard", 
  element: (
    <Suspense fallback={<div>Loading…</div>}>
      <DashboardPageRoute />
    </Suspense>
  )
}
```

---

## Barrel Exports (index.ts per folder)

Avoid deep imports by exporting from index:

```ts
 
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";
```

Usage:
```ts
import { Button, Input } from "@/components/ui";
```

---

## Feature with sub-components pattern

```
features/user-profile-page/
├── index.tsx                    ← UserProfilePage (entry point)
├── components/
│   ├── ProfileHeader.tsx
│   ├── ProfileForm.tsx
│   └── AvatarUpload.tsx
└── hooks/
    ├── use-profile-data.ts
    └── use-avatar-upload.ts
```

`index.tsx` imports from `./components/` and `./hooks/` only.
No component in `features/user-profile-page/` should import from another feature's internals.

---

## Shared vs Feature-scoped hooks

| Hook is used in... | Put it in |
|--------------------|-----------|
| Only one feature | `features/<name>-page/hooks/` |
| 2+ features | `hooks/` |
| Wraps a store slice | `hooks/` |
| Wraps a service call for one feature | `features/<name>-page/hooks/` |

---

## Error Boundary per feature

```tsx
// src/features/<name>-page/index.tsx
import { ErrorBoundary } from "react-error-boundary";

export function <Name>Page() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <FeatureContent />
    </ErrorBoundary>
  );
}
```

---

## Environment / Config

```ts
 
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  env: process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === "production",
};
```