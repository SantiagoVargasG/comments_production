import mongoose from 'mongoose';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from './constants';

const { Schema, models, model } = mongoose;

const UserSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, enum: ['tech', 'cliente'], default: 'cliente' },
  },
  { timestamps: true }
);

const EvidenciaSchema = new Schema(
  {
    url: String,
    tipo: { type: String, enum: ['imagen', 'video'] },
    nombre: String,
  },
  { _id: false }
);

const ComentarioSchema = new Schema(
  {
    texto: { type: String, required: true },
    autorNombre: String,
    autorRol: { type: String, enum: ['tech', 'cliente'] },
    evidencias: [EvidenciaSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ReportSchema = new Schema(
  {
    modulo: { type: String, enum: ['loopzii', 'gofixii'], required: true, index: true },
    consecutivo: { type: Number },
    descripcion: { type: String, required: true },
    tipo: { type: String, enum: TIPOS, default: 'Error' },
    prioridad: { type: String, enum: [...PRIORIDADES, null], default: null },
    estado: { type: String, enum: [...ESTADOS, null], default: null },
    ambiente: { type: String, enum: AMBIENTES, default: 'Pendiente' },
    version: { type: String, default: '' },
    evidencias: [EvidenciaSchema],
    comentarios: [ComentarioSchema],
    creadoPorRol: { type: String, enum: ['tech', 'cliente'], default: 'tech' },
    creadoPorNombre: String,
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);
export const Report = models.Report || model('Report', ReportSchema);
