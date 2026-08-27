import { Employee, InventoryMovement, Product, Sale, ShiftClosure, Supermarket, User } from '../types';

export const PRODUCT_CATEGORIES = [
  'Abarrotes',
  'Lácteos y Huevos',
  'Panadería y Pastelería',
  'Bebidas y Refrescos',
  'Frutas y Verduras',
  'Carnes y Embutidos',
  'Limpieza del Hogar',
  'Cuidado Personal',
  'Snacks y Golosinas',
  'Congelados',
];

export const SELLING_UNITS = [
  'Unidad',
  'Kilogramo (kg)',
  'Gramo (g)',
  'Litro (L)',
  'Mililitro (ml)',
  'Paquete',
  'Caja',
  'Bolsa',
  'Lata',
  'Botella',
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
];

export const PRODUCT_IMAGE_PRESETS = [
  {
    label: 'Abarrotes / Arroz',
    url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Lácteos / Leche',
    url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Panadería / Pan',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Bebidas / Aceite',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300',
  },
  {
    label: 'Frutas / Manzanas',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=300',
  },
];

export const INITIAL_USERS: (User & { password: string })[] = [
  // Super Admin Credentials
  {
    id: 'u-superadmin',
    username: 'superadmin',
    email: 'thecobra1783@gmail.com',
    password: 'taqcod789456.-.',
    name: 'Emanuel Taquichiri',
    role: 'superadmin',
    documentId: '0000000000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'activo',
    cargo: 'Super Administrador Plataforma',
  },
];

export const INITIAL_SUPERMARKETS: Supermarket[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-superadmin',
    fullName: 'Emanuel Taquichiri',
    documentId: '0000000000',
    phone: '+591 70000000',
    address: 'Oficina Central SaaS',
    email: 'thecobra1783@gmail.com',
    birthDate: '1995-01-01',
    hireDate: '2024-01-01',
    role: 'superadmin',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'activo',
    cargo: 'Super Administrador Plataforma',
    registrationDate: '2024-01-01',
    userId: 'u-superadmin',
  },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_INVENTORY_MOVEMENTS: InventoryMovement[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_SHIFT_CLOSURES: ShiftClosure[] = [];
