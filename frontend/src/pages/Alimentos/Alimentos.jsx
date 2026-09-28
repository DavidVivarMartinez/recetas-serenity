import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronUp, ChevronDown, X, Apple } from 'lucide-react';
import { alimentosApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/formularios.css';
import './Alimentos.css';

const COLUMNAS = [
  { campo: 'calorias', etiqueta: 'kcal', decimales: 0 },
  { campo: 'proteinas', etiqueta: 'Proteínas', decimales: 1 },
  { campo: 'carbohidratos', etiqueta: 'Carbohidratos', decimales: 1 },
  { campo: 'grasas', etiqueta: 'Grasas', decimales: 1 },
  { campo: 'grasasSaturadas', etiqueta: 'Saturadas', decimales: 1, ordenable: false },
  { campo: 'fibra', etiqueta: 'Fibra', decimales: 1 },
  { campo: 'azucares', etiqueta: 'Azúcares', decimales: 1, ordenable: false },
  { campo: 'sal', etiqueta: 'Sal', decimales: 2, ordenable: false },
];

const LIMITE = 50;

const fmt = (v, d = 1) => (v === null || v === undefined ? '—' : Number(v).toFixed(d).replace('.', ','));

function FormularioAlimento({ categorias, onCreado, onCerrar }) {
  const [form, setForm] = useState({
    nombre: '', categoria: categorias[0]?.nombre ?? '', unidadBase: 'g',
    calorias: '', proteinas: '', carbohidratos: '', grasas: '',
    grasasSaturadas: '', fibra: '', azucares: '', sal: '',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const creado = await alimentosApi.crear(form);
      onCreado(creado);
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  };

  const numerico = (name, etiqueta, requerido = false) => (
    <div className="form-group" key={name}>
      <label className="form-label" htmlFor={`al-${name}`}>{etiqueta}{requerido ? ' *' : ''}</label>
      <input id={`al-${name}`} className="form-input" name={name} type="number" min={0} step="any" value={form[name]} onChange={cambiar} required={requerido} />
    </div>
  );

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <form className="modal" onSubmit={enviar}>
        <div className="modal-cabecera">
          <h3>Añadir alimento</h3>
          <button type="button" className="btn btn-ghost btn-icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>Valores por 100 g o 100 ml del alimento.</p>
        {error && (
          <div className="alerta alerta-error">
            {error.message}
            {error.detalles?.length > 0 && <ul>{error.detalles.map((d, i) => <li key={i}>{d.campo}: {d.mensaje}</li>)}</ul>}
          </div>
        )}
        <div className="form-grid">
          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="al-nombre">Nombre *</label>
            <input id="al-nombre" className="form-input" name="nombre" value={form.nombre} onChange={cambiar} required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="al-categoria">Categoría *</label>
            <select id="al-categoria" className="form-select" name="categoria" value={form.categoria} onChange={cambiar}>
              {categorias.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="al-unidad">Unidad base</label>
            <select id="al-unidad" className="form-select" name="unidadBase" value={form.unidadBase} onChange={cambiar}>
              <option value="g">gramos (g)</option>
              <option value="ml">mililitros (ml)</option>
            </select>
          </div>
          {numerico('calorias', 'Calorías (kcal)', true)}
          {numerico('proteinas', 'Proteínas (g)', true)}
          {numerico('carbohidratos', 'Carbohidratos (g)', true)}
          {numerico('grasas', 'Grasas (g)', true)}
          {numerico('grasasSaturadas', 'Grasas saturadas (g)')}
          {numerico('fibra', 'Fibra (g)')}
          {numerico('azucares', 'Azúcares (g)')}
          {numerico('sal', 'Sal (g)')}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar alimento'}</button>
          <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function DetalleAlimento({ id, onCerrar }) {
  const [alimento, setAlimento] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    alimentosApi.obtener(id).then((a) => activo && setAlimento(a)).catch((e) => activo && setError(e));
    return () => { activo = false; };
  }, [id]);

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-cabecera">
          <h3>{alimento?.nombre ?? 'Alimento'}</h3>
          <button type="button" className="btn btn-ghost btn-icono" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        {error && <div className="alerta alerta-error">{error.message}</div>}
        {!alimento && !error && <p className="form-hint">Cargando…</p>}
        {alimento && (
          <>
            <p className="alimento-detalle__categoria">{alimento.categoria} · valores por 100 {alimento.unidadBase}</p>
            <dl className="alimento-detalle__grid">
              <div><dt>Calorías</dt><dd>{fmt(alimento.calorias, 0)} kcal</dd></div>
              <div><dt>Proteínas</dt><dd>{fmt(alimento.proteinas)} g</dd></div>
              <div><dt>Carbohidratos</dt><dd>{fmt(alimento.carbohidratos)} g</dd></div>
              <div><dt>Grasas</dt><dd>{fmt(alimento.grasas)} g</dd></div>
              <div><dt>Saturadas</dt><dd>{fmt(alimento.grasasSaturadas)} g</dd></div>
              <div><dt>Fibra</dt><dd>{fmt(alimento.fibra)} g</dd></div>
              <div><dt>Azúcares</dt><dd>{fmt(alimento.azucares)} g</dd></div>
              <div><dt>Sal</dt><dd>{fmt(alimento.sal, 2)} g</dd></div>
            </dl>
            <h4 className="alimento-detalle__subtitulo">
              {alimento.recetas.length ? `Recetas que lo usan (${alimento.numRecetas})` : 'Ninguna receta usa este alimento todavía'}
            </h4>
            {alimento.recetas.length > 0 && (
              <ul className="alimento-detalle__recetas">
                {alimento.recetas.map((r) => (
                  <li key={r.id}>
                    <Link to={`/receta/${r.id}`} onClick={onCerrar}>
                      {r.imagenUrl && <img src={r.imagenUrl} alt="" />}
                      <span>{r.titulo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Alimentos() {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoria = searchParams.get('categoria') ?? 'all';
  const orden = searchParams.get('orden') ?? 'nombre';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);

  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [qBusqueda, setQBusqueda] = useState(q);
  const [categorias, setCategorias] = useState([]);
  const [resultado, setResultado] = useState({ datos: [], total: 0, totalPaginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    alimentosApi.categorias().then(setCategorias).catch(() => {});
  }, []);

  // Búsqueda con retardo
  useEffect(() => {
    const t = setTimeout(() => setQBusqueda(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Reflejar la búsqueda en la URL (y volver a la página 1)
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (qBusqueda) p.set('q', qBusqueda);
        else p.delete('q');
        if ((prev.get('q') ?? '') !== qBusqueda) p.delete('page');
        return p;
      },
      { replace: true },
    );
  }, [qBusqueda, setSearchParams]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    alimentosApi
      .listar({ q: qBusqueda, categoria, orden, page, limit: LIMITE })
      .then((r) => activo && setResultado(r))
      .catch((e) => activo && setError(e))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [qBusqueda, categoria, orden, page]);

  const cambiarParam = (cambios) =>
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(cambios).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '' || v === 'all' || (k === 'page' && Number(v) === 1)) p.delete(k);
        else p.set(k, String(v));
      });
      return p;
    });

  const ordenarPor = (campo) => cambiarParam({ orden: orden === campo ? `-${campo}` : campo, page: 1 });
  const iconoOrden = (campo) => {
    if (orden === campo) return <ChevronUp size={14} />;
    if (orden === `-${campo}`) return <ChevronDown size={14} />;
    return null;
  };

  const alCrear = (creado) => {
    setMostrarForm(false);
    setAviso(`"${creado.nombre}" añadido a la tabla de alimentos.`);
    setQ(creado.nombre);
    alimentosApi.categorias().then(setCategorias).catch(() => {});
    setTimeout(() => setAviso(null), 4000);
  };

  const inicio = (page - 1) * LIMITE + 1;
  const fin = Math.min(page * LIMITE, resultado.total);

  return (
    <div className="alimentos-page">
      <header className="alimentos-cabecera">
        <div className="pagina-ancha alimentos-cabecera__inner">
          <div>
            <h1 className="alimentos-titulo"><Apple size={30} /> Tabla de alimentos</h1>
            <p className="alimentos-subtitulo">
              Valores nutricionales por 100 g o 100 ml. Enlaza estos alimentos a los ingredientes de tus recetas para
              calcular su información nutricional.
            </p>
          </div>
          {usuario ? (
            <button type="button" className="btn btn-primary" onClick={() => setMostrarForm(true)}><Plus size={18} /> Añadir alimento</button>
          ) : (
            <Link to="/login" state={{ desde: '/alimentos' }} className="btn btn-secondary">Inicia sesión para añadir alimentos</Link>
          )}
        </div>
      </header>

      <div className="pagina-ancha">
        {aviso && <div className="alerta alerta-ok">{aviso}</div>}

        <div className="alimentos-filtros">
          <div className="alimentos-buscador">
            <Search size={18} />
            <input
              className="form-input"
              placeholder="Buscar alimento…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar alimento"
            />
            {q && <button type="button" className="alimentos-buscador__limpiar" onClick={() => setQ('')} aria-label="Limpiar búsqueda"><X size={16} /></button>}
          </div>
          <select className="form-select alimentos-categoria" value={categoria} onChange={(e) => cambiarParam({ categoria: e.target.value, page: 1 })} aria-label="Categoría">
            <option value="all">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.total})</option>
            ))}
          </select>
        </div>

        {error && <div className="alerta alerta-error">{error.message}</div>}

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th><button type="button" className={orden.endsWith('nombre') ? 'activo' : ''} onClick={() => ordenarPor('nombre')}>Alimento {iconoOrden('nombre')}</button></th>
                <th>Categoría</th>
                {COLUMNAS.map((c) => (
                  <th key={c.campo} className="num">
                    {c.ordenable === false ? (
                      c.etiqueta
                    ) : (
                      <button type="button" className={orden.endsWith(c.campo) ? 'activo' : ''} onClick={() => ordenarPor(c.campo)}>{c.etiqueta} {iconoOrden(c.campo)}</button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando && resultado.datos.length === 0 && (
                <tr><td colSpan={2 + COLUMNAS.length} className="suave" style={{ textAlign: 'center', cursor: 'default' }}>Cargando…</td></tr>
              )}
              {!cargando && resultado.datos.length === 0 && (
                <tr><td colSpan={2 + COLUMNAS.length} className="suave" style={{ textAlign: 'center', cursor: 'default' }}>No hay alimentos que coincidan.</td></tr>
              )}
              {resultado.datos.map((a) => (
                <tr key={a.id} onClick={() => setDetalleId(a.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setDetalleId(a.id)}>
                  <td className="principal">{a.nombre} <span className="alimentos-unidad">/100 {a.unidadBase}</span></td>
                  <td className="suave">{a.categoria}</td>
                  {COLUMNAS.map((c) => (
                    <td key={c.campo} className="num">{fmt(a[c.campo], c.decimales)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="paginacion">
          <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => cambiarParam({ page: page - 1 })}>Anterior</button>
          <span>
            {resultado.total ? `${inicio}–${fin} de ${resultado.total}` : '0 alimentos'} · Página {page} de {resultado.totalPaginas}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" disabled={page >= resultado.totalPaginas} onClick={() => cambiarParam({ page: page + 1 })}>Siguiente</button>
        </div>
      </div>

      {detalleId && <DetalleAlimento id={detalleId} onCerrar={() => setDetalleId(null)} />}
      {mostrarForm && <FormularioAlimento categorias={categorias} onCreado={alCrear} onCerrar={() => setMostrarForm(false)} />}
    </div>
  );
}
