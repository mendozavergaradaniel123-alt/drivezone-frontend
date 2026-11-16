"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function Home() {
  const { totalItems } = useCart();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");

  
  const ofertas = [
    { id: 1, title: "RINES\nDE LUJO", subtitle: "HASTA 20% OFF", img: "/oferta1.jpg" },
    { id: 2, title: "ACEITES\nPREMIUM", subtitle: "LLEVA 2 PAGA 1", img: "/oferta2.jpg" },
    { id: 3, title: "LLANTAS\nDEPORTIVAS", subtitle: "INSTALACIÓN GRATIS", img: "/oferta3.jpg" }
  ];

  const categorias = [
    { name: 'Aceites', img: '/aceite.jpg' },
    { name: 'Neumáticos', img: '/neumatico.jpg' },
    { name: 'Baterías', img: '/bateria.jpg' },
    { name: 'Rines', img: '/rin.jpg' }
  ];

  
  const productosOferta = [
    { id: 'oil-1', name: "Aceite Sintético Mobil 1", price: "$120.000 COP", oldPrice: "$150.000 COP", discount: "20%", img: "/aceite1.jpg" },
    { id: 'tire-1', name: "Neumático Deportivo Michelin", price: "$450.000 COP", oldPrice: "$550.000 COP", discount: "18%", img: "/neumatico1.jpg" },
    { id: 'bat-1', name: "Batería Mac 600 AMP", price: "$500.000 COP", oldPrice: "$600.000 COP", discount: "17%", img: "/bateria1.jpg" },
    { id: 'rin-1', name: "Rines BBS 18\"", price: "$5.500.000 COP", oldPrice: "$6.500.000 COP", discount: "15%", img: "/rin1.jpg" },
    { id: 'oil-2', name: "Aceite Castrol Edge", price: "$135.000 COP", oldPrice: "$160.000 COP", discount: "15%", img: "/aceite2.jpg" }
  ];

  const [slideActual, setSlideActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideActual((prev) => (prev === ofertas.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [ofertas.length]);

  const handleBuscar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && busqueda.trim() !== "") {
      router.push(`/buscar?q=${encodeURIComponent(busqueda)}`);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto overflow-x-hidden">
        
        {/* Cabecera */}
        <header className="flex justify-between items-center p-6">
          <Image src="/logo.png" alt="DriveZone Logo" width={140} height={40} className="object-contain" />
          <div className="flex gap-4 items-center">
            <Link href="/perfil" className="text-red-600 text-2xl cursor-pointer hover:opacity-80 transition-opacity" title="Mi Perfil">👤</Link>
            <Link href="/carrito" className="text-red-600 text-2xl relative cursor-pointer hover:opacity-80 transition-opacity">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>
              )}
            </Link>
          </div>
        </header>

        {/* Barra de Búsqueda Interactiva */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg flex items-center p-3">
            <span className="text-gray-500 mr-2">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar productos, marcas..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleBuscar}
              className="w-full text-black outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Carrusel de Ofertas */}
        <div className="px-6 mb-8">
          <div className="bg-white rounded-xl p-6 flex justify-between items-center text-black min-h-[160px] shadow-lg transition-all duration-500 ease-in-out">
            <div className="z-10 w-3/5">
              <h2 className="text-2xl font-black italic leading-tight whitespace-pre-line">{ofertas[slideActual].title}</h2>
              <p className="text-sm font-bold mt-2 text-red-600">{ofertas[slideActual].subtitle}</p>
            </div>
            <div className="w-28 h-28 relative z-10 flex-shrink-0">
              <Image src={ofertas[slideActual].img} alt="Oferta" fill className="object-contain drop-shadow-md" />
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
             {ofertas.map((_, index) => (
                <div key={index} className={`h-1.5 rounded-full transition-all duration-300 ${index === slideActual ? 'w-5 bg-red-600' : 'w-2 bg-gray-700'}`} />
             ))}
          </div>
        </div>

        {/* Categorías */}
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold">Categorías</h2>
            <Link href="/catalogo" className="text-xs text-gray-300 hover:text-red-500 transition-colors">
            Ver todos
          </Link>
          </div>
          <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map((cat, index) => (
              <Link href={`/${cat.name.toLowerCase()}`} key={index} className="flex flex-col items-center min-w-[75px] group">
                <div className="w-20 h-20 bg-white rounded-xl mb-2 relative overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                  <Image src={cat.img} alt={cat.name} fill className="object-cover p-2" />
                </div>
                <span className="text-sm font-semibold group-hover:text-red-500 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Productos en oferta */}
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">Productos en oferta</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {productosOferta.map((producto) => (
              <Link href={`/producto/${producto.id}`} key={producto.id} className="min-w-[140px] flex flex-col group cursor-pointer">
                <div className="bg-white rounded-xl h-32 w-full relative p-2 flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform">
                   <Image src={producto.img} alt={producto.name} fill className="object-contain p-2" />
                </div>
                <h4 className="text-xs font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">{producto.name}</h4>
                <span className="text-sm font-bold text-white">{producto.price}</span>
                
                {/* Restaurado: UI de precio tachado y porcentaje de descuento */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 line-through">{producto.oldPrice}</span>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">{producto.discount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Navegación inferior */}
        <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-gray-800 flex justify-around p-4 z-50">
          <Link href="/home" className="flex flex-col items-center text-red-600"><span className="text-2xl">🏠</span><span className="text-xs mt-1">Inicio</span></Link>
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors"><span className="text-2xl">🗂️</span><span className="text-xs mt-1">Categorías</span></Link>
          <Link href="/perfil" className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors"><span className="text-2xl">👤</span><span className="text-xs mt-1">Cuenta</span></Link>
        </nav>
      </main>
    </div>
  );
}


