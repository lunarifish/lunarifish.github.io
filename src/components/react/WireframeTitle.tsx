import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface Props {
  className?: string;
}

/** Large dash value that exceeds any plausible text-path length */
const DASH = 1000;

/**
 * Renders the two-line site title ("Lunar" / "Aquarium") as SVG <text>
 * and plays a stroke-draw → fill animation via GSAP on mount.
 */
export default function WireframeTitle({ className }: Props) {
  const line1Ref = useRef<SVGTextElement>(null);
  const line2Ref = useRef<SVGTextElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "circ.inOut" } });

    // ── Both lines draw their strokes almost simultaneously ──
    tl.fromTo(
      line1Ref.current,
      { strokeDashoffset: DASH },
      { strokeDashoffset: 0, duration: 1.2 },
      0,
    );
    tl.fromTo(
      line2Ref.current,
      { strokeDashoffset: DASH },
      { strokeDashoffset: 0, duration: 1.2 },
      0.12, // barely noticeable stagger
    );

    // ── Fill fades in while stroke shrinks (smooth numeric props) ──
    tl.to(
      line1Ref.current,
      { fillOpacity: 1, strokeWidth: 0, duration: 0.2 },
      0.35,
    );
    tl.to(
      line2Ref.current,
      { fillOpacity: 1, strokeWidth: 0, duration: 0.2 },
      0.45,
    );
  }, []);

  return (
    <h1 className={className}>
      <svg
        viewBox="0 0 520 130"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Lunar Aquarium"
        role="img"
      >
        <text
          ref={line1Ref}
          x="0"
          y="52"
          fontSize="72"
          fontWeight="bold"
          letterSpacing="-0.025em"
          fontFamily="inherit"
          fill="currentColor"
          fillOpacity="0"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray={DASH}
          strokeDashoffset={DASH}
        >
          Lunar
        </text>
        <text
          ref={line2Ref}
          x="0"
          y="112"
          fontSize="52"
          fontWeight="bold"
          letterSpacing="-0.025em"
          fontFamily="inherit"
          fill="currentColor"
          fillOpacity="0"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray={DASH}
          strokeDashoffset={DASH}
        >
          Aquarium
        </text>
      </svg>
    </h1>
  );
}
