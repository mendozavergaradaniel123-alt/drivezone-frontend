"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSettings } from "../../context/SettingsContext";

export default function ConfiguracionPage() {
  const router = useRouter();
  const { settings, updateSetting, resetSettings } = useSettings();

  // Estado para cambio rápido de contraseña
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmarPass, setConfirmarPass] = useState("");
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  const mostrarAviso = (texto: string) => {
    setMensajeFeedback(texto);
    setTimeout(() => setMensajeFeedback(null), 3000);
  };

  const handleActualizarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPass.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (nuevaPass !== confirmarPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    localStorage.setItem("drivezone_password", nuevaPass);
    setNuevaPass("");
    setConfirmarPass("");
    setMostrarCambioPass(false);
    mostrarAviso("✅ Contraseña actualizada y sincronizada con el inicio de sesión.");
  };

  const handleLimpiarPedidos = () => {
    if (confirm("¿Seguro que deseas borrar el historial de pedidos guardados?")) {
      localStorage.removeItem("mis_pedidos");
      mostrarAviso("🗑️ Historial de pedidos eliminado.");
    }
  };

  const handleLimpiarFavoritos = () => {
    if (confirm("¿Seguro que deseas vaciar tu lista de favoritos?")) {
      localStorage.setItem("favoritos", JSON.stringify([]));
      mostrarAviso("💔 Lista de favoritos vaciada.");
    }
  };

  const handleRestablecerTodo = () => {
    if (confirm("¿Restablecer todas las preferencias a sus valores predeterminados?")) {
      resetSettings();
      mostrarAviso("🔄 Configuración restablecida por defecto.");
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur-md z-40">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xl text-white hover:text-red-500 transition-colors cursor-pointer"
          >
            ←
          </button>
          <h1 className="text-lg font-extrabold">Configuración</h1>
          <div className="w-6" />
        </header>

        {/* Banner de confirmación en tiempo real */}
        {mensajeFeedback && (
          <div className="mx-6 mt-4 bg-neutral-900 border border-red-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg">
            {mensajeFeedback}
          </div>
        )}

        <div className="p-6 flex flex-col gap-6">
          
          {/* 1. PREFERENCIAS DE COMPRA Y ENVÍO */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              Preferencias de compra
            </h2>

            {/* Envío por defecto en Checkout */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">
                  Envío predeterminado en Checkout
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Se seleccionará automáticamente al finalizar una compra.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateSetting("envioPreferido", "estandar");
                    mostrarAviso("🚚 Envío Estándar fijado por defecto.");
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    settings.envioPreferido === "estandar"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-black border-neutral-800 text-gray-300"
                  }`}
                >
                  Estándar ($18.000)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSetting("envioPreferido", "express");
                    mostrarAviso("⚡ Envío Express fijado por defecto.");
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    settings.envioPreferido === "express"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-black border-neutral-800 text-gray-300"
                  }`}
                >
                  Express ($30.000)
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-neutral-800" />

            {/* Toggle Confirmación carrito */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Alertas al agregar al carrito</p>
                <p className="text-xs text-gray-400">
                  Muestra confirmación visual al añadir repuestos.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSetting("confirmarAgregarCarrito", !settings.confirmarAgregarCarrito)
                }
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  settings.confirmarAgregarCarrito ? "bg-red-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.confirmarAgregarCarrito ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 2. NOTIFICACIONES */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              Notificaciones
            </h2>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Estado de mis pedidos</p>
                <p className="text-xs text-gray-400">
                  Avisos sobre despacho y entrega de repuestos.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSetting("notificacionesPedidos", !settings.notificacionesPedidos)
                }
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  settings.notificacionesPedidos ? "bg-red-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notificacionesPedidos ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="h-[1px] bg-neutral-800" />

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Ofertas y descuentos</p>
                <p className="text-xs text-gray-400">
                  Promociones en aceites, rines, baterías y llantas.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSetting("notificacionesOfertas", !settings.notificacionesOfertas)
                }
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  settings.notificacionesOfertas ? "bg-red-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notificacionesOfertas ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 3. PRIVACIDAD Y SEGURIDAD */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              Privacidad y seguridad
            </h2>

            {/* Modo discreto */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Ocultar datos sensibles</p>
                <p className="text-xs text-gray-400">
                  Enmascara correo y teléfono en pantalla (ej. dr***@gmail.com).
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("modoPrivacidad", !settings.modoPrivacidad)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                  settings.modoPrivacidad ? "bg-red-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.modoPrivacidad ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="h-[1px] bg-neutral-800" />

            {/* Cambio rápido de contraseña */}
            <div>
              <button
                type="button"
                onClick={() => setMostrarCambioPass(!mostrarCambioPass)}
                className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-bold text-white">Cambiar contraseña</p>
                  <p className="text-xs text-gray-400">
                    Actualiza tu clave de acceso de DriveZone.
                  </p>
                </div>
                <span className="text-red-500 font-bold text-sm">
                  {mostrarCambioPass ? "Cerrar" : "Editar ›"}
                </span>
              </button>

              {mostrarCambioPass && (
                <form
                  onSubmit={handleActualizarPassword}
                  className="mt-3 pt-3 border-t border-neutral-800 flex flex-col gap-3"
                >
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={nuevaPass}
                    onChange={(e) => setNuevaPass(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmarPass}
                    onChange={(e) => setConfirmarPass(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Guardar nueva contraseña
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* 4. ALMACENAMIENTO Y DATOS */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              Datos de la cuenta
            </h2>

            <button
              type="button"
              onClick={handleLimpiarFavoritos}
              className="w-full bg-black hover:bg-neutral-900 border border-neutral-800 text-gray-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Vaciar lista de favoritos</span>
              <span>💔</span>
            </button>

            <button
              type="button"
              onClick={handleLimpiarPedidos}
              className="w-full bg-black hover:bg-neutral-900 border border-neutral-800 text-gray-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Limpiar historial de pedidos</span>
              <span>📦</span>
            </button>

            <button
              type="button"
              onClick={handleRestablecerTodo}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-red-500 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer mt-1"
            >
              <span>Restablecer configuración predeterminada</span>
              <span>🔄</span>
            </button>
          </section>

          <p className="text-center text-[11px] text-gray-500">
            DriveZone App v1.0 • Cali, Colombia
          </p>
        </div>

        {/* Barra de navegación inferior */}
        <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-gray-800 flex justify-around p-4 z-50">
          <Link
            href="/home"
            className="flex flex-col items-center text-gray-500 hover:text-red-600"
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-1">Inicio</span>
          </Link>
          <Link
            href="/catalogo"
            className="flex flex-col items-center text-gray-500 hover:text-red-600"
          >
            <span className="text-xl">🗂️</span>
            <span className="text-[10px] mt-1">Categorías</span>
          </Link>
          <Link
            href="/perfil"
            className="flex flex-col items-center text-red-600"
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-1">Cuenta</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}