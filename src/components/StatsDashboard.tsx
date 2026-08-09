import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product, User, Employee } from '../types';
import { motion } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  Users,
  CreditCard,
  Package,
  Boxes,
  Filter,
  CheckCircle2,
  Tag,
  Award,
  Activity,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Receipt,
  Layers,
  Sparkles,
  ArrowDownRight,
  Building2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface StatsDashboardProps {
  sales: Sale[];
  products: Product[];
  currentUser: User;
  employees: Employee[];
}

type FilterPeriod = 'hoy' | 'semana' | 'mes' | 'personalizado';

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  sales,
  products,
  currentUser,
  employees,
}) => {
  // Real-time Clock
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time Filter States
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>('mes');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Currency Formatter COP
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Date Parsing Helper YYYY-MM-DD HH:mm:ss
  const parseSaleDate = (dateStr: string): Date => {
    return new Date(dateStr.replace(' ', 'T'));
  };

  // Current Date Strings for calculation
  const now = currentDateTime;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  // 1. CALCULATE FIXED GLOBAL UNFILTERED KPIs
  const globalKPIs = useMemo(() => {
    let salesTodayCount = 0;
    let revenueTodayTotal = 0;
    let salesWeekCount = 0;
    let salesMonthCount = 0;
    let revenueMonthTotal = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    sales.forEach((s) => {
      const sDateObj = parseSaleDate(s.date);
      const sDateDayStr = `${sDateObj.getFullYear()}-${String(
        sDateObj.getMonth() + 1
      ).padStart(2, '0')}-${String(sDateObj.getDate()).padStart(2, '0')}`;

      // Today
      if (sDateDayStr === todayStr) {
        salesTodayCount += 1;
        revenueTodayTotal += s.total;
      }

      // Week
      if (sDateObj >= sevenDaysAgo) {
        salesWeekCount += 1;
      }

      // Month
      if (sDateObj >= firstDayOfMonth) {
        salesMonthCount += 1;
        revenueMonthTotal += s.total;
      }
    });

    return {
      salesTodayCount,
      revenueTodayTotal,
      salesWeekCount,
      salesMonthCount,
      revenueMonthTotal,
    };
  }, [sales, todayStr, now]);

  // 2. FILTER SALES ACCORDING TO SELECTED FILTER PERIOD
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const sDateObj = parseSaleDate(s.date);
      const sDateDayStr = `${sDateObj.getFullYear()}-${String(
        sDateObj.getMonth() + 1
      ).padStart(2, '0')}-${String(sDateObj.getDate()).padStart(2, '0')}`;

      if (periodFilter === 'hoy') {
        return sDateDayStr === todayStr;
      }
      if (periodFilter === 'semana') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return sDateObj >= sevenDaysAgo;
      }
      if (periodFilter === 'mes') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return sDateObj >= firstDayOfMonth;
      }
      if (periodFilter === 'personalizado') {
        if (startDate) {
          const startObj = new Date(`${startDate}T00:00:00`);
          if (sDateObj < startObj) return false;
        }
        if (endDate) {
          const endObj = new Date(`${endDate}T23:59:59`);
          if (sDateObj > endObj) return false;
        }
        return true;
      }
      return true;
    });
  }, [sales, periodFilter, startDate, endDate, todayStr, now]);

  // 3. CALCULATE MAIN KPIs
  const mainKPIs = useMemo(() => {
    const totalSalesCount = filteredSales.length;
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    let totalProductsSoldUnits = 0;
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        totalProductsSoldUnits += item.quantity;
      });
    });

    const activeProductsCount = products.filter((p) => p.status === 'activo').length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0);
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);

    return {
      totalSalesCount,
      totalRevenue,
      averageTicket,
      totalProductsSoldUnits,
      activeProductsCount,
      outOfStockCount: outOfStockProducts.length,
      lowStockCount: lowStockProducts.length,
      outOfStockList: outOfStockProducts,
      lowStockList: lowStockProducts,
    };
  }, [filteredSales, products]);

  // 4. TOP HIGHLIGHTS (INDICADORES DESTACADOS)
  const highlights = useMemo(() => {
    // Map of product sales quantity
    const productSalesMap = new Map<
      string,
      { name: string; code: string; image: string; qty: number; revenue: number }
    >();

    // Map of cashier sales
    const cashierSalesMap = new Map<string, { name: string; count: number; total: number }>();

    // Map of payment methods
    const paymentMap = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
    };

    filteredSales.forEach((s) => {
      // Payment method count
      if (s.paymentMethod in paymentMap) {
        paymentMap[s.paymentMethod as keyof typeof paymentMap] += 1;
      }

      // Cashier count
      const cName = s.cashierName || 'Cajero';
      const existingCashier = cashierSalesMap.get(cName) || { name: cName, count: 0, total: 0 };
      existingCashier.count += 1;
      existingCashier.total += s.total;
      cashierSalesMap.set(cName, existingCashier);

      // Product sales
      s.items.forEach((item) => {
        const existingProd = productSalesMap.get(item.productId) || {
          name: item.name,
          code: item.code,
          image: item.image,
          qty: 0,
          revenue: 0,
        };
        existingProd.qty += item.quantity;
        existingProd.revenue += item.subtotal;
        productSalesMap.set(item.productId, existingProd);
      });
    });

    // Top Sold Product
    let topProduct: { name: string; code: string; image: string; qty: number; revenue: number } | null = null;
    let maxQty = -1;
    productSalesMap.forEach((val) => {
      if (val.qty > maxQty) {
        maxQty = val.qty;
        topProduct = val;
      }
    });

    // Least Sold Product (among active catalog)
    let leastProduct: { name: string; code: string; stock: number; qtySold: number } | null = null;
    let minQty = Infinity;
    products
      .filter((p) => p.status === 'activo')
      .forEach((p) => {
        const soldInfo = productSalesMap.get(p.id);
        const qtySold = soldInfo ? soldInfo.qty : 0;
        if (qtySold < minQty) {
          minQty = qtySold;
          leastProduct = {
            name: p.name,
            code: p.code,
            stock: p.stock,
            qtySold,
          };
        }
      });

    // Top Cashier
    let topCashier: { name: string; count: number; total: number } | null = null;
    let maxCashierCount = -1;
    cashierSalesMap.forEach((val) => {
      if (val.count > maxCashierCount) {
        maxCashierCount = val.count;
        topCashier = val;
      }
    });

    // Most Used Payment Method
    let topPaymentMethod: { method: string; count: number; percentage: number } = {
      method: 'Efectivo',
      count: 0,
      percentage: 0,
    };

    const totalSalesCount = filteredSales.length;
    let maxPaymentCount = -1;
    (Object.keys(paymentMap) as Array<keyof typeof paymentMap>).forEach((m) => {
      const count = paymentMap[m];
      if (count > maxPaymentCount) {
        maxPaymentCount = count;
        const methodLabel =
          m === 'efectivo' ? 'Efectivo' : m === 'tarjeta' ? 'Tarjeta' : 'Transferencia';
        topPaymentMethod = {
          method: methodLabel,
          count,
          percentage: totalSalesCount > 0 ? Math.round((count / totalSalesCount) * 100) : 0,
        };
      }
    });

    return {
      topProduct,
      leastProduct,
      topCashier,
      topPaymentMethod,
    };
  }, [filteredSales, products]);

  // 5. CHART DATA TRANSFORMATIVE LOGIC

  // Chart 1: Ventas por Día (Evolución de ventas)
  const salesByDayChartData = useMemo(() => {
    const dayMap = new Map<string, { fecha: string; total: number; ventas: number }>();

    // Sort filtered sales by date ascending
    const sorted = [...filteredSales].sort(
      (a, b) => parseSaleDate(a.date).getTime() - parseSaleDate(b.date).getTime()
    );

    sorted.forEach((s) => {
      const dateParts = s.date.split(' ')[0].split('-');
      // Format DD/MM
      const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

      const existing = dayMap.get(formattedDate) || {
        fecha: formattedDate,
        total: 0,
        ventas: 0,
      };
      existing.total += s.total;
      existing.ventas += 1;
      dayMap.set(formattedDate, existing);
    });

    return Array.from(dayMap.values());
  }, [filteredSales]);

  // Chart 2: Ventas por Método de Pago (Pie / Donut Chart)
  const paymentMethodChartData = useMemo(() => {
    let efectivoTotal = 0;
    let tarjetaTotal = 0;
    let transferenciaTotal = 0;

    filteredSales.forEach((s) => {
      if (s.paymentMethod === 'efectivo') efectivoTotal += s.total;
      else if (s.paymentMethod === 'tarjeta') tarjetaTotal += s.total;
      else if (s.paymentMethod === 'transferencia') transferenciaTotal += s.total;
    });

    return [
      { name: 'Efectivo', value: efectivoTotal, color: '#10b981' },
      { name: 'Tarjeta', value: tarjetaTotal, color: '#3b82f6' },
      { name: 'Transferencia', value: transferenciaTotal, color: '#a855f7' },
    ].filter((item) => item.value > 0 || filteredSales.length === 0);
  }, [filteredSales]);

  // Chart 3: Productos más vendidos (Top 10 BarChart)
  const topProductsChartData = useMemo(() => {
    const prodMap = new Map<string, { name: string; cantidad: number; total: number }>();

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const existing = prodMap.get(item.productId) || {
          name: item.name.length > 18 ? item.name.slice(0, 18) + '...' : item.name,
          cantidad: 0,
          total: 0,
        };
        existing.cantidad += item.quantity;
        existing.total += item.subtotal;
        prodMap.set(item.productId, existing);
      });
    });

    return Array.from(prodMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [filteredSales]);

  // Chart 4: Categorías más vendidas (BarChart)
  const categoriesChartData = useMemo(() => {
    const catMap = new Map<string, { categoria: string; cantidad: number; total: number }>();

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        // Find category from products catalog
        const catName =
          products.find((p) => p.id === item.productId)?.category || 'General';

        const existing = catMap.get(catName) || {
          categoria: catName,
          cantidad: 0,
          total: 0,
        };
        existing.cantidad += item.quantity;
        existing.total += item.subtotal;
        catMap.set(catName, existing);
      });
    });

    return Array.from(catMap.values()).sort((a, b) => b.cantidad - a.cantidad);
  }, [filteredSales, products]);

  // Chart 5: Ingresos Mensuales (Column / BarChart)
  const monthlyRevenueChartData = useMemo(() => {
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const monthTotals = new Array(12).fill(0);
    const monthSalesCounts = new Array(12).fill(0);

    sales.forEach((s) => {
      const d = parseSaleDate(s.date);
      const mIndex = d.getMonth();
      monthTotals[mIndex] += s.total;
      monthSalesCounts[mIndex] += 1;
    });

    return monthNames.map((name, idx) => ({
      mes: name,
      ingresos: monthTotals[idx],
      ventas: monthSalesCounts[idx],
    }));
  }, [sales]);

  // Formatted Date and Time strings for header
  const formattedDateHeader = currentDateTime.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTimeHeader = currentDateTime.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO & BIENVENIDA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-sm shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Módulo 6 — Dashboard de Estadísticas
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                ¡Bienvenido, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Panel integral de monitoreo comercial, rendimiento de caja y análisis de inventario.
              </p>
            </div>
          </div>

          {/* Real-Time Clock & Calendar Badge */}
          <div className="flex items-center gap-3 bg-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-slate-800 shrink-0">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 capitalize font-medium">
                  {formattedDateHeader}
                </span>
              </div>
              <p className="text-base font-black text-emerald-400 font-mono tracking-wider">
                {formattedTimeHeader}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. BARRA DE FILTROS TEMPORALES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filtrar Datos del Dashboard
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPeriodFilter('hoy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'hoy'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriodFilter('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'semana'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodFilter('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'mes'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setPeriodFilter('personalizado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'personalizado'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rango de Fechas
            </button>
          </div>

          {periodFilter === 'personalizado' && (
            <div className="flex items-center gap-2 bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-200 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800"
              />
              <span className="text-emerald-800 font-bold">a</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. KPIS PRINCIPALES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas del día */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas del Día
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {globalKPIs.salesTodayCount}{' '}
              <span className="text-xs font-normal text-slate-400">ventas</span>
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Hoy ({todayStr})
            </p>
          </div>
        </motion.div>

        {/* KPI 2: Ventas de la Semana */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas de la Semana
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {globalKPIs.salesWeekCount}{' '}
              <span className="text-xs font-normal text-slate-400">ventas</span>
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">
              Últimos 7 días
            </p>
          </div>
        </motion.div>

        {/* KPI 3: Ventas del Mes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas del Mes
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {globalKPIs.salesMonthCount}{' '}
              <span className="text-xs font-normal text-slate-400">ventas</span>
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              Mes actual en curso
            </p>
          </div>
        </motion.div>

        {/* KPI 4: Ingresos del Día */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ingresos del Día
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600 font-mono">
              {formatCOP(globalKPIs.revenueTodayTotal)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Facturación de hoy
            </p>
          </div>
        </motion.div>

        {/* KPI 5: Ingresos del Mes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ingresos del Mes
            </span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-teal-700 font-mono">
              {formatCOP(globalKPIs.revenueMonthTotal)}
            </p>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">
              Recaudación mensual
            </p>
          </div>
        </motion.div>

        {/* KPI 6: Número Total de Ventas (Filtradas) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Ventas (Filtro)
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {mainKPIs.totalSalesCount}
            </p>
            <p className="text-[11px] text-sky-600 font-semibold mt-1">
              Total: {formatCOP(mainKPIs.totalRevenue)}
            </p>
          </div>
        </motion.div>

        {/* KPI 7: Ticket Promedio */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.35 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {formatCOP(mainKPIs.averageTicket)}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Promedio por cliente
            </p>
          </div>
        </motion.div>

        {/* KPI 8: Productos Vendidos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.4 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Productos Vendidos
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {mainKPIs.totalProductsSoldUnits}{' '}
              <span className="text-xs font-normal text-slate-400">unidades</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Unidades despachadas
            </p>
          </div>
        </motion.div>

        {/* KPI 9: Productos Activos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.45 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Productos Activos
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {mainKPIs.activeProductsCount}
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">
              En catálogo comercial
            </p>
          </div>
        </motion.div>

        {/* KPI 10: Productos Sin Stock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.5 }}
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
            mainKPIs.outOfStockCount > 0
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Productos Sin Stock
            </span>
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-700 font-mono">
              {mainKPIs.outOfStockCount}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              Agotados totalmente
            </p>
          </div>
        </motion.div>

        {/* KPI 11: Productos Con Stock Bajo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.55 }}
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
            mainKPIs.lowStockCount > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Productos Stock Bajo
            </span>
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-800 font-mono">
              {mainKPIs.lowStockCount}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Existencias ≤ 10 unidades
            </p>
          </div>
        </motion.div>
      </div>

      {/* 4. INDICADORES DESTACADOS (TOP HIGHLIGHTS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highlight 1: Producto más vendido */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Producto Más Vendido
            </p>
            {highlights.topProduct ? (
              <div>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {highlights.topProduct.name}
                </p>
                <p className="text-[11px] text-emerald-600 font-mono font-bold mt-0.5">
                  {highlights.topProduct.qty} uds ({formatCOP(highlights.topProduct.revenue)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Sin datos</p>
            )}
          </div>
        </div>

        {/* Highlight 2: Producto con menor rotación */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menor Rotación
            </p>
            {highlights.leastProduct ? (
              <div>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {highlights.leastProduct.name}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {highlights.leastProduct.qtySold} vendidas (Stock: {highlights.leastProduct.stock})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Sin datos</p>
            )}
          </div>
        </div>

        {/* Highlight 3: Cajero con mayor cantidad de ventas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Top Cajero
            </p>
            {highlights.topCashier ? (
              <div>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {highlights.topCashier.name}
                </p>
                <p className="text-[11px] text-blue-600 font-mono font-bold mt-0.5">
                  {highlights.topCashier.count} ventas ({formatCOP(highlights.topCashier.total)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Sin datos</p>
            )}
          </div>
        </div>

        {/* Highlight 4: Método de pago más utilizado */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Método de Pago Preferido
            </p>
            <div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {highlights.topPaymentMethod.method}
              </p>
              <p className="text-[11px] text-purple-600 font-mono font-bold mt-0.5">
                {highlights.topPaymentMethod.percentage}% del total ({highlights.topPaymentMethod.count} vtas)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECCIÓN DE ALERTAS DE INVENTARIO */}
      {(mainKPIs.outOfStockCount > 0 || mainKPIs.lowStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alerta: Sin Stock */}
          {mainKPIs.outOfStockCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Alerta: Productos Sin Stock ({mainKPIs.outOfStockCount})</span>
                </div>
                <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded-full text-[10px] font-black">
                  Urgente
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {mainKPIs.outOfStockList.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between bg-white p-2 rounded-xl border border-rose-100 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{prod.code}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg shrink-0">
                      0 dispon.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerta: Stock Bajo */}
          {mainKPIs.lowStockCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Alerta: Stock Bajo (≤ 10 uds) ({mainKPIs.lowStockCount})</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded-full text-[10px] font-black">
                  Reabastecer
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {mainKPIs.lowStockList.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-100 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{prod.code}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg shrink-0 font-mono">
                      {prod.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. GRÁFICOS VISUALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 1: VENTAS POR DÍA (EVOLUCIÓN) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Ventas por Día</h3>
                <p className="text-[11px] text-slate-400">Evolución de ingresos por fecha</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {salesByDayChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay ventas registradas en el período seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesByDayChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(value: any) => [formatCOP(Number(value)), 'Ingresos']}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: VENTAS POR MÉTODO DE PAGO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Ventas por Método de Pago</h3>
                <p className="text-[11px] text-slate-400">Distribución de cobranzas</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {filteredSales.length === 0 ? (
              <p className="text-xs text-slate-400">Sin datos para mostrar chart</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCOP(Number(val)), 'Total']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 3: PRODUCTOS MÁS VENDIDOS (TOP 10) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Productos Más Vendidos (Top 10)</h3>
                <p className="text-[11px] text-slate-400">Unidades vendidas por artículo</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {topProductsChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay productos vendidos en este período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748b" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={110}
                    stroke="#64748b"
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} unidades`, 'Cantidad']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="cantidad" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 4: CATEGORÍAS MÁS VENDIDAS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Categorías Más Vendidas</h3>
                <p className="text-[11px] text-slate-400">Volumen por línea de producto</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {categoriesChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Sin datos de categorías.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoriesChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="categoria"
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(val: any) => [`${val} unidades`, 'Cantidad']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* GRÁFICO 5: INGRESOS MENSUALES (COLUMNAS ANUALES) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Ingresos Mensuales</h3>
              <p className="text-[11px] text-slate-400">Histórico de facturación anual por mes</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyRevenueChartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <Tooltip
                formatter={(val: any) => [formatCOP(Number(val)), 'Ingresos']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="ingresos" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
