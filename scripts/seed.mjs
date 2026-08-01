// Crea el primer usuario tech e importa los reportes del Excel.
// Uso: node scripts/seed.mjs   (requiere .env.local con MONGODB_URI)
import { config } from 'dotenv';
config({ path: '.env.local' });
import dns from 'node:dns';
// Algunos ISP no resuelven bien registros SRV con el resolutor DNS interno
// de Node (usado por mongodb+srv://); forzar un DNS público evita el
// ECONNREFUSED en la búsqueda SRV del cluster de Atlas.
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'));

const ADMIN = {
  nombre: process.env.ADMIN_NOMBRE || 'Santi',
  correo: (process.env.ADMIN_EMAIL || 'admin@tuempresa.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'cambiar123',
};

const UserSchema = new mongoose.Schema(
  { nombre: String, correo: { type: String, unique: true }, passwordHash: String, rol: String },
  { timestamps: true }
);
const ReportSchema = new mongoose.Schema(
  {
    modulo: String, consecutivo: Number, descripcion: String, tipo: String,
    prioridad: { type: String, default: null }, estado: { type: String, default: null },
    ambiente: { type: String, default: 'Pendiente' }, version: { type: String, default: '' },
    evidencias: Array, comentarios: Array, creadoPorRol: String, creadoPorNombre: String,
  },
  { timestamps: true }
);
const CounterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

async function run() {
  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI en .env');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  // admin tech
  let admin = await User.findOne({ correo: ADMIN.correo });
  if (!admin) {
    admin = await User.create({
      nombre: ADMIN.nombre, correo: ADMIN.correo,
      passwordHash: await bcrypt.hash(ADMIN.password, 10), rol: 'tech',
    });
    console.log(`Usuario tech creado: ${ADMIN.correo} / ${ADMIN.password}`);
  } else {
    console.log(`Usuario tech ya existía: ${ADMIN.correo}`);
  }

  // reportes (solo si la colección está vacía)
  const total = await Report.countDocuments();
  if (total === 0) {
    const counters = {};
    const docs = data.map(({ creadoPor, ...d }) => {
      counters[d.modulo] = (counters[d.modulo] || 0) + 1;
      return {
        ...d, consecutivo: counters[d.modulo],
        evidencias: [], comentarios: [],
        creadoPorRol: creadoPor === 'cliente' ? 'cliente' : 'tech',
        creadoPorNombre: ADMIN.nombre,
      };
    });
    await Report.insertMany(docs);
    // La app usa un contador atómico por módulo (lib/models.js) para futuros
    // reportes; lo dejamos en el último consecutivo importado por módulo.
    await Promise.all(
      Object.entries(counters).map(([modulo, seq]) =>
        Counter.findByIdAndUpdate(modulo, { $set: { seq } }, { upsert: true })
      )
    );
    console.log(`Importados ${docs.length} reportes desde el Excel.`);
  } else {
    console.log(`Ya hay ${total} reportes, no se importa nada.`);
  }

  await mongoose.disconnect();
  console.log('Listo.');
}
run().catch((e) => { console.error(e); process.exit(1); });
