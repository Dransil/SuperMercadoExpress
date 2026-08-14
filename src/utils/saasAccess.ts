import { Supermarket, SupermarketStatus } from '../types';

export interface SupermarketAccessInfo {
  effectiveStatus: SupermarketStatus;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  visualAlert: 'verde' | 'amarillo' | 'rojo' | 'gris' | 'azul';
  statusLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  description: string;
  blockMessage?: string;
}

/**
 * Retorna la fecha actual en formato ISO YYYY-MM-DD
 */
export const getTodayIsoString = (dateObj: Date = new Date()): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato estándar de Bolivia (DD/MM/YYYY)
 */
export const formatBolivianDate = (isoDate?: string | null): string => {
  if (!isoDate) return 'Sin fecha';
  // If already contains slashes or full timestamp
  const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate.split(' ')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return isoDate;
};

/**
 * Formatea una fecha ISO a texto largo amigable (e.g. 13 de agosto de 2026)
 */
export const formatBolivianLongDate = (isoDate?: string | null): string => {
  if (!isoDate) return 'Sin fecha establecida';
  try {
    const datePart = isoDate.includes('T') ? isoDate.split('T')[0] : isoDate.split(' ')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return isoDate;
    
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Calcula la diferencia en días enteros entre dos fechas YYYY-MM-DD
 */
export const getDaysDifference = (fromIsoDate: string, toIsoDate: string): number => {
  try {
    const [y1, m1, d1] = fromIsoDate.split('-').map(Number);
    const [y2, m2, d2] = toIsoDate.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

/**
 * Agrega meses a una fecha YYYY-MM-DD
 */
export const addMonthsToIso = (isoDate: string, monthsToAdd: number): string => {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1 + monthsToAdd, day);
    return getTodayIsoString(targetDate);
  } catch {
    return isoDate;
  }
};

/**
 * Agrega días a una fecha YYYY-MM-DD
 */
export const addDaysToIso = (isoDate: string, daysToAdd: number): string => {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day + daysToAdd);
    return getTodayIsoString(targetDate);
  } catch {
    return isoDate;
  }
};

/**
 * Evalúa y determina el estado efectivo de acceso SaaS y alertas de un supermercado
 * basándose en la fecha actual y los períodos asignados.
 */
export const getSupermarketAccessInfo = (
  supermarket?: Supermarket | null,
  referenceDateIso: string = getTodayIsoString()
): SupermarketAccessInfo => {
  if (!supermarket) {
    return {
      effectiveStatus: 'desactivado',
      isExpiringSoon: false,
      daysRemaining: null,
      visualAlert: 'gris',
      statusLabel: 'Desactivado',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-300',
      dotColor: 'bg-slate-500',
      description: 'Supermercado no encontrado.',
      blockMessage: 'El acceso de este supermercado se encuentra desactivado. Contacte al administrador del servicio.',
    };
  }

  // 1. Si está rechazado
  if (supermarket.status === 'rechazado') {
    return {
      effectiveStatus: 'rechazado',
      isExpiringSoon: false,
      daysRemaining: null,
      visualAlert: 'rojo',
      statusLabel: 'Rechazado',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-300',
      dotColor: 'bg-rose-500',
      description: 'La solicitud de este supermercado fue rechazada por el Super Administrador.',
      blockMessage: 'El acceso a este supermercado no está disponible debido a que la solicitud fue rechazada.',
    };
  }

  // 2. Si fue desactivado manualmente por el Super Administrador
  if (supermarket.isManuallyDeactivated || supermarket.status === 'desactivado') {
    return {
      effectiveStatus: 'desactivado',
      isExpiringSoon: false,
      daysRemaining: null,
      visualAlert: 'gris',
      statusLabel: 'Desactivado',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-300',
      dotColor: 'bg-slate-500',
      description: 'Acceso suspendido manualmente por el Super Administrador.',
      blockMessage: 'El acceso de este supermercado se encuentra desactivado. Contacte al administrador del servicio.',
    };
  }

  // 3. Si está pendiente de aprobación o no tiene período configurado
  if (
    supermarket.status === 'pendiente' ||
    !supermarket.startDate ||
    !supermarket.expirationDate
  ) {
    return {
      effectiveStatus: 'pendiente',
      isExpiringSoon: false,
      daysRemaining: null,
      visualAlert: 'azul',
      statusLabel: 'Pendiente',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-300',
      dotColor: 'bg-blue-500',
      description: 'El supermercado todavía no tiene un período de acceso autorizado.',
      blockMessage: 'El registro de este supermercado está pendiente de autorización.',
    };
  }

  const { startDate, expirationDate } = supermarket;

  // 4. Si la fecha actual es anterior a la fecha de inicio autorizada
  if (referenceDateIso < startDate) {
    const daysUntilStart = getDaysDifference(referenceDateIso, startDate);
    return {
      effectiveStatus: 'pendiente',
      isExpiringSoon: false,
      daysRemaining: null,
      visualAlert: 'azul',
      statusLabel: 'Período Futuro',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-300',
      dotColor: 'bg-blue-500',
      description: `El período de acceso inicia el ${formatBolivianDate(startDate)} (en ${daysUntilStart} día${daysUntilStart === 1 ? '' : 's'}).`,
      blockMessage: `El registro de este supermercado está programado para activarse el ${formatBolivianDate(startDate)}.`,
    };
  }

  // 5. Si la fecha actual ha superado la fecha de vencimiento -> VENCIDO
  if (referenceDateIso > expirationDate) {
    const daysOverdue = getDaysDifference(expirationDate, referenceDateIso);
    return {
      effectiveStatus: 'vencido',
      isExpiringSoon: false,
      daysRemaining: -daysOverdue,
      visualAlert: 'rojo',
      statusLabel: 'Vencido',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-300',
      dotColor: 'bg-rose-600',
      description: `El período de acceso venció el ${formatBolivianDate(expirationDate)} (hace ${daysOverdue} día${daysOverdue === 1 ? '' : 's'}).`,
      blockMessage: 'El período de acceso de este supermercado ha vencido. Contacte al administrador del servicio.',
    };
  }

  // 6. Si está dentro del período autorizado -> ACTIVO
  const daysRemaining = getDaysDifference(referenceDateIso, expirationDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;

  if (isExpiringSoon) {
    return {
      effectiveStatus: 'activo',
      isExpiringSoon: true,
      daysRemaining,
      visualAlert: 'amarillo',
      statusLabel: 'Próximo a Vencer',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-300',
      dotColor: 'bg-amber-500',
      description: `Acceso vigente hasta el ${formatBolivianDate(expirationDate)} (${daysRemaining === 0 ? 'Vence hoy' : `Quedan ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`}).`,
    };
  }

  return {
    effectiveStatus: 'activo',
    isExpiringSoon: false,
    daysRemaining,
    visualAlert: 'verde',
    statusLabel: 'Activo',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
    description: `Acceso vigente hasta el ${formatBolivianDate(expirationDate)} (${daysRemaining} días restantes).`,
  };
};
