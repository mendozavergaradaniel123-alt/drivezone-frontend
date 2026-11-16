"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useCart } from "../../context/CartContext";

interface Manufacturer { name: string; }
interface Producto {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  price: number;
  images?: string[];
  category?: string;
  stock: number;
  rating?: number;
}

function ContenidoCategoria() {
  const params = useParams();
  const router = useRouter();
  const categoriaNombre = typeof params?.categoria === "string" ? params?.categoria : "Productos";
  const { addToCart, totalItems } = useCart();
  
  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState(8000000);
  const [calificacion, setCalificacion] = useState<number[]>([]);
  // Estado temporal para cambiar de categoría en el modal
  const [categoriaSeleccionadaModal, setCategoriaSeleccionadaModal] = useState(categoriaNombre);

  const categoriasDisponibles = ["Aceites", "Llantas", "Baterias", "Rines"];

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`);
        const result = await res.json();
        if (result.status === 200 && Array.isArray(result.data)) {
          setListaProductos(result.data);
          const marcasUnicas = Array.from(new Set(result.data.map((p: Producto) => p.manufacturer?.name).filter(Boolean))) as string[];
          setMarcas(marcasUnicas);
        } else {
            setListaProductos([]);
            setMarcas([]);
        }
      } catch (error) {
        console.error("Error al conectar con NestJS:", error);
        setListaProductos([]);
      } finally {
        setLoading(false);
      }
    }
    if (categoriaNombre) fetchInventory();
  }, [categoriaNombre]);

  // Filtrado local
  const productosFiltrados = listaProductos.filter(prod => {
    const pasaMarca = marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(prod.manufacturer?.name);
    const pasaPrecio = prod.price <= precioMax;
    const pasaCalificacion = calificacion.length === 0 || calificacion.includes(Math.floor(prod.rating || 5));
    return pasaMarca && pasaPrecio && pasaCalificacion;
  });

  const toggleMarca = (marca: string) => {
    setMarcasSeleccionadas(prev => 
       prev.includes(marca) ? prev.filter(m => m !== marca) : [...prev, marca]
    );
  };

  const toggleCalificacion = (estrellas: number) => {
    setCalificacion(prev => 
       prev.includes(estrellas) ? prev.filter(e => e !== estrellas) : [...prev, estrellas]
    );
  };

  const limpiarFiltros = () => {
    setMarcasSeleccionadas([]);
    setPrecioMax(8000000);
    setCalificacion([]);
  };

  const aplicarFiltros = () => {
      setMostrarFiltros(false);
      // Si la categoría cambió en el modal, navegamos a la nueva ruta
      if (categoriaSeleccionadaModal.toLowerCase() !== categoriaNombre.toLowerCase()) {
          router.push(`/${categoriaSeleccionadaModal.toLowerCase()}`);
      }
  };

  const categoriaKey = categoriaNombre.charAt(0).toUpperCase() + categoriaNombre.slice(1).toLowerCase();

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto overflow-x-hidden">
        
        <header className="flex justify-between items-center p-6">
          <Link href="/home">
            <Image src="/logo.png" alt="DriveZone Logo" width={120} height={35} className="object-contain" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/perfil" className="text-red-600 text-2xl cursor-pointer hover:opacity-80 transition-opacity">👤</Link>
            <Link href="/carrito" className="text-red-600 text-2xl relative cursor-pointer hover:opacity-80 transition-opacity">
              🛒{totalItems > 0 && <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>}
            </Link>
          </div>
        </header>

        <div className="px-6 mb-4 flex justify-between items-center">
          <div className="bg-white rounded-xl flex items-center p-3.5 text-black font-bold shadow-md">
            <span className="mr-3 text-lg">🔍</span><span className="text-base">{categoriaKey}</span>
          </div>
          <button onClick={() => setMostrarFiltros(true)} className="bg-white text-black font-extrabold px-6 py-3 rounded-xl text-sm shadow-md hover:bg-gray-100 transition-colors">
            Filtros
          </button>
        </div>

        <div className="px-6 mb-4">
          <p className="text-sm text-gray-300 font-semibold">{productosFiltrados.length} resultados</p>
        </div>

        <div className="px-6 flex flex-col gap-4 mb-8">
          {loading ? (
            <p className="text-center text-gray-500 py-12">Consultando inventario en NestJS...</p>
          ) : productosFiltrados.length > 0 ? (
            productosFiltrados.map((prod) => (
              <Link href={`/producto/${prod.id}`} key={prod.id} className="bg-white text-black rounded-2xl p-4 flex items-center justify-between shadow-xl cursor-pointer">
                <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden p-1">
                  <Image src={prod.images?.[0] || "/rin.png"} alt={prod.name} fill className="object-contain" />
                </div>
                <div className="flex-1 px-3">
                  <h4 className="font-extrabold text-xs leading-tight mb-1 text-gray-900">{prod.name}</h4>
                  <p className="font-black text-sm mb-1 text-black">${prod.price?.toLocaleString()} COP</p>
                  <span className="text-xs font-bold text-green-600">{prod.stock > 0 ? "Disponible" : "Agotado"}</span>
                </div>
                <div role="button" onClick={(e) => { e.preventDefault(); if (prod.stock > 0) addToCart(prod); }} className={`p-3.5 rounded-xl shadow-lg flex-shrink-0 ${prod.stock > 0 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                  🛒
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No hay productos que coincidan con tus filtros.</p>
          )}
        </div>

        {/* MODAL DE FILTROS */}
        {mostrarFiltros && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col text-white font-sans animate-fade-in overflow-y-auto pb-24">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button onClick={limpiarFiltros} className="text-gray-400 text-sm hover:text-white">Limpiar</button>
            </div>

            {/* Selector de Categoría */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <span className="font-bold">Categoría</span>
              <select 
                value={categoriaSeleccionadaModal.toLowerCase()} 
                onChange={(e) => setCategoriaSeleccionadaModal(e.target.value)}
                className="bg-transparent text-red-600 font-semibold outline-none text-right cursor-pointer"
              >
                {categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat.toLowerCase()} className="text-black bg-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Marca */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="font-bold mb-4">Marca</h3>
              <div className="flex flex-col gap-4">
                {marcas.map(marca => (
                  <div key={marca} className="flex items-center gap-4 cursor-pointer" onClick={() => toggleMarca(marca)}>
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center border ${marcasSeleccionadas.includes(marca) ? 'bg-red-600 border-red-600' : 'border-gray-500 bg-transparent'}`}>
                      {marcasSeleccionadas.includes(marca) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm font-semibold">{marca}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro Precio */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Precio</h3>
                <span className="text-red-600 font-semibold text-sm">$30.000 - ${precioMax.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="30000" 
                max="8000000" 
                step="50000"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

             {/* Filtro Calificación */}
             <div className="p-6">
              <h3 className="font-bold mb-4">Calificación</h3>
              <div className="flex flex-col gap-4">
                {[5, 4, 3, 2].map(estrellas => (
                  <div key={estrellas} className="flex items-center gap-4 cursor-pointer" onClick={() => toggleCalificacion(estrellas)}>
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center border ${calificacion.includes(estrellas) ? 'bg-red-600 border-red-600' : 'border-gray-500 bg-transparent'}`}>
                       {calificacion.includes(estrellas) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm font-semibold">{estrellas} Estrellas {estrellas === 5 ? "" : "o más"}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={aplicarFiltros}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-8 shadow-lg transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CategoriaDetalle() {
  return <Suspense fallback={<div>Cargando...</div>}><ContenidoCategoria /></Suspense>;
}