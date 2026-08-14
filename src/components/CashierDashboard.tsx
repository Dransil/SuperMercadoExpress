import React from 'react';
import { User } from '../types';
import { UserCheck, ShoppingBag, Clock, CheckCircle2, ShoppingCart, ArrowRight, Receipt } from 'lucide-react';

interface CashierDashboardProps {
  currentUser: User;
  onNavigateToSales?: () => void;
  onNavigateToShiftClosure?: () => void;
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({
  currentUser,
  onNavigateToSales,
  onNavigateToShiftClosure,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner for Cashier */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Panel de Cajero(a)
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                ¡Bienvenido(a), {currentUser.name}!
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Has iniciado sesión con el rol de <strong className="text-emerald-700">Cajero(a)</strong> en SuperMercado Express. El punto de venta (POS) está habilitado.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            {onNavigateToSales && (
              <button
                onClick={onNavigateToSales}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ir al Punto de Venta (POS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToShiftClosure && (
              <button
                id="cashier-cierre-jornada-btn"
                onClick={onNavigateToShiftClosure}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-300 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Realizar Cierre de Jornada</span>
              </button>
            )}

            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Turno Activo — Terminal #01</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Welcome Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cashier Profile Info Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Datos de la Cuenta</h3>
              <p className="text-xs text-slate-400">Información registrada del operario</p>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Nombre Completo:</span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Documento ID:</span>
              <span className="font-mono text-slate-800">{currentUser.documentId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Correo Electrónico:</span>
              <span className="text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Cargo Asignado:</span>
              <span className="font-bold text-emerald-700 uppercase text-xs px-2.5 py-0.5 bg-emerald-100 rounded border border-emerald-200">
                Cajero
              </span>
            </div>
          </div>
        </div>

        {/* System Stage Note */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Punto de Venta Habilitado</h3>
                <p className="text-xs text-slate-400">Control de Caja y Facturación</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              El área de <strong className="text-slate-800">Ventas (POS)</strong> te permite realizar búsquedas por código o nombre de producto, añadir ítems al detalle de venta, aplicar descuentos y procesar pagos en efectivo, tarjeta o transferencia con emisión de comprobante y descuento automático de inventario.
            </p>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Terminal de Caja: <strong className="text-slate-800">Caja #01</strong></span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> En línea
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

