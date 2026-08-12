import { useState } from 'react';
import { User, Employee, Product, InventoryMovement, MovementType, ToastMessage, Sale, ShiftClosure, UserRole } from './types';
import { INITIAL_USERS, INITIAL_EMPLOYEES, INITIAL_PRODUCTS, INITIAL_INVENTORY_MOVEMENTS, INITIAL_SALES } from './data/mockData';
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
import { UserProfileModal } from './components/UserProfileModal';
import { CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<(User & { password: string })[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_INVENTORY_MOVEMENTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [shiftClosures, setShiftClosures] = useState<ShiftClosure[]>([]);
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Shift Closure Save Handler
  const handleSaveShiftClosure = (newClosure: ShiftClosure) => {
    setShiftClosures((prev) => [
      newClosure,
      ...prev.filter(
        (c) => !(c.cashierId === newClosure.cashierId && c.date === newClosure.date)
      ),
    ]);
  };

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
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

    addToast('Contraseña actualizada exitosamente.', 'success');
    return { success: true, message: 'Contraseña actualizada exitosamente.' };
  };

  // Handle Login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('inicio');
    addToast(`¡Bienvenido(a), ${user.name}! Sesión iniciada como ${user.role === 'admin' ? 'Administrador' : 'Cajero'}.`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('inicio');
    addToast('Sesión cerrada correctamente.', 'info');
  };

  // Employee CRUD Handlers
  const handleAddEmployee = (newEmpData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmpData,
      id: `emp-${String(employees.length + 1).padStart(3, '0')}`,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    addToast(`Empleado "${newEmployee.fullName}" registrado exitosamente.`, 'success');
  };

  const handleUpdateEmployee = (id: string, updatedData: Omit<Employee, 'id'>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...updatedData, id } : emp))
    );
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
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

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
      movementType,
      quantity,
      previousStock,
      newStock,
      reason,
      date: formattedDate,
      userId: currentUser?.id || 'usr-anon',
      userName: currentUser?.name || 'Usuario',
    };

    setMovements((prev) => [newMovement, ...prev]);

    addToast(
      `Movimiento de ${movementType === 'entrada' ? 'entrada' : 'ajuste'} registrado para "${
        targetProduct.name
      }". Nueva existencia: ${newStock}`,
      'success'
    );
  };

  // Sales Handler (Módulo 4: Ventas)
  const handleCompleteSale = (completedSale: Sale) => {
    // Stock sufficiency verification guard
    for (const item of completedSale.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        addToast(
          `Venta cancelada: El producto "${item.name}" no tiene suficiente stock disponible (Disponible: ${prod ? prod.stock : 0}, Solicitado: ${item.quantity}).`,
          'error'
        );
        return;
      }
    }

    // 1. Deduct stock from products
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemSold = completedSale.items.find((it) => it.productId === p.id);
        if (itemSold) {
          const updatedStock = Math.max(0, p.stock - itemSold.quantity);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    // 2. Automatically log inventory movements for each sold item
    const newMovements: InventoryMovement[] = completedSale.items.map((item, idx) => {
      const targetProd = products.find((p) => p.id === item.productId);
      const prevStock = targetProd ? targetProd.stock : item.stockAvailable;
      const newStock = Math.max(0, prevStock - item.quantity);

      return {
        id: `mov-vta-${completedSale.id}-${idx + 1}`,
        productId: item.productId,
        productCode: item.code,
        productName: item.name,
        productImage: item.image,
        movementType: 'ajuste' as MovementType,
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock: newStock,
        reason: `Salida automática por Venta N° ${completedSale.id}`,
        date: completedSale.date,
        userId: completedSale.cashierId,
        userName: completedSale.cashierName,
      };
    });

    setMovements((prev) => [...newMovements, ...prev]);

    // 3. Save sale
    setSales((prev) => [completedSale, ...prev]);
  };

  // User Registration Handler (from Login page)
  const handleRegisterUser = (regData: {
    fullName: string;
    documentId: string;
    phone: string;
    address: string;
    email: string;
    birthDate: string;
    hireDate: string;
    cargo: string;
    photo: string;
    password: string;
  }): { success: boolean; message: string } => {
    // Check if email already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === regData.email.toLowerCase());
    if (existingUser) {
      return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
    }

    const newEmpId = `emp-${String(employees.length + 1).padStart(3, '0')}`;
    const newUserId = `usr-${String(users.length + 1).padStart(3, '0')}`;

    const newEmployee: Employee = {
      id: newEmpId,
      fullName: regData.fullName,
      documentId: regData.documentId,
      phone: regData.phone,
      address: regData.address,
      email: regData.email,
      birthDate: regData.birthDate,
      hireDate: regData.hireDate || new Date().toISOString().split('T')[0],
      role: 'cajero',
      cargo: regData.cargo || 'Cajero',
      photo: regData.photo,
      status: 'pendiente',
      registrationDate: new Date().toISOString().split('T')[0],
    };

    const newUser: User & { password: string } = {
      id: newUserId,
      username: regData.email.split('@')[0],
      name: regData.fullName,
      email: regData.email,
      documentId: regData.documentId,
      role: 'cajero',
      avatar: regData.photo,
      employeeId: newEmpId,
      password: regData.password,
      status: 'pendiente',
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setUsers((prev) => [newUser, ...prev]);

    addToast('Solicitud de registro enviada. Un Administrador debe autorizar su acceso.', 'info');

    return {
      success: true,
      message: 'Registro completado. Su cuenta está en estado "Pendiente de Autorización". El Administrador debe aprobarla antes de poder iniciar sesión.',
    };
  };

  // User Registration Authorization Handler (by Admin)
  const handleAuthorizeUser = (employeeId: string, assignedRole: UserRole) => {
    // 1. Update Employee
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              status: 'activo',
              role: assignedRole,
              cargo: emp.cargo || (assignedRole === 'admin' ? 'Administrador' : 'Cajero'),
            }
          : emp
      )
    );

    // 2. Update linked User
    const targetEmp = employees.find((e) => e.id === employeeId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.employeeId === employeeId || (targetEmp && u.email.toLowerCase() === targetEmp.email.toLowerCase())) {
          return {
            ...u,
            status: 'activo',
            role: assignedRole,
          };
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
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, status: 'rechazado' } : emp))
    );

    // 2. Update linked User
    const targetEmp = employees.find((e) => e.id === employeeId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.employeeId === employeeId || (targetEmp && u.email.toLowerCase() === targetEmp.email.toLowerCase())) {
          return {
            ...u,
            status: 'rechazado',
          };
        }
        return u;
      })
    );

    addToast(`La solicitud de registro de "${targetEmp?.fullName || 'solicitante'}" ha sido rechazada.`, 'info');
  };

  // Render Login screen if no active session
  if (!currentUser) {
    return (
      <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
        <Login
          onLoginSuccess={handleLoginSuccess}
          users={users}
          onRegisterUser={handleRegisterUser}
        />

        {/* Global Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-fadeIn ${
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
    if (activeTab === 'inicio') {
      return currentUser.role === 'admin' ? 'Inicio — Administrador' : 'Inicio — Cajero';
    }
    if (activeTab === 'ventas') {
      return 'Punto de Venta — Módulo de Ventas';
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Page Body View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Active Tab Logic */}
          {activeTab === 'inicio' && currentUser.role === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              employees={employees}
              onNavigateToEmployees={() => setActiveTab('empleados')}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'inicio' && currentUser.role === 'cajero' && (
            <CashierDashboard
              currentUser={currentUser}
              onNavigateToSales={() => setActiveTab('ventas')}
              onNavigateToShiftClosure={() => setActiveTab('cierre')}
            />
          )}

          {/* Cierre de Jornada (Cajero) */}
          {activeTab === 'cierre' && (
            <ShiftClosureModule
              currentUser={currentUser}
              sales={sales}
              shiftClosures={shiftClosures}
              onSaveShiftClosure={handleSaveShiftClosure}
              showToast={addToast}
            />
          )}

          {/* Módulo 4: Ventas (Punto de Venta POS) */}
          {activeTab === 'ventas' && (
            <SalesModule
              products={products}
              currentUser={currentUser}
              onCompleteSale={handleCompleteSale}
              showToast={addToast}
              recentSales={sales}
            />
          )}

          {/* Módulo 2: Productos */}
          {activeTab === 'productos' && (
            <ProductManagement
              products={products}
              currentUser={currentUser}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              showToast={addToast}
            />
          )}

          {/* Módulo 3: Inventario */}
          {activeTab === 'inventario' && (
            <InventoryManagement
              products={products}
              movements={movements}
              currentUser={currentUser}
              onAddMovement={handleAddMovement}
              showToast={addToast}
            />
          )}

          {/* Módulo 5: Reportes (Solo Administrador) */}
          {activeTab === 'reportes' && currentUser.role === 'admin' && (
            <ReportsModule
              sales={sales}
              currentUser={currentUser}
              showToast={addToast}
            />
          )}

          {activeTab === 'reportes' && currentUser.role !== 'admin' && (
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
          {activeTab === 'dashboard' && currentUser.role === 'admin' && (
            <StatsDashboard
              sales={sales}
              products={products}
              currentUser={currentUser}
              employees={employees}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role !== 'admin' && (
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

          {activeTab === 'empleados' && currentUser.role === 'admin' && (
            <EmployeeManagement
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAuthorizeUser={handleAuthorizeUser}
              onRejectUser={handleRejectUser}
            />
          )}

          {/* Fallback if Cashier attempts to open Admin route */}
          {activeTab === 'empleados' && currentUser.role !== 'admin' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
              <p className="text-sm text-slate-600">
                La administración de empleados está reservada únicamente para el perfil de Administrador.
              </p>
              <button
                onClick={() => setActiveTab('inicio')}
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

