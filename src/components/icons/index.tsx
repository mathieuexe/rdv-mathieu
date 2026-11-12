/* Fichier généré par scripts/generate-garden-icons.mjs — ne pas modifier à la main. */
/* Icônes : Zendesk Garden (https://garden.zendesk.com), licence Apache-2.0. */
import type { ComponentType, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = ComponentType<IconProps>;

/**
 * Enveloppe commune : taille 16 px par défaut (la grille de dessin de Garden),
 * couleur héritée du texte, et icône ignorée par les lecteurs d'écran sauf si
 * un `aria-label` est fourni.
 */
function GardenSvg({ children, ...props }: IconProps) {
  const isLabelled = Boolean(props["aria-label"] || props["aria-labelledby"]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      focusable="false"
      aria-hidden={isLabelled ? undefined : true}
      role={isLabelled ? "img" : undefined}
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * Indicateur de chargement. Garden n'en propose pas dans son jeu d'icônes :
 * cet anneau reprend son style (trait de 2 px, extrémités arrondies). À
 * animer avec la classe `animate-spin`.
 */
export const LoaderCircle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M15 8a7 7 0 1 1-7-7" />
  </GardenSvg>
);

export const Loader2 = LoaderCircle;

/** Garden : line-graph-stroke */
export const Activity: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="15" height="13" x=".5" y="1.5" rx=".5" ry=".5"/><path strokeLinejoin="round" d="M.5 12.5l3-4.5 2 3 4-6 3 4.5 3-4.5"/></g>
  </GardenSvg>
);

/** Garden : alert-error-stroke */
export const AlertCircle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="7.5" cy="8.5" r="7"/><path strokeLinecap="round" d="M7.5 4.5V9"/></g><circle cx="7.5" cy="12" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : alert-warning-stroke */
export const AlertTriangle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M.88 13.77L7.06 1.86c.19-.36.7-.36.89 0l6.18 11.91c.17.33-.07.73-.44.73H1.32c-.37 0-.61-.4-.44-.73zM7.5 6v3.5"/><circle cx="7.5" cy="12" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : arrow-left-stroke (retournée) */
export const ArrowRight: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g transform="matrix(-1 0 0 1 16 0)"><path fill="none" stroke="currentColor" strokeLinecap="round" d="M1 8.5h14.5m-10-5L.9 8.1c-.2.2-.2.5 0 .7l4.6 4.6"/></g>
  </GardenSvg>
);

/** Garden : new-window-stroke */
export const ArrowUpRight: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M14.5 10.5V14c0 .3-.2.5-.5.5H2c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5h3.5"/><path fill="none" stroke="currentColor" strokeLinecap="round" d="M8 8l6.5-6.5"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M8.5 1.5h6v6"/>
  </GardenSvg>
);

/** Garden : circle-line-stroke */
export const Ban: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M8 14a6.002 6.002 0 005.658-4l1.052.001a7.003 7.003 0 01-13.42 0h1.052A6.003 6.003 0 008 14zm7-7a1 1 0 010 2H1a1 1 0 110-2h14zM8 1a7.003 7.003 0 016.71 5h-1.05A6.002 6.002 0 002.34 6H1.29C2.15 3.108 4.829 1 8 1z"/>
  </GardenSvg>
);

/** Garden : bar-chart-stroke */
export const BarChart3: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M15 15.001 13 15V1l2 .001v14Zm.041-15L12.963 0C12.431-.001 12 .448 12 1.002v13.995c0 .554.431 1.002.963 1.003l2.074.001c.532 0 .963-.449.963-1.002V1.001c0-.552-.429-1-.959-1ZM3 15H1V8h2v7Zm6 0H7V5h2v10ZM.957 16h2.086c.529 0 .957-.446.957-.997V7.997C4 7.446 3.572 7 3.043 7H.957C.428 7 0 7.446 0 7.997v7.006c0 .551.428.997.957.997Zm6.001 0h2.084a.959.959 0 0 0 .958-.958V4.958A.959.959 0 0 0 9.042 4H6.958A.959.959 0 0 0 6 4.958v10.084c0 .53.429.958.958.958Z"/>
  </GardenSvg>
);

/** Garden : notification-stroke */
export const Bell: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinejoin="round" d="M13.5 9.5s0-9-5.5-9-5.5 9-5.5 9C.65 9.5.44 11.15.46 12c.01.28.22.5.5.5h14.08c.28 0 .49-.22.5-.5.02-.85-.19-2.5-2.04-2.5zm-7 3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5"/>
  </GardenSvg>
);

/** Garden : notification-fill */
export const BellRing: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M8 0C6.53 0 5.3.52 4.32 1.56c-2 2.12-2.3 5.86-2.33 7.59C.55 9.6 0 11 0 12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-1-.55-2.4-1.99-2.85-.03-1.73-.33-5.47-2.33-7.59C10.7.52 9.47 0 8 0zm0 16c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2z"/>
  </GardenSvg>
);

/** Garden : building-stroke */
export const Building2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M13 .5H3c-.3 0-.5.2-.5.5v14c0 .3.2.5.5.5h3c.3 0 .5-.2.5-.5v-3c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5v3c0 .3.2.5.5.5h3c.3 0 .5-.2.5-.5V1c0-.3-.2-.5-.5-.5z"/><path fill="currentColor" d="M5 7h2v2H5zm4 0h2v2H9zM5 3h2v2H5zm4 0h2v2H9z"/>
  </GardenSvg>
);

