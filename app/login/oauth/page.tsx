"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthExtensionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") === "apple" ? "apple" : "google";

  const isGoogle = provider === "google";
  const [accountEmail, setAccountEmail] = useState(
    isGoogle ? "drivezone@gmail.com" : "drivezone.apple@icloud.com"
  );
  const [accountPassword, setAccountPassword] = useState("123456789012");

  const handleConfirmarAcceso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail.trim()) {
      alert("Ingresa un correo para continuar.");
      return;
    }

    localStorage.setItem(
      "drivezone_session",
      JSON.stringify({
        email: accountEmail.trim(),
        provider,
        loggedInAt: new Date().toISOString(),
      })
    );
    localStorage.setItem("drivezone_email", accountEmail.trim());
    if (accountPassword) {
      localStorage.setItem("drivezone_password", accountPassword);
    }

    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Cabecera estilo ventana externa */}
        <div
          className={`px-6 py-4 flex items-center justify-between text-white ${
            isGoogle ? "bg-neutral-900" : "bg-black"
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <span className="text-lg">{isGoogle ? "🌈" : "🍏"}</span>
            <span>
              {isGoogle ? "Extensión de Google — Acceder" : "Extensión de Apple ID — Iniciar sesión"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-md cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        <form onSubmit={handleConfirmarAcceso} className="p-6 flex flex-col gap-4">
          <div className="text-center mb-1">
            <h2 className="text-xl font-extrabold">
              {isGoogle ? "Elige una cuenta de Google" : "Inicia sesión con tu Apple ID"}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Continuar hacia <span className="font-bold text-black">DRIVEZONE</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Contraseña (provisional)
            </label>
            <input
              type="password"
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-red-600"
              required
            />
          </div>

          <div className="bg-neutral-100 rounded-xl p-3 text-xs text-gray-700">
            Al continuar, se vinculará esta sesión provisional con{" "}
            <span className="font-semibold">DriveZone</span> y volverás automáticamente con tu sesión iniciada.
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer mt-1"
          >
            {isGoogle ? "Continuar con Google" : "Continuar con Apple ID"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OAuthExtensionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Cargando extensión...
        </div>
      }
    >
      <OAuthExtensionContent />
    </Suspense>
  );
}