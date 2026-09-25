import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { CustomPokemon, CustomPokemonStat } from "../types/pokemon";

interface PokemonFormProps {
  initial?: CustomPokemon;
  existingNames?: string[];
  submitLabel: string;
  onSubmit: (pokemon: CustomPokemon) => void;
}

const STAT_FIELDS: { key: string; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Ataque" },
  { key: "defense", label: "Defensa" },
  { key: "speed", label: "Velocidad" },
];

const DEFAULT_SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

const NOMBRE_REGEX = /^[a-zA-Z0-9 -]+$/;

const statValue = (initial: CustomPokemon | undefined, key: string): string => {
  const stat = initial?.stats.find((item) => item.name === key);
  return stat ? String(stat.value) : "";
};

export const PokemonForm = ({ initial, existingNames, submitLabel, onSubmit }: PokemonFormProps) => {
  const { types: tiposOficiales, loading: tiposLoading } = usePokemonTypes();

  const [name, setName] = useState(initial?.name ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [height, setHeight] = useState(initial ? String(initial.height) : "");
  const [weight, setWeight] = useState(initial ? String(initial.weight) : "");
  const [types, setTypes] = useState(initial?.types.join(", ") ?? "");
  const [hp, setHp] = useState(statValue(initial, "hp"));
  const [attack, setAttack] = useState(statValue(initial, "attack"));
  const [defense, setDefense] = useState(statValue(initial, "defense"));
  const [speed, setSpeed] = useState(statValue(initial, "speed"));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validar = (): { ok: boolean; pokemon: CustomPokemon } => {
    const errores: Record<string, string> = {};

    const nombre = name.trim();
    if (!nombre) {
      errores.name = "El nombre es obligatorio";
    } else if (!NOMBRE_REGEX.test(nombre)) {
      errores.name = "Solo letras, números, espacios y guiones";
    }

    const altura = Number(height);
    if (!height.trim()) {
      errores.height = "La altura es obligatoria";
    } else if (!Number.isFinite(altura) || altura <= 0) {
      errores.height = "Debe ser un número mayor que 0";
    }

    const peso = Number(weight);
    if (!weight.trim()) {
      errores.weight = "El peso es obligatorio";
    } else if (!Number.isFinite(peso) || peso <= 0) {
      errores.weight = "Debe ser un número mayor que 0";
    }

    const statsEntradas = [hp, attack, defense, speed];
    const statsNumeros = statsEntradas.map((valor) => (valor.trim() === "" ? Number.NaN : Number(valor)));
    const hayStats = statsEntradas.some((valor) => valor.trim() !== "");
    const statsValidas = statsNumeros.every(
      (valor) => Number.isNaN(valor) || (Number.isInteger(valor) && valor >= 1 && valor <= 255)
    );
    if (!statsValidas) {
      errores.stats = "Las estadísticas deben ser números enteros entre 1 y 255";
    } else if (!hayStats) {
      errores.stats = "Ingresa al menos una estadística";
    }

    const tiposArr = types
      .split(",")
      .map((tipo) => tipo.trim().toLowerCase())
      .filter(Boolean);
    if (tiposArr.length === 0) {
      errores.types = "Ingresa al menos un tipo";
    } else if (!tiposLoading && tiposArr.some((tipo) => !tiposOficiales.includes(tipo))) {
      errores.types = `Tipo(s) no válido(s). Válidos: ${tiposOficiales.join(", ")}`;
    }

    const imagen = imageUrl.trim();
    if (imagen && !/^https?:\/\/\S+$/.test(imagen)) {
      errores.imageUrl = "Debe ser una URL http(s) válida";
    }

    setFieldErrors(errores);

    const stats: CustomPokemonStat[] = STAT_FIELDS.map((field, index) => ({
      name: field.key,
      value: statsNumeros[index],
    })).filter((stat) => Number.isFinite(stat.value) && stat.value > 0);

    return {
      ok: Object.keys(errores).length === 0,
      pokemon: {
        name: nombre,
        height: altura,
        weight: peso,
        imageUrl: imagen || `${DEFAULT_SPRITE_URL}${nombre.toLowerCase()}.png`,
        types: tiposArr,
        stats,
      },
    };
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    const { ok, pokemon } = validar();
    if (!ok) {
      return;
    }
    if (tiposLoading) {
      setError("Cargando los tipos válidos de la Pokédex. Intenta de nuevo");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!initial) {
      const existeLocal = (existingNames ?? []).some(
        (item) => item.toLowerCase() === pokemon.name.toLowerCase()
      );
      if (existeLocal) {
        setError("Ya existe un Pokémon creado con ese nombre");
        setSubmitting(false);
        return;
      }

      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemon.name.toLowerCase())}`
        );
        if (response.ok) {
          setError("Ese nombre ya existe en la Pokédex oficial");
          setSubmitting(false);
          return;
        }
        if (response.status !== 404) {
          setError("No se pudo verificar el nombre contra la Pokédex. Intenta de nuevo");
          setSubmitting(false);
          return;
        }
      } catch {
        setError("Error de red al verificar el nombre. Intenta de nuevo");
        setSubmitting(false);
        return;
      }
    }

    onSubmit({
      ...pokemon,
      name: initial?.name ?? pokemon.name,
    });
    setSubmitting(false);
  };

  const statInput = (key: string) => {
    switch (key) {
      case "hp":
        return { value: hp, onChange: setHp };
      case "attack":
        return { value: attack, onChange: setAttack };
      case "defense":
        return { value: defense, onChange: setDefense };
      default:
        return { value: speed, onChange: setSpeed };
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej. pikachu"
            autoCapitalize="none"
            editable={!initial}
            style={[styles.input, initial && styles.inputDeshabilitado]}
          />
          {fieldErrors.name ? <Text style={styles.error}>{fieldErrors.name}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>URL de la imagen</Text>
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
          />
          {fieldErrors.imageUrl ? <Text style={styles.error}>{fieldErrors.imageUrl}</Text> : null}
        </View>

        <View style={styles.fila}>
          <View style={[styles.campo, styles.campoMitad]}>
            <Text style={styles.etiqueta}>Altura (m)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="0"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            {fieldErrors.height ? <Text style={styles.error}>{fieldErrors.height}</Text> : null}
          </View>
          <View style={[styles.campo, styles.campoMitad]}>
            <Text style={styles.etiqueta}>Peso (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            {fieldErrors.weight ? <Text style={styles.error}>{fieldErrors.weight}</Text> : null}
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Tipos (separados por coma)</Text>
          <TextInput
            value={types}
            onChangeText={setTypes}
            placeholder={`Ej. ${tiposOficiales.slice(0, 4).join(", ")}`}
            autoCapitalize="none"
            style={styles.input}
          />
          {fieldErrors.types ? <Text style={styles.error}>{fieldErrors.types}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Estadísticas base (1-255)</Text>
          {STAT_FIELDS.map((field) => {
            const { value, onChange } = statInput(field.key);

            return (
              <View key={field.key} style={styles.campoStat}>
                <Text style={styles.etiquetaStat}>{field.label}</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="0"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            );
          })}
          {fieldErrors.stats ? <Text style={styles.error}>{fieldErrors.stats}</Text> : null}
        </View>

        {error ? <Text style={styles.errorGeneral}>{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.boton,
            (pressed || submitting) && styles.botonPulsado,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonTexto}>{submitLabel}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: 24,
    gap: 16,
    backgroundColor: "#030e18ff",
  },
  fila: {
    flexDirection: "row",
    gap: 16,
  },
  campo: {
    gap: 8,
  },
  campoMitad: {
    flex: 1,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#0f0f0fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  inputDeshabilitado: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  campoStat: {
    gap: 4,
  },
  etiquetaStat: {
    fontSize: 13,
    color: "#6B7280",
  },
  error: {
    fontSize: 12,
    color: "#B91C1C",
  },
  errorGeneral: {
    fontSize: 14,
    color: "#B91C1C",
    textAlign: "center",
  },
  boton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  botonPulsado: {
    opacity: 0.8,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});