/** Garden : calendar-stroke */
export const Calendar: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4 0a1 1 0 0 0-1 1v1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2V1a1 1 0 1 0-2 0v1H5V1a1 1 0 0 0-1-1Zm7 4a1 1 0 1 0 2 0V3h2v12H1V3h2v1a1 1 0 0 0 2 0V3h6v1Z"/>
  </GardenSvg>
);

/** Garden : check-circle-stroke */
export const CalendarCheck: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 9l2.5 2.5 5-5"/><circle cx="7.5" cy="8.5" r="7"/></g>
  </GardenSvg>
);

/** Garden : clock-stroke */
export const CalendarClock: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7.5"/><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v5.5H11"/></g>
  </GardenSvg>
);

/** Garden : calendar-stroke */
export const CalendarDays: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4 0a1 1 0 0 0-1 1v1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2V1a1 1 0 1 0-2 0v1H5V1a1 1 0 0 0-1-1Zm7 4a1 1 0 1 0 2 0V3h2v12H1V3h2v1a1 1 0 0 0 2 0V3h6v1Z"/>
  </GardenSvg>
);

/** Garden : x-circle-stroke */
export const CalendarMinus: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="7.5" cy="8.5" r="7"/><path strokeLinecap="round" d="M4.5 11.5l6-6m0 6l-6-6"/></g>
  </GardenSvg>
);

/** Garden : plus-circle-stroke */
export const CalendarPlus: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <circle cx="7.5" cy="8.5" r="7" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" strokeLinecap="round" d="M7.5 4.5v8m4-4h-8"/>
  </GardenSvg>
);

/** Garden : plus-circle-stroke */
export const CalendarPlus2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <circle cx="7.5" cy="8.5" r="7" fill="none" stroke="currentColor"/><path fill="none" stroke="currentColor" strokeLinecap="round" d="M7.5 4.5v8m4-4h-8"/>
  </GardenSvg>
);

/** Garden : calendar-stroke */
export const CalendarRange: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4 0a1 1 0 0 0-1 1v1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2V1a1 1 0 1 0-2 0v1H5V1a1 1 0 0 0-1-1Zm7 4a1 1 0 1 0 2 0V3h2v12H1V3h2v1a1 1 0 0 0 2 0V3h6v1Z"/>
  </GardenSvg>
);

/** Garden : reload-stroke */
export const CalendarSync: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M13.1 12c-1.2 1.5-3 2.5-5.1 2.5-3.6 0-6.5-2.9-6.5-6.5S4.4 1.5 8 1.5c2.2 0 4.1 1.1 5.3 2.7m.2-3.7V4c0 .3-.2.5-.5.5H9.5"/>
  </GardenSvg>
);

/** Garden : x-circle-stroke */
export const CalendarX: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="7.5" cy="8.5" r="7"/><path strokeLinecap="round" d="M4.5 11.5l6-6m0 6l-6-6"/></g>
  </GardenSvg>
);

/** Garden : check-lg-stroke */
export const Check: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M1 9l4 4L15 3"/>
  </GardenSvg>
);

/** Garden : check-circle-stroke */
export const CheckCircle2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 9l2.5 2.5 5-5"/><circle cx="7.5" cy="8.5" r="7"/></g>
  </GardenSvg>
);

/** Garden : chevron-down-stroke */
export const ChevronDown: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M12.688 5.61a.5.5 0 01.69.718l-.066.062-5 4a.5.5 0 01-.542.054l-.082-.054-5-4a.5.5 0 01.55-.83l.074.05L8 9.359l4.688-3.75z"/>
  </GardenSvg>
);

/** Garden : chevron-left-stroke */
export const ChevronLeft: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M10.39 12.688a.5.5 0 01-.718.69l-.062-.066-4-5a.5.5 0 01-.054-.542l.054-.082 4-5a.5.5 0 01.83.55l-.05.074L6.641 8l3.75 4.688z"/>
  </GardenSvg>
);

/** Garden : chevron-right-stroke */
export const ChevronRight: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M5.61 3.312a.5.5 0 01.718-.69l.062.066 4 5a.5.5 0 01.054.542l-.054.082-4 5a.5.5 0 01-.83-.55l.05-.074L9.359 8l-3.75-4.688z"/>
  </GardenSvg>
);

/** Garden : alert-error-stroke */
export const CircleAlert: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="7.5" cy="8.5" r="7"/><path strokeLinecap="round" d="M7.5 4.5V9"/></g><circle cx="7.5" cy="12" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : clock-stroke */
export const Clock: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7.5"/><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v5.5H11"/></g>
  </GardenSvg>
);

/** Garden : clock-stroke */
export const Clock3: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7.5"/><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v5.5H11"/></g>
  </GardenSvg>
);

/** Garden : copy-stroke */
export const Copy: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M3.5 10a.5.5 0 110 1H1a1 1 0 01-1-1V1a1 1 0 011-1h9a1 1 0 011 1v2.5a.5.5 0 11-1 0V1H1v9h2.5zM6 6v9h9V6H6zm0-1h9a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1z"/>
  </GardenSvg>
);

/** Garden : new-window-stroke */
export const ExternalLink: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M14.5 10.5V14c0 .3-.2.5-.5.5H2c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5h3.5"/><path fill="none" stroke="currentColor" strokeLinecap="round" d="M8 8l6.5-6.5"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M8.5 1.5h6v6"/>
  </GardenSvg>
);

/** Garden : eye-stroke */
export const Eye: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="2.5"/><path strokeLinecap="round" d="M15.42 8.29c.12-.18.12-.4 0-.58-.7-1-3.28-4.21-7.42-4.21S1.28 6.71.58 7.71c-.12.18-.12.4 0 .58.7 1 3.28 4.21 7.42 4.21s6.72-3.21 7.42-4.21z"/></g>
  </GardenSvg>
);

