import React, { useState } from 'react';
import { Supermarket, User } from '../types';
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
} from 'lucide-react';

interface SupermarketRegisterFormProps {
  existingUsers: User[];
  existingSupermarkets: Supermarket[];
  onRegisterSupermarket: (newSupermarket: Supermarket, adminPassword: string) => void;
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

  // Email format validator
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    if (!supermarketEmail.trim() || !isValidEmail(supermarketEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido para el supermercado.');
      return;
    }

    // Check duplicate supermarket
    const isSmDuplicate = existingSupermarkets.some(
      (s) =>
        s.name.toLowerCase().trim() === supermarketName.toLowerCase().trim() ||
        s.email.toLowerCase().trim() === supermarketEmail.toLowerCase().trim()
    );
    if (isSmDuplicate) {
      setErrorMessage('Ya existe un supermercado registrado con ese nombre o correo.');
      return;
    }

    // Validations: Admin
    if (!adminFullName.trim()) {
      setErrorMessage('El nombre completo del Administrador es obligatorio.');
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
    if (!adminEmail.trim() || !isValidEmail(adminEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido para el Administrador.');
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

    // Check duplicate admin email or doc
    const isUserDuplicate = existingUsers.some(
      (u) =>
        u.email.toLowerCase().trim() === adminEmail.toLowerCase().trim() ||
        u.documentId.trim() === adminDocumentId.trim()
    );
    if (isUserDuplicate) {
      setErrorMessage(
        'El correo o documento de identidad del Administrador ya se encuentra registrado en el sistema.'
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

    onRegisterSupermarket(newSupermarket, adminPassword);
    setRegisteredSmName(supermarketName.trim());
    setIsSubmittedSuccess(true);
  };

  // SUCCESS STATE VIEW
  if (isSubmittedSuccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl max-w-xl w-full text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Solicitud Pendiente de Revisión</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            ¡Supermercado Registrado con Éxito!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            La solicitud de registro para <strong className="text-slate-900">{registeredSmName}</strong> y su Administrador (<strong className="text-slate-900">{adminFullName}</strong>) ha sido enviada exitosamente.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Paso Siguiente: Autorización del Super Administrador</span>
          </div>
          <p className="leading-relaxed">
            Por seguridad, el <strong>Super Administrador</strong> de la plataforma revisará la solicitud y activará la cuenta. Una vez aprobada, podrás iniciar sesión con tu correo: <strong className="text-slate-800">{adminEmail}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Módulo 1: Registro SaaS de Supermercado</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registrar mi Supermercado
          </h2>
          <p className="text-xs text-slate-500">
            Ingresa los datos de tu supermercado y del Administrador responsable. La solicitud quedará pendiente de aprobación.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: DATOS DEL SUPERMERCADO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider pb-1 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>1. Datos del Supermercado</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Supermercado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Supermercado El Ahorro"
                  value={supermarketName}
                  onChange={(e) => setSupermarketName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Correo del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico Comercial <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="contacto@supermercado.com"
                  value={supermarketEmail}
                  onChange={(e) => setSupermarketEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Teléfono del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono del Supermercado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+591 70000000"
                  value={supermarketPhone}
                  onChange={(e) => setSupermarketPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Dirección del supermercado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dirección Comercial <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Av. Principal #123, Zona Centro"
                  value={supermarketAddress}
                  onChange={(e) => setSupermarketAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL ADMINISTRADOR */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Datos del Administrador Asignado</span>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              Rol fijado: Administrador
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <p className="text-[11px] leading-relaxed">
              La fotografía de perfil del administrador podrá ser personalizada y editada posteriormente desde su perfil de usuario al iniciar sesión.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo del Administrador <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Mario Andrés Rojas"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Documento de Identidad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Documento de Identidad (CI / DNI) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: 10482910"
                  value={adminDocumentId}
                  onChange={(e) => setAdminDocumentId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Correo Electrónico del Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico Personal (Usuario de Login) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@personal.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Teléfono del Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono Personal del Administrador <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+591 71234567"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Dirección del Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dirección de Residencia <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Calle Los Álamos #456"
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Nacimiento <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={adminBirthDate}
                  onChange={(e) => setAdminBirthDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Fecha de Contratación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Contratación / Inicio <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={adminHireDate}
                  onChange={(e) => setAdminHireDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña de Acceso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirmar Contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la contraseña"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notice of Approval Requirement */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">Aviso de Revisión y Estado Inicial</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              Al enviar este formulario, tu supermercado y el usuario Administrador quedarán registrados en estado <strong>PENDIENTE</strong>. Podrás ingresar al sistema una vez que el Super Administrador revise y autorice tu solicitud.
            </p>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar y Volver
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enviar Solicitud de Registro</span>
          </button>
        </div>
      </form>
    </div>
  );
};
