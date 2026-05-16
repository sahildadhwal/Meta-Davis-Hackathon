'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSquare, Languages, Bot, User } from 'lucide-react';
import clsx from 'clsx';
import { Transcript } from '@/lib/api';

interface TranscriptFeedProps {
  transcripts: Transcript[];
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface BubbleProps {
  transcript: Transcript;
  isNew?: boolean;
}

function Bubble({ transcript, isNew }: BubbleProps) {
  const isAI = transcript.speaker === 'AI';

  return (
    <div
      className={clsx(
        'flex gap-2.5 max-w-[92%] bubble-enter',
        isAI ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
      style={{ animationDelay: isNew ? '0ms' : '0ms' }}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5',
          isAI
            ? 'bg-gradient-to-br from-brand-purple to-brand-green/70'
            : 'bg-white/10 border border-white/15'
        )}
      >
        {isAI ? (
          <Bot className="w-3.5 h-3.5 text-white" />
        ) : (
          <User className="w-3.5 h-3.5 text-white/70" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          'relative rounded-2xl px-3.5 py-2.5 max-w-full',
          isAI
            ? 'rounded-tr-sm bg-gradient-to-br from-brand-purple/30 to-brand-green/10 border border-brand-purple/30'
            : 'rounded-tl-sm bg-white/8 border border-white/10'
        )}
      >
        {/* Speaker + time */}
        <div
          className={clsx(
            'flex items-center gap-2 mb-1.5',
            isAI ? 'flex-row-reverse' : ''
          )}
        >
          <span
            className={clsx(
              'text-xs font-bold',
              isAI ? 'text-brand-green' : 'text-white/50'
            )}
          >
            {isAI ? 'AgriLens AI' : 'Bob'}
          </span>
          <span className="text-white/25 text-[10px] font-mono">
            {formatTime(transcript.timestamp)}
          </span>
        </div>

        {/* Text */}
        <p
          className={clsx(
            'text-sm leading-relaxed',
            isAI ? 'text-white/85' : 'text-white/70'
          )}
        >
          {transcript.text}
        </p>
      </div>
    </div>
  );
}

interface TranslationBubbleProps {
  transcript: Transcript;
}

function TranslationBubble({ transcript }: TranslationBubbleProps) {
  const isAI = transcript.speaker === 'AI';
  const hasTranslation = transcript.translation && transcript.translation !== transcript.text;

  if (!hasTranslation) {
    return (
      <div
        className={clsx(
          'flex gap-2.5 max-w-[92%]',
          isAI ? 'ml-auto flex-row-reverse' : 'mr-auto'
        )}
      >
        <div className="flex-shrink-0 w-7 h-7" /> {/* spacer */}
        <div className="rounded-2xl px-3.5 py-2.5 bg-white/3 border border-white/5">
          <p className="text-xs text-white/25 italic">
            {transcript.lang === 'en' ? '(already in English)' : '(no translation)'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex gap-2.5 max-w-[92%] bubble-enter',
        isAI ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 bg-amber-400/10 border border-amber-400/20">
        <Languages className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          'relative rounded-2xl px-3.5 py-2.5',
          isAI
            ? 'rounded-tr-sm bg-amber-400/5 border border-amber-400/20'
            : 'rounded-tl-sm bg-amber-400/5 border border-amber-400/20'
        )}
      >
        <div
          className={clsx(
            'flex items-center gap-2 mb-1.5',
            isAI ? 'flex-row-reverse' : ''
          )}
        >
          <span className="text-xs font-bold text-amber-400">
            {isAI ? 'AI' : 'Bob'} → EN
          </span>
          <span className="text-white/25 text-[10px] font-mono">
            {formatTime(transcript.timestamp)}
          </span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{transcript.translation}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[120px] py-8">
      <div className="w-12 h-12 rounded-xl border border-brand-border bg-white/3 flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-white/20" />
      </div>
      <div className="text-center">
        <p className="text-white/35 text-sm font-medium">Waiting for call to start...</p>
        <p className="text-white/20 text-xs mt-1">Live conversation will appear here</p>
      </div>

      {/* Animated placeholder dots */}
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-purple/30 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TranscriptFeed({ transcripts }: TranscriptFeedProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (leftRef.current) {
      leftRef.current.scrollTop = leftRef.current.scrollHeight;
    }
    if (rightRef.current) {
      rightRef.current.scrollTop = rightRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-green/20 via-brand-purple/60 to-brand-green/20" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-brand-border flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white/50" />
          </div>
          <span className="text-white font-semibold text-sm">Live Conversation</span>
          {transcripts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/50 text-xs">
              {transcripts.length} messages
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-white/35">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/10 border border-white/15" />
            <span>Bob (original)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/35">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400/20 border border-amber-400/30" />
            <span>Translation (EN)</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 divide-x divide-brand-border">
        {/* ── Left Column: Live Transcript (original) ── */}
        <div>
          {/* Column header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-border bg-white/2">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Live Transcript
            </span>
            <span className="ml-auto text-white/20 text-xs">Original · Multilingual</span>
          </div>

          {/* Messages */}
          <div
            ref={leftRef}
            className="flex flex-col gap-3 p-4 overflow-y-auto"
            style={{ maxHeight: '320px', minHeight: '160px' }}
          >
            {transcripts.length === 0 ? (
              <EmptyState />
            ) : (
              transcripts.map((t, idx) => (
                <Bubble
                  key={t.id}
                  transcript={t}
                  isNew={idx === transcripts.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right Column: Translation (English) ── */}
        <div>
          {/* Column header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-border bg-white/2">
            <Languages className="w-3.5 h-3.5 text-amber-400/70" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Live Translation
            </span>
            <span className="ml-auto text-white/20 text-xs">English · Deepgram</span>
          </div>

          {/* Messages */}
          <div
            ref={rightRef}
            className="flex flex-col gap-3 p-4 overflow-y-auto"
            style={{ maxHeight: '320px', minHeight: '160px' }}
          >
            {transcripts.length === 0 ? (
              <EmptyState />
            ) : (
              transcripts.map((t) => (
                <TranslationBubble key={`t-${t.id}`} transcript={t} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-brand-border bg-white/1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/60 animate-pulse" />
          <span className="text-white/25 text-xs">
            {transcripts.length > 0
              ? 'Streaming via Deepgram STT'
              : 'Waiting for call...'}
          </span>
        </div>
        <span className="text-white/15 text-xs font-mono">
          {transcripts.length > 0
            ? `Last: ${formatTime(transcripts[transcripts.length - 1].timestamp)}`
            : '--:--:--'}
        </span>
      </div>
    </div>
  );
}
