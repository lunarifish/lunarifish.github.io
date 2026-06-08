import { Popover } from "@base-ui/react/popover";
import katex from "katex";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./AdaptiveFormula.module.css";

interface Props {
  formula: string;
  maxWidth?: number;
}

export default function AdaptiveFormula({ formula, maxWidth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [scale, setScale] = useState(1);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const html = katex.renderToString(formula, {
    displayMode: true,
    throwOnError: false,
  });

  useLayoutEffect(() => {
    const measureEl = measureRef.current;
    const container = containerRef.current;
    if (!measureEl || !container) return;

    const rect = measureEl.getBoundingClientRect();
    const naturalW = rect.width;
    const naturalH = rect.height;
    const containerW = container.clientWidth;
    const limit = maxWidth ?? containerW;

    setNaturalSize({ w: naturalW, h: naturalH });

    if (limit > 0 && naturalW > limit) {
      setScale(Math.max(0.35, limit / naturalW));
      setOverflow(true);
    } else {
      setScale(1);
      setOverflow(false);
    }
  }, [formula, maxWidth, html]);

  // Clipped viewport: exact visual size of the scaled formula
  const viewW = naturalSize.w * scale;
  const viewH = naturalSize.h * scale + 4; // +4px safety for subpixel rounding

  // Non-overflow: render normally, centered
  const normalFormula = (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );

  return (
    <div ref={containerRef} className="flex justify-center py-3 w-full">
      {/* Hidden measurement at natural size — wrapped to prevent page overflow */}
      <div className="absolute overflow-hidden" style={{ width: 0, height: 0 }}>
        <div
          ref={measureRef}
          className={`${styles.reset} absolute top-0 left-0 invisible`}
          style={{ whiteSpace: "nowrap" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {overflow ? (
        <div className="w-full flex justify-center" style={{ zIndex: 1 }}>
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger
              render={
                <button
                  className="block cursor-pointer bg-transparent p-0 m-0 outline-none"
                  style={{ border: "none" }}
                />
              }
            >
              <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={
                  hovered || open
                    ? "border border-[var(--color-border)]"
                    : "border border-transparent"
                }
                style={{ width: viewW, height: viewH, overflow: "hidden" }}
              >
                <div
                  className={styles.reset}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: naturalSize.w,
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={8} align="center" side="bottom">
                <Popover.Popup className={`${styles.reset} border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-auto max-w-[90vw] max-h-[80vh]`}>
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
      ) : (
        <div className="w-full flex justify-center">{normalFormula}</div>
      )}
    </div>
  );
}
