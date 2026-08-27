import { useState, useEffect, useMemo } from 'react';
import {
  User,
  Employee,
  Product,
  InventoryMovement,
  MovementType,
  ToastMessage,
  Sale,
  ShiftClosure,
  UserRole,
  Supermarket,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_SALES,
  INITIAL_SUPERMARKETS,
} from './data/mockData';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { EmployeeManagement } from './components/EmployeeManagement';
import { ProductManagement } from './components/ProductManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { SalesModule } from './components/SalesModule';
import { ReportsModule } from './components/ReportsModule';
import { StatsDashboard } from './components/StatsDashboard';
import { ShiftClosureModule } from './components/ShiftClosureModule';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AccessBlockedScreen } from './components/AccessBlockedScreen';
import {
  getTodayIsoString,
  getSupermarketAccessInfo,
  addMonthsToIso,
  formatBolivianDate,
} from './utils/saasAccess';
import {
  fetchProductsFromSupabase,
  fetchUsersFromSupabase,
  fetchEmployeesFromSupabase,
  fetchSalesFromSupabase,
  fetchMovementsFromSupabase,
  fetchShiftClosuresFromSupabase,
  fetchSupermarketsFromSupabase,
  ensureAdminInSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  saveSaleToSupabase,
  saveMovementToSupabase,
  saveShiftClosureToSupabase,
  saveUserToSupabase,
  saveEmployeeToSupabase,
  saveSupermarketToSupabase,
} from './lib/supabase';
import { CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import {
  getCurrentRoute,
  navigateToRoute,
  subscribeToRouteChanges,
  normalizeRoute,
  tabToRoute,
  routeToTab,
  isPublicRoute,
  getStoredUser,
  setStoredUser,
} from './utils/router';

export default function App() {
  const [users, setUsers] = useState<(User & { password: string })[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [currentRoute, setCurrentRoute] = useState<string>(() => getCurrentRoute());
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(INITIAL_SUPERMARKETS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_INVENTORY_MOVEMENTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [shiftClosures, setShiftClosures] = useState<ShiftClosure[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const initialRoute = getCurrentRoute();
    const stored = getStoredUser();
    if (!isPublicRoute(initialRoute)) {
      return routeToTab(initialRoute, stored?.role);
    }
    return stored?.role === 'superadmin' ? 'supermercados' : 'inicio';
  });
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register-supermarket' | 'register-employee'>(() => {
    const initialRoute = getCurrentRoute();
    if (initialRoute === '/login') return 'login';
    if (initialRoute === '/registro-supermercado') return 'register-supermarket';
    if (initialRoute === '/registro-empleado') return 'register-employee';
    return 'landing';
  });
  const [prefilledCredentials, setPrefilledCredentials] = useState<{ identifier?: string; password?: string }>({});

  // Helper to navigate routes seamlessly
  const navigate = (route: string) => {
    navigateToRoute(route);
    setCurrentRoute(normalizeRoute(route));
  };

  // Helper to change tab and update route
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    const targetRoute = tabToRoute(tab, currentUser?.role);
    navigate(targetRoute);
  };

  // Listen to browser URL / hash changes
  useEffect(() => {
    const unsubscribe = subscribeToRouteChanges((newRoute) => {
      setCurrentRoute(newRoute);
      if (isPublicRoute(newRoute)) {
        if (newRoute === '/' || newRoute === '/landing') {
          setAuthView('landing');
        } else if (newRoute === '/registro-supermercado') {
          setAuthView('register-supermarket');
        } else if (newRoute === '/registro-empleado') {
          setAuthView('register-employee');
        } else {
          setAuthView('login');
        }
      } else {
        const tab = routeToTab(newRoute, currentUser?.role);
        setActiveTab(tab);
      }
    });
    return unsubscribe;
  }, [currentUser?.role]);

  // Keep currentUser persisted across sessions
  useEffect(() => {
    setStoredUser(currentUser);
  }, [currentUser]);

  // Load all tables from Supabase on mount
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        // Ensure Admin and Super Admin users exist in Supabase
        await ensureAdminInSupabase();

        // Fetch tables from Supabase in parallel
        const [
          dbUsers,
          dbEmployees,
          dbSupermarkets,
          dbProducts,
          dbSales,
          dbMovements,
          dbClosures,
        ] = await Promise.all([
          fetchUsersFromSupabase(),
          fetchEmployeesFromSupabase(),
          fetchSupermarketsFromSupabase(),
          fetchProductsFromSupabase(),
          fetchSalesFromSupabase(),
          fetchMovementsFromSupabase(),
          fetchShiftClosuresFromSupabase(),
        ]);

        if (dbUsers && dbUsers.length > 0) {
          const userMap = new Map<string, User & { password: string }>();
          INITIAL_USERS.forEach((u) => userMap.set(u.id, u));
          dbUsers.forEach((u) => {
            const existing = userMap.get(u.id);
            userMap.set(u.id, {
              ...existing,
              ...u,
              password: u.password || existing?.password || 'admin123',
            });
          });
          const updatedUsers = Array.from(userMap.values());
          setUsers(updatedUsers);

          // Keep current logged-in user synchronized
          setCurrentUser((prev) => {
            if (!prev) return null;
            const match = updatedUsers.find((u) => u.id === prev.id || u.username === prev.username);
            if (match) {
              const { password: _, ...userFields } = match;
              const syncedUser: User = {
                ...userFields,
                documentId: match.documentId || prev.documentId || '',
              };
              setStoredUser(syncedUser);
              return syncedUser;
            }
            return prev;
          });
        } else {
          setUsers(INITIAL_USERS);
        }

        if (dbEmployees && dbEmployees.length > 0) {
          const empMap = new Map<string, Employee>();
          INITIAL_EMPLOYEES.forEach((e) => empMap.set(e.id, e));
          dbEmployees.forEach((e) => empMap.set(e.id, { ...empMap.get(e.id), ...e }));
          setEmployees(Array.from(empMap.values()));
        } else {
          setEmployees(INITIAL_EMPLOYEES);
        }

        if (dbSupermarkets && dbSupermarkets.length > 0) {
          const smMap = new Map<string, Supermarket>();
          INITIAL_SUPERMARKETS.forEach((s) => smMap.set(s.id, s));
          dbSupermarkets.forEach((s) => smMap.set(s.id, { ...smMap.get(s.id), ...s }));
          setSupermarkets(Array.from(smMap.values()));
        } else {
          setSupermarkets(INITIAL_SUPERMARKETS);
        }
        setProducts(dbProducts || []);
        setSales(dbSales || []);
        setMovements(dbMovements || []);
        setShiftClosures(dbClosures || []);
      } catch (err) {
        console.warn('Supabase data load error:', err);
      }
    };

    loadSupabaseData();
  }, []);

  // Sync state to Supabase bulk handler
  const handleSyncAllData = async () => {
    for (const sm of supermarkets) {
      await saveSupermarketToSupabase(sm);
    }
    for (const prod of products) {
      await saveProductToSupabase(prod);
    }
    for (const sale of sales) {
      await saveSaleToSupabase(sale);
    }
    for (const mov of movements) {
      await saveMovementToSupabase(mov);
    }
    for (const closure of shiftClosures) {
      await saveShiftClosureToSupabase(closure);
    }
    for (const user of users) {
      await saveUserToSupabase(user);
    }
    for (const emp of employees) {
      await saveEmployeeToSupabase(emp);
    }
    addToast('Sincronización completa con Supabase realizada exitosamente.', 'success');
  };

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ==========================================
  // MULTI-TENANT ISOLATION: Scoped Collections
  // ==========================================
  const scopedProducts = useMemo(() => {
    if (!currentUser || currentUser.role === 'superadmin') return products;
    return products.filter((p) => p.supermarketId === currentUser.supermarketId);
  }, [products, currentUser]);

  const scopedMovements = useMemo(() => {
    if (!currentUser || currentUser.role === 'superadmin') return movements;
    return movements.filter((m) => m.supermarketId === currentUser.supermarketId);
  }, [movements, currentUser]);

  const scopedSales = useMemo(() => {
    if (!currentUser || currentUser.role === 'superadmin') return sales;
    return sales.filter((s) => s.supermarketId === currentUser.supermarketId);
  }, [sales, currentUser]);

  const scopedShiftClosures = useMemo(() => {
    if (!currentUser || currentUser.role === 'superadmin') return shiftClosures;
    return shiftClosures.filter((c) => c.supermarketId === currentUser.supermarketId);
  }, [shiftClosures, currentUser]);

  const scopedEmployees = useMemo(() => {
    if (!currentUser || currentUser.role === 'superadmin') return employees;
    return employees.filter((e) => e.supermarketId === currentUser.supermarketId);
  }, [employees, currentUser]);

  // Shift Closure Save Handler
  const handleSaveShiftClosure = (newClosure: ShiftClosure) => {
    const closureWithTenant: ShiftClosure = {
      ...newClosure,
      supermarketId: newClosure.supermarketId || currentUser?.supermarketId,
      supermarketName: newClosure.supermarketName || currentUser?.supermarketName,
    };
    setShiftClosures((prev) => [
      closureWithTenant,
      ...prev.filter(
        (c) => !(c.cashierId === closureWithTenant.cashierId && c.date === closureWithTenant.date)
      ),
    ]);
    saveShiftClosureToSupabase(closureWithTenant);
  };

  // Change Password Handler
  const handleChangePassword = (
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'No hay ninguna sesión activa.' };
    }

    if (currentUser.password && currentUser.password !== currentPassword) {
      return { success: false, message: 'La contraseña actual ingresada es incorrecta.' };
    }

    if (currentPassword === newPassword) {
      return { success: false, message: 'La nueva contraseña debe ser diferente de la contraseña actual.' };
    }

    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u))
    );
    saveUserToSupabase(updatedUser);

    addToast('Contraseña actualizada exitosamente.', 'success');
    return { success: true, message: 'Contraseña actualizada exitosamente.' };
  };

  // User Profile Update Handler
  const handleUpdateProfile = (
    updatedData: User
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'No hay ninguna sesión activa.' };
    }

    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
    };

    // 1. Update currentUser in state
    setCurrentUser(updatedUser);

    // 2. Update users list and Supabase
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    saveUserToSupabase(updatedUser);

    // 3. Update corresponding Employee record if exists
    setEmployees((prevEmployees) =>
      prevEmployees.map((e) => {
        if (
          e.id === updatedUser.employeeId ||
          e.id === `emp-${updatedUser.id}` ||
          (updatedUser.email && e.email.toLowerCase() === updatedUser.email.toLowerCase())
        ) {
          const updatedEmp: Employee = {
            ...e,
            fullName: updatedUser.name,
            phone: updatedUser.phone || e.phone,
            address: updatedUser.address || e.address,
            documentId: updatedUser.documentId,
            email: updatedUser.email,
            photo: updatedUser.avatar,
            birthDate: updatedUser.birthDate || e.birthDate,
            cargo: updatedUser.cargo || e.cargo,
          };
          saveEmployeeToSupabase(updatedEmp);
          return updatedEmp;
        }
        return e;
      })
    );

    // 4. If this user is an admin of a Supermarket, keep supermarket admin info synchronized
    if (updatedUser.supermarketId) {
      setSupermarkets((prevSm) =>
        prevSm.map((s) => {
          if (s.adminId === updatedUser.id || s.id === updatedUser.supermarketId) {
            const updatedSm: Supermarket = {
              ...s,
              adminName: updatedUser.name,
              adminEmail: updatedUser.email,
              adminPhone: updatedUser.phone || s.adminPhone,
              adminAddress: updatedUser.address || s.adminAddress,
              adminPhoto: updatedUser.avatar || s.adminPhoto,
              adminDocumentId: updatedUser.documentId,
              adminBirthDate: updatedUser.birthDate || s.adminBirthDate,
            };
            saveSupermarketToSupabase(updatedSm);
            return updatedSm;
          }
          return s;
        })
      );
    }

    addToast('Perfil actualizado correctamente.', 'success');
    return { success: true, message: 'Perfil actualizado correctamente.' };
  };

  // Handle Login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    setIsProfileModalOpen(false);
    setIsSupabaseModalOpen(false);
    setIsMobileSidebarOpen(false);
    setSessionKey((prev) => prev + 1);

    const current = getCurrentRoute();
    if (!isPublicRoute(current)) {
      const targetTab = routeToTab(current, user.role);
      setActiveTab(targetTab);
      navigate(tabToRoute(targetTab, user.role));
    } else if (user.role === 'superadmin') {
      setActiveTab('supermercados');
      navigate('/supermercados');
      addToast(`¡Bienvenido Super Administrador, ${user.name}! Panel central SaaS activado.`, 'success');
    } else {
      setActiveTab('inicio');
      navigate('/inicio');
      addToast(
        `¡Bienvenido(a), ${user.name}! Sesión iniciada como ${
          user.role === 'admin' ? 'Administrador' : 'Cajero'
        }.`,
        'success'
      );
    }
  };

  // Handle Logout (Clean all temporary and transient states)
  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    setAuthView('landing');
    setActiveTab('inicio');
    setIsProfileModalOpen(false);
    setIsSupabaseModalOpen(false);
    setIsMobileSidebarOpen(false);
    setSessionKey((prev) => prev + 1);
    navigate('/');
    addToast('Sesión cerrada correctamente.', 'info');
  };

  // ==========================================
  // MÓDULO 1: SUPERMARKET SAAS HANDLERS
  // ==========================================

  // Register a new Supermarket + its Admin (Initial status: 'pendiente')
  const handleRegisterSupermarket = (newSupermarket: Supermarket, adminPassword: string) => {
    // 1. Add supermarket to state
    setSupermarkets((prev) => [newSupermarket, ...prev]);
    saveSupermarketToSupabase(newSupermarket);

    // 2. Generate username from admin email
    const username = newSupermarket.adminEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // 3. Create Admin User (status: 'pendiente')
    const newAdminUser: User & { password: string } = {
      id: newSupermarket.adminId,
      username: username || `admin_${Date.now()}`,
      email: newSupermarket.adminEmail,
      name: newSupermarket.adminName,
      role: 'admin',
      avatar: newSupermarket.adminPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      documentId: newSupermarket.adminDocumentId,
      password: adminPassword,
      status: 'pendiente',
      phone: newSupermarket.adminPhone,
      address: newSupermarket.adminAddress,
      birthDate: newSupermarket.adminBirthDate,
      hireDate: newSupermarket.adminHireDate,
      cargo: 'Administrador General',
      supermarketId: newSupermarket.id,
      supermarketName: newSupermarket.name,
    };

    setUsers((prev) => [newAdminUser, ...prev]);
    saveUserToSupabase(newAdminUser);

    // 4. Create Employee record for the Admin (status: 'pendiente')
    const newAdminEmployee: Employee = {
      id: `emp-${newSupermarket.adminId}`,
      fullName: newSupermarket.adminName,
      documentId: newSupermarket.adminDocumentId,
      phone: newSupermarket.adminPhone,
      address: newSupermarket.adminAddress,
      email: newSupermarket.adminEmail,
      birthDate: newSupermarket.adminBirthDate,
      hireDate: newSupermarket.adminHireDate,
      cargo: 'Administrador General',
      photo: newSupermarket.adminPhoto || newAdminUser.avatar,
      role: 'admin',
      status: 'pendiente',
      supermarketId: newSupermarket.id,
    };

    setEmployees((prev) => [newAdminEmployee, ...prev]);
    saveEmployeeToSupabase(newAdminEmployee);

    addToast(
      `Solicitud de registro enviada para "${newSupermarket.name}". Estado: Pendiente de revisión.`,
      'info'
    );
  };

  // Super Admin: Direct creation of Supermarket + Verified Admin User + Employee
  const handleCreateSupermarketBySuperAdmin = (
    newSupermarket: Supermarket,
    adminUser: User & { password: string },
    adminEmployee: Employee
  ) => {
    // 1. Add supermarket to state and database
    setSupermarkets((prev) => [
      newSupermarket,
      ...prev.filter((s) => s.id !== newSupermarket.id),
    ]);
    saveSupermarketToSupabase(newSupermarket);

    // 2. Add admin user to state and database
    setUsers((prev) => [
      adminUser,
      ...prev.filter((u) => u.id !== adminUser.id && u.username !== adminUser.username),
    ]);
    saveUserToSupabase(adminUser);

    // 3. Add employee record to state and database
    setEmployees((prev) => [
      adminEmployee,
      ...prev.filter((e) => e.id !== adminEmployee.id),
    ]);
    saveEmployeeToSupabase(adminEmployee);

    addToast(
      `Supermercado "${newSupermarket.name}" y Administrador "${adminUser.name}" creados y verificados exitosamente.`,
      'success'
    );
  };

  // Super Admin: Approve Supermarket and activate its Admin with authorized access period
  const handleApproveSupermarket = (
    supermarketId: string,
    startDate?: string,
    expirationDate?: string
  ) => {
    const targetSm = supermarkets.find((s) => s.id === supermarketId);
    if (!targetSm) return;

    const nowIso = new Date().toISOString();
    const todayStr = getTodayIsoString();
    const effectiveStart = startDate || targetSm.startDate || todayStr;
    const effectiveExp = expirationDate || targetSm.expirationDate || addMonthsToIso(effectiveStart, 1);

    // 1. Update Supermarket
    const updatedSm: Supermarket = {
      ...targetSm,
      status: 'activo',
      startDate: effectiveStart,
      expirationDate: effectiveExp,
      isManuallyDeactivated: false,
      reviewedAt: nowIso,
      lastAccessUpdate: nowIso,
    };
    setSupermarkets((prev) =>
      prev.map((s) => (s.id === supermarketId ? updatedSm : s))
    );
    saveSupermarketToSupabase(updatedSm);

    // 2. Activate Admin User
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetSm.adminId || u.supermarketId === supermarketId) {
          const updatedUser = { ...u, status: 'activo' as const };
          saveUserToSupabase(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    // 3. Activate Admin Employee
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.supermarketId === supermarketId || e.id === `emp-${targetSm.adminId}`) {
          const updatedEmp = { ...e, status: 'activo' as const };
          saveEmployeeToSupabase(updatedEmp);
          return updatedEmp;
        }
        return e;
      })
    );

    addToast(
      `¡Supermercado "${targetSm.name}" aprobado exitosamente! Período de acceso vigente hasta ${formatBolivianDate(effectiveExp)}.`,
      'success'
    );
  };

  // Super Admin: Save or Update Access Period for Supermarket
  const handleSaveAccessPeriod = (
    supermarketId: string,
    startDate: string,
    expirationDate: string,
    notes?: string
  ) => {
    const targetSm = supermarkets.find((s) => s.id === supermarketId);
    if (!targetSm) return;

    const nowIso = new Date().toISOString();
    const todayStr = getTodayIsoString();

    // Determine status based on dates
    let newStatus: Supermarket['status'] = 'activo';
    if (todayStr < startDate) {
      newStatus = 'pendiente';
    } else if (todayStr > expirationDate) {
      newStatus = 'vencido';
    }

    const updatedSm: Supermarket = {
      ...targetSm,
      startDate,
      expirationDate,
      notes: notes !== undefined ? notes : targetSm.notes,
      status: newStatus,
      isManuallyDeactivated: false,
      deactivatedAt: undefined,
      deactivationReason: undefined,
      lastAccessUpdate: nowIso,
    };

    setSupermarkets((prev) =>
      prev.map((s) => (s.id === supermarketId ? updatedSm : s))
    );
    saveSupermarketToSupabase(updatedSm);

    // Reactivate Admin User and Employee if new period is active
    if (newStatus === 'activo') {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetSm.adminId || u.supermarketId === supermarketId) {
            const updatedUser = { ...u, status: 'activo' as const };
            saveUserToSupabase(updatedUser);
            return updatedUser;
          }
          return u;
        })
      );
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.supermarketId === supermarketId || e.id === `emp-${targetSm.adminId}`) {
            const updatedEmp = { ...e, status: 'activo' as const };
            saveEmployeeToSupabase(updatedEmp);
            return updatedEmp;
          }
          return e;
        })
      );
    }

    addToast(
      `Período de acceso para "${targetSm.name}" actualizado del ${formatBolivianDate(startDate)} al ${formatBolivianDate(expirationDate)}.`,
      'success'
    );
  };

  // Super Admin: Deactivate Supermarket Manually
  const handleDeactivateSupermarket = (supermarketId: string, reason?: string) => {
    const targetSm = supermarkets.find((s) => s.id === supermarketId);
    if (!targetSm) return;

    const nowIso = new Date().toISOString();

    const updatedSm: Supermarket = {
      ...targetSm,
      status: 'desactivado',
      isManuallyDeactivated: true,
      deactivatedAt: nowIso,
      deactivationReason: reason || 'Acceso desactivado manualmente por el Super Administrador.',
      lastAccessUpdate: nowIso,
    };

    setSupermarkets((prev) =>
      prev.map((s) => (s.id === supermarketId ? updatedSm : s))
    );
    saveSupermarketToSupabase(updatedSm);

    addToast(
      `El acceso al supermercado "${targetSm.name}" ha sido desactivado.`,
      'info'
    );
  };

  // Super Admin: Reject Supermarket
  const handleRejectSupermarket = (supermarketId: string, reason?: string) => {
    const targetSm = supermarkets.find((s) => s.id === supermarketId);
    if (!targetSm) return;

    const nowIso = new Date().toISOString();

    // 1. Update Supermarket
    const updatedSm: Supermarket = {
      ...targetSm,
      status: 'rechazado',
      reviewedAt: nowIso,
      rejectionReason: reason || 'No cumple con las directrices de la plataforma.',
    };
    setSupermarkets((prev) =>
      prev.map((s) => (s.id === supermarketId ? updatedSm : s))
    );
    saveSupermarketToSupabase(updatedSm);

    // 2. Reject Admin User
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetSm.adminId || u.supermarketId === supermarketId) {
          const updatedUser = { ...u, status: 'rechazado' as const };
          saveUserToSupabase(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    // 3. Reject Admin Employee
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.supermarketId === supermarketId || e.id === `emp-${targetSm.adminId}`) {
          const updatedEmp = { ...e, status: 'rechazado' as const };
          saveEmployeeToSupabase(updatedEmp);
          return updatedEmp;
        }
        return e;
      })
    );

    addToast(
      `La solicitud de registro del supermercado "${targetSm.name}" ha sido rechazada.`,
      'info'
    );
  };

  // ==========================================
  // EMPLOYEE / USER CRUD HANDLERS
  // ==========================================

  const handleAddEmployee = (
    newEmpData: Omit<Employee, 'id'>,
    accessAccount?: { username: string; password: string; createAccount: boolean }
  ) => {
    // 1. Mandatory association strictly from currentUser session (Authenticated Admin)
    const enforcedSupermarketId = currentUser?.supermarketId || newEmpData.supermarketId;
    const enforcedSupermarketName = currentUser?.supermarketName || newEmpData.supermarketName;

    const newEmpId = `emp-${String(employees.length + 1).padStart(3, '0')}`;
    const cleanEmail = newEmpData.email.trim().toLowerCase();

    const newEmployee: Employee = {
      ...newEmpData,
      id: newEmpId,
      email: cleanEmail,
      supermarketId: enforcedSupermarketId,
      supermarketName: enforcedSupermarketName,
      status: 'activo',
      registrationDate: new Date().toISOString().split('T')[0],
    };

    // 2. If access account creation is requested
    if (accessAccount?.createAccount) {
      const defaultUsername =
        accessAccount.username?.trim() ||
        cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') ||
        `user_${Date.now()}`;
      const newUserId = `u-${newEmpId}`;

      const newUser: User & { password: string } = {
        id: newUserId,
        username: defaultUsername,
        email: cleanEmail,
        name: newEmpData.fullName,
        role: newEmpData.role,
        avatar: newEmpData.photo,
        documentId: newEmpData.documentId,
        password: accessAccount.password?.trim() || 'cajero123',
        status: 'activo',
        phone: newEmpData.phone,
        address: newEmpData.address,
        birthDate: newEmpData.birthDate,
        hireDate: newEmpData.hireDate,
        cargo: newEmpData.cargo,
        employeeId: newEmpId,
        supermarketId: enforcedSupermarketId, // MANDATORY: strictly from authenticated admin
        supermarketName: enforcedSupermarketName, // MANDATORY: strictly from authenticated admin
        createdAt: new Date().toISOString(),
      };

      newEmployee.userId = newUserId;

      setUsers((prev) => {
        const filtered = prev.filter(
          (u) => u.id !== newUserId && u.email.toLowerCase() !== cleanEmail
        );
        return [newUser, ...filtered];
      });
      saveUserToSupabase(newUser);
    }

    setEmployees((prev) => [newEmployee, ...prev]);
    saveEmployeeToSupabase(newEmployee);
    addToast(
      `Empleado "${newEmployee.fullName}" registrado exitosamente en ${enforcedSupermarketName || 'el supermercado'}.`,
      'success'
    );
  };

  const handleUpdateEmployee = (id: string, updatedData: Omit<Employee, 'id'>) => {
    const updatedEmp: Employee = {
      ...updatedData,
      id,
      supermarketId: updatedData.supermarketId || currentUser?.supermarketId,
      supermarketName: updatedData.supermarketName || currentUser?.supermarketName,
    };
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? updatedEmp : emp))
    );
    saveEmployeeToSupabase(updatedEmp);
    addToast('Información del empleado actualizada correctamente.', 'success');
  };

  const handleDeleteEmployee = (id: string) => {
    const empToDelete = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    addToast(`Empleado "${empToDelete?.fullName || 'seleccionado'}" ha sido eliminado.`, 'info');
  };

  // Product CRUD Handlers (Módulo 2: Productos)
  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${String(products.length + 1).padStart(3, '0')}`,
      supermarketId: newProdData.supermarketId || currentUser?.supermarketId,
      supermarketName: newProdData.supermarketName || currentUser?.supermarketName,
    };
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToSupabase(newProduct);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const productWithTenant: Product = {
      ...updatedProduct,
      supermarketId: updatedProduct.supermarketId || currentUser?.supermarketId,
      supermarketName: updatedProduct.supermarketName || currentUser?.supermarketName,
    };
    setProducts((prev) =>
      prev.map((p) => (p.id === productWithTenant.id ? productWithTenant : p))
    );
    saveProductToSupabase(productWithTenant);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id);
  };

  // Inventory Movements Handler (Módulo 3: Inventario)
  const handleAddMovement = (
    productId: string,
    movementType: MovementType,
    quantity: number,
    newStock: number,
    reason: string,
    customDate?: string
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const previousStock = targetProduct.stock;

    // Update product stock
    const updatedProd: Product = {
      ...targetProduct,
      stock: newStock,
      supermarketId: targetProduct.supermarketId || currentUser?.supermarketId,
      supermarketName: targetProduct.supermarketName || currentUser?.supermarketName,
    };
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProd : p))
    );
    saveProductToSupabase(updatedProd);

    // Create movement record
    const now = new Date();
    const formattedDate =
      customDate ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

    const newMovement: InventoryMovement = {
      id: `mov-${String(movements.length + 1).padStart(3, '0')}`,
      productId: targetProduct.id,
      productCode: targetProduct.code,
      productName: targetProduct.name,
      productImage: targetProduct.image,
      movementType: movementType,
      quantity,
      previousStock,
      newStock,
      date: formattedDate,
      reason,
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrador',
      supermarketId: targetProduct.supermarketId || currentUser?.supermarketId,
      supermarketName: targetProduct.supermarketName || currentUser?.supermarketName,
    };

    setMovements((prev) => [newMovement, ...prev]);
    saveMovementToSupabase(newMovement);
    addToast(`Movimiento registrado: ${movementType.toUpperCase()} (${quantity} u.)`, 'success');
  };

  // Sales Complete Handler (Módulo 4: Ventas)
  const handleCompleteSale = (completedSale: Sale) => {
    const saleWithTenant: Sale = {
      ...completedSale,
      supermarketId: completedSale.supermarketId || currentUser?.supermarketId,
      supermarketName: completedSale.supermarketName || currentUser?.supermarketName,
    };

    // 1. Save sale
    setSales((prev) => [saleWithTenant, ...prev]);
    saveSaleToSupabase(saleWithTenant);

    // 2. Reduce products stock and register inventory movements
    saleWithTenant.items.forEach((item) => {
      const targetProduct = products.find((p) => p.id === item.productId);
      if (targetProduct) {
        const previousStock = targetProduct.stock;
        const newStock = Math.max(0, previousStock - item.quantity);

        // Update product stock
        const updatedProd: Product = {
          ...targetProduct,
          stock: newStock,
          supermarketId: targetProduct.supermarketId || currentUser?.supermarketId,
          supermarketName: targetProduct.supermarketName || currentUser?.supermarketName,
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === item.productId ? updatedProd : p))
        );
        saveProductToSupabase(updatedProd);

        // Register movement
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
          2,
          '0'
        )}:${String(now.getMinutes()).padStart(2, '0')}`;

        const saleMovement: InventoryMovement = {
          id: `mov-${Date.now()}-${item.productId}`,
          productId: targetProduct.id,
          productCode: targetProduct.code,
          productName: targetProduct.name,
          productImage: targetProduct.image,
          movementType: 'salida',
          quantity: item.quantity,
          previousStock,
          newStock,
          date: formattedDate,
          reason: `Venta POS #${saleWithTenant.id}`,
          userId: saleWithTenant.cashierId,
          userName: saleWithTenant.cashierName,
          supermarketId: saleWithTenant.supermarketId || targetProduct.supermarketId || currentUser?.supermarketId,
          supermarketName: saleWithTenant.supermarketName || targetProduct.supermarketName || currentUser?.supermarketName,
        };

        setMovements((prev) => [saleMovement, ...prev]);
        saveMovementToSupabase(saleMovement);
      }
    });

    addToast(`Venta #${saleWithTenant.id} registrada con éxito.`, 'success');
  };

  // Self-registration of an Employee
  const handleRegisterUser = (
    data: Omit<Employee, 'id' | 'role' | 'status'> & { password: string }
  ): { success: boolean; message: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanDoc = data.documentId.trim();

    const isDuplicate =
      users.some(
        (u) => u.email.toLowerCase() === cleanEmail || u.documentId === cleanDoc
      ) ||
      employees.some(
        (e) => e.email.toLowerCase() === cleanEmail || e.documentId === cleanDoc
      );

    if (isDuplicate) {
      return {
        success: false,
        message: 'El correo electrónico o documento de identidad ya se encuentra registrado.',
      };
    }

    const newEmpId = `emp-${Date.now()}`;
    const newUserId = `u-${Date.now()}`;

    const newEmployee: Employee = {
      id: newEmpId,
      fullName: data.fullName,
      documentId: data.documentId,
      phone: data.phone,
      address: data.address,
      email: cleanEmail,
      birthDate: data.birthDate,
      hireDate: data.hireDate,
      cargo: data.cargo,
      photo: data.photo,
      role: 'cajero',
      status: 'pendiente',
      supermarketId: data.supermarketId,
      supermarketName: data.supermarketName,
      registrationDate: new Date().toISOString().split('T')[0],
    };

    const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    const newUser: User & { password: string } = {
      id: newUserId,
      username: username || `user_${Date.now()}`,
      email: cleanEmail,
      name: data.fullName,
      role: 'cajero',
      avatar: data.photo,
      documentId: data.documentId,
      password: data.password,
      status: 'pendiente',
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      hireDate: data.hireDate,
      cargo: data.cargo,
      employeeId: newEmpId,
      supermarketId: data.supermarketId,
      supermarketName: data.supermarketName,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setUsers((prev) => [newUser, ...prev]);

    saveEmployeeToSupabase(newEmployee);
    saveUserToSupabase(newUser);

    return {
      success: true,
      message: 'Solicitud de registro enviada con éxito.',
    };
  };

  // User Registration Authorization Handler (by Admin)
  const handleAuthorizeUser = (employeeId: string, assignedRole: UserRole) => {
    // 1. Update Employee
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (targetEmp) {
      const updatedEmp: Employee = {
        ...targetEmp,
        role: assignedRole,
        status: 'activo',
      };
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? updatedEmp : emp))
      );
      saveEmployeeToSupabase(updatedEmp);
    }

    // 2. Update linked User
    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.employeeId === employeeId ||
          (targetEmp && u.email.toLowerCase() === targetEmp.email.toLowerCase())
        ) {
          const updatedUser = {
            ...u,
            role: assignedRole,
            status: 'activo' as const,
          };
          saveUserToSupabase(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    addToast(
      `Usuario "${targetEmp?.fullName || 'solicitante'}" autorizado correctamente con el rol de ${
        assignedRole === 'admin' ? 'Administrador' : 'Cajero'
      }.`,
      'success'
    );
  };

  // User Registration Rejection Handler (by Admin)
  const handleRejectUser = (employeeId: string) => {
    // 1. Update Employee
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (targetEmp) {
      const updatedEmp: Employee = { ...targetEmp, status: 'rechazado' };
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? updatedEmp : emp))
      );
      saveEmployeeToSupabase(updatedEmp);
    }

    // 2. Update linked User
    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.employeeId === employeeId ||
          (targetEmp && u.email.toLowerCase() === targetEmp.email.toLowerCase())
        ) {
          const updatedUser = { ...u, status: 'rechazado' as const };
          saveUserToSupabase(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    addToast(
      `La solicitud de registro de "${targetEmp?.fullName || 'solicitante'}" ha sido rechazada.`,
      'info'
    );
  };

  // Check if we should render public routes (Landing / Login / Register)
  const isPublic = isPublicRoute(currentRoute);

  if (isPublic && (!currentUser || currentRoute === '/' || currentRoute === '/landing' || currentRoute === '/login' || currentRoute === '/registro-supermercado' || currentRoute === '/registro-empleado')) {
    const isLanding = currentRoute === '/' || currentRoute === '/landing' || (authView === 'landing' && isPublic);
    const loginMode =
      currentRoute === '/registro-supermercado' || authView === 'register-supermarket'
        ? 'register-supermarket'
        : currentRoute === '/registro-empleado' || authView === 'register-employee'
        ? 'register-employee'
        : 'login';

    return (
      <div className="font-sans antialiased text-slate-100 bg-slate-950 min-h-screen">
        {isLanding ? (
          <LandingPage
            currentUser={currentUser}
            onNavigateToDashboard={() => {
              if (currentUser) {
                const targetTab = currentUser.role === 'superadmin' ? 'supermercados' : 'inicio';
                handleSetActiveTab(targetTab);
              }
            }}
            onNavigateToLogin={() => {
              setPrefilledCredentials({});
              setAuthView('login');
              navigate('/login');
            }}
            onNavigateToRegisterSupermarket={() => {
              setPrefilledCredentials({});
              setAuthView('register-supermarket');
              navigate('/registro-supermercado');
            }}
            onNavigateToRegisterEmployee={() => {
              setPrefilledCredentials({});
              setAuthView('register-employee');
              navigate('/registro-empleado');
            }}
            supermarkets={supermarkets}
          />
        ) : (
          <Login
            currentUser={currentUser}
            onNavigateToDashboard={() => {
              if (currentUser) {
                const targetTab = currentUser.role === 'superadmin' ? 'supermercados' : 'inicio';
                handleSetActiveTab(targetTab);
              }
            }}
            onLoginSuccess={handleLoginSuccess}
            users={users}
            employees={employees}
            supermarkets={supermarkets}
            onRegisterUser={handleRegisterUser}
            onRegisterSupermarket={handleRegisterSupermarket}
            initialMode={loginMode}
            initialIdentifier={prefilledCredentials.identifier || ''}
            initialPassword={prefilledCredentials.password || ''}
            onModeChange={(mode) => {
              if (mode === 'register-supermarket') {
                navigate('/registro-supermercado');
              } else if (mode === 'register-employee') {
                navigate('/registro-empleado');
              } else {
                navigate('/login');
              }
            }}
            onBackToLanding={() => {
              setPrefilledCredentials({});
              setAuthView('landing');
              navigate('/');
            }}
          />
        )}

        {/* Global Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-fadeIn pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-slate-900 text-slate-100 border-emerald-500/40 font-medium'
                  : toast.type === 'error'
                  ? 'bg-slate-900 text-slate-100 border-rose-500/40 font-medium'
                  : 'bg-slate-900 text-slate-100 border-slate-700 font-medium'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If unauthenticated user tries to access protected app routes, show login view
  if (!currentUser) {
    return (
      <div className="font-sans antialiased text-slate-100 bg-slate-950 min-h-screen">
        <Login
          onLoginSuccess={handleLoginSuccess}
          users={users}
          employees={employees}
          supermarkets={supermarkets}
          onRegisterUser={handleRegisterUser}
          onRegisterSupermarket={handleRegisterSupermarket}
          initialMode="login"
          initialIdentifier=""
          initialPassword=""
          onModeChange={(mode) => {
            if (mode === 'register-supermarket') {
              navigate('/registro-supermercado');
            } else if (mode === 'register-employee') {
              navigate('/registro-empleado');
            } else {
              navigate('/login');
            }
          }}
          onBackToLanding={() => {
            setAuthView('landing');
            navigate('/');
          }}
        />
        {/* Global Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-fadeIn bg-slate-900 text-slate-100 border-slate-700 font-medium pointer-events-auto"
            >
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SaaS Access Check for non-superadmin users
  const userSupermarket =
    currentUser.role !== 'superadmin' && currentUser.supermarketId
      ? supermarkets.find((s) => s.id === currentUser.supermarketId)
      : null;

  const accessInfo = userSupermarket
    ? getSupermarketAccessInfo(userSupermarket)
    : null;

  // Block access if supermarket is expired, deactivated, rejected or pending
  if (
    currentUser.role !== 'superadmin' &&
    accessInfo &&
    (accessInfo.effectiveStatus === 'vencido' ||
      accessInfo.effectiveStatus === 'desactivado' ||
      accessInfo.effectiveStatus === 'rechazado' ||
      accessInfo.effectiveStatus === 'pendiente')
  ) {
    return (
      <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <AccessBlockedScreen
          status={accessInfo.effectiveStatus}
          supermarketName={userSupermarket?.name || currentUser.supermarketName}
          onLogout={handleLogout}
          customMessage={accessInfo.blockMessage}
        />
        {/* Global Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-fadeIn pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-white text-slate-800 border-emerald-200 font-medium'
                  : toast.type === 'error'
                  ? 'bg-white text-slate-800 border-rose-200 font-medium'
                  : 'bg-white text-slate-800 border-slate-200 font-medium'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Screen Title Mapping
  const getScreenTitle = () => {
    if (currentUser.role === 'superadmin') {
      return 'Supermercados — Panel de Control SaaS';
    }
    if (activeTab === 'inicio') {
      return currentUser.role === 'admin' ? 'Inicio — Administrador' : 'Inicio — Cajero';
    }
    if (activeTab === 'ventas') {
      return 'Punto de Venta (POS) — Ventas';
    }
    if (activeTab === 'cierre') {
      return 'Cierre de Jornada — Arqueo y Contabilidad';
    }
    if (activeTab === 'productos') {
      return 'Gestión de Productos';
    }
    if (activeTab === 'inventario') {
      return 'Gestión de Inventario y Control de Stock';
    }
    if (activeTab === 'reportes') {
      return 'Reportes de Ventas';
    }
    if (activeTab === 'dashboard') {
      return 'Panel de Estadísticas (Dashboard)';
    }
    if (activeTab === 'empleados') {
      return 'Gestión de Empleados';
    }
    return 'SuperMercado Express';
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen flex">
      {/* Sidebar Component */}
      <Sidebar
        currentRole={currentUser.role}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
        supermarketName={userSupermarket?.name || currentUser.supermarketName}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header Component */}
        <Header
          title={getScreenTitle()}
          userName={currentUser.name}
          userRole={currentUser.role}
          userAvatar={currentUser.avatar}
          supermarketName={userSupermarket?.name || currentUser.supermarketName}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Expiring Soon Banner for Supermarket Admins/Cashiers */}
        {currentUser.role !== 'superadmin' && accessInfo?.isExpiringSoon && (
          <div className="bg-amber-500 text-slate-950 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold shadow-xs border-b border-amber-600">
            <div className="flex items-center gap-2 max-w-4xl">
              <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>
                <strong>Aviso de suscripción:</strong> El período de acceso autorizado para &ldquo;{userSupermarket?.name}&rdquo; vencerá en {accessInfo.daysRemaining} {accessInfo.daysRemaining === 1 ? 'día' : 'días'} (el {formatBolivianDate(userSupermarket?.expirationDate)}). Contacte al Super Administrador para renovar su período.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-900 text-amber-300 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">
              Próximo a vencer
            </span>
          </div>
        )}

        {/* Page Body View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* SUPER ADMIN ROUTE */}
          {currentUser.role === 'superadmin' && (
            <SuperAdminPanel
              supermarkets={supermarkets}
              existingUsers={users}
              existingEmployees={employees}
              onApproveSupermarket={handleApproveSupermarket}
              onRejectSupermarket={handleRejectSupermarket}
              onSaveAccessPeriod={handleSaveAccessPeriod}
              onDeactivateSupermarket={handleDeactivateSupermarket}
              onCreateSupermarket={handleCreateSupermarketBySuperAdmin}
              showToast={addToast}
              referenceDate={getTodayIsoString()}
            />
          )}

          {/* SUPERMARKET STANDARD ROUTES */}
          {currentUser.role !== 'superadmin' && activeTab === 'inicio' && currentUser.role === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              employees={scopedEmployees}
              onNavigateToEmployees={() => handleSetActiveTab('empleados')}
              onNavigateToDashboard={() => handleSetActiveTab('dashboard')}
            />
          )}

          {currentUser.role !== 'superadmin' && activeTab === 'inicio' && currentUser.role === 'cajero' && (
            <CashierDashboard
              currentUser={currentUser}
              onNavigateToSales={() => handleSetActiveTab('ventas')}
              onNavigateToShiftClosure={() => handleSetActiveTab('cierre')}
            />
          )}

          {/* Cierre de Jornada (Cajero) */}
          {currentUser.role !== 'superadmin' && activeTab === 'cierre' && (
            <ShiftClosureModule
              currentUser={currentUser}
              sales={scopedSales}
              shiftClosures={scopedShiftClosures}
              onSaveShiftClosure={handleSaveShiftClosure}
              showToast={addToast}
            />
          )}

          {/* Módulo 4: Ventas (Punto de Venta POS) */}
          {currentUser.role !== 'superadmin' && activeTab === 'ventas' && (
            <SalesModule
              key={`sales-${currentUser.id}-${sessionKey}`}
              products={scopedProducts}
              currentUser={currentUser}
              onCompleteSale={handleCompleteSale}
              showToast={addToast}
              recentSales={scopedSales}
            />
          )}

          {/* Módulo 2: Productos */}
          {currentUser.role !== 'superadmin' && activeTab === 'productos' && (
            <ProductManagement
              key={`prod-${currentUser.id}-${sessionKey}`}
              products={scopedProducts}
              currentUser={currentUser}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              showToast={addToast}
            />
          )}

          {/* Módulo 3: Inventario */}
          {currentUser.role !== 'superadmin' && activeTab === 'inventario' && (
            <InventoryManagement
              key={`inv-${currentUser.id}-${sessionKey}`}
              products={scopedProducts}
              movements={scopedMovements}
              currentUser={currentUser}
              onAddMovement={handleAddMovement}
              showToast={addToast}
            />
          )}

          {/* Módulo 5: Reportes (Solo Administrador) */}
          {currentUser.role !== 'superadmin' && activeTab === 'reportes' && currentUser.role === 'admin' && (
            <ReportsModule
              key={`rep-${currentUser.id}-${sessionKey}`}
              sales={scopedSales}
              currentUser={currentUser}
              showToast={addToast}
            />
          )}

          {currentUser.role !== 'superadmin' && activeTab === 'reportes' && currentUser.role !== 'admin' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
              <p className="text-sm text-slate-600">
                El Módulo de Reportes Generales está reservado únicamente para el perfil de Administrador.
              </p>
            </div>
          )}

          {/* Módulo 6: Panel de Estadísticas (Dashboard - Solo Admin) */}
          {currentUser.role !== 'superadmin' && activeTab === 'dashboard' && currentUser.role === 'admin' && (
            <StatsDashboard
              key={`dash-${currentUser.id}-${sessionKey}`}
              sales={scopedSales}
              products={scopedProducts}
              currentUser={currentUser}
              employees={scopedEmployees}
            />
          )}

          {currentUser.role !== 'superadmin' && activeTab === 'dashboard' && currentUser.role !== 'admin' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
              <p className="text-sm text-slate-600">
                El Panel de Estadísticas y KPIs está reservado únicamente para el perfil de Administrador.
              </p>
            </div>
          )}

          {currentUser.role !== 'superadmin' && activeTab === 'empleados' && currentUser.role === 'admin' && (
            <EmployeeManagement
              key={`emp-${currentUser.id}-${sessionKey}`}
              employees={scopedEmployees}
              users={users}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAuthorizeUser={handleAuthorizeUser}
              onRejectUser={handleRejectUser}
              currentSupermarketName={currentUser.supermarketName}
              currentSupermarketId={currentUser.supermarketId}
            />
          )}

          {/* Fallback if Cashier attempts to open Admin route */}
          {currentUser.role !== 'superadmin' && activeTab === 'empleados' && currentUser.role !== 'admin' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
              <p className="text-sm text-slate-600">
                La administración de empleados está reservada únicamente para el perfil de Administrador.
              </p>
              <button
                onClick={() => handleSetActiveTab('inicio')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Volver a Inicio
              </button>
            </div>
          )}
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onChangePassword={handleChangePassword}
        onUpdateProfile={handleUpdateProfile}
        users={users}
        employees={employees}
      />

      {/* Supabase Integration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncAllData={handleSyncAllData}
      />

      {/* Global Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-fadeIn pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-white text-slate-800 border-emerald-200 font-medium'
                : toast.type === 'error'
                ? 'bg-white text-slate-800 border-rose-200 font-medium'
                : 'bg-white text-slate-800 border-slate-200 font-medium'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
