import { User, Employee, Supermarket } from '../types';

export interface AvailabilityResult {
  available: boolean;
  message: string;
}

/**
 * Normaliza y limpia un nombre de usuario
 */
export const sanitizeUsername = (username: string): string => {
  return username.trim().toLowerCase();
};

/**
 * Verifica la disponibilidad y validez de un nombre de usuario en todo el sistema
 */
export const checkUsernameAvailability = (
  username: string,
  existingUsers: User[],
  existingEmployees: Employee[] = [],
  excludeUserId?: string
): AvailabilityResult => {
  const clean = sanitizeUsername(username);

  if (!clean) {
    return { available: false, message: 'El nombre de usuario es obligatorio.' };
  }

  if (clean.length < 3) {
    return { available: false, message: 'Debe contener al menos 3 caracteres.' };
  }

  // Allow alphanumeric, underscores, hyphens and dots
  if (!/^[a-z0-9_.-]+$/.test(clean)) {
    return {
      available: false,
      message: 'Solo se permiten letras, números, guiones (-), puntos (.) y guiones bajos (_).',
    };
  }

  // Check collision in existing users (excluding current user if editing)
  const userTaken = existingUsers.some((u) => {
    if (excludeUserId && u.id === excludeUserId) return false;
    return (u.username && u.username.toLowerCase() === clean) ||
           (u.email && u.email.split('@')[0].toLowerCase() === clean);
  });

  if (userTaken) {
    return { available: false, message: 'Este nombre de usuario ya está registrado en el sistema.' };
  }

  return { available: true, message: 'Nombre de usuario disponible.' };
};

/**
 * Verifica la disponibilidad y formato de un correo electrónico en todo el sistema
 */
export const checkEmailAvailability = (
  email: string,
  existingUsers: User[],
  existingEmployees: Employee[] = [],
  excludeUserId?: string
): AvailabilityResult => {
  const clean = email.trim().toLowerCase();

  if (!clean) {
    return { available: false, message: 'El correo electrónico es obligatorio.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { available: false, message: 'Ingrese un formato de correo electrónico válido.' };
  }

  // Check collision in users
  const userCollision = existingUsers.some((u) => {
    if (excludeUserId && u.id === excludeUserId) return false;
    return u.email && u.email.toLowerCase() === clean;
  });

  // Check collision in employees (with different ID)
  const empCollision = existingEmployees.some((e) => {
    if (excludeUserId && (e.id === excludeUserId || e.id === `emp-${excludeUserId}` || e.userId === excludeUserId)) {
      return false;
    }
    return e.email && e.email.toLowerCase() === clean;
  });

  if (userCollision || empCollision) {
    return { available: false, message: 'Este correo electrónico ya está registrado.' };
  }

  return { available: true, message: 'Correo electrónico disponible.' };
};

/**
 * Verifica disponibilidad de nombre y correo para un supermercado/restaurante
 */
export const checkSupermarketAvailability = (
  name: string,
  email: string,
  existingSupermarkets: Supermarket[],
  excludeSupermarketId?: string
): { nameAvailable: AvailabilityResult; emailAvailable: AvailabilityResult } => {
  const cleanName = name.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const nameResult: AvailabilityResult = !cleanName
    ? { available: false, message: 'El nombre del negocio es obligatorio.' }
    : existingSupermarkets.some(
        (s) => s.id !== excludeSupermarketId && s.name.toLowerCase().trim() === cleanName
      )
    ? { available: false, message: 'Ya existe un negocio registrado con este nombre.' }
    : { available: true, message: 'Nombre de negocio disponible.' };

  const emailResult: AvailabilityResult = !cleanEmail
    ? { available: false, message: 'El correo del negocio es obligatorio.' }
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ? { available: false, message: 'Ingrese un correo electrónico válido.' }
    : existingSupermarkets.some(
        (s) => s.id !== excludeSupermarketId && s.email.toLowerCase().trim() === cleanEmail
      )
    ? { available: false, message: 'Este correo ya pertenece a otro supermercado/negocio.' }
    : { available: true, message: 'Correo de negocio disponible.' };

  return { nameAvailable: nameResult, emailAvailable: emailResult };
};
