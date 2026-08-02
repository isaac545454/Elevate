import { ModuleBackNav } from "@repo/shared/components/module-back-nav/ModuleBackNav";

import { PokemonList } from "./pokemon-list/sessions/PokemonList/PokemonList";

export default function PokemonPage() {
  return (
    <>
      <ModuleBackNav />
      <PokemonList />
    </>
  );
}
