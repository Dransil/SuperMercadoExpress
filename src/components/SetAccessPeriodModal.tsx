import React, { useState, useEffect } from 'react';
import { Supermarket } from '../types';
import {
  getTodayIsoString,
  formatBolivianDate,
  formatBolivianLongDate,
  getDaysDifference,
  addDaysToIso,
  addMonthsToIso,
} from '../utils/saasAccess';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface SetAccessPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  supermarket: Supermarket | null;
  onSavePeriod: (supermarketId: string, startDate: string, expirationDate: string, notes?: string) => void;
}

export const SetAccessPeriodModal: React.FC<SetAccessPeriodModalProps> = ({
  isOpen,
  onClose,
  supermarket,
  onSavePeriod,
}) => {
  const today = getTodayIsoString();

  const [startDate, setStartDate] = useState(today);
  const [expirationDate, setExpirationDate] = useState(addMonthsToIso(today, 1));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Synchronize initial dates when supermarket changes or modal opens
  useEffect(() => {
    if (supermarket) {
      const initialStart = supermarket.startDate || today;
      const initialExp = supermarket.expirationDate || addMonthsToIso(initialStart, 1);
      setStartDate(initialStart);
      setExpirationDate(initialExp);
      setNotes(supermarket.notes || '');
      setError('');
    }
  }, [supermarket, isOpen, today]);

  if (!isOpen || !supermarket) return null;

  // Calculate duration
  const totalDays = getDaysDifference(startDate, expirationDate);
  const isInvalidRange = expirationDate < startDate;

  // Apply Quick Presets
  const applyPreset = (daysToAdd: number) => {
    const baseStart = startDate || today;
    const newExp = addDaysToIso(baseStart, daysToAdd);
    setExpirationDate(newExp);
    setError('');
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setError('');
    // If new start is after current expiration, auto-adjust expiration to +1 month
    if (newStart > expirationDate) {
      setExpirationDate(addMonthsToIso(newStart, 1));
    }
  };

  const handleExpirationDateChange = (newExp: string) => {
    setExpirationDate(newExp);
    if (newExp < startDate) {
      setError('La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !expirationDate) {
      setError('Debe especificar ambas fechas (inicio y vencimiento).');
      return;
    }

    if (expirationDate < startDate) {
      setError('La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
      return;
    }

    onSavePeriod(supermarket.id, startDate, expirationDate, notes.trim() || undefined);
    onClose();
  };

  // Determine prospective status
  let prospectiveStatus = 'Activo';
  let prospectiveClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (today < startDate) {
    prospectiveStatus = 'Pendiente / Futuro';
    prospectiveClass = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (today > expirationDate) {
    prospectiveStatus = 'Vencido';
    prospectiveClass = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Establecer Período de Acceso SaaS
              </h2>
              <p className="text-xs text-slate-500">
                {supermarket.name} • {supermarket.adminName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Target Supermarket Card */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-lg border border-indigo-200 text-indigo-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-indigo-950 truncate">{supermarket.name}</p>
              <p className="text-[11px] text-indigo-700 truncate">
                Administrador: <strong>{supermarket.adminName}</strong> ({supermarket.adminEmail})
              </p>
              <p className="text-[10px] text-indigo-600 mt-0.5">
                Fecha de hoy en Bolivia: <strong>{formatBolivianLongDate(today)}</strong>
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium animate-in fade-in-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Duration Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Atajos rápidos de vigencia:
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(15)}
                className="px-2 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                15 días
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="px-2 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                1 Mes (30d)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(90)}
                className="px-2 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                3 Meses
              </button>
              <button
                type="button"
                onClick={() => applyPreset(365)}
                className="px-2 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                1 Año
              </button>
            </div>
          </div>

          {/* Date Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de Inicio */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Fecha de Inicio <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Formato Bolivia: {formatBolivianDate(startDate)}
              </p>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Fecha de Vencimiento <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expirationDate}
                  min={startDate}
                  onChange={(e) => handleExpirationDateChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 ${
                    isInvalidRange
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Formato Bolivia: {formatBolivianDate(expirationDate)}
              </p>
            </div>
          </div>

          {/* Prospective Summary Info Card */}
          {!isInvalidRange && totalDays >= 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Duración total autorizada:</span>
                <span className="font-bold text-slate-900">
                  {totalDays} {totalDays === 1 ? 'día' : 'días'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Período de acceso:</span>
                <span className="font-semibold text-slate-800">
                  {formatBolivianDate(startDate)} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-0.5" /> {formatBolivianDate(expirationDate)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                <span className="text-slate-600 font-medium">Estado resultante:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${prospectiveClass}`}>
                  {prospectiveStatus}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Notas u observaciones (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Plan SaaS Pro contratado por 3 meses según comprobante..."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isInvalidRange}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Guardar Período de Acceso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
