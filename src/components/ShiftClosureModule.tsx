import React, { useState, useMemo } from 'react';
import { User, Sale, ShiftClosure, ClosureStatus } from '../types';
import { formatBs } from '../utils/formatters';
import {
  Receipt,
  Calendar,
  User as UserIcon,
  DollarSign,
  CreditCard,
  Building2,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
  Printer,
  ChevronRight,
  Sparkles,
  Calculator,
  ShieldCheck,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';

interface ShiftClosureModuleProps {
  currentUser: User;
  sales: Sale[];
  shiftClosures: ShiftClosure[];
  onSaveShiftClosure: (closure: ShiftClosure) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ShiftClosureModule: React.FC<ShiftClosureModuleProps> = ({
  currentUser,
  sales,
  shiftClosures,
  onSaveShiftClosure,
  showToast,
}) => {
  // Default selected date to Today YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // State for physical cash input
  const [declaredCashInput, setDeclaredCashInput] = useState<string>('');

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Check if a closure is already registered for this cashier and date
  const existingClosure = useMemo(() => {
    return shiftClosures.find(
      (c) => c.cashierId === currentUser.id && c.date === selectedDate
    );
  }, [shiftClosures, currentUser.id, selectedDate]);

  // Filter sales corresponding ONLY to the logged-in cashier and the selected date
  const cashierSalesForDate = useMemo(() => {
    return sales.filter((s) => {
      const isMySale =
        s.cashierId === currentUser.id ||
        (s.cashierName && s.cashierName.toLowerCase() === currentUser.name.toLowerCase());
      const saleDateStr = s.date.split(' ')[0]; // Extract YYYY-MM-DD
      return isMySale && saleDateStr === selectedDate;
    });
  }, [sales, currentUser, selectedDate]);

  // Calculated Shift Metrics
  const salesCount = cashierSalesForDate.length;
  const totalSales = useMemo(
    () => cashierSalesForDate.reduce((acc, s) => acc + s.total, 0),
    [cashierSalesForDate]
  );
  const cashTotal = useMemo(
    () =>
      cashierSalesForDate
        .filter((s) => s.paymentMethod === 'efectivo')
        .reduce((acc, s) => acc + s.total, 0),
    [cashierSalesForDate]
  );
  const cardTotal = useMemo(
    () =>
      cashierSalesForDate
        .filter((s) => s.paymentMethod === 'tarjeta')
        .reduce((acc, s) => acc + s.total, 0),
    [cashierSalesForDate]
  );
  const transferTotal = useMemo(
    () =>
      cashierSalesForDate
        .filter((s) => s.paymentMethod === 'transferencia')
        .reduce((acc, s) => acc + s.total, 0),
    [cashierSalesForDate]
  );

  // Cash Reconciliation (Arqueo de Efectivo)
  const expectedCash = existingClosure ? existingClosure.expectedCash : cashTotal;
  const declaredCash = existingClosure
    ? existingClosure.declaredCash
    : declaredCashInput !== ''
    ? parseFloat(declaredCashInput) || 0
    : 0;

  const difference = declaredCash - expectedCash;

  let closureStatus: ClosureStatus = 'coincidencia';
  if (difference < 0) {
    closureStatus = 'faltante';
  } else if (difference > 0) {
    closureStatus = 'sobrante';
  }

  // Handle Opening Confirmation Modal
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingClosure) {
      showToast('Esta jornada ya fue finalizada previamente.', 'info');
      return;
    }

    if (declaredCashInput === '' || isNaN(parseFloat(declaredCashInput))) {
      showToast('Por favor ingrese el dinero en efectivo declarado.', 'error');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Confirm and Finalize Closure
  const handleConfirmFinalize = () => {
    const now = new Date();
    const closureId = `CJ-${selectedDate.replace(/-/g, '')}-${currentUser.id}`;

    const newClosure: ShiftClosure = {
      id: closureId,
      date: selectedDate,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      salesCount,
      totalSales,
      cashTotal,
      cardTotal,
      transferTotal,
      declaredCash,
      expectedCash,
      difference,
      status: closureStatus,
      closedAt: now.toLocaleString('es-BO', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
    };

    onSaveShiftClosure(newClosure);
    setIsConfirmModalOpen(false);
    showToast('¡Cierre de jornada finalizado y registrado correctamente!', 'success');
  };

  // Helper to handle print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shrink-0 shadow-xs">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Receipt className="w-3 h-3 text-emerald-600" />
                Arqueo y Contabilidad de Turno
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                Cierre de Jornada — Cajero
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Resumen contable individual e ingreso de dinero en efectivo al finalizar el día
              </p>
            </div>
          </div>

          {/* Date Picker Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full sm:w-auto shrink-0">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Fecha:</span>
            <input
              id="cierre-fecha-input"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDeclaredCashInput('');
              }}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Cashier Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">{currentUser.name}</h3>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                Cajero(a)
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span>Doc ID: <strong className="font-mono text-slate-700">{currentUser.documentId}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-700">{currentUser.email}</strong></span>
            </p>
          </div>
        </div>

        {existingClosure ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shrink-0">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Jornada Finalizada ({existingClosure.closedAt})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Turno Abierto — Pendiente de Cierre</span>
          </div>
        )}
      </div>

      {/* 1. INFORMACIÓN DE LA JORNADA (Metric Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cantidad de Ventas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas Realizadas</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{salesCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Transacciones registradas</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Total Vendido */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vendido</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatBs(totalSales)}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Ingreso total del turno</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Cobrado en Efectivo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Efectivo</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatBs(cashTotal)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Esperado físicamente</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Tarjeta + Transferencia */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarjeta / Transf.</p>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {formatBs(cardTotal + transferTotal)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tarj: {formatBs(cardTotal)} | Transf: {formatBs(transferTotal)}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown by Payment Method Detailed Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Desglose por Métodos de Pago del Cajero</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Efectivo</p>
                <p className="text-[11px] text-slate-500">Cobros en papel moneda</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-800">{formatBs(cashTotal)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Tarjeta Débito/Crédito</p>
                <p className="text-[11px] text-slate-500">Datáfono o POS electrónico</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-800">{formatBs(cardTotal)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Transferencia Bancaria</p>
                <p className="text-[11px] text-slate-500">Nequi, Daviplata o QR</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-800">{formatBs(transferTotal)}</span>
          </div>
        </div>
      </div>

      {/* 2. ARQUEO DE EFECTIVO FORM & RECONCILIATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Arqueo de Efectivo en Caja</h3>
              <p className="text-xs text-slate-500">Conteo físico de billetes y monedas en gaveta</p>
            </div>
          </div>

          {existingClosure && (
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1 border border-slate-200">
              <Lock className="w-3.5 h-3.5" /> Bloqueado
            </span>
          )}
        </div>

        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1. Efectivo Esperado */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Efectivo Esperado en Sistema
              </span>
              <p className="text-2xl font-black text-slate-800">{formatBs(expectedCash)}</p>
              <p className="text-[11px] text-slate-400">Calculado a partir de ventas en efectivo</p>
            </div>

            {/* 2. Efectivo Declarado (INPUT) */}
            <div className="space-y-1">
              <label
                htmlFor="efectivo-declarado-input"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                2. Efectivo Declarado (Bs) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  Bs
                </div>
                <input
                  id="efectivo-declarado-input"
                  type="number"
                  min="0"
                  step="100"
                  disabled={!!existingClosure}
                  value={
                    existingClosure
                      ? existingClosure.declaredCash
                      : declaredCashInput
                  }
                  onChange={(e) => setDeclaredCashInput(e.target.value)}
                  placeholder="Ingrese el dinero físico contado"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400">Total físico en efectivo según conteo</p>
            </div>

            {/* 3. Diferencia Calculada */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                3. Diferencia de Arqueo
              </span>
              <p
                className={`text-2xl font-black ${
                  difference === 0
                    ? 'text-emerald-700'
                    : difference < 0
                    ? 'text-rose-600'
                    : 'text-blue-600'
                }`}
              >
                {difference > 0 ? `+${formatBs(difference)}` : formatBs(difference)}
              </p>
              <p className="text-[11px] text-slate-400">Fórmula: Declarado - Esperado</p>
            </div>
          </div>

          {/* STATUS DISPLAY CARD */}
          <div className="pt-2">
            {difference === 0 ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">Coincidencia Exacta en Caja</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    El efectivo físico declarado coincide perfectamente con las ventas en efectivo registradas en el sistema.
                  </p>
                </div>
              </div>
            ) : difference < 0 ? (
              <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-900">Faltante de Dinero en Caja (-{formatBs(Math.abs(difference))})</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Existe un faltante de dinero físico en relación con el total esperado según las ventas del sistema.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-800">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-blue-900">Sobrante de Dinero en Caja (+{formatBs(difference)})</h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    El dinero en efectivo físico declarado supera el total de ventas en efectivo registrado en el sistema.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON OR FINALIZED RECEIPT */}
          {!existingClosure ? (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                id="finalizar-cierre-btn"
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Finalizar Cierre de Jornada</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>El cierre de esta jornada ya fue enviado y no se permite su modificación posterior.</span>
              </div>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Confirmar Cierre de Jornada</h3>
                  <p className="text-xs text-slate-400">Verifique el resumen antes de registrar la liquidación</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Ticket */}
            <div className="p-6 space-y-4 text-xs font-medium text-slate-700 bg-slate-50/50">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cajero Operador:</span>
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Fecha de Jornada:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ventas Realizadas:</span>
                  <span className="font-bold text-slate-800">{salesCount} transacciones</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Vendido Turno:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{formatBs(totalSales)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Efectivo Esperado:</span>
                  <span className="font-bold text-slate-800">{formatBs(expectedCash)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Efectivo Declarado:</span>
                  <span className="font-bold text-emerald-700">{formatBs(declaredCash)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold">
                  <span className="text-slate-700">Diferencia Final:</span>
                  <span
                    className={
                      difference === 0
                        ? 'text-emerald-700'
                        : difference < 0
                        ? 'text-rose-600 font-extrabold'
                        : 'text-blue-600 font-extrabold'
                    }
                  >
                    {difference > 0 ? `+${formatBs(difference)}` : formatBs(difference)} (
                    {difference === 0 ? 'Coincidencia' : difference < 0 ? 'Faltante' : 'Sobrante'})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Al confirmar, el cierre de caja quedará formalmente asentado y no podrá realizar cambios sobre este registro.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirmar-cierre-definitivo-btn"
                type="button"
                onClick={handleConfirmFinalize}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Finalizar Cierre</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
