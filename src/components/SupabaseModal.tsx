import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Copy, AlertTriangle, RefreshCw, X, Code2 } from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SQL_SCHEMA,
  checkSupabaseConnection,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncAllData: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncAllData,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [status, setStatus] = useState<{ connected: boolean; error?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      testConnection();
    }
  }, [isOpen]);

  const testConnection = async () => {
    setConnecting(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setConnecting(false);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    await onSyncAllData();
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Integración con Supabase</h3>
              <p className="text-xs text-slate-500">
                Conectado a la base de datos PostgreSQL de Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Details Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Project ID:</span>
            <span className="font-mono font-bold text-slate-800">xdakviiciioxedhqemmz</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Estado de Conexión:</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {connecting ? (
                <span className="text-slate-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Verificando...
                </span>
              ) : status?.connected ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> API Conectada
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {status?.error || 'Sin respuesta'}
                </span>
              )}
            </div>
          </div>
          <div className="sm:col-span-2 border-t border-slate-200/60 pt-2">
            <span className="text-slate-400 font-medium block">REST API Endpoint:</span>
            <span className="font-mono text-slate-700 break-all">{SUPABASE_URL}/rest/v1/</span>
          </div>
        </div>

        {/* Sync Button & Connection Test */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <div>
            <h4 className="font-bold text-xs text-emerald-900">Sincronización de Datos</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Envía los productos, ventas, empleados y cierres actuales a Supabase.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={testConnection}
              disabled={connecting}
              className="px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connecting ? 'animate-spin' : ''}`} />
              Probar
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              {isSyncing ? 'Sincronizando...' : syncSuccess ? '¡Sincronizado!' : 'Sincronizar Ahora'}
            </button>
          </div>
        </div>

        {/* SQL Schema Script Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-600" /> Script DDL para Supabase SQL Editor
            </span>
            <button
              onClick={handleCopySQL}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ¡Copiado al Portapapeles!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar SQL
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <textarea
              readOnly
              value={SUPABASE_SQL_SCHEMA}
              rows={8}
              className="w-full font-mono text-[11px] bg-slate-900 text-emerald-400 p-3.5 rounded-xl border border-slate-800 leading-relaxed focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
