import { cn, getInitials } from "@/lib/utils";

const GRADIENTS = [
  "linear-gradient(135deg, #1D5FD1 0%, #22B8F0 100%)",
  "linear-gradient(135deg, #0B1F3B 0%, #1D5FD1 100%)",
  "linear-gradient(135deg, #F7A274 0%, #E8677E 100%)",
  "linear-gradient(135deg, #6B3FC9 0%, #1D5FD1 100%)",
  "linear-gradient(135deg, #0E9F6E 0%, #22B8F0 100%)",
  "linear-gradient(135deg, #C77E12 0%, #F28C5B 100%)",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({
  name,
  size = 40,
  className,
  square = false,
}: {
  name: string;
  size?: number;
  className?: string;
  square?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-display font-semibold text-white ring-2 ring-white/70 dark:ring-white/10",
        square ? "rounded-[30%]" : "rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        background: GRADIENTS[hash(name) % GRADIENTS.length],
      }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarStack({ names, size = 28, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {rest > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-fg-2 ring-2 ring-white/70 dark:ring-white/10"
          style={{ width: size, height: size }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