/** Garden : eye-hide-stroke */
export const EyeOff: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M5.22 12.549c.856.29 1.783.451 2.78.451 3.462 0 6.094-1.955 7.826-4.433a1.013 1.013 0 0 0 0-1.134c-.74-1.06-1.646-2.024-2.71-2.78l-.725.724c1.029.7 1.901 1.618 2.604 2.632C13.438 10.234 11.06 12 8 12a7.59 7.59 0 0 1-1.975-.257l-.806.806ZM6.955 10.813a3 3 0 0 0 3.858-3.858l-.825.825A2 2 0 0 1 7.78 9.988l-.825.825ZM6.012 8.22l-.825.825a3 3 0 0 1 3.858-3.858l-.825.825A2 2 0 0 0 6.012 8.22ZM9.975 4.257A7.61 7.61 0 0 0 8 4C4.938 4 2.558 5.769 1.007 7.987c.702 1.016 1.574 1.935 2.603 2.636l-.726.725C1.82 10.59.914 9.628.173 8.568a1.017 1.017 0 0 1 .006-1.145C1.905 4.955 4.537 3 8 3a8.63 8.63 0 0 1 2.782.452l-.806.805ZM1.854 14.854a.5.5 0 0 1-.708-.708l13-13a.5.5 0 0 1 .708.708l-13 13Z"/>
  </GardenSvg>
);

/** Garden : file-document-stroke */
export const FileText: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M4.5 7.5h7m-7 1.97h7m-7 2h7m3-7.27V15c0 .28-.22.5-.5.5H2c-.28 0-.5-.22-.5-.5V1c0-.28.22-.5.5-.5h8.85c.13 0 .26.05.36.15l3.15 3.2c.09.1.14.22.14.35zm-4-3.7V4c0 .28.22.5.5.5h3.5"/>
  </GardenSvg>
);

/** Garden : globe-stroke */
export const Globe: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7.5"/><path d="M1.5 4.5h13m-13 7h13"/><ellipse cx="8" cy="8" rx="2.5" ry="7.5"/></g>
  </GardenSvg>
);

/** Garden : grip */
export const GripVertical: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="currentColor"><rect width="2" height="2" x="5" y="1" rx=".5" ry=".5"/><rect width="2" height="2" x="9" y="1" rx=".5" ry=".5"/><rect width="2" height="2" x="5" y="5" rx=".5" ry=".5"/><rect width="2" height="2" x="9" y="5" rx=".5" ry=".5"/><rect width="2" height="2" x="5" y="9" rx=".5" ry=".5"/><rect width="2" height="2" x="9" y="9" rx=".5" ry=".5"/><rect width="2" height="2" x="5" y="13" rx=".5" ry=".5"/><rect width="2" height="2" x="9" y="13" rx=".5" ry=".5"/></g>
  </GardenSvg>
);

/** Garden : history-stroke */
export const History: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M8 0a8 8 0 11-8 8 .5.5 0 011 0 7 7 0 107-7C5.749 1 3.915 2.063 2.597 4H4.5a.5.5 0 01.492.41L5 4.5a.5.5 0 01-.41.492L4.5 5h-3a.5.5 0 01-.492-.41L1 4.5v-3a.5.5 0 01.992-.09L2 1.5v1.615C3.482 1.118 5.53 0 8 0zm-.5 4.5a.5.5 0 01.492.41L8 5v3.359l2.812 2.25a.5.5 0 01.128.628l-.05.075a.5.5 0 01-.627.128l-.075-.05-3-2.4a.5.5 0 01-.18-.3L7 8.6V5a.5.5 0 01.5-.5z"/>
  </GardenSvg>
);

/** Garden : image-stroke */
export const Image: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="15" height="13" x=".5" y="1.5" rx=".5" ry=".5"/><path d="M.5 14l5.15-5.15a.5.5 0 01.71 0l3.29 3.29a.5.5 0 00.71 0l1.29-1.29a.5.5 0 01.71 0L15.5 14"/></g><circle cx="11.5" cy="5.5" r="1.5" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : upload-stroke */
export const ImageUp: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M8.5 14.5V9m2.5 5.5c2.49 0 4.5-2.01 4.5-4.5S13.49 5.5 11 5.5c-.21 0-.42.03-.62.06-.43-1.75-2-3.06-3.88-3.06-2.21 0-4 1.79-4 4 0 .44.09.85.22 1.25A3.49 3.49 0 00.5 11c0 1.93 1.57 3.5 3.5 3.5h2M6 11l2.15-2.15c.2-.2.51-.2.71 0L11 11"/>
  </GardenSvg>
);

/** Garden : inbox-stroke */
export const Inbox: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="13" height="15" x="1.5" y=".5" rx=".5" ry=".5"/><path strokeLinecap="round" d="M1.5 10.5h3V12a.5.5 0 00.5.5h6a.5.5 0 00.5-.5v-1.5h3m-10-7h7m-7 2h7m-7 2h7"/></g>
  </GardenSvg>
);

/** Garden : info-stroke */
export const Info: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g stroke="currentColor"><circle cx="7.5" cy="8.5" r="7" fill="none"/><path strokeLinecap="round" d="M7.5 12.5V8"/></g><circle cx="7.5" cy="5" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : panels-stroke */
export const KanbanSquare: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinejoin="round" d="M14 15.5H2c-.3 0-.5-.2-.5-.5V1c0-.3.2-.5.5-.5h12c.3 0 .5.2.5.5v14c0 .3-.2.5-.5.5zM7.5.5v15m-6-4h6m0-7h7"/>
  </GardenSvg>
);

