"use client"; 
import Link from "next/link";

export default function Bienvenida() {
  
  const handleSalir = () => {
    alert("Gracias por visitar DriveZone. ¡Vuelve pronto!");
    window.location.href = "https://www.google.com"; 
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white flex flex-col items-center justify-center p-6 relative shadow-2xl border-x border-gray-800">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-black text-red-600 tracking-wider">DRIVEZONE</h1>
        </div>

        <h2 className="text-xl font-bold mb-6">BIENVENIDO</h2>
        <p className="text-sm mb-8">¿Desea iniciar sesión?</p>

        {/* Botones Sí / No */}
        <div className="flex gap-6 w-full max-w-xs mb-16">
          
          {/* Fíjate cómo ahora el Link tiene los estilos directamente */}
          <Link 
            href="/login" 
            className="flex-1 flex justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg border border-white transition-colors"
          >
            Si
          </Link>

          <Link 
            href="/register" 
            className="flex-1 flex justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg border border-white transition-colors"
          >
            No
          </Link>

        </div>

        {/* Botón Salir */}
        <button 
          onClick={handleSalir} 
          className="w-full max-w-xs bg-transparent border border-gray-400 hover:bg-gray-800 text-gray-300 py-3 rounded-lg transition-colors"
        >
          Salir
        </button>

      </main>
    </div>
  );
}