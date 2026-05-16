'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
  uploadedImage: string | null;
}

export default function ImageUpload({
  onUpload,
  isAnalyzing,
  uploadedImage,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!isAnalyzing) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Lot badge */}
      <div className="absolute top-3 right-3 z-20">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-bold tracking-widest">
          LOT #6
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative flex-1 flex flex-col items-center justify-center',
          'rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
          'min-h-[280px]',
          {
            // Default state
            'border-brand-border bg-brand-card hover:border-brand-green/50 hover:glow-green':
              !isDragging && !uploadedImage,
            // Dragging
            'border-brand-green bg-brand-green/5 glow-green scale-[1.01]': isDragging,
            // Has image
            'border-brand-green/30 bg-black': uploadedImage,
            // Analyzing
            'cursor-not-allowed': isAnalyzing,
          }
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isAnalyzing}
        />

        {/* ── Uploaded Image Preview ── */}
        {uploadedImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Uploaded produce"
              className="w-full h-full object-cover"
              style={{ maxHeight: '320px', minHeight: '220px' }}
            />

            {/* Analyzing Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                {/* Scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-green to-transparent scan-line pointer-events-none" />

                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-brand-green/20 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-brand-green animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-brand-green/40 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-brand-green font-semibold text-sm">Analyzing Produce</p>
                    <p className="text-white/50 text-xs mt-1">Gemini Vision AI processing...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Done overlay (briefly shown) */}
            {!isAnalyzing && (
              <div
                className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 z-10"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">Replace Image</span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            {/* Icon */}
            <div className="relative">
              <div
                className={clsx(
                  'w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-300',
                  isDragging
                    ? 'border-brand-green bg-brand-green/10 glow-green'
                    : 'border-brand-border bg-white/5'
                )}
              >
                <Camera
                  className={clsx(
                    'w-9 h-9 transition-colors duration-300',
                    isDragging ? 'text-brand-green' : 'text-white/40'
                  )}
                />
              </div>
              {isDragging && (
                <div className="absolute -inset-1 rounded-2xl border border-brand-green/30 animate-ping" />
              )}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-base">
                {isDragging ? 'Drop to analyze' : 'Upload Produce Image'}
              </p>
              <p className="text-white/40 text-sm">or drag and drop here</p>
            </div>

            {/* Format hint */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-white/5">
              <ImageIcon className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/30 text-xs">JPG, PNG, WEBP, HEIC supported</span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="mt-1 px-5 py-2.5 rounded-lg bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm font-semibold hover:bg-brand-green/20 hover:border-brand-green/60 transition-all duration-200"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Bottom status */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {uploadedImage && !isAnalyzing && (
            <>
              <CheckCircle2 className="w-4 h-4 text-brand-green" />
              <span className="text-brand-green text-xs font-medium">Image loaded</span>
            </>
          )}
          {isAnalyzing && (
            <>
              <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
              <span className="text-brand-green text-xs font-medium">AI analyzing...</span>
            </>
          )}
          {!uploadedImage && !isAnalyzing && (
            <span className="text-white/30 text-xs">No image selected</span>
          )}
        </div>
        <span className="text-white/20 text-xs">Max 10MB</span>
      </div>
    </div>
  );
}
