/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que Next confunda la raíz del workspace por un lockfile ajeno
  // en una carpeta superior (ej. C:\Users\<usuario>\package-lock.json).
  turbopack: { root: __dirname },
};
module.exports = nextConfig;
