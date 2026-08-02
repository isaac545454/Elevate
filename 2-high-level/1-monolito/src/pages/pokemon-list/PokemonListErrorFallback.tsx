"use client";

import type { ErrorBoundaryFallbackProps } from "@/components/error-boundary/ErrorBoundary";
import { QueryErrorFallback } from "@/components/query-error-fallback/QueryErrorFallback";

export function PokemonListErrorFallback(props: ErrorBoundaryFallbackProps) {
  return (
    <QueryErrorFallback
      title="Não foi possível carregar os Pokémon."
      {...props}
    />
  );
}
