import React, { useState, useMemo } from 'react';
import { Supermarket, User, Employee } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import {
  getTodayIsoString,
  addMonthsToIso,
  formatBolivianDate,
} from '../utils/saasAccess';
import {
  checkUsernameAvailability,
  checkEmailAvailability,
  checkSupermarketAvailability,
} from '../utils/validation';
import {
  X,
  Building2,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  Clock,
  CalendarCheck,
  Briefcase,
} from 'lucide-react';

interface CreateSupermarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUsers: User[];
  existingEmployees: Employee[];
  existingSupermarkets: Supermarket[];
  onCreateSupermarket: (
    supermarket: Supermarket,
    adminUser: User & { password: string },
    adminEmployee: Employee
  ) => void;
}

export const CreateSupermarketModal: React.FC<CreateSupermarketModalProps> = ({
  isOpen,
  onClose,
  existingUsers,
  existingEmployees,
  existingSupermarkets,
  onCreateSupermarket,
}) => {
  const today = getTodayIsoString();

  // Supermarket info
  const [smName, setSmName] = useState('');
  const [smAddress, setSmAddress] = useState('');
  const [smPhone, setSmPhone] = useState('');
  const [smEmail, setSmEmail] = useState('');

  // Admin info
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDocumentId, setAdminDocumentId] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [adminBirthDate, setAdminBirthDate] = useState('');
  const [adminCargo, setAdminCargo] = useState('Administrador General');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminPhoto, setAdminPhoto] = useState(
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  );
  const [showPhotoPresets, setShowPhotoPresets] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Access Dates
  const [startDate, setStartDate] = useState(today);
  const [expirationDate, setExpirationDate] = useState(addMonthsToIso(today, 1));
  const [notes, setNotes] = useState('Creado y autorizado directamente por el Super Administrador.');

  // Form error
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validations
  const usernameCheck = useMemo(() => {
    if (!adminUsername.trim()) return null;
    return checkUsernameAvailability(adminUsername, existingUsers, existingEmployees);
  }, [adminUsername, existingUsers, existingEmployees]);

  const adminEmailCheck = useMemo(() => {
    if (!adminEmail.trim()) return null;
    return checkEmailAvailability(adminEmail, existingUsers, existingEmployees);
  }, [adminEmail, existingUsers, existingEmployees]);

  const smValidation = useMemo(() => {
    return checkSupermarketAvailability(smName, smEmail, existingSupermarkets);
  }, [smName, smEmail, existingSupermarkets]);

  if (!isOpen) return null;

  const resetFields = () => {
    setSmName('');
    setSmAddress('');
    setSmPhone('');
    setSmEmail('');
    setAdminName('');
    setAdminUsername('');
    setAdminEmail('');
    setAdminDocumentId('');
    setAdminPhone('');
    setAdminAddress('');
    setAdminBirthDate('');
    setAdminCargo('Administrador General');
    setAdminPassword('admin123');
    setAdminPhoto(
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    );
    setShowPhotoPresets(false);
    setShowPassword(false);
    setStartDate(today);
    setExpirationDate(addMonthsToIso(today, 1));
    setNotes('Creado y autorizado directamente por el Super Administrador.');
    setFormError('');
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  // Quick duration buttons (+1 Mes, +3 Meses, +6 Meses, +1 Año)
  const applyDuration = (months: number) => {
    const base = startDate || today;
    setExpirationDate(addMonthsToIso(base, months));
  };

  // Auto-generate username from email or name if empty
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
    setFormError('');

    // Supermarket checks
    if (!smName.trim()) {
      setFormError('El nombre del supermercado/negocio es obligatorio.');
      return;
    }
    if (!smAddress.trim()) {
      setFormError('La dirección del supermercado es obligatoria.');
      return;
    }
    if (!smPhone.trim()) {
      setFormError('El teléfono de contacto del supermercado es obligatorio.');
      return;
    }
    if (!smEmail.trim()) {
      setFormError('El correo del supermercado es obligatorio.');
      return;
    }

    if (!smValidation.nameAvailable.available && smName.trim()) {
      setFormError(smValidation.nameAvailable.message);
      return;
    }
    if (!smValidation.emailAvailable.available && smEmail.trim()) {
      setFormError(smValidation.emailAvailable.message);
      return;
    }

    // Admin checks
    if (!adminName.trim()) {
      setFormError('El nombre completo del Administrador es obligatorio.');
      return;
    }
    if (!adminUsername.trim()) {
      setFormError('El nombre de usuario del Administrador es obligatorio.');
      return;
    }
    if (usernameCheck && !usernameCheck.available) {
      setFormError(usernameCheck.message);
      return;
    }
    if (!adminEmail.trim()) {
      setFormError('El correo electrónico del Administrador es obligatorio.');
      return;
    }
    if (adminEmailCheck && !adminEmailCheck.available) {
      setFormError(adminEmailCheck.message);
      return;
    }
    if (!adminDocumentId.trim()) {
      setFormError('El documento de identidad (CI/DNI) es obligatorio.');
      return;
    }
    if (!adminPassword || adminPassword.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Dates check
    if (!startDate || !expirationDate) {
      setFormError('Debe definir la fecha de inicio y vencimiento del período de acceso.');
      return;
    }
    if (expirationDate < startDate) {
      setFormError('La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
      return;
    }

    setIsSubmitting(true);

    const timestamp = Date.now();
    const newSmId = `sm-${timestamp}`;
    const newAdminUserId = `u-admin-${timestamp}`;
    const newEmpId = `emp-${newAdminUserId}`;
    const nowIso = new Date().toISOString();

    // 1. Create Supermarket (VERIFIED & ACTIVO)
    const newSupermarket: Supermarket = {
      id: newSmId,
      name: smName.trim(),
      address: smAddress.trim(),
      phone: smPhone.trim(),
      email: smEmail.trim().toLowerCase(),
      status: 'activo',
      registrationDate: today,
      startDate: startDate,
      expirationDate: expirationDate,
      adminId: newAdminUserId,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminDocumentId: adminDocumentId.trim(),
      adminPhone: adminPhone.trim() || smPhone.trim(),
      adminAddress: adminAddress.trim() || smAddress.trim(),
      adminBirthDate: adminBirthDate || '1990-01-01',
      adminHireDate: today,
      adminPhoto: adminPhoto.trim(),
      reviewedAt: nowIso,
      lastAccessUpdate: nowIso,
      notes: notes.trim(),
    };

    // 2. Create User (VERIFIED & ACTIVO)
    const newAdminUser: User & { password: string } = {
      id: newAdminUserId,
      username: adminUsername.trim().toLowerCase(),
      email: adminEmail.trim().toLowerCase(),
      name: adminName.trim(),
      role: 'admin',
      avatar: adminPhoto.trim(),
      documentId: adminDocumentId.trim(),
      password: adminPassword,
      status: 'activo',
      phone: adminPhone.trim() || smPhone.trim(),
      address: adminAddress.trim() || smAddress.trim(),
      birthDate: adminBirthDate || '1990-01-01',
      hireDate: today,
      cargo: adminCargo.trim() || 'Administrador General',
      employeeId: newEmpId,
      supermarketId: newSmId,
      supermarketName: smName.trim(),
      createdAt: nowIso,
    };

    // 3. Create Employee record (VERIFIED & ACTIVO)
    const newAdminEmployee: Employee = {
      id: newEmpId,
      fullName: adminName.trim(),
      documentId: adminDocumentId.trim(),
      phone: adminPhone.trim() || smPhone.trim(),
      address: adminAddress.trim() || smAddress.trim(),
      email: adminEmail.trim().toLowerCase(),
      birthDate: adminBirthDate || '1990-01-01',
      hireDate: today,
      cargo: adminCargo.trim() || 'Administrador General',
      photo: adminPhoto.trim(),
      role: 'admin',
      status: 'activo',
      userId: newAdminUserId,
      supermarketId: newSmId,
      supermarketName: smName.trim(),
      registrationDate: today,
    };

    onCreateSupermarket(newSupermarket, newAdminUser, newAdminEmployee);
    setIsSubmitting(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fadeIn my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
              <Building2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Creación Directa y Verificada</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Crear Supermercado y Administrador
              </h2>
              <p className="text-xs text-indigo-200/80">
                La cuenta y el establecimiento quedarán activos y autorizados automáticamente con el período de vigencia asignado.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: DATOS DEL SUPERMERCADO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>1. Información del Supermercado / Negocio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Comercial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={smName}
                  onChange={(e) => setSmName(e.target.value)}
                  placeholder="Ej. Supermercado Los Andes"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
                {smName.trim() && (
                  <div className="mt-1 flex items-center gap-1 text-[10px]">
                    {smValidation.nameAvailable.available ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Nombre disponible
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {smValidation.nameAvailable.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico del Supermercado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={smEmail}
                  onChange={(e) => setSmEmail(e.target.value)}
                  placeholder="contacto@supermercado.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
                {smEmail.trim() && (
                  <div className="mt-1 flex items-center gap-1 text-[10px]">
                    {smValidation.emailAvailable.available ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Correo de negocio disponible
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {smValidation.emailAvailable.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono / Celular de Contacto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={smPhone}
                  onChange={(e) => setSmPhone(e.target.value)}
                  placeholder="Ej. +591 70000000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección y Ciudad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={smAddress}
                  onChange={(e) => setSmAddress(e.target.value)}
                  placeholder="Ej. Av. América #450, Cochabamba"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DATOS DEL ADMINISTRADOR */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>2. Credenciales y Datos del Administrador</span>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Foto de Perfil del Administrador
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={adminPhoto}
                  alt="Admin"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="flex-1">
                  <input
                    type="url"
                    value={adminPhoto}
                    onChange={(e) => setAdminPhoto(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoPresets(!showPhotoPresets)}
                  className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Presets</span>
                </button>
              </div>

              {showPhotoPresets && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-6 gap-2 animate-fadeIn">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAdminPhoto(url);
                        setShowPhotoPresets(false);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        adminPhoto === url ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo del Admin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre de Usuario (@username) <span className="text-rose-500">* (ÚNICO)</span>
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="Ej. cmendoza"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                    usernameCheck && !usernameCheck.available
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : usernameCheck && usernameCheck.available
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  required
                />
                {usernameCheck && (
                  <div className="mt-1 flex items-center gap-1 text-[10px]">
                    {usernameCheck.available ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {usernameCheck.message}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {usernameCheck.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico Personal / Admin <span className="text-rose-500">* (ÚNICO)</span>
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={handleAdminEmailChange}
                  placeholder="admin@correo.com"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs ${
                    adminEmailCheck && !adminEmailCheck.available
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : adminEmailCheck && adminEmailCheck.available
                      ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  required
                />
                {adminEmailCheck && (
                  <div className="mt-1 flex items-center gap-1 text-[10px]">
                    {adminEmailCheck.available ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {adminEmailCheck.message}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {adminEmailCheck.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Documento de Identidad (CI / DNI) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminDocumentId}
                  onChange={(e) => setAdminDocumentId(e.target.value)}
                  placeholder="Ej. 6543210 LP"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña Inicial de Acceso <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono Directo del Admin
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="Ej. +591 71234567"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PERÍODO DE VIGENCIA SAAS */}
          <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
              <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <span>3. Asignación de Licencia y Período de Acceso</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                Estado: ACTIVO
              </span>
            </div>

            {/* Quick Duration Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-600">Duración rápida:</span>
              <button
                type="button"
                onClick={() => applyDuration(1)}
                className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                +1 Mes
              </button>
              <button
                type="button"
                onClick={() => applyDuration(3)}
                className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                +3 Meses
              </button>
              <button
                type="button"
                onClick={() => applyDuration(6)}
                className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                +6 Meses
              </button>
              <button
                type="button"
                onClick={() => applyDuration(12)}
                className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                +1 Año
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fecha de Inicio de Acceso <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fecha de Vencimiento de Acceso <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notas / Observación del Período
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Plan Empresarial Anual - Licencia activa"
                className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-create-supermarket"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-200/60 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Supermercado y Admin (Verificado)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
