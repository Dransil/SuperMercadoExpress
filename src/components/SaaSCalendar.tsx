import React, { useState, useMemo } from 'react';
import { Supermarket } from '../types';
import {
  getTodayIsoString,
  formatBolivianDate,
  formatBolivianLongDate,
  getSupermarketAccessInfo,
  getDaysDifference,
} from '../utils/saasAccess';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  CalendarCheck,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface SaaSCalendarProps {
  supermarkets: Supermarket[];
  onOpenSetPeriodModal: (supermarket: Supermarket) => void;
  onOpenDeactivateModal?: (supermarket: Supermarket) => void;
  referenceDate?: string;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const SaaSCalendar: React.FC<SaaSCalendarProps> = ({
  supermarkets,
  onOpenSetPeriodModal,
  referenceDate = getTodayIsoString(),
}) => {
  // Current calendar month view state
  const [currentYear, setCurrentYear] = useState(() => {
    const parts = referenceDate.split('-');
    return Number(parts[0]) || new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = referenceDate.split('-');
    return (Number(parts[1]) || (new Date().getMonth() + 1)) - 1; // 0-indexed
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlert, setFilterAlert] = useState<string>('todos');
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(referenceDate);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const parts = referenceDate.split('-');
    setCurrentYear(Number(parts[0]) || new Date().getFullYear());
    setCurrentMonth((Number(parts[1]) || (new Date().getMonth() + 1)) - 1);
    setSelectedDayIso(referenceDate);
  };

  // Evaluate all supermarkets access info
  const evaluatedSupermarkets = useMemo(() => {
    return supermarkets.map((sm) => {
      const access = getSupermarketAccessInfo(sm, referenceDate);
      return {
        ...sm,
        access,
      };
    });
  }, [supermarkets, referenceDate]);

  // Filtered supermarkets for agenda / list
  const filteredSupermarkets = useMemo(() => {
    return evaluatedSupermarkets.filter((sm) => {
      if (filterAlert !== 'todos') {
        if (filterAlert === 'proximos' && !sm.access.isExpiringSoon) return false;
        if (filterAlert === 'activos' && (sm.access.effectiveStatus !== 'activo' || sm.access.isExpiringSoon)) return false;
        if (filterAlert === 'vencidos' && sm.access.effectiveStatus !== 'vencido') return false;
        if (filterAlert === 'desactivados' && sm.access.effectiveStatus !== 'desactivado') return false;
        if (filterAlert === 'pendientes' && sm.access.effectiveStatus === 'activo') return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        return (
          sm.name.toLowerCase().includes(query) ||
          sm.adminName.toLowerCase().includes(query) ||
          sm.email.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [evaluatedSupermarkets, filterAlert, searchTerm]);

  // Days in current Month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // First day of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Convert so Monday = 0, Sunday = 6
  const startingDayOffset = (firstDayIndex + 6) % 7;

  // Calendar cells matrix
  const calendarCells = useMemo(() => {
    const cells = [];
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month filler days
    for (let i = startingDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        iso,
        isCurrentMonth: false,
        supermarkets: [] as typeof evaluatedSupermarkets,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const m = currentMonth + 1;
      const iso = `${currentYear}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Check which supermarkets have active period on this day or expire on this day
      const activeOrExpiringSm = evaluatedSupermarkets.filter((sm) => {
        if (!sm.startDate || !sm.expirationDate) return false;
        // Check if date falls within startDate and expirationDate
        return iso >= sm.startDate && iso <= sm.expirationDate;
      });

      cells.push({
        dayNum: day,
        iso,
        isCurrentMonth: true,
        supermarkets: activeOrExpiringSm,
      });
    }

    // Next month filler days to complete grid (42 cells = 6 rows)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        iso,
        isCurrentMonth: false,
        supermarkets: [] as typeof evaluatedSupermarkets,
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, startingDayOffset, evaluatedSupermarkets]);

  // Selected Day Details
  const selectedDaySupermarkets = useMemo(() => {
    if (!selectedDayIso) return [];
    return evaluatedSupermarkets.filter((sm) => {
      if (!sm.startDate || !sm.expirationDate) return false;
      return selectedDayIso >= sm.startDate && selectedDayIso <= sm.expirationDate;
    });
  }, [selectedDayIso, evaluatedSupermarkets]);

  // Supermarkets expiring in current viewing month
  const expiringThisMonth = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return evaluatedSupermarkets.filter(
      (sm) => sm.expirationDate && sm.expirationDate.startsWith(monthPrefix)
    );
  }, [currentYear, currentMonth, evaluatedSupermarkets]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Legend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              Calendario y Agenda de Períodos SaaS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise visualmente los períodos de acceso de cada supermercado en Bolivia (Hoy: {formatBolivianLongDate(referenceDate)}).
            </p>
          </div>

          {/* Quick Month Navigator Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Mes Actual
            </button>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-800 min-w-[140px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Colors Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Convención de Alertas:
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Activo (Verde)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Próximo a Vencer (Amarillo, ≤7 días)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Vencido (Rojo)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Desactivado (Gris)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Pendiente (Azul)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on XL screens (Calendar + Agenda sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR MONTH GRID (2 COLS) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Vista Mensual: {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
            <span className="text-xs text-slate-500">
              {expiringThisMonth.length} supermercado(s) vencen este mes
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg ${
                  idx >= 5 ? 'text-rose-500 bg-rose-50/40' : 'text-slate-600 bg-slate-50'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const isToday = cell.iso === referenceDate;
              const isSelected = cell.iso === selectedDayIso;
              const hasEvents = cell.supermarkets.length > 0;

              return (
                <div
                  key={`${cell.iso}-${idx}`}
                  onClick={() => setSelectedDayIso(cell.iso)}
                  className={`min-h-[78px] sm:min-h-[90px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                      : isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-200'
                      : isToday
                      ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Supermarket indicators on this day */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {cell.supermarkets.slice(0, 2).map((sm) => {
                      const isExpirationDay = sm.expirationDate === cell.iso;
                      const isStartDay = sm.startDate === cell.iso;

                      let dotBg = 'bg-emerald-500';
                      let chipBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                      if (sm.access.effectiveStatus === 'desactivado') {
                        dotBg = 'bg-slate-500';
                        chipBg = 'bg-slate-100 text-slate-700 border-slate-300';
                      } else if (sm.access.effectiveStatus === 'vencido') {
                        dotBg = 'bg-rose-500';
                        chipBg = 'bg-rose-50 text-rose-700 border-rose-200';
                      } else if (sm.access.isExpiringSoon) {
                        dotBg = 'bg-amber-500';
                        chipBg = 'bg-amber-50 text-amber-800 border-amber-200';
                      }

                      return (
                        <div
                          key={sm.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSetPeriodModal(sm);
                          }}
                          title={`${sm.name} (${sm.access.statusLabel}) - Vence: ${formatBolivianDate(sm.expirationDate)}`}
                          className={`px-1 py-0.5 rounded text-[9px] font-semibold border flex items-center gap-1 truncate ${chipBg} hover:opacity-85 transition-opacity`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />
                          <span className="truncate">{sm.name}</span>
                          {isExpirationDay && (
                            <span className="text-[8px] font-extrabold text-rose-600 ml-auto shrink-0">
                              Fin
                            </span>
                          )}
                          {isStartDay && (
                            <span className="text-[8px] font-extrabold text-blue-600 ml-auto shrink-0">
                              Ini
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {cell.supermarkets.length > 2 && (
                      <p className="text-[9px] text-indigo-600 font-bold pl-1">
                        +{cell.supermarkets.length - 2} más...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Footer Detail */}
          {selectedDayIso && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Supermercados con vigencia el {formatBolivianLongDate(selectedDayIso)}:
                </p>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedDaySupermarkets.length} activo(s)
                </span>
              </div>

              {selectedDaySupermarkets.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Ningún supermercado tiene período activo registrado en esta fecha seleccionada.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedDaySupermarkets.map((sm) => (
                    <div
                      key={sm.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{sm.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Vigencia: {formatBolivianDate(sm.startDate)} al {formatBolivianDate(sm.expirationDate)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenSetPeriodModal(sm)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Gestionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AGENDA & TIMELINE SIDEBAR (1 COL) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Agenda y Alertas SaaS
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {filteredSupermarkets.length} Supermercados
              </span>
            </div>

            {/* Filter & Search Controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar supermercado..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <select
                value={filterAlert}
                onChange={(e) => setFilterAlert(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="todos">Todos los estados de acceso</option>
                <option value="proximos">⚠️ Próximos a Vencer (≤ 7 días)</option>
                <option value="activos">🟢 Activos Vigentes</option>
                <option value="vencidos">🔴 Vencidos</option>
                <option value="desactivados">⚪ Desactivados</option>
                <option value="pendientes">🔵 Pendientes</option>
              </select>
            </div>

            {/* Supermarket Cards List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredSupermarkets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-1">
                  <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No se encontraron supermercados</p>
                  <p className="text-[10px]">Ajuste los filtros o términos de búsqueda.</p>
                </div>
              ) : (
                filteredSupermarkets.map((sm) => {
                  const { access } = sm;
                  return (
                    <div
                      key={sm.id}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        access.isExpiringSoon
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-200'
                          : access.effectiveStatus === 'vencido'
                          ? 'bg-rose-50/50 border-rose-200'
                          : access.effectiveStatus === 'desactivado'
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : 'bg-white border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${access.dotColor}`} />
                            {sm.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            Admin: {sm.adminName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${access.badgeBg} ${access.badgeText} ${access.badgeBorder}`}
                        >
                          {access.statusLabel}
                        </span>
                      </div>

                      {/* Access Period Details */}
                      <div className="p-2 bg-white/80 rounded-lg border border-slate-100 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Período:</span>
                          <span className="font-semibold text-slate-800">
                            {formatBolivianDate(sm.startDate)} - {formatBolivianDate(sm.expirationDate)}
                          </span>
                        </div>
                        {access.daysRemaining !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Días:</span>
                            <span
                              className={`font-bold ${
                                access.daysRemaining < 0
                                  ? 'text-rose-600'
                                  : access.daysRemaining <= 7
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {access.daysRemaining < 0
                                ? `Venció hace ${Math.abs(access.daysRemaining)} días`
                                : access.daysRemaining === 0
                                ? 'Vence hoy'
                                : `${access.daysRemaining} días restantes`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => onOpenSetPeriodModal(sm)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          access.effectiveStatus === 'vencido'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : access.isExpiringSoon
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        {access.effectiveStatus === 'vencido'
                          ? 'Renovar Período Vencido'
                          : access.isExpiringSoon
                          ? 'Extender Período'
                          : 'Modificar Período'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Notice Info */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              El vencimiento o desactivación bloquea automáticamente el acceso operativo a cajeros y administradores sin borrar ningún dato del supermercado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
