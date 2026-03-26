import type { Theme } from '@/contexts/ThemeContext';

export const MF_THEME_CHANGE = 'MF_THEME_CHANGE' as const;

/**
 * Notify all plugin iframes that the host theme changed.
 * Uses each iframe's document origin as targetOrigin when src is set (works for same- and cross-origin);
 * falls back to the host origin.
 */
export function broadcastThemeToPluginIframes(theme: Theme): void {
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-mf-plugin]').forEach((iframe) => {
    const win = iframe.contentWindow;
    if (!win) return;

    let targetOrigin = window.location.origin;
    try {
      if (iframe.src) {
        targetOrigin = new URL(iframe.src, window.location.href).origin;
      }
    } catch {
      // keep host origin
    }

    win.postMessage({ type: MF_THEME_CHANGE, theme }, targetOrigin);
  });
}

/**
 * Minimal bootstrap for plugin iframes: mirror parent theme when allowed, then listen for updates.
 * Injected via DOM (not innerHTML) so the script executes.
 */
const PLUGIN_THEME_BOOTSTRAP_IIFE = `(function(){
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  }
  try {
    var pel = window.parent && window.parent.document && window.parent.document.documentElement;
    if (pel && pel.dataset && pel.dataset.theme) applyTheme(pel.dataset.theme);
  } catch (e) {}
  window.addEventListener('message', function(e) {
    if (e.source !== window.parent) return;
    if (e.data && e.data.type === '${MF_THEME_CHANGE}' && (e.data.theme === 'light' || e.data.theme === 'dark')) {
      applyTheme(e.data.theme);
    }
  });
})();`;

export function injectPluginThemeBootstrap(doc: Document): void {
  if (doc.getElementById('mf-plugin-theme-bootstrap')) return;
  const script = doc.createElement('script');
  script.id = 'mf-plugin-theme-bootstrap';
  script.textContent = PLUGIN_THEME_BOOTSTRAP_IIFE;
  doc.head.insertBefore(script, doc.head.firstChild);
}
