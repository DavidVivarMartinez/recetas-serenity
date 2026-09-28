// Importa recetas desde TheMealDB (https://www.themealdb.com, clave de prueba gratuita "1").
// Uso:  npm run importar:themealdb                 -> todas (unas 790)
//       npm run importar:themealdb -- --limite=20   -> solo las 20 primeras
//       npm run importar:themealdb -- --letras=abc  -> solo recetas que empiezan por a, b o c
//       npm run importar:themealdb -- --forzar      -> vuelve a escribir las ya importadas
// Es repetible: las recetas se identifican por (fuente, fuenteId) y no se duplican.
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { INGREDIENTES, CATEGORIAS, COCINAS, ETIQUETAS } from './datos/themealdb-mapa.js';

const BASE = 'https://www.themealdb.com/api/json/v1/1';
const FUENTE = 'themealdb';
const prisma = new PrismaClient();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const LETRAS = String(args.letras || 'abcdefghijklmnopqrstuvwxyz').split('');
const LIMITE = args.limite ? Number(args.limite) : Infinity;
const FORZAR = Boolean(args.forzar);

// ---------- descarga ----------
async function descargar(url) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r.json();
    } catch {
      /* reintentar */
    }
    await new Promise((res) => setTimeout(res, 1000 * intento));
  }
  throw new Error(`No se pudo descargar ${url}`);
}

// ---------- medidas ("3/4 cup", "200g", "1 tsp", "2 large") ----------
const FRACCIONES = { '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

function parsearNumero(texto) {
  const t = texto.replace(/[¼½¾⅓⅔⅛]/g, (c) => ` ${FRACCIONES[c]} `).trim();
  let total = 0;
  let ok = false;
  for (const p of t.split(/\s+/)) {
    if (/^\d+\/\d+$/.test(p)) {
      const [a, b] = p.split('/').map(Number);
      if (b) { total += a / b; ok = true; }
    } else if (/^\d+([.,]\d+)?$/.test(p)) {
      total += Number(p.replace(',', '.'));
      ok = true;
    } else break;
  }
  return ok ? Math.round(total * 100) / 100 : null;
}

const UNIDADES = [
  [/^(g|gr|grams?|gramos?)$/i, 'g', 1],
  [/^(kg|kilos?|kilograms?)$/i, 'g', 1000],
  [/^(ml|millilit(er|re)s?)$/i, 'ml', 1],
  [/^(l|litres?|liters?)$/i, 'ml', 1000],
  [/^(tsp|teaspoons?)$/i, 'cucharadita', 1],
  [/^(tbsp?|tbls|tablespoons?)$/i, 'cucharada', 1],
  [/^cups?$/i, 'taza', 1],
  [/^(oz|ounces?)$/i, 'g', 28.35],
  [/^(lbs?|pounds?)$/i, 'g', 453.6],
  [/^cloves?$/i, 'diente', 1],
  [/^(pinch|pinches)$/i, 'pizca', 1],
  [/^(dash|dashes)$/i, 'pizca', 1],
  [/^slices?$/i, 'rebanada', 1],
  [/^(cans?|tins?)$/i, 'lata', 1],
  [/^sprigs?$/i, 'ramita', 1],
  [/^leaves?$/i, 'hoja', 1],
  [/^sticks?$/i, 'barra', 1],
  [/^handfuls?$/i, 'puñado', 1],
  [/^bunch(es)?$/i, 'manojo', 1],
  [/^(pieces?|pcs?|whole)$/i, 'unidad', 1],
  [/^(large|medium|small)$/i, 'unidad', 1],
];

function parsearMedida(medida) {
  const raw = (medida || '').trim();
  if (!raw) return { cantidad: null, unidad: null, nota: null };
  const bajo = raw.toLowerCase();
  if (/to taste|to serve|as needed|as required|garnish|topping|sprinkling|for frying|optional|drizzle|splash|dollop|knob/.test(bajo)) {
    return { cantidad: null, unidad: 'al gusto', nota: raw };
  }
  if (/^(a )?(pinch|dash)/.test(bajo)) return { cantidad: 1, unidad: 'pizca', nota: null };
  if (/^(a )?handful/.test(bajo)) return { cantidad: 1, unidad: 'puñado', nota: null };

  const m = raw.match(/^([\d¼½¾⅓⅔⅛.,/ ]+)\s*([a-zA-Z]+)?\.?\s*(.*)$/);
  if (!m) return { cantidad: null, unidad: null, nota: raw };
  const cantidad = parsearNumero(m[1]);
  if (cantidad == null) return { cantidad: null, unidad: null, nota: raw };
  const palabra = (m[2] || '').trim();
  const resto = (m[3] || '').trim();

  for (const [re, unidad, factor] of UNIDADES) {
    if (palabra && re.test(palabra)) {
      const esTamano = /^(large|medium|small)$/i.test(palabra);
      const nota = [esTamano ? palabra : null, resto].filter(Boolean).join(' ') || null;
      return { cantidad: Math.round(cantidad * factor * 100) / 100, unidad, nota };
    }
  }
  return { cantidad, unidad: 'unidad', nota: [palabra, resto].filter(Boolean).join(' ') || null };
}

// ---------- ingredientes ----------
function traducirIngrediente(nombre) {
  const clave = nombre.trim().toLowerCase();
  const entrada =
    INGREDIENTES[clave] ??
    INGREDIENTES[clave.replace(/s$/, '')] ??
    INGREDIENTES[`${clave}s`] ??
    null;
  return entrada ? { nombre: entrada[0], alimento: entrada[1] } : { nombre: nombre.trim(), alimento: null };
}

// ---------- pasos ----------
function parsearPasos(texto) {
  let lineas = (texto || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .map((l) => l.replace(/^(step\s*\d+[:.)\-]?\s*|\d+[.)]\s+)/i, '').trim())
    .filter((l) => l.length > 2 && !/^step\s*\d+$/i.test(l));
  if (lineas.length <= 1) {
    const frases = (texto || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) || [texto || ''];
    lineas = [];
    for (let i = 0; i < frases.length; i += 2) lineas.push(`${frases[i]}${frases[i + 1] || ''}`.trim());
  }
  return lineas.slice(0, 40).map((l) => ({ descripcion: l.slice(0, 2000) }));
}

