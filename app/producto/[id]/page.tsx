"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useCart } from "../../../context/CartContext";
import { useFavorites } from "../../../context/FavoritesContext"; // 1. Importamos el contexto de favoritos

interface Manufacturer {
  name: string;
}

interface Producto {
  id: string;
  name: string;
  description?: string;
  manufacturer: Manufacturer;
  price: number;
  images?: string[];
  category?: string;
  stock: number;
  rating?: number;
}

function ContenidoProducto() {
  const params = useParams();
  const router = useRouter();
  const productoId = params?.id as string;
  
  const { addToCart, totalItems } = useCart();
  
  // 2. Extraemos las funciones de favoritos
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducto() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/inventory...`);
        const result = await res.json();
        
        if (result.status === 200) {
          setProducto(result.data);
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      } finally {
        setLoading(false);
      }
    }

    if (productoId) {
      fetchProducto();
    }
  }, [productoId]);

  const handleAddToCart = () => {
    if (producto && producto.stock > 0) {
      addToCart(producto);
    }
  };

  // 3. Verificamos si este producto en específico ya es favorito
  const favoritoActivo = producto ? isFavorite(producto.id) : false;

  if (loading) {
    return (
      <div className="bg-neutral-900 min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="bg-neutral-900 min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p>Producto no encontrado.</p>
        <button onClick={() => router.back()} className="text-red-600 font-bold">Volver atrás</button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera transparente flotante con Carrito y Favoritos */}
        <header className="absolute top-0 w-full flex justify-between items-center p-6 z-50">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl hover:bg-red-600 transition-colors"
          >
            ←
          </button>
          
          <div className="flex gap-3">
            {/* 4. Botón de favoritos interactivo en la cabecera */}
            <button 
              onClick={() => toggleFavorite(producto)}
              className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center text-xl transition-colors ${
                favoritoActivo ? 'bg-red-600 text-white' : 'bg-black/50 text-white hover:bg-red-600'
              }`}
              title={favoritoActivo ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              {favoritoActivo ? '❤️' : '🤍'}
            </button>

            <Link href="/carrito" className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl hover:bg-red-600 transition-colors relative">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Imagen del Producto */}
        <div className="w-full h-80 bg-white relative rounded-b-3xl shadow-lg pt-12 p-6 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image 
              src={producto.images?.[0] || "/rin.png"} 
              alt={producto.name} 
              fill 
              className="object-contain drop-shadow-xl" 
            />
          </div>
        </div>

        {/* Detalles e Información */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-red-600 text-xs font-bold uppercase tracking-wider">
                {producto.category} • {producto.manufacturer.name}
              </span>
              <h1 className="text-2xl font-black mt-1 leading-tight">{producto.name}</h1>
            </div>
          </div>

          {/* Precio y Rating */}
          <div className="flex justify-between items-end mt-4 mb-6 pb-6 border-b border-neutral-800">
            <div>
              <p className="text-3xl font-black">${producto.price.toLocaleString()} COP</p>
              <p className={`text-sm font-bold mt-1 ${producto.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {producto.stock > 0 ? `✓ En stock (${producto.stock} disponibles)` : '✗ Agotado'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-bold text-sm">{producto.rating || "4.5"}</span>
            </div>
          </div>

          {/* Descripción Técnica */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Descripción del producto</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {producto.description || "Este es un repuesto automotriz de alta calidad garantizado para brindar el mejor rendimiento en tu vehículo. Fabricado bajo los más estrictos estándares de seguridad."}
            </p>
          </div>
        </div>

        {/* Barra Inferior de Compra Fija */}
        <div className="fixed bottom-0 w-full max-w-md bg-neutral-950 border-t border-gray-800 p-4 z-50 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/soporte?producto=${encodeURIComponent(producto.name)}`)}
            title="Consultar sobre este producto"
            className="bg-neutral-800 hover:bg-neutral-700 text-white p-3.5 rounded-xl text-xl flex items-center justify-center transition-colors cursor-pointer"
          >
          💬
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={producto.stock === 0}
            className={`flex-1 font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm ${
              producto.stock > 0 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            🛒 {producto.stock > 0 ? 'Agregar al carrito' : 'Sin inventario'}
          </button>
        </div>

      </main>
    </div>
  );
}

export default function ProductoDetalle() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen text-white flex items-center justify-center">Cargando...</div>}>
      <ContenidoProducto />
    </Suspense>
  );
}