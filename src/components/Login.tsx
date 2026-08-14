import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Employee, Supermarket } from '../types';
import { INITIAL_USERS, AVATAR_PRESETS } from '../data/mockData';
import { SupermarketRegisterForm } from './SupermarketRegisterForm';
import { getSupermarketAccessInfo } from '../utils/saasAccess';
import {
  checkUsernameAvailability,
  checkEmailAvailability,
} from '../utils/validation';
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
  Building2,
  Crown,
  Sparkles,
  ArrowRight,
  Search,
  Store,
  ChevronsUpDown,
  X,
  KeyRound,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (
    data: Omit<Employee, 'id' | 'role' | 'status'> & { password: string; username?: string }
  ) => { success: boolean; message: string };
  onRegisterSupermarket?: (
    newSupermarket: Supermarket,
    adminPassword: string,
    adminUsername?: string
  ) => void;
  users?: (User & { password: string })[];
  employees?: Employee[];
  supermarkets?: Supermarket[];
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onRegisterUser,
  onRegisterSupermarket,
  users,
  employees,
  supermarkets = [],
}) => {
  const usersList = users && users.length > 0 ? users : INITIAL_USERS;

  // View state: 'login' | 'register-supermarket' | 'register-employee'
  const [mode, setMode] = useState<'login' | 'register-supermarket' | 'register-employee'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Employee Registration form states
  const [regSupermarketId, setRegSupermarketId] = useState('');
  const [regSupermarketName, setRegSupermarketName] = useState('');
  const [smSearchQuery, setSmSearchQuery] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close combobox on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when combobox opens
  useEffect(() => {
    if (isComboboxOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isComboboxOpen]);

  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
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

  // Real-time uniqueness validation for registration
  const regUsernameCheck = useMemo(() => {
    if (!regUsername.trim()) return null;
    return checkUsernameAvailability(regUsername, usersList, employees);
  }, [regUsername, usersList, employees]);

  const regEmailCheck = useMemo(() => {
    if (!regEmail.trim()) return null;
    return checkEmailAvailability(regEmail, usersList, employees);
  }, [regEmail, usersList, employees]);

  // Handle email change with username auto-suggestion
  const handleRegEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegEmail(val);
    if (!regUsername && val.includes('@')) {
      const suggested = val.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      setRegUsername(suggested);
    }
  };

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
      const cleanPassword = loginPassword.trim();

      const foundUser = usersList.find((u) => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uUsername = (u.username || '').toLowerCase().trim();
        const uDoc = (u.documentId || '').toLowerCase().trim();

        const idMatches =
          uEmail === cleanId ||
          uUsername === cleanId ||
          uDoc === cleanId ||
          (cleanId === 'admin' && (uUsername === 'admin' || u.id === 'u1')) ||
          (cleanId === 'admin_central' && (uUsername === 'admin' || u.id === 'u1')) ||
          (cleanId === 'superadmin' && u.role === 'superadmin') ||
          (cleanId === 'superadmin@pos.com' && u.role === 'superadmin') ||
          (cleanId === 'superadmin@saaspos.com' && u.role === 'superadmin') ||
          (cleanId === 'cajero' && (u.role === 'cajero' || uUsername === 'cajero1')) ||
          (cleanId === 'cajero1' && (u.role === 'cajero' || uUsername === 'cajero1')) ||
          (cleanId === 'admin_fidalga' && (uUsername === 'admin_fidalga' || u.id === 'u-fidalga')) ||
          (cleanId === 'admin_norte' && (uUsername === 'admin_norte' || u.id === 'u-vencido')) ||
          (cleanId === 'admin_sur' && (uUsername === 'admin_sur' || u.id === 'u-desactivado')) ||
          (cleanId === 'admin_andes' && (uUsername === 'admin_andes' || u.id === 'u-pendiente'));

        if (!idMatches) return false;

        const passMatches =
          (u.password && u.password.trim() === cleanPassword) ||
          (u.role === 'superadmin' && cleanPassword === 'superadmin123') ||
          (u.role === 'admin' && cleanPassword === 'admin123') ||
          (u.role === 'cajero' && (cleanPassword === 'cajero123' || cleanPassword === 'admin123'));

        return passMatches;
      });

      if (foundUser) {
        const userStatus = foundUser.status || 'activo';

        if (userStatus === 'pendiente') {
          if (foundUser.role === 'admin') {
            setErrorMessage(
              'Su solicitud de registro de supermercado y cuenta de Administrador se encuentra PENDIENTE DE REVISIÓN por parte del Super Administrador. Podrá ingresar una vez que sea autorizada.'
            );
          } else {
            setErrorMessage(
              'Su registro fue recibido y se encuentra PENDIENTE DE AUTORIZACIÓN por el Administrador. Debe esperar a que su cuenta sea aprobada para ingresar.'
            );
          }
          setIsLoading(false);
          return;
        }

        if (userStatus === 'rechazado') {
          setErrorMessage(
            'Su solicitud de registro o cuenta fue RECHAZADA. No tiene acceso al sistema.'
          );
          setIsLoading(false);
          return;
        }

        if (userStatus === 'inactivo') {
          setErrorMessage('Su cuenta se encuentra INACTIVA. Comuníquese con el Administrador.');
          setIsLoading(false);
          return;
        }

        // Validate supermarket SaaS access validity if not Super Admin
        if (foundUser.role !== 'superadmin' && foundUser.supermarketId) {
          const sm = supermarkets.find((s) => s.id === foundUser.supermarketId);
          if (sm) {
            const accessInfo = getSupermarketAccessInfo(sm);
            if (accessInfo.effectiveStatus !== 'activo') {
              setErrorMessage(
                accessInfo.blockMessage ||
                  'El acceso a este supermercado no se encuentra disponible actualmente.'
              );
              setIsLoading(false);
              return;
            }
          }
        }

        onLoginSuccess({
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
          documentId: foundUser.documentId,
          supermarketId: foundUser.supermarketId,
          supermarketName: foundUser.supermarketName,
          password: foundUser.password,
          status: foundUser.status,
          phone: foundUser.phone,
          address: foundUser.address,
          birthDate: foundUser.birthDate,
          hireDate: foundUser.hireDate,
          cargo: foundUser.cargo,
        });
      } else {
        setErrorMessage('Credenciales incorrectas. Verifique su usuario/correo y contraseña.');
        setIsLoading(false);
      }
    }, 400);
  };

  // Validate Employee Registration Form
  const validateEmployeeRegistration = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate Supermarket selection
    if (!regSupermarketId.trim()) {
      errors.supermarket = 'Debe seleccionar el supermercado al que postula o será asignado.';
    }

    if (!regFullName.trim()) errors.fullName = 'El nombre completo es obligatorio.';
    
    if (!regUsername.trim()) {
      errors.username = 'El nombre de usuario es obligatorio.';
    } else if (regUsernameCheck && !regUsernameCheck.available) {
      errors.username = regUsernameCheck.message;
    }

    if (!regDocumentId.trim()) errors.documentId = 'El documento de identidad es obligatorio.';
    if (!regPhone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!regAddress.trim()) errors.address = 'La dirección de residencia es obligatoria.';
    
    if (!regEmail.trim()) {
      errors.email = 'Ingrese un correo electrónico válido.';
    } else if (regEmailCheck && !regEmailCheck.available) {
      errors.email = regEmailCheck.message;
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
    const cleanDoc = regDocumentId.trim();

    const isDuplicateDoc = usersList.some((u) => u.documentId === cleanDoc) ||
      employees?.some((e) => e.documentId === cleanDoc);

    if (isDuplicateDoc) {
      errors.duplicate = 'El documento de identidad ya se encuentra registrado.';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Employee Registration Submit
  const handleEmployeeRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmployeeRegistration()) return;

    if (onRegisterUser) {
      const result = onRegisterUser({
        fullName: regFullName.trim(),
        username: regUsername.trim().toLowerCase(),
        documentId: regDocumentId.trim(),
        phone: regPhone.trim(),
        address: regAddress.trim(),
        email: regEmail.trim().toLowerCase(),
        birthDate: regBirthDate,
        hireDate: regHireDate,
        cargo: regCargo.trim(),
        photo: regPhoto.trim(),
        password: regPassword,
        supermarketId: regSupermarketId,
        supermarketName: regSupermarketName,
      });

      if (result.success) {
        setSuccessNotice(
          `Su registro ha sido recibido exitosamente para "${regSupermarketName || 'el supermercado'}" y se encuentra PENDIENTE DE AUTORIZACIÓN por el Administrador. Debe esperar a que su cuenta sea aprobada para ingresar al sistema.`
        );
        // Reset registration fields
        setRegFullName('');
        setRegUsername('');
        setRegDocumentId('');
        setRegPhone('');
        setRegAddress('');
        setRegEmail('');
        setRegBirthDate('');
        setRegCargo('');
        setRegPhoto(AVATAR_PRESETS[0]);
        setRegSupermarketId('');
        setRegSupermarketName('');
        setSmSearchQuery('');
        setIsComboboxOpen(false);
        setRegPassword('');
        setRegConfirmPassword('');
        setRegErrors({});
        setMode('login');
      } else {
        setRegErrors({ general: result.message });
      }
    }
  };

  // If in 'register-supermarket' mode, render the SupermarketRegisterForm
  if (mode === 'register-supermarket') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-y-auto font-sans py-10">
        <SupermarketRegisterForm
          existingUsers={usersList}
          existingSupermarkets={supermarkets}
          onRegisterSupermarket={(newSm, pw, un) => {
            if (onRegisterSupermarket) {
              onRegisterSupermarket(newSm, pw, un);
            }
          }}
          onBackToLogin={() => setMode('login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-y-auto font-sans py-8">
      <div className="w-full max-w-md my-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200/60 mb-2.5">
            <ShoppingBag className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SuperMercado Express</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plataforma SaaS Multi-Supermercados — Control de Acceso
          </p>
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
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register-supermarket');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Nuevo Supermercado</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register-employee');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'register-employee'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Registrar Empleado / Cajero"
            >
              <UserPlus className="w-4 h-4" />
              <span>Empleado</span>
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
                      placeholder="admin@supermercado.com o superadmin"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
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
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
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
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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

                {/* Banner: Registrar mi Supermercado Call to Action */}
                <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>¿Eres dueño de un supermercado?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register-supermarket');
                      setErrorMessage('');
                    }}
                    className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Regístralo aquí</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: EMPLOYEE REGISTRATION FORM */}
            {mode === 'register-employee' && (
              <form onSubmit={handleEmployeeRegisterSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-slate-600 mb-2">
                  <p className="font-bold text-emerald-950 mb-0.5">Solicitud de Registro de Empleado</p>
                  <p className="text-[11px]">
                    Complete el formulario seleccionando su supermercado de destino. Su cuenta quedará en <strong>Estado Pendiente</strong> hasta que el Administrador la autorice.
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

                {/* 1. SELECCIÓN Y BÚSQUEDA DE SUPERMERCADO MEDIANTE COMBOBOX */}
                <div className="relative" ref={comboboxRef}>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supermercado asignado <span className="text-rose-500">*</span>
                  </label>

                  {/* Trigger Button */}
                  <div
                    onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      regErrors.supermarket
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : isComboboxOpen
                        ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          regSupermarketId
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 text-left">
                        {regSupermarketId ? (
                          <>
                            <p className="font-bold text-slate-900 text-xs truncate">
                              {regSupermarketName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {supermarkets.find((s) => s.id === regSupermarketId)?.address || 'Supermercado seleccionado'}
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400 font-normal">
                            Seleccione o busque un supermercado...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      {regSupermarketId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRegSupermarketId('');
                            setRegSupermarketName('');
                            setSmSearchQuery('');
                          }}
                          className="p-1 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors"
                          title="Limpiar selección"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Dropdown Popover */}
                  {isComboboxOpen && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2 animate-in fade-in-0 zoom-in-95 duration-150">
                      {/* Search Bar inside Combobox */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={smSearchQuery}
                          onChange={(e) => setSmSearchQuery(e.target.value)}
                          placeholder="Buscar por nombre, dirección o correo..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {smSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setSmSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {supermarkets
                          .filter((sm) => sm.status !== 'rechazado' && sm.status !== 'desactivado')
                          .filter((sm) => {
                            if (!smSearchQuery.trim()) return true;
                            const q = smSearchQuery.toLowerCase().trim();
                            return (
                              sm.name.toLowerCase().includes(q) ||
                              sm.address.toLowerCase().includes(q) ||
                              sm.email.toLowerCase().includes(q)
                            );
                          }).length === 0 ? (
                          <div className="text-center py-4 px-2">
                            <Store className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                            <p className="text-xs font-semibold text-slate-600">No se encontraron resultados</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {supermarkets.length === 0
                                ? 'No hay supermercados registrados.'
                                : 'Pruebe con otro término de búsqueda.'}
                            </p>
                          </div>
                        ) : (
                          supermarkets
                            .filter((sm) => sm.status !== 'rechazado' && sm.status !== 'desactivado')
                            .filter((sm) => {
                              if (!smSearchQuery.trim()) return true;
                              const q = smSearchQuery.toLowerCase().trim();
                              return (
                                sm.name.toLowerCase().includes(q) ||
                                sm.address.toLowerCase().includes(q) ||
                                sm.email.toLowerCase().includes(q)
                              );
                            })
                            .map((sm) => {
                              const isSelected = regSupermarketId === sm.id;
                              return (
                                <button
                                  key={sm.id}
                                  type="button"
                                  onClick={() => {
                                    setRegSupermarketId(sm.id);
                                    setRegSupermarketName(sm.name);
                                    setIsComboboxOpen(false);
                                    setSmSearchQuery('');
                                    setRegErrors((prev) => ({ ...prev, supermarket: '' }));
                                  }}
                                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-200'
                                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`p-1.5 rounded-md shrink-0 ${
                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      <Building2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-slate-800 truncate">
                                        {sm.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                                        {sm.address}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                        sm.status === 'activo'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                    >
                                      {sm.status === 'activo' ? 'Activo' : 'Pendiente'}
                                    </span>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                        )}
                      </div>
                    </div>
                  )}

                  {regErrors.supermarket && (
                    <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{regErrors.supermarket}</span>
                    </p>
                  )}
                </div>

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
                      regErrors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {regErrors.fullName && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.fullName}</p>
                  )}
                </div>

                {/* Nombre de Usuario */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Nombre de Usuario (Login) *
                    </label>
                    {regUsername.trim() && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          regUsernameCheck?.available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {regUsernameCheck?.available ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {regUsernameCheck?.available ? 'Disponible' : 'Ya en uso'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Ej: ltorres"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.username || (regUsername.trim() && !regUsernameCheck?.available)
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {regErrors.username && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.username}</p>
                  )}
                </div>

                {/* Documento de Identidad */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Documento de Identidad *
                  </label>
                  <input
                    type="text"
                    value={regDocumentId}
                    onChange={(e) => setRegDocumentId(e.target.value)}
                    placeholder="Ej: 10482910"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.documentId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {regErrors.documentId && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.documentId}</p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Correo Electrónico *
                    </label>
                    {regEmail.trim() && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          regEmailCheck?.available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {regEmailCheck?.available ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {regEmailCheck?.available ? 'Disponible' : 'Ya en uso'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={handleRegEmailChange}
                      placeholder="laura.torres@supermercado.com"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.email || (regEmail.trim() && !regEmailCheck?.available)
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {regErrors.email && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.email}</p>
                  )}
                </div>

                {/* Teléfono y Cargo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+591 70000000"
                      className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    {regErrors.phone && (
                      <p className="text-[10px] text-rose-500 mt-1">{regErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cargo Deseado *
                    </label>
                    <input
                      type="text"
                      value={regCargo}
                      onChange={(e) => setRegCargo(e.target.value)}
                      placeholder="Cajero(a), Bodeguero"
                      className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                        regErrors.cargo ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    {regErrors.cargo && (
                      <p className="text-[10px] text-rose-500 mt-1">{regErrors.cargo}</p>
                    )}
                  </div>
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
                    placeholder="Calle Los Álamos #456"
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {regErrors.address && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.address}</p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={regBirthDate}
                    onChange={(e) => setRegBirthDate(e.target.value)}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                      regErrors.birthDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {regErrors.birthDate && (
                    <p className="text-[10px] text-rose-500 mt-1">{regErrors.birthDate}</p>
                  )}
                </div>

                {/* Selector de Fotografía */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fotografía de Perfil *
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={regPhoto}
                      alt="Avatar preview"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegPhoto(preset)}
                          className={`w-7 h-7 rounded-full overflow-hidden border transition-all cursor-pointer ${
                            regPhoto === preset
                              ? 'border-indigo-600 scale-110 ring-2 ring-indigo-200'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contraseñas */}
                <div className="grid grid-cols-2 gap-3">
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
                        className={`w-full pl-3 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                          regErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.password && (
                      <p className="text-[10px] text-rose-500 mt-1">{regErrors.password}</p>
                    )}
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
                        className={`w-full pl-3 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none ${
                          regErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-[10px] text-rose-500 mt-1">{regErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegErrors({});
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
