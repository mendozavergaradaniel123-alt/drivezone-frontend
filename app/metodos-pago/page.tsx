"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PaymentType,
  usePaymentMethods,
} from "../../context/PaymentMethodsContext";

const BANCOS_COLOMBIA = [
  "Bancolombia",
  "Davivienda",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Banco de Occidente",
  "Scotiabank Colpatria",
  "Banco Caja Social",
  "Banco AV Villas",
  "Itaú",
  "Nu Colombia",
  "Lulo Bank",
];

export default function MetodosPagoPage() {
  const router = useRouter();
  const {
    paymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<PaymentType>("tarjeta");
  const [marcarPredeterminado, setMarcarPredeterminado] = useState(true);

  // Campos comunes
  const [titular, setTitular] = useState("");

  // Campos Tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv] = useState("");

  // Campos PSE
  const [banco, setBanco] = useState("Bancolombia");
  const [tipoPersona, setTipoPersona] = useState<"Natural" | "Jurídica">("Natural");
  const [tipoDoc, setTipoDoc] = useState("CC");
  const [numeroDoc, setNumeroDoc] = useState("");
  const [correoPse, setCorreoPse] = useState("");

  // Campos Nequi / Daviplata
  const [celular, setCelular] = useState("");

  const formatearTarjeta = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 16);
    return soloNumeros.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatearExpiracion = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 4);
    if (soloNumeros.length >= 3) {
      return `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
    }
    return soloNumeros;
  };

  const limpiarFormulario = () => {
    setTitular("");
    setNumeroTarjeta("");
    setExpiracion("");
    setCvv("");
    setBanco("Bancolombia");
    setTipoPersona("Natural");
    setTipoDoc("CC");
    setNumeroDoc("");
    setCorreoPse("");
    setCelular("");
  };

  const handleGuardarMetodo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titular.trim()) {
      alert("Por favor ingresa el nombre del titular.");
      return;
    }

    if (tipoSeleccionado === "tarjeta") {
      const digitos = numeroTarjeta.replace(/\s/g, "");
      if (digitos.length < 13) {
        alert("Ingresa un número de tarjeta válido (mínimo 13 dígitos).");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
        alert("Ingresa la fecha de vencimiento en formato MM/AA.");
        return;
      }
      if (cvv.replace(/\D/g, "").length < 3) {
        alert("Ingresa un código CVV válido de 3 o 4 dígitos.");
        return;
      }

      const ultimos4 = digitos.slice(-4);
      const franquicia = digitos.startsWith("4")
        ? "Visa"
        : digitos.startsWith("5")
        ? "Mastercard"
        : "Tarjeta";

      addPaymentMethod({
        type: "tarjeta",
        label: "Tarjeta Crédito/Débito",
        summary: `${franquicia} •••• ${ultimos4} • Vence ${expiracion}`,
        holderName: titular.trim(),
        isDefault: marcarPredeterminado,
        details: {
          cardNumber: `${digitos.slice(0, 4)} •••• •••• ${ultimos4}`,
          expiry: expiracion,
          cardNetwork: franquicia,
        },
      });
    } else if (tipoSeleccionado === "pse") {
      if (!numeroDoc.trim() || !correoPse.trim()) {
        alert("Completa el número de documento y correo registrado en PSE.");
        return;
      }

      addPaymentMethod({
        type: "pse",
        label: "PSE",
        summary: `${banco} • ${tipoDoc} ${numeroDoc.trim()} (${tipoPersona})`,
        holderName: titular.trim(),
        isDefault: marcarPredeterminado,
        details: {
          bank: banco,
          personType: tipoPersona,
          docType: tipoDoc,
          docNumber: numeroDoc.trim(),
          email: correoPse.trim(),
        },
      });
    } else if (tipoSeleccionado === "nequi" || tipoSeleccionado === "daviplata") {
      const celLimpio = celular.replace(/\D/g, "");
      if (celLimpio.length < 10) {
        alert("Ingresa un número de celular válido de 10 dígitos.");
        return;
      }

      const nombrePlataforma = tipoSeleccionado === "nequi" ? "Nequi" : "Daviplata";
      addPaymentMethod({
        type: tipoSeleccionado,
        label: nombrePlataforma,
        summary: `Celular vinculado: ${celLimpio.slice(0, 3)} ${celLimpio.slice(3)}`,
        holderName: titular.trim(),
        isDefault: marcarPredeterminado,
        details: {
          phoneNumber: celLimpio,
        },
      });
    }

    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const getIcono = (type: PaymentType) => {
    switch (type) {
      case "tarjeta":
        return "💳";
      case "pse":
        return "🏦";
      case "nequi":
        return "📱";
      case "daviplata":
        return "📲";
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between p-6 border-b border-gray-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xl text-white hover:text-red-500 transition-colors cursor-pointer"
          >
            ←
          </button>
          <h1 className="text-lg font-bold">Métodos de pago</h1>
          <button
            type="button"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="text-red-600 font-bold text-2xl leading-none cursor-pointer"
            title={mostrarFormulario ? "Cerrar formulario" : "Agregar método de pago"}
          >
            {mostrarFormulario ? "✕" : "+"}
          </button>
        </header>

        <div className="p-6 flex flex-col gap-5">
          {/* Botón rápido para desplegar formulario si está cerrado */}
          {!mostrarFormulario && (
            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 border border-dashed border-red-600 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-red-500 text-lg">+</span>
              <span>Agregar nuevo método de pago</span>
            </button>
          )}

          {/* Formulario dinámico según el tipo elegido */}
          {mostrarFormulario && (
            <form
              onSubmit={handleGuardarMetodo}
              className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col gap-4 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-extrabold text-sm text-red-500 uppercase tracking-wide">
                  Configurar método de pago
                </h2>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {/* Selector de Tipo: Tarjeta / PSE / Nequi / Daviplata */}
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "tarjeta", nombre: "Tarjeta", icono: "💳" },
                    { id: "pse", nombre: "PSE", icono: "🏦" },
                    { id: "nequi", nombre: "Nequi", icono: "📱" },
                    { id: "daviplata", nombre: "Daviplata", icono: "📲" },
                  ] as const
                ).map((opcion) => {
                  const activo = tipoSeleccionado === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => setTipoSeleccionado(opcion.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        activo
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-black border-neutral-800 text-gray-300 hover:border-neutral-600"
                      }`}
                    >
                      <span>{opcion.icono}</span>
                      <span>{opcion.nombre}</span>
                    </button>
                  );
                })}
              </div>

              {/* Campo Titular (aplica para todos) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Nombre del titular
                </label>
                <input
                  type="text"
                  placeholder="Ej. Daniel Mendoza Vergara"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* CONFIGURACIÓN ESPECÍFICA: TARJETA CRÉDITO / DÉBITO */}
              {tipoSeleccionado === "tarjeta" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={numeroTarjeta}
                      onChange={(e) => setNumeroTarjeta(formatearTarjeta(e.target.value))}
                      className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600 tracking-wider"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Vencimiento (MM/AA)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="08/29"
                        value={expiracion}
                        onChange={(e) => setExpiracion(formatearExpiracion(e.target.value))}
                        className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Código CVV
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CONFIGURACIÓN ESPECÍFICA: PSE */}
              {tipoSeleccionado === "pse" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Banco
                    </label>
                    <select
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                      className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                    >
                      {BANCOS_COLOMBIA.map((b) => (
                        <option key={b} value={b} className="bg-black text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Tipo de persona
                      </label>
                      <select
                        value={tipoPersona}
                        onChange={(e) =>
                          setTipoPersona(e.target.value as "Natural" | "Jurídica")
                        }
                        className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                      >
                        <option value="Natural">Natural</option>
                        <option value="Jurídica">Jurídica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1">
                        Tipo documento
                      </label>
                      <select
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                      >
                        <option value="CC">C.C.</option>
                        <option value="CE">C.E.</option>
                        <option value="NIT">NIT</option>
                        <option value="TI">T.I.</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Número de documento
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej. 1105487965"
                      value={numeroDoc}
                      onChange={(e) => setNumeroDoc(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Correo electrónico PSE
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={correoPse}
                      onChange={(e) => setCorreoPse(e.target.value)}
                      className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600"
                      required
                    />
                  </div>
                </>
              )}

              {/* CONFIGURACIÓN ESPECÍFICA: NEQUI O DAVIPLATA */}
              {(tipoSeleccionado === "nequi" || tipoSeleccionado === "daviplata") && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Número de celular registrado en{" "}
                    {tipoSeleccionado === "nequi" ? "Nequi" : "Daviplata"}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="3001234567"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-red-600 tracking-wider"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Al pagar en el checkout recibirás la notificación push en este número.
                  </p>
                </div>
              )}

              {/* Checkbox para dejar como predeterminado */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={marcarPredeterminado}
                  onChange={(e) => setMarcarPredeterminado(e.target.checked)}
                  className="accent-red-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-gray-300 font-semibold">
                  Establecer como método de pago predeterminado
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-lg mt-1"
              >
                Guardar método de pago
              </button>
            </form>
          )}

          {/* Lista de métodos guardados */}
          <div className="flex flex-col gap-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Métodos guardados ({paymentMethods.length})
            </h2>

            {paymentMethods.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-sm">
                No tienes métodos de pago configurados.
              </p>
            ) : (
              paymentMethods.map((metodo) => (
                <div
                  key={metodo.id}
                  className={`bg-white text-black rounded-2xl p-4 shadow-md border-2 transition-all ${
                    metodo.isDefault ? "border-red-600" : "border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{getIcono(metodo.type)}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm">{metodo.label}</h3>
                          {metodo.isDefault && (
                            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">
                          {metodo.summary}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Titular: {metodo.holderName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePaymentMethod(metodo.id)}
                      className="text-gray-400 hover:text-red-600 text-sm p-1 cursor-pointer"
                      title="Eliminar método"
                    >
                      🗑️
                    </button>
                  </div>

                  {!metodo.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultPaymentMethod(metodo.id)}
                      className="mt-3 text-xs font-extrabold text-red-600 hover:underline cursor-pointer"
                    >
                      Usar como predeterminado
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
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