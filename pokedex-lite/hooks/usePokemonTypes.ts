import { useEffect, useState } from "react";
import { PokemonTypeListResponse } from "../types/pokemon";

const POKEMON_TYPES_URL = "https://pokeapi.co/api/v2/type";

export const usePokemonTypes = () => {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTypes = async () => {
      try {
        const response = await fetch(POKEMON_TYPES_URL);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los tipos");
        }
        const data = (await response.json()) as PokemonTypeListResponse;
        if (!cancelled) {
          setTypes(data.results.map((tipo) => tipo.name));
        }
      } catch (err) {
        if (!cancelled && err instanceof Error) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  return { types, loading, error };
};