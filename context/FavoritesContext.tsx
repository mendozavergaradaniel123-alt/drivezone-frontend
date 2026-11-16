"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FavoritesContextType {
  favorites: any[];
  toggleFavorite: (product: any) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favoritos");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product: any) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        alert("❌ Producto eliminado de favoritos");
        return prev.filter((item) => item.id !== product.id);
      } else {
        alert("❤️ ¡Producto añadido a favoritos con éxito!");
        return [...prev, product];
      }
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites debe usarse dentro de un FavoritesProvider");
  return context;
};