/**
 * Normaliza un enlace de vídeo y devuelve la URL embebible.
 * Soporta YouTube (watch, youtu.be, shorts, embed, live) y Vimeo.
 * Para otros enlaces devuelve proveedor "otro" sin URL de embed.
 * Devuelve null si el texto no es una URL válida.
 */
export function normalizarVideo(url) {
  if (!url) return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(u.protocol)) return null;
  const host = u.hostname.replace(/^(www|m)\./, '');

  let id = null;
  if (host === 'youtu.be') {
    id = u.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') {
      id = u.searchParams.get('v');
    } else {
      const m = u.pathname.match(/^\/(embed|shorts|v|live)\/([\w-]{6,})/);
      if (m) id = m[2];
    }
  }
  if (id && /^[\w-]{6,}$/.test(id)) {
    return { proveedor: 'youtube', id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(\d{6,})/);
    if (m) return { proveedor: 'vimeo', id: m[1], embedUrl: `https://player.vimeo.com/video/${m[1]}` };
  }

  return { proveedor: 'otro', id: null, embedUrl: null };
}
