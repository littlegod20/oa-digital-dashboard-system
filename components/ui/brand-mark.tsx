import { useId } from "react";
import { cn } from "@/lib/utils";

/** Vector "OA" monogram, crisp at any size (the JPEG logo is a wide lockup on white). */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="OA Digital"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1D3F7A" />
          <stop offset="1" stopColor="#0B1F3B" />
        </linearGradient>
        <linearGradient id={`${id}-a`} x1="20" y1="10" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22B8F0" />
          <stop offset="1" stopColor="#1D5FD1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${id}-bg)`} />
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" fill="none" stroke="#fff" strokeOpacity="0.12" />
      <circle cx="13.5" cy="20" r="6" fill="none" stroke="#fff" strokeWidth="3.2" />
      <path d="M21.2 28.5 27 11.5h2.6l5.8 17h-3.4l-1.3-4h-5.2l-1.3 4h-3Zm5.2-6.8h3.5L28.2 16l-1.8 5.7Z" fill={`url(#${id}-a)`} />
      <rect x="7" y="31" width="27" height="1.4" rx="0.7" fill="#22B8F0" opacity="0.7" />
    </svg>
  );
}