/** Garden : lock-locked-stroke */
export const KeyRound: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="11" height="8" x="2.5" y="7.5" rx=".5" ry=".5"/><path d="M4.5 7.5V4a3.5 3.5 0 017 0v3.5"/></g>
  </GardenSvg>
);

/** Garden : monitor-stroke */
export const Laptop: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="15" height="10" x=".5" y=".5" rx=".5" ry=".5"/><path strokeLinecap="round" d="M11.5 15.5a3.54 3.54 0 00-7 0"/></g>
  </GardenSvg>
);

/** Garden : monitor-stroke */
export const LaptopMinimal: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="15" height="10" x=".5" y=".5" rx=".5" ry=".5"/><path strokeLinecap="round" d="M11.5 15.5a3.54 3.54 0 00-7 0"/></g>
  </GardenSvg>
);

/** Garden : grid-2x2-stroke */
export const LayoutDashboard: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M1 1v5h5V1H1zm5 8a1 1 0 011 1v5a1 1 0 01-1 1H1a1 1 0 01-1-1v-5a1 1 0 011-1h5zm9 0a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5a1 1 0 011-1h5zm-9 1H1v5h5v-5zm9 0h-5v5h5v-5zM6 0a1 1 0 011 1v5a1 1 0 01-1 1H1a1 1 0 01-1-1V1a1 1 0 011-1h5zm9 0a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V1a1 1 0 011-1h5zm0 1h-5v5h5V1z"/>
  </GardenSvg>
);

/** Garden : link-stroke */
export const Link2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M4.441 7.38l.095.083.939.939-.708.707-.939-.939-2 2-.132.142a2.829 2.829 0 003.99 3.99l.142-.132 2-2-.939-.939.707-.708.94.94a1 1 0 01.083 1.32l-.083.094-2 2A3.828 3.828 0 01.972 9.621l.15-.158 2-2A1 1 0 014.34 7.31l.101.07zm7.413-3.234a.5.5 0 01.057.638l-.057.07-7 7a.5.5 0 01-.765-.638l.057-.07 7-7a.5.5 0 01.708 0zm3.023-3.025a3.829 3.829 0 01.15 5.257l-.15.158-2 2a1 1 0 01-1.32.083l-.094-.083-.94-.94.708-.707.939.94 2-2 .132-.142a2.829 2.829 0 00-3.99-3.99l-.142.131-2 2 .939.939-.707.708-.94-.94a1 1 0 01-.082-1.32l.083-.094 2-2a3.828 3.828 0 015.414 0z"/>
  </GardenSvg>
);

/** Garden : lock-locked-stroke */
export const Lock: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="11" height="8" x="2.5" y="7.5" rx=".5" ry=".5"/><path d="M4.5 7.5V4a3.5 3.5 0 017 0v3.5"/></g>
  </GardenSvg>
);

/** Garden : exit-stroke */
export const LogOut: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M.7 2.4l2-1.7c.3-.3.8 0 .8.4V15c0 .4-.5.7-.8.4l-2-1.7c-.1-.1-.2-.2-.2-.4V2.7c0-.1.1-.3.2-.3zm2.8.1H9c.3 0 .5.2.5.5v2.5m-6 8H9c.3 0 .5-.2.5-.5v-2.5M15 8H7m5.5-3l2.6 2.6c.2.2.2.5 0 .7L12.5 11"/>
  </GardenSvg>
);

/** Garden : email-stroke */
export const Mail: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M15 2a1 1 0 011 1v10a1 1 0 01-1 1H1a1 1 0 01-1-1V3a1 1 0 011-1h14zm0 1.707l-6.285 6.295a1 1 0 01-1.419.002L1 3.707v8.585l3.146-3.146a.5.5 0 11.708.708L1.706 13h12.587l-3.147-3.146a.5.5 0 01.708-.708L15 12.293V3.707zM14.292 3H1.707l6.298 6.298L14.292 3z"/>
  </GardenSvg>
);

