# Next.js Pages Router — Reference

## Route Shell

```tsx
 
import { LoginPage } from "@/features/login-page";

export default function LoginRoute() {
  return <LoginPage />;
}
```

## With getServerSideProps

```tsx
 
import { GetServerSideProps } from "next";
import { DashboardPage } from "@/features/dashboard-page";

interface Props {
  data: unknown;
}

export default function DashboardRoute({ data }: Props) {
  return <DashboardPage initialData={data} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetchSomething();
  return { props: { data } };
};
```

## With getStaticProps

```tsx
 
import { GetStaticPaths, GetStaticProps } from "next";
import { BlogPostPage } from "@/features/blog-post-page";

export default function BlogPostRoute({ post }: { post: unknown }) {
  return <BlogPostPage post={post} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params?.slug as string);
  return { props: { post }, revalidate: 60 };
};
```

## _app.tsx

```tsx
 
import type { AppProps } from "next/app";
import "@/assets/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

## _document.tsx

```tsx
 
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## API Route

```ts
 
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
 
  res.status(200).json({ token: "..." });
}
```

## Protected page pattern

```tsx
 
import { GetServerSideProps } from "next";
import { DashboardPage } from "@/features/dashboard-page";

export default function DashboardRoute() {
  return <DashboardPage />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies["token"];
  if (!token) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};
```

## Full Scaffold — first-time setup

```
pages/
├── _app.tsx
├── _document.tsx
├── index.tsx                        ← home
├── login.tsx
├── dashboard.tsx
└── api/
    └── .gitkeep

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