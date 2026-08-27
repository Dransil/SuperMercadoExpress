import { User } from '../types';

export type AppRoute =
  | '/'
  | '/landing'
  | '/login'
  | '/registro-supermercado'
  | '/registro-empleado'
  | '/inicio'
  | '/supermercados'
  | '/dashboard'
  | '/ventas'
  | '/cierre'
  | '/productos'
  | '/inventario'
  | '/reportes'
  | '/empleados';

const USER_SESSION_KEY = 'supermarket_pos_current_user';

/**
 * Normalizes any pathname or hash into a recognized standard route path.
 */
export function normalizeRoute(raw: string): string {
  let cleaned = raw.trim();

  // If it's a hash like '#/ventas' or '#ventas'
  if (cleaned.startsWith('#')) {
    cleaned = cleaned.replace(/^#\/?/, '/');
  }

  // Strip trailing slashes unless it is root '/'
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }

  // Strip query parameters for matching
  const queryIndex = cleaned.indexOf('?');
  if (queryIndex !== -1) {
    cleaned = cleaned.substring(0, queryIndex);
  }

  if (!cleaned || cleaned === '') {
    return '/';
  }

  // Alias mappings
  if (cleaned === '/pos') return '/ventas';
  if (cleaned === '/panel' || cleaned === '/home') return '/inicio';
  if (cleaned === '/arqueo' || cleaned === '/cierre-caja') return '/cierre';
  if (cleaned === '/registro') return '/registro-supermercado';
  if (cleaned === '/solicitud-empleado') return '/registro-empleado';

  return cleaned;
}

/**
 * Gets the current route from window.location (checking hash first, then pathname).
 */
export function getCurrentRoute(): string {
  if (typeof window === 'undefined') return '/';

  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    return normalizeRoute(hash);
  }

  const pathname = window.location.pathname;
  if (pathname && pathname !== '/') {
    return normalizeRoute(pathname);
  }

  return '/';
}

/**
 * Navigates to a route and updates both HTML5 history and hash for 100% iframe/browser compatibility.
 */
export function navigateToRoute(route: string, replace: boolean = false) {
  if (typeof window === 'undefined') return;

  const normalized = normalizeRoute(route);
  const hashTarget = normalized === '/' ? '' : '#' + normalized.replace(/^\//, '');

  try {
    if (replace) {
      window.history.replaceState(null, '', normalized);
    } else {
      window.history.pushState(null, '', normalized);
    }
  } catch {
    // If pushState is restricted by iframe sandbox, fallback to hash
  }

  // Also sync hash so preview environments without path rewrite work consistently
  if (window.location.hash !== hashTarget && (hashTarget !== '' || window.location.hash !== '')) {
    if (hashTarget === '') {
      // Remove hash without scroll jump
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = hashTarget;
    }
  }

  // Dispatch popstate event to notify any listeners
  window.dispatchEvent(new Event('app-route-change'));
}

/**
 * Subscribe to URL changes (popstate, hashchange, custom app-route-change).
 */
export function subscribeToRouteChanges(callback: (newRoute: string) => void): () => void {
  const handler = () => {
    const current = getCurrentRoute();
    callback(current);
  };

  window.addEventListener('popstate', handler);
  window.addEventListener('hashchange', handler);
  window.addEventListener('app-route-change', handler);

  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener('hashchange', handler);
    window.removeEventListener('app-route-change', handler);
  };
}

/**
 * Map internal tab key to URL route.
 */
export function tabToRoute(tab: string, userRole?: string): string {
  switch (tab) {
    case 'supermercados':
      return '/supermercados';
    case 'dashboard':
      return '/dashboard';
    case 'ventas':
      return '/ventas';
    case 'cierre':
      return '/cierre';
    case 'productos':
      return '/productos';
    case 'inventario':
      return '/inventario';
    case 'reportes':
      return '/reportes';
    case 'empleados':
      return '/empleados';
    case 'inicio':
    default:
      return userRole === 'superadmin' ? '/supermercados' : '/inicio';
  }
}

/**
 * Map URL route to internal tab key.
 */
export function routeToTab(route: string, userRole?: string): string {
  const normalized = normalizeRoute(route);
  switch (normalized) {
    case '/supermercados':
      return 'supermercados';
    case '/dashboard':
      return 'dashboard';
    case '/ventas':
      return 'ventas';
    case '/cierre':
      return 'cierre';
    case '/productos':
      return 'productos';
    case '/inventario':
      return 'inventario';
    case '/reportes':
      return 'reportes';
    case '/empleados':
      return 'empleados';
    case '/inicio':
      return userRole === 'superadmin' ? 'supermercados' : 'inicio';
    default:
      return userRole === 'superadmin' ? 'supermercados' : 'inicio';
  }
}

/**
 * Determines if a route is public (accessible without login).
 */
export function isPublicRoute(route: string): boolean {
  const normalized = normalizeRoute(route);
  return (
    normalized === '/' ||
    normalized === '/landing' ||
    normalized === '/login' ||
    normalized === '/registro-supermercado' ||
    normalized === '/registro-empleado'
  );
}

/**
 * Stored user session helpers.
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id && parsed.role) {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch {
    // Ignore localStorage errors (e.g. private browsing storage quota)
  }
}