/** Garden : document-search-stroke */
export const MailSearch: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M10.8563807,0.000981435985 C11.122553,0.000981435985 11.3787188,0.105981436 11.5728445,0.300981436 L14.7408953,3.51698144 C14.9130068,3.70698144 15.009069,3.94598144 15.009069,4.20098144 L15.009069,7.50098144 C15.009069,7.77712381 14.7850663,8.00098144 14.5087451,8.00098144 C14.2324238,8.00098144 14.0084212,7.77712381 14.0084212,7.50098144 L14.0084212,5.00098144 L11.0064778,5.00098144 C10.4501177,5.00098144 10.00583,4.55698144 10.00583,4.00098144 L10.00583,1.00298144 L2.00064778,1.00098144 L2.00064778,15.0009814 L10.5061539,15.0009814 C10.7824752,15.0009814 11.0064778,15.2248391 11.0064778,15.5009814 C11.0064778,15.7771238 10.7824752,16.0009814 10.5061539,16.0009814 L2.00064778,16.0009814 C1.44428762,16.0009814 1,15.5569814 1,15.0009814 L1,1.00098144 C1,0.444981436 1.44428762,0.000981435985 2.00064778,0.000981435985 L10.8563807,0.000981435985 Z M12.8008455,7.85689259 C14.1893009,9.06031404 14.410713,11.1316063 13.3079677,12.6009814 L13.3620027,12.6469814 L15.8536157,15.1379814 C15.9799909,15.2644535 16.0292507,15.4486951 15.9828393,15.6213044 C15.936428,15.7939137 15.8013965,15.9286672 15.62861,15.9748044 C15.4558235,16.0209417 15.2715322,15.9714535 15.145157,15.8449814 L12.6535441,13.3549814 C12.6375337,13.3379814 12.6215233,13.3199814 12.6075143,13.3009814 C11.1371873,14.4030128 9.0645533,14.1817441 7.86035229,12.7941875 C6.65615129,11.4066309 6.73007929,9.32486412 8.02967702,8.0261077 C9.32927475,6.72735128 11.4123901,6.65347114 12.8008455,7.85689259 Z M10.5061539,8.00098144 C9.12454766,8.00098144 8.00453448,9.12026956 8.00453448,10.5009814 C8.00453448,11.8816933 9.12454766,13.0009814 10.5061539,13.0009814 C11.8877602,13.0009814 13.0077734,11.8816933 13.0077734,10.5009814 C13.0077734,9.12026956 11.8877602,8.00098144 10.5061539,8.00098144 Z M5.50291502,11.0009814 C5.77923628,11.0009814 6.00323891,11.2248391 6.00323891,11.5009814 C6.00323891,11.7771238 5.77923628,12.0009814 5.50291502,12.0009814 L4.50226724,12.0009814 C4.22594598,12.0009814 4.00194335,11.7771238 4.00194335,11.5009814 C4.00194335,11.2248391 4.22594598,11.0009814 4.50226724,11.0009814 L5.50291502,11.0009814 Z M5.50291502,9.00098144 C5.77923628,9.00098144 6.00323891,9.22483906 6.00323891,9.50098144 C6.00323891,9.77712381 5.77923628,10.0009814 5.50291502,10.0009814 L4.50226724,10.0009814 C4.22594598,10.0009814 4.00194335,9.77712381 4.00194335,9.50098144 C4.00194335,9.22483906 4.22594598,9.00098144 4.50226724,9.00098144 L5.50291502,9.00098144 Z M6.5035628,7.00098144 C6.77988406,7.00098144 7.00388669,7.22483906 7.00388669,7.50098144 C7.00388669,7.77712381 6.77988406,8.00098144 6.5035628,8.00098144 L4.50226724,8.00098144 C4.22594598,8.00098144 4.00194335,7.77712381 4.00194335,7.50098144 C4.00194335,7.22483906 4.22594598,7.00098144 4.50226724,7.00098144 L6.5035628,7.00098144 Z M11.0064778,1.70798144 L11.0064778,4.00098144 L13.3009632,4.00098144 L11.0064778,1.70798144 Z"/>
  </GardenSvg>
);

/** Garden : location-stroke */
export const MapPin: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="6.5" r="2"/><path strokeLinejoin="round" d="M8 .5a5.9 5.9 0 00-6 5.83c0 2.17 1 3.3 2.19 4.89s2.64 3 3.8 4.28c1.17-1.31 2.62-2.76 3.81-4.28S14 8.5 14 6.33A6.19 6.19 0 008 .5z"/></g>
  </GardenSvg>
);

/** Garden : location-stroke */
export const MapPinned: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="6.5" r="2"/><path strokeLinejoin="round" d="M8 .5a5.9 5.9 0 00-6 5.83c0 2.17 1 3.3 2.19 4.89s2.64 3 3.8 4.28c1.17-1.31 2.62-2.76 3.81-4.28S14 8.5 14 6.33A6.19 6.19 0 008 .5z"/></g>
  </GardenSvg>
);

/** Garden : menu-stroke */
export const Menu: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M1.5 3.5h13m-13 4h13m-13 4h13"/>
  </GardenSvg>
);

/** Garden : speech-bubble-plain-stroke */
export const MessageSquare: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M1 .5h14c.3 0 .5.2.5.5v10c0 .3-.2.5-.5.5H8l-3.6 3.6c-.3.3-.9.1-.9-.4v-3.3H1c-.3 0-.5-.2-.5-.5V1C.5.7.7.5 1 .5z"/>
  </GardenSvg>
);

/** Garden : monitor-stroke */
export const MonitorSmartphone: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><rect width="15" height="10" x=".5" y=".5" rx=".5" ry=".5"/><path strokeLinecap="round" d="M11.5 15.5a3.54 3.54 0 00-7 0"/></g>
  </GardenSvg>
);

/** Garden : pencil-stroke */
export const PencilLine: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinejoin="round" d="M.5 15.5V13L12.6.9c.2-.2.5-.2.7 0l1.8 1.8c.2.2.2.5 0 .7L3 15.5H.5zM11 3l2 2"/>
  </GardenSvg>
);

/** Garden : phone-stroke */
export const Phone: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M10 10.586l1.293-1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-1.232 1.232a3.5 3.5 0 01-4.95 0L1.061 6.475a3.5 3.5 0 010-4.95L2.293.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414L5.414 6 10 10.586zM3 1L1.768 2.232a2.5 2.5 0 000 3.536l8.464 8.464a2.5 2.5 0 003.536 0L15 13l-3-3-2 2-6-6 2-2-3-3z"/>
  </GardenSvg>
);

/** Garden : plus-stroke */
export const Plus: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path stroke="currentColor" strokeLinecap="round" d="M7.5 2.5v12m6-6h-12"/>
  </GardenSvg>
);

/** Garden : reload-stroke */
export const RefreshCw: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M13.1 12c-1.2 1.5-3 2.5-5.1 2.5-3.6 0-6.5-2.9-6.5-6.5S4.4 1.5 8 1.5c2.2 0 4.1 1.1 5.3 2.7m.2-3.7V4c0 .3-.2.5-.5.5H9.5"/>
  </GardenSvg>
);

