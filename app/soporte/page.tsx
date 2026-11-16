"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface MensajeChat {
  id: string;
  remitente: "usuario" | "soporte";
  texto: string;
  hora: string;
}

interface TicketSoporte {
  id: string;
  asunto: string;
  pedidoRelacionado?: string;
  descripcion: string;
  fecha: string;
  estado: "Abierto" | "En revisión";
}

interface PedidoGuardado {
  id: string;
  fecha: string;
  total: number;
}

const FAQS = [
  {
    pregunta: "¿Cuánto tarda el envío de mi pedido?",
    respuesta:
      "El envío Estándar ($18.000 COP) tarda entre 3 y 5 días hábiles. El envío Express ($30.000 COP) llega en 1 a 2 días hábiles a nivel nacional.",
  },
  {
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta:
      "Aceptamos Tarjetas de Crédito/Débito (Visa, Mastercard), transferencias por PSE, Nequi y Daviplata. Puedes configurarlos en Perfil > Métodos de pago.",
  },
  {
    pregunta: "¿Los repuestos tienen garantía?",
    respuesta:
      "Sí. Todos nuestros aceites, baterías, neumáticos y rines cuentan con garantía oficial de fabricante de hasta 12 meses por defectos de fábrica.",
  },
  {
    pregunta: "¿Cómo sé si un rin o aceite es compatible con mi vehículo?",
    respuesta:
      "Escríbenos aquí en el chat el modelo, año y cilindraje de tu vehículo junto con el producto que te interesa y nuestro asesor técnico te confirma de inmediato.",
  },
];

function generarRespuestaAutomatica(textoUsuario: string, productoContexto?: string | null): string {
  const q = textoUsuario.toLowerCase();

  if (q.includes("envio") || q.includes("envío") || q.includes("demora") || q.includes("llega")) {
    return "🚚 Contamos con envío Estándar (3-5 días hábiles por $18.000) y Express (1-2 días hábiles por $30.000). Puedes elegir tu favorito en Configuración o al finalizar la compra.";
  }
  if (q.includes("pago") || q.includes("nequi") || q.includes("pse") || q.includes("tarjeta") || q.includes("daviplata")) {
    return "💳 Puedes pagar con Tarjeta Crédito/Débito, PSE, Nequi o Daviplata. Configura tu método predeterminado en Perfil > Métodos de pago.";
  }
  if (q.includes("garantia") || q.includes("garantía") || q.includes("devolucion") || q.includes("devolución")) {
    return "🛡️ Todos los productos en DriveZone son 100% originales y tienen garantía de fábrica. Si necesitas gestionar un cambio, abre un ticket en la pestaña 'Tickets'.";
  }
  if (q.includes("pedido") || q.includes("orden") || q.includes("rastreo")) {
    return "📦 Puedes revisar el estado actualizado de tus compras en Perfil > Mis pedidos. Si tienes algún inconveniente con una entrega, crea un ticket seleccionando tu número de orden.";
  }
  if (productoContexto || q.includes("aceite") || q.includes("rin") || q.includes("bateria") || q.includes("neumatico") || q.includes("stock") || q.includes("compatible")) {
    const ref = productoContexto ? ` sobre "${productoContexto}"` : "";
    return `🔧 ¡Claro! Respecto a tu consulta${ref}: contamos con despacho inmediato desde bodega y garantía certificada. Indícanos la marca y modelo de tu vehículo para validarte compatibilidad exacta.`;
  }

  return "👋 ¡Gracias por escribirnos a DriveZone! Un asesor técnico ya recibió tu mensaje. Si deseas seguimiento formal con número de radicado, también puedes crear un caso en la pestaña 'Tickets'.";
}

function SoporteContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productoQuery = searchParams.get("producto");

  const [tabActiva, setTabActiva] = useState<"chat" | "tickets" | "faq">("chat");

  // Estados Chat
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Estados Tickets
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [pedidosUsuario, setPedidosUsuario] = useState<PedidoGuardado[]>([]);
  const [asuntoTicket, setAsuntoTicket] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState("");
  const [descripcionTicket, setDescripcionTicket] = useState("");

  // Estado FAQ abierto
  const [faqAbierto, setFaqAbierto] = useState<number | null>(0);

  const obtenerHoraActual = () => {
    const ahora = new Date();
    return ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  // Cargar historial de chat, tickets y pedidos reales
  useEffect(() => {
    const chatGuardado = localStorage.getItem("drivezone_soporte_chat");
    let historial: MensajeChat[] = [];

    if (chatGuardado) {
      try {
        historial = JSON.parse(chatGuardado);
      } catch {
        historial = [];
      }
    }

    if (historial.length === 0) {
      historial = [
        {
          id: "msg-welcome",
          remitente: "soporte",
          texto: "¡Hola! Bienvenido al soporte oficial de DriveZone 🏎️. ¿En qué repuesto o pedido te podemos ayudar hoy?",
          hora: obtenerHoraActual(),
        },
      ];
    }

    // Si viene desde un producto específico (botón 💬 en detalle de producto)
    if (productoQuery) {
      const yaMencionado = historial.some((m) => m.texto.includes(productoQuery));
      if (!yaMencionado) {
        historial = [
          ...historial,
          {
            id: "msg-prod-" + Date.now(),
            remitente: "soporte",
            texto: `Vemos que estás consultando por: "${productoQuery}". Escríbenos tu duda sobre compatibilidad, envío o garantía de este producto.`,
            hora: obtenerHoraActual(),
          },
        ];
      }
    }

    setMensajes(historial);

    const ticketsGuardados = localStorage.getItem("drivezone_soporte_tickets");
    if (ticketsGuardados) {
      try {
        setTickets(JSON.parse(ticketsGuardados));
      } catch {
        setTickets([]);
      }
    }

    const pedidosGuardados = localStorage.getItem("mis_pedidos");
    if (pedidosGuardados) {
      try {
        setPedidosUsuario(JSON.parse(pedidosGuardados));
      } catch {
        setPedidosUsuario([]);
      }
    }
  }, [productoQuery]);

  // Guardar chat automáticamente
  useEffect(() => {
    if (mensajes.length > 0) {
      localStorage.setItem("drivezone_soporte_chat", JSON.stringify(mensajes));
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  const handleEnviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensaje.trim()) return;

    const textoLimpio = inputMensaje.trim();
    const nuevoMsgUsuario: MensajeChat = {
      id: "u-" + Date.now(),
      remitente: "usuario",
      texto: textoLimpio,
      hora: obtenerHoraActual(),
    };

    setMensajes((prev) => [...prev, nuevoMsgUsuario]);
    setInputMensaje("");

    setTimeout(() => {
      const respuestaSoporte: MensajeChat = {
        id: "s-" + Date.now(),
        remitente: "soporte",
        texto: generarRespuestaAutomatica(textoLimpio, productoQuery),
        hora: obtenerHoraActual(),
      };
      setMensajes((prev) => [...prev, respuestaSoporte]);
    }, 500);
  };

  const handleCrearTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asuntoTicket.trim() || !descripcionTicket.trim()) {
      alert("Por favor completa el asunto y la descripción de tu solicitud.");
      return;
    }

    const nuevoTicket: TicketSoporte = {
      id: "DZ-" + Math.floor(1000 + Math.random() * 9000),
      asunto: asuntoTicket.trim(),
      pedidoRelacionado: pedidoSeleccionado || undefined,
      descripcion: descripcionTicket.trim(),
      fecha: new Date().toLocaleDateString("es-CO"),
      estado: "Abierto",
    };

    const actualizados = [nuevoTicket, ...tickets];
    setTickets(actualizados);
    localStorage.setItem("drivezone_soporte_tickets", JSON.stringify(actualizados));

    setAsuntoTicket("");
    setPedidoSeleccionado("");
    setDescripcionTicket("");
    alert(`✅ Ticket ${nuevoTicket.id} creado correctamente. Nuestro equipo te responderá pronto.`);
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 flex flex-col">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur-md z-40">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xl text-white hover:text-red-500 transition-colors cursor-pointer"
          >
            ←
          </button>
          <div className="text-center">
            <h1 className="text-lg font-extrabold">Atención al cliente</h1>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Asesoría en línea 24/7
            </span>
          </div>
          <div className="w-6" />
        </header>

        {/* Pestañas de navegación internas */}
        <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-950">
          <button
            type="button"
            onClick={() => setTabActiva("chat")}
            className={`py-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
              tabActiva === "chat"
                ? "border-red-600 text-red-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            💬 Chat directo
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("tickets")}
            className={`py-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
              tabActiva === "tickets"
                ? "border-red-600 text-red-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            🎫 Tickets ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("faq")}
            className={`py-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
              tabActiva === "faq"
                ? "border-red-600 text-red-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            ❓ Ayuda / FAQ
          </button>
        </div>

        {/* PESTAÑA 1: CHAT EN VIVO */}
        {tabActiva === "chat" && (
          <div className="flex-1 flex flex-col justify-between p-4">
            {/* Etiqueta de producto si viene desde detalle */}
            {productoQuery && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 mb-3 flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">
                  Producto: <strong className="text-white">{productoQuery}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => router.replace("/soporte")}
                  className="text-red-500 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Mensajes */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[54vh] pr-1">
              {mensajes.map((msg) => {
                const esUsuario = msg.remitente === "usuario";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[82%] ${
                      esUsuario ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow ${
                        esUsuario
                          ? "bg-red-600 text-white rounded-br-sm"
                          : "bg-neutral-900 border border-neutral-800 text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.texto}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                      {esUsuario ? "Tú" : "Soporte DriveZone"} • {msg.hora}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Sugerencias rápidas */}
            <div className="flex gap-2 overflow-x-auto py-2.5 mt-2 scrollbar-hide">
              {["Tiempo de envío", "Métodos de pago", "Garantía", "Compatibilidad"].map(
                (sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => setInputMensaje(sugerencia)}
                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-semibold text-gray-200 px-3 py-1.5 rounded-full shrink-0 cursor-pointer"
                  >
                    {sugerencia}
                  </button>
                )
              )}
            </div>

            {/* Caja de envío */}
            <form onSubmit={handleEnviarMensaje} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={inputMensaje}
                onChange={(e) => setInputMensaje(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
              >
                Enviar
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA 2: TICKETS / PQRS */}
        {tabActiva === "tickets" && (
          <div className="p-5 flex flex-col gap-5">
            <form
              onSubmit={handleCrearTicket}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3.5"
            >
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500">
                Crear solicitud de soporte
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Consulta de garantía o cambio de repuesto"
                  value={asuntoTicket}
                  onChange={(e) => setAsuntoTicket(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-xs text-white outline-none focus:border-red-600"
                  required
                />
              </div>

              {pedidosUsuario.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Pedido relacionado (opcional)
                  </label>
                  <select
                    value={pedidoSeleccionado}
                    onChange={(e) => setPedidoSeleccionado(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-xs text-white outline-none focus:border-red-600"
                  >
                    <option value="">Ninguno / Consulta general</option>
                    {pedidosUsuario.map((ped) => (
                      <option key={ped.id} value={ped.id}>
                        Pedido #{ped.id} ({ped.fecha} - ${ped.total?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Descripción detallada
                </label>
                <textarea
                  rows={3}
                  placeholder="Cuéntanos qué ocurrió o qué necesitas..."
                  value={descripcionTicket}
                  onChange={(e) => setDescripcionTicket(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 rounded-xl text-xs text-white outline-none focus:border-red-600 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Radicar ticket de soporte
              </button>
            </form>

            {/* Historial de tickets */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Mis tickets radicados ({tickets.length})
              </h3>

              {tickets.length === 0 ? (
                <p className="text-center text-gray-500 text-xs py-6">
                  Aún no has creado ningún ticket de soporte.
                </p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white text-black rounded-2xl p-4 shadow-md flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-red-600">{t.id}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {t.estado}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm">{t.asunto}</h4>
                    {t.pedidoRelacionado && (
                      <p className="text-[11px] font-semibold text-gray-600">
                        Pedido asociado: #{t.pedidoRelacionado}
                      </p>
                    )}
                    <p className="text-xs text-gray-700">{t.descripcion}</p>
                    <span className="text-[10px] text-gray-400 mt-1">
                      Radicado el {t.fecha}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: PREGUNTAS FRECUENTES */}
        {tabActiva === "faq" && (
          <div className="p-5 flex flex-col gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500 mb-1">
              Preguntas frecuentes
            </h2>

            {FAQS.map((item, idx) => {
              const abierto = faqAbierto === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setFaqAbierto(abierto ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white">{item.pregunta}</span>
                    <span className="text-red-500 font-bold text-sm shrink-0">
                      {abierto ? "−" : "+"}
                    </span>
                  </button>
                  {abierto && (
                    <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed border-t border-neutral-900 pt-3">
                      {item.respuesta}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mt-2 text-center">
              <p className="text-xs font-bold text-white">¿Sigues con dudas?</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Línea directa Cali / Nacional: <strong className="text-white">+57 316 854 9845</strong>
              </p>
              <p className="text-[11px] text-gray-400">
                Correo: <strong className="text-white">soporte@drivezone.com</strong>
              </p>
            </div>
          </div>
        )}

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

export default function SoportePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Cargando atención al cliente...
        </div>
      }
    >
      <SoporteContenido />
    </Suspense>
  );
}