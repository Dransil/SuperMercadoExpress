import React, { useState, useMemo } from 'react';
import { Product, ProductStatus, User, UserRole } from '../types';
import { formatBs } from '../utils/formatters';
import {
  PRODUCT_CATEGORIES,
  SELLING_UNITS,
  PRODUCT_IMAGE_PRESETS,
} from '../data/mockData';
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  Tag,
  Barcode,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ShoppingBag,
} from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  currentUser?: User;
  userRole?: UserRole;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  currentUser,
  userRole,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  showToast,
}) => {
  const isCashier = (currentUser?.role === 'cajero') || (userRole === 'cajero');
  // Search state
  const [nameSearch, setNameSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | ProductStatus>('todos');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [brand, setBrand] = useState('');
  const [sellingUnit, setSellingUnit] = useState(SELLING_UNITS[0]);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [status, setStatus] = useState<ProductStatus>('activo');
  const [image, setImage] = useState(PRODUCT_IMAGE_PRESETS[0].url);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Instant filtering by Name, Code, Category, and Status
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchName = prod.name
        .toLowerCase()
        .includes(nameSearch.toLowerCase().trim());
      const matchCode = prod.code
        .toLowerCase()
        .includes(codeSearch.toLowerCase().trim());
      const matchCategory =
        categoryFilter === 'todas' || prod.category === categoryFilter;
      const matchStatus =
        statusFilter === 'todos' || prod.status === statusFilter;

      return matchName && matchCode && matchCategory && matchStatus;
    });
  }, [products, nameSearch, codeSearch, categoryFilter, statusFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setCode('');
    setName('');
    setDescription('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setBrand('');
    setSellingUnit(SELLING_UNITS[0]);
    setPurchasePrice('');
    setSalePrice('');
    setStatus('activo');
    setImage(PRODUCT_IMAGE_PRESETS[0].url);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setBrand(prod.brand);
    setSellingUnit(prod.sellingUnit);
    setPurchasePrice(prod.purchasePrice.toString());
    setSalePrice(prod.salePrice.toString());
    setStatus(prod.status);
    setImage(prod.image);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Validate form before saving
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!code.trim()) {
      errors.code = 'El código del producto es obligatorio.';
    } else {
      const codeExists = products.some(
        (p) =>
          p.code.toLowerCase() === code.trim().toLowerCase() &&
          p.id !== editingProduct?.id
      );
      if (codeExists) {
        errors.code = 'Este código de producto ya se encuentra registrado.';
      }
    }

    if (!name.trim()) {
      errors.name = 'El nombre del producto es obligatorio.';
    }

    if (!description.trim()) {
      errors.description = 'La descripción es obligatoria.';
    }

    if (!brand.trim()) {
      errors.brand = 'La marca del producto es obligatoria.';
    }

    const numPurchase = parseFloat(purchasePrice);
    if (!purchasePrice || isNaN(numPurchase) || numPurchase <= 0) {
      errors.purchasePrice = 'Ingrese un precio de compra válido mayor a 0.';
    }

    const numSale = parseFloat(salePrice);
    if (!salePrice || isNaN(numSale) || numSale <= 0) {
      errors.salePrice = 'Ingrese un precio de venta válido mayor a 0.';
    } else if (numPurchase > 0 && numSale < numPurchase) {
      errors.salePrice =
        'El precio de venta debe ser igual o superior al precio de compra.';
    }

    if (!image.trim()) {
      errors.image = 'La URL o selección de imagen es obligatoria.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const numPurchase = parseFloat(purchasePrice);
    const numSale = parseFloat(salePrice);

    if (editingProduct) {
      // Update existing product
      onUpdateProduct({
        id: editingProduct.id,
        code: code.trim(),
        name: name.trim(),
        description: description.trim(),
        category,
        brand: brand.trim(),
        sellingUnit,
        purchasePrice: numPurchase,
        salePrice: numSale,
        status,
        image: image.trim(),
        stock: editingProduct.stock ?? 0,
      });
      showToast('success', `Producto "${name.trim()}" actualizado correctamente.`);
    } else {
      // Create new product
      onAddProduct({
        code: code.trim(),
        name: name.trim(),
        description: description.trim(),
        category,
        brand: brand.trim(),
        sellingUnit,
        purchasePrice: numPurchase,
        salePrice: numSale,
        status,
        image: image.trim(),
        stock: 0,
      });
      showToast('success', `Producto "${name.trim()}" registrado con éxito (Stock inicial: 0). Use el Módulo de Inventario para ingresar existencias.`);
    }

    setIsFormModalOpen(false);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    onDeleteProduct(deletingProduct.id);
    showToast(
      'info',
      `El producto "${deletingProduct.name}" ha sido eliminado del catálogo.`
    );
    setDeletingProduct(null);
  };

  // Helper currency formatter
  const formatCurrency = (val: number) => {
    return formatBs(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              Gestión de Productos
            </h2>
            <p className="text-xs text-slate-500">
              Catálogo general y consulta de productos del supermercado.
            </p>
          </div>
        </div>

        {!isCashier && (
          <button
            id="btn-nuevo-producto"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        {/* Buscador por Nombre */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="buscar-producto-nombre"
            type="text"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs"
          />
          {nameSearch && (
            <button
              onClick={() => setNameSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buscador por Código */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Barcode className="w-4 h-4" />
          </div>
          <input
            id="buscar-producto-codigo"
            type="text"
            value={codeSearch}
            onChange={(e) => setCodeSearch(e.target.value)}
            placeholder="Buscar por código..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs font-mono"
          />
          {codeSearch && (
            <button
              onClick={() => setCodeSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categoría Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer shadow-xs"
          >
            <option value="todas">Todas las categorías</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Estado Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'todos' | ProductStatus)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer shadow-xs"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Imagen</th>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Nombre / Marca</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio de Venta</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package className="w-9 h-9 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">
                        No se encontraron productos
                      </p>
                      <p className="text-xs text-slate-400">
                        Intente ajustar los criterios de búsqueda por código o nombre, o registre un nuevo producto.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Image */}
                    <td className="py-3 px-4 text-center">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs mx-auto group-hover:scale-105 transition-transform"
                      />
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                        {prod.code}
                      </span>
                    </td>

                    {/* Name & Brand */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm">{prod.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        Marca: <span className="font-medium text-slate-700">{prod.brand}</span>
                        <span className="text-slate-300 mx-1">•</span>
                        <span>{prod.sellingUnit}</span>
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/80">
                        {prod.category}
                      </span>
                    </td>

                    {/* Sale Price */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(prod.salePrice)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Compra: {formatCurrency(prod.purchasePrice)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          prod.status === 'activo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prod.status === 'activo' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {prod.status === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ver Detalle */}
                        <button
                          onClick={() => setViewingProduct(prod)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalle del producto"
                          aria-label="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Editar - Solo Administrador */}
                        {!isCashier && (
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Editar producto"
                            aria-label="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Eliminar - Solo Administrador */}
                        {!isCashier && (
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar producto"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Mostrando {filteredProducts.length} de {products.length} productos registrados
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Catálogo de Productos Activo
          </span>
        </div>
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ingrese la información completa del catálogo de producto.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Código del Producto */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código de Producto *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ej: 770123456010"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-mono ${
                        formErrors.code
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.code && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>

                {/* Nombre del Producto */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Producto *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Leche Deslactosada 1L"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.name
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoría *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marca *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ej: Alpina, Nestlé, Bimbo"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.brand
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.brand && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.brand}
                    </p>
                  )}
                </div>

                {/* Unidad de Venta */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unidad de Venta *
                  </label>
                  <select
                    value={sellingUnit}
                    onChange={(e) => setSellingUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {SELLING_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estado *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                {/* Precio de Compra */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Precio de Compra (Bs) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="Ej: 28.50"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-semibold ${
                        formErrors.purchasePrice
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.purchasePrice && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.purchasePrice}
                    </p>
                  )}
                </div>

                {/* Precio de Venta */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Precio de Venta (Bs) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="Ej: 3800"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-bold text-emerald-700 ${
                        formErrors.salePrice
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.salePrice && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.salePrice}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Descripción del Producto *
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre contenido, envase, especificaciones técnicas o características generales..."
                    className={`w-full p-3 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                      formErrors.description
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Imagen del Producto */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Imagen del Producto *
                  </label>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <img
                      src={image || PRODUCT_IMAGE_PRESETS[0].url}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-200 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-semibold mb-1">
                        URL de la imagen o Seleccionar de Presets
                      </p>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Preset Images Gallery */}
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      Imágenes predefinidas sugeridas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            image === preset.url
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {formErrors.image && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {formErrors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-guardar-producto"
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT DETAIL MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header / Banner */}
            <div className="relative bg-slate-50 p-6 border-b border-slate-200">
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
                />
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mb-1.5 border ${
                      viewingProduct.status === 'activo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {viewingProduct.status === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 leading-snug">
                    {viewingProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Código: <span className="font-bold text-slate-700">{viewingProduct.code}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details List */}
            <div className="p-6 space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-700 mb-0.5">Descripción:</p>
                {viewingProduct.description}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium">Categoría</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{viewingProduct.category}</p>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium">Marca</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{viewingProduct.brand}</p>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium">Unidad de Venta</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{viewingProduct.sellingUnit}</p>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Precio de Venta</p>
                  <p className="font-extrabold text-emerald-700 text-base mt-0.5">
                    {formatCurrency(viewingProduct.salePrice)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Precio de Compra:</span>
                <span className="font-bold text-slate-700">{formatCurrency(viewingProduct.purchasePrice)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Margen de Ganancia Estimado:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(viewingProduct.salePrice - viewingProduct.purchasePrice)}{' '}
                  <span className="text-[11px] font-normal text-slate-400">
                    ({Math.round(((viewingProduct.salePrice - viewingProduct.purchasePrice) / viewingProduct.purchasePrice) * 100)}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">¿Eliminar Producto?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Esta acción eliminará permanentemente a{' '}
                  <strong className="text-slate-800">{deletingProduct.name}</strong> del catálogo de productos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <img
                src={deletingProduct.image}
                alt={deletingProduct.name}
                className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div>
                <p className="font-bold text-slate-800">{deletingProduct.name}</p>
                <p className="font-mono text-slate-500 text-[11px]">Código: {deletingProduct.code}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-eliminar-producto"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
