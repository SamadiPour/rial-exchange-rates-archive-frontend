export function fmtToman(n: number, opts: { compact?: boolean } = {}): string {
  if (!isFinite(n)) return '—';
  if (opts.compact) {
    const abs = Math.abs(n);
    if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(0);
  }
  return Math.round(n).toLocaleString('en-US');
}

export function fmtPct(n: number, digits = 2): string {
  if (!isFinite(n)) return '—';
  const s = n >= 0 ? '+' : '';
  return s + n.toFixed(digits) + '%';
}

export function fmtNumberPretty(n: number, maxFractionDigits = 2): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-US', {
    maximumFractionDigits: maxFractionDigits,
  });
}
