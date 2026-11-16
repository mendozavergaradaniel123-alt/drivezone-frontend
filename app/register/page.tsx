"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    alert("¡Cuenta creada con éxito en DriveZone!\nRedirigiendo al inicio de sesión...");
    router.push("/login");
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white flex flex-col items-center p-8 relative shadow-2xl border-x border-gray-800">
        
        {/* Logo y Título */}
        <div className="flex flex-col items-center mt-12 mb-8">
          <h1 className="text-3xl font-black text-red-600 tracking-wider">DRIVEZONE</h1>
          <h2 className="text-lg font-bold mt-4 text-gray-300">Crear Cuenta</h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="w-full max-w-sm flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
            required
          />
          
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
            required
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
            required
          />

          <button 
            type="submit"
            className="w-full bg-transparent border border-white hover:bg-gray-900 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
          >
            Registrarme
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center w-full max-w-sm my-8 text-gray-500">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="px-4 font-bold text-white">O</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        {/* Enlace para volver al Login si ya tiene cuenta */}
        <div className="text-sm">
          <span className="text-gray-400">¿Ya tienes una cuenta? </span>
          <Link href="/login" className="text-blue-500 font-semibold">Iniciar sesión</Link>
        </div>

      </main>
    </div>
  );
}



