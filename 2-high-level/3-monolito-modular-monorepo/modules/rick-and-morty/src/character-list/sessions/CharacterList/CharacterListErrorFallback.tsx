"use client";

import type { ErrorBoundaryFallbackProps } from "@repo/shared/components/error-boundary/ErrorBoundary";
import { QueryErrorFallback } from "@repo/shared/components/query-error-fallback/QueryErrorFallback";

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
