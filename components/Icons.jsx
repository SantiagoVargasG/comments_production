// Iconos SVG inline (sin dependencia externa) usados en el rediseño de la tabla de reportes.
function Svg({ children, className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconSearch(props) {
  return <Svg {...props}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>;
}
export function IconTable(props) {
  return <Svg {...props}><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 10h18M9 4v16" /></Svg>;
}
export function IconKanban(props) {
  return <Svg {...props}><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M9 4v16M15 4v9" /></Svg>;
}
export function IconChevronRight(props) {
  return <Svg {...props}><path d="m9 18 6-6-6-6" /></Svg>;
}
export function IconChevronLeft(props) {
  return <Svg {...props}><path d="m15 18-6-6 6-6" /></Svg>;
}
export function IconBug(props) {
  return (
    <Svg {...props}>
      <path d="M9 9V7a3 3 0 0 1 6 0v2M8 9h8a1 1 0 0 1 1 1v6a5 5 0 0 1-10 0v-6a1 1 0 0 1 1-1Z" />
      <path d="M5 12H3M21 12h-2M6 6 4.5 4.5M18 6l1.5-1.5M6 18l-1.5 1.5M18 18l1.5 1.5" />
    </Svg>
  );
}
export function IconPalette(props) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h1.5A3.5 3.5 0 0 0 20.5 11c0-4.4-3.8-8-8.5-8Z" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}
export function IconLightbulb(props) {
  return (
    <Svg {...props}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.7 10.7c.5.4.7 1 .7 1.6V16h6v-.7c0-.6.2-1.2.7-1.6A6 6 0 0 0 12 3Z" />
    </Svg>
  );
}
export function IconPlus(props) {
  return <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>;
}
export function IconArrowUpDown(props) {
  return <Svg {...props}><path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></Svg>;
}
export function IconArrowUp(props) {
  return <Svg {...props}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>;
}
export function IconArrowDown(props) {
  return <Svg {...props}><path d="M12 5v14M5 12l7 7 7-7" /></Svg>;
}
