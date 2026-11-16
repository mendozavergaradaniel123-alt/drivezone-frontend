"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";

interface Manufacturer {
  name: string;
}

interface Producto {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
  stock: number;
  rating?: number;
  manufacturer?: Manufacturer;
}

const MARCAS_POR_CATEGORIA: Record<string, string[]> = {
  Todas: [
    "Castrol",
    "Mobil",
    "Motul",
    "Shell",
    "Valvoline",
    "Liqui Moly",
    "Total",
    "Pennzoil",
    "Michelin",
    "Pirelli",
    "Bridgestone",
    "Goodyear",
    "MAC",
    "Bosch",
    "Varta",
    "BBS",
    "OZ Racing",
    "Enkei",
  ],
  Aceites: ["Castrol", "Mobil", "Motul", "Shell", "Valvoline", "Liqui Moly", "Total", "Pennzoil"],
  Neumáticos: ["Michelin", "Pirelli", "Bridgestone", "Goodyear", "Continental", "Hankook"],
  Baterías: ["MAC", "Bosch", "Varta", "Willard", "Duncan"],
  Rines: ["BBS", "OZ Racing", "Enkei", "Vossen", "Sparco"],
};

function mezclarProductosVariados(lista: Producto[]): Producto[] {
  if (!lista || lista.length <= 1) return lista;

  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  const grupos: Record<string, Producto[]> = {};
  for (const prod of copia) {
    const cat = (prod.category || "general").toLowerCase();
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(prod);
  }

  const categorias = Object.keys(grupos);
  const resultado: Producto[] = [];
  let quedanProductos = true;

  while (quedanProductos) {
    quedanProductos = false;
    categorias.sort(() => Math.random() - 0.5);

    for (const cat of categorias) {
      if (grupos[cat].length > 0) {
        const siguiente = grupos[cat].shift()!;
        if (
          resultado.length > 0 &&
          (resultado[resultado.length - 1].category || "").toLowerCase() === cat &&
          categorias.some((c) => c !== cat && grupos[c].length > 0)
        ) {
          grupos[cat].push(siguiente);
        } else {
          resultado.push(siguiente);
        }
        quedanProductos = true;
      }
    }
  }

  return resultado;
}

