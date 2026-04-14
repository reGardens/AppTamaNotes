export function getUserTheme(email: string | undefined) {
  if (!email) return { primary: '#3b82f6', primaryHover: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', light: '#eff6ff', name: 'blue', loginBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', greeting: 'Selamat datang kembali' };
  const lower = email.toLowerCase();
  if (lower.includes('rezza') || lower.includes('reza')) {
    return { primary: '#16a34a', primaryHover: '#15803d', gradient: 'linear-gradient(135deg, #16a34a, #166534)', light: '#f0fdf4', name: 'green', loginBg: 'linear-gradient(135deg, #16a34a 0%, #065f46 100%)', greeting: 'Selamat datang kembali Bapak Suami 👨' };
  }
  if (lower.includes('rita')) {
    return { primary: '#a855f7', primaryHover: '#9333ea', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', light: '#faf5ff', name: 'purple', loginBg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', greeting: 'Selamat datang kembali Istriku 👩' };
  }
  return { primary: '#3b82f6', primaryHover: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', light: '#eff6ff', name: 'blue', loginBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', greeting: 'Selamat datang kembali' };
}

/** Get login background color based on email input (for dynamic login page) */
export function getLoginBgFromEmail(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes('rezza') || lower.includes('reza')) return 'linear-gradient(135deg, #16a34a 0%, #065f46 100%)';
  if (lower.includes('rita')) return 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)';
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}
