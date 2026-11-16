"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PerfilUsuario() {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre: "Daniel Mendoza Vergara",
    correo: "drivezone@gmail.com",
    telefono: "+57 300 123 4567"
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const parsed = JSON.parse(usuarioGuardado);
        setUsuario(prev => ({
          ...prev,
          nombre: parsed.nombre || prev.nombre,
          correo: parsed.correo || prev.correo
        }));
      } catch (e) {
        console.error("Error al leer los datos", e);
      }
    }
  }, []);

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("usuario", JSON.stringify({
      nombre: usuario.nombre,
      correo: usuario.correo
    }));
    setEditando(false);
    alert("¡Perfil actualizado con éxito!");
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    alert("Sesión cerrada correctamente");
    router.push("/");
  };

const opcionesMenu = [
    { label: "Mis pedidos", href: "/pedidos", icon: "📦" },
    { label: "Mis favoritos", href: "/favoritos", icon: "❤️" },
    { label: "Direcciones", href: "/direcciones", icon: "📍" },
    { label: "Métodos de pago", href: "/metodos-pago", icon: "💳" },
    { label: "Configuración", href: "/configuracion", icon: "⚙️" },
    { label: "Atención al cliente", href: "/soporte", icon: "🎧" },
  ];

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-white text-xl hover:text-red-500 transition-colors">
              ←
            </Link>
            <h1 className="text-lg font-bold">Editar perfil</h1>
          </div>
          <button 
            onClick={() => setEditando(!editando)}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
          >
            {editando ? "Cancelar" : "✏️ Editar"}
          </button>
        </header>

        {/* Sección de Información del Usuario */}
        <div className="flex items-center px-6 py-6 border-b border-gray-800 gap-4 bg-neutral-950">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-2xl font-bold text-white">
            {usuario.nombre.charAt(0)}
          </div>
          
          <div className="flex-1">
            {!editando ? (
              <>
                <h2 className="font-extrabold text-base text-white">{usuario.nombre}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{usuario.correo}</p>
              </>
            ) : (
              <form onSubmit={handleGuardarCambios} className="flex flex-col gap-2 mt-1">
                <input 
                  type="text" 
                  value={usuario.nombre}
                  onChange={(e) => setUsuario({...usuario, nombre: e.target.value})}
                  className="bg-neutral-900 border border-gray-700 text-xs p-1.5 rounded text-white outline-none focus:border-red-600"
                  placeholder="Nombre"
                />
                <input 
                  type="email" 
                  value={usuario.correo}
                  onChange={(e) => setUsuario({...usuario, correo: e.target.value})}
                  className="bg-neutral-900 border border-gray-700 text-xs p-1.5 rounded text-white outline-none focus:border-red-600"
                  placeholder="Correo"
                />
                <button type="submit" className="bg-red-600 text-xs py-1 rounded font-bold hover:bg-red-700 mt-1">
                  Guardar
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Menú de Opciones */}
        <div className="flex flex-col px-6 py-4 gap-5">
          {opcionesMenu.map((opcion, index) => (
            <Link 
              key={index} 
              href={opcion.href} 
              className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors flex justify-between items-center py-2 border-b border-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{opcion.icon}</span>
                <span>{opcion.label}</span>
              </div>
              <span className="text-gray-600 text-lg">›</span>
            </Link>
          ))}
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="px-6 mt-4">
          <button 
            onClick={handleCerrarSesion}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg text-sm flex items-center justify-center gap-2"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>

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