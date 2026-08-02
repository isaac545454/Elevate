"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { CardGridSkeleton } from "@/components/card-grid-skeleton/CardGridSkeleton";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { PokemonListContent } from "@/pages/pokemon-list/PokemonListContent";
import { PokemonListErrorFallback } from "@/pages/pokemon-list/PokemonListErrorFallback";
import { pokemonListConfig } from "@/services/pokemonListConfig";

export function PokemonList() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          PokéAPI — Pokémon
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Sprites via{" "}
          <span className="font-mono text-xs">pokeapi.co</span> / sprites PNG do
          repositório oficial.
        </p>
      </header>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            FallbackComponent={PokemonListErrorFallback}
          >
            <Suspense
              fallback={
                <CardGridSkeleton count={pokemonListConfig.pageSize} />
              }
            >
              <PokemonListContent />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  );
}
