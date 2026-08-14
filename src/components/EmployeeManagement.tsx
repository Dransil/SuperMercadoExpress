import React, { useState } from 'react';
import { Employee, UserRole, UserStatus } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  IdCard,
  Image as ImageIcon,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCheck,
  Building2,
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (
    employee: Omit<Employee, 'id'>,
    accessAccount?: { username: string; password: string; createAccount: boolean }
  ) => void;
  onUpdateEmployee: (id: string, updated: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
  onAuthorizeUser?: (id: string, role: UserRole) => void;
  onRejectUser?: (id: string) => void;
  currentSupermarketName?: string;
  currentSupermarketId?: string;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAuthorizeUser,
  onRejectUser,
  currentSupermarketName,
  currentSupermarketId,
}) => {
  // Main Tab State: 'activos' | 'pendientes' | 'rechazados'
  const [activeStatusTab, setActiveStatusTab] = useState<'activos' | 'pendientes' | 'rechazados'>('activos');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | UserRole>('todos');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Authorization Modal State for Pending Requests
  const [authorizingEmployee, setAuthorizingEmployee] = useState<Employee | null>(null);
  const [selectedRoleForAuthorization, setSelectedRoleForAuthorization] = useState<UserRole>('cajero');

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [role, setRole] = useState<UserRole>('cajero');
  const [photo, setPhoto] = useState('');
  const [status, setStatus] = useState<UserStatus>('activo');
  const [cargo, setCargo] = useState('');

  // Access Account generation states
  const [createAccessAccount, setCreateAccessAccount] = useState<boolean>(true);
  const [accountUsername, setAccountUsername] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('cajero123');

  // Form Validation & Error state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Counts for Badges
  const pendingCount = employees.filter((e) => e.status === 'pendiente').length;
  const activeCount = employees.filter((e) => e.status === 'activo' || !e.status).length;
  const rejectedCount = employees.filter((e) => e.status === 'rechazado').length;

  // Open Form Modal for Create
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFullName('');
    setDocumentId('');
    setPhone('');
    setAddress('');
    setEmail('');
    setBirthDate('');
    setHireDate(new Date().toISOString().split('T')[0]);
    setRole('cajero');
    setCargo('Cajero');
    setPhoto(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
    setStatus('activo');
    setCreateAccessAccount(true);
    setAccountUsername('');
    setAccountPassword('cajero123');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFullName(emp.fullName);
    setDocumentId(emp.documentId);
    setPhone(emp.phone);
    setAddress(emp.address);
    setEmail(emp.email);
    setBirthDate(emp.birthDate);
    setHireDate(emp.hireDate);
    setRole(emp.role);
    setCargo(emp.cargo || (emp.role === 'admin' ? 'Administrador' : 'Cajero'));
    setPhoto(emp.photo);
    setStatus(emp.status);
    setCreateAccessAccount(false);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Authorization Modal
  const handleOpenAuthorizationModal = (emp: Employee) => {
    setAuthorizingEmployee(emp);
    setSelectedRoleForAuthorization(emp.role || 'cajero');
  };

  // Handle Approve Registration Request
  const handleConfirmAuthorize = () => {
    if (authorizingEmployee && onAuthorizeUser) {
      onAuthorizeUser(authorizingEmployee.id, selectedRoleForAuthorization);
      setAuthorizingEmployee(null);
    }
  };

  // Handle Reject Registration Request
  const handleConfirmReject = () => {
    if (authorizingEmployee && onRejectUser) {
      onRejectUser(authorizingEmployee.id);
      setAuthorizingEmployee(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'El nombre completo es obligatorio.';
    if (!documentId.trim()) errors.documentId = 'El documento de identidad es obligatorio.';
    if (!phone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!address.trim()) errors.address = 'La dirección es obligatoria.';
    if (!email.trim() || !email.includes('@')) errors.email = 'Ingrese un correo electrónico válido.';
    if (!birthDate) errors.birthDate = 'La fecha de nacimiento es obligatoria.';
    if (!hireDate) errors.hireDate = 'La fecha de contratación es obligatoria.';
    if (!photo.trim()) errors.photo = 'Seleccione o ingrese una URL de fotografía.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Employee (Create or Edit)
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const employeeData = {
      fullName: fullName.trim(),
      documentId: documentId.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim().toLowerCase(),
      birthDate,
      hireDate,
      role,
      cargo: cargo.trim() || (role === 'admin' ? 'Administrador' : 'Cajero'),
      photo: photo.trim(),
      status,
    };

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, employeeData);
    } else {
      onAddEmployee(employeeData, {
        username: accountUsername.trim() || email.trim().toLowerCase().split('@')[0],
        password: accountPassword.trim() || 'cajero123',
        createAccount: createAccessAccount,
      });
    }

    setIsFormModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      onDeleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };

  // Filtered employees list based on status tab and search
  const filteredEmployees = employees.filter((emp) => {
    const empStatus = emp.status || 'activo';

    // Status Tab filter
    if (activeStatusTab === 'activos' && empStatus !== 'activo') return false;
    if (activeStatusTab === 'pendientes' && empStatus !== 'pendiente') return false;
    if (activeStatusTab === 'rechazados' && empStatus !== 'rechazado') return false;

    // Search filter
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.documentId.includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.cargo && emp.cargo.toLowerCase().includes(searchTerm.toLowerCase()));

    // Role filter
    const matchesRole = roleFilter === 'todos' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Módulo de Usuarios y Empleados</h2>
            <p className="text-xs text-slate-500">
              Gestión de personal, solicitudes de registro y asignación de permisos de acceso.
            </p>
          </div>
        </div>

        <button
          id="btn-registrar-empleado"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Empleado Directo</span>
        </button>
      </div>

      {/* Main Status Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveStatusTab('activos')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeStatusTab === 'activos'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Usuarios Activos</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            {activeCount}
          </span>
        </button>

        <button
          id="tab-solicitudes-pendientes"
          onClick={() => setActiveStatusTab('pendientes')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeStatusTab === 'pendientes'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Solicitudes Pendientes</span>
          {pendingCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStatusTab('rechazados')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeStatusTab === 'rechazados'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Solicitudes Rechazadas</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-8 md:col-span-9 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento, correo o cargo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Filter Select */}
        <div className="sm:col-span-4 md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'todos' | UserRole)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer shadow-xs"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="cajero">Cajero</option>
          </select>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Empleado / Usuario</th>
                <th className="py-3.5 px-4">Documento ID</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Cargo / Puesto</th>
                <th className="py-3.5 px-4">Registro / Ingreso</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">No hay registros en esta sección</p>
                      <p className="text-xs text-slate-400">
                        {activeStatusTab === 'pendientes'
                          ? 'No hay solicitudes de registro pendientes de autorización.'
                          : activeStatusTab === 'rechazados'
                          ? 'No hay solicitudes rechazadas.'
                          : 'No se encontraron usuarios activos con los criterios seleccionados.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empStatus = emp.status || 'activo';

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Employee Profile (Photo, Name, Email) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.photo}
                            alt={emp.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500/50 transition-all shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate text-sm">{emp.fullName}</p>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Document ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {emp.documentId}
                        </span>
                      </td>

                      {/* Contact (Phone & Address) */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {emp.phone}
                        </p>
                        <p
                          className="flex items-center gap-1.5 text-slate-500 truncate max-w-[180px]"
                          title={emp.address}
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {emp.address}
                        </p>
                      </td>

                      {/* Cargo / Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 text-xs">
                            {emp.cargo || (emp.role === 'admin' ? 'Administrador' : 'Cajero')}
                          </p>
                          <div className="flex flex-wrap items-center gap-1">
                            {emp.supermarketName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Building2 className="w-2.5 h-2.5 text-indigo-600" />
                                {emp.supermarketName}
                              </span>
                            )}
                            {empStatus === 'activo' && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                                  emp.role === 'admin'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <Briefcase className="w-2.5 h-2.5" />
                                Rol: {emp.role === 'admin' ? 'Administrador' : 'Cajero'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Reg: <span className="text-slate-700 font-medium">{emp.registrationDate || emp.hireDate}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400">
                          Nac: <span>{emp.birthDate}</span>
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {empStatus === 'activo' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Activo
                          </span>
                        )}
                        {empStatus === 'pendiente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pendiente
                          </span>
                        )}
                        {empStatus === 'rechazado' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Rechazado
                          </span>
                        )}
                        {empStatus === 'inactivo' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {empStatus === 'pendiente' ? (
                            <button
                              onClick={() => handleOpenAuthorizationModal(emp)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Revisar y Autorizar</span>
                            </button>
                          ) : (
                            <>
                              {/* Ver Detalle */}
                              <button
                                onClick={() => setViewingEmployee(emp)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Ver detalle del empleado"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Editar */}
                              <button
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                                title="Editar datos"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Eliminar */}
                              <button
                                onClick={() => setDeletingEmployee(emp)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {filteredEmployees.length} registros en sección{' '}
            <strong className="text-slate-700 capitalize">{activeStatusTab}</strong>
          </span>
          <span className="text-emerald-700 font-bold">Módulo de Control de Acceso</span>
        </div>
      </div>

      {/* AUTHORIZATION REVIEW MODAL (ADMIN APPROVAL/REJECTION) */}
      {authorizingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-amber-500 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">Revisión de Solicitud de Registro</h3>
                  <p className="text-xs text-amber-100">
                    Evalúe los datos personales y asigne el rol correspondiente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthorizingEmployee(null)}
                className="p-1 hover:bg-amber-600 rounded-lg transition-colors cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Applicant Profile Header */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={authorizingEmployee.photo}
                  alt={authorizingEmployee.fullName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{authorizingEmployee.fullName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {authorizingEmployee.email}
                  </p>
                  <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Estado: Pendiente de Autorización
                  </span>
                </div>
              </div>

              {/* Submitted Personal Data Grid */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Documento ID:</span>
                    <p className="font-mono font-bold text-slate-800">{authorizingEmployee.documentId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Teléfono:</span>
                    <p className="font-bold text-slate-800">{authorizingEmployee.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Cargo Solicitado:</span>
                    <p className="font-bold text-slate-800">{authorizingEmployee.cargo || 'Auxiliar'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Fecha Solicitud:</span>
                    <p className="font-bold text-slate-800">{authorizingEmployee.registrationDate || authorizingEmployee.hireDate}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Dirección:</span>
                  <p className="font-bold text-slate-800">{authorizingEmployee.address}</p>
                </div>
              </div>

              {/* Role Selection Assignment */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Asignar Rol de Acceso al Sistema *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleForAuthorization('cajero')}
                    className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      selectedRoleForAuthorization === 'cajero'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" /> Cajero
                      </span>
                      {selectedRoleForAuthorization === 'cajero' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Acceso al Módulo de Ventas y consulta básica de productos.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRoleForAuthorization('admin')}
                    className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      selectedRoleForAuthorization === 'admin'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Administrador
                      </span>
                      {selectedRoleForAuthorization === 'admin' && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Acceso total a Productos, Usuarios, Reportes e Inventario.
                    </p>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Rechazar Solicitud</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthorizingEmployee(null)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-autorizar-usuario"
                    type="button"
                    onClick={handleConfirmAuthorize}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autorizar Usuario</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete los datos requeridos para el perfil laboral.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Supermercado Fijado por la Sesión (Solo Lectura) */}
              {currentSupermarketName && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Supermercado Asignado
                      </span>
                      <span className="text-sm font-bold text-emerald-950">{currentSupermarketName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    Asociación Obligatoria
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej: Laura Sofía Torres Peña"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Documento de Identidad */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Documento de Identidad *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Ej: 1098765432"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.documentId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.documentId && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.documentId}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej: +591 712 34567"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@supermercado.com"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rol en Sistema *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="cajero">Cajero</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Cargo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo / Puesto de Trabajo *
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej: Cajera Principal, Auxiliar de Ventas, Supervisor"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Dirección */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección de Residencia *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej: Calle 20 #15-30, Barrio El Nogal"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${
                        formErrors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.address && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.address}</p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none ${
                        formErrors.birthDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.birthDate && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.birthDate}</p>
                  )}
                </div>

                {/* Fecha de Contratación */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Contratación *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none ${
                        formErrors.hireDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {formErrors.hireDate && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{formErrors.hireDate}</p>
                  )}
                </div>

                {/* Fotografía Picker & URL */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fotografía del Empleado *
                  </label>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <img
                      src={photo || AVATAR_PRESETS[0]}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-semibold mb-1">
                        URL de la imagen o Seleccionar de Galería
                      </p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="url"
                          value={photo}
                          onChange={(e) => setPhoto(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Avatars Gallery Selector */}
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      O elige un avatar rápido predefinido:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhoto(presetUrl)}
                          className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                            photo === presetUrl
                              ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-200'
                              : 'border-transparent hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {photo === presetUrl && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Opción de Crear Cuenta de Acceso al Sistema */}
                {!editingEmployee && (
                  <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={createAccessAccount}
                        onChange={(e) => setCreateAccessAccount(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-800">
                        Crear cuenta de acceso al sistema
                      </span>
                    </label>

                    {createAccessAccount && (
                      <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Usuario / Alias de Acceso
                          </label>
                          <input
                            type="text"
                            value={accountUsername}
                            onChange={(e) => setAccountUsername(e.target.value)}
                            placeholder={email ? email.split('@')[0] : 'Ej: laura_cajera'}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400">
                            Si se omite, se generará a partir del correo.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contraseña Inicial *
                          </label>
                          <input
                            type="text"
                            value={accountPassword}
                            onChange={(e) => setAccountPassword(e.target.value)}
                            placeholder="cajero123"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400">
                            Contraseña predeterminada para ingresar.
                          </span>
                        </div>

                        <div className="sm:col-span-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>
                            La cuenta heredará obligatoriamente el supermercado{' '}
                            <strong>{currentSupermarketName || 'actual'}</strong> (ID:{' '}
                            <code className="font-mono">{currentSupermarketId || 'sesión'}</code>) con el rol seleccionado.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-guardar-empleado"
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200/60 transition-all cursor-pointer"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header / Banner */}
            <div className="relative bg-slate-50 p-6 border-b border-slate-200">
              <button
                onClick={() => setViewingEmployee(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <img
                  src={viewingEmployee.photo}
                  alt={viewingEmployee.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
                />
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 border ${
                      viewingEmployee.role === 'admin'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {viewingEmployee.role === 'admin' ? 'Administrador' : 'Cajero'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800">{viewingEmployee.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Documento ID: {viewingEmployee.documentId}</p>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="p-6 space-y-3 text-sm">
              {viewingEmployee.supermarketName && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 bg-indigo-50/50 -mx-6 px-6">
                  <span className="text-indigo-900 font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" /> Supermercado Asignado:
                  </span>
                  <span className="font-bold text-indigo-950">{viewingEmployee.supermarketName}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Cargo:
                </span>
                <span className="font-semibold text-slate-800">
                  {viewingEmployee.cargo || (viewingEmployee.role === 'admin' ? 'Administrador' : 'Cajero')}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Correo Electrónico:
                </span>
                <span className="font-semibold text-slate-800">{viewingEmployee.email}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Teléfono:
                </span>
                <span className="font-semibold text-slate-800">{viewingEmployee.phone}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Dirección:
                </span>
                <span className="font-semibold text-slate-800 text-right">{viewingEmployee.address}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Fecha Nacimiento:
                </span>
                <span className="font-semibold text-slate-800">{viewingEmployee.birthDate}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Fecha Contratación/Ingreso:
                </span>
                <span className="font-bold text-emerald-600">{viewingEmployee.hireDate}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">¿Eliminar Registro?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Esta acción eliminará permanentemente a <strong className="text-slate-800">{deletingEmployee.fullName}</strong> ({deletingEmployee.email}) del sistema.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <p>Documento ID: <span className="text-slate-800 font-mono font-bold">{deletingEmployee.documentId}</span></p>
              <p>Cargo: <span className="text-slate-800 capitalize font-semibold">{deletingEmployee.cargo || deletingEmployee.role}</span></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-eliminar"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

