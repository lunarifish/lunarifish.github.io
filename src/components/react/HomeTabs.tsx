import { Tabs } from "@base-ui/react/tabs";
import type { CollectionEntry } from "astro:content";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import InfoPanel from "./InfoPanel";
import LinksPanel from "./LinksPanel";
import PostsPanel from "./PostsPanel";

gsap.registerPlugin(useGSAP);

interface LinkEntry {
  label: string;
  href: string;
  description: string;
  icon: string;
}

interface Props {
  links: readonly LinkEntry[];
  posts: CollectionEntry<"blog">[];
}

const tabClass =
  "flex items-center justify-center bg-transparent px-3 py-1.5 font-inherit text-sm leading-5 whitespace-nowrap outline-none select-none cursor-pointer border border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] data-active:text-[var(--color-text)] data-active:border-[var(--color-border)] transition-colors";

const panelClass =
  "col-start-1 row-start-1 w-full p-5 outline-none focus-visible:outline-1 focus-visible:outline-[var(--color-border)] [[hidden]]:hidden";

export default function HomeTabs({ links, posts }: Props) {
  const [value, setValue] = useState("info");
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const oldHeightRef = useRef(0);

  /* Divider line — the transparent-zone shrinks on mount */
  useGSAP(() => {
    gsap.fromTo(
      dividerRef.current,
      { "--fade-start": "15%" },
      { "--fade-start": "75%", duration: 2, ease: "power2", delay: 0.5 },
    );
  }, []);

  /* When the user clicks a tab, record the container height BEFORE React re-renders */
  const handleValueChange = useCallback((next: string) => {
    const container = containerRef.current;
    oldHeightRef.current = container ? container.offsetHeight : 0;
    setValue(next);
  }, []);

  /* After React commits the DOM change, measure the new height and animate */
  useLayoutEffect(() => {
    const container = containerRef.current;
    const oldH = oldHeightRef.current;
    if (!container || oldH === 0) return;

    // Wait for the browser to finish layout with the new panel visible
    const raf = requestAnimationFrame(() => {
      const newH = container.offsetHeight;
      if (newH === oldH) return;

      // Lock container to old height, suppress min-height
      container.style.minHeight = `${oldH}px`;
      container.style.height = `${oldH}px`;
      container.style.overflow = "hidden";

      // Force a synchronous layout so the animation starts from oldH
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      container.offsetHeight;

      const anim = container.animate(
        [
          { height: `${oldH}px`, minHeight: `${oldH}px` },
          { height: `${newH}px`, minHeight: `${newH}px` },
        ],
        { duration: 250, easing: "cubic-bezier(.4,0,.2,1)" },
      );

      anim.onfinish = () => {
        container.style.height = "";
        container.style.minHeight = "";
        container.style.overflow = "";
      };
    });

    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <Tabs.Root
      className="w-full"
      value={value}
      onValueChange={handleValueChange}
    >
      <Tabs.List className="relative z-1 -mb-px flex">
        <Tabs.Tab className={tabClass} value="info">
          ── about
        </Tabs.Tab>
        <Tabs.Tab className={tabClass} value="links">
          ── links
        </Tabs.Tab>
        <Tabs.Tab className={tabClass} value="posts">
          ── blog
        </Tabs.Tab>
        {/* Divider line — transparent zone shrinks on mount */}
        <div
          ref={dividerRef}
          className="absolute inset-x-0 bottom-0 h-px"
          style={
            {
              "--fade-start": "15%",
              background:
                "linear-gradient(to right, var(--color-border), var(--color-border) var(--fade-start), transparent 100%)",
            } as React.CSSProperties
          }
        />
      </Tabs.List>

      <div ref={containerRef} className="grid w-full min-h-40 grid-cols-1">
        <Tabs.Panel className={panelClass} value="info" data-tab-panel="info">
          <InfoPanel />
        </Tabs.Panel>

        <Tabs.Panel className={panelClass} value="links" data-tab-panel="links">
          <LinksPanel links={links} />
        </Tabs.Panel>

        <Tabs.Panel className={panelClass} value="posts" data-tab-panel="posts">
          <PostsPanel posts={posts} />
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
