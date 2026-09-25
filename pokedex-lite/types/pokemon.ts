export interface PokemonListItem {
  name: string;
  url: string;
  imageUrl?: string;
  isCustom?: boolean;
  types?: string[];
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
  };
  types: PokemonType[];
  stats: PokemonStat[];
}

export interface CustomPokemonStat {
  name: string;
  value: number;
}

export interface CustomPokemon {
  name: string;
  height: number;
  weight: number;
  imageUrl: string;
  types: string[];
  stats: CustomPokemonStat[];
}

export interface PokemonTypeListItem {
  name: string;
  url: string;
}

export interface PokemonTypeListResponse {
  results: PokemonTypeListItem[];
}