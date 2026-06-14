import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata = {
  title: "Residencial Montelima",
  description: "Reservas de espacios comunes — Residencial Montelima",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-ES" className={`${fraunces.variable} ${GeistSans.variable}`}>
      <body className="min-h-dvh bg-stone-100 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
