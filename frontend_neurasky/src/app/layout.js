import "./globals.css";
import { Toaster } from "./components/ui/sonner";

export const metadata = {
  title: "NeuraSky",
  description: "Flight Analytics Dashboard",
  icons: {
    icon: "/NeuraSky.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