export default function CatalogoCompletoPage() {
  const { addToCart, totalItems } = useCart();
  const [productosBase, setProductosBase] = useState<Producto[]>([]);
  const [productosMostrados, setProductosMostrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados del modal de filtros (idéntico a la vista de categorías)
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState<number>(8000000);
  const [calificacionMin, setCalificacionMin] = useState<number | null>(null);

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/inventory`);
        const result = await res.json();

        const listaRaw: Producto[] = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : [];

        const mezclados = mezclarProductosVariados(listaRaw);
        setProductosBase(mezclados);
        setProductosMostrados(mezclados);
      } catch (error) {
        console.error("Error cargando catálogo completo:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarCatalogo();
  }, []);

  // Lista dinámica de marcas disponibles (combina las predefinidas + las que vengan del backend)
  const marcasDisponibles = useMemo(() => {
    const base = MARCAS_POR_CATEGORIA[categoriaFiltro] || MARCAS_POR_CATEGORIA.Todas;
    const delBackend = productosBase
      .filter((p) =>
        categoriaFiltro === "Todas"
          ? true
          : (p.category || "").toLowerCase() === categoriaFiltro.toLowerCase()
      )
      .map((p) => p.manufacturer?.name)
      .filter((m): m is string => Boolean(m));

    return Array.from(new Set([...base, ...delBackend]));
  }, [categoriaFiltro, productosBase]);

  // Filtrado en tiempo real cuando cambia la barra de búsqueda
  useEffect(() => {
    aplicarFiltrosInternos(busqueda, categoriaFiltro, marcasSeleccionadas, precioMax, calificacionMin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, productosBase]);

  const aplicarFiltrosInternos = (
    textoBusqueda: string,
    cat: string,
    marcas: string[],
    maxP: number,
    minRating: number | null
  ) => {
    let filtrados = [...productosBase];

    if (textoBusqueda.trim() !== "") {
      const q = textoBusqueda.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.manufacturer?.name && p.manufacturer.name.toLowerCase().includes(q))
      );
    }

    if (cat !== "Todas") {
      filtrados = filtrados.filter(
        (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
      );
    }

    if (marcas.length > 0) {
      filtrados = filtrados.filter((p) => {
        const marcaProd = (p.manufacturer?.name || p.name || "").toLowerCase();
        return marcas.some((m) => marcaProd.includes(m.toLowerCase()));
      });
    }

    filtrados = filtrados.filter((p) => p.price <= maxP);

    if (minRating !== null) {
      filtrados = filtrados.filter((p) => (p.rating ?? 4.5) >= minRating);
    }

    setProductosMostrados(filtrados);
  };

  const toggleMarca = (marca: string) => {
    setMarcasSeleccionadas((prev) =>
      prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]
    );
  };

  const handleLimpiarFiltros = () => {
    setCategoriaFiltro("Todas");
    setMarcasSeleccionadas([]);
    setPrecioMax(8000000);
    setCalificacionMin(null);
    setProductosMostrados(productosBase);
  };

  const handleAplicarFiltros = () => {
    aplicarFiltrosInternos(busqueda, categoriaFiltro, marcasSeleccionadas, precioMax, calificacionMin);
    setMostrarFiltros(false);
  };

  const porcentajeSlider = Math.min(
    100,
    Math.max(0, ((precioMax - 30000) / (8000000 - 30000)) * 100)
  );

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex justify-between items-center px-6 pt-6 pb-4">
          <Link href="/home" className="relative w-24 h-12 flex items-center">
            <Image
              src="/logo.png"
              alt="DriveZone"
              fill
              sizes="96px"
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/perfil" className="text-2xl hover:opacity-80 transition-opacity">
              👤
            </Link>
            <Link href="/carrito" className="text-2xl relative hover:opacity-80 transition-opacity">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Barra de Búsqueda y Botón Filtros */}
        <div className="px-6 mt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-white text-black rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-md">
              <span className="text-base">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Todos los productos"
                className="bg-transparent text-black font-bold text-sm w-full outline-none placeholder:text-black"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="text-xs text-gray-500 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltros(true)}
              className="bg-white text-black font-extrabold text-sm px-5 py-3 rounded-2xl shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Filtros
            </button>
          </div>

          {/* Contador de resultados */}
          <p className="text-sm font-bold text-white mt-5 mb-4">
            {loading ? "Cargando..." : `${productosMostrados.length} resultados`}
          </p>

          {/* Tarjetas blancas */}
          <div className="flex flex-col gap-4">
            {!loading && productosMostrados.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">
                No se encontraron productos con esos filtros.
              </p>
            ) : (
              productosMostrados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white text-black rounded-3xl p-4 flex items-center justify-between gap-3 shadow-lg"
                >
                  <Link
                    href={`/producto/${prod.id}`}
                    className="w-20 h-20 relative shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={prod.images?.[0] || "/rin.png"}
                      alt={prod.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </Link>

                  <Link href={`/producto/${prod.id}`} className="flex-1 min-w-0">
                    <h2 className="font-extrabold text-sm text-black leading-snug line-clamp-2">
                      {prod.name}
                    </h2>
                    <p className="font-black text-base text-black mt-1">
                      ${prod.price?.toLocaleString()} COP
                    </p>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        prod.stock > 0 ? "text-emerald-500" : "text-red-600"
                      }`}
                    >
                      {prod.stock > 0 ? "Disponible" : "Agotado"}
                    </p>
                  </Link>

                  <button
                    type="button"
                    disabled={prod.stock === 0}
                    onClick={() => addToCart(prod)}
                    title="Agregar al carrito"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-colors cursor-pointer ${
                      prod.stock > 0
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    🛒
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de Filtros idéntico al diseño original */}
        {mostrarFiltros && (
          <div className="fixed inset-0 z-50 bg-black/80 flex justify-center">
            <div className="bg-black w-full max-w-md min-h-screen text-white flex flex-col justify-between overflow-y-auto border-x border-neutral-800">
              <div>
                {/* Cabecera Filtros / Limpiar */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMostrarFiltros(false)}
                      className="text-lg text-gray-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                    <h2 className="text-xl font-extrabold">Filtros</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleLimpiarFiltros}
                    className="text-sm text-gray-300 hover:text-white cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Sección Categoría */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                  <span className="font-bold text-sm">Categoría</span>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => {
                      setCategoriaFiltro(e.target.value);
                      setMarcasSeleccionadas([]);
                    }}
                    className="bg-transparent text-red-600 font-bold text-sm outline-none cursor-pointer text-right"
                  >
                    <option value="Todas" className="bg-black text-red-600">
                      Todas
                    </option>
                    <option value="Aceites" className="bg-black text-red-600">
                      Aceites
                    </option>
                    <option value="Neumáticos" className="bg-black text-red-600">
                      Neumáticos
                    </option>
                    <option value="Baterías" className="bg-black text-red-600">
                      Baterías
                    </option>
                    <option value="Rines" className="bg-black text-red-600">
                      Rines
                    </option>
                  </select>
                </div>

                {/* Sección Marca */}
                <div className="px-6 py-5 border-b border-neutral-800">
                  <h3 className="font-bold text-sm mb-4">Marca</h3>
                  <div className="flex flex-col gap-3.5 max-h-64 overflow-y-auto pr-1">
                    {marcasDisponibles.map((marca) => {
                      const activa = marcasSeleccionadas.includes(marca);
                      return (
                        <label
                          key={marca}
                          onClick={() => toggleMarca(marca)}
                          className="flex items-center gap-3.5 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              activa
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-neutral-600 bg-transparent"
                            }`}
                          >
                            {activa && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <span className="text-sm font-bold text-white">{marca}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sección Precio */}
                <div className="px-6 py-5 border-b border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm">Precio</span>
                    <span className="text-red-600 font-bold text-sm">
                      $30.000 - ${precioMax.toLocaleString("es-CO")}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={30000}
                    max={8000000}
                    step={10000}
                    value={precioMax}
                    onChange={(e) => setPrecioMax(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${porcentajeSlider}%, #262626 ${porcentajeSlider}%, #262626 100%)`,
                    }}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                {/* Sección Calificación */}
                <div className="px-6 py-5">
                  <h3 className="font-bold text-sm mb-4">Calificación</h3>
                  <div className="flex flex-col gap-3.5">
                    {[
                      { label: "5 Estrellas", value: 5 },
                      { label: "4 Estrellas o más", value: 4 },
                      { label: "3 Estrellas o más", value: 3 },
                      { label: "2 Estrellas o más", value: 2 },
                    ].map((item) => {
                      const seleccionada = calificacionMin === item.value;
                      return (
                        <label
                          key={item.value}
                          onClick={() =>
                            setCalificacionMin(seleccionada ? null : item.value)
                          }
                          className="flex items-center gap-3.5 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              seleccionada
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-neutral-600 bg-transparent"
                            }`}
                          >
                            {seleccionada && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <span className="text-sm font-bold text-white">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botón inferior Aplicar filtros */}
              <div className="p-6">
                <button
                  type="button"
                  onClick={handleAplicarFiltros}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer shadow-lg"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de navegación inferior */}
        <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-gray-800 flex justify-around p-4 z-40">
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-1">Inicio</span>
          </Link>
          <Link href="/catalogo" className="flex flex-col items-center text-red-600">
            <span className="text-xl">🗂️</span>
            <span className="text-[10px] mt-1">Categorías</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center text-gray-500 hover:text-red-600">
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-1">Cuenta</span>
          </Link>
        </nav>

      </main>
    </div>
  );
}