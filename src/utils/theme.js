/** Clave en localStorage; valores: "dark" | "light" */

export const THEME_STORAGE_KEY = "equielect_theme";

export function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return null;
}

/** Solo actualiza la clase en <html> (no escribe storage). */
export function applyThemeClass(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function setTheme(theme) {
  if (theme !== "dark" && theme !== "light") return;
  applyThemeClass(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme } }));
  } catch {
    /* ignore */
  }
}

export function toggleTheme() {
  const cur =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  setTheme(cur === "dark" ? "light" : "dark");
}

export function isDarkMode() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
