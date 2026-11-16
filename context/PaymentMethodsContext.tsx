"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type PaymentType = "tarjeta" | "pse" | "nequi" | "daviplata";

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;        // Ej: "Tarjeta Crédito/Débito", "PSE", "Nequi", "Daviplata"
  summary: string;      // Ej: "•••• 4589 • Exp 08/28" o "Cel: 316 8549845" o "Bancolombia • CC 1005..."
  holderName: string;
  isDefault: boolean;
  details: {
    // Tarjeta
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    cardNetwork?: string;
    // PSE
    bank?: string;
    personType?: "Natural" | "Jurídica";
    docType?: string;
    docNumber?: string;
    email?: string;
    // Nequi / Daviplata
    phoneNumber?: string;
  };
}

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethod[];
  selectedPayment: PaymentMethod | undefined;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => void;
  setDefaultPaymentMethod: (id: string) => void;
  deletePaymentMethod: (id: string) => void;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "tarjeta",
    label: "Tarjeta Crédito/Débito",
    summary: "Visa •••• 4589 • Vence 09/28",
    holderName: "Daniel Mendoza Vergara",
    isDefault: true,
    details: {
      cardNumber: "4532 •••• •••• 4589",
      expiry: "09/28",
      cardNetwork: "Visa",
    },
  },
];

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);

  useEffect(() => {
    const saved = localStorage.getItem("mis_metodos_pago");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPaymentMethods(parsed);
        }
      } catch (e) {
        console.error("Error al cargar métodos de pago:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mis_metodos_pago", JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const selectedPayment =
    paymentMethods.find((m) => m.isDefault) || paymentMethods[0];

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const addPaymentMethod = (newMethod: Omit<PaymentMethod, "id">) => {
    const id = "pm-" + Math.random().toString(36).substring(2, 9);
    setPaymentMethods((prev) => {
      const shouldBeDefault = newMethod.isDefault || prev.length === 0;
      const updated = shouldBeDefault
        ? prev.map((m) => ({ ...m, isDefault: false }))
        : prev;
      return [...updated, { ...newMethod, id, isDefault: shouldBeDefault }];
    });
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  return (
    <PaymentMethodsContext.Provider
      value={{
        paymentMethods,
        selectedPayment,
        addPaymentMethod,
        setDefaultPaymentMethod,
        deletePaymentMethod,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error("usePaymentMethods debe usarse dentro de un PaymentMethodsProvider");
  }
  return context;
};