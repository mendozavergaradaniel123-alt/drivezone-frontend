"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useCart } from "../../context/CartContext";

interface Producto {
  id: string;
  name: string;
  manufacturer: { name: string };
  price: number;
  images?: string[];
  stock: number;
  category?: string; // Aseguramos que tengamos la categoría para filtrar mejor
}

function ContenidoBusqueda() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      try {
        setLoading(true);
        // Ajusta la URL de tu backend si es necesario
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/inventory...`);
        const result = await res.json();
        
        if (result.status === 200 && Array.isArray(result.data)) {
           // Filtrado en el frontend para mayor precisión (nombre o categoría)
           const queryMinuscula = query.toLowerCase();
           const filtrados = result.data.filter((prod: Producto) => 
              prod.name.toLowerCase().includes(queryMinuscula) || 
              (prod.category && prod.category.toLowerCase().includes(queryMinuscula))
           );
           setResultados(filtrados);
        } else {
           setResultados([]); // Manejo si la API no devuelve la estructura esperada
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }

    if (query) {
       fetchSearch();
    } else {
       setLoading(false);
    }
  }, [query]);

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <button onClick={() => router.back()} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Resultados: "{query}"</h1>
          <Link href="/carrito" className="text-red-600 text-2xl relative">
             🛒
             {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
             )}
          </Link>
        </header>

        <div className="p-6 flex flex-col gap-4">
          {loading ? (
             <p className="text-center text-gray-500 py-12">Buscando...</p> 
          ) : resultados.length > 0 ? (
            resultados.map((prod) => (
              <Link href={`/producto/${prod.id}`} key={prod.id} className="bg-white text-black rounded-2xl p-4 flex items-center justify-between shadow-xl cursor-pointer">
                <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden p-1">
                  <Image src={prod.images?.[0] || "/rin.png"} alt={prod.name} fill className="object-contain" />
                </div>
                <div className="flex-1 px-3">
                  <h4 className="font-extrabold text-xs leading-tight mb-1 text-gray-900">{prod.name}</h4>
                  <p className="font-black text-sm mb-1 text-black">${prod.price?.toLocaleString()} COP</p>
                  {/* Restaurado: Disponibilidad */}
                  <span className="text-xs font-bold text-green-600">
                    {prod.stock > 0 ? "Disponible" : "Agotado"}
                  </span>
                </div>
                {/* Restaurado: Botón Agregar al Carrito */}
                <div 
                  role="button"
                  onClick={(e) => {
                    e.preventDefault(); 
                    if (prod.stock > 0) addToCart(prod);
                  }}
                  className={`p-3.5 rounded-xl flex items-center justify-center transition-colors shadow-lg flex-shrink-0 ${
                    prod.stock > 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🛒
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No se encontraron productos.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BuscarPage() {
  return <Suspense fallback={<div>Cargando...</div>}><ContenidoBusqueda /></Suspense>;
}