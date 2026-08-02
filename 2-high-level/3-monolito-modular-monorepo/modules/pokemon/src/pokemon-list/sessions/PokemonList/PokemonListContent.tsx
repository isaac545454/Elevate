"use client";

import { Card } from "@repo/shared/components/card/Card";
import { Pagination } from "@repo/shared/components/pagination/Pagination";

import { usePokemonList } from "./usePokemonList";

export function PokemonListContent() {
  const { items, page, totalPages, handlePageChange } = usePokemonList();

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pokemon) => (
          <li key={pokemon.id}>
            <Card
              imageSrc={pokemon.imageSrc}
              imageAlt={pokemon.imageAlt}
              title={pokemon.title}
              description={pokemon.description}
            />
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
