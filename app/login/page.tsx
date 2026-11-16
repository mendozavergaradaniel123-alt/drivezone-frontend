"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_EMAIL = "drivezone@gmail.com";
const DEFAULT_PASS = "12345";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASS);
  const [loading, setLoading] = useState(false);

  const completarLogin = (usuarioCorreo: string, proveedor?: string) => {
    const savedPass = localStorage.getItem("drivezone_password") || DEFAULT_PASS;
    localStorage.setItem(
      "drivezone_session",
      JSON.stringify({
        email: usuarioCorreo,
        provider: proveedor || "credentials",
        loggedInAt: new Date().toISOString(),
      })
    );
    
    void savedPass;
    router.push("/home");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const savedPass = localStorage.getItem("drivezone_password") || DEFAULT_PASS;
    const savedEmail = localStorage.getItem("drivezone_email") || DEFAULT_EMAIL;

    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          localStorage.setItem("drivezone_token", data.token);
        }
        completarLogin(email, "backend");
        return;
      }
    } catch {
      
    }

    const correoValido = email.trim().toLowerCase() === savedEmail.toLowerCase();
    const passValida = password === savedPass || password === DEFAULT_PASS;

    if (correoValido && passValida) {
      completarLogin(email.trim(), "local");
    } else if (email.trim() && password.trim()) {
      
      completarLogin(email.trim(), "provisional");
    } else {
      alert("Por favor ingresa tu correo y contraseña.");
    }

    setLoading(false);
  };

  const irAProveedor = (provider: "google" | "apple") => {
    router.push(`/login/oauth?provider=${provider}`);
  };

  return (
    <div className="bg-neutral-950 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white px-7 py-10 flex flex-col justify-center font-sans border-x border-neutral-900">
        <h1 className="text-red-600 text-3xl font-black text-center tracking-wider uppercase mb-10">
          DRIVEZONE
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            className="w-full bg-slate-100 text-black font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            className="w-full bg-slate-100 text-black font-medium px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-red-600 tracking-widest"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-neutral-900 text-white font-bold py-3.5 rounded-xl border border-neutral-500 transition-colors mt-1 cursor-pointer disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-6 text-sm">
          <Link
            href="/recuperar-password"
            className="text-blue-500 hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Separador O */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-[1px] bg-neutral-700" />
          <span className="text-sm font-bold text-white">O</span>
          <div className="flex-1 h-[1px] bg-neutral-700" />
        </div>

        {/* Extensiones Apple y Google */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => irAProveedor("apple")}
            className="w-full bg-black hover:bg-neutral-900 text-white font-semibold py-3.5 px-4 rounded-xl border border-neutral-600 flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <span>🍏</span>
            <span>Continuar con Apple ID</span>
          </button>

          <button
            type="button"
            onClick={() => irAProveedor("google")}
            className="w-full bg-black hover:bg-neutral-900 text-white font-semibold py-3.5 px-4 rounded-xl border border-neutral-600 flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <span>🌈</span>
            <span>Continuar con Google</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-300 mt-8">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="text-blue-500 font-bold hover:underline">
            Registrarse
          </Link>
        </p>
      </main>
    </div>
  );
}