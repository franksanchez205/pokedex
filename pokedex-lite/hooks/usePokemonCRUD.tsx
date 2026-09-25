import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import { CustomPokemon } from "../types/pokemon";

const STORAGE_KEY = "@pokedex_custom_pokemons";

interface PokemonCRUDContextValue {
  customPokemons: CustomPokemon[];
  loading: boolean;
  addPokemon: (pokemon: CustomPokemon) => void;
  updatePokemon: (pokemon: CustomPokemon) => void;
  deletePokemon: (name: string) => void;
  getByName: (name: string) => CustomPokemon | undefined;
  isCustom: (name: string) => boolean;
}

const PokemonCRUDContext = createContext<PokemonCRUDContextValue>({
  customPokemons: [],
  loading: true,
  addPokemon: () => {},
  updatePokemon: () => {},
  deletePokemon: () => {},
  getByName: () => undefined,
  isCustom: () => false,
});

export const PokemonCRUDProvider = ({ children }: { children: ReactNode }) => {
  const [customPokemons, setCustomPokemons] = useState<CustomPokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCustomPokemons = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          setCustomPokemons(JSON.parse(raw) as CustomPokemon[]);
        }
      } catch {
        // dato corrupto: se ignora y se arranca vacío
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomPokemons();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customPokemons)).catch(() => {});
  }, [customPokemons, loading]);

  const addPokemon = (pokemon: CustomPokemon): void => {
    setCustomPokemons((actuales) =>
      actuales.some((item) => item.name.toLowerCase() === pokemon.name.toLowerCase())
        ? actuales
        : [...actuales, pokemon]
    );
  };

  const updatePokemon = (pokemon: CustomPokemon): void => {
    setCustomPokemons((actuales) =>
      actuales.map((item) =>
        item.name.toLowerCase() === pokemon.name.toLowerCase() ? pokemon : item
      )
    );
  };

  const deletePokemon = (name: string): void => {
    setCustomPokemons((actuales) =>
      actuales.filter((item) => item.name.toLowerCase() !== name.toLowerCase())
    );
  };

  const getByName = (name: string): CustomPokemon | undefined => {
    return customPokemons.find((item) => item.name.toLowerCase() === name.toLowerCase());
  };

  const isCustom = (name: string): boolean => {
    return customPokemons.some((item) => item.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <PokemonCRUDContext.Provider
      value={{ customPokemons, loading, addPokemon, updatePokemon, deletePokemon, getByName, isCustom }}
    >
      {children}
    </PokemonCRUDContext.Provider>
  );
};

export const usePokemonCRUD = (): PokemonCRUDContextValue => {
  return useContext(PokemonCRUDContext);
};