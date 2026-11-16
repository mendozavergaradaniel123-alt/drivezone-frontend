"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function CarritoPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex items-center justify-center p-6 border-b border-gray-800 relative">
          <button onClick={() => router.back()} className="absolute left-6 text-xl text-white hover:text-red-500">
            ←
          </button>
          <h1 className="text-lg font-bold">Mi carrito</h1>
        </header>

        {/* Lista de Productos en el Carrito */}
        <div className="p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Tu carrito está vacío.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white text-black rounded-xl p-3 flex items-center justify-between shadow-md relative">
                
                {/* Imagen */}
                <div className="w-20 h-20 relative flex-shrink-0 p-1">
                  <Image src={item.images?.[0] || "/rin.png"} alt={item.name} fill className="object-contain" />
                </div>
                
                {/* Detalles y Cantidad */}
                <div className="flex-1 px-3">
                  <h4 className="font-extrabold text-xs leading-tight mb-1">{item.name}</h4>
                  
                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-black text-white flex items-center justify-center rounded text-sm font-bold">-</button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-black text-white flex items-center justify-center rounded text-sm font-bold">+</button>
                  </div>
                  
                  <p className="font-black text-sm mb-1">${item.price.toLocaleString()} COP</p>
                  <span className="text-[10px] font-bold text-green-600">Disponible</span>
                </div>

                {/* Botón Eliminar (Basura) */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-lg flex items-center justify-center absolute bottom-3 right-3 shadow"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Compra */}
        {cart.length > 0 && (
          <div className="px-6 mt-4">
            <div className="border-t border-gray-600 py-4 flex flex-col gap-2 text-sm font-semibold">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()} COP</span>
              </div>
            </div>
            
            <div className="border-t border-gray-600 py-4 flex justify-between font-black text-lg">
              <span>Total:</span>
              <span>${subtotal.toLocaleString()} COP</span>
            </div>

            {/* BOTÓN CORREGIDO HACIA EL CHECKOUT */}
            <button 
              onClick={() => router.push('/checkout')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg mt-2"
            >
              Finalizar compra
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
          <Link href="/perfil" className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-1">Cuenta</span>
          </Link>
        </nav>

      </main>
    </div>
  );
}