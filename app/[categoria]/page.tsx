"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Producto {
  id: string;
  name: string;
  description: string;
  manufacturer?: {
    name: string;
  };
  price: number;
  category: string;
  stock: number;
  rating: number;
  images: string[];
}

export default function CategoriaPage() {
  const params = useParams();
  const router = useRouter();

  // Extraer categoría de la URL (ej: "aceites", "baterias", "llantas", "rines")
  const categoriaSlug = decodeURIComponent(
    Array.isArray(params?.categoria) ? params.categoria[0] : params?.categoria || ""
  );

  // Función para normalizar textos (sin tildes, minúsculas y sin espacios extra)
  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Capitalizar primera letra para mostrar en pantalla (ej: "aceites" -> "Aceites")
  const categoriaNombre = categoriaSlug
    ? categoriaSlug.charAt(0).toUpperCase() + categoriaSlug.slice(1).toLowerCase()
    : "";

  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<number>(2000000);
  const [busqueda, setBusqueda] = useState<string>("");
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState<boolean>(false);
  const [categoriaSeleccionadaModal, setCategoriaSeleccionadaModal] = useState<string>(categoriaNombre);

  const categoriasDisponibles = ["Aceites", "Llantas", "Baterias", "Rines"];

  useEffect(() => {
    setCategoriaSeleccionadaModal(categoriaNombre);
  }, [categoriaNombre]);

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/inventory`);
        const result = await res.json();

        // Soporta tanto { status: 200, data: [...] } como un array directo [...]
        const rawData: Producto[] = Array.isArray(result)
          ? result
          : result.status === 200 && Array.isArray(result.data)
          ? result.data
          : [];

        // Filtrar EXCLUSIVAMENTE los productos que pertenecen a la categoría de la URL
        const filtradosPorCategoria = rawData.filter(
          (p) => normalizar(p.category || "") === normalizar(categoriaSlug)
        );

        setListaProductos(filtradosPorCategoria);

        const marcasUnicas = Array.from(
          new Set(
            filtradosPorCategoria
              .map((p) => p.manufacturer?.name)
              .filter((name): name is string => Boolean(name))
          )
        );
        setMarcas(marcasUnicas);
      } catch (error) {
        console.error("Error al conectar con NestJS:", error);
        setListaProductos([]);
        setMarcas([]);
      } finally {
        setLoading(false);
      }
    }

    if (categoriaSlug) {
      fetchInventory();
    }
  }, [categoriaSlug]);

  // Aplicar filtros adicionales (marca, búsqueda y precio) sobre los productos de la categoría
  const productosFiltrados = useMemo(() => {
    return listaProductos.filter((prod) => {
      const coincideMarca = marcaSeleccionada
        ? prod.manufacturer?.name?.toLowerCase() === marcaSeleccionada.toLowerCase()
        : true;
      const coincideBusqueda = busqueda
        ? prod.name.toLowerCase().includes(busqueda.toLowerCase()) ||
          prod.description?.toLowerCase().includes(busqueda.toLowerCase())
        : true;
      const coincidePrecio = prod.price <= precioMax;

      return coincideMarca && coincideBusqueda && coincidePrecio;
    });
  }, [listaProductos, marcaSeleccionada, busqueda, precioMax]);

  const aplicarCambioCategoria = () => {
    setModalFiltrosAbierto(false);
    if (normalizar(categoriaSeleccionadaModal) !== normalizar(categoriaSlug)) {
      router.push(`/${normalizar(categoriaSeleccionadaModal)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 max-w-6xl mx-auto">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white text-black px-4 py-2 rounded-full font-semibold w-full max-w-xs">
          <span>🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={categoriaNombre || "Buscar..."}
            className="bg-transparent outline-none w-full text-sm font-semibold placeholder-black"
          />
        </div>

        <button
          onClick={() => setModalFiltrosAbierto(true)}
          className="bg-white text-black font-bold px-5 py-2 rounded-full hover:bg-neutral-200 transition"
        >
          Filtros
        </button>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-neutral-300 mb-6 font-medium">
        {loading
          ? "Cargando productos..."
          : `${productosFiltrados.length} ${productosFiltrados.length === 1 ? "resultado" : "resultados"}`}
      </p>

      {/* Grid de productos */}
      {loading ? (
        <div className="text-center py-20 text-neutral-400">Cargando catálogo de {categoriaNombre}...</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          No hay productos que coincidan con tus filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <Link
              key={producto.id}
              href={`/producto/${producto.id}`}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-red-600 transition group"
            >
              <div>
                <div className="w-full h-44 bg-neutral-800 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  <img
                    src={producto.images?.[0] || "/placeholder.png"}
                    alt={producto.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs uppercase tracking-wider text-red-500 font-bold">
                  {producto.manufacturer?.name || producto.category}
                </span>
                <h3 className="text-lg font-bold mt-1 line-clamp-1">{producto.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{producto.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white">
                  ${producto.price.toLocaleString("es-CO")}
                </span>
                <span className="text-xs text-neutral-400">Stock: {producto.stock}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal de Filtros */}
      {modalFiltrosAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button
                onClick={() => setModalFiltrosAbierto(false)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Categoría</label>
              <div className="grid grid-cols-2 gap-2">
                {categoriasDisponibles.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaSeleccionadaModal(cat)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition ${
                      normalizar(categoriaSeleccionadaModal) === normalizar(cat)
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-neutral-800 border-neutral-700 text-neutral-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {marcas.length > 0 && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Marca</label>
                <select
                  value={marcaSeleccionada}
                  onChange={(e) => setMarcaSeleccionada(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Precio máximo: ${precioMax.toLocaleString("es-CO")}
              </label>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={50000}
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setMarcaSeleccionada("");
                  setPrecioMax(2000000);
                  setBusqueda("");
                }}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-800 text-sm font-semibold hover:bg-neutral-700"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarCambioCategoria}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 text-sm font-bold hover:bg-red-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}