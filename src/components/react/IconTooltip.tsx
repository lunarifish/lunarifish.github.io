import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  /** External link URL — if provided, wraps trigger in an <a> tag */
  href?: string;
}

const triggerClass =
  "inline-flex items-center justify-center p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-0";

const popupClass =
  "border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text)] whitespace-nowrap";

/**
 * A Base UI Tooltip wrapping an icon trigger.
 * - Hover over the icon to see the label.
 * - If `href` is provided, the trigger becomes a link.
 */
export default function IconTooltip({ label, children, href }: Props) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={triggerClass}
            />
          ) : (
            <button className={triggerClass} />
          )
        }
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6}>
          <Tooltip.Popup className={popupClass}>
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
