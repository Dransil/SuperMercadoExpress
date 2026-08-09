import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Sale, SaleItem, PaymentMethod, User } from '../types';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  Printer,
  Barcode,
  Package,
  Sparkles,
  AlertCircle,
  Clock,
  RotateCcw,
  Receipt,
  Tag,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface SalesModuleProps {
  products: Product[];
  currentUser: User;
  onCompleteSale: (sale: Sale) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  recentSales?: Sale[];
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  products,
  currentUser,
  onCompleteSale,
  showToast,
  recentSales = [],
}) => {
  // Cart State
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  
  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Payment State
  const [manualDiscount, setManualDiscount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('efectivo');
  const [amountTendered, setAmountTendered] = useState<string>('');

  // Receipt & History State
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter available active products
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'activo');
  }, [products]);

  // Categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(activeProducts.map((p) => p.category)));
    return ['todos', ...cats];
  }, [activeProducts]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return activeProducts.filter(
      (p) =>
        p.code.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
    );
  }, [activeProducts, searchTerm]);

  // Quick Catalog Grid items (when search is empty or filtered by category)
  const catalogProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchesCategory =
        selectedCategory === 'todos' || p.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, selectedCategory, searchTerm]);

  // Cart Calculations
  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    const discNum = parseFloat(manualDiscount) || 0;
    const discount = Math.min(Math.max(0, discNum), subtotal); // Don't exceed subtotal
    const total = Math.max(0, subtotal - discount);
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const tenderedNum = parseFloat(amountTendered) || 0;
    const changeGiven = paymentMethod === 'efectivo' ? Math.max(0, tenderedNum - total) : 0;

    return {
      subtotal,
      discount,
      total,
      totalItemsCount,
      tenderedNum,
      changeGiven,
      isTenderedSufficient: paymentMethod === 'efectivo' ? tenderedNum >= total : true,
    };
  }, [cartItems, manualDiscount, amountTendered, paymentMethod]);

  // Format COP Currency
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    // Check stock
    if (product.stock <= 0) {
      showToast(`El producto "${product.name}" no tiene stock disponible.`, 'error');
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const existingItem = cartItems[existingIndex];
      const newQty = existingItem.quantity + 1;

      if (newQty > product.stock) {
        showToast(
          `No se pueden agregar más unidades de "${product.name}". Stock máximo: ${product.stock}`,
          'error'
        );
        return;
      }

      const updated = [...cartItems];
      updated[existingIndex] = {
        ...existingItem,
        quantity: newQty,
        subtotal: newQty * existingItem.unitPrice,
        stockAvailable: product.stock,
      };
      setCartItems(updated);
      showToast(`Agregado +1 "${product.name}" al carrito.`, 'info');
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        code: product.code,
        name: product.name,
        unitPrice: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
        stockAvailable: product.stock,
        image: product.image,
      };
      setCartItems((prev) => [...prev, newItem]);
      showToast(`"${product.name}" agregado a la venta.`, 'success');
    }

    // Clear search term after selection
    setSearchTerm('');
  };

  // Handle barcode or exact code enter
  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      // Try exact code match first
      const exactCodeMatch = activeProducts.find(
        (p) => p.code.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (exactCodeMatch) {
        handleAddToCart(exactCodeMatch);
      } else if (searchResults.length > 0) {
        // Add first matching search result
        handleAddToCart(searchResults[0]);
      } else {
        showToast('Producto no encontrado con el código o nombre ingresado.', 'error');
      }
    }
  };

  // Update Item Quantity in Cart
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const targetItem = cartItems.find((item) => item.productId === productId);
    if (!targetItem) return;

    if (newQty > targetItem.stockAvailable) {
      showToast(
        `Cantidad solicitada (${newQty}) supera el stock disponible (${targetItem.stockAvailable}).`,
        'error'
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            }
          : item
      )
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (productId: string) => {
    const itemToRemove = cartItems.find((i) => i.productId === productId);
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    if (itemToRemove) {
      showToast(`Producto "${itemToRemove.name}" eliminado de la venta.`, 'info');
    }
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    setManualDiscount('0');
    setAmountTendered('');
    showToast('Venta cancelada / carrito limpiado.', 'info');
  };

  // Quick tender amount preset buttons
  const handlePresetTendered = (amount: number) => {
    setAmountTendered(amount.toString());
  };

  // Complete Sale
  const handleFinalizeSale = () => {
    // Validations
    if (cartItems.length === 0) {
      showToast('No hay productos en la venta.', 'error');
      return;
    }

    if (!paymentMethod) {
      showToast('Seleccione un método de pago (Efectivo, Tarjeta o Transferencia).', 'error');
      return;
    }

    if (paymentMethod === 'efectivo') {
      if (!amountTendered || cartSummary.tenderedNum < cartSummary.total) {
        showToast(
          `Monto recibido insuficiente. Se requiere mínimo ${formatCOP(cartSummary.total)}`,
          'error'
        );
        return;
      }
    }

    // Verify all cart items stock again
    for (const item of cartItems) {
      const currentProduct = products.find((p) => p.id === item.productId);
      if (!currentProduct || currentProduct.stock < item.quantity) {
        showToast(
          `Error de stock: "${item.name}" solo tiene ${
            currentProduct ? currentProduct.stock : 0
          } unidades disponibles.`,
          'error'
        );
        return;
      }
    }

    // Construct Sale record
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(
      2,
      '0'
    )}`;

    const newSale: Sale = {
      id: `VTA-${Math.floor(10000 + Math.random() * 90000)}`,
      date: formattedDate,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: [...cartItems],
      subtotal: cartSummary.subtotal,
      discount: cartSummary.discount,
      total: cartSummary.total,
      paymentMethod,
      amountTendered: paymentMethod === 'efectivo' ? cartSummary.tenderedNum : cartSummary.total,
      changeGiven: paymentMethod === 'efectivo' ? cartSummary.changeGiven : 0,
    };

    // Callback to parent App (deducts stock, adds inventory movement, stores sale)
    onCompleteSale(newSale);

    // Show Receipt Modal
    setCompletedSale(newSale);
    setIsReceiptModalOpen(true);

    // Reset Cart
    setCartItems([]);
    setManualDiscount('0');
    setAmountTendered('');
    setSearchTerm('');

    showToast(`Venta #${newSale.id} registrada con éxito.`, 'success');
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Punto de Venta (POS)
            </h2>
            <p className="text-xs text-slate-500">
              Cajero activo:{' '}
              <span className="font-semibold text-slate-700">{currentUser.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {recentSales.length > 0 && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Ventas Recientes ({recentSales.length})</span>
            </button>
          )}

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Venta</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT & CENTER COLUMN (8 cols): Product Search & Cart Detail */}
        <div className="lg:col-span-7 space-y-6">
          {/* AREA 1: BÚSQUEDA DE PRODUCTOS Y SELECCIÓN RÁPIDA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-600" />
                <span>1. Búsqueda y Selección de Productos</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Presione <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> para agregar por código
              </span>
            </div>

            {/* Search Bar Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDownSearch}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Escriba código de barras o nombre del producto..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Live Dropdown Overlay if searching */}
            {searchTerm.trim() !== '' && (
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No se encontraron productos con &ldquo;{searchTerm}&rdquo;
                  </div>
                ) : (
                  searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleAddToCart(prod)}
                      className="p-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700">
                            {prod.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {prod.code} • {prod.brand}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs text-slate-900">
                          {formatCOP(prod.salePrice)}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            prod.stock > 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : prod.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quick Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
              <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">
                Categoría:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'todos' ? 'Todas' : cat}
                </button>
              ))}
            </div>

            {/* Quick Catalog Grid for direct tap */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {catalogProducts.slice(0, 9).map((product) => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                        {product.name}
                      </p>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : product.stock <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {product.stock} ud
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {formatCOP(product.salePrice)}
                      </span>
                      <div className="p-1 rounded-md bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AREA 2: DETALLE DE LA VENTA (CARRO / TABLA) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>2. Detalle de la Venta ({cartSummary.totalItemsCount} ítems)</span>
              </label>

              {cartItems.length > 0 && (
                <span className="text-xs font-semibold text-slate-600">
                  Subtotal: <strong className="text-slate-900 font-bold">{formatCOP(cartSummary.subtotal)}</strong>
                </span>
              )}
            </div>

            {/* Cart Table */}
            <div className="overflow-x-auto min-h-[280px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-right">P. Unitario</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                          <p className="font-semibold text-slate-600 text-sm">
                            La venta está vacía
                          </p>
                          <p className="text-xs text-slate-400">
                            Busque o seleccione productos en el panel superior para agregarlos al detalle.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Code */}
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                          {item.code}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-semibold text-slate-800 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Max stock: {item.stockAvailable}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                          {formatCOP(item.unitPrice)}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={item.stockAvailable}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateQuantity(item.productId, val);
                              }}
                              className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />

                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.stockAvailable}
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold transition-colors cursor-pointer ${
                                item.quantity >= item.stockAvailable
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCOP(item.subtotal)}
                        </td>

                        {/* Delete button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar de la venta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): AREA 3: RESUMEN Y PAGO */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md space-y-5 sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>3. Resumen y Cobro</span>
            </label>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              {cartSummary.totalItemsCount} prod.
            </span>
          </div>

          {/* Real-Time Price Totals */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCOP(cartSummary.subtotal)}</span>
            </div>

            {/* Manual Discount Input */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Descuento ($):
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={manualDiscount}
                onChange={(e) => setManualDiscount(e.target.value)}
                placeholder="0"
                className="w-24 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="border-t border-slate-200 pt-2.5 mt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">TOTAL A PAGAR:</span>
              <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                {formatCOP(cartSummary.total)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Método de Pago <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'efectivo'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'transferencia'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer.</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Tendered Details */}
          {paymentMethod === 'efectivo' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Monto Recibido del Cliente
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder="Ejemplo: 20000"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-emerald-800 font-medium">Billetes:</span>
                {[10000, 20000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetTendered(preset)}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-mono font-bold text-emerald-900 cursor-pointer"
                  >
                    ${preset / 1000}k
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePresetTendered(cartSummary.total)}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  Exacto
                </button>
              </div>

              {/* Change Calculation */}
              <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-900">CAMBIO A ENTREGAR:</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    cartSummary.isTenderedSufficient ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatCOP(cartSummary.changeGiven)}
                </span>
              </div>
            </div>
          )}

          {/* Big Action Button: Finalizar Venta */}
          <button
            id="btn-finalizar-venta"
            onClick={handleFinalizeSale}
            disabled={cartItems.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
              cartItems.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 active:scale-[0.99]'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>COBRAR Y FINALIZAR VENTA</span>
          </button>
        </div>
      </div>

      {/* COMPROBANTE DE VENTA / RECEIPT MODAL */}
      {isReceiptModalOpen && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Printable Receipt Content */}
            <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 text-slate-800">
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
                <div className="inline-flex p-2 bg-emerald-600 text-white rounded-xl mb-1">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  SuperMercado Express
                </h2>
                <p className="text-xs text-slate-500">NIT: 900.123.456-7</p>
                <p className="text-xs text-slate-500">Calle Principal #12-34 • Tel: (601) 555-0199</p>
              </div>

              {/* Sale Metadata */}
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Comprobante N°:</span>
                  <strong className="text-slate-900">{completedSale.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <span>{completedSale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cajero:</span>
                  <span>{completedSale.cashierName}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 font-semibold text-slate-500">
                      <th className="py-2">Cant x Producto</th>
                      <th className="py-2 text-right">P.Unit</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedSale.items.map((it) => (
                      <tr key={it.productId}>
                        <td className="py-2 pr-2">
                          <p className="font-semibold text-slate-800 line-clamp-1">{it.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{it.quantity} ud x {formatCOP(it.unitPrice)}</span>
                        </td>
                        <td className="py-2 text-right font-mono text-slate-600">{formatCOP(it.unitPrice)}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">{formatCOP(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCOP(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento aplicado:</span>
                    <span className="font-mono">-{formatCOP(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL PAGADO:</span>
                  <span className="font-mono text-base text-emerald-700">{formatCOP(completedSale.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 pt-1">
                  <span>Método de pago:</span>
                  <span className="font-bold uppercase">{completedSale.paymentMethod}</span>
                </div>
                {completedSale.paymentMethod === 'efectivo' && (
                  <>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Monto recibido:</span>
                      <span className="font-mono">{formatCOP(completedSale.amountTendered || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-800 font-bold">
                      <span>Cambio entregado:</span>
                      <span className="font-mono text-emerald-700">{formatCOP(completedSale.changeGiven || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer text */}
              <div className="text-center pt-2 text-[11px] text-slate-400 italic border-t border-slate-100">
                ¡Gracias por su compra en SuperMercado Express!
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <span>Nueva Venta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT SALES HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Historial de Ventas Recientes</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {recentSales.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">
                  No hay ventas registradas en la sesión actual.
                </p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{sale.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sale.date} • Cajero: {sale.cashierName} ({sale.items.length} productos)
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {formatCOP(sale.total)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCompletedSale(sale);
                          setIsReceiptModalOpen(true);
                          setShowHistoryModal(false);
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-700 hover:border-emerald-500 transition-colors cursor-pointer"
                        title="Ver Comprobante"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