/** Garden : edit-undo-stroke */
export const RotateCcw: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M15.5 11.2c0-4.3-3.5-7.8-7.8-7.8-2.6.1-5.2 1.5-6.7 3.7M.5 3v4c0 .3.2.5.5.5h4"/>
  </GardenSvg>
);

/** Garden : check-lg-stroke */
export const Save: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M1 9l4 4L15 3"/>
  </GardenSvg>
);

/** Garden : search-stroke */
export const Search: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <circle cx="6" cy="6" r="5.5" fill="none" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" d="M15 15l-5-5"/>
  </GardenSvg>
);

/** Garden : email-stroke */
export const Send: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M15 2a1 1 0 011 1v10a1 1 0 01-1 1H1a1 1 0 01-1-1V3a1 1 0 011-1h14zm0 1.707l-6.285 6.295a1 1 0 01-1.419.002L1 3.707v8.585l3.146-3.146a.5.5 0 11.708.708L1.706 13h12.587l-3.147-3.146a.5.5 0 01.708-.708L15 12.293V3.707zM14.292 3H1.707l6.298 6.298L14.292 3z"/>
  </GardenSvg>
);

/** Garden : gear-stroke */
export const Settings: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M13.17 3.07l-1.64.71c-.48-.4-1.03-.72-1.63-.94l-.22-1.79a.511.511 0 00-.4-.44C8.86.54 8.44.5 8 .5c-.44 0-.86.04-1.28.11-.22.04-.38.22-.4.44l-.21 1.79c-.6.22-1.15.54-1.63.94l-1.65-.71a.491.491 0 00-.58.13c-.55.65-.99 1.4-1.29 2.21-.08.21 0 .44.18.58l1.45 1.08a4.91 4.91 0 000 1.87l-1.45 1.08c-.18.13-.25.37-.18.58.3.81.74 1.55 1.28 2.2.14.17.38.22.58.13l1.65-.71c.48.4 1.03.72 1.63.94l.21 1.79c.03.22.19.4.4.44.43.07.85.11 1.29.11.44 0 .86-.04 1.28-.11.22-.04.38-.22.4-.44l.21-1.79c.6-.22 1.15-.54 1.63-.94l1.65.71c.2.09.44.04.58-.13.54-.65.98-1.39 1.28-2.2.08-.21 0-.44-.18-.57L13.4 8.95c.07-.32.1-.63.1-.95s-.03-.63-.09-.94l1.45-1.08c.18-.13.25-.37.18-.58-.3-.81-.74-1.55-1.28-2.2a.51.51 0 00-.59-.13z"/><circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor"/>
  </GardenSvg>
);

/** Garden : gear-stroke */
export const Settings2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M13.17 3.07l-1.64.71c-.48-.4-1.03-.72-1.63-.94l-.22-1.79a.511.511 0 00-.4-.44C8.86.54 8.44.5 8 .5c-.44 0-.86.04-1.28.11-.22.04-.38.22-.4.44l-.21 1.79c-.6.22-1.15.54-1.63.94l-1.65-.71a.491.491 0 00-.58.13c-.55.65-.99 1.4-1.29 2.21-.08.21 0 .44.18.58l1.45 1.08a4.91 4.91 0 000 1.87l-1.45 1.08c-.18.13-.25.37-.18.58.3.81.74 1.55 1.28 2.2.14.17.38.22.58.13l1.65-.71c.48.4 1.03.72 1.63.94l.21 1.79c.03.22.19.4.4.44.43.07.85.11 1.29.11.44 0 .86-.04 1.28-.11.22-.04.38-.22.4-.44l.21-1.79c.6-.22 1.15-.54 1.63-.94l1.65.71c.2.09.44.04.58-.13.54-.65.98-1.39 1.28-2.2.08-.21 0-.44-.18-.57L13.4 8.95c.07-.32.1-.63.1-.95s-.03-.63-.09-.94l1.45-1.08c.18-.13.25-.37.18-.58-.3-.81-.74-1.55-1.28-2.2a.51.51 0 00-.59-.13z"/><circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor"/>
  </GardenSvg>
);

/** Garden : shapes-stroke */
export const Shapes: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M6 9a1 1 0 011 1v5a1 1 0 01-1 1H1a1 1 0 01-1-1v-5a1 1 0 011-1h5zm6.25-.5a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zM6 10H1v5h5v-5zm6.25-.5a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5zM8.857.486l3 5A1 1 0 0111 7H5a1 1 0 01-.857-1.514l3-5a1 1 0 011.714 0zM8 1L5 6h6L8 1z"/>
  </GardenSvg>
);

/** Garden : shield-stroke */
export const ShieldAlert: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M8 15.5S14.5 13 14.5 5V3L8 .5 1.5 3v2C1.5 13 8 15.5 8 15.5z"/>
  </GardenSvg>
);

/** Garden : check-badge-stroke */
export const ShieldCheck: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M5.063 2.616l-1.47.002-.147.005a1.977 1.977 0 00-1.828 1.971l-.002 1.469-1.038 1.04-.115.126A1.977 1.977 0 00.58 9.898l1.037 1.037.002 1.471.005.148a1.977 1.977 0 001.971 1.828l1.468-.001 1.04 1.04.126.116a1.977 1.977 0 002.67-.116l1.036-1.04 1.471.001.148-.005a1.977 1.977 0 001.83-1.971l-.002-1.472 1.04-1.036.115-.126a1.977 1.977 0 00-.115-2.67l-1.04-1.04.001-1.467-.005-.148a1.977 1.977 0 00-1.971-1.83l-1.471-.001-1.037-1.037a1.976 1.976 0 00-2.796 0l-1.04 1.037zm3.127-.33l1.331 1.331h1.885c.539 0 .976.438.976.977v1.883l1.332 1.333c.381.38.381 1 0 1.38l-1.333 1.331.001 1.885a.976.976 0 01-.976.976H9.52l-1.33 1.332a.976.976 0 01-1.381 0l-1.333-1.333-1.883.001a.976.976 0 01-.976-.976l-.001-1.885-1.331-1.33a.976.976 0 010-1.381l1.331-1.333V4.594c0-.539.438-.976.977-.976l1.883-.001L6.81 2.286a.976.976 0 011.38 0zm2.664 3.86a.5.5 0 010 .708l-4 4a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L6.5 9.793l3.646-3.647a.5.5 0 01.708 0z"/>
  </GardenSvg>
);

