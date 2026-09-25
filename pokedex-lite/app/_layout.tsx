import { Stack } from "expo-router";
import { FavoritesProvider } from "../hooks/useFavoritesContext";
import { PokemonCRUDProvider } from "../hooks/usePokemonCRUD";

const RootLayout = () => {
  return (
    <PokemonCRUDProvider>
      <FavoritesProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Pokedex Lite",
            }}
          />
          <Stack.Screen name="favoritos" options={{ title: "Favoritos" }} />
          <Stack.Screen name="pokemon/[name]" options={{ title: "Detalle" }} />
          <Stack.Screen name="pokemon/nuevo" options={{ title: "Nuevo Pokémon" }} />
          <Stack.Screen name="pokemon/editar" options={{ title: "Editar Pokémon" }} />
        </Stack>
      </FavoritesProvider>
    </PokemonCRUDProvider>
  );
};

export default RootLayout;