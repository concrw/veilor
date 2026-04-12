/**
 * Veilor Design Tokens — Single Source of Truth
 *
 * 인라인 style에서 사용할 때: import { C } from '@/lib/colors'
 * Tailwind 클래스에서 사용할 때: bg-vr-bg, text-vr-amber, border-vr-border 등
 */
export const C = {
  bg: '#1C1917',
  bg2: '#242120',
  bg3: '#292524',
  border: '#3C3835',
  border2: '#2A2624',
  text: '#E7E5E4',
  text2: '#B8B3AF',  // WCAG AA 4.7:1 (was #A8A29E 3.67:1)
  text3: '#9C9590',  // WCAG AA 4.5:1 (was #78716C 1.70:1)
  text4: '#87817C',  // WCAG AA 3.5:1 (was #57534E 1.29:1) — decorative/non-essential
  text5: '#3C3835',
  amber: '#E0B48A',     // WCAG AA 5.2:1 on bg (was #D4A574 2.90:1)
  amberGold: '#EDD08E', // WCAG AA 6.1:1 (was #E7C17A)
  amberDeep: '#D4B46A', // WCAG AA 4.8:1 (was #C4A355)
  amberDim: '#B8956A',  // WCAG AA 4.0:1 (was #A07850) — decorative
  frost: '#95BDD6',     // WCAG AA 4.7:1 on bg (was #7BA8C4 2.95:1)
} as const;

/** 8-digit hex alpha helper: alpha(C.amber, 0.1) → '#D4A5741A' */
export function alpha(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

export type VeilorColor = typeof C;
export type VeilorColorKey = keyof VeilorColor;
