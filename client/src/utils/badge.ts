const BADGE_TONES = ['badge-blue', 'badge-amber', 'badge-green', 'badge-purple', 'badge-pink', 'badge-cyan'];

// The same category name always gets the same color
export function badgeTone(name: string) {
  const sum = [...name].reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return BADGE_TONES[sum % BADGE_TONES.length];
}