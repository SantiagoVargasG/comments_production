import mongoose from 'mongoose';
import dns from 'node:dns';

// Algunos ISP no resuelven bien registros SRV con el resolutor DNS interno
// de Node (usado por mongodb+srv://); forzar un DNS público evita el
// ECONNREFUSED en la búsqueda SRV del cluster de Atlas en desarrollo local.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error('Falta la variable MONGODB_URI');
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
