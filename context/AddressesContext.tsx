"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Address {
  id: string;
  title: string;      // Ej: "Casa", "Trabajo"
  name: string;       // Ej: "Daniel Mendoza Vergara"
  street: string;     // Ej: "Calle ef349r89249"
  phone: string;      // Ej: "316 8549845"
  isDefault: boolean;
}

interface AddressesContextType {
  addresses: Address[];
  selectedAddress: Address;
  addAddress: (newAddress: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
  deleteAddress: (id: string) => void;
}

const AddressesContext = createContext<AddressesContextType | undefined>(undefined);

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      title: "Casa",
      name: "Daniel Mendoza Vergara",
      street: "Calle ef349r89249",
      phone: "316 8549845",
      isDefault: true,
    },
    {
      id: "2",
      title: "Trabajo",
      name: "Daniel Mendoza Vergara",
      street: "Av. de las Américas #5N-34",
      phone: "316 8549845",
      isDefault: false,
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("mis_direcciones");
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar direcciones", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mis_direcciones", JSON.stringify(addresses));
  }, [addresses]);

  const selectedAddress = addresses.find((addr) => addr.isDefault) || addresses[0];

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAddresses((prev) => {
      // Si la nueva es por defecto, desmarcamos las demás
      const updated = newAddr.isDefault 
        ? prev.map(a => ({ ...a, isDefault: false })) 
        : prev;
      return [...updated, { ...newAddr, id }];
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // Si borramos la por defecto y quedan elementos, hacemos que la primera sea por defecto
      if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  return (
    <AddressesContext.Provider value={{ addresses, selectedAddress, addAddress, setDefaultAddress, deleteAddress }}>
      {children}
    </AddressesContext.Provider>
  );
}

export const useAddresses = () => {
  const context = useContext(AddressesContext);
  if (!context) throw new Error("useAddresses debe usarse dentro de un AddressesProvider");
  return context;
};