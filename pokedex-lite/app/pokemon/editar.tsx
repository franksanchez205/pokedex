import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PokemonForm } from "../../components/PokemonForm";
import { usePokemonCRUD } from "../../hooks/usePokemonCRUD";
import { CustomPokemon } from "../../types/pokemon";

const EditarPokemonScreen = () => {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = typeof name === "string" ? name : "";
  const { getByName, updatePokemon } = usePokemonCRUD();
  const custom = getByName(pokemonName);

  if (!custom) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>Pokémon no encontrado</Text>
      </View>
    );
  }

  const handleSubmit = (pokemon: CustomPokemon) => {
    updatePokemon(pokemon);
    router.back();
  };

  return <PokemonForm initial={custom} submitLabel="Guardar cambios" onSubmit={handleSubmit} />;
};

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  error: {
    fontSize: 16,
    color: "#B91C1C",
  },
});

export default EditarPokemonScreen;