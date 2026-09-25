import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFavorites } from "../../hooks/useFavoritesContext";
import { usePokemonCRUD } from "../../hooks/usePokemonCRUD";
import { usePokemonDetail } from "../../hooks/usePokemonDetail";

const PokemonDetailScreen = () => {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = typeof name === "string" ? name : "";
  const { getByName, deletePokemon } = usePokemonCRUD();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const { pokemonDetail, loading, error } = usePokemonDetail(pokemonName);
  const custom = getByName(pokemonName);
  const esFavorito = isFavorite(pokemonName);

  const alternarFavorito = () => {
    if (custom) {
      toggleFavorite({
        name: custom.name,
        url: "",
        imageUrl: custom.imageUrl,
        isCustom: true,
        types: custom.types,
      });
      return;
    }
    toggleFavorite({
      name: pokemonDetail?.name ?? pokemonName,
      url: pokemonDetail?.sprites?.front_default ?? "",
      imageUrl: pokemonDetail?.sprites?.front_default ?? undefined,
      types: pokemonDetail?.types.map((tipo) => tipo.type.name),
    });
  };

  const renderFavorito = () => {
    return (
      <Pressable
        onPress={alternarFavorito}
        style={({ pressed }) => [
          styles.botonFavorito,
          esFavorito && styles.botonFavoritoActivo,
          pressed && styles.botonPulsado,
        ]}
      >
        <Text style={[styles.botonFavoritoTexto, esFavorito && styles.botonFavoritoTextoActivo]}>
          {esFavorito ? "★" : "☆"}
        </Text>
      </Pressable>
    );
  };

  const confirmarEliminar = () => {
    Alert.alert("Eliminar Pokémon", `¿Eliminar a ${pokemonName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deletePokemon(pokemonName);
          removeFavorite(pokemonName);
          router.back();
        },
      },
    ]);
  };

  if (custom) {
    return (
      <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.botonVolver, pressed && styles.botonPulsado]}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </Pressable>
        <Text style={styles.nombre}>{custom.name}</Text>
        <View style={styles.insignia}>
          <Text style={styles.insigniaTexto}>Personalizado</Text>
        </View>
        {renderFavorito()}
        <Image source={{ uri: custom.imageUrl }} style={styles.imagen} />

        <View style={styles.tipos}>
          {custom.types.map((tipo) => (
            <View key={tipo} style={styles.tipo}>
              <Text style={styles.tipoTexto}>{tipo}</Text>
            </View>
          ))}
        </View>

        <View style={styles.medidas}>
          <View style={styles.medida}>
            <Text style={styles.medidaValor}>{custom.height.toFixed(1)} m</Text>
            <Text style={styles.medidaEtiqueta}>Altura</Text>
          </View>
          <View style={styles.medida}>
            <Text style={styles.medidaValor}>{custom.weight.toFixed(1)} kg</Text>
            <Text style={styles.medidaEtiqueta}>Peso</Text>
          </View>
        </View>

        <View style={styles.stats}>
          {custom.stats.map((stat) => (
            <View key={stat.name} style={styles.stat}>
              <Text style={styles.statNombre} numberOfLines={1}>
                {stat.name}
              </Text>
              <View style={styles.statBarraFondo}>
                <View style={[styles.statBarra, { width: `${Math.min(100, (stat.value / 255) * 100)}%` }]} />
              </View>
              <Text style={styles.statValor}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <Link href={`/pokemon/editar?name=${encodeURIComponent(custom.name)}`} asChild>
          <Pressable style={({ pressed }) => [styles.boton, pressed && styles.botonPulsado]}>
            <Text style={styles.botonTexto}>Editar</Text>
          </Pressable>
        </Link>

        <Pressable
          onPress={confirmarEliminar}
          style={({ pressed }) => [styles.botonEliminar, pressed && styles.botonPulsado]}
        >
          <Text style={styles.botonEliminarTexto}>Eliminar</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text style={styles.mensaje}>Cargando el Pokémon…</Text>
      </View>
    );
  }

  if (error || !pokemonDetail) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error ?? "Pokémon no encontrado"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.botonVolver, pressed && styles.botonPulsado]}>
        <Text style={styles.botonVolverTexto}>← Volver</Text>
      </Pressable>
      <Text style={styles.nombre}>{pokemonDetail.name}</Text>
      {renderFavorito()}

      {pokemonDetail.sprites?.front_default ? (
        <Image source={{ uri: pokemonDetail.sprites.front_default }} style={styles.imagen} />
      ) : null}

      <View style={styles.tipos}>
        {pokemonDetail.types.map((tipo) => (
          <View key={tipo.slot} style={styles.tipo}>
            <Text style={styles.tipoTexto}>{tipo.type.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.medidas}>
        <View style={styles.medida}>
          <Text style={styles.medidaValor}>{(pokemonDetail.height / 10).toFixed(1)} m</Text>
          <Text style={styles.medidaEtiqueta}>Altura</Text>
        </View>
        <View style={styles.medida}>
          <Text style={styles.medidaValor}>{(pokemonDetail.weight / 10).toFixed(1)} kg</Text>
          <Text style={styles.medidaEtiqueta}>Peso</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {pokemonDetail.stats.map((stat) => (
          <View key={stat.stat.name} style={styles.stat}>
            <Text style={styles.statNombre} numberOfLines={1}>
              {stat.stat.name}
            </Text>
            <View style={styles.statBarraFondo}>
              <View style={[styles.statBarra, { width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }]} />
            </View>
            <Text style={styles.statValor}>{stat.base_stat}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contenido: {
    alignItems: "center",
    padding: 24,
    gap: 16,
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
  nombre: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  botonVolver: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  botonVolverTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  imagen: {
    width: 160,
    height: 160,
  },
  tipos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  tipo: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  tipoTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  insignia: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  insigniaTexto: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },
  botonFavorito: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  botonFavoritoActivo: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  botonFavoritoTexto: {
    fontSize: 22,
    color: "#9CA3AF",
  },
  botonFavoritoTextoActivo: {
    color: "#D97706",
  },
  medidas: {
    flexDirection: "row",
    gap: 16,
  },
  medida: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 4,
  },
  medidaValor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  medidaEtiqueta: {
    fontSize: 13,
    color: "#6B7280",
  },
  stats: {
    width: "100%",
    gap: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statNombre: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    textTransform: "capitalize",
  },
  statBarraFondo: {
    flex: 2,
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
  },
  statBarra: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },
  statValor: {
    width: 40,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  boton: {
    alignSelf: "stretch",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonEliminar: {
    alignSelf: "stretch",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonPulsado: {
    opacity: 0.8,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  botonEliminarTexto: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PokemonDetailScreen;