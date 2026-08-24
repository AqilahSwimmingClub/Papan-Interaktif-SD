export type AppIconName =
  | 'dashboard' | 'teachers' | 'backup' | 'key' | 'school' | 'profile' | 'ai'
  | 'students' | 'board' | 'quiz' | 'math' | 'draw' | 'timer' | 'points'
  | 'game' | 'lab' | 'worksheet' | 'questions';

export function AppIcon({ name, className = '' }: { name: AppIconName; className?: string }) {
  const isi = (() => {
    switch (name) {
      case 'dashboard': return <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>;
      case 'teachers': return <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>;
      case 'backup': return <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>;
      case 'key': return <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M15 8l3 3M18 5l2 2"/></>;
      case 'school': return <><path d="m3 10 9-6 9 6"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>;
      case 'profile': return <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>;
      case 'ai': return <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>;
      case 'students': return <><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a6 6 0 0 1 12 0v2M17 11h5M19.5 8.5v5"/></>;
      case 'board': return <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 8h6M7 12h10"/></>;
      case 'quiz': return <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 1 1 4.5 2.2c-1.3.9-2 1.4-2 2.8M12 18h.01"/></>;
      case 'math': return <><path d="M4 7h7M7.5 3.5v7M14 5l6 6M20 5l-6 6M4 17h7M14 17h6"/></>;
      case 'draw': return <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14 7 3 3"/></>;
      case 'timer': return <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></>;
      case 'points': return <><path d="m12 3 2.8 5.7L21 9.6l-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></>;
      case 'game': return <><path d="M8 8h8a5 5 0 0 1 4.8 6.4l-1 3.2a2 2 0 0 1-3.3.8L14 16h-4l-2.5 2.4a2 2 0 0 1-3.3-.8l-1-3.2A5 5 0 0 1 8 8Z"/><path d="M7 12v4M5 14h4M16 13h.01M18 15h.01"/></>;
      case 'lab': return <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M8 15h8"/></>;
      case 'worksheet': return <><path d="M6 3h9l3 3v15H6V3Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>;
      case 'questions': return <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h7"/></>;
    }
  })();
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{isi}</svg>;
}
