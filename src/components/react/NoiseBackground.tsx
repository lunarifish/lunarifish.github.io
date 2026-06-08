import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  2D Perlin noise + fractal Brownian motion (compact, no deps)      */
/* ------------------------------------------------------------------ */

const PERM_SIZE = 256;
const perm = new Uint8Array(PERM_SIZE * 2);

function seed(seedVal = 137) {
  const p = new Uint8Array(PERM_SIZE);
  for (let i = 0; i < PERM_SIZE; i++) p[i] = i;
  let s = seedVal;
  for (let i = PERM_SIZE - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < PERM_SIZE * 2; i++) perm[i] = p[i & 255];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}
function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
}

function noise2D(x: number, y: number) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = perm[perm[xi] + yi];
  const ab = perm[perm[xi] + yi + 1];
  const ba = perm[perm[xi + 1] + yi];
  const bb = perm[perm[xi + 1] + yi + 1];
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

/** Fractal Brownian Motion – layers multiple octaves for natural look */
function fbm(x: number, y: number, octaves = 4) {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2D(x * freq, y * freq);
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const GRID_W = 100; // internal canvas resolution (low → performant)
const GRID_H = 60;
const DRIFT_SPEED = 0.0012; // how fast the noise field shifts per frame

export default function NoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const themeTargetRef = useRef(0); // 0=light, 1=dark (target)
  const themeProgressRef = useRef(0); // 0..1 smoothly animated

  useEffect(() => {
    seed(137);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ---- helpers ---- */
    const readTheme = (): "light" | "dark" => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") return attr;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const resize = () => {
      canvas.width = GRID_W;
      canvas.height = GRID_H;
    };

    /* ---- render loop ---- */
    const tick = () => {
      const theme = readTheme();
      const t = timeRef.current;

      // smooth theme transition (exponential decay)
      const target = theme === "light" ? 0 : 1;
      themeTargetRef.current = target;
      const diff = target - themeProgressRef.current;
      if (Math.abs(diff) < 0.0005) {
        themeProgressRef.current = target;
      } else {
        themeProgressRef.current += diff * 0.2;
      }
      const tp = themeProgressRef.current;

      const img = ctx.createImageData(GRID_W, GRID_H);

      for (let gy = 0; gy < GRID_H; gy++) {
        for (let gx = 0; gx < GRID_W; gx++) {
          // map grid → noise space (≈4×2.5 blobs across the viewport)
          const nx = (gx / GRID_W) * 4 + t * 0.25;
          const ny = (gy / GRID_H) * 2.5 + t * 0.18;
          const n = fbm(nx, ny, 4); // [-1, 1]

          // compute both themes, then lerp
          const grayLight = Math.round(240 + n * 15);
          const grayDark = Math.round(Math.max(0, n * 50));
          const gray = Math.round(grayLight + (grayDark - grayLight) * tp);

          const idx = (gy * GRID_W + gx) * 4;
          img.data[idx] = gray;
          img.data[idx + 1] = gray;
          img.data[idx + 2] = gray;
          img.data[idx + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
      timeRef.current += DRIFT_SPEED;
      rafRef.current = requestAnimationFrame(tick);
    };

    /* ---- init ---- */
    resize();
    rafRef.current = requestAnimationFrame(tick);

    /* ---- watchers ---- */
    const mo = new MutationObserver(() => {
      /* theme may have changed – next frame picks it up */
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      mo.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ imageRendering: "auto" }}
      aria-hidden="true"
    />
  );
}
