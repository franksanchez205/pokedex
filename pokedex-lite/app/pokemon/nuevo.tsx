import { useRouter } from "expo-router";
import { PokemonForm } from "../../components/PokemonForm";
import { usePokemonCRUD } from "../../hooks/usePokemonCRUD";
import { CustomPokemon } from "../../types/pokemon";

const NuevoPokemonScreen = () => {
  const router = useRouter();
  const { addPokemon, customPokemons } = usePokemonCRUD();

  const handleSubmit = (pokemon: CustomPokemon) => {
    addPokemon(pokemon);
    router.back();
  };

  return (
    <PokemonForm
      existingNames={customPokemons.map((item) => item.name)}
      submitLabel="Guardar Pokémon"
      onSubmit={handleSubmit}
    />
  );
};

export default NuevoPokemonScreen;