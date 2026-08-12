import React, { useState } from 'react';
import { User, Employee } from '../types';
import { INITIAL_USERS, AVATAR_PRESETS } from '../data/mockData';
import {
  ShoppingBag,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  IdCard,
  Image as ImageIcon,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (
    data: Omit<Employee, 'id' | 'role' | 'status'> & { password: string }
  ) => { success: boolean; message: string };
  users?: (User & { password: string })[];
  employees?: Employee[];
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onRegisterUser,
  users,
  employees,
}) => {
  const usersList = users && users.length > 0 ? users : INITIAL_USERS;

  // View state: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration form states
  const [regFullName, setRegFullName] = useState('');
  const [regDocumentId, setRegDocumentId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regHireDate, setRegHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [regCargo, setRegCargo] = useState('');
  const [regPhoto, setRegPhoto] = useState(AVATAR_PRESETS[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!identifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor, ingrese su usuario/correo y contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanId = identifier.trim().toLowerCase();
      const foundUser = usersList.find(
        (u) =>
          (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
          u.password === loginPassword
      );

      if (foundUser) {
        const userStatus = foundUser.status || 'activo';

        if (userStatus === 'pendiente') {
          setErrorMessage(
            'Su registro fue recibido y se encuentra PENDIENTE DE AUTORIZACIÓN por el Administrador. Debe esperar a que su cuenta sea aprobada para ingresar.'
          );
          setIsLoading(false);
          return;
        }

        if (userStatus === 'rechazado') {
          setErrorMessage(
            'Su solicitud de registro fue RECHAZADA. No tiene acceso al sistema.'
          );
          setIsLoading(false);
          return;
        }

        if (userStatus === 'inactivo') {
          setErrorMessage('Su cuenta se encuentra INACTIVA. Comuníquese con el Administrador.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess({
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
          documentId: foundUser.documentId,
          password: foundUser.password,
          status: foundUser.status,
          phone: foundUser.phone,
          address: foundUser.address,
          birthDate: foundUser.birthDate,
          hireDate: foundUser.hireDate,
          cargo: foundUser.cargo,
        });
      } else {
        setErrorMessage('Credenciales incorrectas. Verifique su usuario y contraseña.');
        setIsLoading(false);
      }
    }, 400);
  };

  // Quick Login Demo
  const handleQuickLogin = (role: 'admin' | 'cajero') => {
    const demoUser = usersList.find((u) => u.role === role && (u.status === 'activo' || !u.status));
    if (demoUser) {
      setIdentifier(demoUser.username);
      setLoginPassword(demoUser.password);
      setErrorMessage('');
      setSuccessNotice('');
      setMode('login');
    }
  };

  // Validate Registration Form
  const validateRegistration = (): boolean => {
    const errors: Record<string, string> = {};

    if (!regFullName.trim()) errors.fullName = 'El nombre completo es obligatorio.';
    if (!regDocumentId.trim()) errors.documentId = 'El documento de identidad es obligatorio.';
    if (!regPhone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!regAddress.trim()) errors.address = 'La dirección de residencia es obligatoria.';
    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      errors.email = 'Ingrese un correo electrónico válido.';
    }
    if (!regBirthDate) errors.birthDate = 'La fecha de nacimiento es obligatoria.';
    if (!regHireDate) errors.hireDate = 'La fecha de contratación es obligatoria.';
    if (!regCargo.trim()) errors.cargo = 'El cargo es obligatorio.';
    if (!regPhoto.trim()) errors.photo = 'Seleccione una fotografía de perfil.';

    if (!regPassword.trim()) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (regPassword.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres.';
    }

    if (!regConfirmPassword.trim()) {
      errors.confirmPassword = 'Confirme la contraseña.';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    // Check Duplicate Registration
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanDoc = regDocumentId.trim();

    const isDuplicateUser = usersList.some(
      (u) => u.email.toLowerCase() === cleanEmail || u.documentId === cleanDoc
    );
    const isDuplicateEmployee = employees?.some(
      (e) => e.email.toLowerCase() === cleanEmail || e.documentId === cleanDoc
    );

    if (isDuplicateUser || isDuplicateEmployee) {
      errors.duplicate = 'El correo electrónico o documento de identidad ya se encuentra registrado.';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegistration()) return;

    if (onRegisterUser) {
      const result = onRegisterUser({
        fullName: regFullName.trim(),
        documentId: regDocumentId.trim(),
        phone: regPhone.trim(),
        address: regAddress.trim(),
        email: regEmail.trim().toLowerCase(),
        birthDate: regBirthDate,
        hireDate: regHireDate,
        cargo: regCargo.trim(),
        photo: regPhoto.trim(),
        password: regPassword,
      });

      if (result.success) {
        setSuccessNotice(
          'Su registro ha sido recibido exitosamente y se encuentra PENDIENTE DE AUTORIZACIÓN por el Administrador. Debe esperar a que su cuenta sea aprobada para ingresar al sistema.'
        );
        // Reset registration fields
        setRegFullName('');
        setRegDocumentId('');
        setRegPhone('');
        setRegAddress('');
        setRegEmail('');
        setRegBirthDate('');
        setRegCargo('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegErrors({});
        // Switch to login tab to see notice
        setMode('login');
      } else {
        setRegErrors({ general: result.message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-y-auto font-sans py-8">
      <div className="w-full max-w-md my-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200/60 mb-2.5">
            <ShoppingBag className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SuperMercado Express</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sistema de Ventas — Módulo de Control de Acceso</p>
        </div>

        {/* Card Switcher Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Mode Navigation Header */}
          <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setRegErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrarse</span>
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* SUCCESS NOTICE (When registration submitted) */}
            {successNotice && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900 text-xs font-medium animate-fadeIn">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 mb-1">¡Registro Recibido!</p>
                  <p className="leading-relaxed">{successNotice}</p>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE (Login Error) */}
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@supermercado.com o admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>

                {/* Quick Access Demo Accounts */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold text-center mb-2.5">
                    Acceso rápido de prueba:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin')}
                      className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Administrador</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('cajero')}
                      className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cajero</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTRATION FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-slate-600 mb-2">
                  <p className="font-bold text-emerald-950 mb-0.5">Solicitud de Registro de Usuario</p>
                  <p className="text-[11px]">
                    Complete el formulario. Su cuenta quedará en <strong>Estado Pendiente</strong> hasta que el Administrador la revise y asigne su rol.
                  </p>
                </div>

                {regErrors.duplicate && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{regErrors.duplicate}</span>
                  </div>
                )}

                {regErrors.general && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{regErrors.general}</span>
                  </div>
                )}

                {/* Nombre Completo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ej: Laura Sofía Torres Peña"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {regErrors.fullName && <p className="text-[11px] text-rose-600 mt-0.5">{regErrors.fullName}</p>}
                </div>

                {/* Documento ID & Teléfono */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Documento ID *
                    </label>
                    <input
                      type="text"
                      value={regDocumentId}
                      onChange={(e) => setRegDocumentId(e.target.value)}
                      placeholder="1098765432"
                      className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.documentId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {regErrors.documentId && <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.documentId}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+591 712 34567"
                      className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {regErrors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.phone}</p>}
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@supermercado.com"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {regErrors.email && <p className="text-[11px] text-rose-600 mt-0.5">{regErrors.email}</p>}
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección de Residencia *
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Calle 20 #15-30, Barrio Centro"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {regErrors.address && <p className="text-[11px] text-rose-600 mt-0.5">{regErrors.address}</p>}
                </div>

                {/* Fecha Nacimiento & Fecha Contratación */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fecha Nacimiento *
                    </label>
                    <input
                      type="date"
                      value={regBirthDate}
                      onChange={(e) => setRegBirthDate(e.target.value)}
                      className={`w-full px-2.5 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none ${
                        regErrors.birthDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {regErrors.birthDate && <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.birthDate}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fecha Ingreso *
                    </label>
                    <input
                      type="date"
                      value={regHireDate}
                      onChange={(e) => setRegHireDate(e.target.value)}
                      className={`w-full px-2.5 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none ${
                        regErrors.hireDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {regErrors.hireDate && <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.hireDate}</p>}
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo / Puesto Solicitado *
                  </label>
                  <input
                    type="text"
                    value={regCargo}
                    onChange={(e) => setRegCargo(e.target.value)}
                    placeholder="Ej: Auxiliar de Caja, Atención al Cliente"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.cargo ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {regErrors.cargo && <p className="text-[11px] text-rose-600 mt-0.5">{regErrors.cargo}</p>}
                </div>

                {/* Fotografía Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fotografía de Perfil *
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-1.5">
                    <img
                      src={regPhoto}
                      alt="Avatar seleccionado"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
                    />
                    <input
                      type="url"
                      value={regPhoto}
                      onChange={(e) => setRegPhoto(e.target.value)}
                      placeholder="URL de foto o elige abajo"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVATAR_PRESETS.slice(0, 6).map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegPhoto(presetUrl)}
                        className={`relative rounded-full p-0.5 border-2 cursor-pointer transition-all ${
                          regPhoto === presetUrl ? 'border-emerald-500 scale-105' : 'border-transparent'
                        }`}
                      >
                        <img src={presetUrl} alt="Preset" className="w-7 h-7 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contraseña & Confirmar Contraseña */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-3 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none ${
                          regErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.password && <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirmar *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-3 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none ${
                          regErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{regErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <button
                  id="btn-enviar-registro"
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 text-xs uppercase tracking-wider"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enviar Solicitud de Registro</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} SuperMercado Express — Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

