'use client';
import { useEffect, useState } from 'react';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'cliente' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [edit, setEdit] = useState({ nombre: '', rol: 'cliente', password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function cargar() {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  }
  useEffect(() => { cargar(); }, []);

  async function crear() {
    setMsg(''); setError('');
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) { setMsg('Usuario creado.'); setForm({ nombre: '', correo: '', password: '', rol: 'cliente' }); cargar(); }
    else { const d = await res.json(); setError(d.error || 'Error'); }
  }

  function empezarEdicion(u) {
    setError(''); setEditandoId(u._id); setEdit({ nombre: u.nombre, rol: u.rol, password: '' });
  }

  async function guardarEdicion(id) {
    setError('');
    const payload = { nombre: edit.nombre, rol: edit.rol };
    if (edit.password) payload.password = edit.password;
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { setEditandoId(null); cargar(); }
    else { const d = await res.json(); setError(d.error || 'No se pudo actualizar'); }
  }

  async function eliminar(u) {
    setError('');
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/users/${u._id}`, { method: 'DELETE' });
    if (res.ok) cargar();
    else { const d = await res.json(); setError(d.error || 'No se pudo eliminar'); }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold mb-4">Usuarios</h1>
      <div className="card p-5 mb-6">
        <div className="text-sm font-medium mb-3">Registrar nuevo usuario</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Nombre</label><input className="input" value={form.nombre} onChange={set('nombre')} /></div>
          <div><label className="label">Correo</label><input className="input" type="email" value={form.correo} onChange={set('correo')} /></div>
          <div><label className="label">Contraseña</label><input className="input" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
          <div><label className="label">Rol</label>
            <select className="input" value={form.rol} onChange={set('rol')}>
              <option value="cliente">Cliente</option>
              <option value="tech">Tech</option>
            </select>
          </div>
        </div>
        {msg && <p className="text-sm text-emerald-600 mt-3">{msg}</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex justify-end mt-4"><button className="btn-primary" onClick={crear}>Crear usuario</button></div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Correo</th>
              <th className="px-3 py-2 font-medium">Rol</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id} className="align-top">
                {editandoId === u._id ? (
                  <>
                    <td className="px-3 py-2">
                      <input className="input" value={edit.nombre} onChange={(e) => setEdit((f) => ({ ...f, nombre: e.target.value }))} />
                    </td>
                    <td className="px-3 py-2 text-slate-500">{u.correo}</td>
                    <td className="px-3 py-2">
                      <select className="input" value={edit.rol} onChange={(e) => setEdit((f) => ({ ...f, rol: e.target.value }))}>
                        <option value="cliente">Cliente</option>
                        <option value="tech">Tech</option>
                      </select>
                      <input
                        className="input mt-2" type="password" placeholder="Nueva contraseña (opcional)"
                        autoComplete="new-password" value={edit.password}
                        onChange={(e) => setEdit((f) => ({ ...f, password: e.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button className="btn-primary py-1 px-2 text-xs mr-2" onClick={() => guardarEdicion(u._id)}>Guardar</button>
                      <button className="btn-ghost py-1 px-2 text-xs" onClick={() => setEditandoId(null)}>Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{u.nombre}</td>
                    <td className="px-3 py-2 text-slate-500">{u.correo}</td>
                    <td className="px-3 py-2"><span className={`badge ${u.rol === 'tech' ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600'}`}>{u.rol}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button className="btn-ghost py-1 px-2 text-xs mr-2" onClick={() => empezarEdicion(u)}>Editar</button>
                      <button className="btn-ghost py-1 px-2 text-xs text-red-600" onClick={() => eliminar(u)}>Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
