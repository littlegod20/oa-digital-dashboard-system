"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "./theme-script";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const CHANGE_EVENT = "oa-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const p = localStorage.getItem(STORAGE_KEY);
    if (p === "light" || p === "dark" || p === "system") return p;
  } catch {}
  return "system";
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  return pref;
}

function apply(pref: ThemePreference) {
  document.documentElement.setAttribute("data-theme", resolve(pref));
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  function onSystemChange() {
    if (readPreference() === "system") apply("system");
    onChange();
  }
  media.addEventListener("change", onSystemChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light") as ResolvedTheme,
    () => "light" as ResolvedTheme,
  );

  const setPreference = useCallback((pref: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {}
    apply(pref);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolve(readPreference()) === "dark" ? "light" : "dark");
  }, [setPreference]);

  return { preference, resolved, setPreference, toggle };
}

const noopSubscribe = () => () => {};

/** True on Apple platforms (for ⌘ vs Ctrl shortcut hints). */
export function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true,
  );
}