const TIEMPO_POR_CATEGORIA = {
  Breakfast: 20, Starter: 25, Side: 25, Seafood: 30, Pasta: 30, Vegetarian: 35, Vegan: 35,
  Chicken: 45, Miscellaneous: 45, Pork: 60, Beef: 60, Dessert: 60, Lamb: 75, Goat: 90,
};

function dificultad(nIngredientes, nPasos) {
  if (nIngredientes <= 7 && nPasos <= 5) return 'Fácil';
  if (nIngredientes <= 13 && nPasos <= 10) return 'Medio';
  return 'Difícil';
}

function esUrl(u) {
  try {
    return ['http:', 'https:'].includes(new URL(u).protocol);
  } catch {
    return false;
  }
}

// ---------- conversión de una receta de TheMealDB a nuestro modelo ----------
function convertir(m, alimentosPorNombre, autorId) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nombre = (m[`strIngredient${i}`] || '').trim();
    if (!nombre) continue;
    const { nombre: nombreEs, alimento } = traducirIngrediente(nombre);
    const medida = parsearMedida(m[`strMeasure${i}`]);
    ingredientes.push({
      nombre: nombreEs,
      cantidad: medida.cantidad,
      unidad: medida.unidad,
      nota: medida.nota,
      orden: ingredientes.length + 1,
      alimentoId: alimento ? alimentosPorNombre.get(alimento) ?? null : null,
    });
  }
  const pasos = parsearPasos(m.strInstructions).map((p, idx) => ({ ...p, orden: idx + 1 }));

  const categoriaEs = CATEGORIAS[m.strCategory] ?? m.strCategory ?? 'Varios';
  const cocinaEs = COCINAS[m.strArea] === undefined ? m.strArea : COCINAS[m.strArea];
  const etiquetas = new Set();
  if (cocinaEs) etiquetas.add(cocinaEs);
  for (const t of (m.strTags || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    etiquetas.add(ETIQUETAS[t] ?? t);
  }

  const descripcion = `Receta ${cocinaEs ? cocinaEs.toLowerCase() + ' ' : ''}de ${categoriaEs.toLowerCase()} importada de TheMealDB. Las instrucciones están en su idioma original (inglés).`;

  return {
    receta: {
      titulo: m.strMeal.trim().slice(0, 120),
      descripcion,
      imagenUrl: esUrl(m.strMealThumb) ? m.strMealThumb : null,
      videoUrl: esUrl(m.strYoutube) ? m.strYoutube : null,
      tiempoTotal: TIEMPO_POR_CATEGORIA[m.strCategory] ?? 45,
      dificultad: dificultad(ingredientes.length, pasos.length),
      categoria: categoriaEs,
      porciones: 4,
      etiquetas: JSON.stringify([...etiquetas].slice(0, 10)),
      publicada: true,
      autorId,
      fuente: FUENTE,
      fuenteId: m.idMeal,
      fuenteUrl: esUrl(m.strSource) ? m.strSource : `https://www.themealdb.com/meal/${m.idMeal}`,
    },
    ingredientes,
    pasos,
  };
}

