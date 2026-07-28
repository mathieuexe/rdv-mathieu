import { ArrowUpRight, Clock3, FolderKanban, ShieldX, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  accent?: "cyan" | "emerald" | "amber" | "rose";
}

const accents = {
  cyan: {
    card: "border-cyan-100 bg-white",
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    chip: "bg-cyan-50 text-cyan-700",
    Icon: Sparkles,
  },
  emerald: {
    card: "border-emerald-100 bg-white",
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    chip: "bg-emerald-50 text-emerald-700",
    Icon: ArrowUpRight,
  },
  amber: {
    card: "border-amber-100 bg-white",
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    chip: "bg-amber-50 text-amber-700",
    Icon: Clock3,
  },
  rose: {
    card: "border-rose-100 bg-white",
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    chip: "bg-rose-50 text-rose-700",
    Icon: ShieldX,
  },
};

export function MetricCard({ label, value, accent = "cyan" }: MetricCardProps) {
  const currentAccent = accents[accent];
  const Icon = currentAccent.Icon;

  return (
    <div
      className={cn(
        "rounded-[26px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]",
        currentAccent.card,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("flex size-12 items-center justify-center rounded-2xl ring-1", currentAccent.icon)}>
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", currentAccent.chip)}>Vue rapide</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FolderKanban className="size-3.5" />
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
}
