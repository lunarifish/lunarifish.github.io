import ResolvedIcon from "./ResolvedIcon";

interface LinkEntry {
  label: string;
  href: string;
  description: string;
  icon: string;
}

export default function InfoPanel() {
  return (
    <div>
      <p className="text-sm leading-relaxed text-text mb-6 max-w-md">
        Welcome to my personal page!
      </p>
      <p className="text-sm leading-relaxed text-text mb-6 max-w-md"></p>
    </div>
  );
}
