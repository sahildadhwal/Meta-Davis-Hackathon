'use client';

import React from 'react';
import clsx from 'clsx';
import {
  Leaf,
  Wifi,
  WifiOff,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react';
import { useAgriLens } from '@/hooks/useAgriLens';
import ImageUpload from '@/components/ImageUpload';
import DiagnosisCard from '@/components/DiagnosisCard';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import CallPanel from '@/components/CallPanel';
import TranscriptFeed from '@/components/TranscriptFeed';

// ── Helper: Powered-by pill ────────────────────────────────────────────────
function TechPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
        color
      )}
    >
      {label}
    </span>
  );
}

// ── Helper: Live badge ─────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        {/* Outer ping ring */}
        <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-400/40 ping-slow" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400 dot-red" />
      </div>
      <span className="text-red-400 text-xs font-bold tracking-widest uppercase">LIVE</span>
    </div>
  );
}

// ── Helper: Socket indicator ───────────────────────────────────────────────
function SocketIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300',
        connected
          ? 'bg-brand-green/8 border-brand-green/25 text-brand-green'
          : 'bg-red-500/8 border-red-500/25 text-red-400'
      )}
    >
      {connected ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      <span>{connected ? 'Connected' : 'Disconnected'}</span>
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          connected ? 'bg-brand-green animate-pulse' : 'bg-red-400'
        )}
      />
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    demoMode,
    setDemoMode,
    diagnosis,
    isAnalyzing,
    uploadedImage,
    callStatus,
    transcripts,
    callLanguage,
    isConnected,
    handleImageUpload,
    handleCallBob,
  } = useAgriLens();

  const callButtonDisabled = !diagnosis && !demoMode;

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      {/* ── Ambient gradient background ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-green/4 blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-purple/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-brand-purple/3 blur-[80px]" />
        <div className="absolute top-1/2 right-1/4 w-56 h-56 rounded-full bg-brand-green/3 blur-[60px]" />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Brand */}
            <div className="flex items-start gap-3">
              {/* Logo icon */}
              <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green/20 to-brand-purple/20 border border-brand-green/30 flex items-center justify-center glow-green">
                  <Leaf className="w-5 h-5 text-brand-green" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center">
                  <Zap className="w-2 h-2 text-brand-green" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-white font-extrabold text-xl tracking-tight">
                    AgriLens{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-purple">
                      AI
                    </span>
                  </h1>
                  <LiveBadge />
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-white/30 text-[11px]">Powered by</span>
                  <TechPill
                    label="Gemini"
                    color="bg-blue-500/10 border-blue-500/30 text-blue-400"
                  />
                  <TechPill
                    label="ElevenLabs"
                    color="bg-purple-500/10 border-purple-500/30 text-purple-400"
                  />
                  <TechPill
                    label="Deepgram"
                    color="bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  />
                  <TechPill
                    label="Twilio"
                    color="bg-red-500/10 border-red-500/30 text-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Center: System status */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Vision Engine</span>
                <span className="text-brand-green">●</span>
                <span className="text-brand-green font-medium">Online</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Activity className="w-3.5 h-3.5" />
                <span>Real-time Pipeline</span>
                <span className="text-brand-green">●</span>
                <span className="text-brand-green font-medium">Active</span>
              </div>
            </div>

            {/* Right: Lot # + Socket indicator */}
            <div className="flex items-center gap-3">
              {/* Lot badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-green/35 bg-brand-green/8">
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <span className="text-brand-green text-sm font-bold tracking-widest">LOT #6</span>
              </div>

              {/* Socket status */}
              <SocketIndicator connected={isConnected} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-5 lg:px-8 py-6 flex flex-col gap-5">

        {/* ── Top 3-column row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Col 1: Image Upload */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-medium px-2">
                01 · Image Input
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border" />
            </div>
            <ImageUpload
              onUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
              uploadedImage={uploadedImage}
            />
          </div>

          {/* Col 2: Diagnosis */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-medium px-2">
                02 · Quality Diagnosis
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border" />
            </div>
            <DiagnosisCard diagnosis={diagnosis} />
          </div>

          {/* Col 3: Recommendations */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-medium px-2">
                03 · AI Recommendations
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border" />
            </div>
            <RecommendationsPanel diagnosis={diagnosis} />
          </div>
        </div>

        {/* ── Call Panel (full width) ───────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border" />
            <span className="text-white/30 text-xs uppercase tracking-widest font-medium px-2">
              04 · Worker Communication
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border" />
          </div>
          <CallPanel
            callStatus={callStatus}
            callLanguage={callLanguage}
            demoMode={demoMode}
            onDemoModeToggle={setDemoMode}
            onCallBob={handleCallBob}
            disabled={callButtonDisabled}
          />
        </div>

        {/* ── Transcript Feed (full width) ──────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border" />
            <span className="text-white/30 text-xs uppercase tracking-widest font-medium px-2">
              05 · Live Transcript & Translation
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border" />
          </div>
          <TranscriptFeed transcripts={transcripts} />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-brand-border bg-brand-dark/60 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/20 text-xs">
            <Leaf className="w-3.5 h-3.5 text-brand-green/40" />
            <span>AgriLens AI &copy; 2025</span>
            <span className="text-white/10">·</span>
            <span>UC Davis Hackathon MVP</span>
          </div>
          <div className="flex items-center gap-4 text-white/15 text-xs">
            <span>v0.1.0</span>
            <span className="text-white/10">·</span>
            <span>Next.js 14 · TypeScript · Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
