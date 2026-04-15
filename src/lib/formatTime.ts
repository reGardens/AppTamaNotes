const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** Format ISO date string to "Senin, 15/04/2026 14:30" */
export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const day = DAYS[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day}, ${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/** Format ISO date string to "HH:mm" only */
export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Check if a date is older than N months from now */
export function isOlderThanMonths(isoString: string, months: number): boolean {
  const d = new Date(isoString);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d < cutoff;
}
