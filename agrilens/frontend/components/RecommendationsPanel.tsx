'use client';

import React from 'react';
import { Sparkles, Mic, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { DiagnosisData } from '@/lib/api';

interface RecommendationsPanelProps {
  diagnosis: DiagnosisData | null;
}

function NumberCircle({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

export default function RecommendationsPanel({ diagnosis }: RecommendationsPanelProps) {
  return (
    <div
      className={clsx(
        'relative h-full rounded-xl border bg-brand-card flex flex-col overflow-hidden transition-all duration-500',
        diagnosis ? 'border-brand-purple/30 glow-purple' : 'border-brand-border'
      )}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-purple/40 via-brand-purple to-brand-purple/40" />

      <div className="flex flex-col flex-1 p-5 gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Recommendations</h3>
              <p className="text-white/40 text-xs">Gemini-powered insights</p>
            </div>
          </div>
          {diagnosis && (
            <span className="px-2 py-0.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold">
              {diagnosis.recommendations?.length ?? 0} actions
            </span>
          )}
        </div>

        {diagnosis ? (
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
            {/* Recommendations list */}
            {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
                  Action Items
                </p>
                <ol className="space-y-2.5">
                  {diagnosis.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/4 border border-white/8 hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all duration-200 group"
                    >
                      <NumberCircle n={i + 1} />
                      <div className="flex-1 min-w-0">
                        <span className="text-white/75 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                          {rec}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-purple/60 flex-shrink-0 mt-0.5 transition-colors" />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Worker Script */}
            {diagnosis.workerScript && (
              <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 overflow-hidden">
                {/* Script header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-purple/15">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Mic className="w-3.5 h-3.5 text-brand-purple" />
                    <span className="text-brand-purple text-xs font-semibold">
                      AI Worker Script
                    </span>
                  </div>
                  <span className="ml-auto text-white/25 text-xs">spoken via ElevenLabs</span>
                </div>

                {/* Script content */}
                <div className="px-4 py-3.5">
                  <p className="text-white/55 text-sm leading-relaxed italic font-light">
                    &ldquo;{diagnosis.workerScript}&rdquo;
                  </p>
                </div>

                {/* Waveform decoration */}
                <div className="px-4 pb-3 flex items-end gap-0.5 h-6">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const heights = [3, 5, 8, 6, 10, 7, 4, 9, 6, 3, 8, 11, 7, 4, 6, 9, 5, 8, 3, 7, 10, 6, 4, 8, 5, 9, 6, 3];
                    const h = heights[i % heights.length];
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full bg-brand-purple/30"
                        style={{ height: `${h}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Skeleton / Empty State ── */
          <div className="flex-1 flex flex-col gap-4">
            {/* Skeleton items */}
            <div className="space-y-1.5">
              <div className="h-2 w-24 rounded-full bg-white/5 animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/8 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div
                      className="h-2 rounded-full bg-white/5 animate-pulse"
                      style={{ width: `${70 + n * 8}%` }}
                    />
                    <div
                      className="h-2 rounded-full bg-white/5 animate-pulse"
                      style={{ width: `${40 + n * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Script skeleton */}
            <div className="rounded-xl border border-brand-purple/10 bg-brand-purple/3 overflow-hidden mt-auto">
              <div className="px-4 py-2.5 border-b border-brand-purple/10 flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-brand-purple/40" />
                <span className="text-brand-purple/40 text-xs font-medium">AI Worker Script</span>
              </div>
              <div className="px-4 py-4 space-y-2">
                <div className="h-2 rounded-full bg-white/5 animate-pulse w-full" />
                <div className="h-2 rounded-full bg-white/5 animate-pulse w-4/5" />
                <div className="h-2 rounded-full bg-white/5 animate-pulse w-3/5" />
              </div>
            </div>

            <div className="mt-auto text-center">
              <p className="text-white/25 text-xs">Recommendations will appear after analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
