import Link from "next/link";

const pages = [
  {
    href: "/post-list",
    title: "JSONPlaceholder",
    description: "Posts com imagens estáticas (Picsum) por ID.",
  },
  {
    href: "/character-list",
    title: "The Rick and Morty API",
    description: "Personagens com arte oficial da API.",
  },
  {
    href: "/pokemon-list",
    title: "PokéAPI",
    description: "Pokémon com sprites do repositório oficial.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Módulos de exemplo
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-muted)]">
          Três listagens na mesma app, organizadas em layers (
          <span className="font-mono text-sm">pages</span>,{" "}
          <span className="font-mono text-sm">components</span>,{" "}
          <span className="font-mono text-sm">services</span>,{" "}
          <span className="font-mono text-sm">hooks</span>
          ), com{" "}
          <span className="text-[var(--color-foreground)]">
            card e paginação compartilhados
          </span>{" "}
          em{" "}
          <span className="font-mono text-sm">@/components/…</span>.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {pages.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm transition-colors hover:border-zinc-500 hover:shadow-md"
            >
              <span className="block text-lg font-medium text-[var(--color-foreground)]">
                {item.title}
              </span>
              <span className="mt-1 block text-sm text-[var(--color-muted)]">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
