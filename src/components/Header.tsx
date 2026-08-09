import React from 'react';
import { UserRole } from '../types';
import { Menu, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName: string;
  userRole: UserRole;
  userAvatar: string;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  userName,
  userRole,
  userAvatar,
  onOpenMobileSidebar,
  onLogout,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            SuperMercado Express — Sistema de Ventas
          </p>
        </div>
      </div>

      {/* Right side: User Badge + Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 mr-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistema Activo
          </span>
          <span className="text-slate-300">|</span>
          <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all cursor-pointer"
        >
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
          />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
            <div className="flex items-center gap-1 text-[10px]">
              {userRole === 'admin' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 font-bold uppercase tracking-wider">Administrador</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold uppercase tracking-wider">Cajero</span>
                </>
              )}
            </div>
          </div>
        </button>

        <button
          id="header-logout-btn"
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
