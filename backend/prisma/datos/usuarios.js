// Cuentas reales del proyecto. La contraseña inicial común se toma de SEED_PASSWORD (backend/.env);
// si no está definida, la semilla genera una al azar y la muestra. Cambiable desde "Mi perfil > Ajustes".
export const PASSWORD_INICIAL = process.env.SEED_PASSWORD || null;

export const USUARIOS = [
  {
    clave: 'david',
    nombre: 'David Vivar Martínez',
    email: 'davidvivarmartinez@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'admin',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'rakel',
    nombre: 'Rakel Martínez',
    email: 'rakelmartinezg@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'monica',
    nombre: 'Mónica Vivar Martínez',
    email: 'monica.vivarmartinez@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'vera',
    nombre: 'Vera González',
    email: 'vera.gonzalez.am@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'lara',
    nombre: 'Lara Cordero',
    email: 'laracordero95@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'guillermo',
    nombre: 'Guillermo',
    email: 'guillermoam4c@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'adri',
    nombre: 'Adri',
    email: 'adri.mt@proton.me',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'funnycienta',
    nombre: 'Funnycienta',
    email: 'funnycienta@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
  {
    clave: 'valentina',
    nombre: 'Valentina Romero',
    email: 'valentinaromero575@gmail.com',
    password: PASSWORD_INICIAL,
    rol: 'usuario',
    bio: null,
    avatarUrl: null,
  },
];

// Las recetas de ejemplo cuyo autor no exista se asignan a esta cuenta
export const AUTOR_POR_DEFECTO = 'david';
