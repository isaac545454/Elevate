"use client";

import type { ErrorBoundaryFallbackProps } from "@/components/error-boundary/ErrorBoundary";
import { QueryErrorFallback } from "@/components/query-error-fallback/QueryErrorFallback";

export function CharacterListErrorFallback(
  props: ErrorBoundaryFallbackProps,
) {
  return (
    <QueryErrorFallback
      title="Não foi possível carregar os personagens."
      {...props}
    />
  );
}
