import { Link, useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useFavorites } from "../hooks/useFavoritesContext";
import { usePokemonCRUD } from "../hooks/usePokemonCRUD";
import { usePokemonList } from "../hooks/usePokemonList";
import { PokemonListItem } from "../types/pokemon";

const getSpriteUrl = (url: string): string => {
  const id = url.split("/").filter(Boolean).pop();
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
};

const getImageUrl = (item: PokemonListItem): string => {
  return item.imageUrl ?? getSpriteUrl(item.url);
};

const HomeScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columnas = width > 600 ? 3 : width > 380 ? 2 : 1;
  const { pokemonList, loading, error } = usePokemonList();
  const { customPokemons, deletePokemon } = usePokemonCRUD();
  const { removeFavorite } = useFavorites();

  const items: PokemonListItem[] = [
    ...customPokemons
      .slice()
      .reverse()
      .map((custom) => ({
        name: custom.name,
        url: "",
        imageUrl: custom.imageUrl,
        isCustom: true,
      })),
    ...(pokemonList?.results ?? []),
  ];

  const confirmarEliminar = (nombre: string) => {
    Alert.alert("Eliminar Pokémon", `¿Eliminar a ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deletePokemon(nombre);
          removeFavorite(nombre);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: PokemonListItem }) => {
    return (
      <Link href={`/pokemon/${encodeURIComponent(item.name)}`} asChild>
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPulsado]}>
          <Image source={{ uri: getImageUrl(item) }} style={styles.imagen} />
          <Text style={styles.nombre} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isCustom ? (
            <>
              <View style={styles.insignia}>
                <Text style={styles.insigniaTexto}>Personalizado</Text>
              </View>
              <View style={styles.acciones}>
                <Pressable
                  onPress={() => router.push(`/pokemon/editar?name=${encodeURIComponent(item.name)}`)}
                  style={({ pressed }) => [styles.botonAccion, pressed && styles.botonPulsado]}
                >
                  <Text style={styles.botonAccionTexto}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmarEliminar(item.name)}
                  style={({ pressed }) => [styles.botonEliminar, pressed && styles.botonPulsado]}
                >
                  <Text style={styles.botonEliminarTexto}>Eliminar</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={styles.contenedor}>
      {loading ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" />
          <Text style={styles.mensaje}>Cargando Pokémon…</Text>
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          key={columnas}
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => (item.isCustom ? `custom-${item.name}` : item.url)}
          numColumns={columnas}
          contentContainerStyle={styles.lista}
          columnWrapperStyle={columnas > 1 ? styles.fila : undefined}
          style={styles.listaScroll}
          ListHeaderComponent={
            <View style={styles.barraAcciones}>
              <Link href="/pokemon/nuevo" asChild>
                <Pressable style={({ pressed }) => [styles.boton, styles.botonAgregar, pressed && styles.botonPulsado]}>
                  <View style={styles.botonIcono}>
                    <Text style={styles.botonIconoTexto}>＋</Text>
                  </View>
                  <Text style={styles.botonTexto}>Agregar Pokémon</Text>
                </Pressable>
              </Link>
              <Link href="/favoritos" asChild>
                <Pressable style={({ pressed }) => [styles.boton, styles.botonFavoritos, pressed && styles.botonPulsado]}>
                  <View style={styles.botonIcono}>
                    <Text style={styles.botonIconoTexto}>★</Text>
                  </View>
                  <Text style={styles.botonTexto}>Favoritos</Text>
                </Pressable>
              </Link>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
  },
  mensaje: {
    fontSize: 16,
    color: "#374151",
  },
  error: {
    fontSize: 16,
    color: "#B91C1C",
    textAlign: "center",
  },
  listaScroll: {
    flex: 1,
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
  },
  lista: {
    padding: 16,
    gap: 16,
  },
  fila: {
    gap: 16,
  },
  barraAcciones: {
    flexDirection: "row",
    gap: 12,
  },
  boton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
    paddingVertical: 14,
  },
  botonAgregar: {
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  botonFavoritos: {
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  botonIcono: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  botonIconoTexto: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 19,
  },
  botonTexto: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    flex: 2,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 8,
  },
  cardPulsado: {
    opacity: 0.7,
  },
  insignia: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  insigniaTexto: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "600",
  },
  acciones: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 8,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  botonPulsado: {
    opacity: 0.8,
  },
  botonAccionTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  botonEliminarTexto: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
  },
  imagen: {
    width: 80,
    height: 80,
  },
  nombre: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
});

export default HomeScreen;