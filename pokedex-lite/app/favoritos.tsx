import { Link } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFavorites } from "../hooks/useFavoritesContext";
import { PokemonListItem } from "../types/pokemon";

const getSpriteUrl = (name: string): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`;
};

const getImageUrl = (item: PokemonListItem): string => {
  return item.imageUrl ?? getSpriteUrl(item.name);
};

const FavoritosScreen = () => {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text style={styles.vacio}>Cargando favoritos…</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.vacio}>Aún no tienes Pokémon favoritos</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: PokemonListItem }) => {
    return (
      <Link href={`/pokemon/${item.name}`} asChild>
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPulsado]}>
          <Image source={{ uri: getImageUrl(item) }} style={styles.imagen} />
          <Text style={styles.nombre} numberOfLines={1}>
            {item.name}
          </Text>
          {item.types && item.types.length > 0 ? (
            <Text style={styles.descripcion} numberOfLines={1}>
              {item.types.join(", ")}
            </Text>
          ) : null}
        </Pressable>
      </Link>
    );
  };

  return (
    <FlatList
      data={favorites}
      renderItem={renderItem}
      keyExtractor={(item) => item.name}
      numColumns={2}
      contentContainerStyle={styles.lista}
      columnWrapperStyle={styles.fila}
    />
  );
};

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  vacio: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  lista: {
    padding: 16,
    gap: 16,
  },
  fila: {
    gap: 16,
  },
  card: {
    flex: 1,
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
  descripcion: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "capitalize",
  },
});

export default FavoritosScreen;