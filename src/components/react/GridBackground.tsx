import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface Props {
  className?: string;
}

/**
 * Subtle 1px grid that fades from top-left to bottom-right via an SVG mask.
 * Animates in with GSAP — a layered "blueprint" feel behind the main content.
 */
export default function GridBackground({ className }: Props) {
  const gridRef = useRef<SVGRectElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      gridRef.current,
      { opacity: 0 },
      { opacity: 0.35, duration: 1.2, ease: "power2.out", delay: 0.15 },
    );
  }, []);

  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMin slice"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="bgGrid"
          width={12}
          height={12}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 12 0 L 0 0 0 12"
            fill="none"
            stroke="var(--color-text-muted, #a8a29e)"
            strokeWidth={0.5}
          />
        </pattern>

        <radialGradient id="bgGridFade" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="white" />
          <stop offset="50%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="bgGridMask">
          <rect width="800" height="600" fill="url(#bgGridFade)" />
        </mask>
      </defs>

      <rect
        ref={gridRef}
        x={0}
        y={0}
        width="100%"
        height="100%"
        fill="url(#bgGrid)"
        mask="url(#bgGridMask)"
        opacity={0}
      />
    </svg>
  );
}
