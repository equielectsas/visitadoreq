import "./globals.css";
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: "VISITAS EQ",
  description: "Gestión de visitas equielect",
};

const themeInitScript = `(function(){try{var k='equielect_theme';var t=localStorage.getItem(k);if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f6f8fb] text-gray-900 antialiased transition-colors duration-200 dark:bg-[var(--eq-page-bg)] dark:text-[var(--eq-text)]">
        {children}
      </body>
    </html>
  );
}