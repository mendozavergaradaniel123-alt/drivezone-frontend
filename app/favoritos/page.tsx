"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFavorites } from "../../context/FavoritesContext";

export default function FavoritosPage() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        <header className="flex items-center justify-center p-6 border-b border-gray-800 relative">
          <button onClick={() => router.back()} className="absolute left-6 text-xl text-white hover:text-red-500">
            ←
          </button>
          <h1 className="text-lg font-bold">Mis favoritos</h1>
        </header>

        <div className="p-4 flex flex-col gap-4">
          {favorites.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No tienes productos en favoritos.</p>
          ) : (
            favorites.map((prod) => (
              <div key={prod.id} className="bg-white text-black rounded-xl p-3 flex items-center justify-between shadow-md relative">
                
                <Link href={`/producto/${prod.id}`} className="w-20 h-20 relative flex-shrink-0 p-1 cursor-pointer">
                  <Image src={prod.images?.[0] || "/rin.png"} alt={prod.name} fill className="object-contain" />
                </Link>
                
                <div className="flex-1 px-3">
                  <Link href={`/producto/${prod.id}`}>
                    <h4 className="font-extrabold text-xs leading-tight mb-1 hover:text-red-600">{prod.name}</h4>
                  </Link>
                  <p className="font-black text-sm mb-1">${prod.price?.toLocaleString()} COP</p>
                  <span className="text-[10px] font-bold text-green-600">Disponible</span>
                </div>

                <button 
                  onClick={() => toggleFavorite(prod)}
                  className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center absolute bottom-3 right-3 shadow"
                  title="Eliminar de favoritos"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Barra de Navegación Inferior */}
        <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-gray-800 flex justify-around p-4 z-50">
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-1">Inicio</span>
          </Link>
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors">
            <span className="text-xl">🗂️</span>
            <span className="text-[10px] mt-1">Categorías</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center text-red-600">
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-1">Cuenta</span>
          </Link>
        </nav>

      </main>
    </div>
  );
}