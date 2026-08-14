import React, { useState, useMemo } from 'react';
import { Supermarket } from '../types';
import {
  getTodayIsoString,
  formatBolivianDate,
  formatBolivianLongDate,
  getSupermarketAccessInfo,
} from '../utils/saasAccess';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Building2,
  CalendarCheck,
  PowerOff,
  RefreshCw,
  Eye,
  AlertCircle,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';

interface AccessControlTableProps {
  supermarkets: Supermarket[];
  onOpenSetPeriodModal: (supermarket: Supermarket) => void;
  onDeactivateSupermarket: (supermarketId: string, reason?: string) => void;
  onOpenDetails: (supermarket: Supermarket) => void;
  referenceDate?: string;
}

export const AccessControlTable: React.FC<AccessControlTableProps> = ({
  supermarkets,
  onOpenSetPeriodModal,
  onDeactivateSupermarket,
  onOpenDetails,
  referenceDate = getTodayIsoString(),
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [deactivatingSm, setDeactivatingSm] = useState<Supermarket | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Evaluate access info for each supermarket
  const evaluatedList = useMemo(() => {
    return supermarkets.map((sm) => {
      const access = getSupermarketAccessInfo(sm, referenceDate);
      return {
        ...sm,
        access,
      };
    });
  }, [supermarkets, referenceDate]);

  // Filter list
  const filteredList = useMemo(() => {
    return evaluatedList.filter((sm) => {
      if (statusFilter !== 'todos') {
        if (statusFilter === 'proximos' && !sm.access.isExpiringSoon) return false;
        if (statusFilter === 'activo' && (sm.access.effectiveStatus !== 'activo' || sm.access.isExpiringSoon)) return false;
        if (statusFilter === 'vencido' && sm.access.effectiveStatus !== 'vencido') return false;
        if (statusFilter === 'desactivado' && sm.access.effectiveStatus !== 'desactivado') return false;
        if (statusFilter === 'pendiente' && sm.access.effectiveStatus !== 'pendiente') return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        return (
          sm.name.toLowerCase().includes(query) ||
          sm.adminName.toLowerCase().includes(query) ||
          sm.adminEmail.toLowerCase().includes(query) ||
          sm.address.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [evaluatedList, statusFilter, searchTerm]);

  // Handle manual deactivation submission
  const handleConfirmDeactivate = () => {
    if (!deactivatingSm) return;
    onDeactivateSupermarket(deactivatingSm.id, deactivationReason.trim() || undefined);
    setDeactivatingSm(null);
    setDeactivationReason('');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por supermercado o administrador..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="todos">Todos los Estados ({supermarkets.length})</option>
            <option value="activo">🟢 Activos</option>
            <option value="proximos">⚠️ Próximos a Vencer (≤ 7 días)</option>
            <option value="vencido">🔴 Vencidos</option>
            <option value="desactivado">⚪ Desactivados</option>
            <option value="pendiente">🔵 Pendientes</option>
          </select>
        </div>
      </div>

      {/* Access Control Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Supermercado</th>
                <th className="py-3.5 px-4">Administrador</th>
                <th className="py-3.5 px-4">Fecha de Inicio</th>
                <th className="py-3.5 px-4">Fecha de Vencimiento</th>
                <th className="py-3.5 px-4">Estado de Acceso</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-xs">No se encontraron registros de supermercados</p>
                    <p className="text-[11px]">Intente con otros criterios de búsqueda o filtro.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((sm) => {
                  const { access } = sm;

                  return (
                    <tr
                      key={sm.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        access.isExpiringSoon ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* 1. Nombre del Supermercado */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{sm.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{sm.address}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Administrador */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{sm.adminName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{sm.adminEmail}</p>
                        </div>
                      </td>

                      {/* 3. Fecha de Inicio */}
                      <td className="py-3.5 px-4">
                        {sm.startDate ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800">
                              {formatBolivianDate(sm.startDate)}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {formatBolivianLongDate(sm.startDate)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No establecida</span>
                        )}
                      </td>

                      {/* 4. Fecha de Vencimiento */}
                      <td className="py-3.5 px-4">
                        {sm.expirationDate ? (
                          <div className="space-y-0.5">
                            <span
                              className={`font-bold ${
                                access.effectiveStatus === 'vencido'
                                  ? 'text-rose-600'
                                  : access.isExpiringSoon
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {formatBolivianDate(sm.expirationDate)}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              {access.daysRemaining !== null ? (
                                access.daysRemaining < 0 ? (
                                  <span className="text-rose-600 font-semibold">
                                    Venció hace {Math.abs(access.daysRemaining)} días
                                  </span>
                                ) : access.daysRemaining === 0 ? (
                                  <span className="text-amber-600 font-bold">Vence hoy</span>
                                ) : (
                                  <span>{access.daysRemaining} días restantes</span>
                                )
                              ) : (
                                formatBolivianLongDate(sm.expirationDate)
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No establecida</span>
                        )}
                      </td>

                      {/* 5. Estado de Acceso con Alertas Visuales */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${access.badgeBg} ${access.badgeText} ${access.badgeBorder}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${access.dotColor} ${access.isExpiringSoon ? 'animate-pulse' : ''}`} />
                            {access.statusLabel}
                          </span>
                          {access.isExpiringSoon && (
                            <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              Atención: suscripción próxima a vencer
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 6. Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Modificar / Establecer Período */}
                          <button
                            type="button"
                            onClick={() => onOpenSetPeriodModal(sm)}
                            title="Establecer o extender período de acceso"
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>
                              {access.effectiveStatus === 'vencido'
                                ? 'Renovar'
                                : access.effectiveStatus === 'desactivado'
                                ? 'Reactivar'
                                : 'Período'}
                            </span>
                          </button>

                          {/* Desactivar Manualmente (si está activo o tiene período) */}
                          {access.effectiveStatus === 'activo' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeactivatingSm(sm);
                                setDeactivationReason('');
                              }}
                              title="Desactivar acceso manualmente"
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          )}

                          {/* Ver Ficha / Detalles */}
                          <button
                            type="button"
                            onClick={() => onOpenDetails(sm)}
                            title="Ver detalles de supermercado"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Manual Deactivation Modal Confirmation */}
      {deactivatingSm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <PowerOff className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  ¿Desactivar acceso a "{deactivatingSm.name}"?
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Al desactivar este supermercado, sus administradores y cajeros perderán el acceso al sistema inmediatamente. Podrá reactivarlo en cualquier momento estableciendo un nuevo período.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Motivo de la desactivación (Opcional):
                </label>
                <textarea
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="Ej: Solicitud del cliente por receso temporal / Auditoría de cuenta..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeactivatingSm(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Desactivación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
