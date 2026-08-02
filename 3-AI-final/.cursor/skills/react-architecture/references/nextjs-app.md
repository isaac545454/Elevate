# Next.js App Router — Reference

## Route Shell

```tsx

import { LoginPage } from "@/features/login-page";

export default function LoginRoute() {
  return <LoginPage />;
}
```

## With metadata

```tsx
 
import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
```

## Loading state

```tsx
 
export default function DashboardLoading() {
  return <div>Loading...</div>;
}
```

## Error boundary

```tsx
 
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

## Root Layout

```tsx
 
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | MyApp", default: "MyApp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Route Groups (shared layouts without affecting URL)

```
app/
├── (auth)/
│   ├── layout.tsx       ← shared auth layout (no navbar)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx       ← shared app layout (with navbar)
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
```

```tsx
 
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-layout">
      {children}
    </main>
  );
}
```

## Server vs Client Components

```tsx
 
import { getDashboardData } from "@/services/dashboardService";
import { StatsClient } from "./components/StatsClient";

export async function DashboardPage() {
  const data = await getDashboardData(); 
  return (
    <div>
      <h1>Dashboard</h1>
      <StatsClient initialData={data} />  
    </div>
  );
}
```

```tsx
 
"use client";
import { useState } from "react";

export function StatsClient({ initialData }: { initialData: unknown }) {
  const [data, setData] = useState(initialData);
 
  return <div>{/* ... */}</div>;
}
```

> **Rule:** Keep `"use client"` as deep in the tree as possible. Never put it on the feature root unless the whole feature is interactive.

## Middleware (auth protection)

```ts
 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

## Full Scaffold — first-time setup

```
app/
├── layout.tsx
├── page.tsx
├── (auth)/
│   ├── layout.tsx
│   └── login/
│       ├── page.tsx
│       └── loading.tsx
└── (app)/
    ├── layout.tsx
    └── dashboard/
        ├── page.tsx
        ├── loading.tsx
        └── error.tsx

src/
├── features/
│   └── .gitkeep
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
    └── .gitkeep
```