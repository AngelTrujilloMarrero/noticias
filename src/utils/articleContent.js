/**
 * Ajustes sobre el HTML completo de un artículo antes de sanearlo.
 *
 * Algunas fuentes (por ejemplo El Hacker) insertan una imagen de cabecera
 * grande entre el resumen y el cuerpo del texto. Esa imagen suele enlazar a un
 * dominio externo con protección anti-hotlink, así que en móvil se queda
 * cargando, ocupa toda la previsualización y deja el texto extendido fuera de
 * vista. Quitamos solo esa primera imagen y conservamos el resto del contenido.
 */
export function removeLeadImage(container) {
  if (!container) return;

  const image = container.querySelector('img');
  if (!image) return;

  const link = image.closest('a');
  const holder = image.closest('p, figure, div');

  image.remove();

  for (const node of [link, holder]) {
    if (!node || node === container) continue;
    const hasText = Boolean(node.textContent.trim());
    const hasMedia = Boolean(node.querySelector('img, picture, video, source'));
    if (!hasText && !hasMedia) node.remove();
  }
}
