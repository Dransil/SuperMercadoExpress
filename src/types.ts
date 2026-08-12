export type UserRole = 'admin' | 'cajero';
export type UserStatus = 'activo' | 'inactivo' | 'pendiente' | 'rechazado';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  documentId: string;
  employeeId?: string;
  password?: string;
  status?: UserStatus;
  phone?: string;
  address?: string;
  birthDate?: string;
  hireDate?: string;
  cargo?: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  documentId: string;
  phone: string;
  address: string;
  email: string;
  birthDate: string;
  hireDate: string;
  role: UserRole;
  photo: string;
  status: UserStatus;
  cargo?: string;
  registrationDate?: string;
  userId?: string;
}

export type ProductStatus = 'activo' | 'inactivo';

export interface Product {
  id: string;
  code: string; // Código del producto
  name: string; // Nombre
  description: string; // Descripción
  category: string; // Categoría
  brand: string; // Marca
  sellingUnit: string; // Unidad de venta (Unidad, Kg, Litro, etc.)
  purchasePrice: number; // Precio de compra
  salePrice: number; // Precio de venta
  status: ProductStatus; // Estado (Activo / Inactivo)
  image: string; // Imagen del producto
  stock: number; // Existencia actual en inventario
}

export type MovementType = 'entrada' | 'ajuste';

export type InventoryStatus = 'disponible' | 'stock_bajo' | 'sin_stock';

export interface InventoryMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productImage: string;
  movementType: MovementType;
  quantity: number; // Cantidad involucrada
  previousStock: number; // Stock antes del movimiento
  newStock: number; // Stock después del movimiento
  reason: string; // Motivo de la entrada o ajuste
  date: string; // Fecha y hora del movimiento
  userId: string; // ID del usuario que realizó el movimiento
  userName: string; // Nombre del usuario
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface SaleItem {
  productId: string;
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stockAvailable: number;
  image: string;
}

export interface Sale {
  id: string; // e.g., VTA-00101
  date: string; // YYYY-MM-DD HH:mm:ss
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number; // Para efectivo
  changeGiven?: number; // Para efectivo
}

export type ClosureStatus = 'coincidencia' | 'faltante' | 'sobrante';

export interface ShiftClosure {
  id: string; // e.g., CJ-20260811-u2
  date: string; // YYYY-MM-DD
  cashierId: string;
  cashierName: string;
  salesCount: number;
  totalSales: number;
  cashTotal: number;
  cardTotal: number;
  transferTotal: number;
  declaredCash: number;
  expectedCash: number;
  difference: number;
  status: ClosureStatus;
  closedAt: string;
}
