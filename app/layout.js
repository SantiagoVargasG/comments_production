import './globals.css';

export const metadata = {
  title: 'Comentarios de producción',
  description: 'Seguimiento de reportes, mejoras y errores por módulo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
