import React from 'react';
import { Employee, User } from '../types';
import { ShieldCheck, Users, UserCheck, ArrowRight, CheckCircle2, Sparkles, BarChart3 } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  employees: Employee[];
  onNavigateToEmployees: () => void;
  onNavigateToDashboard?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  employees,
  onNavigateToEmployees,
  onNavigateToDashboard,
}) => {
  const totalEmployees = employees.length;
  const adminCount = employees.filter((e) => e.role === 'admin' && e.status !== 'pendiente' && e.status !== 'rechazado').length;
  const cashierCount = employees.filter((e) => e.role === 'cajero' && e.status !== 'pendiente' && e.status !== 'rechazado').length;
  const pendingCount = employees.filter((e) => e.status === 'pendiente').length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Panel del Administrador
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                ¡Bienvenido(a), {currentUser.name}!
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Has ingresado con el rol de <strong className="text-slate-800">Administrador</strong>. Desde aquí tienes acceso total a la gestión del personal del supermercado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Ver Dashboard de KPIs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onNavigateToEmployees}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Administrar Empleados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Requests Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {pendingCount} {pendingCount === 1 ? 'Solicitud de registro pendiente' : 'Solicitudes de registro pendientes'}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Nuevos usuarios han registrado su cuenta y requieren autorización del Administrador para acceder.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToEmployees}
            className="px-4 py-2 bg-white text-amber-900 font-bold text-xs rounded-xl shadow-xs hover:bg-amber-50 transition-colors cursor-pointer shrink-0"
          >
            Revisar y Autorizar
          </button>
        </div>
      )}

      {/* Module 1 Info Box */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 text-slate-700 text-sm">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-800">Estado del Sistema — Módulo 1 (Usuarios y Empleados)</h3>
          <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
            Este módulo permite registrar, editar, eliminar y consultar el listado completo de empleados. Los módulos correspondientes a ventas, productos e inventario serán habilitados en posteriores etapas.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Employees */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Empleados</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalEmployees}</p>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Personal registrado
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administradores</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{adminCount}</p>
            <p className="text-[11px] text-blue-600 mt-1 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Control administrativo
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Cajeros */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cajeros Registrados</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{cashierCount}</p>
            <p className="text-[11px] text-teal-600 mt-1 font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Atención en caja
            </p>
          </div>
          <div className="p-3.5 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
