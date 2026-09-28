// Conversión aproximada de unidades caseras a gramos/mililitros.
// Se asume densidad ~1 para líquidos; es una estimación.
const A_GRAMOS = {
  g: 1, gr: 1, gramo: 1, gramos: 1,
  ml: 1, mililitro: 1, mililitros: 1,
  kg: 1000, kilo: 1000, kilos: 1000,
  l: 1000, litro: 1000, litros: 1000,
  cucharada: 15, cucharadas: 15, cda: 15,
  cucharadita: 5, cucharaditas: 5, cdta: 5,
  taza: 240, tazas: 240,
  vaso: 200, vasos: 200,
};

export function aGramos(cantidad, unidad) {
  if (cantidad == null || !unidad) return null;
  const factor = A_GRAMOS[String(unidad).trim().toLowerCase()];
  return factor ? cantidad * factor : null;
}

const CAMPOS = ['calorias', 'proteinas', 'carbohidratos', 'grasas', 'grasasSaturadas', 'fibra', 'azucares', 'sal'];

/**
 * Calcula la nutrición por porción sumando los alimentos enlazados cuya
 * cantidad se puede convertir a gramos. Devuelve null si no hay ninguno.
 */
export function calcularNutricion(ingredientes, porciones = 1) {
  const total = Object.fromEntries(CAMPOS.map((c) => [c, 0]));
  let contados = 0;

  for (const ing of ingredientes) {
    if (!ing.alimento) continue;
    const gramos = aGramos(ing.cantidad, ing.unidad);
    if (gramos == null) continue;
    const factor = gramos / 100;
    for (const c of CAMPOS) total[c] += (ing.alimento[c] ?? 0) * factor;
    contados++;
  }

  if (!contados) return null;
  const p = Math.max(1, porciones);
  const porPorcion = Object.fromEntries(
    CAMPOS.map((c) => [c, Math.round((total[c] / p) * 10) / 10]),
  );
  return { porPorcion, ingredientesContabilizados: contados, ingredientesTotales: ingredientes.length };
}
