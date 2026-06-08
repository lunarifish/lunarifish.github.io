import { useRef, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./ThemeToggle.module.css";

gsap.registerPlugin(useGSAP);

// smaller = faster
const ANIM_SPEED = 0.7;

export default function ThemeToggle() {
  const containerRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Derive initial state from localStorage to avoid flash on SPA navigation.
  // The inline <script> in BaseLayout already applies data-theme before paint,
  // so localStorage is the single source of truth.
  function resolveTheme(): boolean {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const [dark, setDark] = useState(resolveTheme);

  // Sync GSAP visual state with current theme on mount / navigation remount.
  // ⚠️ Astro View Transitions may strip data-theme from <html> during SPA
  // navigation (e.g. entering a blog post whose layout lacks the attribute).
  // Restore it from localStorage so the toggle stays in sync with reality.
  useGSAP(() => {
    const currentAttr = document.documentElement.getAttribute("data-theme");
    if (!currentAttr) {
      const stored = localStorage.getItem("theme");
      const fallback = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", fallback);
    }

    const isDark = resolveTheme();
    setDark(isDark);

    if (thumbRef.current && trackRef.current) {
      gsap.set(thumbRef.current, { x: isDark ? 20 : 2 });
      gsap.set(trackRef.current, {
        backgroundColor: isDark ? "var(--color-bg)" : "transparent",
      });
    }
    if (sunRef.current) {
      gsap.set(sunRef.current, {
        scale: isDark ? 0.6 : 1,
        opacity: isDark ? 0.4 : 1,
        rotation: isDark ? -90 : 0,
        color: isDark ? "var(--color-text-muted)" : "var(--color-text)",
      });
    }
    if (moonRef.current) {
      gsap.set(moonRef.current, {
        scale: isDark ? 1 : 0.6,
        opacity: isDark ? 1 : 0.4,
        rotation: isDark ? 0 : 90,
        color: isDark ? "var(--color-text)" : "var(--color-text-muted)",
      });
    }
  }, { scope: containerRef });

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Kill previous animation to avoid conflicts on rapid clicks
    if (tlRef.current) tlRef.current.kill();

    const tl = gsap.timeline({
      defaults: { duration: 0.35 * ANIM_SPEED, ease: "power2.inOut" },
    });
    tlRef.current = tl;

    if (next) {
      // to dark mode
      tl.to(
        trackRef.current,
        { backgroundColor: "var(--color-bg)", duration: 0.3 * ANIM_SPEED },
        0,
      )
        .to(
          thumbRef.current,
          { x: 20, ease: "back.out(1.7)", duration: 0.5 * ANIM_SPEED },
          0,
        )
        .to(
          sunRef.current,
          {
            scale: 0.6,
            opacity: 0.4,
            rotation: -90,
            color: "var(--color-text-muted)",
          },
          0,
        )
        .to(
          moonRef.current,
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            color: "var(--color-text)",
          },
          0.05,
        );
    } else {
      // to light mode
      tl.to(
        trackRef.current,
        { backgroundColor: "transparent", duration: 0.3 * ANIM_SPEED },
        0,
      )
        .to(
          thumbRef.current,
          { x: 2, ease: "back.out(1.7)", duration: 0.5 * ANIM_SPEED },
          0,
        )
        .to(
          sunRef.current,
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            color: "var(--color-text)",
          },
          0,
        )
        .to(
          moonRef.current,
          {
            scale: 0.6,
            opacity: 0.4,
            rotation: 90,
            color: "var(--color-text-muted)",
          },
          0.05,
        );
    }
  };

  return (
    <button
      ref={containerRef}
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      className={styles.toggle}
    >
      <span ref={sunRef} className={styles.icon}>
        <FiSun size={14} />
      </span>
      <span ref={trackRef} className={styles.track}>
        <span ref={thumbRef} className={styles.thumb} />
      </span>
      <span ref={moonRef} className={styles.icon}>
        <FiMoon size={14} />
      </span>
    </button>
  );
}
