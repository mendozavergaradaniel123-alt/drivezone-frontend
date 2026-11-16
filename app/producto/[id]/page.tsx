"use client";

import React, { useEffect, useState, Suspense } from "react";
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

interface ItemCarrito extends Producto {
  quantity: number;
}

function ProductoDetalleContenido() {
  const params = useParams();
  const router = useRouter();

  const productoId = decodeURIComponent(
    Array.isArray(params?.id) ? params.id[0] : params?.id || ""
  ).trim();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensajeCarrito, setMensajeCarrito] = useState<string>("");

  useEffect(() => {
    async function fetchProducto() {
      try {
        setLoading(true);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/inventory`);
        const result = await res.json();

        const rawData: Producto[] = Array.isArray(result)
          ? result
          : result.status === 200 && Array.isArray(result.data)
          ? result.data
          : [];

        const encontrado = rawData.find(
          (item) => String(item.id).toLowerCase() === productoId.toLowerCase()
        );

        setProducto(encontrado || null);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        setProducto(null);
      } finally {
        setLoading(false);
      }
    }

    if (productoId) {
      fetchProducto();
    }
  }, [productoId]);

  const agregarAlCarrito = () => {
    if (!producto) return;

    try {
      const carritoActual: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
      const indiceExistente = carritoActual.findIndex((item) => item.id === producto.id);

      if (indiceExistente >= 0) {
        carritoActual[indiceExistente].quantity = Math.min(
          producto.stock,
          (carritoActual[indiceExistente].quantity || 1) + cantidad
        );
      } else {
        carritoActual.push({
          ...producto,
          quantity: cantidad,
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      setMensajeCarrito("Producto agregado al carrito.");
      setTimeout(() => setMensajeCarrito(""), 3000);
    } catch (e) {
      console.error("Error guardando en carrito:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-400">Cargando detalle del producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-neutral-200">Producto no encontrado.</p>
        <button
          onClick={() => router.back()}
          className="text-red-500 font-semibold hover:underline"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-neutral-400 hover:text-white mb-6 inline-flex items-center gap-2"
      >
        ← Volver atrás
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
        <div className="w-full h-80 md:h-96 bg-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={producto.images?.[0] || "/placeholder.png"}
            alt={producto.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                {producto.category}
              </span>
              <span className="text-sm text-yellow-400 font-semibold">
                ★ {producto.rating ?? 5}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold mt-3">{producto.name}</h1>
            {producto.manufacturer?.name && (
              <p className="text-sm text-neutral-400 mt-1">
                Fabricante: <span className="text-white font-medium">{producto.manufacturer.name}</span>
              </p>
            )}

            <p className="text-3xl font-black text-white mt-5">
              ${producto.price.toLocaleString("es-CO")}
            </p>

            <p className="text-neutral-300 text-sm leading-relaxed mt-4">
              {producto.description}
            </p>

            <p className="text-xs text-neutral-400 mt-4">
              Disponibilidad:{" "}
              <span className={producto.stock > 0 ? "text-green-400 font-semibold" : "text-red-500"}>
                {producto.stock > 0 ? `${producto.stock} unidades en stock` : "Agotado"}
              </span>
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Cantidad:</span>
              <div className="flex items-center bg-neutral-800 rounded-xl border border-neutral-700">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="px-3.5 py-1.5 text-lg font-bold hover:text-red-500"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-semibold">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => Math.min(producto.stock || 1, c + 1))}
                  className="px-3.5 py-1.5 text-lg font-bold hover:text-red-500"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={agregarAlCarrito}
                disabled={producto.stock <= 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Agregar al carrito
              </button>

              <Link
                href={`/soporte?producto=${encodeURIComponent(producto.name)}`}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-6 rounded-xl text-center border border-neutral-700 transition"
              >
                Consultar en soporte
              </Link>
            </div>

            {mensajeCarrito && (
              <p className="text-sm text-green-400 font-medium text-center">{mensajeCarrito}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductoDetallePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p className="text-neutral-400">Cargando producto...</p>
        </div>
      }
    >
      <ProductoDetalleContenido />
    </Suspense>
  );
}