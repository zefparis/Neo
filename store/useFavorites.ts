import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CityData } from '../lib/capitals';

interface FavoritesState {
  favorites: CityData[];
  addFavorite: (city: CityData) => void;
  removeFavorite: (capital: string) => void;
  isFavorite: (capital: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (city) => {
        const { favorites } = get();
        if (!favorites.some((f) => f.capital === city.capital)) {
          set({ favorites: [...favorites, city] });
        }
      },
      removeFavorite: (capital) => {
        set({ favorites: get().favorites.filter((f) => f.capital !== capital) });
      },
      isFavorite: (capital) => {
        return get().favorites.some((f) => f.capital === capital);
      },
    }),
    {
      name: 'world-time-favorites',
    }
  )
);
