import React, { useState, useMemo } from 'react';
import { Supermarket, User } from '../types';
import {
  checkUsernameAvailability,
  checkEmailAvailability,
  checkSupermarketAvailability,
} from '../utils/validation';
import {
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface SupermarketRegisterFormProps {
  existingUsers: User[];
  existingSupermarkets: Supermarket[];
  onRegisterSupermarket: (
    newSupermarket: Supermarket,
    adminPassword: string,
    adminUsername?: string
  ) => void;
  onBackToLogin: () => void;
}

export const SupermarketRegisterForm: React.FC<SupermarketRegisterFormProps> = ({
  existingUsers,
  existingSupermarkets,
  onRegisterSupermarket,
  onBackToLogin,
}) => {
  // Supermarket Fields
  const [supermarketName, setSupermarketName] = useState('');
  const [supermarketAddress, setSupermarketAddress] = useState('');
  const [supermarketPhone, setSupermarketPhone] = useState('');
  const [supermarketEmail, setSupermarketEmail] = useState('');

  // Admin Fields
  const [adminFullName, setAdminFullName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminDocumentId, setAdminDocumentId] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminBirthDate, setAdminBirthDate] = useState('');
  const [adminHireDate, setAdminHireDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registeredSmName, setRegisteredSmName] = useState('');

  // Real-time uniqueness validation
  const usernameCheck = useMemo(() => {
    if (!adminUsername.trim()) return null;
    return checkUsernameAvailability(adminUsername, existingUsers);
  }, [adminUsername, existingUsers]);

  const adminEmailCheck = useMemo(() => {
    if (!adminEmail.trim()) return null;
    return checkEmailAvailability(adminEmail, existingUsers);
  }, [adminEmail, existingUsers]);

  const smValidation = useMemo(() => {
    return checkSupermarketAvailability(supermarketName, supermarketEmail, existingSupermarkets);
  }, [supermarketName, supermarketEmail, existingSupermarkets]);

  // Auto-generate username from email if not filled
  const handleAdminEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAdminEmail(val);
    if (!adminUsername && val.includes('@')) {
      const suggested = val.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      setAdminUsername(suggested);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations: Supermarket
    if (!supermarketName.trim()) {
      setErrorMessage('El nombre del supermercado es obligatorio.');
      return;
    }
    if (!supermarketAddress.trim()) {
      setErrorMessage('La dirección del supermercado es obligatoria.');
      return;
    }
    if (!supermarketPhone.trim()) {
      setErrorMessage('El teléfono del supermercado es obligatorio.');
      return;
    }
    if (!supermarketEmail.trim()) {
      setErrorMessage('Ingresa un correo electrónico para el supermercado.');
      return;
    }

    if (!smValidation.nameAvailable.available && supermarketName.trim()) {
      setErrorMessage(smValidation.nameAvailable.message);
      return;
    }
    if (!smValidation.emailAvailable.available && supermarketEmail.trim()) {
      setErrorMessage(smValidation.emailAvailable.message);
      return;
    }

    // Validations: Admin
    if (!adminFullName.trim()) {
      setErrorMessage('El nombre completo del Administrador es obligatorio.');
      return;
    }
    if (!adminUsername.trim()) {
      setErrorMessage('El nombre de usuario del Administrador es obligatorio.');
      return;
    }
    if (usernameCheck && !usernameCheck.available) {
      setErrorMessage(usernameCheck.message);
      return;
    }
    if (!adminDocumentId.trim()) {
      setErrorMessage('El documento de identidad del Administrador es obligatorio.');
      return;
    }
    if (!adminPhone.trim()) {
      setErrorMessage('El teléfono del Administrador es obligatorio.');
      return;
    }
    if (!adminAddress.trim()) {
      setErrorMessage('La dirección del Administrador es obligatoria.');
      return;
    }
    if (!adminEmail.trim()) {
      setErrorMessage('Ingresa un correo electrónico válido para el Administrador.');
      return;
    }
    if (adminEmailCheck && !adminEmailCheck.available) {
      setErrorMessage(adminEmailCheck.message);
      return;
    }
    if (!adminBirthDate) {
      setErrorMessage('La fecha de nacimiento del Administrador es obligatoria.');
      return;
    }
    if (!adminHireDate) {
      setErrorMessage('La fecha de contratación es obligatoria.');
      return;
    }

    // Check duplicate admin doc
    const isDocDuplicate = existingUsers.some(
      (u) => u.documentId.trim() === adminDocumentId.trim()
    );
    if (isDocDuplicate) {
      setErrorMessage(
        'El documento de identidad del Administrador ya se encuentra registrado en el sistema.'
      );
      return;
    }

    // Passwords
    if (!adminPassword || adminPassword.length < 4) {
      setErrorMessage('La contraseña debe contener al menos 4 caracteres.');
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    const newSupermarketId = `sm-${Date.now()}`;
    const newAdminId = `u-admin-${Date.now()}`;

    const newSupermarket: Supermarket = {
      id: newSupermarketId,
      name: supermarketName.trim(),
      address: supermarketAddress.trim(),
      phone: supermarketPhone.trim(),
      email: supermarketEmail.trim().toLowerCase(),
      status: 'pendiente',
      registrationDate: new Date().toISOString().split('T')[0],
      adminId: newAdminId,
      adminName: adminFullName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminDocumentId: adminDocumentId.trim(),
      adminPhone: adminPhone.trim(),
      adminAddress: adminAddress.trim(),
      adminBirthDate: adminBirthDate,
      adminHireDate: adminHireDate,
      adminPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };

    onRegisterSupermarket(newSupermarket, adminPassword, adminUsername.trim().toLowerCase());
    setRegisteredSmName(supermarketName.trim());
    setIsSubmittedSuccess(true);
  };

  // SUCCESS STATE VIEW
  if (isSubmittedSuccess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-xl w-full text-center space-y-6 animate-fadeIn text-slate-100">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Solicitud Pendiente de Revisión</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            ¡Supermercado Registrado con Éxito!
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            La solicitud de registro para <strong className="text-white">{registeredSmName}</strong> y su Administrador (<strong className="text-white">{adminFullName}</strong>) ha sido enviada exitosamente.
          </p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Paso Siguiente: Autorización del Super Administrador</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Por seguridad, el <strong className="text-slate-200">Super Administrador</strong> de la plataforma revisará la solicitud y activará la cuenta. Una vez aprobada, podrás iniciar sesión con tu correo: <strong className="text-slate-200">{adminEmail}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl w-full space-y-6 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registro de Nuevo Supermercado</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Registrar mi Supermercado
          </h2>
          <p className="text-xs text-slate-400">
            Ingresa los datos de tu supermercado y del Administrador responsable. La solicitud quedará pendiente de aprobación.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: DATOS DEL SUPERMERCADO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>1. Datos del Supermercado</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del supermercado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Nombre del Supermercado <span className="text-rose-400">*</span>
                </label>
                {supermarketName.trim() && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      smValidation.nameAvailable.available
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {smValidation.nameAvailable.available ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    )}
                    {smValidation.nameAvailable.available ? 'Disponible' : 'Ya registrado'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Supermercado El Ahorro"
                  value={supermarketName}
                  onChange={(e) => setSupermarketName(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    supermarketName.trim() && !smValidation.nameAvailable.available
                      ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-800 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Correo del supermercado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Correo Electrónico Comercial <span className="text-rose-400">*</span>
                </label>
                {supermarketEmail.trim() && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      smValidation.emailAvailable.available
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {smValidation.emailAvailable.available ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    )}
                    {smValidation.emailAvailable.available ? 'Disponible' : 'Ya en uso'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="contacto@supermercado.com"
                  value={supermarketEmail}
                  onChange={(e) => setSupermarketEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    supermarketEmail.trim() && !smValidation.emailAvailable.available
                      ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-800 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Teléfono del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Teléfono del Supermercado <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+591 70000000"
                  value={supermarketPhone}
                  onChange={(e) => setSupermarketPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Dirección del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Dirección Comercial <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Av. Principal #123, Zona Centro"
                  value={supermarketAddress}
                  onChange={(e) => setSupermarketAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL ADMINISTRADOR */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2. Datos del Administrador Asignado</span>
            </div>
            <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              Rol: Administrador
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              La fotografía de perfil del administrador podrá ser personalizada y editada posteriormente desde su perfil de usuario al iniciar sesión.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nombre Completo del Administrador <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Mario Andrés Rojas"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Nombre de Usuario */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Nombre de Usuario (Login) <span className="text-rose-400">*</span>
                </label>
                {usernameCheck && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      usernameCheck.available
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {usernameCheck.available ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    )}
                    {usernameCheck.available ? 'Disponible' : 'Ya en uso'}
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: mrojas"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    usernameCheck && !usernameCheck.available
                      ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-800 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {usernameCheck && !usernameCheck.available && (
                <p className="text-[10px] text-rose-400 mt-1 font-semibold">{usernameCheck.message}</p>
              )}
            </div>

            {/* Documento de Identidad */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Documento de Identidad (CI / DNI) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: 10482910"
                  value={adminDocumentId}
                  onChange={(e) => setAdminDocumentId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Correo Electrónico del Admin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Correo Electrónico Personal <span className="text-rose-400">*</span>
                </label>
                {adminEmailCheck && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      adminEmailCheck.available
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {adminEmailCheck.available ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    )}
                    {adminEmailCheck.available ? 'Disponible' : 'Ya en uso'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@personal.com"
                  value={adminEmail}
                  onChange={handleAdminEmailChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    adminEmailCheck && !adminEmailCheck.available
                      ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-800 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {adminEmailCheck && !adminEmailCheck.available && (
                <p className="text-[10px] text-rose-400 mt-1 font-semibold">{adminEmailCheck.message}</p>
              )}
            </div>

            {/* Teléfono del Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Teléfono Personal del Administrador <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+591 71234567"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Dirección del Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Dirección de Residencia <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Calle Los Álamos #456"
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Fecha de Nacimiento <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={adminBirthDate}
                  onChange={(e) => setAdminBirthDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Fecha de Contratación */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Fecha de Contratación / Inicio <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={adminHireDate}
                  onChange={(e) => setAdminHireDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Contraseña de Acceso <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Confirmar Contraseña <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la contraseña"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notice of Approval Requirement */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Aviso de Revisión y Estado Inicial</p>
            <p className="mt-0.5 leading-relaxed text-amber-200/90">
              Al enviar este formulario, tu supermercado y el usuario Administrador quedarán registrados en estado <strong>PENDIENTE</strong>. Podrás ingresar al sistema una vez que el Super Administrador revise y autorice tu solicitud.
            </p>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800"
          >
            Cancelar y Volver
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-700 active:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enviar Solicitud de Registro</span>
          </button>
        </div>
      </form>
    </div>
  );
};
