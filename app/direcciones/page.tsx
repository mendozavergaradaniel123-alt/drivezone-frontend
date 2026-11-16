"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAddresses } from "../../context/AddressesContext";

export default function DireccionesPage() {
  const router = useRouter();
  const { addresses, setDefaultAddress, deleteAddress, addAddress } = useAddresses();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [phone, setPhone] = useState("");

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !name || !street || !phone) {
      alert("Por favor completa todos los campos.");
      return;
    }
    addAddress({
      title,
      name,
      street,
      phone,
      isDefault: addresses.length === 0
    });
    setTitle("");
    setName("");
    setStreet("");
    setPhone("");
    setMostrarFormulario(false);
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center">
      <main className="bg-black w-full max-w-md min-h-screen text-white pb-24 font-sans relative shadow-2xl border-x border-gray-800 overflow-y-auto">
        
        <header className="flex items-center justify-between p-6 border-b border-gray-800">
          <button onClick={() => router.back()} className="text-xl text-white">←</button>
          <h1 className="text-lg font-bold">Mis direcciones</h1>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="text-red-600 font-bold text-xl">
            {mostrarFormulario ? "✕" : "+"}
          </button>
        </header>

        <div className="p-6 flex flex-col gap-4">
          
          {mostrarFormulario && (
            <form onSubmit={handleGuardar} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col gap-3 mb-4">
              <h3 className="font-bold text-sm text-red-500">Nueva dirección</h3>
              <input type="text" placeholder="Alias (Ej. Casa, Oficina)" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black border border-neutral-700 p-2.5 rounded-lg text-sm text-white outline-none" />
              <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} className="bg-black border border-neutral-700 p-2.5 rounded-lg text-sm text-white outline-none" />
              <input type="text" placeholder="Dirección (Calle, número)" value={street} onChange={(e) => setStreet(e.target.value)} className="bg-black border border-neutral-700 p-2.5 rounded-lg text-sm text-white outline-none" />
              <input type="text" placeholder="Teléfono de contacto" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black border border-neutral-700 p-2.5 rounded-lg text-sm text-white outline-none" />
              <button type="submit" className="bg-red-600 hover:bg-red-700 font-bold py-2.5 rounded-lg text-sm transition-colors mt-2">Guardar dirección</button>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No tienes direcciones guardadas.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className={`bg-white text-black rounded-xl p-4 shadow-md relative border-2 ${addr.isDefault ? 'border-red-600' : 'border-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-extrabold text-sm">{addr.title} {addr.isDefault && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full ml-2">Predeterminada</span>}</h3>
                  <button onClick={() => deleteAddress(addr.id)} className="text-gray-400 hover:text-red-600 text-xs">🗑️</button>
                </div>
                <p className="text-sm font-medium">{addr.name}</p>
                <p className="text-sm text-gray-700">{addr.street}</p>
                <p className="text-sm text-gray-700">Tel: {addr.phone}</p>

                {!addr.isDefault && (
                  <button onClick={() => setDefaultAddress(addr.id)} className="mt-3 text-xs font-bold text-red-600 hover:underline">
                    Establecer como principal
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-gray-800 flex justify-around p-4 z-50">
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600"><span className="text-xl">🏠</span><span className="text-[10px] mt-1">Inicio</span></Link>
          <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-red-600"><span className="text-xl">🗂️</span><span className="text-[10px] mt-1">Categorías</span></Link>
          <Link href="/perfil" className="flex flex-col items-center text-red-600"><span className="text-xl">👤</span><span className="text-[10px] mt-1">Cuenta</span></Link>
        </nav>

      </main>
    </div>
  );
}