import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import { PokemonListItem } from "../types/pokemon";

const STORAGE_KEY = "@pokedex_favorites";

interface FavoritesContextValue {
  favorites: PokemonListItem[];
  loading: boolean;
  isFavorite: (name: string) => boolean;
  toggleFavorite: (pokemon: PokemonListItem) => void;
  removeFavorite: (name: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  loading: true,
  isFavorite: () => false,
  toggleFavorite: () => {},
  removeFavorite: () => {},
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          setFavorites(JSON.parse(raw) as PokemonListItem[]);
        }
      } catch {
        // dato corrupto: se ignora y se arranca vacío
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, loading]);

  const isFavorite = (name: string): boolean => {
    return favorites.some((pokemon) => pokemon.name === name);
  };

  const toggleFavorite = (pokemon: PokemonListItem): void => {
    setFavorites((actuales) =>
      actuales.some((item) => item.name === pokemon.name)
        ? actuales.filter((item) => item.name !== pokemon.name)
        : [...actuales, pokemon]
    );
  };

  const removeFavorite = (name: string): void => {
    setFavorites((actuales) => actuales.filter((item) => item.name !== name));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  return useContext(FavoritesContext);
};