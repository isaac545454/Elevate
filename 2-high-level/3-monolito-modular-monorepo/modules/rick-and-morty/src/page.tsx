import { ModuleBackNav } from "@repo/shared/components/module-back-nav/ModuleBackNav";

import { CharacterList } from "./character-list/sessions/CharacterList/CharacterList";

export default function RickAndMortyPage() {
  return (
    <>
      <ModuleBackNav />
      <CharacterList />
    </>
  );
}
