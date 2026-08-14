import React from 'react';
import { SupermarketStatus } from '../types';
import {
  ShieldAlert,
  Clock,
  XCircle,
  AlertTriangle,
  LogOut,
  Building2,
  PhoneCall,
  Mail,
} from 'lucide-react';

interface AccessBlockedScreenProps {
  status: SupermarketStatus;
  supermarketName?: string;
  onLogout: () => void;
  customMessage?: string;
}

export const AccessBlockedScreen: React.FC<AccessBlockedScreenProps> = ({
  status,
  supermarketName,
  onLogout,
  customMessage,
}) => {
  // Determine standard message according to Module 2 specifications
  let message = customMessage;
  let statusBadge = {
    label: 'Acceso Restringido',
    icon: ShieldAlert,
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    iconColor: 'text-rose-600',
  };

  if (!message) {
    switch (status) {
      case 'vencido':
        message = 'El período de acceso de este supermercado ha vencido. Contacte al administrador del servicio.';
        statusBadge = {
          label: 'Suscripción Vencida',
          icon: Clock,
          bgClass: 'bg-orange-50',
          textClass: 'text-orange-700',
          borderClass: 'border-orange-200',
          iconColor: 'text-orange-600',
        };
        break;
      case 'desactivado':
        message = 'El acceso de este supermercado se encuentra desactivado. Contacte al administrador del servicio.';
        statusBadge = {
          label: 'Acceso Desactivado',
          icon: XCircle,
          bgClass: 'bg-slate-100',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-300',
          iconColor: 'text-slate-600',
        };
        break;
      case 'pendiente':
        message = 'El registro de este supermercado está pendiente de autorización.';
        statusBadge = {
          label: 'Pendiente de Autorización',
          icon: Clock,
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-700',
          borderClass: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
        break;
      default:
        message = 'El acceso a este supermercado no se encuentra disponible actualmente.';
        break;
    }
  }

  const BadgeIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background aesthetic grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      {/* Glow effect */}
      <div className="absolute w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -bottom-20 -left-20 pointer-events-none" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center">
        {/* Top Header Strip */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />

        <div className="p-8 sm:p-10 space-y-6">
          {/* Main Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-50 border-2 border-rose-100 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-10 h-10 text-rose-600" />
          </div>

          {/* Title & Supermarket Name */}
          <div className="space-y-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bgClass} ${statusBadge.textClass} ${statusBadge.borderClass}`}
            >
              <BadgeIcon className={`w-3.5 h-3.5 ${statusBadge.iconColor}`} />
              {statusBadge.label}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Acceso no disponible
            </h1>

            {supermarketName && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{supermarketName}</span>
              </div>
            )}
          </div>

          {/* Required Official Notice Message */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed font-medium">
            {message}
          </div>

          {/* Help & Contact info banner */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-left space-y-2">
            <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
              ¿Necesita renovar o consultar su plan SaaS?
            </p>
            <p className="text-xs text-indigo-800 leading-normal">
              Comuníquese con el Super Administrador de la plataforma para reactivar o ampliar el período de acceso autorizado.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-indigo-900 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-indigo-600" /> soporte@saaspos.com
              </span>
              <span className="inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-indigo-600" /> +591 700 00000 (Bolivia)
              </span>
            </div>
          </div>

          {/* Back / Logout Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Volver a la pantalla de inicio de sesión
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="py-3 px-6 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600">
          Supermarket POS SaaS Cloud Platform • Bolivia
        </div>
      </div>
    </div>
  );
};
