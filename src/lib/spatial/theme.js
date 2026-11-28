// theme.js — light/dark with the circular reveal from the boards, remembered per visitor.
//
// Every state class lives on <html data-sp-root>: the theme (.sp-night + .theme-dark, or .sp-day)
// and .still, .lead-404, because some selectors combine them (.sp-day.lead-404 …).
// The view-transition class also goes on <html>: the CSS targets html.vt-theme::view-transition-new(root).
//
// ThemeScript.astro applies the stored theme from an inline <script> in <head>, before first
// paint, and again after ClientRouter swaps. This module is for the button.

const KEY = 'theme';

export function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) { /* storage can be unavailable */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme, root = document.documentElement) {
  const night = theme === 'dark';
  root.classList.toggle('sp-night', night);
  root.classList.toggle('theme-dark', night);
  root.classList.toggle('sp-day', !night);
  root.style.colorScheme = night ? 'dark' : 'light';
  root.dataset.theme = night ? 'dark' : 'light';
}

// Call from the sun/moon button's click handler with the click event. The choice is stored here
// and nowhere else, so until a visitor presses the button the site keeps following the system.
export function toggleTheme(event) {
  const html = document.documentElement;
  const next = (html.dataset.theme || readTheme()) === 'dark' ? 'light' : 'dark';
  if (event && event.clientX != null) {
    html.style.setProperty('--vt-x', event.clientX + 'px');
    html.style.setProperty('--vt-y', event.clientY + 'px');
  }
  const swap = () => {
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
  };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) { swap(); return next; }
  html.classList.add('vt-theme');
  const t = document.startViewTransition(swap);
  t.finished.finally(() => html.classList.remove('vt-theme'));
  return next;
}
