/** Repère visuel Google Agenda, utilisé pour identifier les évènements importés. */
export function GoogleCalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <rect x="2.5" y="3.5" width="19" height="18" rx="3" fill="#ffffff" stroke="#dadce0" />
      <path d="M2.5 6.5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v1.2h-19Z" fill="#4285f4" />
      <rect x="6" y="1.5" width="2" height="4" rx="1" fill="#ea4335" />
      <rect x="16" y="1.5" width="2" height="4" rx="1" fill="#34a853" />
      <rect x="11" y="1.5" width="2" height="4" rx="1" fill="#fbbc04" />
      <text
        x="12"
        y="17.6"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8.5"
        fontWeight="700"
        fill="#4285f4"
      >
        31
      </text>
    </svg>
  );
}
