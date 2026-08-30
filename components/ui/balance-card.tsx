import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  currency: "GHS" | "USD";
  balance: number;
  label: string;
  subLabel?: string;
}

const CURRENCY_META = {
  GHS: { symbol: "GH₵", accentBg: "rgba(29, 95, 209, 0.12)", accentColor: "var(--oa-blue)" },
  USD: { symbol: "$",   accentBg: "rgba(34, 184, 240, 0.12)", accentColor: "var(--oa-cyan)" },
};

function formatBalance(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function BalanceCard({ currency, balance, label, subLabel }: BalanceCardProps) {
  const { symbol, accentBg, accentColor } = CURRENCY_META[currency];
  return (
    <Card className="flex flex-col gap-3 p-5 relative overflow-hidden">
      {/* Decorative circle */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 pointer-events-none"
        style={{ background: accentBg }}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: accentBg, color: accentColor }}
        >
          {currency}
        </span>
      </div>

      <div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{symbol}</p>
        <p className="font-display font-bold text-[28px] leading-none tracking-tight mt-1" style={{ color: "var(--text-primary)" }}>
          {formatBalance(balance)}
        </p>
      </div>

      {subLabel && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{subLabel}</p>
      )}
    </Card>
  );
}
