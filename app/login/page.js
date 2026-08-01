'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    setCargando(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'No se pudo iniciar sesión');
      return;
    }
    router.push('/modulos');
    router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center bg-panel px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6">
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Seguimiento</div>
          <h1 className="text-xl font-semibold mt-1">Comentarios de producción</h1>
        </div>
        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="label">Correo</label>
            <input className="input" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={cargando}>
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-6">
          El registro de usuarios lo realiza el equipo tech.
        </p>
      </div>
    </div>
  );
}
