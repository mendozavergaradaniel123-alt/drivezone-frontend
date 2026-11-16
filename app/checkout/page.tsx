"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAddresses } from "../../context/AddressesContext";
import { usePaymentMethods } from "../../context/PaymentMethodsContext";
import { useSettings } from "../../context/SettingsContext";

export default function CheckoutPage() {
  
  const router = useRouter();
  const { subtotal, cart, removeFromCart } = useCart();
  const { addresses, selectedAddress, setDefaultAddress } = useAddresses();
  const { paymentMethods, selectedPayment, setDefaultPaymentMethod } = usePaymentMethods();

  
  const [cambiandoDireccion, setCambiandoDireccion] = useState(false);
  const { settings } = useSettings();
  const [metodoEnvio, setMetodoEnvio] = useState(settings.envioPreferido);

  useEffect(() => {
  setMetodoEnvio(settings.envioPreferido);
  }, [settings.envioPreferido]);

  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/home");
    }
  }, [cart, router]);

  const costoEnvio = metodoEnvio === "estandar" ? 18000 : 30000;
  const total = subtotal + costoEnvio;

  const handleFinalizarCompra = () => {
    if (!selectedPayment) {
      alert("Por favor configura un método de pago antes de finalizar.");
      router.push("/metodos-pago");
      return;
    }

    const fechaActual = new Date();
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const fechaString = `${fechaActual.getDate()} de ${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

    const nuevoPedido = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      fecha: fechaString,
      items: cart,
      total: total,
      direccion: selectedAddress,
      metodoPago: `${selectedPayment.label} (${selectedPayment.summary})`,
      estado: "En camino",
    };

    const pedidosPrevios = JSON.parse(localStorage.getItem("mis_pedidos") || "[]");
    localStorage.setItem("mis_pedidos", JSON.stringify([nuevoPedido, ...pedidosPrevios]));

    cart.forEach((item) => removeFromCart(item.id));
    router.push("/pedidos");
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        <header className="flex items-center justify-center p-6 relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-6 text-xl text-white hover:text-red-500 transition-colors cursor-pointer"
          >
            ←
          </button>
          <h1 className="text-lg font-bold">Finalizar compra</h1>
        </header>

        <div className="px-6 flex flex-col gap-6">
          {/* Dirección de envío */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-200 font-semibold">Dirección de envío:</p>
              <button
                type="button"
                onClick={() => setCambiandoDireccion(!cambiandoDireccion)}
                className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
              >
                {cambiandoDireccion ? "Cerrar" : "Cambiar"}
              </button>
            </div>

            {cambiandoDireccion ? (
              <div className="flex flex-col gap-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setDefaultAddress(addr.id);
                      setCambiandoDireccion(false);
                    }}
                    className={`bg-neutral-900 border p-3 rounded-xl cursor-pointer text-sm ${
                      addr.id === selectedAddress.id
                        ? "border-red-600 bg-neutral-800"
                        : "border-neutral-800"
                    }`}
                  >
                    <p className="font-bold text-white">
                      {addr.title} - {addr.name}
                    </p>
                    <p className="text-gray-300 text-xs">{addr.street}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white text-black rounded-xl p-4 shadow-md">
                <h3 className="font-extrabold text-sm mb-1">{selectedAddress.title}</h3>
                <p className="text-sm font-medium">{selectedAddress.name}</p>
                <p className="text-sm">{selectedAddress.street}</p>
                <p className="text-sm">Tel: {selectedAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Método de envío */}
          <div>
            <p className="text-sm text-gray-200 mb-2 font-semibold">Método de envío:</p>
            <div className="bg-white text-black rounded-xl p-4 flex flex-col gap-4 shadow-md">
              <label
                onClick={() => setMetodoEnvio("estandar")}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      metodoEnvio === "estandar" ? "border-red-600" : "border-gray-400"
                    }`}
                  >
                    {metodoEnvio === "estandar" && (
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-semibold group-hover:text-red-600 transition-colors">
                    Estandar (3-5 días)
                  </span>
                </div>
                <span className="text-sm font-bold">$18.000</span>
              </label>

              <label
                onClick={() => setMetodoEnvio("express")}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      metodoEnvio === "express" ? "border-red-600" : "border-gray-400"
                    }`}
                  >
                    {metodoEnvio === "express" && (
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-semibold group-hover:text-red-600 transition-colors">
                    Express (1-2 días)
                  </span>
                </div>
                <span className="text-sm font-bold">$30.000</span>
              </label>
            </div>
          </div>

          {/* Método de pago conectado a Métodos guardados */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-200 font-semibold">Método de pago:</p>
              <Link
                href="/metodos-pago"
                className="text-xs text-red-500 font-bold hover:underline"
              >
                + Configurar / Agregar
              </Link>
            </div>

            <div className="bg-white text-black rounded-xl p-4 flex flex-col gap-3.5 shadow-md">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-600 mb-2">
                    No tienes métodos de pago guardados.
                  </p>
                  <Link
                    href="/metodos-pago"
                    className="inline-block bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Agregar método de pago
                  </Link>
                </div>
              ) : (
                paymentMethods.map((metodo) => {
                  const activo = selectedPayment?.id === metodo.id;
                  return (
                    <label
                      key={metodo.id}
                      onClick={() => setDefaultPaymentMethod(metodo.id)}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          activo ? "border-red-600" : "border-gray-400"
                        }`}
                      >
                        {activo && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-extrabold uppercase group-hover:text-red-600 transition-colors block">
                          {metodo.label}
                        </span>
                        <span className="text-xs text-gray-600 block truncate">
                          {metodo.summary}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Resumen Final */}
        <div className="px-6 mt-8">
          <div className="border-t border-gray-600 py-4 flex justify-between font-black text-lg">
            <span>Total:</span>
            <span>${total.toLocaleString()} COP</span>
          </div>

          <button
            type="button"
            onClick={handleFinalizarCompra}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors mt-2 cursor-pointer"
          >
            Finalizar compra
          </button>
        </div>

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
            className="flex flex-col items-center text-gray-500 hover:text-red-600"
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-1">Cuenta</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}