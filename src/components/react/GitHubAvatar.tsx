import { Avatar } from "@base-ui/react/avatar";

export default function GitHubAvatar() {
  return (
    <Avatar.Root className="w-full h-full">
      <Avatar.Image
        src="https://avatars.githubusercontent.com/u/41246950"
        className="w-full h-full object-cover"
        alt="Avatar"
      />
      <Avatar.Fallback className="flex items-center justify-center w-full h-full text-xs text-[var(--color-text-muted)] bg-[var(--color-highlight)]">
        [ ]
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
