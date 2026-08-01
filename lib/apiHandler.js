import { NextResponse } from 'next/server';

// Envuelve un route handler para que cualquier excepción no capturada
// (fallo de conexión a Mongo, error inesperado, etc.) responda JSON
// en vez de dejar que Next devuelva una página de error no-JSON,
// ya que el frontend siempre espera poder hacer res.json().
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  };
}
