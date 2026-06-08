import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { MarkdownHeading } from "astro";

gsap.registerPlugin(useGSAP);

export default function TableOfContents({
  headings,
}: {
  headings: MarkdownHeading[];
}) {
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const linkEls = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isClickScrolling = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build a set of valid heading slugs for lookup
  const slugSet = new Set(headings.map((h) => h.slug));

  // --- IntersectionObserver: track which heading is in view ---
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    // Observe all heading elements in the prose content
    const headingNodes = document.querySelectorAll(
      ".prose h1[id], .prose h2[id], .prose h3[id]",
    );

    const visibleMap = new Map<string, boolean>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Ignore observer events while a click-triggered scroll is in flight
        if (isClickScrolling.current) return;

        for (const entry of entries) {
          visibleMap.set(entry.target.id, entry.isIntersecting);
        }

        // Find the first visible heading (top-to-bottom order)
        for (const heading of headings) {
          if (visibleMap.get(heading.slug)) {
            setActiveId(heading.slug);
            return;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const node of headingNodes) {
      if (slugSet.has(node.id)) {
        observerRef.current.observe(node);
      }
    }
  }, [headings, slugSet]);

  useEffect(() => {
    // Delay to ensure .prose is rendered
    const timer = setTimeout(setupObserver, 100);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [setupObserver]);

  // --- GSAP: animate indicator to active link ---
  useGSAP(
    () => {
      const link = linkEls.current.get(activeId);
      if (!link || !indicatorRef.current || !navRef.current) return;

      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const top = linkRect.top - navRect.top;
      const height = linkRect.height;

      gsap.to(indicatorRef.current, {
        y: top,
        height,
        duration: 0.3,
        ease: "power2.out",
      });
    },
    { scope: navRef, dependencies: [activeId] },
  );

  // --- Smooth scroll on click ---
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;

    // Lock observer so intermediate headings don't steal activeId during scroll
    isClickScrolling.current = true;
    setActiveId(slug);

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${slug}`);

    // Re-enable observer once the scroll settles.
    // Prefer the native scrollend event; fall back to a generous timeout.
    const unlock = () => {
      isClickScrolling.current = false;
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };

    if ("onscrollend" in window) {
      const controller = new AbortController();
      window.addEventListener("scrollend", unlock, { once: true, signal: controller.signal });
      // Safety net: if scrollend never fires (e.g. target already in view)
      scrollEndTimer.current = setTimeout(() => {
        unlock();
        controller.abort();
      }, 1200);
    } else {
      // Fallback for browsers without scrollend (Safari < 15.4)
      scrollEndTimer.current = setTimeout(unlock, 1000);
    }
  };

  // --- Register link ref ---
  const setLinkRef = (slug: string, el: HTMLAnchorElement | null) => {
    if (el) {
      linkEls.current.set(slug, el);
    } else {
      linkEls.current.delete(slug);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside
      ref={navRef}
      className="hidden xl:block fixed left-[max(1rem,calc((100vw-60rem)/2-16rem))] top-32 w-52 z-40"
    >
      <nav className="relative" aria-label="目录">
        {/* Sliding indicator */}
        <div
          ref={indicatorRef}
          className="absolute left-0 top-0 w-[2px] rounded-full"
          style={{ background: "var(--color-text)" }}
        />

        <ul className="space-y-0.5 pl-3">
          {headings.map((heading) => (
            <li
              key={heading.slug}
              style={{ paddingLeft: `${(heading.depth - 2) * 0.75}rem` }}
            >
              <a
                ref={(el) => setLinkRef(heading.slug, el)}
                href={`#${heading.slug}`}
                onClick={(e) => handleClick(e, heading.slug)}
                className="block text-sm leading-relaxed py-1 transition-colors duration-150"
                style={{
                  color:
                    activeId === heading.slug
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  fontWeight:
                    activeId === heading.slug ? 600 : 400,
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
