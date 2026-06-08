import { FiGithub, FiTwitter, FiMail, FiLinkedin } from "react-icons/fi";

interface Props {
  icon: string;
  size?: number;
}

/**
 * Resolves a string key to a Feather icon component.
 * Add more cases as needed.
 */
export default function ResolvedIcon({ icon, size = 16 }: Props) {
  const props = { size, className: "block" };
  switch (icon) {
    case "github":
      return <FiGithub {...props} />;
    case "twitter":
      return <FiTwitter {...props} />;
    case "mail":
      return <FiMail {...props} />;
    case "linkedin":
      return <FiLinkedin {...props} />;
    default:
      return null;
  }
}
