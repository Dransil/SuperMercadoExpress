import { createClient } from '@supabase/supabase-js';
import { User, Employee, Product, InventoryMovement, Sale, ShiftClosure, Supermarket } from '../types';
import { INITIAL_USERS, INITIAL_EMPLOYEES, INITIAL_SUPERMARKETS } from '../data/mockData';

// Supabase Project Credentials provided by user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://xdakviiciioxedhqemmz.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYWt2aWljaWlveGVkaHFlbW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDU4ODQsImV4cCI6MjEwMjA4MTg4NH0.X7K3WHiOyvBu68Rc_GQaprZnd5YWJCHbaJq-lWsGyJ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if connection to Supabase is active
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      if (error.message?.includes('relation "public.users" does not exist') || error.code === '42P01') {
        return { connected: false, error: 'Tablas no creadas en Supabase. Ejecuta el script SQL.' };
      }
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * SQL Script generator for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- 1. ELIMINACIÓN DE TABLAS EXISTENTES (CASCADE PARA RESET COMPLETO)
-- =========================================================================
DROP TABLE IF EXISTS public.shift_closures CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.supermarkets CASCADE;

-- =========================================================================
-- 2. CREACIÓN DE TABLAS DEL MODELO SAAS MULTI-TENANT
-- =========================================================================

-- 2.1 Tabla de Supermercados (Gestión de Licenciamiento SaaS)
CREATE TABLE public.supermarkets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'activo', 'vencido', 'desactivado')),
  registration_date TEXT NOT NULL,
  start_date TEXT,
  expiration_date TEXT,
  is_manually_deactivated BOOLEAN DEFAULT FALSE,
  deactivated_at TEXT,
  deactivation_reason TEXT,
  last_access_update TEXT,
  admin_id TEXT,
  admin_name TEXT,
  admin_email TEXT,
  admin_document_id TEXT,
  admin_phone TEXT,
  admin_address TEXT,
  admin_birth_date TEXT,
  admin_hire_date TEXT,
  admin_photo TEXT,
  reviewed_at TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Tabla de Usuarios y Credenciales
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cajero' CHECK (role IN ('superadmin', 'admin', 'cajero')),
  avatar TEXT,
  document_id TEXT,
  employee_id TEXT,
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE SET NULL,
  supermarket_name TEXT,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'pendiente')),
  phone TEXT,
  address TEXT,
  birth_date TEXT,
  hire_date TEXT,
  cargo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Tabla de Empleados
CREATE TABLE public.employees (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  birth_date TEXT,
  hire_date TEXT,
  role TEXT NOT NULL DEFAULT 'cajero' CHECK (role IN ('superadmin', 'admin', 'cajero')),
  photo TEXT,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'pendiente')),
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  supermarket_name TEXT,
  cargo TEXT,
  registration_date TEXT,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Tabla de Catálogo de Productos
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  brand TEXT,
  selling_unit TEXT DEFAULT 'Unidad',
  purchase_price NUMERIC(10,2) DEFAULT 0,
  sale_price NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  image TEXT,
  stock NUMERIC(10,2) DEFAULT 0,
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  supermarket_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Tabla de Movimientos de Inventario (Kardex)
CREATE TABLE public.inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_code TEXT,
  product_name TEXT,
  product_image TEXT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste')),
  quantity NUMERIC(10,2) NOT NULL,
  previous_stock NUMERIC(10,2) NOT NULL,
  new_stock NUMERIC(10,2) NOT NULL,
  reason TEXT,
  date TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  supermarket_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Tabla de Ventas (Punto de Venta POS)
