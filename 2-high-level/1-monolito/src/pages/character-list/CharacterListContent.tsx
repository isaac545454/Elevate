"use client";

import { Card } from "@/components/card/Card";
import { Pagination } from "@/components/pagination/Pagination";
import { useCharacterList } from "@/hooks/useCharacterList";

export function CharacterListContent() {
  const { characters, page, totalPages, handlePageChange } =
    useCharacterList();

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <li key={character.id}>
            <Card
              imageSrc={character.imageSrc}
              imageAlt={character.imageAlt}
              title={character.title}
              description={character.description}
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
