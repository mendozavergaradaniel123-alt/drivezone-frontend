"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CODIGO_VERIFICACION = "123456";

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<"correo" | "codigo" | "nueva">("correo");
  const [correo, setCorreo] = useState("drivezone@gmail.com");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleEnviarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) {
      alert("Por favor ingresa tu correo electrónico.");
      return;
    }
    setMensaje(`Se envió un código de verificación a ${correo.trim()} (Código de prueba: 123456).`);
    setPaso("codigo");
  };

  const handleVerificarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoIngresado.trim() !== CODIGO_VERIFICACION) {
      alert("Código incorrecto. Ingresa 123456 para verificar.");
      return;
    }
    setMensaje("Código verificado correctamente. Ahora escribe tu nueva contraseña.");
    setPaso("nueva");
  };

  const handleGuardarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword.length < 4) {
      alert("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    localStorage.setItem("drivezone_email", correo.trim());
    localStorage.setItem("drivezone_password", nuevaPassword);
    alert("✅ Contraseña actualizada y guardada con éxito. Ya puedes iniciar sesión.");
    router.push("/login");
  };

  return (
    <div className="bg-neutral-950 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white px-7 py-10 flex flex-col justify-between font-sans border-x border-neutral-900">
        <div>
          <div className="flex items-center justify-between mb-8">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white">
              ← Volver al login
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Recuperación
            </span>
          </div>

          <h1 className="text-red-600 text-2xl font-black tracking-wider uppercase mb-2">
            DRIVEZONE
          </h1>
          <h2 className="text-xl font-bold mb-2">Cambiar contraseña</h2>
          <p className="text-xs text-gray-400 mb-6">
            Sigue los pasos para verificar tu correo e ingresar tu nueva contraseña.
          </p>

          {mensaje && (
            <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-xl p-3.5 mb-5">
              {mensaje}
            </div>
          )}

          {paso === "correo" && (
            <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-gray-300">
                Introduce tu correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full bg-slate-100 text-black font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer mt-2"
              >
                Enviar código de verificación
              </button>
            </form>
          )}

          {paso === "codigo" && (
            <form onSubmit={handleVerificarCodigo} className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-gray-300">
                Introduce el código de 6 dígitos (123456)
              </label>
              <input
                type="text"
                maxLength={6}
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                placeholder="123456"
                required
                className="w-full bg-slate-100 text-black font-bold text-center tracking-[0.4em] text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer mt-2"
              >
                Verificar código
              </button>
              <button
                type="button"
                onClick={() => setPaso("correo")}
                className="text-xs text-gray-400 hover:text-white underline mt-1 cursor-pointer"
              >
                Cambiar correo electrónico
              </button>
            </form>
          )}

          {paso === "nueva" && (
            <form onSubmit={handleGuardarPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Escribe tu nueva contraseña"
                  required
                  className="w-full bg-slate-100 text-black font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  required
                  className="w-full bg-slate-100 text-black font-medium px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer mt-2"
              >
                Guardar nueva contraseña
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Código de prueba del sistema: <span className="text-gray-300 font-bold">123456</span>
        </p>
      </main>
    </div>
  );
}