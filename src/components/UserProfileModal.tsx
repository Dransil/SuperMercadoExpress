import React from 'react';
import { User } from '../types';
import { X, ShieldCheck, UserCheck, Mail, IdCard, Calendar, CheckCircle2 } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header Banner */}
        <div className="relative bg-slate-50 p-6 border-b border-slate-200 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md mx-auto mb-3"
          />

          <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>

          <div className="mt-2 inline-flex items-center gap-1.5">
            {user.role === 'admin' ? (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Administrador
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Cajero(a)
              </span>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="p-6 space-y-3.5 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Correo:
            </span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <IdCard className="w-4 h-4 text-slate-400" /> Documento ID:
            </span>
            <span className="font-mono text-slate-800 font-bold">{user.documentId}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Usuario ID:
            </span>
            <span className="font-mono text-slate-500 text-xs">{user.id}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Estado de la Cuenta:
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Activo
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-200/60"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
