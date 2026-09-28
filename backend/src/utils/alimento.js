export const CATEGORIAS_ALIMENTO = [
  'Verduras y hortalizas',
  'Frutas',
  'Carnes y embutidos',
  'Pescados y mariscos',
  'Huevos y lácteos',
  'Cereales y derivados',
  'Legumbres',
  'Frutos secos y semillas',
  'Aceites y grasas',
  'Azúcares y dulces',
  'Condimentos y salsas',
  'Bebidas',
];

export function formatearAlimento(a, extra = {}) {
  return {
    id: a.id,
    nombre: a.nombre,
    categoria: a.categoria,
    unidadBase: a.unidadBase,
    calorias: a.calorias,
    proteinas: a.proteinas,
    carbohidratos: a.carbohidratos,
    grasas: a.grasas,
    grasasSaturadas: a.grasasSaturadas,
    fibra: a.fibra,
    azucares: a.azucares,
    sal: a.sal,
    creadoEn: a.creadoEn,
    actualizadoEn: a.actualizadoEn,
    ...extra,
  };
}
