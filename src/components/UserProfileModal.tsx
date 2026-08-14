import React, { useState, useEffect, useMemo } from 'react';
import { User, Employee } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import {
  checkUsernameAvailability,
  checkEmailAvailability,
} from '../utils/validation';
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
  Crown,
  Edit3,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Image as ImageIcon,
  Save,
  Sparkles,
} from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => { success: boolean; message: string };
  onUpdateProfile?: (
    updatedUser: User
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  users?: (User & { password?: string })[];
  employees?: Employee[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onChangePassword,
  onUpdateProfile,
  users = [],
  employees = [],
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'password'>('info');

  // Edit Profile Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cargo, setCargo] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  // Live uniqueness checks (excluding current user)
  const usernameCheck = useMemo(() => {
    if (!username.trim() || !user) return null;
    return checkUsernameAvailability(username, users, employees, user.id);
  }, [username, users, employees, user]);

  const emailCheck = useMemo(() => {
    if (!email.trim() || !user) return null;
    return checkEmailAvailability(email, users, employees, user.id);
  }, [email, users, employees, user]);

  // Form password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form fields whenever the active user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setDocumentId(user.documentId || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCargo(user.cargo || (user.role === 'superadmin' ? 'Super Administrador Plataforma' : user.role === 'admin' ? 'Administrador General' : 'Cajero(a)'));
      setBirthDate(user.birthDate || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const resetForm = () => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setDocumentId(user.documentId || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCargo(user.cargo || '');
      setBirthDate(user.birthDate || '');
      setAvatar(user.avatar || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowAvatarPresets(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleModalClose = () => {
    resetForm();
    setActiveTab('info');
    onClose();
  };

  // Profile Edit Submission
  const handleSubmitProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('El nombre completo es obligatorio.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('El correo electrónico es obligatorio.');
      return;
    }
    if (emailCheck && !emailCheck.available) {
      setErrorMessage(emailCheck.message);
      return;
    }
    if (username.trim() && usernameCheck && !usernameCheck.available) {
      setErrorMessage(usernameCheck.message);
      return;
    }
    if (!documentId.trim()) {
      setErrorMessage('El documento de identidad es obligatorio.');
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      username: username.trim().toLowerCase() || user.username,
      email: email.trim().toLowerCase(),
      documentId: documentId.trim(),
      phone: phone.trim(),
      address: address.trim(),
      cargo: cargo.trim(),
      birthDate: birthDate.trim(),
      avatar: avatar.trim() || user.avatar,
    };

    setIsSubmitting(true);
    try {
      if (onUpdateProfile) {
        const res = await onUpdateProfile(updatedUser);
        if (res.success) {
          setSuccessMessage(res.message || 'Perfil actualizado correctamente.');
          setTimeout(() => {
            setActiveTab('info');
            setSuccessMessage('');
          }, 1200);
        } else {
          setErrorMessage(res.message || 'Error al actualizar el perfil.');
        }
      } else {
        setSuccessMessage('Perfil actualizado correctamente.');
        setTimeout(() => {
          setActiveTab('info');
          setSuccessMessage('');
        }, 1200);
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al actualizar el perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Change Submission
  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Por favor complete todos los campos requeridos.');
      return;
    }

    if (user.password && currentPassword !== user.password) {
      setErrorMessage('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('La nueva contraseña debe ser diferente de la contraseña actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    const result = onChangePassword(currentPassword, newPassword);

    if (result.success) {
      setSuccessMessage('¡Su contraseña ha sido cambiada exitosamente!');
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-b from-slate-50 to-slate-100/70 p-5 sm:p-6 border-b border-slate-200 text-center shrink-0">
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative inline-block mx-auto mb-2.5">
            <img
              src={user.avatar || avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user.name}
              className={`w-20 h-20 rounded-2xl object-cover ring-4 shadow-md mx-auto ${
                user.role === 'superadmin'
                  ? 'ring-amber-400/40'
                  : user.role === 'admin'
                  ? 'ring-blue-400/30'
                  : 'ring-emerald-500/30'
              }`}
            />
            {user.role === 'superadmin' && (
              <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white p-1 rounded-lg shadow-sm">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 leading-tight">{user.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {user.cargo || (user.role === 'superadmin' ? 'Super Administrador Plataforma' : user.role === 'admin' ? 'Administrador General' : 'Cajero(a)')}
          </p>

          {/* User Role Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5">
            {user.role === 'superadmin' ? (
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Super Administrador
              </span>
            ) : user.role === 'admin' ? (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Administrador
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Cajero(a)
              </span>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl mt-4 text-xs font-bold border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('info');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Información</span>
            </button>

            <button
              id="tab-edit-profile"
              onClick={() => {
                setActiveTab('edit');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Editar Perfil</span>
            </button>

            <button
              id="tab-change-password"
              onClick={() => {
                setActiveTab('password');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'password'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contraseña</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 text-sm space-y-4">
          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-emerald-800 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: Información General */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Correo Electrónico:
                </span>
                <span className="font-semibold text-slate-800 break-all text-right">{user.email}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" /> Nombre de Usuario:
                </span>
                <span className="font-mono text-slate-800 font-bold">@{user.username || user.email.split('@')[0]}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-slate-400" /> Documento ID (CI/DNI):
                </span>
                <span className="font-mono text-slate-800 font-bold">{user.documentId || 'No asignado'}</span>
              </div>

              {user.cargo && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Cargo:
                  </span>
                  <span className="font-semibold text-slate-800">{user.cargo}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Teléfono:
                  </span>
                  <span className="font-semibold text-slate-800">{user.phone}</span>
                </div>
              )}

              {user.address && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Dirección:
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{user.address}</span>
                </div>
              )}

              {user.birthDate && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Fecha Nacimiento:
                  </span>
                  <span className="font-semibold text-slate-800">{user.birthDate}</span>
                </div>
              )}

              {user.supermarketName && user.role !== 'superadmin' && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Supermercado:
                  </span>
                  <span className="font-bold text-slate-800 text-right">{user.supermarketName}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Estado de la Cuenta:
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {user.status === 'activo' || !user.status ? 'Activo' : user.status}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-edit-profile"
                  onClick={() => {
                    setActiveTab('edit');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Editar Perfil</span>
                </button>

                <button
                  id="btn-open-password-form"
                  onClick={() => {
                    setActiveTab('password');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Cambiar Clave</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Formulario de Edición de Perfil */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSubmitProfileEdit} className="space-y-4">
              <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Edición de Datos de Perfil
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Actualiza tu información personal. Los cambios se guardarán y sincronizarán en la base de datos.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto de Perfil / Avatar
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar || user.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Elegir avatar predeterminado"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Presets</span>
                  </button>
                </div>

                {/* Avatar Presets Grid */}
                {showAvatarPresets && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-6 gap-2 animate-fadeIn">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(presetUrl);
                          setShowAvatarPresets(false);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          avatar === presetUrl ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-transparent hover:opacity-80'
                        }`}
                      >
                        <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nombre Completo & Usuario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Emanuel Taquichiri"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Nombre de Usuario
                    </label>
                    {username.trim() && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 ${
                          usernameCheck?.available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {usernameCheck?.available ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {usernameCheck?.available ? 'Disponible' : 'En uso'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ej. emanuel"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      username.trim() && !usernameCheck?.available
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Correo & Documento ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Correo Electrónico <span className="text-rose-500">*</span>
                    </label>
                    {email.trim() && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 ${
                          emailCheck?.available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {emailCheck?.available ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {emailCheck?.available ? 'Disponible' : 'En uso'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                      email.trim() && !emailCheck?.available
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Documento ID (CI/DNI) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Teléfono & Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono / Celular
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +591 70000000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo / Puesto
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej. Administrador General"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Dirección & Fecha Nacimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Av. Principal #123"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('info');
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-edit-profile-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-200/60 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Cambio de Contraseña */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-xs text-slate-600">
                <p className="font-semibold text-emerald-900 mb-0.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Cambio seguro de credencial
                </p>
                <p className="text-[11px] text-slate-500">
                  Completa los tres campos a continuación para actualizar tu contraseña.
                </p>
              </div>

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
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-2xs"
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
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-2xs"
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
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-2xs"
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

                {/* Submit */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('info');
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
