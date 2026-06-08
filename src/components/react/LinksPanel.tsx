import IconTooltip from "./IconTooltip";
import ResolvedIcon from "./ResolvedIcon";

interface LinkEntry {
  label: string;
  href: string;
  description: string;
  icon: string;
}

interface Props {
  links: readonly LinkEntry[];
}

/**
 * Links tab panel: icon grid with tooltips.
 */
export default function LinksPanel({ links }: Props) {
  return (
    <div>
      <ul className="space-y-2.5 m-0 p-0 list-none">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors no-underline"
            >
              <ResolvedIcon icon={link.icon} size={16} />
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
