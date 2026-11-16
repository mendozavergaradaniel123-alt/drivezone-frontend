"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AppSettings {
  notificacionesPedidos: boolean;
  notificacionesOfertas: boolean;
  modoPrivacidad: boolean;
  envioPreferido: "estandar" | "express";
  confirmarAgregarCarrito: boolean;
  guardarHistorialBusqueda: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificacionesPedidos: true,
  notificacionesOfertas: true,
  modoPrivacidad: false,
  envioPreferido: "estandar",
  confirmarAgregarCarrito: true,
  guardarHistorialBusqueda: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("drivezone_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Error al cargar configuración:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("drivezone_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("drivezone_settings", JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de un SettingsProvider");
  }
  return context;
};