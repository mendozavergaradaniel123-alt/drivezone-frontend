"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function MisPedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("mis_pedidos") || "[]");
    setPedidos(guardados);
  }, []);

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex items-center justify-center p-6 border-b border-gray-800 relative">
          <button onClick={() => router.back()} className="absolute left-6 text-xl text-white hover:text-red-500 transition-colors">
            ←
          </button>
          <h1 className="text-lg font-bold">Mis pedidos</h1>
        </header>

        {/* Lista de Pedidos */}
        <div className="p-4 flex flex-col mt-2">
          {pedidos.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No tienes pedidos recientes.</p>
          ) : (
            pedidos.map((pedido) => (
              pedido.items.map((item: any, indexItem: number) => (
                <div key={`${pedido.id}-${indexItem}`} className="bg-white text-black rounded-xl p-3 flex items-center justify-between shadow-md mb-4">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 relative flex-shrink-0 p-1">
                      <Image src={item.images?.[0] || "/rin.png"} alt={item.name} fill className="object-contain" />
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <h4 className="font-extrabold text-sm leading-tight">Pedido #{pedido.id}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{pedido.fecha}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-bold ${pedido.estado === 'Entregado' ? 'text-green-600' : 'text-red-600'}`}>
                      {pedido.estado}
                    </span>
                    <span className="font-black text-xs">
                      ${(item.price * item.quantity).toLocaleString()} COP
                    </span>
                    {/* Botón interactivo para abrir los detalles de este pedido */}
                    <button 
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="text-red-600 text-[10px] font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Ver detalles
                    </button>
                  </div>

                </div>
              ))
            ))
          )}
        </div>

        {/* MODAL DE DETALLES DEL PEDIDO */}
        {pedidoSeleccionado && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col p-6 overflow-y-auto animate-fade-in text-white">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
              <h2 className="text-lg font-bold">Detalles del Pedido #{pedidoSeleccionado.id}</h2>
              <button 
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <p className="text-gray-400 text-xs mb-1">Fecha del pedido</p>
                <p className="font-semibold">{pedidoSeleccionado.fecha}</p>
              </div>

              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <p className="text-gray-400 text-xs mb-1">Estado actual</p>
                <p className="font-bold text-red-500">{pedidoSeleccionado.estado}</p>
              </div>

              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <p className="text-gray-400 text-xs mb-2 font-bold">Productos en este pedido:</p>
                <div className="flex flex-col gap-3">
                  {pedidoSeleccionado.items.map((prod: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
                      <span>{prod.name} (x{prod.quantity})</span>
                      <span className="font-bold">${(prod.price * prod.quantity).toLocaleString()} COP</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Subtotal productos:</span>
                  <span>${pedidoSeleccionado.items.reduce((acc: number, cur: any) => acc + (cur.price * cur.quantity), 0).toLocaleString()} COP</span>
                </div>
                <div className="flex justify-between font-black text-base mt-2 pt-2 border-t border-neutral-800 text-white">
                  <span>Total pagado:</span>
                  <span className="text-red-500">${pedidoSeleccionado.total.toLocaleString()} COP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setPedidoSeleccionado(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-6 transition-colors shadow-lg"
            >
              Cerrar detalles
            </button>
          </div>
        )}

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