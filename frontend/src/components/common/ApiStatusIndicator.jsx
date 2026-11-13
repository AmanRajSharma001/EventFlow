import { useEffect, useState } from 'react';
import { Database, RefreshCw, Server, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import systemService from '../../services/system.service';

/**
 * ApiStatusIndicator
 *
 * A non-intrusive indicator displaying backend server and database readiness.
 * Accurately differentiates between server connectivity and database integration state.
 */
export default function ApiStatusIndicator({ className = '' }) {
  const [state, setState] = useState({
    status: 'unchecked', // 'unchecked' | 'server_offline' | 'db_pending' | 'ready' | 'error'
    serverOnline: false,
    dbReady: false,
    dependencyInfo: null,
    isChecking: false,
    lastChecked: null,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const refreshStatus = () => {
    setState((prev) => ({ ...prev, isChecking: true }));
    systemService
      .checkIntegrationStatus()
      .then((result) => {
        setState({
          ...result,
          isChecking: false,
          lastChecked: new Date().toLocaleTimeString(),
        });
      })
      .catch(() => {
        setState({
          status: 'server_offline',
          serverOnline: false,
          dbReady: false,
          dependencyInfo: null,
          isChecking: false,
          lastChecked: new Date().toLocaleTimeString(),
        });
      });
  };

  useEffect(() => {
    let isMounted = true;
    systemService
      .checkIntegrationStatus()
      .then((result) => {
        if (!isMounted) return;
        setState({
          ...result,
          isChecking: false,
          lastChecked: new Date().toLocaleTimeString(),
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setState({
          status: 'server_offline',
          serverOnline: false,
          dbReady: false,
          dependencyInfo: null,
          isChecking: false,
          lastChecked: new Date().toLocaleTimeString(),
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = () => {
    switch (state.status) {
      case 'ready':
        return {
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Backend & DB Live',
        };
      case 'db_pending':
        return {
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50/70',
          borderColor: 'border-amber-200',
          label: 'DB Pending · Demo Fallback',
        };
      case 'server_offline':
        return {
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'Backend Offline · Local Mode',
        };
      case 'unchecked':
      default:
        return {
          dotColor: 'bg-blue-400 animate-pulse',
          textColor: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'Checking API...',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className={`relative inline-block text-xs font-medium ${className}`}>
      {/* Compact Pill */}
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-2xs transition-colors ${badge.bgColor} ${badge.borderColor}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dotColor}`} />
        <span className={`font-semibold ${badge.textColor}`}>{badge.label}</span>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-slate-400 hover:text-slate-700 transition-colors ml-0.5 p-0.5"
          title="Toggle connection telemetry details"
          aria-label="Toggle connection telemetry details"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={refreshStatus}
          disabled={state.isChecking}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 disabled:opacity-50"
          title="Recheck backend and database status"
          aria-label="Recheck backend and database status"
        >
          <RefreshCw className={`w-3 h-3 ${state.isChecking ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Popover Details Drawer */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Integration Telemetry
            </span>
            <span className="text-[10px] text-slate-400">
              {state.lastChecked ? `Checked ${state.lastChecked}` : 'Checking...'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Express Server */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                Express Server
              </span>
              <span
                className={`font-semibold ${
                  state.serverOnline ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {state.serverOnline ? 'Online (:5001)' : 'Offline'}
              </span>
            </div>

            {/* PostgreSQL / Prisma */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                Database (Prisma)
              </span>
              <span
                className={`font-semibold ${
                  state.dbReady
                    ? 'text-emerald-700'
                    : state.status === 'db_pending'
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}
              >
                {state.dbReady
                  ? 'Connected'
                  : state.status === 'db_pending'
                  ? 'Pending Setup'
                  : 'Disconnected'}
              </span>
            </div>

            {/* Dependency Note if Pending */}
            {state.status === 'db_pending' && state.dependencyInfo && (
              <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Awaiting Teammate 3 ({state.dependencyInfo.teammate})</p>
                    <p className="text-amber-800/90 text-[10px] mt-0.5">
                      {state.dependencyInfo.required}
                    </p>
                    <p className="text-[10px] text-amber-700 font-medium mt-1">
                      Frontend is operating in safe mock fallback mode.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state.status === 'ready' && (
              <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <p className="font-medium">Live PostgreSQL database connected and verified.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
