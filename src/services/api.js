import { getNews } from './feedLoader.js';

/**
 * El cliente descarga y parsea los RSS. Se mantiene este nombre para que el
 * hook de datos no dependa de dónde vive la lógica.
 */
export async function fetchNews({ force = false } = {}) {
  return getNews({ force });
}
