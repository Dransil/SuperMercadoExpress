import React from 'react';
import { UserRole } from '../types';
import { ShoppingBag, LayoutDashboard, Users, User, LogOut, ShieldCheck, X, Package, Boxes, ShoppingCart, FileText, BarChart3 } from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  userName: string;
  userAvatar: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  userName,
  userAvatar,
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  onCloseMobile,
  onOpenProfile,
}) => {
  const isNavActive = (tabKey: string) => activeTab === tabKey;

  const handleNavClick = (tabKey: string) => {
    setActiveTab(tabKey);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-md text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base tracking-tight leading-tight">
                SuperMercado
              </h2>
              <p className="text-[11px] text-emerald-400 font-medium">Punto de Venta POS</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Navegación Principal
          </div>

          {/* Home / Panel Welcome */}
          <button
            id="nav-inicio-btn"
            onClick={() => handleNavClick('inicio')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isNavActive('inicio')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{currentRole === 'admin' ? 'Panel de Inicio (Admin)' : 'Panel de Inicio (Cajero)'}</span>
          </button>

          {/* Módulo 6: Dashboard (Admin Only) */}
          {currentRole === 'admin' && (
            <button
              id="nav-dashboard-btn"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isNavActive('dashboard')
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">Dashboard</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                KPIs
              </span>
            </button>
          )}

          {/* Módulo 4: Ventas (Punto de Venta POS) */}
          <button
            id="nav-ventas-btn"
            onClick={() => handleNavClick('ventas')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isNavActive('ventas')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1 text-left">Ventas</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              POS
            </span>
          </button>

          {/* Módulo 2: Productos */}
          <button
            id="nav-productos-btn"
            onClick={() => handleNavClick('productos')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isNavActive('productos')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Productos</span>
          </button>

          {/* Módulo 3: Inventario */}
          <button
            id="nav-inventario-btn"
            onClick={() => handleNavClick('inventario')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isNavActive('inventario')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Boxes className="w-4 h-4 shrink-0" />
            <span>Inventario</span>
          </button>

          {/* Módulo 5: Reportes */}
          <button
            id="nav-reportes-btn"
            onClick={() => handleNavClick('reportes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isNavActive('reportes')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Reportes</span>
          </button>

          {/* Admin-only: Employees Management */}
          {currentRole === 'admin' && (
            <button
              id="nav-empleados-btn"
              onClick={() => handleNavClick('empleados')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isNavActive('empleados')
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Administrar Empleados</span>
            </button>
          )}

          {/* Profile link */}
          <button
            id="nav-perfil-btn"
            onClick={() => {
              onOpenProfile();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Mi Perfil</span>
          </button>

          {/* Info note regarding active modules */}
          <div className="pt-6">
            <div className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Módulo 4 Activo</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Punto de venta habilitado con cobros, cálculo de cambio, descuento e integración directa con inventario.
              </p>
            </div>
          </div>
        </nav>



        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={userAvatar}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                    currentRole === 'admin'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                  }`}
                >
                  {currentRole === 'admin' ? 'Administrador' : 'Cajero'}
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
