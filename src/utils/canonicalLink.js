/**
 * Reconstruye el enlace de un artículo sobre el sitio original.
 *
 * Las fuentes de X llegan desde mirrors de Nitter, que enlazan a su propio
 * dominio (a veces por http) en lugar de al tweet. Con `canonical` en la
 * configuración, `{id}` se sustituye por el identificador del estado.
 */
export function canonicalLink(link, feed) {
  const template = feed?.canonical;
  if (!template || !link) return link;

  const id = /\/status\/(\d+)/.exec(String(link))?.[1];
  if (!id) return link;

  return template.replace('{id}', id);
}
