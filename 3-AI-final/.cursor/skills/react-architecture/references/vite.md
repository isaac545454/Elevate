# Vite + React Router — Reference

## Entry Point

```tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./assets/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

## Router Config

```tsx

import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginRoute = lazy(() => import("@/pages/login/page"));
const DashboardRoute = lazy(() => import("@/pages/dashboard/page"));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginRoute />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardRoute />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
]);
```

## Protected Route

```tsx

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
```

## Page Shell

```tsx

import { LoginPage } from "@/features/login-page";

export default function LoginRoute() {
  return <LoginPage />;
}
```

## App.tsx (if using a layout wrapper)

```tsx

import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/Navbar";

export function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
```

Router with layout:
```tsx
export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/dashboard", element: <DashboardRoute /> },
      { path: "/settings", element: <SettingsRoute /> },
    ],
  },
  { path: "/login", element: <LoginRoute /> },
]);
```

## vite.config.ts (with path alias)

```ts
 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## tsconfig.json paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Full Scaffold — first-time setup

```
src/
├── main.tsx
├── App.tsx
├── pages/
│   └── .gitkeep
├── features/
│   └── .gitkeep
├── routes/
│   ├── index.tsx
│   └── ProtectedRoute.tsx
├── components/
│   └── ui/
│       └── .gitkeep
├── hooks/
│   └── .gitkeep
├── api/
│   └── .gitkeep
├── services/
│   └── .gitkeep
├── store/
│   └── .gitkeep
├── utils/
│   └── .gitkeep
└── assets/
    └── globals.css

index.html
vite.config.ts
tsconfig.json
```