/** Garden : mobile-phone-stroke */
export const Smartphone: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <rect width="9" height="15" x="3.5" y=".5" fill="none" stroke="currentColor" rx=".5" ry=".5"/><path fill="currentColor" d="M3.5.5h9V2h-9zm0 12.5v2.5h9V13h-9zm6 2h-3c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h3c.3 0 .5.2.5.5s-.2.5-.5.5z"/>
  </GardenSvg>
);

/** Garden : sparkle-stroke */
export const Sparkles: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M1 7.513a1 1 0 0 1 .69-.953l2.583-.844a3.95 3.95 0 0 0 2.465-2.457l.808-2.56A1 1 0 0 1 9.452.695l.832 2.598a3.906 3.906 0 0 0 2.448 2.453l2.569.811a1 1 0 0 1 .004 1.906l-2.572.823a3.896 3.896 0 0 0-2.449 2.454l-.82 2.565a1 1 0 0 1-1.9.014l-.866-2.567v-.002A3.972 3.972 0 0 0 4.24 9.284l-2.547-.821A1 1 0 0 1 1 7.513Zm3.557.823a4.96 4.96 0 0 1 3.087 3.092L8.511 14l.823-2.572a4.906 4.906 0 0 1 3.088-3.092L15 7.51l-2.578-.814a4.895 4.895 0 0 1-3.088-3.093L8.5 1l-.813 2.572A4.96 4.96 0 0 1 4.59 6.664L2 7.511l2.557.825ZM2.499 11a.5.5 0 0 1 .477.348l.256.797a1.01 1.01 0 0 0 .63.633l.789.248a.5.5 0 0 1 .001.954l-.79.252a1.007 1.007 0 0 0-.63.633l-.252.787a.5.5 0 0 1-.95.008l-.266-.79a1.034 1.034 0 0 0-.636-.639l-.781-.252a.5.5 0 0 1-.002-.95l.794-.26a1.023 1.023 0 0 0 .636-.634l.248-.786A.5.5 0 0 1 2.5 11Z"/>
  </GardenSvg>
);

/** Garden : mobile-phone-stroke */
export const Tablet: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <rect width="9" height="15" x="3.5" y=".5" fill="none" stroke="currentColor" rx=".5" ry=".5"/><path fill="currentColor" d="M3.5.5h9V2h-9zm0 12.5v2.5h9V13h-9zm6 2h-3c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h3c.3 0 .5.2.5.5s-.2.5-.5.5z"/>
  </GardenSvg>
);

/** Garden : tag-stroke */
export const Tag: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M.5 1v5.3c0 .1.1.3.1.4l8.5 8.5c.2.2.5.2.7 0l5.3-5.3c.2-.2.2-.5 0-.7L6.6.6S6.4.5 6.3.5H1C.7.5.5.7.5 1z"/><circle cx="4" cy="4" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : clock-cycle-stroke */
export const TimerReset: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M15.5 11a.5.5 0 01.5.5 2.5 2.5 0 01-2.336 2.495L13.5 14H9.707l1.147 1.146a.5.5 0 01.057.638l-.057.07a.5.5 0 01-.638.057l-.07-.057-2-2a.5.5 0 01-.057-.638l.057-.07 2-2a.5.5 0 01.765.638l-.057.07L9.707 13H13.5a1.5 1.5 0 001.5-1.5.5.5 0 01.5-.5zM6 0a6 6 0 015.917 7H10.9A5 5 0 107 10.9v1.017A6 6 0 116 0zm7.784 6.089l.07.057 2 2a.5.5 0 01.057.638l-.057.07-2 2a.5.5 0 01-.765-.638l.057-.07L14.293 9H10.5A1.5 1.5 0 009 10.5a.5.5 0 11-1 0 2.5 2.5 0 012.336-2.495L10.5 8l3.793-.001-1.147-1.145a.5.5 0 01-.057-.638l.057-.07a.5.5 0 01.638-.057zM6.5 2a.5.5 0 01.492.41L7 2.5v4a.5.5 0 01-.41.492L6.5 7h-3a.5.5 0 01-.09-.992L3.5 6H6V2.5a.5.5 0 01.41-.492L6.5 2z"/>
  </GardenSvg>
);

/** Garden : trash-stroke */
export const Trash2: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M6.5 2.5V1c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5v1.5M3 2.5h10m-6.5 11v-8m3 8v-8m-6-1V15c0 .3.2.5.5.5h8c.3 0 .5-.2.5-.5V4.5"/>
  </GardenSvg>
);

/** Garden : alert-warning-stroke */
export const TriangleAlert: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" d="M.88 13.77L7.06 1.86c.19-.36.7-.36.89 0l6.18 11.91c.17.33-.07.73-.44.73H1.32c-.37 0-.61-.4-.44-.73zM7.5 6v3.5"/><circle cx="7.5" cy="12" r="1" fill="currentColor"/>
  </GardenSvg>
);

