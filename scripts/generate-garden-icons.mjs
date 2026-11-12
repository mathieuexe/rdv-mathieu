/**
 * Génère `src/components/icons/index.tsx` à partir des icônes Zendesk Garden
 * (`@zendeskgarden/svg-icons`, jeu 16 px).
 *
 * Chaque icône devient un petit composant React sans dépendance : rien n'est
 * chargé à l'exécution et seules les icônes réellement utilisées sont incluses.
 * Pour ajouter une icône : complétez `ICONS` ci-dessous puis lancez
 * `npm run icons`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.resolve("node_modules/@zendeskgarden/svg-icons/src/16");
const OUTPUT = path.resolve("src/components/icons/index.tsx");

/**
 * Nom du composant → icône Garden. Les noms reprennent ceux de l'ancienne
 * bibliothèque (lucide-react) pour que les écrans n'aient pas à changer.
 * `flip: true` retourne l'icône horizontalement (Garden n'a qu'une flèche gauche).
 */
const ICONS = {
  Activity: "line-graph-stroke",
  AlertCircle: "alert-error-stroke",
  AlertTriangle: "alert-warning-stroke",
  ArrowRight: { garden: "arrow-left-stroke", flip: true },
  ArrowUpRight: "new-window-stroke",
  Ban: "circle-line-stroke",
  BarChart3: "bar-chart-stroke",
  Bell: "notification-stroke",
  BellRing: "notification-fill",
  Building2: "building-stroke",
  Calendar: "calendar-stroke",
  CalendarCheck: "check-circle-stroke",
  CalendarClock: "clock-stroke",
  CalendarDays: "calendar-stroke",
  CalendarMinus: "x-circle-stroke",
  CalendarPlus: "plus-circle-stroke",
  CalendarPlus2: "plus-circle-stroke",
  CalendarRange: "calendar-stroke",
  CalendarSync: "reload-stroke",
  CalendarX: "x-circle-stroke",
  Check: "check-lg-stroke",
  CheckCircle2: "check-circle-stroke",
  ChevronDown: "chevron-down-stroke",
  ChevronLeft: "chevron-left-stroke",
  ChevronRight: "chevron-right-stroke",
  CircleAlert: "alert-error-stroke",
  Clock: "clock-stroke",
  Clock3: "clock-stroke",
  Copy: "copy-stroke",
  ExternalLink: "new-window-stroke",
  Eye: "eye-stroke",
  EyeOff: "eye-hide-stroke",
  FileText: "file-document-stroke",
  Globe: "globe-stroke",
  GripVertical: "grip",
  History: "history-stroke",
  Image: "image-stroke",
  ImageUp: "upload-stroke",
  Inbox: "inbox-stroke",
  Info: "info-stroke",
  KanbanSquare: "panels-stroke",
  KeyRound: "lock-locked-stroke",
  Laptop: "monitor-stroke",
  LaptopMinimal: "monitor-stroke",
  LayoutDashboard: "grid-2x2-stroke",
  Link2: "link-stroke",
  Lock: "lock-locked-stroke",
  LogOut: "exit-stroke",
  Mail: "email-stroke",
  MailSearch: "document-search-stroke",
  MapPin: "location-stroke",
  MapPinned: "location-stroke",
  Menu: "menu-stroke",
  MessageSquare: "speech-bubble-plain-stroke",
  MonitorSmartphone: "monitor-stroke",
  PencilLine: "pencil-stroke",
  Phone: "phone-stroke",
  Plus: "plus-stroke",
  RefreshCw: "reload-stroke",
  RotateCcw: "edit-undo-stroke",
  Save: "check-lg-stroke",
  Search: "search-stroke",
  Send: "email-stroke",
  Settings: "gear-stroke",
  Settings2: "gear-stroke",
  Shapes: "shapes-stroke",
  ShieldAlert: "shield-stroke",
  ShieldCheck: "check-badge-stroke",
  Smartphone: "mobile-phone-stroke",
  Sparkles: "sparkle-stroke",
  Tablet: "mobile-phone-stroke",
  Tag: "tag-stroke",
  TimerReset: "clock-cycle-stroke",
  Trash2: "trash-stroke",
  TriangleAlert: "alert-warning-stroke",
  Unlink: "link-remove-stroke",
  User: "user-solo-stroke",
  UserCircle: "user-circle-stroke",
  UserCog: "user-list-stroke",
  UserPlus: "user-follow-stroke",
  UserRound: "user-solo-stroke",
  Users: "user-group-stroke",
  Video: "video-stroke",
  Wrench: "adjust-stroke",
  X: "x-stroke",
  XCircle: "x-circle-stroke",
  Zap: "lightning-bolt-stroke",
};

/** Attribut SVG → propriété JSX (stroke-linecap → strokeLinecap). */
function toJsxAttributes(markup) {
  return markup.replace(/ ([a-z]+(?:-[a-z]+)+)=/g, (_, name) => ` ${name.replace(/-([a-z])/g, (__, c) => c.toUpperCase())}=`);
}

function readInner(gardenName) {
  const svg = readFileSync(path.join(SOURCE_DIR, `${gardenName}.svg`), "utf8");
  const match = svg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);

  if (!match) {
    throw new Error(`SVG illisible : ${gardenName}`);
  }

  const inner = toJsxAttributes(match[2].trim().replace(/\s*\n\s*/g, ""));
  return { viewBox: match[1], inner };
}

const components = Object.entries(ICONS).map(([name, entry]) => {
  const { garden, flip } = typeof entry === "string" ? { garden: entry, flip: false } : entry;
  const { viewBox, inner } = readInner(garden);
  const body = flip ? `<g transform="matrix(-1 0 0 1 16 0)">${inner}</g>` : inner;

  return `/** Garden : ${garden}${flip ? " (retournée)" : ""} */
export const ${name}: IconComponent = (props) => (
  <GardenSvg viewBox="${viewBox}" {...props}>
    ${body}
  </GardenSvg>
);`;
});

const output = `/* Fichier généré par scripts/generate-garden-icons.mjs — ne pas modifier à la main. */
/* Icônes : Zendesk Garden (https://garden.zendesk.com), licence Apache-2.0. */
import type { ComponentType, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = ComponentType<IconProps>;

/**
 * Enveloppe commune : taille 16 px par défaut (la grille de dessin de Garden),
 * couleur héritée du texte, et icône ignorée par les lecteurs d'écran sauf si
 * un \`aria-label\` est fourni.
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
 * animer avec la classe \`animate-spin\`.
 */
export const LoaderCircle: IconComponent = (props) => (
  <GardenSvg viewBox="0 0 16 16" {...props}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M15 8a7 7 0 1 1-7-7" />
  </GardenSvg>
);

export const Loader2 = LoaderCircle;

${components.join("\n\n")}
`;

writeFileSync(OUTPUT, output);
console.log(`${Object.keys(ICONS).length + 2} icônes générées dans ${path.relative(process.cwd(), OUTPUT)}`);
