import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"blog">[];
}

/**
 * Posts tab panel: list of blog post links.
 */
export default function PostsPanel({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] m-0">No posts yet.</p>
    );
  }

  return (
    <ul className="space-y-3 m-0 p-0 list-none">
      {posts.map((post) => (
        <li key={post.id}>
          <a href={`/blog/${post.id}`} className="block group">
            <span className="text-base font-medium">
              {post.data.title}
            </span>
            <span className="block text-sm text-[var(--color-text-muted)] mt-0.5">
              {post.data.date.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
              {" · "}
              {post.data.description}
            </span>
          </a>
        </li>
      ))}
      <li>
        <a
          href="/blog"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          All posts →
        </a>
      </li>
    </ul>
  );
}
