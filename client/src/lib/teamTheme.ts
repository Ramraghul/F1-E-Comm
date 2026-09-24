import type { CSSProperties } from 'react';

interface TeamColors {
  colorPrimary: string;
  colorSecondary?: string;
  colorAccent?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** CSS custom properties that theme the `--team-*` tokens used throughout global.css / Tailwind. */
export function teamStyleVars(team: TeamColors | undefined | null): CSSProperties {
  if (!team) return {};
  return {
    ['--team-primary' as string]: team.colorPrimary,
    ['--team-secondary' as string]: team.colorSecondary ?? '#0A0A0F',
    ['--team-accent' as string]: team.colorAccent ?? '#FFFFFF',
    ['--team-primary-glow' as string]: hexToRgba(team.colorPrimary, 0.35),
  };
}
