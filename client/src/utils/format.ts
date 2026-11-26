// Shared money formatting: ₹1,86,150.00
export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

// ₹1.2L for chart axes
export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', style: 'currency', currency: 'INR' }).format(value);

// "2026-10" becomes "Oct 2026"
export const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });