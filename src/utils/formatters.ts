/**
 * Utility for formatting monetary values in Bolivianos (Bs / BOB).
 * Example output: 25.5 -> "Bs 25,50"
 */
export const formatBs = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Bs 0,00';
  }
  const formatted = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Bs ${formatted}`;
};

export const formatCurrency = formatBs;
