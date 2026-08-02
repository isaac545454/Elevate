# Templates Reference

Copy-paste boilerplate for the most common file types in the React architecture.

---

## Page Shell

```tsx
 
import { <FeatureName>Page } from "@/features/<name>-page";

export default function <FeatureName>PageRoute() {
  return <<FeatureName>Page />;
}
```

---

## Feature Root (index.tsx)

```tsx
 
export function <FeatureName>Page() {
  return (
    <main>
      <h1><FeatureName></h1>
    </main>
  );
}
```

---

## Feature with local state

```tsx
 
import { useState } from "react";
import { <FeatureName>Form } from "./components/<FeatureName>Form";
import { use<FeatureName> } from "./hooks/use-<name>";

export function <FeatureName>Page() {
  const { data, isLoading, error } = use<FeatureName>();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <main>
      <FeatureName>Form data={data} />
    </main>
  );
}
```

---

## Custom Hook (feature-scoped)

```ts
 
import { useState, useEffect } from "react";
import { <name>Service } from "@/services/<name>Service";

export function use<Name>() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    <name>Service.getAll()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
```

---

## API file

```ts
 
import { apiClient } from "./client";

export const <name>Api = {
  getAll: () => apiClient.get("/<name>s"),
  getById: (id: string) => apiClient.get(`/<name>s/${id}`),
  create: (body: unknown) => apiClient.post("/<name>s", body),
  update: (id: string, body: unknown) => apiClient.put(`/<name>s/${id}`, body),
  delete: (id: string) => apiClient.delete(`/<name>s/${id}`),
};
```

---

## API Client base

```ts
 
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
```

---

## Service file

```ts
 
import { <name>Api } from "@/api/<name>Api";

export const <name>Service = {
  getAll: async () => {
    const data = await <name>Api.getAll();
    return data;
  },

  getById: async (id: string) => {
    return <name>Api.getById(id);
  },

  create: async (payload: unknown) => {
    return <name>Api.create(payload);
  },
};
```

---

## Zustand Store slice

```ts
 
import { create } from "zustand";

interface <Name>State {
  items: unknown[];
  setItems: (items: unknown[]) => void;
  clear: () => void;
}

export const use<Name>Store = create<<Name>State>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));
```

---

## Routes config (React Router)

```tsx
 
import { createBrowserRouter } from "react-router-dom";
import LoginPageRoute from "@/pages/login/page";
import DashboardPageRoute from "@/pages/dashboard/page";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPageRoute /> },
  { path: "/dashboard", element: <DashboardPageRoute /> },
]);
```

---

## UI Primitive example (Button)

```tsx
 
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className ?? ""}`}
      {...props}
    />
  );
}
```