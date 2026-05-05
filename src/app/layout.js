import "./globals.css";
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: "VISITAS EQ",
  description: "Gestión de visitas equielect",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f6f8fb]">
        {children}
      </body>
    </html>
  );
}