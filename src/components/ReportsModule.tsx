import React, { useState, useMemo } from 'react';
import { Sale, PaymentMethod, User } from '../types';
import {
  FileText,
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  ChevronDown,
  Receipt,
  User as UserIcon,
  CreditCard,
  DollarSign,
  Building2,
  Eye,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  Hash,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface ReportsModuleProps {
  sales: Sale[];
  currentUser: User;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type PeriodPreset = 'diario' | 'semanal' | 'mensual' | 'personalizado';
type SortField = 'date' | 'id' | 'total' | 'cashierName' | 'itemsCount';
type SortOrder = 'asc' | 'desc';

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  sales,
  currentUser,
  showToast,
}) => {
  // Filter States
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('diario');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCashier, setSelectedCashier] = useState<string>('todos');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('todos');

  // Search & Table States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal State
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Unique list of Cashiers derived from sales
  const cashierList = useMemo(() => {
    const cashiersMap = new Map<string, string>();
    sales.forEach((s) => {
      if (s.cashierName) {
        cashiersMap.set(s.cashierId || s.cashierName, s.cashierName);
      }
    });
    return Array.from(cashiersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [sales]);

  // Format COP Currency
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to parse sale date YYYY-MM-DD HH:mm:ss
  const parseSaleDate = (dateStr: string): Date => {
    const cleanStr = dateStr.replace(' ', 'T');
    return new Date(cleanStr);
  };

  // Filter Sales Logic
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    return sales.filter((sale) => {
      const saleDateObj = parseSaleDate(sale.date);
      const saleDateDayStr = `${saleDateObj.getFullYear()}-${String(
        saleDateObj.getMonth() + 1
      ).padStart(2, '0')}-${String(saleDateObj.getDate()).padStart(2, '0')}`;

      // 1. Time Period Preset Filter
      if (periodPreset === 'diario') {
        if (saleDateDayStr !== todayStr) return false;
      } else if (periodPreset === 'semanal') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        if (saleDateObj < sevenDaysAgo) return false;
      } else if (periodPreset === 'mensual') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (saleDateObj < firstDayOfMonth) return false;
      } else if (periodPreset === 'personalizado') {
        if (startDate) {
          const startObj = new Date(`${startDate}T00:00:00`);
          if (saleDateObj < startObj) return false;
        }
        if (endDate) {
          const endObj = new Date(`${endDate}T23:59:59`);
          if (saleDateObj > endObj) return false;
        }
      }

      // 2. Cashier Filter
      if (selectedCashier !== 'todos') {
        if (
          sale.cashierId !== selectedCashier &&
          sale.cashierName !== selectedCashier
        ) {
          return false;
        }
      }

      // 3. Payment Method Filter
      if (selectedPaymentMethod !== 'todos') {
        if (sale.paymentMethod !== selectedPaymentMethod) {
          return false;
        }
      }

      // 4. Search Term Filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const matchesId = sale.id.toLowerCase().includes(term);
        const matchesCashier = sale.cashierName.toLowerCase().includes(term);
        const matchesPayment = sale.paymentMethod.toLowerCase().includes(term);
        const matchesProduct = sale.items.some(
          (it) =>
            it.name.toLowerCase().includes(term) || it.code.toLowerCase().includes(term)
        );

        if (!matchesId && !matchesCashier && !matchesPayment && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [
    sales,
    periodPreset,
    startDate,
    endDate,
    selectedCashier,
    selectedPaymentMethod,
    searchTerm,
  ]);

  // Sorting Logic
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let valA: any = a[sortField as keyof Sale];
      let valB: any = b[sortField as keyof Sale];

      if (sortField === 'date') {
        valA = parseSaleDate(a.date).getTime();
        valB = parseSaleDate(b.date).getTime();
      } else if (sortField === 'itemsCount') {
        valA = a.items.reduce((acc, it) => acc + it.quantity, 0);
        valB = b.items.reduce((acc, it) => acc + it.quantity, 0);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSales, sortField, sortOrder]);

  // Pagination Logic
  const totalRecords = sortedSales.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalRecords / pageSize);
  const paginatedSales = useMemo(() => {
    if (pageSize === 0) return sortedSales;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedSales.slice(startIndex, startIndex + pageSize);
  }, [sortedSales, currentPage, pageSize]);

  // Top Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCount = filteredSales.length;
    const totalBilled = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const averageTicket = totalCount > 0 ? totalBilled / totalCount : 0;

    return {
      totalCount,
      totalBilled,
      averageTicket,
    };
  }, [filteredSales]);

  // Toggle Sorting column
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setPeriodPreset('diario');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setSelectedCashier('todos');
    setSelectedPaymentMethod('todos');
    setSearchTerm('');
    setCurrentPage(1);
    showToast('Filtros de búsqueda restablecidos.', 'info');
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Reportes de Ventas
            </h2>
            <p className="text-xs text-slate-500">
              Consulte e inspeccione el historial de transacciones realizadas en el punto de venta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* RESUMEN SUPERIOR (TOP INDICATORS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Indicator 1: Total Ventas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Número Total de Ventas
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {summaryMetrics.totalCount}{' '}
              <span className="text-xs font-normal text-slate-400">transacciones</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Hash className="w-6 h-6" />
          </div>
        </div>

        {/* Indicator 2: Total Facturado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Facturado
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {formatCOP(summaryMetrics.totalBilled)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Indicator 3: Ticket Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ticket Promedio
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatCOP(summaryMetrics.averageTicket)}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filtros de Búsqueda
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Preset Period Buttons */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600">
              Período de Tiempo
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setPeriodPreset('diario');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === 'diario'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => {
                  setPeriodPreset('semanal');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === 'semanal'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => {
                  setPeriodPreset('mensual');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === 'mensual'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => {
                  setPeriodPreset('personalizado');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === 'personalizado'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {/* Cashier Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Cajero
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCashier}
                onChange={(e) => {
                  setSelectedCashier(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos los Cajeros</option>
                {cashierList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Método de Pago
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos los Métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Custom Date Range Pickers (if periodPreset === 'personalizado') */}
        {periodPreset === 'personalizado' && (
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE RESULTADOS (TABLA DE VENTAS) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por N° venta, cajero o producto..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Registros por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={0}>Todos</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>N° Venta</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Fecha y Hora</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cashierName')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Cajero</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Método Pago</th>
                <th
                  onClick={() => handleSort('itemsCount')}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Cant. Productos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                      <p className="font-semibold text-slate-600 text-sm">
                        No hay ventas registradas
                      </p>
                      <p className="text-xs text-slate-400">
                        Ajuste los filtros o realice nuevas operaciones en el Punto de Venta.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const itemsCount = sale.items.reduce((acc, it) => acc + it.quantity, 0);
                  const dateParts = sale.date.split(' ');
                  const dateOnly = dateParts[0];
                  const timeOnly = dateParts[1] || '';

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Sale ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {sale.id}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{dateOnly}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{timeOnly}</div>
                      </td>

                      {/* Cashier */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {sale.cashierName}
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            sale.paymentMethod === 'efectivo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.paymentMethod === 'tarjeta'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {sale.paymentMethod === 'efectivo' && <DollarSign className="w-3 h-3" />}
                          {sale.paymentMethod === 'tarjeta' && <CreditCard className="w-3 h-3" />}
                          {sale.paymentMethod === 'transferencia' && <Building2 className="w-3 h-3" />}
                          <span>{sale.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 font-mono">
                        {itemsCount}
                      </td>

                      {/* Sale Total */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm whitespace-nowrap">
                        {formatCOP(sale.total)}
                      </td>

                      {/* View Detail Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalle</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {totalRecords > 0 && pageSize > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
            <div>
              Mostrando{' '}
              <strong className="text-slate-800 font-bold">
                {Math.min((currentPage - 1) * pageSize + 1, totalRecords)}
              </strong>{' '}
              a{' '}
              <strong className="text-slate-800 font-bold">
                {Math.min(currentPage * pageSize, totalRecords)}
              </strong>{' '}
              de <strong className="text-slate-800 font-bold">{totalRecords}</strong> ventas
            </div>

            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-white cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentPage === totalPages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-white cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DETALLE COMPLETO DE VENTA */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  Detalle de Venta N° {selectedSaleDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 text-slate-800">
              {/* Store Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h4 className="text-base font-black tracking-tight text-slate-900 uppercase">
                  SuperMercado Express
                </h4>
                <p className="text-xs text-slate-500">Comprobante de Venta e Inventario</p>
              </div>

              {/* General Information Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">FECHA Y HORA</span>
                  <strong className="text-slate-800">{selectedSaleDetail.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CAJERO RESPONSABLE</span>
                  <strong className="text-slate-800">{selectedSaleDetail.cashierName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MÉTODO DE PAGO</span>
                  <strong className="text-emerald-700 uppercase">{selectedSaleDetail.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CÓDIGO DE CAJA</span>
                  <strong className="text-slate-800">Caja #01</strong>
                </div>
              </div>

              {/* Sold Products Table */}
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Productos Vendidos ({selectedSaleDetail.items.reduce((a, c) => a + c.quantity, 0)} uds)
                </p>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 font-semibold text-slate-500 bg-slate-50">
                      <th className="py-2 px-2">Código</th>
                      <th className="py-2 px-2">Producto</th>
                      <th className="py-2 px-2 text-center">Cant</th>
                      <th className="py-2 px-2 text-right">P. Unit</th>
                      <th className="py-2 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSaleDetail.items.map((it) => (
                      <tr key={it.productId}>
                        <td className="py-2 px-2 font-mono text-[10px] text-slate-500">{it.code}</td>
                        <td className="py-2 px-2 font-medium text-slate-800 line-clamp-1">{it.name}</td>
                        <td className="py-2 px-2 text-center font-bold text-slate-700 font-mono">{it.quantity}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">{formatCOP(it.unitPrice)}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{formatCOP(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Venta:</span>
                  <span className="font-mono">{formatCOP(selectedSaleDetail.subtotal)}</span>
                </div>

                {selectedSaleDetail.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento Otorgado:</span>
                    <span className="font-mono">-{formatCOP(selectedSaleDetail.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL COBRADO:</span>
                  <span className="font-mono text-base text-emerald-600">
                    {formatCOP(selectedSaleDetail.total)}
                  </span>
                </div>

                {selectedSaleDetail.paymentMethod === 'efectivo' && (
                  <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>Monto Recibido:</span>
                      <span className="font-mono">{formatCOP(selectedSaleDetail.amountTendered || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Cambio Devuelto:</span>
                      <span className="font-mono text-emerald-700">{formatCOP(selectedSaleDetail.changeGiven || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>

              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
