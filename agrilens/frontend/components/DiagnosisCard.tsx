'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Leaf, ShieldAlert, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { DiagnosisData } from '@/lib/api';

interface DiagnosisCardProps {
  diagnosis: DiagnosisData | null;
}

const SEVERITY_CONFIG: Record<
  DiagnosisData['severity'],
  { label: string; color: string; bg: string; barColor: string; percent: number }
> = {
  LOW: {
    label: 'LOW',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    barColor: 'from-emerald-400 to-emerald-300',
    percent: 20,
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    barColor: 'from-amber-400 to-orange-400',
    percent: 50,
  },
  HIGH: {
    label: 'HIGH',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/30',
    barColor: 'from-orange-400 to-red-400',
    percent: 75,
  },
  CRITICAL: {
    label: 'CRITICAL',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    barColor: 'from-red-400 to-red-600',
    percent: 95,
  },
};

function SeverityBar({ score, severity }: { score: number; severity: DiagnosisData['severity'] }) {
  const percentage = Math.min(100, Math.max(0, (score / 10) * 100));
  const config = SEVERITY_CONFIG[severity];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
          Severity Score
        </span>
        <div className="flex items-center gap-2">
          <span className={clsx('text-sm font-bold', config.color)}>{score.toFixed(1)}</span>
          <span className="text-white/30 text-xs">/ 10</span>
        </div>
      </div>
      {/* Track */}
      <div className="relative h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            config.barColor
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Glow overlay */}
        <div
          className={clsx(
            'absolute inset-y-0 left-0 rounded-full opacity-40 blur-sm bg-gradient-to-r transition-all duration-1000',
            config.barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Tick marks */}
      <div className="flex justify-between px-0.5">
        {[0, 2, 4, 6, 8, 10].map((n) => (
          <span key={n} className="text-white/20 text-[10px]">{n}</span>
        ))}
      </div>
    </div>
  );
}

export default function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const isBadQuality =
    diagnosis?.status === 'BAD_QUALITY' ||
    diagnosis?.severity === 'HIGH' ||
    diagnosis?.severity === 'CRITICAL';

  const severityConfig = diagnosis ? SEVERITY_CONFIG[diagnosis.severity] : null;

  return (
    <div
      className={clsx(
        'relative h-full rounded-xl border bg-brand-card transition-all duration-500 overflow-hidden flex flex-col',
        {
          'border-red-500/40 glow-red': isBadQuality,
          'border-brand-border': !isBadQuality,
        }
      )}
    >
      {/* Top accent line */}
      <div
        className={clsx('h-0.5 w-full', {
          'bg-gradient-to-r from-red-500/60 via-red-400 to-red-500/60': isBadQuality,
          'bg-gradient-to-r from-brand-purple/40 via-brand-purple to-brand-purple/40': !isBadQuality,
        })}
      />

      <div className="flex flex-col flex-1 p-5 gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-brand-border flex items-center justify-center">
              <Leaf className="w-4 h-4 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Quality Diagnosis</h3>
              <p className="text-white/40 text-xs">AI Vision Analysis</p>
            </div>
          </div>

          {/* Status Badge */}
          {diagnosis && (
            <div
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold',
                isBadQuality
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              )}
            >
              {isBadQuality ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {isBadQuality ? 'BAD QUALITY' : 'GOOD QUALITY'}
            </div>
          )}
        </div>

        {diagnosis ? (
          <>
            {/* Produce Type */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-1">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Produce Type</p>
                <p className="text-white font-semibold text-base capitalize">
                  {diagnosis.produceType}
                </p>
              </div>
              {diagnosis.lotNumber && (
                <div className="text-right">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Lot</p>
                  <p className="text-brand-green font-bold text-sm">{diagnosis.lotNumber}</p>
                </div>
              )}
            </div>

            {/* Severity Bar */}
            <SeverityBar score={diagnosis.severityScore} severity={diagnosis.severity} />

            {/* Severity Badge */}
            {severityConfig && (
              <div className="flex items-center gap-2">
                <ShieldAlert className={clsx('w-4 h-4', severityConfig.color)} />
                <span className="text-white/50 text-xs">Severity Level:</span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full border text-xs font-bold',
                    severityConfig.bg,
                    severityConfig.color
                  )}
                >
                  {severityConfig.label}
                </span>
              </div>
            )}

            {/* Issues List */}
            {diagnosis.issues && diagnosis.issues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-white/40" />
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">
                    Detected Issues
                  </p>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {diagnosis.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className={clsx(
                          'mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                          isBadQuality ? 'bg-red-400' : 'bg-amber-400'
                        )}
                      />
                      <span className="text-white/70 text-sm leading-relaxed">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div className="mt-auto p-3 rounded-lg bg-white/3 border border-white/8">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5 font-medium">
                AI Summary
              </p>
              <p className="text-white/65 text-sm leading-relaxed">{diagnosis.summary}</p>
            </div>
          </>
        ) : (
          /* ── Empty / Awaiting State ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 py-8">
            {/* Pulsing placeholder icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border border-brand-border bg-white/5 flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white/20" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-white/40 text-sm font-medium">Awaiting image analysis...</p>
              <p className="text-white/25 text-xs">Upload a produce image to begin</p>
            </div>

            {/* Skeleton lines */}
            <div className="w-full space-y-3 px-2">
              <div className="h-2 rounded-full bg-white/5 animate-pulse" style={{ width: '80%' }} />
              <div className="h-2 rounded-full bg-white/5 animate-pulse" style={{ width: '60%' }} />
              <div className="h-2 rounded-full bg-white/5 animate-pulse" style={{ width: '70%' }} />
              <div className="h-10 rounded-lg bg-white/5 animate-pulse mt-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
