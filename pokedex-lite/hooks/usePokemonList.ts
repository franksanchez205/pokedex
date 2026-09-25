import { useEffect, useState } from "react";
import { PokemonListResponse } from "../types/pokemon";

const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

export const usePokemonList = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPokemonList = async () => {
      setLoading(true);
      try {
        const response = await fetch(POKEMON_LIST_URL);
        if (!response.ok) {
          throw new Error("Error al cargar la lista de Pokémon");
        }
        const data = (await response.json()) as PokemonListResponse;
        if (!cancelled) {
          setPokemonList(data);
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

    loadPokemonList();

    return () => {
      cancelled = true;
    };
  }, []);

  return { pokemonList, loading, error };
};