CREATE TABLE public.sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
  amount_tendered NUMERIC(10,2),
  change_given NUMERIC(10,2),
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  supermarket_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Tabla de Cierres de Turno / Arqueo de Caja
CREATE TABLE public.shift_closures (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  sales_count INT DEFAULT 0,
  total_sales NUMERIC(10,2) DEFAULT 0,
  cash_total NUMERIC(10,2) DEFAULT 0,
  card_total NUMERIC(10,2) DEFAULT 0,
  transfer_total NUMERIC(10,2) DEFAULT 0,
  declared_cash NUMERIC(10,2) DEFAULT 0,
  expected_cash NUMERIC(10,2) DEFAULT 0,
  difference NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('coincidencia', 'faltante', 'sobrante')),
  closed_at TEXT NOT NULL,
  supermarket_id TEXT REFERENCES public.supermarkets(id) ON DELETE CASCADE,
  supermarket_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 3. ÍNDICES DE RENDIMIENTO MULTI-TENANT
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_supermarket ON public.users(supermarket_id);
CREATE INDEX IF NOT EXISTS idx_employees_supermarket ON public.employees(supermarket_id);
CREATE INDEX IF NOT EXISTS idx_products_supermarket ON public.products(supermarket_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supermarket ON public.inventory_movements(supermarket_id);
CREATE INDEX IF NOT EXISTS idx_sales_supermarket ON public.sales(supermarket_id);
CREATE INDEX IF NOT EXISTS idx_shift_closures_supermarket ON public.shift_closures(supermarket_id);

-- =========================================================================
-- 4. REGISTROS INICIALES: SUPER ADMINISTRADOR GLOBAL SAAS
-- =========================================================================
INSERT INTO public.users (
  id,
  username,
  email,
  password,
  name,
  role,
  document_id,
  status,
  cargo,
  avatar
) VALUES (
  'u-superadmin',
  'superadmin',
  'thecobra1783@gmail.com',
  'taqcod789456.-.',
  'Emanuel Taquichiri',
  'superadmin',
  '0000000000',
  'activo',
  'Super Administrador Plataforma',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  cargo = EXCLUDED.cargo;

INSERT INTO public.employees (
  id,
  full_name,
  document_id,
  phone,
  address,
  email,
  birth_date,
  hire_date,
  role,
  photo,
  status,
  cargo,
  registration_date,
  user_id
) VALUES (
  'emp-superadmin',
  'Emanuel Taquichiri',
  '0000000000',
  '+591 70000000',
  'Oficina Central SaaS',
  'thecobra1783@gmail.com',
  '1995-01-01',
  '2024-01-01',
  'superadmin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'activo',
  'Super Administrador Plataforma',
  '2024-01-01',
  'u-superadmin'
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 5. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_closures ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 6. POLÍTICAS DE ACCESO PARA LAS OPERACIONES DEL SISTEMA
-- =========================================================================

-- Supermarkets
DROP POLICY IF EXISTS "Permitir lectura publica de supermercados" ON public.supermarkets;
CREATE POLICY "Permitir lectura publica de supermercados" ON public.supermarkets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion de registros de supermercados" ON public.supermarkets;
CREATE POLICY "Permitir insercion de registros de supermercados" ON public.supermarkets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de supermercados" ON public.supermarkets;
CREATE POLICY "Permitir actualizacion de supermercados" ON public.supermarkets
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion de supermercados" ON public.supermarkets;
CREATE POLICY "Permitir eliminacion de supermercados" ON public.supermarkets
  FOR DELETE USING (true);

-- Users
DROP POLICY IF EXISTS "Permitir acceso a usuarios" ON public.users;
CREATE POLICY "Permitir acceso a usuarios" ON public.users
  FOR ALL USING (true);

-- Employees
DROP POLICY IF EXISTS "Permitir acceso a empleados" ON public.employees;
CREATE POLICY "Permitir acceso a empleados" ON public.employees
  FOR ALL USING (true);

-- Products
DROP POLICY IF EXISTS "Permitir acceso a productos" ON public.products;
CREATE POLICY "Permitir acceso a productos" ON public.products
  FOR ALL USING (true);

-- Kardex / Inventario
DROP POLICY IF EXISTS "Permitir acceso a kardex inventario" ON public.inventory_movements;
CREATE POLICY "Permitir acceso a kardex inventario" ON public.inventory_movements
  FOR ALL USING (true);

-- Ventas POS
DROP POLICY IF EXISTS "Permitir acceso a ventas" ON public.sales;
CREATE POLICY "Permitir acceso a ventas" ON public.sales
  FOR ALL USING (true);

-- Cierres de Turno
DROP POLICY IF EXISTS "Permitir acceso a cierres de turno" ON public.shift_closures;
CREATE POLICY "Permitir acceso a cierres de turno" ON public.shift_closures
  FOR ALL USING (true);
`;

// Fetchers from Supabase

export async function fetchSupermarketsFromSupabase(): Promise<Supermarket[]> {
  try {
    const { data, error } = await supabase.from('supermarkets').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return [];
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      phone: item.phone,
      email: item.email,
      status: item.status || 'pendiente',
      registrationDate: item.registration_date,
      startDate: item.start_date || undefined,
      expirationDate: item.expiration_date || undefined,
      isManuallyDeactivated: item.is_manually_deactivated || false,
      deactivatedAt: item.deactivated_at || undefined,
      deactivationReason: item.deactivation_reason || undefined,
      lastAccessUpdate: item.last_access_update || undefined,
      adminId: item.admin_id,
      adminName: item.admin_name,
      adminEmail: item.admin_email,
      adminDocumentId: item.admin_document_id,
      adminPhone: item.admin_phone,
      adminAddress: item.admin_address,
      adminBirthDate: item.admin_birth_date || '',
      adminHireDate: item.admin_hire_date || '',
      adminPhoto: item.admin_photo || '',
      reviewedAt: item.reviewed_at,
      notes: item.notes,
    }));
  } catch {
    return [];
  }
}

// Fetchers from Supabase

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description || '',
      category: item.category || 'General',
      brand: item.brand || '',
      sellingUnit: item.selling_unit || 'Unidad',
      purchasePrice: Number(item.purchase_price) || 0,
      salePrice: Number(item.sale_price) || 0,
      status: item.status || 'activo',
      image: item.image || '',
      stock: Number(item.stock) || 0,
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchUsersFromSupabase(): Promise<(User & { password: string })[]> {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data || data.length === 0) return [];
    return data.map((item: any) => ({
      id: item.id,
      username: item.username,
      email: item.email,
      password: item.password || 'admin123',
      name: item.name,
      role: item.role,
      avatar: item.avatar || '',
      documentId: item.document_id || '',
      employeeId: item.employee_id || '',
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
      status: item.status || 'activo',
      phone: item.phone || '',
      address: item.address || '',
      birthDate: item.birth_date || '',
      hireDate: item.hire_date || '',
      cargo: item.cargo || '',
      createdAt: item.created_at || '',
    }));
  } catch {
    return [];
  }
}

export async function fetchEmployeesFromSupabase(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase.from('employees').select('*');
    if (error || !data || data.length === 0) return [];
    return data.map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      documentId: item.document_id,
      phone: item.phone || '',
      address: item.address || '',
      email: item.email || '',
      birthDate: item.birth_date || '',
      hireDate: item.hire_date || '',
      role: item.role || 'cajero',
      photo: item.photo || '',
      status: item.status || 'activo',
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
      cargo: item.cargo || '',
      registrationDate: item.registration_date || '',
      userId: item.user_id || '',
    }));
  } catch {
    return [];
  }
}

export async function fetchSalesFromSupabase(): Promise<Sale[]> {
  try {
    const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      cashierId: item.cashier_id,
      cashierName: item.cashier_name,
      items: item.items || [],
      subtotal: Number(item.subtotal) || 0,
      discount: Number(item.discount) || 0,
      total: Number(item.total) || 0,
      paymentMethod: item.payment_method,
      amountTendered: item.amount_tendered ? Number(item.amount_tendered) : undefined,
      changeGiven: item.change_given ? Number(item.change_given) : undefined,
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchMovementsFromSupabase(): Promise<InventoryMovement[]> {
  try {
    const { data, error } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productCode: item.product_code || '',
      productName: item.product_name || '',
      productImage: item.product_image || '',
      movementType: item.movement_type,
      quantity: Number(item.quantity) || 0,
      previousStock: Number(item.previous_stock) || 0,
      newStock: Number(item.new_stock) || 0,
      reason: item.reason || '',
      date: item.date,
      userId: item.user_id || '',
      userName: item.user_name || '',
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchShiftClosuresFromSupabase(): Promise<ShiftClosure[]> {
  try {
    const { data, error } = await supabase.from('shift_closures').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      cashierId: item.cashier_id,
      cashierName: item.cashier_name,
      salesCount: item.sales_count || 0,
      totalSales: Number(item.total_sales) || 0,
      cashTotal: Number(item.cash_total) || 0,
      cardTotal: Number(item.card_total) || 0,
      transferTotal: Number(item.transfer_total) || 0,
      declaredCash: Number(item.declared_cash) || 0,
      expectedCash: Number(item.expected_cash) || 0,
      difference: Number(item.difference) || 0,
      status: item.status,
      closedAt: item.closed_at,
      supermarketId: item.supermarket_id || undefined,
      supermarketName: item.supermarket_name || undefined,
    }));
  } catch {
    return [];
  }
}

// Savers to Supabase

export async function saveProductToSupabase(product: Product): Promise<void> {
  try {
    await supabase.from('products').upsert({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      selling_unit: product.sellingUnit,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      status: product.status,
      image: product.image,
      stock: product.stock,
      supermarket_id: product.supermarketId,
      supermarket_name: product.supermarketName,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Error syncing product to Supabase:', e);
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<void> {
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (e) {
    console.warn('Error deleting product from Supabase:', e);
  }
}

export async function saveSaleToSupabase(sale: Sale): Promise<void> {
  try {
    await supabase.from('sales').insert({
      id: sale.id,
      date: sale.date,
      cashier_id: sale.cashierId,
      cashier_name: sale.cashierName,
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      payment_method: sale.paymentMethod,
      amount_tendered: sale.amountTendered,
      change_given: sale.changeGiven,
      supermarket_id: sale.supermarketId,
      supermarket_name: sale.supermarketName,
    });
  } catch (e) {
    console.warn('Error saving sale to Supabase:', e);
  }
}

export async function saveMovementToSupabase(movement: InventoryMovement): Promise<void> {
  try {
    await supabase.from('inventory_movements').insert({
      id: movement.id,
      product_id: movement.productId,
      product_code: movement.productCode,
      product_name: movement.productName,
      product_image: movement.productImage,
      movement_type: movement.movementType,
      quantity: movement.quantity,
      previous_stock: movement.previousStock,
      new_stock: movement.newStock,
      reason: movement.reason,
      date: movement.date,
      user_id: movement.userId,
      user_name: movement.userName,
      supermarket_id: movement.supermarketId,
      supermarket_name: movement.supermarketName,
    });
  } catch (e) {
    console.warn('Error saving movement to Supabase:', e);
  }
}

export async function saveShiftClosureToSupabase(closure: ShiftClosure): Promise<void> {
  try {
    await supabase.from('shift_closures').insert({
      id: closure.id,
      date: closure.date,
      cashier_id: closure.cashierId,
      cashier_name: closure.cashierName,
      sales_count: closure.salesCount,
      total_sales: closure.totalSales,
      cash_total: closure.cashTotal,
      card_total: closure.cardTotal,
      transfer_total: closure.transferTotal,
      declared_cash: closure.declaredCash,
      expected_cash: closure.expectedCash,
      difference: closure.difference,
      status: closure.status,
      closed_at: closure.closedAt,
      supermarket_id: closure.supermarketId,
      supermarket_name: closure.supermarketName,
    });
  } catch (e) {
    console.warn('Error saving shift closure to Supabase:', e);
  }
}

export async function saveUserToSupabase(user: User & { password?: string }): Promise<void> {
  try {
    await supabase.from('users').upsert({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      document_id: user.documentId,
      employee_id: user.employeeId,
      supermarket_id: user.supermarketId,
      supermarket_name: user.supermarketName,
      password: user.password || 'admin123',
      status: user.status,
      phone: user.phone,
      address: user.address,
      birth_date: user.birthDate,
      hire_date: user.hireDate,
      cargo: user.cargo,
    });
  } catch (e) {
    console.warn('Error syncing user to Supabase:', e);
  }
}

export async function saveEmployeeToSupabase(employee: Employee): Promise<void> {
  try {
    await supabase.from('employees').upsert({
      id: employee.id,
      full_name: employee.fullName,
      document_id: employee.documentId,
      phone: employee.phone,
      address: employee.address,
      email: employee.email,
      birth_date: employee.birthDate,
      hire_date: employee.hireDate,
      role: employee.role,
      photo: employee.photo,
      status: employee.status,
      supermarket_id: employee.supermarketId,
      supermarket_name: employee.supermarketName,
      cargo: employee.cargo,
      registration_date: employee.registrationDate,
      user_id: employee.userId,
    });
  } catch (e) {
    console.warn('Error syncing employee to Supabase:', e);
  }
}

export async function deleteEmployeeFromSupabase(employeeId: string): Promise<void> {
  try {
    await supabase.from('employees').delete().eq('id', employeeId);
  } catch (e) {
    console.warn('Error deleting employee from Supabase:', e);
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<void> {
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch (e) {
    console.warn('Error deleting user from Supabase:', e);
  }
}

export async function saveSupermarketToSupabase(supermarket: Supermarket): Promise<void> {
  try {
    await supabase.from('supermarkets').upsert({
      id: supermarket.id,
      name: supermarket.name,
      address: supermarket.address,
      phone: supermarket.phone,
      email: supermarket.email,
      status: supermarket.status,
      registration_date: supermarket.registrationDate,
      start_date: supermarket.startDate || null,
      expiration_date: supermarket.expirationDate || null,
      is_manually_deactivated: supermarket.isManuallyDeactivated || false,
      deactivated_at: supermarket.deactivatedAt || null,
      deactivation_reason: supermarket.deactivationReason || null,
      last_access_update: supermarket.lastAccessUpdate || null,
      admin_id: supermarket.adminId,
      admin_name: supermarket.adminName,
      admin_email: supermarket.adminEmail,
      admin_document_id: supermarket.adminDocumentId,
      admin_phone: supermarket.adminPhone,
      admin_address: supermarket.adminAddress,
      admin_birth_date: supermarket.adminBirthDate,
      admin_hire_date: supermarket.adminHireDate,
      admin_photo: supermarket.adminPhoto,
      reviewed_at: supermarket.reviewedAt,
      notes: supermarket.notes,
    });
  } catch (e) {
    console.warn('Error syncing supermarket to Supabase:', e);
  }
}

/**
 * Ensures the default Super Admin, Admin and initial Supermarket exist in Supabase
 */
export async function ensureAdminInSupabase(): Promise<void> {
  for (const user of INITIAL_USERS) {
    await saveUserToSupabase(user);
  }
  for (const emp of INITIAL_EMPLOYEES) {
    await saveEmployeeToSupabase(emp);
  }
  for (const sm of INITIAL_SUPERMARKETS) {
    await saveSupermarketToSupabase(sm);
  }
}
