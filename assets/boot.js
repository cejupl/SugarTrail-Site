/* Marks the page as scripted before first paint, so the reveal styles in
 * site.css only ever apply where JavaScript can undo them. Without this
 * file - or with scripts off - every word is visible from the start. */
document.documentElement.classList.add('js');
