import React, { useState, useMemo } from 'react';
import { Supermarket, SupermarketStatus, User, Employee } from '../types';
import {
  getTodayIsoString,
  getSupermarketAccessInfo,
  formatBolivianDate,
  formatBolivianLongDate,
} from '../utils/saasAccess';
import { AccessControlTable } from './AccessControlTable';
import { SaaSCalendar } from './SaaSCalendar';
import { SetAccessPeriodModal } from './SetAccessPeriodModal';
import { CreateSupermarketModal } from './CreateSupermarketModal';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  ShieldCheck,
  Eye,
  AlertCircle,
  Check,
  X,
  Store,
  Layers,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  PowerOff,
  SlidersHorizontal,
  PlusCircle,
} from 'lucide-react';

interface SuperAdminPanelProps {
  supermarkets: Supermarket[];
  existingUsers?: User[];
  existingEmployees?: Employee[];
  onApproveSupermarket: (supermarketId: string, startDate?: string, expirationDate?: string) => void;
  onRejectSupermarket: (supermarketId: string, reason?: string) => void;
  onSaveAccessPeriod: (supermarketId: string, startDate: string, expirationDate: string, notes?: string) => void;
  onDeactivateSupermarket: (supermarketId: string, reason?: string) => void;
  onCreateSupermarket?: (
    supermarket: Supermarket,
    adminUser: User & { password: string },
    adminEmployee: Employee
  ) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  referenceDate?: string;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  supermarkets,
  existingUsers = [],
  existingEmployees = [],
  onApproveSupermarket,
  onRejectSupermarket,
  onSaveAccessPeriod,
  onDeactivateSupermarket,
  onCreateSupermarket,
  showToast,
  referenceDate = getTodayIsoString(),
}) => {
  // Navigation tabs inside Super Admin Panel
  const [activeTab, setActiveTab] = useState<'control-acceso' | 'calendario' | 'solicitudes'>('control-acceso');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Access Period Modal state
  const [periodModalSupermarket, setPeriodModalSupermarket] = useState<Supermarket | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // Create Supermarket Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute metrics with saasAccess logic
  const evaluatedAll = useMemo(() => {
    return supermarkets.map((sm) => {
      const access = getSupermarketAccessInfo(sm, referenceDate);
      return { ...sm, access };
    });
  }, [supermarkets, referenceDate]);

  const totalSupermarkets = supermarkets.length;
  const activeCount = evaluatedAll.filter((s) => s.access.effectiveStatus === 'activo').length;
  const expiringSoonCount = evaluatedAll.filter((s) => s.access.isExpiringSoon).length;
  const expiredCount = evaluatedAll.filter((s) => s.access.effectiveStatus === 'vencido').length;
  const deactivatedCount = evaluatedAll.filter((s) => s.access.effectiveStatus === 'desactivado').length;
  const pendingCount = evaluatedAll.filter((s) => s.access.effectiveStatus === 'pendiente').length;

  // Filtered Supermarkets for Solicitudes tab
  const filteredSupermarkets = useMemo(() => {
    return supermarkets.filter((s) => {
      if (statusFilter !== 'todos' && s.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesAddress = s.address.toLowerCase().includes(query);
        const matchesPhone = s.phone.toLowerCase().includes(query);
        const matchesEmail = s.email.toLowerCase().includes(query);
        const matchesAdmin = s.adminName.toLowerCase().includes(query);
        const matchesAdminEmail = s.adminEmail.toLowerCase().includes(query);
        return (
          matchesName ||
          matchesAddress ||
          matchesPhone ||
          matchesEmail ||
          matchesAdmin ||
          matchesAdminEmail
        );
      }
      return true;
    });
  }, [supermarkets, statusFilter, searchTerm]);

  // Open Details Modal
  const handleOpenDetails = (supermarket: Supermarket) => {
    setSelectedSupermarket(supermarket);
    setIsDetailModalOpen(true);
  };

  // Open Set Period Modal
  const handleOpenSetPeriod = (supermarket: Supermarket) => {
    setPeriodModalSupermarket(supermarket);
    setIsPeriodModalOpen(true);
  };

  // Handle Save Period from modal
  const handleSavePeriod = (
    supermarketId: string,
    startDate: string,
    expirationDate: string,
    notes?: string
  ) => {
    onSaveAccessPeriod(supermarketId, startDate, expirationDate, notes);
    showToast('Período de acceso autorizado guardado correctamente.', 'success');
  };

  // Handle Deactivate action
  const handleDeactivate = (supermarketId: string, reason?: string) => {
    onDeactivateSupermarket(supermarketId, reason);
    showToast('El acceso del supermercado ha sido desactivado.', 'info');
  };

  // Handle Approve Action
  const handleApprove = (supermarketId: string) => {
    onApproveSupermarket(supermarketId);
    setIsDetailModalOpen(false);
    setSelectedSupermarket(null);
    showToast('¡Supermercado y Administrador aprobados exitosamente!', 'success');
  };

  // Open Reject Confirm
  const handleOpenRejectModal = (supermarket: Supermarket) => {
    setSelectedSupermarket(supermarket);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!selectedSupermarket) return;
    onRejectSupermarket(selectedSupermarket.id, rejectReason.trim() || undefined);
    setIsRejectModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedSupermarket(null);
    showToast('La solicitud del supermercado ha sido rechazada.', 'info');
  };

  // Status Badge Helper
  const renderStatusBadge = (status: SupermarketStatus) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Pendiente
          </span>
        );
      case 'activo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Activo
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Vencido
          </span>
        );
      case 'desactivado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Desactivado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* SaaS Welcome Banner for Super Admin */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plataforma SaaS Multi-Supermercados • Control de Acceso y Licencias</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Panel del Super Administrador
            </h1>
            <p className="text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Administración central de períodos autorizados de acceso, control de vigencia automática, calendario SaaS y gestión de suscripciones para todos los supermercados en Bolivia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-open-create-supermarket"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Crear Supermercado / Admin</span>
            </button>

            {expiringSoonCount > 0 && (
              <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-3 flex items-center gap-3 text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Alerta Vigencia
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {expiringSoonCount} {expiringSoonCount === 1 ? 'vence pronto' : 'vencen pronto'} (≤7d)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with 5 Visual States (Verde, Amarillo, Rojo, Gris, Azul) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Supermercados */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total
            </p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{totalSupermarkets}</h3>
            <p className="text-[10px] text-slate-400">Supermercados</p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Activos (Verde) */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Activos (Verde)
            </p>
            <h3 className="text-xl font-extrabold text-emerald-900 mt-0.5">{activeCount}</h3>
            <p className="text-[10px] text-emerald-600">Acceso vigente</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Próximos a Vencer (Amarillo) */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Por Vencer (≤7d)
            </p>
            <h3 className="text-xl font-extrabold text-amber-900 mt-0.5">{expiringSoonCount}</h3>
            <p className="text-[10px] text-amber-600">Alerta visual</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Vencidos (Rojo) */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Vencidos (Rojo)
            </p>
            <h3 className="text-xl font-extrabold text-rose-900 mt-0.5">{expiredCount}</h3>
            <p className="text-[10px] text-rose-600">Acceso bloqueado</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Desactivados (Gris) */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Desactivados
            </p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{deactivatedCount}</h3>
            <p className="text-[10px] text-slate-500">Manual / Inactivo</p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 6: Pendientes (Azul) */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Pendientes (Azul)
            </p>
            <h3 className="text-xl font-extrabold text-blue-900 mt-0.5">{pendingCount}</h3>
            <p className="text-[10px] text-blue-600">Sin autorizar</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Module Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('control-acceso')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'control-acceso'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Control de Acceso</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calendario'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendario SaaS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'solicitudes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Solicitudes y Supermercados</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-extrabold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: CONTROL DE ACCESO (TABLA) */}
      {activeTab === 'control-acceso' && (
        <AccessControlTable
          supermarkets={supermarkets}
          onOpenSetPeriodModal={handleOpenSetPeriod}
          onDeactivateSupermarket={handleDeactivate}
          onOpenDetails={handleOpenDetails}
          referenceDate={referenceDate}
        />
      )}

      {/* VIEW 2: CALENDARIO SAAS */}
      {activeTab === 'calendario' && (
        <SaaSCalendar
          supermarkets={supermarkets}
          onOpenSetPeriodModal={handleOpenSetPeriod}
          referenceDate={referenceDate}
        />
      )}

      {/* VIEW 3: SOLICITUDES Y GESTIÓN GENERAL DE SUPERMERCADOS */}
      {activeTab === 'solicitudes' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  <span>Supermercados Registrados</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Listado y control de supermercados y sus administradores exclusivos
                </p>
              </div>

              {/* Action and Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>+ Nuevo Supermercado</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('todos')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === 'todos'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({supermarkets.length})
                  </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pendiente')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'pendiente'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pendientes ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('activo')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'activo'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activos ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('rechazado')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'rechazado'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rechazados ({supermarkets.filter((s) => s.status === 'rechazado').length})
                </button>
              </div>
            </div>
          </div>

            {/* Search Input */}
            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre de supermercado, dirección, teléfono, correo o nombre de administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Table / List View */}
          {filteredSupermarkets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No se encontraron supermercados</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'todos'
                  ? 'No hay registros que coincidan con los filtros aplicados. Intenta restablecer la búsqueda.'
                  : 'Aún no hay supermercados registrados en la plataforma.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 lg:px-6">Supermercado</th>
                    <th className="py-3.5 px-4">Contacto Supermercado</th>
                    <th className="py-3.5 px-4">Administrador Asignado</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 lg:px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSupermarkets.map((sm) => (
                    <tr
                      key={sm.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Supermarket Name & Address */}
                      <td className="py-4 px-4 lg:px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{sm.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-xs">{sm.address}</span>
                            </p>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Reg: {formatBolivianDate(sm.registrationDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-800">{sm.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sm.phone}</span>
                          </p>
                        </div>
                      </td>

                      {/* Admin Assigned */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              sm.adminPhoto ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                            }
                            alt={sm.adminName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate">
                              {sm.adminName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{sm.adminEmail}</p>
                            <span className="inline-block text-[10px] text-indigo-700 bg-indigo-50 font-bold px-1.5 py-0.2 rounded border border-indigo-200 mt-0.5">
                              Doc: {sm.adminDocumentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {renderStatusBadge(sm.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 lg:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(sm)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Revisar Detalle</span>
                          </button>

                          {sm.status === 'pendiente' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(sm.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Aprobar Supermercado"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(sm)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Rechazar Supermercado"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ESTABLECER / MODIFICAR PERÍODO DE ACCESO */}
      <SetAccessPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => {
          setIsPeriodModalOpen(false);
          setPeriodModalSupermarket(null);
        }}
        supermarket={periodModalSupermarket}
        onSavePeriod={handleSavePeriod}
      />

      {/* DETAILED SUPERMARKET REVIEW MODAL */}
      {isDetailModalOpen && selectedSupermarket && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                  <Building2 className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{selectedSupermarket.name}</h3>
                    {renderStatusBadge(selectedSupermarket.status)}
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Solicitud registrada el {formatBolivianDate(selectedSupermarket.registrationDate)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSupermarket(null);
                }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Information Sections */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Status Note if pending */}
              {selectedSupermarket.status === 'pendiente' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Solicitud Pendiente de Revisión</p>
                    <p className="mt-0.5 leading-relaxed">
                      Este supermercado y su Administrador asignado se encuentran en espera de tu autorización. Al aprobarlo, se habilitará el período de acceso para que su equipo pueda operar.
                    </p>
                  </div>
                </div>
              )}

              {/* Access Period Info if available */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-indigo-600" />
                    Período de Acceso Autorizado:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenSetPeriod(selectedSupermarket);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Establecer / Modificar Período
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div>
                    <span className="text-slate-500">Fecha de Inicio:</span>{' '}
                    <strong>{formatBolivianDate(selectedSupermarket.startDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Fecha de Vencimiento:</span>{' '}
                    <strong>{formatBolivianDate(selectedSupermarket.expirationDate)}</strong>
                  </div>
                </div>
              </div>

              {/* Section 1: Supermarket Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span>Información del Supermercado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Nombre del Supermercado</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedSupermarket.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Correo Electrónico</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedSupermarket.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Teléfono de Contacto</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedSupermarket.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Dirección Comercial</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedSupermarket.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Administrator Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Información del Administrador Asignado (Exclusivo)</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  {/* Photo & Main Identity */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        selectedSupermarket.adminPhoto ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                      }
                      alt={selectedSupermarket.adminName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedSupermarket.adminName}
                      </h4>
                      <p className="text-xs text-slate-500">{selectedSupermarket.adminEmail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Rol: Administrador
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          1 Admin / Supermercado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">Documento de Identidad</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {selectedSupermarket.adminDocumentId}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Teléfono Personal</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {selectedSupermarket.adminPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Dirección de Residencia</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {selectedSupermarket.adminAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Fecha de Nacimiento</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {formatBolivianDate(selectedSupermarket.adminBirthDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Fecha de Contratación</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {formatBolivianDate(selectedSupermarket.adminHireDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Supermercado Vinculado</p>
                      <p className="font-bold text-indigo-700 mt-0.5">
                        {selectedSupermarket.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSupermarket(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              {selectedSupermarket.status === 'pendiente' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(selectedSupermarket)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar Solicitud</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(selectedSupermarket.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Solicitud</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {isRejectModalOpen && selectedSupermarket && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Rechazar solicitud de supermercado?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se rechazará el registro de <strong className="text-slate-800">{selectedSupermarket.name}</strong> y su Administrador (<strong className="text-slate-800">{selectedSupermarket.adminName}</strong>) no podrá acceder al sistema.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo del rechazo (Opcional):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ejemplo: Documentación incompleta o no verificada..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUPERMARKET & ADMIN MODAL (MANUAL SUPERADMIN CREATION) */}
      <CreateSupermarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        existingUsers={existingUsers}
        existingEmployees={existingEmployees}
        existingSupermarkets={supermarkets}
        onCreateSupermarket={(sm, adminUser, adminEmp) => {
          if (onCreateSupermarket) {
            onCreateSupermarket(sm, adminUser, adminEmp);
          }
          showToast(`¡Supermercado "${sm.name}" y Administrador creados y verificados con éxito!`, 'success');
        }}
      />
    </div>
  );
};
