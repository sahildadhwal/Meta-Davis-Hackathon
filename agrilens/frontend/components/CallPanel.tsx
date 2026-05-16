'use client';

import React from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Loader2,
  Beaker,
  Globe2,
} from 'lucide-react';
import clsx from 'clsx';
import { CallStatus } from '@/lib/api';

interface CallPanelProps {
  callStatus: CallStatus;
  callLanguage: string;
  demoMode: boolean;
  onDemoModeToggle: (val: boolean) => void;
  onCallBob: () => void;
  disabled: boolean;
}

const STATUS_CONFIG = {
  idle: {
    dotClass: 'dot-idle',
    label: 'Ready to call',
    labelColor: 'text-white/50',
    icon: null,
  },
  dialing: {
    dotClass: 'dot-warning',
    label: 'Dialing Bob...',
    labelColor: 'text-amber-400',
    icon: 'spinner',
  },
  ringing: {
    dotClass: 'dot-warning',
    label: 'Ringing...',
    labelColor: 'text-amber-400',
    icon: 'spinner',
  },
  connected: {
    dotClass: 'dot-active',
    label: 'Connected',
    labelColor: 'text-brand-green',
    icon: 'connected',
  },
  ended: {
    dotClass: 'dot-info',
    label: 'Call Ended',
    labelColor: 'text-blue-400',
    icon: 'ended',
  },
} as const;

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string }> = {
  es: { flag: '🇲🇽', label: 'Spanish' },
  en: { flag: '🇺🇸', label: 'English' },
  pt: { flag: '🇧🇷', label: 'Portuguese' },
  fr: { flag: '🇫🇷', label: 'French' },
  zh: { flag: '🇨🇳', label: 'Mandarin' },
};

function DemoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 group"
    >
      {/* Track */}
      <div
        className={clsx(
          'relative w-11 h-6 rounded-full transition-all duration-200 border',
          value
            ? 'bg-brand-green/20 border-brand-green/60'
            : 'bg-white/5 border-white/15'
        )}
      >
        {/* Thumb */}
        <div
          className={clsx(
            'absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-md',
            value
              ? 'left-[22px] bg-brand-green'
              : 'left-0.5 bg-white/30'
          )}
        />
      </div>
      <div className="text-left">
        <p className="text-white text-sm font-medium leading-tight">
          Demo Mode
        </p>
        <p
          className={clsx(
            'text-xs leading-tight',
            value ? 'text-brand-green' : 'text-white/35'
          )}
        >
          {value ? 'Simulated call' : 'Live Twilio call'}
        </p>
      </div>
      <div
        className={clsx(
          'ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold transition-all',
          value
            ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
            : 'bg-white/5 border-white/10 text-white/30'
        )}
      >
        <Beaker className="w-3 h-3" />
        {value ? 'ON' : 'OFF'}
      </div>
    </button>
  );
}

export default function CallPanel({
  callStatus,
  callLanguage,
  demoMode,
  onDemoModeToggle,
  onCallBob,
  disabled,
}: CallPanelProps) {
  const config = STATUS_CONFIG[callStatus.status];
  const isActive =
    callStatus.status === 'dialing' || callStatus.status === 'ringing';
  const isConnected = callStatus.status === 'connected';
  const isEnded = callStatus.status === 'ended';
  const isIdle = callStatus.status === 'idle';

  const callButtonDisabled = disabled || isActive || isConnected;

  const langInfo = callLanguage !== 'en' ? LANGUAGE_FLAGS[callLanguage] : null;

  return (
    <div className="relative rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      {/* Top accent */}
      <div
        className={clsx('h-0.5 w-full transition-all duration-500', {
          'bg-gradient-to-r from-brand-green/40 via-brand-green to-brand-green/40': isConnected,
          'bg-gradient-to-r from-amber-400/40 via-amber-400 to-amber-400/40': isActive,
          'bg-gradient-to-r from-blue-400/40 via-blue-400 to-blue-400/40': isEnded,
          'bg-gradient-to-r from-brand-border via-white/10 to-brand-border': isIdle,
        })}
      />

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* ── Demo Mode Toggle ── */}
          <DemoToggle value={demoMode} onChange={onDemoModeToggle} />

          {/* Divider */}
          <div className="h-10 w-px bg-white/10 hidden sm:block" />

          {/* ── Status Indicator ── */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="relative flex items-center">
              <div className={clsx('w-3 h-3 rounded-full', config.dotClass)} />
              {(isActive || isConnected) && (
                <div
                  className={clsx(
                    'absolute inset-0 rounded-full animate-ping',
                    isConnected ? 'bg-brand-green/40' : 'bg-amber-400/40'
                  )}
                />
              )}
            </div>
            <div>
              <p className={clsx('text-sm font-semibold', config.labelColor)}>
                {config.label}
              </p>
              {callStatus.message && (
                <p className="text-white/35 text-xs mt-0.5">{callStatus.message}</p>
              )}
            </div>
          </div>

          {/* ── Language Banner ── */}
          {langInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 animate-fade-in">
              <Globe2 className="w-3.5 h-3.5 text-white/50" />
              <span className="text-sm">{langInfo.flag}</span>
              <span className="text-white/70 text-sm font-medium">
                Switched to {langInfo.label}
              </span>
            </div>
          )}

          {/* ── Call Button ── */}
          <div className="ml-auto flex items-center gap-3">
            {/* Call status chips */}
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/30">
                <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-brand-green text-xs font-semibold">LIVE CALL</span>
              </div>
            )}
            {isEnded && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30">
                <PhoneOff className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold">ENDED</span>
              </div>
            )}

            {/* Main call button */}
            <button
              type="button"
              onClick={onCallBob}
              disabled={callButtonDisabled}
              className={clsx(
                'relative flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 overflow-hidden',
                {
                  // Idle / ready
                  'bg-brand-green text-black hover:bg-brand-green/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-green/20 glow-green':
                    !callButtonDisabled,
                  // Active
                  'bg-amber-500/20 border border-amber-500/40 text-amber-400 cursor-not-allowed':
                    isActive,
                  // Connected
                  'bg-brand-green/10 border border-brand-green/30 text-brand-green cursor-not-allowed':
                    isConnected,
                  // Disabled (no diagnosis)
                  'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed':
                    disabled && !isActive && !isConnected,
                }
              )}
            >
              {/* Shimmer on hover */}
              {!callButtonDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              )}

              {isActive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calling Bob...
                </>
              ) : isConnected ? (
                <>
                  <PhoneCall className="w-4 h-4" />
                  On Call
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Call Bob
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subtle hint text */}
        {disabled && isIdle && (
          <p className="mt-3 text-white/25 text-xs text-right">
            Upload and analyze an image before calling
          </p>
        )}
      </div>
    </div>
  );
}
