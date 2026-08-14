import React, { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Layers,
  BarChart3,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Database,
  Lock,
  ChevronRight,
  HelpCircle,
  Star,
  Check,
  Store,
  KeyRound,
  FileSpreadsheet,
  Receipt,
  Boxes,
  ArrowUpRight,
  Shield,
  Smartphone,
  SlidersHorizontal,
} from 'lucide-react';
import { Supermarket } from '../types';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegisterSupermarket: () => void;
  onNavigateToRegisterEmployee: () => void;
  supermarkets?: Supermarket[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegisterSupermarket,
  onNavigateToRegisterEmployee,
  supermarkets = [],
}) => {
  const [activeTabFeature, setActiveTabFeature] = useState<
    'pos' | 'inventory' | 'closure' | 'saas' | 'stats'
  >('pos');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Active verified supermarkets count
  const activeCount = supermarkets.filter((s) => s.status === 'aprobado').length || 4;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  SuperMercado <span className="text-indigo-400">Express</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                  SaaS Multi-Tenant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Software POS & Gestión Integral</p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#beneficios" className="hover:text-indigo-400 transition-colors">
              Beneficios
            </a>
            <a href="#modulos" className="hover:text-indigo-400 transition-colors">
              Módulos POS
            </a>
            <a href="#planes" className="hover:text-indigo-400 transition-colors">
              Planes
            </a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="landing-login-nav-btn"
              type="button"
              onClick={() => onNavigateToLogin()}
              className="px-4 py-2 text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-700/60 cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              id="landing-register-nav-btn"
              type="button"
              onClick={onNavigateToRegisterSupermarket}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>Registrar Supermercado</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-indigo-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plataforma Cloud Multi-Tenant POS & Gestión v2.5</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              El software de ventas e inventario que tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">
                supermercado necesita
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Controla ventas ultrarrápidas, gestiona inventario con stock crítico, realiza arqueos
              y cierres de caja transparentes, y supervisa múltiples sucursales con analíticas en
              tiempo real desde cualquier dispositivo.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                id="hero-register-btn"
                type="button"
                onClick={onNavigateToRegisterSupermarket}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Building2 className="w-5 h-5 text-slate-950" />
                <span>Registrar Nuevo Supermercado</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                id="hero-login-btn"
                type="button"
                onClick={() => onNavigateToLogin()}
                className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <span>Ingresar al Sistema</span>
              </button>
            </div>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl p-2 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl border border-slate-700/60">
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                {/* Browser/Window Header */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      https://supermercado-express.app/pos
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Sincronizado (Supabase Cloud)
                    </span>
                  </div>
                </div>

                {/* Simulated POS Interface Dashboard */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-950">
                  {/* Left 2 Cols: Sales & POS Highlights */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                        <p className="text-[11px] text-slate-400 font-medium">Ventas Hoy</p>
                        <p className="text-xl font-bold text-emerald-400 mt-1">Bs. 8,420.50</p>
                        <span className="text-[10px] text-emerald-500 font-medium">
                          +18.4% vs ayer
                        </span>
                      </div>
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                        <p className="text-[11px] text-slate-400 font-medium">Transacciones</p>
                        <p className="text-xl font-bold text-white mt-1">142 tickets</p>
                        <span className="text-[10px] text-slate-400">Promedio: Bs. 59.30</span>
                      </div>
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                        <p className="text-[11px] text-slate-400 font-medium">Alertas Stock</p>
                        <p className="text-xl font-bold text-amber-400 mt-1">3 ítems</p>
                        <span className="text-[10px] text-amber-500">Reponer pronto</span>
                      </div>
                    </div>

                    {/* POS Simulated Items Table */}
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
                          Carrito de Venta en Vivo — Caja 01
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono">
                          Ticket #00482
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🥛</span>
                            <div>
                              <p className="font-semibold text-slate-200">Leche Entera Pil 1L</p>
                              <p className="text-[10px] text-slate-500">Cód: 7771234001 • x2 unid.</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">Bs. 13.00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span className="text-base">☕</span>
                            <div>
                              <p className="font-semibold text-slate-200">Café Clásico Nescafé 200g</p>
                              <p className="text-[10px] text-slate-500">Cód: 7771234008 • x1 unid.</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">Bs. 32.50</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Payment & Shift Summary */}
                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-slate-300">Total a Cobrar</span>
                        <span className="text-2xl font-black text-emerald-400">Bs. 45.50</span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Métodos de Pago Aceptados
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-1.5 font-medium">
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Efectivo</span>
                          </div>
                          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 flex items-center gap-1.5 font-medium">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pago QR</span>
                          </div>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 flex items-center gap-1.5 font-medium">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Tarjeta</span>
                          </div>
                          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 flex items-center gap-1.5 font-medium">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Transferencia</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => onNavigateToLogin('cajero1', 'admin123')}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Abrir Punto de Venta</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY METRICS & TRUST STRIP */}
      <section className="py-10 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">99.9%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Disponibilidad en la Nube
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400">&lt; 0.5s</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Registro de Venta y Ticket
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-teal-400">100%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Web (Sin descargas pesadas)
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">{activeCount}+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Supermercados Activos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE BENEFITS SECTION */}
      <section id="beneficios" className="py-20 md:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Beneficios Clave
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Diseñado para optimizar cada proceso de tu supermercado
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Elimina los errores de inventario, agiliza las filas de tus cajas y obtén control
              financiero total en tiempo real.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Punto de Venta (POS) Táctil</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Búsqueda ultra veloz por código de barras o nombre, cálculo automático de cambio y
                emisión instantánea de tickets térmicos con desglose de IVA.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Inventario & Kardex Inteligente</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Control de stock en tiempo real con alertas visuales de productos por agotarse,
                registro de entradas/salidas y trazabilidad completa de mermas.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-teal-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cierre de Caja & Arqueo Preciso</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Conciliación por cajero al finalizar turnos, cálculo automático de sobrantes o
                faltantes y actas oficiales de arqueo listas para exportar o imprimir.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-amber-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Estadísticas & Reportes en Vivo</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dashboard analítico con gráficos interactivos, productos más vendidos, márgenes de
                ganancia, ingresos por hora y exportación a Excel / PDF.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-rose-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SaaS Multi-Supermercados</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Arquitectura multi-tenant con aislamiento de datos por sucursal, control de
                vigencia de licencias y gestión centralizada desde el panel SuperAdmin.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-purple-500/50 hover:bg-slate-800 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Control de Empleados & Roles</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Permisos granulares para Administradores y Cajeros, flujo de aprobación de nuevos
                empleados y auditoría de accesos con contraseñas seguras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE MODULES WALKTHROUGH */}
      <section id="modulos" className="py-20 bg-slate-950/70 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Explora los Módulos
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              Todo lo necesario para la operación diaria
            </h2>
          </div>

          {/* Module Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveTabFeature('pos')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabFeature === 'pos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>1. Punto de Venta (POS)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('inventory')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabFeature === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>2. Inventario & Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('closure')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabFeature === 'closure'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>3. Cierre de Jornada</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('stats')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabFeature === 'stats'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>4. Reportes & KPIs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('saas')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabFeature === 'saas'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>5. SuperAdmin SaaS</span>
            </button>
          </div>

          {/* Module Content Box */}
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {activeTabFeature === 'pos' && (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Módulo de Ventas Rápido</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Punto de Venta optimizado para alto flujo de clientes
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Permite a los cajeros agregar artículos mediante lector de barras o búsqueda
                    predictiva, aplicar descuentos, registrar múltiples formas de pago (Efectivo con
                    cálculo de cambio, QR, Tarjeta, Transferencia) e imprimir tickets con formato
                    oficial.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Emisión instantánea de boletas y facturas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Disponibilidad sin retardos con validación de stock disponible</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Historial de tickets recientes y reimpresión de comprobantes</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('cajero1', 'admin123')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Probar POS como Cajero</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300">
                    <strong>Punto de Venta Activo:</strong> Terminal 01 - Supermercado Don Tito
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>• Aceite Fino 900ml (x2)</span>
                      <span className="text-white">Bs. 28.00</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Arroz Grano de Oro 1kg (x3)</span>
                      <span className="text-white">Bs. 21.00</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Harina Selecta 1kg (x1)</span>
                      <span className="text-white">Bs. 8.50</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-emerald-400">
                      <span>TOTAL COBRADO</span>
                      <span>Bs. 57.50</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTabFeature === 'inventory' && (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Boxes className="w-4 h-4" />
                    <span>Control de Mercadería</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Inventario sincronizado y alertas automáticas
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Mantén actualizado el catálogo de productos con códigos de barras, categorías,
                    costo de compra, precio de venta, margen de beneficio y niveles de stock mínimo
                    para reposición inmediata.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kardex automático por cada venta, compra o ajuste</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Filtros por categoría (Lácteos, Abarrotes, Limpieza, Carnes)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Avisos de stock crítico en el panel principal</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('admin', 'admin123')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver Módulo de Inventario</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300">
                    <strong>Catálogo Central:</strong> 42 Productos Registrados
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-300">Galletas Oreo 120g</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                        Stock: 64 unid.
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-300">Azúcar Guabirá 1kg</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">
                        Stock Crítico: 4 unid.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTabFeature === 'closure' && (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                    <Receipt className="w-4 h-4" />
                    <span>Auditoría de Caja</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Cierre de turno transparente y sin discrepancias
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Facilita el cuadre diario de cada cajero. El sistema totaliza las ventas por
                    método de pago (Efectivo, QR, Tarjeta, Transferencia), calcula sobrantes o
                    faltantes y genera el acta de arqueo formal.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Control de fondo de caja inicial y retiros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Cálculo automático de diferencia física vs. teórica</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Historial de cierres auditables por fecha</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('cajero1', 'admin123')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Probar Cierre de Jornada</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300">
                    <strong>Acta de Cierre:</strong> Turno Mañana — Cajero: Carlos Mamani
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex justify-between">
                      <span>• Fondo Inicial:</span>
                      <span className="text-white">Bs. 200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Efectivo Cobrado:</span>
                      <span className="text-white">Bs. 1,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Ventas QR / Tarjeta:</span>
                      <span className="text-white">Bs. 820.00</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-400">
                      <span>DIFERENCIA:</span>
                      <span>Bs. 0.00 (CUADRADO)</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTabFeature === 'stats' && (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4" />
                    <span>Inteligencia de Negocio</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Métricas en tiempo real para tomar mejores decisiones
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Monitorea tus ingresos brutos, margen de ganancia neto, ticket promedio,
                    rendimiento por cajero y productos más demandados con visualizaciones
                    interactivas.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Gráficos de ventas por día, semana y mes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Top 10 productos de mayor rotación</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Exportación de informes para contabilidad</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('admin', 'admin123')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver Panel de Estadísticas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                    <strong>KPIs del Mes:</strong> Supermercado Don Tito
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-slate-900 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Ingreso Mensual</p>
                      <p className="text-emerald-400 font-bold text-sm">Bs. 48,250</p>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Margen Promedio</p>
                      <p className="text-amber-400 font-bold text-sm">28.4%</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTabFeature === 'saas' && (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Control SaaS Centralizado</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    SuperAdmin SaaS: Gestión de licencias y supermercados
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Permite a los administradores de la plataforma dar de alta nuevos
                    supermercados, aprobar o rechazar solicitudes, asignar períodos de vigencia (1,
                    3, 6, 12 meses o personalizados) y suspender accesos vencidos.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Aprobación y activación de supermercados en 1 clic</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Control de vigencia con alertas de vencimiento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Aislamiento estricto de datos por tenant</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('superadmin', 'superadmin123')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Entrar al Panel SuperAdmin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300">
                    <strong>SuperAdmin Control Center:</strong> 5 Tenants Registrados
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-300">Supermercado Don Tito</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                        Activo • 180 días
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-300">Supermercado Fidalga</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                        Activo • 90 días
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 6. COMPARISON MATRIX (Old vs Modern SaaS) */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Comparativa
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              ¿Por qué cambiar a SuperMercado Express?
            </h2>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="grid grid-cols-3 bg-slate-900/90 p-4 border-b border-slate-800 text-xs sm:text-sm font-bold text-slate-300">
              <div>Característica</div>
              <div className="text-slate-400">Sistemas Antiguos / Excel</div>
              <div className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> SuperMercado Express
              </div>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-slate-200">Acceso & Instalación</span>
                <span className="text-rose-400/90 flex items-center gap-1.5">
                  ❌ Requiere instalación local
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  ✅ 100% Web desde cualquier navegador
                </span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-slate-200">Control de Inventario</span>
                <span className="text-rose-400/90 flex items-center gap-1.5">
                  ❌ Desfase manual y pérdidas
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  ✅ Tiempo real con alertas de stock mínimo
                </span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-slate-200">Arqueo y Cierre de Caja</span>
                <span className="text-rose-400/90 flex items-center gap-1.5">
                  ❌ Papel y cálculos propensos a error
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  ✅ Cuadre automático multimoneda y métodos
                </span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-slate-200">Multi-Sucursales</span>
                <span className="text-rose-400/90 flex items-center gap-1.5">
                  ❌ Bases de datos desconectadas
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  ✅ Panel SaaS unificado con roles protegidos
                </span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-slate-200">Copias de Seguridad</span>
                <span className="text-rose-400/90 flex items-center gap-1.5">
                  ❌ Riesgo alto si falla la computadora
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  ✅ Respaldo continuo en la nube (Supabase)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SAAS PRICING / PLANS PREVIEW */}
      <section id="planes" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Planes Flexibles
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              Diseñado para crecer con tu negocio
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Sin costos ocultos ni contratos forzosos. Períodos de prueba disponibles para nuevos
              supermercados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Plan Básico</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal para minimarkets y tiendas de barrio</p>
                <div className="my-5">
                  <span className="text-3xl font-black text-white">Bs. 149</span>
                  <span className="text-xs text-slate-400"> / mes</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Caja / Punto de Venta activo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Hasta 500 productos en inventario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cierres de caja y arqueos diarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sincronización en la nube Supabase</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onNavigateToRegisterSupermarket}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Comenzar con Básico
              </button>
            </div>

            {/* Plan 2: Destacado */}
            <div className="p-6 bg-slate-950 border-2 border-emerald-500 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                Más Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Plan Supermercado Pro</h3>
                <p className="text-xs text-slate-400 mt-1">Para supermercados medianos con alto flujo</p>
                <div className="my-5">
                  <span className="text-3xl font-black text-emerald-400">Bs. 299</span>
                  <span className="text-xs text-slate-400"> / mes</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cajas / Puntos de Venta ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Catálogo de productos ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dashboard de métricas avanzadas y KPIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gestión de múltiples cajeros y turnos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onNavigateToRegisterSupermarket}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Registrar Supermercado Pro
              </button>
            </div>

            {/* Plan 3 */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Plan Cadena / Multi-Sucursal</h3>
                <p className="text-xs text-slate-400 mt-1">Para cadenas con múltiples locales</p>
                <div className="my-5">
                  <span className="text-3xl font-black text-white">Bs. 599</span>
                  <span className="text-xs text-slate-400"> / mes</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Múltiples sucursales interconectadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Panel SuperAdmin y consolidación contable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Transferencias de stock entre sucursales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>API personalizada y respaldos dedicados</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onNavigateToRegisterSupermarket}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Consultar Plan Cadena
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Dudas Resueltas
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Necesito instalar algún programa o driver en mi computadora?',
                a: 'No. SuperMercado Express es una aplicación 100% web en la nube. Puedes acceder directamente desde Google Chrome, Edge o Safari en cualquier computadora, tablet o portátil.',
              },
              {
                q: '¿Funciona con lectores de código de barras e impresoras térmicas?',
                a: 'Sí. Cualquier lector USB o inalámbrico y cualquier impresora térmica POS de 58mm o 80mm es compatible nativamente mediante el comando estándar de impresión.',
              },
              {
                q: '¿Cómo funciona el registro y la activación de un nuevo supermercado?',
                a: 'Al registrar tu supermercado, se crea tu cuenta de Administrador. La solicitud pasa a revisión en el panel SuperAdmin, quien autoriza el período de vigencia para que puedas comenzar a operar de inmediato.',
              },
              {
                q: '¿Mis datos de ventas e inventario están protegidos?',
                a: 'Absolutamente. Cada supermercado cuenta con aislamiento de datos seguro mediante arquitectura multi-tenant y respaldos continuos en la nube con Supabase.',
              },
              {
                q: '¿Pueden registrarse cajeros y empleados por su cuenta?',
                a: 'Sí. Los empleados pueden enviar su solicitud de registro seleccionando su supermercado. El Administrador de la tienda debe aprobarlos antes de que puedan iniciar sesión.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-indigo-400 transition-transform ${
                      openFaq === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Comienza a transformar la gestión de tu supermercado hoy
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Únete a la plataforma que agiliza el cobro, elimina mermas de inventario y te da control
            absoluto de tus sucursales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToRegisterSupermarket}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>Registrar mi Supermercado</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <span>Acceder al Sistema</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300 text-sm">
              SuperMercado <span className="text-indigo-400">Express SaaS</span>
            </span>
          </div>

          <p>© {new Date().getFullYear()} SuperMercado Express. Todos los derechos reservados.</p>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={onNavigateToRegisterEmployee}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Postulación Empleados
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Acceso al Sistema
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
