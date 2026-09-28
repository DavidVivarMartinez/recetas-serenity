import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Link2, X, Save } from 'lucide-react';
import { alimentosApi } from '../../services/api';
import { normalizarVideo } from '../../utils/video';
import {
  DIFICULTADES, UNIDADES, CATEGORIAS_SUGERIDAS, CAMPOS_NUTRICION,
  nuevoIngrediente, nuevoPaso, estadoInicial, formularioAPayload,
} from './recetaForm.utils';
import '../../styles/formularios.css';
import './RecetaForm.css';

/** Campo de nombre de ingrediente con búsqueda en la tabla de alimentos. */
function BuscadorAlimento({ ingrediente, onCambiar }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const temporizador = useRef(null);
  const contenedor = useRef(null);

  useEffect(() => {
    const cerrar = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      clearTimeout(temporizador.current);
    };
  }, []);

  const buscar = (texto) => {
    clearTimeout(temporizador.current);
    if (texto.trim().length < 2) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    temporizador.current = setTimeout(async () => {
      try {
        const r = await alimentosApi.listar({ q: texto.trim(), limit: 8 });
        setSugerencias(r.datos);
        setAbierto(r.datos.length > 0);
      } catch {
        setSugerencias([]);
      }
    }, 250);
  };

  const seleccionar = (a) => {
    onCambiar({
      nombre: a.nombre,
      alimentoId: a.id,
      alimentoNombre: a.nombre,
      unidad: ingrediente.unidad || a.unidadBase,
    });
    setAbierto(false);
    setSugerencias([]);
  };

  return (
    <div className="autocompletar" ref={contenedor}>
      <input
        className="form-input"
        placeholder="Ingrediente (busca en la tabla de alimentos)"
        value={ingrediente.nombre}
        onChange={(e) => {
          onCambiar({ nombre: e.target.value });
          buscar(e.target.value);
        }}
        onFocus={() => sugerencias.length && setAbierto(true)}
        aria-label="Nombre del ingrediente"
      />
      {ingrediente.alimentoId ? (
        <span className="badge-enlazado" title="Enlazado con la tabla de alimentos: se usará para calcular la nutrición">
          <Link2 size={11} /> {ingrediente.alimentoNombre}
          <button type="button" onClick={() => onCambiar({ alimentoId: null, alimentoNombre: '' })} aria-label="Desenlazar alimento">
            <X size={11} />
          </button>
        </span>
      ) : (
        <span className="form-hint">Sin enlazar a la tabla de alimentos</span>
      )}
      {abierto && sugerencias.length > 0 && (
        <ul className="autocompletar-lista" role="listbox">
          {sugerencias.map((a) => (
            <li key={a.id} className="autocompletar-item" role="option" aria-selected={false} onMouseDown={() => seleccionar(a)}>
              <span>{a.nombre}</span>
              <small>{a.categoria} · {a.calorias} kcal/100 {a.unidadBase}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Formulario de creación/edición de receta.
 * Props: inicial (receta de la API o undefined), onGuardar(payload), guardando, error, textoBoton.
 */
export default function RecetaForm({ inicial, onGuardar, guardando = false, error = null, textoBoton = 'Guardar receta' }) {
  const [f, setF] = useState(() => estadoInicial(inicial));
  const [etiquetaTexto, setEtiquetaTexto] = useState('');

  const set = (campo, valor) => setF((prev) => ({ ...prev, [campo]: valor }));
  const setNutricion = (k, v) => setF((prev) => ({ ...prev, nutricion: { ...prev.nutricion, [k]: v } }));

  const actualizarFila = (lista, clave, cambios) =>
    setF((prev) => ({ ...prev, [lista]: prev[lista].map((x) => (x.clave === clave ? { ...x, ...cambios } : x)) }));

  const quitarFila = (lista, clave) =>
    setF((prev) => (prev[lista].length > 1 ? { ...prev, [lista]: prev[lista].filter((x) => x.clave !== clave) } : prev));

  const moverFila = (lista, indice, dir) =>
    setF((prev) => {
      const arr = [...prev[lista]];
      const j = indice + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[indice], arr[j]] = [arr[j], arr[indice]];
      return { ...prev, [lista]: arr };
    });

  const anadirEtiqueta = () => {
    const t = etiquetaTexto.trim().replace(/,+$/, '');
    if (t && !f.etiquetas.includes(t) && f.etiquetas.length < 10) set('etiquetas', [...f.etiquetas, t]);
    setEtiquetaTexto('');
  };

  const video = normalizarVideo(f.videoUrl.trim());

  const enviar = (e) => {
    e.preventDefault();
    onGuardar(formularioAPayload(f));
  };

  return (
    <form className="receta-form" onSubmit={enviar} noValidate>
      {error && (
        <div className="alerta alerta-error" role="alert">
          {error.message || String(error)}
          {error.detalles?.length > 0 && (
            <ul>
              {error.detalles.map((d, i) => (
                <li key={i}><strong>{d.campo}</strong>: {d.mensaje}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------- Datos básicos ---------- */}
      <section>
        <h2 className="receta-form__seccion">Datos básicos</h2>
        <div className="form-grid">
          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="rf-titulo">Título *</label>
            <input id="rf-titulo" className="form-input" value={f.titulo} onChange={(e) => set('titulo', e.target.value)} required minLength={3} maxLength={120} />
          </div>
          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="rf-descripcion">Descripción *</label>
            <textarea id="rf-descripcion" className="form-textarea" value={f.descripcion} onChange={(e) => set('descripcion', e.target.value)} required minLength={10} maxLength={2000} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-categoria">Categoría *</label>
            <input id="rf-categoria" className="form-input" list="rf-categorias" value={f.categoria} onChange={(e) => set('categoria', e.target.value)} required />
            <datalist id="rf-categorias">
              {CATEGORIAS_SUGERIDAS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-dificultad">Dificultad *</label>
            <select id="rf-dificultad" className="form-select" value={f.dificultad} onChange={(e) => set('dificultad', e.target.value)}>
              {DIFICULTADES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-porciones">Porciones *</label>
            <input id="rf-porciones" className="form-input" type="number" min={1} max={50} value={f.porciones} onChange={(e) => set('porciones', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-tiempo">Tiempo total (min) *</label>
            <input id="rf-tiempo" className="form-input" type="number" min={1} max={1440} value={f.tiempoTotal} onChange={(e) => set('tiempoTotal', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-prep">Preparación (min)</label>
            <input id="rf-prep" className="form-input" type="number" min={0} max={1440} value={f.tiempoPreparacion} onChange={(e) => set('tiempoPreparacion', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-coccion">Cocción (min)</label>
            <input id="rf-coccion" className="form-input" type="number" min={0} max={1440} value={f.tiempoCoccion} onChange={(e) => set('tiempoCoccion', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ---------- Multimedia ---------- */}
      <section>
        <h2 className="receta-form__seccion">Imagen y vídeo</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="rf-imagen">URL de la imagen</label>
            <input id="rf-imagen" className="form-input" type="url" placeholder="https://…" value={f.imagenUrl} onChange={(e) => set('imagenUrl', e.target.value)} />
            {f.imagenUrl.trim() && (
              <img className="vista-previa-imagen" src={f.imagenUrl.trim()} alt="Vista previa" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            )}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="rf-video">Enlace al vídeo (YouTube o Vimeo)</label>
            <input id="rf-video" className="form-input" type="url" placeholder="https://www.youtube.com/watch?v=…" value={f.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
            {f.videoUrl.trim() && !video && <span className="form-error">No parece una URL válida.</span>}
            {video?.embedUrl && (
              <div className="vista-previa-video">
                <iframe src={video.embedUrl} title="Vista previa del vídeo" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              </div>
            )}
            {video && !video.embedUrl && (
              <span className="form-hint">Se guardará como enlace externo (no se puede incrustar).</span>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Etiquetas ---------- */}
      <section>
        <h2 className="receta-form__seccion">Etiquetas</h2>
        <div className="etiquetas-input">
          <input
            className="form-input"
            placeholder="Escribe una etiqueta y pulsa Enter (máx. 10)"
            value={etiquetaTexto}
            onChange={(e) => setEtiquetaTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                anadirEtiqueta();
              }
            }}
            aria-label="Nueva etiqueta"
          />
          <button type="button" className="btn btn-secondary" onClick={anadirEtiqueta}><Plus size={16} /> Añadir</button>
        </div>
        {f.etiquetas.length > 0 && (
          <div className="chips" style={{ marginTop: '0.75rem' }}>
            {f.etiquetas.map((t) => (
              <span key={t} className="chip">
                {t}
                <button type="button" onClick={() => set('etiquetas', f.etiquetas.filter((x) => x !== t))} aria-label={`Quitar ${t}`}><X size={13} /></button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Ingredientes ---------- */}
      <section>
        <h2 className="receta-form__seccion">
          Ingredientes *
          <span className="form-hint">Enlaza cada ingrediente con la tabla de alimentos para calcular la nutrición automáticamente.</span>
        </h2>
        {f.ingredientes.map((ing, idx) => (
          <div className="fila-dinamica" key={ing.clave}>
            <div className="form-group form-group--full">
              <BuscadorAlimento ingrediente={ing} onCambiar={(c) => actualizarFila('ingredientes', ing.clave, c)} />
            </div>
            <div className="form-group">
              <input className="form-input" type="number" min={0} step="any" placeholder="Cantidad" value={ing.cantidad} onChange={(e) => actualizarFila('ingredientes', ing.clave, { cantidad: e.target.value })} aria-label="Cantidad" />
            </div>
            <div className="form-group">
              <input className="form-input" list="rf-unidades" placeholder="Unidad" value={ing.unidad} onChange={(e) => actualizarFila('ingredientes', ing.clave, { unidad: e.target.value })} aria-label="Unidad" />
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="Nota (opcional)" value={ing.nota} onChange={(e) => actualizarFila('ingredientes', ing.clave, { nota: e.target.value })} aria-label="Nota" />
            </div>
            <div className="fila-dinamica__acciones">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => moverFila('ingredientes', idx, -1)} disabled={idx === 0} aria-label="Subir"><ArrowUp size={14} /></button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => moverFila('ingredientes', idx, 1)} disabled={idx === f.ingredientes.length - 1} aria-label="Bajar"><ArrowDown size={14} /></button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => quitarFila('ingredientes', ing.clave)} disabled={f.ingredientes.length === 1} aria-label="Quitar ingrediente"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <datalist id="rf-unidades">
          {UNIDADES.map((u) => <option key={u} value={u} />)}
        </datalist>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('ingredientes', [...f.ingredientes, nuevoIngrediente()])}>
          <Plus size={16} /> Añadir ingrediente
        </button>
      </section>

      {/* ---------- Pasos ---------- */}
      <section>
        <h2 className="receta-form__seccion">Pasos *</h2>
        {f.pasos.map((p, idx) => (
          <div className="fila-dinamica fila-dinamica--paso" key={p.clave}>
            <div className="form-group">
              <span className="fila-dinamica__numero">{idx + 1}</span>
              <input className="form-input" placeholder="Título del paso (opcional)" value={p.titulo} onChange={(e) => actualizarFila('pasos', p.clave, { titulo: e.target.value })} aria-label="Título del paso" />
              <textarea className="form-textarea" placeholder="Describe el paso *" value={p.descripcion} onChange={(e) => actualizarFila('pasos', p.clave, { descripcion: e.target.value })} aria-label="Descripción del paso" style={{ minHeight: 80 }} />
              <input className="form-input" placeholder="Consejo (opcional)" value={p.consejo} onChange={(e) => actualizarFila('pasos', p.clave, { consejo: e.target.value })} aria-label="Consejo" />
            </div>
            <div className="form-group">
              <label className="form-label">Minutos</label>
              <input className="form-input" type="number" min={0} value={p.tiempoMin} onChange={(e) => actualizarFila('pasos', p.clave, { tiempoMin: e.target.value })} aria-label="Minutos del paso" />
            </div>
            <div className="fila-dinamica__acciones">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => moverFila('pasos', idx, -1)} disabled={idx === 0} aria-label="Subir"><ArrowUp size={14} /></button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => moverFila('pasos', idx, 1)} disabled={idx === f.pasos.length - 1} aria-label="Bajar"><ArrowDown size={14} /></button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => quitarFila('pasos', p.clave)} disabled={f.pasos.length === 1} aria-label="Quitar paso"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('pasos', [...f.pasos, nuevoPaso()])}>
          <Plus size={16} /> Añadir paso
        </button>
      </section>

      {/* ---------- Nutrición ---------- */}
      <section>
        <h2 className="receta-form__seccion">
          Valores nutricionales por porción
          <span className="form-hint">Opcional. Si enlazas los ingredientes, la app calcula también los valores a partir de la tabla de alimentos.</span>
        </h2>
        <div className="form-grid form-grid--nutricion">
          {CAMPOS_NUTRICION.map(([k, etiqueta]) => (
            <div className="form-group" key={k}>
              <label className="form-label" htmlFor={`rf-nut-${k}`}>{etiqueta}</label>
              <input id={`rf-nut-${k}`} className="form-input" type="number" min={0} step="any" value={f.nutricion[k]} onChange={(e) => setNutricion(k, e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Publicación ---------- */}
      <div className="receta-form__pie">
        <label className="form-check">
          <input type="checkbox" checked={f.publicada} onChange={(e) => set('publicada', e.target.checked)} />
          Publicar (si no, se guarda como borrador visible solo para ti)
        </label>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          <Save size={18} /> {guardando ? 'Guardando…' : textoBoton}
        </button>
      </div>
    </form>
  );
}
