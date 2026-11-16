import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { AddressesProvider } from "../context/AddressesContext";
import { PaymentMethodsProvider } from "../context/PaymentMethodsContext";
import { SettingsProvider } from "../context/SettingsContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SettingsProvider>
          <CartProvider>
            <FavoritesProvider>
              <AddressesProvider>
                <PaymentMethodsProvider>
                  {children}
                </PaymentMethodsProvider>
              </AddressesProvider>
            </FavoritesProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