/** Garden : link-remove-stroke */
export const Unlink: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M.784 2.089l.07.057L7 8.293l4.146-4.147.07-.057a.5.5 0 01.695.695l-.057.07L7.707 9l6.147 6.146a.5.5 0 01-.638.765l-.07-.057-3.795-3.796-2.815 2.816a3.829 3.829 0 01-5.257.15l-.158-.15a3.829 3.829 0 01-.149-5.256l.15-.158 2.815-2.816-3.79-3.79a.5.5 0 01.637-.765zm3.86 5.262l-2.816 2.816-.132.142a2.829 2.829 0 003.99 3.99l.142-.132 2.816-2.816L7 9.707l-2.146 2.147-.07.057a.5.5 0 01-.695-.695l.057-.07L6.293 9 4.644 7.351zm10.233-6.23a3.829 3.829 0 01.15 5.257l-.15.158-2 2a1 1 0 01-1.32.083l-.094-.083-.94-.94.708-.707.939.94 2-2 .132-.142a2.829 2.829 0 00-3.99-3.99l-.142.131-2 2 .939.939-.707.708-.94-.94a1 1 0 01-.082-1.32l.083-.094 2-2a3.828 3.828 0 015.414 0z"/>
  </GardenSvg>
);

/** Garden : user-solo-stroke */
export const User: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="5" r="3.5"/><path strokeLinecap="round" d="M2.5 15.5c.3-2.8 2.6-5 5.5-5s5.2 2.2 5.5 5"/></g>
  </GardenSvg>
);

/** Garden : user-circle-stroke */
export const UserCircle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7.5"/><circle cx="8" cy="5.5" r="2"/><path strokeLinecap="round" d="M11.5 12c-.6-1.5-1.8-2.5-3.5-2.5s-2.9 1-3.5 2.5"/></g>
  </GardenSvg>
);

/** Garden : user-list-stroke */
export const UserCog: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="5" cy="5" r="2.5"/><path strokeLinecap="round" d="M9.5 5.5h6m-6 3h6m-4 3h4m-6 2c-.2-2.3-2.2-4-4.5-4s-4.3 1.8-4.5 4"/></g>
  </GardenSvg>
);

/** Garden : user-follow-stroke */
export const UserPlus: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M5 10c2.585 0 4.778 1.923 4.998 4.457a.5.5 0 01-.996.086C8.827 12.536 7.076 11 5 11c-2.035 0-3.825 1.597-4.002 3.545a.5.5 0 11-.996-.09C.226 11.986 2.452 10 5 10zm0-7a3 3 0 110 6 3 3 0 010-6zm0 1a2 2 0 100 4 2 2 0 000-4zM12.41.008L12.5 0a.5.5 0 01.492.41L13 .5V3h2.5a.5.5 0 01.09.992L15.5 4H13v2.5a.5.5 0 01-.41.492L12.5 7a.5.5 0 01-.492-.41L12 6.5V4H9.5a.5.5 0 01-.09-.992L9.5 3H12V.5a.5.5 0 01.41-.492L12.5 0z"/>
  </GardenSvg>
);

/** Garden : user-solo-stroke */
export const UserRound: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="8" cy="5" r="3.5"/><path strokeLinecap="round" d="M2.5 15.5c.3-2.8 2.6-5 5.5-5s5.2 2.2 5.5 5"/></g>
  </GardenSvg>
);

/** Garden : user-group-stroke */
export const Users: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="11" cy="6" r="2.5"/><circle cx="4.5" cy="3.5" r="2"/><path strokeLinecap="round" d="M15.5 14.5c-.2-2.2-2.2-4-4.5-4s-4.3 1.8-4.5 4m1-5c-.4-1.2-1.7-2-3-2s-2.6.8-3 2"/></g>
  </GardenSvg>
);

/** Garden : video-stroke */
export const Video: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="currentColor" d="M11 4a1 1 0 0 1 1 1v1.6l3.315-1.326a.5.5 0 0 1 .685.464v4.524l-.004.064a.5.5 0 0 1-.62.42l-.061-.02L12 9.399V11a1 1 0 0 1-.898.995L11 12H1l-.103-.005A1 1 0 0 1 0 11V5a1 1 0 0 1 1-1h10ZM1 11h10V5H1v6Zm11-3.323v.645l3 1.2V6.477l-3 1.2Z"/>
  </GardenSvg>
);

/** Garden : adjust-stroke */
export const Wrench: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="4.5" cy="6.5" r="2"/><circle cx="11.5" cy="9.5" r="2"/><path strokeLinecap="round" d="M4.5.5v2m0 8v5m7-15v5m0 8v2"/></g>
  </GardenSvg>
);

/** Garden : x-stroke */
export const X: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path stroke="currentColor" strokeLinecap="round" d="M3 13L13 3m0 10L3 3"/>
  </GardenSvg>
);

/** Garden : x-circle-stroke */
export const XCircle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <g fill="none" stroke="currentColor"><circle cx="7.5" cy="8.5" r="7"/><path strokeLinecap="round" d="M4.5 11.5l6-6m0 6l-6-6"/></g>
  </GardenSvg>
);

/** Garden : lightning-bolt-stroke */
export const Zap: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" d="M12.17 7.5H9.5L12.96 1c.12-.28-.01-.5-.29-.5H7.5c-.28 0-.6.22-.71.5L4.21 7c-.11.28.01.5.29.5h2.45l-2.64 7.24c-.19.51-.04.95.59.38l7.29-6.87c.43-.4.4-.75-.02-.75z"/>
  </GardenSvg>
);
