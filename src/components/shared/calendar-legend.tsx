"use client";

interface CalendarLegendProps {
  className?: string;
}

const items = [
  {
    label: "Gris (non cliquable)",
    description: "Jour passé",
    swatchClassName: "border-gray-200 bg-gray-100",
  },
  {
    label: "Gris / noir (cliquable)",
    description: "Des créneaux sont disponibles",
    swatchClassName: "border-gray-300 bg-white",
  },
  {
    label: "Rouge",
    description: "Indisponibilité",
    swatchClassName: "border-red-200 bg-red-100",
  },
];

export function CalendarLegend({ className }: CalendarLegendProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Légende</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          >
            <span className={`inline-flex size-3 rounded-full border ${item.swatchClassName}`} />
            <span>
              <strong>{item.label}</strong> : {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
