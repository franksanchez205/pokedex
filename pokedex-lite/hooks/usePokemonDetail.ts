import { useEffect, useState } from "react";
import { PokemonDetail } from "../types/pokemon";

const POKEMON_DETAIL_URL = "https://pokeapi.co/api/v2/pokemon/";

export const usePokemonDetail = (name: string) => {
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPokemonDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${POKEMON_DETAIL_URL}${name}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el Pokémon solicitado");
        }
        const data = (await response.json()) as PokemonDetail;
        if (!cancelled) {
          setPokemonDetail(data);
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

    loadPokemonDetail();

    return () => {
      cancelled = true;
    };
  }, [name]);

  return { pokemonDetail, loading, error };
};