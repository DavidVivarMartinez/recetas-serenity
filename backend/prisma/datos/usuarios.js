// Cuentas reales del proyecto. Contraseña inicial común (cámbiala desde "Mi perfil > Ajustes").
export const PASSWORD_INICIAL = 'Serenity123';

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
];

// Las recetas de ejemplo cuyo autor no exista se asignan a esta cuenta
export const AUTOR_POR_DEFECTO = 'david';
