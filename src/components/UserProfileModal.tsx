import React, { useState } from 'react';
import { User } from '../types';
import {
  X,
  ShieldCheck,
  UserCheck,
  Mail,
  IdCard,
  Calendar,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => { success: boolean; message: string };
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Form password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error & Success feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !user) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleModalClose = () => {
    resetForm();
    setActiveTab('info');
    onClose();
  };

  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Validar campos no vacíos
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Por favor complete todos los campos requeridos.');
      return;
    }

    // 2. Validar que la contraseña actual sea correcta
    if (user.password && currentPassword !== user.password) {
      setErrorMessage('La contraseña actual ingresada es incorrecta.');
      return;
    }

    // 3. Validar que la nueva contraseña sea diferente de la actual
    if (currentPassword === newPassword) {
      setErrorMessage('La nueva contraseña debe ser diferente de la contraseña actual.');
      return;
    }

    // 4. Validar que la nueva contraseña y la confirmación coincidan exactamente
    if (newPassword !== confirmPassword) {
      setErrorMessage('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    // Ejecutar el cambio de contraseña
    const result = onChangePassword(currentPassword, newPassword);

    if (result.success) {
      setSuccessMessage('¡Su contraseña ha sido cambiada exitosamente!');
      // Despejar formulario tras el cambio correcto
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      setErrorMessage(result.message || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative bg-slate-50 p-5 border-b border-slate-200 text-center shrink-0">
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md mx-auto mb-2"
          />

          <h3 className="text-lg font-bold text-slate-800 leading-tight">{user.name}</h3>

          <div className="mt-1.5 inline-flex items-center gap-1.5">
            {user.role === 'admin' ? (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Administrador
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Cajero(a)
              </span>
            )}
          </div>

          {/* Selector de pestañas */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl mt-4 text-xs font-bold border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('info');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Información</span>
            </button>
            <button
              id="tab-change-password"
              onClick={() => {
                setActiveTab('password');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'password'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto p-5 text-sm space-y-4">
          {activeTab === 'info' ? (
            <div className="space-y-3.5">
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

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Estado de la Cuenta:
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Activo
                </span>
              </div>

              {/* Acceso directo a cambio de clave */}
              <div className="pt-2">
                <button
                  id="btn-open-password-form"
                  onClick={() => setActiveTab('password')}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 hover:border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Cambiar mi contraseña de acceso</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-slate-600">
                <p className="font-semibold text-emerald-900 mb-0.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Cambio seguro de credencial
                </p>
                <p className="text-[11px] text-slate-500">
                  Completa los tres campos a continuación para actualizar tu contraseña.
                </p>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-medium animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPasswordChange} className="space-y-3.5">
                {/* 1. Contraseña Actual */}
                <div>
                  <label
                    htmlFor="current-password"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    1. Contraseña Actual <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      placeholder="Contraseña actual"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Nueva Contraseña */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    2. Nueva Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      placeholder="Nueva contraseña"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirmar Nueva Contraseña */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    3. Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submisión del formulario */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('info');
                    }}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    id="submit-change-password-btn"
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-200/60 cursor-pointer flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Guardar Contraseña</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={handleModalClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

