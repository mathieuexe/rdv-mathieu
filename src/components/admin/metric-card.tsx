import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  accent?: "cyan" | "emerald" | "amber" | "rose";
}

const accents = {
  cyan: "from-cyan-500/12 to-cyan-300/6 text-cyan-950 ring-cyan-300/25",
  emerald: "from-emerald-500/12 to-emerald-300/6 text-emerald-950 ring-emerald-300/25",
  amber: "from-amber-500/12 to-amber-300/6 text-amber-950 ring-amber-300/25",
  rose: "from-rose-500/12 to-rose-300/6 text-rose-950 ring-rose-300/25",
};

export function MetricCard({ label, value, accent = "cyan" }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-gradient-to-br p-6 ring-1 shadow-[0_20px_60px_rgba(15,23,42,0.08)]",
        accents[accent],
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