// ---------- programa ----------
async function main() {
  // Autor de las recetas importadas
  let autor = await prisma.usuario.findUnique({ where: { email: 'themealdb@importado.local' } });
  if (!autor) {
    autor = await prisma.usuario.create({
      data: {
        nombre: 'TheMealDB',
        email: 'themealdb@importado.local',
        rol: 'usuario',
        bio: 'Recetas importadas de TheMealDB.com. Textos originales en inglés.',
        passwordHash: await bcrypt.hash(randomBytes(24).toString('base64url'), 10),
      },
    });
    console.log('Creada la cuenta autora "TheMealDB".');
  }

  const alimentosPorNombre = new Map((await prisma.alimento.findMany({ select: { id: true, nombre: true } })).map((a) => [a.nombre, a.id]));

  let vistas = 0;
  let creadas = 0;
  let actualizadas = 0;
  let saltadas = 0;
  let totalIngredientes = 0;
  let ingredientesEnlazados = 0;
  const sinTraducir = new Map();

  for (const letra of LETRAS) {
    if (vistas >= LIMITE) break;
    const datos = await descargar(`${BASE}/search.php?f=${letra}`);
    for (const m of datos.meals ?? []) {
      if (vistas >= LIMITE) break;
      vistas++;

      const existente = await prisma.receta.findUnique({
        where: { fuente_fuenteId: { fuente: FUENTE, fuenteId: m.idMeal } },
        select: { id: true },
      });
      if (existente && !FORZAR) {
        saltadas++;
        continue;
      }

      const { receta, ingredientes, pasos } = convertir(m, alimentosPorNombre, autor.id);
      totalIngredientes += ingredientes.length;
      ingredientesEnlazados += ingredientes.filter((i) => i.alimentoId).length;
      for (let i = 1; i <= 20; i++) {
        const n = (m[`strIngredient${i}`] || '').trim().toLowerCase();
        if (n && !INGREDIENTES[n] && !INGREDIENTES[n.replace(/s$/, '')] && !INGREDIENTES[`${n}s`]) {
          sinTraducir.set(n, (sinTraducir.get(n) ?? 0) + 1);
        }
      }

      if (existente) {
        await prisma.$transaction([
          prisma.recetaIngrediente.deleteMany({ where: { recetaId: existente.id } }),
          prisma.paso.deleteMany({ where: { recetaId: existente.id } }),
          prisma.receta.update({
            where: { id: existente.id },
            data: { ...receta, ingredientes: { create: ingredientes }, pasos: { create: pasos } },
          }),
        ]);
        actualizadas++;
      } else {
        await prisma.receta.create({
          data: { ...receta, ingredientes: { create: ingredientes }, pasos: { create: pasos } },
        });
        creadas++;
      }
      if ((creadas + actualizadas) % 50 === 0) console.log(`  ... ${creadas + actualizadas} recetas procesadas`);
    }
  }

  console.log('\nResumen de la importación desde TheMealDB:');
  console.log(`  Recetas vistas:       ${vistas}`);
  console.log(`  Creadas:              ${creadas}`);
  console.log(`  Actualizadas:         ${actualizadas}`);
  console.log(`  Ya existían (saltadas): ${saltadas}`);
  if (totalIngredientes) {
    console.log(`  Ingredientes enlazados con la tabla de alimentos: ${ingredientesEnlazados} de ${totalIngredientes} (${Math.round((100 * ingredientesEnlazados) / totalIngredientes)}%)`);
  }
  const top = [...sinTraducir.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  if (top.length) {
    console.log(`  Ingredientes sin traducir más frecuentes (${sinTraducir.size} distintos):`);
    console.log('    ' + top.map(([n, c]) => `${n} (${c})`).join(', '));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
