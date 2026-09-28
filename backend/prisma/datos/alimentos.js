// Tabla de alimentos de referencia. Valores aproximados por 100 g (o 100 ml)
// tomados de tablas de composición habituales (BEDCA / USDA), redondeados.
// Columnas: nombre, categoria, unidadBase, calorias, proteinas, carbohidratos,
//           grasas, grasasSaturadas, fibra, azucares, sal
const f = (nombre, categoria, unidadBase, calorias, proteinas, carbohidratos, grasas, grasasSaturadas, fibra, azucares, sal) => ({
  nombre, categoria, unidadBase, calorias, proteinas, carbohidratos, grasas, grasasSaturadas, fibra, azucares, sal,
});

const V = 'Verduras y hortalizas';
const FR = 'Frutas';
const C = 'Carnes y embutidos';
const P = 'Pescados y mariscos';
const HL = 'Huevos y lácteos';
const CE = 'Cereales y derivados';
const L = 'Legumbres';
const FS = 'Frutos secos y semillas';
const AG = 'Aceites y grasas';
const AZ = 'Azúcares y dulces';
const CS = 'Condimentos y salsas';
const B = 'Bebidas';

export const ALIMENTOS = [
  // Verduras y hortalizas
  f('Lechuga romana', V, 'g', 17, 1.2, 3.3, 0.3, 0, 2.1, 1.2, 0.02),
  f('Tomate', V, 'g', 18, 0.9, 3.9, 0.2, 0, 1.2, 2.6, 0.01),
  f('Tomates cherry', V, 'g', 18, 0.9, 3.9, 0.2, 0, 1.2, 2.6, 0.01),
  f('Pepino', V, 'g', 15, 0.7, 3.6, 0.1, 0, 0.5, 1.7, 0.01),
  f('Zanahoria', V, 'g', 41, 0.9, 9.6, 0.2, 0, 2.8, 4.7, 0.17),
  f('Cebolla', V, 'g', 40, 1.1, 9.3, 0.1, 0, 1.7, 4.2, 0.01),
  f('Cebolla morada', V, 'g', 40, 1.1, 9.3, 0.1, 0, 1.7, 4.2, 0.01),
  f('Cebollitas francesas', V, 'g', 32, 1.8, 7.3, 0.2, 0, 2.6, 2.3, 0.04),
  f('Ajo', V, 'g', 149, 6.4, 33, 0.5, 0.1, 2.1, 1, 0.04),
  f('Pimiento rojo', V, 'g', 31, 1, 6, 0.3, 0, 2.1, 4.2, 0.01),
  f('Pimiento verde', V, 'g', 20, 0.9, 4.6, 0.2, 0, 1.7, 2.4, 0.01),
  f('Brócoli', V, 'g', 34, 2.8, 6.6, 0.4, 0, 2.6, 1.7, 0.08),
  f('Espinacas', V, 'g', 23, 2.9, 3.6, 0.4, 0.1, 2.2, 0.4, 0.2),
  f('Calabacín', V, 'g', 17, 1.2, 3.1, 0.3, 0.1, 1, 2.5, 0.02),
  f('Berenjena', V, 'g', 25, 1, 5.9, 0.2, 0, 3, 3.5, 0.01),
  f('Champiñones', V, 'g', 22, 3.1, 3.3, 0.3, 0.1, 1, 2, 0.01),
  f('Setas variadas', V, 'g', 25, 3, 3.5, 0.4, 0.1, 1.5, 1.5, 0.01),
  f('Lombarda', V, 'g', 31, 1.4, 7.4, 0.2, 0, 2.1, 3.8, 0.07),
  f('Judías verdes', V, 'g', 31, 1.8, 7, 0.2, 0, 2.7, 3.3, 0.02),
  f('Patata', V, 'g', 77, 2, 17, 0.1, 0, 2.2, 0.8, 0.02),
  f('Aguacate', V, 'g', 160, 2, 8.5, 14.7, 2.1, 6.7, 0.7, 0.02),
  f('Brotes de soja', V, 'g', 30, 3, 5.9, 0.2, 0, 1.8, 4.1, 0.01),
  f('Maíz dulce', V, 'g', 86, 3.3, 19, 1.4, 0.2, 2.7, 6.3, 0.04),
  f('Alga nori', V, 'g', 35, 5.8, 5.1, 0.3, 0.1, 0.3, 0.5, 0.1),
  f('Cilantro fresco', V, 'g', 23, 2.1, 3.7, 0.5, 0, 2.8, 0.9, 0.12),
  f('Perejil fresco', V, 'g', 36, 3, 6.3, 0.8, 0.1, 3.3, 0.9, 0.14),
  f('Albahaca fresca', V, 'g', 23, 3.2, 2.7, 0.6, 0, 1.6, 0.3, 0.01),
  f('Jengibre fresco', V, 'g', 80, 1.8, 17.8, 0.8, 0.2, 2, 1.7, 0.03),
  f('Guindilla fresca', V, 'g', 40, 1.9, 8.8, 0.4, 0, 1.5, 5.3, 0.02),

  // Frutas
  f('Limón', FR, 'g', 29, 1.1, 9.3, 0.3, 0, 2.8, 2.5, 0.01),
  f('Lima', FR, 'g', 30, 0.7, 10.5, 0.2, 0, 2.8, 1.7, 0.01),
  f('Naranja', FR, 'g', 47, 0.9, 11.8, 0.1, 0, 2.4, 9.4, 0),
  f('Manzana', FR, 'g', 52, 0.3, 13.8, 0.2, 0, 2.4, 10.4, 0),
  f('Plátano', FR, 'g', 89, 1.1, 22.8, 0.3, 0.1, 2.6, 12.2, 0),
  f('Fresas', FR, 'g', 32, 0.7, 7.7, 0.3, 0, 2, 4.9, 0),
  f('Mango', FR, 'g', 60, 0.8, 15, 0.4, 0.1, 1.6, 13.7, 0),

  // Carnes y embutidos
  f('Pechuga de pollo', C, 'g', 165, 31, 0, 3.6, 1, 0, 0, 0.19),
  f('Muslo de pollo', C, 'g', 209, 26, 0, 10.9, 3, 0, 0, 0.21),
  f('Pollo entero', C, 'g', 215, 18, 0, 15, 4.3, 0, 0, 0.18),
  f('Conejo', C, 'g', 173, 33, 0, 3.5, 1, 0, 0, 0.12),
  f('Carne picada de ternera', C, 'g', 250, 26, 0, 15, 5.9, 0, 0, 0.19),
  f('Ternera magra', C, 'g', 134, 22, 0, 4.5, 1.8, 0, 0, 0.15),
  f('Lomo de cerdo', C, 'g', 143, 21, 0, 6, 2, 0, 0, 0.15),
  f('Panceta', C, 'g', 458, 12, 0.7, 45, 16, 0, 0, 1.8),
  f('Bacon', C, 'g', 417, 13, 1.4, 42, 14, 0, 0, 1.7),
  f('Jamón serrano', C, 'g', 241, 31, 0.5, 13, 4.5, 0, 0, 5.5),
  f('Chorizo', C, 'g', 455, 24, 2, 38, 14, 0, 0, 3),

  // Pescados y mariscos
  f('Salmón', P, 'g', 208, 20, 0, 13, 3.1, 0, 0, 0.15),
  f('Bacalao', P, 'g', 82, 18, 0, 0.7, 0.1, 0, 0, 0.14),
  f('Merluza', P, 'g', 72, 16, 0, 0.9, 0.2, 0, 0, 0.2),
  f('Lubina', P, 'g', 97, 18, 0, 2, 0.5, 0, 0, 0.17),
  f('Corvina', P, 'g', 90, 18, 0, 1.5, 0.4, 0, 0, 0.15),
  f('Atún fresco', P, 'g', 144, 23, 0, 4.9, 1.3, 0, 0, 0.1),
  f('Atún en conserva al natural', P, 'g', 116, 26, 0, 0.8, 0.3, 0, 0, 0.9),
  f('Gambas', P, 'g', 99, 24, 0.2, 0.3, 0.1, 0, 0, 0.28),
  f('Mejillones', P, 'g', 86, 12, 3.7, 2.2, 0.4, 0, 0, 0.7),
  f('Calamar', P, 'g', 92, 15.6, 3.1, 1.4, 0.4, 0, 0, 0.11),
  f('Anchoas en aceite', P, 'g', 210, 29, 0, 10, 2.2, 0, 0, 9),
  f('Surimi', P, 'g', 95, 7.6, 15, 0.9, 0.2, 0, 4, 1.8),

  // Huevos y lácteos
  f('Huevo', HL, 'g', 143, 12.6, 0.7, 9.5, 3.1, 0, 0.4, 0.35),
  f('Yema de huevo', HL, 'g', 322, 15.9, 3.6, 26.5, 9.6, 0, 0.6, 0.12),
  f('Leche entera', HL, 'ml', 61, 3.2, 4.8, 3.3, 1.9, 0, 4.8, 0.1),
  f('Leche de coco', HL, 'ml', 197, 2.3, 2.8, 21, 18.9, 0, 2.8, 0.03),
  f('Nata para cocinar', HL, 'ml', 195, 2.6, 3.7, 19, 12, 0, 3.4, 0.1),
  f('Mantequilla', HL, 'g', 717, 0.9, 0.1, 81, 51, 0, 0.1, 0.02),
  f('Queso parmesano', HL, 'g', 431, 38, 4.1, 29, 19, 0, 0.9, 1.6),
  f('Queso pecorino romano', HL, 'g', 387, 32, 3.7, 27, 17, 0, 0, 3.5),
  f('Queso gruyère', HL, 'g', 413, 30, 0.4, 32, 19, 0, 0.4, 1.7),
  f('Queso mozzarella', HL, 'g', 280, 28, 3.1, 17, 11, 0, 1, 1.5),
  f('Queso ricotta', HL, 'g', 174, 11, 3, 13, 8.3, 0, 0.3, 0.2),
  f('Queso mascarpone', HL, 'g', 429, 4.8, 4.8, 44, 29, 0, 3.9, 0.1),
  f('Yogur natural', HL, 'g', 61, 3.5, 4.7, 3.3, 2.1, 0, 4.7, 0.1),

  // Cereales y derivados
  f('Arroz blanco', CE, 'g', 355, 6.5, 78, 0.5, 0.1, 1.3, 0.1, 0.01),
  f('Arroz bomba', CE, 'g', 360, 6.6, 79, 0.6, 0.2, 1.4, 0.1, 0.01),
  f('Arroz arborio', CE, 'g', 360, 6.5, 80, 0.5, 0.1, 1.2, 0.1, 0.01),
  f('Quinoa', CE, 'g', 368, 14, 64, 6.1, 0.7, 7, 0, 0.01),
  f('Espaguetis', CE, 'g', 371, 13, 75, 1.5, 0.3, 3.2, 2.7, 0.01),
  f('Placas de lasaña', CE, 'g', 371, 13, 75, 1.5, 0.3, 3.2, 2.7, 0.01),
  f('Fideos de arroz', CE, 'g', 364, 3.4, 83, 0.6, 0.1, 1.6, 0, 0.18),
  f('Fideos ramen frescos', CE, 'g', 280, 10, 56, 1.5, 0.3, 2.2, 1, 0.6),
  f('Pan baguette', CE, 'g', 274, 9, 55, 1.2, 0.3, 2.4, 2.5, 1.3),
  f('Pan de pueblo', CE, 'g', 265, 9, 51, 1.5, 0.3, 3, 2, 1.2),
  f('Tortillas de maíz', CE, 'g', 218, 5.7, 45, 2.9, 0.5, 6.3, 0.9, 0.1),
  f('Harina de trigo', CE, 'g', 364, 10, 76, 1, 0.2, 2.7, 0.3, 0),
  f('Pan rallado', CE, 'g', 395, 13, 72, 5.3, 1.2, 4.5, 6.2, 1.8),
  f('Masa quebrada', CE, 'g', 407, 5.5, 44, 23, 11, 1.7, 1.5, 1),
  f('Bizcochos savoiardi', CE, 'g', 380, 8, 78, 4, 1.5, 1, 40, 0.2),

  // Legumbres
  f('Garbanzos cocidos', L, 'g', 164, 8.9, 27, 2.6, 0.3, 7.6, 4.8, 0.02),
  f('Alubias rojas cocidas', L, 'g', 127, 8.7, 22.8, 0.5, 0.1, 6.4, 0.3, 0.01),
  f('Lentejas cocidas', L, 'g', 116, 9, 20, 0.4, 0.1, 7.9, 1.8, 0.01),
  f('Tofu firme', L, 'g', 76, 8, 1.9, 4.8, 0.7, 0.3, 0.6, 0.02),

  // Frutos secos y semillas
  f('Almendras', FS, 'g', 579, 21, 22, 50, 3.8, 12.5, 4.4, 0),
  f('Nueces', FS, 'g', 654, 15, 14, 65, 6.1, 6.7, 2.6, 0),
  f('Cacahuetes', FS, 'g', 567, 26, 16, 49, 6.3, 8.5, 4.7, 0.02),
  f('Semillas de sésamo', FS, 'g', 573, 18, 23, 50, 7, 11.8, 0.3, 0.03),
  f('Semillas de girasol', FS, 'g', 584, 21, 20, 51, 4.5, 8.6, 2.6, 0.02),
  f('Tahini', FS, 'g', 595, 17, 21, 54, 7.5, 9.3, 0.5, 0.29),

  // Aceites y grasas
  f('Aceite de oliva virgen extra', AG, 'ml', 884, 0, 0, 100, 14, 0, 0, 0),
  f('Aceite de sésamo', AG, 'ml', 884, 0, 0, 100, 14, 0, 0, 0),
  f('Aceite de girasol', AG, 'ml', 884, 0, 0, 100, 10, 0, 0, 0),
  f('Mayonesa', AG, 'g', 680, 1, 0.6, 75, 11, 0, 0.6, 1.5),

  // Azúcares y dulces
  f('Azúcar blanco', AZ, 'g', 387, 0, 100, 0, 0, 0, 100, 0),
  f('Azúcar moreno', AZ, 'g', 380, 0.1, 98, 0, 0, 0, 97, 0.07),
  f('Miel', AZ, 'g', 304, 0.3, 82, 0, 0, 0.2, 82, 0.01),
  f('Cacao en polvo', AZ, 'g', 228, 20, 58, 14, 8, 33, 1.8, 0.05),
  f('Chocolate negro 70%', AZ, 'g', 598, 7.8, 46, 43, 24, 11, 24, 0.02),

  // Condimentos y salsas
  f('Sal', CS, 'g', 0, 0, 0, 0, 0, 0, 0, 100),
  f('Pimienta negra', CS, 'g', 251, 10, 64, 3.3, 1.4, 25, 0.6, 0.05),
  f('Pimentón', CS, 'g', 282, 14, 54, 13, 2.1, 35, 10, 0.17),
  f('Comino', CS, 'g', 375, 18, 44, 22, 1.5, 10.5, 2.3, 0.42),
  f('Curry en polvo', CS, 'g', 325, 14, 56, 14, 2.2, 53, 2.8, 0.13),
  f('Pasta de curry rojo', CS, 'g', 120, 3, 15, 5, 0.5, 4, 8, 6),
  f('Azafrán', CS, 'g', 310, 11, 65, 6, 1.6, 3.9, 0, 0.37),
  f('Orégano seco', CS, 'g', 265, 9, 69, 4.3, 1.6, 42.5, 4.1, 0.06),
  f('Salsa de soja', CS, 'ml', 53, 8, 4.9, 0.6, 0.1, 0.8, 0.4, 14),
  f('Mirin', CS, 'ml', 240, 0.2, 44, 0, 0, 0, 26, 0.1),
  f('Vinagre de arroz', CS, 'ml', 18, 0, 0.8, 0, 0, 0, 0.5, 0.01),
  f('Vinagre de Jerez', CS, 'ml', 20, 0, 0.9, 0, 0, 0, 0.4, 0.01),
  f('Mostaza de Dijon', CS, 'g', 66, 4.4, 5.8, 3.3, 0.2, 3.3, 0.9, 2.9),
  f('Salsa Worcestershire', CS, 'ml', 78, 0, 19, 0, 0, 0, 10, 2.4),
  f('Pasta de miso', CS, 'g', 199, 12, 26, 6, 1.1, 5.4, 6.2, 9.3),
  f('Salsa de tamarindo', CS, 'g', 240, 1, 58, 0.5, 0.1, 2, 45, 2.5),
  f('Tomate triturado', CS, 'g', 32, 1.6, 7, 0.2, 0, 1.9, 4.4, 0.3),
  f('Caldo de verduras', CS, 'ml', 5, 0.3, 0.8, 0.1, 0, 0, 0.3, 0.9),
  f('Caldo de pollo', CS, 'ml', 7, 0.6, 0.5, 0.2, 0.1, 0, 0.2, 0.9),

  // Bebidas
  f('Agua', B, 'ml', 0, 0, 0, 0, 0, 0, 0, 0),
  f('Café espresso', B, 'ml', 9, 0.1, 1.7, 0.2, 0, 0, 0, 0.01),
  f('Vino blanco', B, 'ml', 82, 0.1, 2.6, 0, 0, 0, 1, 0.01),
  f('Vino tinto', B, 'ml', 85, 0.1, 2.6, 0, 0, 0, 0.6, 0.01),
  f('Cerveza', B, 'ml', 43, 0.5, 3.6, 0, 0, 0, 0, 0.01),
];
