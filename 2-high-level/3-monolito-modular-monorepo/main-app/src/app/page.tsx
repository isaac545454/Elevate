import Link from "next/link";

const modules = [
  {
    href: "/jsonplaceholder",
    title: "JSONPlaceholder",
    description: "Posts com imagens estáticas (Picsum) por ID.",
  },
  {
    href: "/rick-and-morty",
    title: "The Rick and Morty API",
    description: "Personagens com arte oficial da API.",
  },
  {
    href: "/pokemon",
    title: "PokéAPI",
    description: "Pokémon com sprites do repositório oficial.",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Módulos de exemplo
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-muted)]">
          Três módulos como packages instaláveis (
          <span className="font-mono text-sm text-[var(--color-foreground)]">
            @repo/pokemon
          </span>
          , etc.), com UI compartilhada em{" "}
          <span className="font-mono text-sm text-[var(--color-foreground)]">
            @repo/shared
          </span>
          .
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {modules.map((item) => (
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
    </div>
  );
}
