// Utilidades del formulario de receta: estado inicial y conversión al cuerpo de la API.

export const DIFICULTADES = ['Fácil', 'Medio', 'Difícil'];

export const UNIDADES = [
  'g', 'ml', 'unidad', 'unidades', 'cucharada', 'cucharadas', 'cucharadita',
  'taza', 'diente', 'dientes', 'pizca', 'al gusto',
];

export const CATEGORIAS_SUGERIDAS = [
  'Ensaladas', 'Pasta', 'Pescado', 'Carne', 'Mexicana', 'Vegetariana', 'Vegana',
  'Asiática', 'Aperitivo', 'Española', 'Sopas', 'Francesa', 'Americana',
  'Medio Oriental', 'Postre', 'Desayuno',
];

export const CAMPOS_NUTRICION = [
  ['calorias', 'Calorías (kcal)'],
  ['proteinas', 'Proteínas (g)'],
  ['carbohidratos', 'Carbohidratos (g)'],
  ['grasas', 'Grasas (g)'],
  ['fibra', 'Fibra (g)'],
  ['azucares', 'Azúcares (g)'],
  ['sodio', 'Sodio (mg)'],
];

let contador = 0;
export const clave = () => `k${Date.now().toString(36)}${(contador++).toString(36)}`;

export const nuevoIngrediente = () => ({
  clave: clave(), nombre: '', cantidad: '', unidad: 'g', nota: '', alimentoId: null, alimentoNombre: '',
});

export const nuevoPaso = () => ({ clave: clave(), titulo: '', descripcion: '', tiempoMin: '', consejo: '' });

const texto = (v) => (v === null || v === undefined ? '' : String(v));

/** Convierte una receta de la API (o nada) en el estado del formulario. */
export function estadoInicial(receta) {
  if (!receta) {
    return {
      titulo: '', descripcion: '', imagenUrl: '', videoUrl: '', categoria: '', dificultad: 'Fácil',
      tiempoTotal: '', tiempoPreparacion: '', tiempoCoccion: '', porciones: 4,
      etiquetas: [], publicada: true,
      nutricion: Object.fromEntries(CAMPOS_NUTRICION.map(([k]) => [k, ''])),
      ingredientes: [nuevoIngrediente()],
      pasos: [nuevoPaso()],
    };
  }
  return {
    titulo: texto(receta.titulo),
    descripcion: texto(receta.descripcion),
    imagenUrl: texto(receta.imagenUrl),
    videoUrl: texto(receta.videoUrl),
    categoria: texto(receta.categoria),
    dificultad: receta.dificultad || 'Fácil',
    tiempoTotal: texto(receta.tiempoTotal),
    tiempoPreparacion: texto(receta.tiempoPreparacion),
    tiempoCoccion: texto(receta.tiempoCoccion),
    porciones: receta.porciones ?? 4,
    etiquetas: receta.etiquetas ?? [],
    publicada: receta.publicada ?? true,
    nutricion: Object.fromEntries(CAMPOS_NUTRICION.map(([k]) => [k, texto(receta.nutricion?.[k])])),
    ingredientes: receta.ingredientes?.length
      ? receta.ingredientes.map((i) => ({
          clave: clave(),
          nombre: texto(i.nombre),
          cantidad: texto(i.cantidad),
          unidad: texto(i.unidad),
          nota: texto(i.nota),
          alimentoId: i.alimento?.id ?? null,
          alimentoNombre: i.alimento?.nombre ?? '',
        }))
      : [nuevoIngrediente()],
    pasos: receta.pasos?.length
      ? receta.pasos.map((p) => ({
          clave: clave(),
          titulo: texto(p.titulo),
          descripcion: texto(p.descripcion),
          tiempoMin: texto(p.tiempoMin),
          consejo: texto(p.consejo),
        }))
      : [nuevoPaso()],
  };
}

const numero = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

/** Convierte el estado del formulario en el cuerpo que espera POST/PUT /api/recetas. */
export function formularioAPayload(f) {
  return {
    titulo: f.titulo.trim(),
    descripcion: f.descripcion.trim(),
    imagenUrl: f.imagenUrl.trim() || null,
    videoUrl: f.videoUrl.trim() || null,
    categoria: f.categoria.trim(),
    dificultad: f.dificultad,
    tiempoTotal: numero(f.tiempoTotal),
    tiempoPreparacion: numero(f.tiempoPreparacion),
    tiempoCoccion: numero(f.tiempoCoccion),
    porciones: numero(f.porciones) ?? 4,
    etiquetas: f.etiquetas,
    publicada: Boolean(f.publicada),
    ...Object.fromEntries(CAMPOS_NUTRICION.map(([k]) => [k, numero(f.nutricion[k])])),
    ingredientes: f.ingredientes
      .filter((i) => i.nombre.trim())
      .map((i) => ({
        nombre: i.nombre.trim(),
        cantidad: numero(i.cantidad),
        unidad: i.unidad.trim() || null,
        nota: i.nota.trim() || null,
        alimentoId: i.alimentoId,
      })),
    pasos: f.pasos
      .filter((p) => p.descripcion.trim())
      .map((p) => ({
        titulo: p.titulo.trim() || null,
        descripcion: p.descripcion.trim(),
        tiempoMin: numero(p.tiempoMin),
        consejo: p.consejo.trim() || null,
      })),
  };
}
