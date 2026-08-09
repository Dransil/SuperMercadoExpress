import React, { useState, useMemo } from 'react';
import { Product, InventoryMovement, MovementType, User } from '../types';
import {
  Boxes,
  ArrowUpRight,
  SlidersHorizontal,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  Calendar,
  User as UserIcon,
  Package,
  Layers,
  ArrowRightLeft,
  X,
  FileText,
  Info,
} from 'lucide-react';

interface InventoryManagementProps {
  products: Product[];
  movements: InventoryMovement[];
  currentUser: User;
  onAddMovement: (
    productId: string,
    movementType: MovementType,
    quantity: number,
    newStock: number,
    reason: string,
    customDate?: string
  ) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  movements,
  currentUser,
  onAddMovement,
  showToast,
}) => {
  // Navigation tabs within Inventory module: 'stock' (Table) vs 'history' (Movement History)
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

  // Filters for Stock view
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Filters for History view
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyProductFilter, setHistoryProductFilter] = useState('todos');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('todos');
  const [historyDateFilter, setHistoryDateFilter] = useState('');

  // Movement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [movementType, setMovementType] = useState<MovementType>('entrada');
  const [adjustmentMode, setAdjustmentMode] = useState<'final_stock' | 'delta'>('final_stock');
  const [inputQuantity, setInputQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format for datetime-local
  );
  const [presetReason, setPresetReason] = useState<string>('');

  // Extract unique categories for stock filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['todos', ...cats];
  }, [products]);

  // Inventory Status Helper
  const getInventoryStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        type: 'sin_stock',
        label: 'Sin Stock',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
        dotColor: 'bg-rose-500',
      };
    }
    if (stock <= 10) {
      return {
        type: 'stock_bajo',
        label: 'Stock Bajo',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
        dotColor: 'bg-amber-500',
      };
    }
    return {
      type: 'disponible',
      label: 'Disponible',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
    };
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const available = products.filter((p) => p.stock > 10).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    return { totalProducts, available, lowStock, outOfStock };
  }, [products]);

  // Filtered products for stock view
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'todos' || p.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'disponible') matchesStatus = p.stock > 10;
      if (statusFilter === 'stock_bajo') matchesStatus = p.stock > 0 && p.stock <= 10;
      if (statusFilter === 'sin_stock') matchesStatus = p.stock <= 0;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Filtered movements for history view
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.productName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        m.productCode.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        m.userName.toLowerCase().includes(historySearchTerm.toLowerCase());

      const matchesProduct =
        historyProductFilter === 'todos' || m.productId === historyProductFilter;

      const matchesType =
        historyTypeFilter === 'todos' || m.movementType === historyTypeFilter;

      const matchesDate =
        !historyDateFilter || m.date.startsWith(historyDateFilter);

      return matchesSearch && matchesProduct && matchesType && matchesDate;
    });
  }, [movements, historySearchTerm, historyProductFilter, historyTypeFilter, historyDateFilter]);

  // Handle open modal pre-selecting a product
  const handleOpenModal = (productId?: string) => {
    setSelectedProductId(productId || (products.length > 0 ? products[0].id : ''));
    setMovementType('entrada');
    setAdjustmentMode('final_stock');
    setInputQuantity('');
    setReason('');
    setPresetReason('');
    setCustomDate(new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  // Selected product object for modal calculations
  const currentSelectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Calculate projected stock based on modal input
  const stockCalculation = useMemo(() => {
    if (!currentSelectedProduct) return { newStock: 0, delta: 0, isValid: false, error: 'Seleccione un producto' };

    const current = currentSelectedProduct.stock;
    const qty = parseFloat(inputQuantity);

    if (isNaN(qty)) {
      return { newStock: current, delta: 0, isValid: false, error: 'Ingrese una cantidad válida' };
    }

    if (movementType === 'entrada') {
      if (qty <= 0) {
        return { newStock: current, delta: 0, isValid: false, error: 'La cantidad de entrada debe ser mayor a 0' };
      }
      const newStock = current + qty;
      return { newStock, delta: qty, isValid: true, error: null };
    } else {
      // Ajuste
      if (adjustmentMode === 'final_stock') {
        if (qty < 0) {
          return { newStock: current, delta: 0, isValid: false, error: 'La existencia final no puede ser negativa' };
        }
        const delta = qty - current;
        return { newStock: qty, delta, isValid: true, error: null };
      } else {
        // Delta mode (+ / -)
        const newStock = current + qty;
        if (newStock < 0) {
          return {
            newStock,
            delta: qty,
            isValid: false,
            error: `Ajuste no válido: la existencia resultante (${newStock}) sería negativa`,
          };
        }
        return { newStock, delta: qty, isValid: true, error: null };
      }
    }
  }, [currentSelectedProduct, movementType, adjustmentMode, inputQuantity]);

  // Handle Submit Movement
  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSelectedProduct) {
      showToast('Debe seleccionar un producto válido.', 'error');
      return;
    }

    if (!stockCalculation.isValid) {
      showToast(stockCalculation.error || 'Revise los campos e intente de nuevo.', 'error');
      return;
    }

    const finalReason = reason.trim() || presetReason || (movementType === 'entrada' ? 'Entrada de mercancía' : 'Ajuste de inventario');

    if (!finalReason) {
      showToast('Por favor ingrese el motivo del movimiento.', 'error');
      return;
    }

    // Call handler
    onAddMovement(
      currentSelectedProduct.id,
      movementType,
      stockCalculation.delta,
      stockCalculation.newStock,
      finalReason,
      customDate ? customDate.replace('T', ' ') : undefined
    );

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Upper Module Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Control de Stock</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'stock'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Movimientos</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {movements.length}
            </span>
          </button>
        </div>

        <button
          id="btn-nuevo-movimiento"
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Productos</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.totalProducts}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Stock Disponible</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{metrics.available}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Stock Bajo (&le;10)</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{metrics.lowStock}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Sin Stock (Agotados)</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{metrics.outOfStock}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: CONTROL DE STOCK / TABLA PRINCIPAL DE INVENTARIO */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Table Filters Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre o marca..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="todos">Todas las categorías</option>
                  {categories
                    .filter((c) => c !== 'todos')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponible (&gt;10)</option>
                  <option value="stock_bajo">Stock Bajo (1-10)</option>
                  <option value="sin_stock">Sin Stock (0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Main Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4 text-center">Existencia Actual</th>
                  <th className="py-3.5 px-4">Estado Inventario</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Boxes className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                        <p className="font-medium text-slate-600">No se encontraron productos</p>
                        <p className="text-xs text-slate-400">
                          Intente ajustar los filtros de búsqueda para visualizar las existencias.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const statusInfo = getInventoryStatus(product.stock);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Code */}
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {product.code}
                        </td>

                        {/* Product info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-semibold text-slate-800 line-clamp-1">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span>{product.sellingUnit}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            {product.category}
                          </span>
                        </td>

                        {/* Stock Number */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold ${
                              product.stock <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : product.stock <= 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <span>{product.stock}</span>
                            <span className="text-[11px] font-normal text-slate-500">
                              {product.sellingUnit === 'Unidad' ? 'ud' : product.sellingUnit}
                            </span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(product.id)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Registrar entrada o ajuste de stock para este producto"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>Movimiento</span>
                            </button>
                            <button
                              onClick={() => {
                                setHistoryProductFilter(product.id);
                                setActiveTab('history');
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Ver historial de este producto"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Historial</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE MOVIMIENTOS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
          {/* History Header & Filters */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Historial de Movimientos de Inventario
                </h3>
                <p className="text-xs text-slate-500">
                  Registro auditor de todas las entradas y ajustes realizados.
                </p>
              </div>

              {(historySearchTerm ||
                historyProductFilter !== 'todos' ||
                historyTypeFilter !== 'todos' ||
                historyDateFilter) && (
                <button
                  onClick={() => {
                    setHistorySearchTerm('');
                    setHistoryProductFilter('todos');
                    setHistoryTypeFilter('todos');
                    setHistoryDateFilter('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar Filtros</span>
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Text Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  placeholder="Buscar motivo, código, usuario..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Product Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={historyProductFilter}
                  onChange={(e) => setHistoryProductFilter(e.target.value)}
                  className="w-full bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="todos">Todos los productos</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="w-full bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="entrada">Entrada (+)</option>
                  <option value="ajuste">Ajuste (&plusmn;)</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className="w-full bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4 text-center">Tipo</th>
                  <th className="py-3.5 px-4 text-center">Variación</th>
                  <th className="py-3.5 px-4 text-center">Stock Resultante</th>
                  <th className="py-3.5 px-4">Motivo / Observación</th>
                  <th className="py-3.5 px-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <History className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                        <p className="font-medium text-slate-600">No se registraron movimientos</p>
                        <p className="text-xs text-slate-400">
                          No existen registros que coincidan con los criterios de filtro seleccionados.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{mov.date}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {mov.productImage && (
                            <img
                              src={mov.productImage}
                              alt={mov.productName}
                              className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 text-xs line-clamp-1">
                              {mov.productName}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {mov.productCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Movement Type Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            mov.movementType === 'entrada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {mov.movementType === 'entrada' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Entrada</span>
                            </>
                          ) : (
                            <>
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Ajuste</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Quantity Delta */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            mov.quantity > 0
                              ? 'text-emerald-600'
                              : mov.quantity < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }
                        >
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>

                      {/* Stock Change (Prev -> New) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-xs text-slate-500 font-mono">
                          {mov.previousStock} &rarr;{' '}
                          <strong className="text-slate-900 font-bold">{mov.newStock}</strong>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">
                        <p className="line-clamp-2 italic text-slate-600">&ldquo;{mov.reason}&rdquo;</p>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{mov.userName}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTRAR MOVIMIENTO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Registrar Movimiento de Inventario</h3>
                  <p className="text-xs text-slate-300">
                    Entrada de productos o ajuste de existencias
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitMovement} className="p-6 overflow-y-auto space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Producto <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setInputQuantity('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="" disabled>
                    Seleccione un producto...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Banner */}
              {currentSelectedProduct && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentSelectedProduct.image}
                      alt={currentSelectedProduct.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {currentSelectedProduct.name}
                      </p>
                      <p className="text-slate-500">
                        Categoría: {currentSelectedProduct.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">Existencia Actual</p>
                    <p className="text-sm font-bold text-slate-900">
                      {currentSelectedProduct.stock} {currentSelectedProduct.sellingUnit}
                    </p>
                  </div>
                </div>
              )}

              {/* Movement Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de Movimiento <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('entrada');
                      setInputQuantity('');
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      movementType === 'entrada'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>Entrada de Productos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('ajuste');
                      setInputQuantity('');
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      movementType === 'ajuste'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                    <span>Ajuste de Inventario</span>
                  </button>
                </div>
              </div>

              {/* If Movement Type is Ajuste: Sub-mode choice */}
              {movementType === 'ajuste' && (
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-blue-900">Modo de Ajuste:</p>
                  <div className="flex items-center gap-4 text-slate-700 font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="adjustmentMode"
                        checked={adjustmentMode === 'final_stock'}
                        onChange={() => setAdjustmentMode('final_stock')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Establecer Nueva Existencia Final</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="adjustmentMode"
                        checked={adjustmentMode === 'delta'}
                        onChange={() => setAdjustmentMode('delta')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Ingresar Diferencia (+ / -)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {movementType === 'entrada'
                    ? 'Cantidad a Ingresar'
                    : adjustmentMode === 'final_stock'
                    ? 'Nueva Existencia Total del Producto'
                    : 'Diferencia a Sumar/Restar (ej. +5 o -3)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value)}
                  placeholder={
                    movementType === 'entrada'
                      ? 'Ejemplo: 25'
                      : adjustmentMode === 'final_stock'
                      ? 'Ejemplo: 12'
                      : 'Ejemplo: -2 o 5'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Projected Calculation Preview */}
              {currentSelectedProduct && inputQuantity !== '' && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    stockCalculation.isValid
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span>
                      Existencia actual:{' '}
                      <strong className="underline">{currentSelectedProduct.stock}</strong>
                    </span>
                    <span>
                      {movementType === 'entrada'
                        ? `+ ${inputQuantity}`
                        : stockCalculation.delta >= 0
                        ? `+ ${stockCalculation.delta}`
                        : `${stockCalculation.delta}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                    <span className="font-semibold text-slate-300">NUEVA EXISTENCIA RESULTANTE:</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        stockCalculation.isValid ? 'text-emerald-400' : 'text-rose-600'
                      }`}
                    >
                      {stockCalculation.newStock} {currentSelectedProduct.sellingUnit}
                    </span>
                  </div>

                  {!stockCalculation.isValid && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{stockCalculation.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Preset Reason Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Motivo del Movimiento <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={presetReason}
                    onChange={(e) => {
                      setPresetReason(e.target.value);
                      if (e.target.value !== 'otro') {
                        setReason(e.target.value);
                      } else {
                        setReason('');
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">Seleccione motivo predefinido o escriba uno personalizado...</option>
                    {movementType === 'entrada' ? (
                      <>
                        <option value="Compra e ingreso de mercancía de proveedor">
                          Compra e ingreso de mercancía de proveedor
                        </option>
                        <option value="Devolución de cliente en buen estado">
                          Devolución de cliente en buen estado
                        </option>
                        <option value="Ingreso de inventario inicial">
                          Ingreso de inventario inicial
                        </option>
                        <option value="Transferencia de almacén / sucursal">
                          Transferencia de almacén / sucursal
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="Ajuste por conteo físico de inventario">
                          Ajuste por conteo físico de inventario
                        </option>
                        <option value="Baja por mercancía dañada o rota">
                          Baja por mercancía dañada o rota
                        </option>
                        <option value="Baja por vencimiento / caducidad">
                          Baja por vencimiento / caducidad
                        </option>
                        <option value="Corrección de error de digitación previo">
                          Corrección de error de digitación previo
                        </option>
                        <option value="Pérdida o faltante de mercadería">
                          Pérdida o faltante de mercadería
                        </option>
                      </>
                    )}
                    <option value="otro">Otro motivo personalizado...</option>
                  </select>

                  {(presetReason === 'otro' || !presetReason) && (
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describa el motivo detallado del movimiento..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  )}
                </div>
              </div>

              {/* Date & User Info */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usuario Responsable
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5 truncate">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{currentUser.name}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!stockCalculation.isValid}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    stockCalculation.isValid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Movimiento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
