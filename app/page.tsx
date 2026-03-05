"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Tablet as TabletIcon,
  X,
  Plus,
  Expand,
  Shrink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { renderHwp } from '@/lib/hwp-helper';

/** Utility for Tailwind Classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface HwpFile {
  id: string;
  name: string;
  size: string;
  lastModified: Date;
  data: ArrayBuffer;
}

// --- Main Page Component ---
export default function Home() {
  const [files, setFiles] = useState<HwpFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isTablet, setIsTablet] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'viewer'>('list');
  const [renderingError, setRenderingError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerPanelRef = useRef<HTMLElement>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);

  // Handle Responsiveness (820px)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isTabletMode = width >= 820;
      setIsTablet(isTabletMode);
      if (!isTabletMode) setIsExpanded(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track browser fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen on the viewer panel
      const el = viewerPanelRef.current ?? document.documentElement;
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  // Sync mobile view state when file is selected
  useEffect(() => {
    if (!isTablet && selectedFileId) setMobileView('viewer');
  }, [selectedFileId, isTablet]);

  // Render HWP when selected file changes
  useEffect(() => {
    const triggerRender = async () => {
      if (selectedFile && viewerRef.current) {
        try {
          setRenderingError(null);
          viewerRef.current.innerHTML = '';
          await renderHwp(selectedFile.data, viewerRef.current);
        } catch (err: unknown) {
          console.error('Home: Render failed:', err);
          const errorMessage = err instanceof Error ? err.message : '파일을 읽는 중 오류가 발생했습니다.';
          setRenderingError(errorMessage);
        }
      }
    };
    triggerRender();
  }, [selectedFileId, files, selectedFile, mobileView, isTablet]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    Array.from(fileList).forEach(f => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          const newFile: HwpFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: f.name,
            size: (f.size / 1024).toFixed(1) + ' KB',
            lastModified: new Date(f.lastModified),
            data: event.target.result
          };
          setFiles(prev => [newFile, ...prev]);
          setSelectedFileId(currentId => currentId ?? newFile.id);
        }
      };
      reader.readAsArrayBuffer(f);
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f4f7fa] dark:bg-[#121212] overflow-hidden">
      {/* Header */}
      <header className={cn(
        "bg-white dark:bg-[#1e1e1e] transition-all px-6 border-b border-gray-100 dark:border-white/5",
        isTablet ? "py-4" : "py-8 pt-12"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            {!isTablet && mobileView === 'viewer' ? (
              <button
                onClick={() => setMobileView('list')}
                className="mb-4 flex items-center text-one-ui-blue font-semibold"
              >
                <ChevronLeft size={20} className="mr-1" /> 목록으로
              </button>
            ) : null}
            <h1 className={cn(
              "font-bold tracking-tight text-gray-900 dark:text-white",
              isTablet ? "text-xl" : "text-[32px]"
            )}>
              {isTablet || mobileView === 'list' ? "내 문서" : selectedFile?.name}
            </h1>
            {(isTablet || mobileView === 'list') && (
              <p className="text-gray-500 text-sm mt-1">{files.length}개의 파일</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-one-ui-blue hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-transform active:scale-90">
              <Plus size={24} />
              <input type="file" accept=".hwp" className="hidden" onChange={handleFileUpload} multiple />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* LEFT: File List */}
          {(!isExpanded && !isFullscreen && (isTablet || mobileView === 'list')) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "h-full overflow-y-auto bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-white/5 p-4",
                isTablet ? "w-[30%] min-w-[300px]" : "w-full"
              )}
            >
              <div className="space-y-2">
                {files.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[28px]">
                      <FileText size={48} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm">HWP 파일을 추가해 보세요</p>
                  </div>
                ) : (
                  files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-one-ui-sm transition-all group relative",
                        selectedFileId === file.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-one-ui-blue"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl",
                          selectedFileId === file.id ? "bg-one-ui-blue text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}>
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{file.name}</p>
                          <p className="text-xs opacity-60 mt-1">{file.size} • {file.lastModified.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          )}

          {/* RIGHT: Document Viewer */}
          {(isTablet || mobileView === 'viewer') && (
            <motion.main
              ref={viewerPanelRef}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "h-full flex flex-col overflow-hidden bg-[#f4f7fa] dark:bg-[#121212] p-4",
                isFullscreen ? "w-full fixed inset-0 z-50" :
                isTablet ? (isExpanded ? "w-full" : "w-[70%]") : "w-full"
              )}
            >
              <div className="bg-white dark:bg-[#1e1e1e] rounded-one-ui shadow-one-ui flex-1 flex flex-col relative overflow-hidden">
                {/* Viewer Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md sticky top-0 z-10">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest px-2">Document View</span>
                  <div className="flex items-center gap-1">
                    {/* Fullscreen button - always visible when a file is selected */}
                    {selectedFile && (
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors"
                        title={isFullscreen ? "전체화면 종료" : "전체화면"}
                      >
                        {isFullscreen ? <Shrink size={20} /> : <Expand size={20} />}
                      </button>
                    )}
                    {/* Split-view expand button (tablet only, not in fullscreen) */}
                    {isTablet && !isFullscreen && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors"
                        title={isExpanded ? "축소" : "패널 확대"}
                      >
                        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Content */}
                {/* ✅ 수정: overflow-y-auto, 수평 패딩 최소화 */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
                  {!selectedFile ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-full mb-6">
                        <TabletIcon size={64} strokeWidth={1} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">프리뷰할 문서가 없습니다</h2>
                      <p className="text-sm">왼쪽 목록에서 파일을 선택하거나<br />새 파일을 업로드해 주세요.</p>
                    </div>
                  ) : renderingError ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-500 text-center p-8">
                      <X className="w-16 h-16 mb-4 opacity-50" />
                      <h2 className="text-xl font-bold mb-2">파일을 읽는 중 오류가 발생했습니다</h2>
                      <p className="text-sm opacity-80">{renderingError}</p>
                      <button
                        onClick={() => setSelectedFileId(selectedFileId)}
                        className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : (
                    /* ✅ 수정:
                       - max-w / min-h 제거 → 컨텐츠 높이만큼 자연스럽게 성장
                       - 수평 패딩 제거 → hwp.js 내부 A4 폭과 충돌 방지
                       - w-full로 가로 꽉 채움
                    */
                    <div
                      ref={viewerRef}
                      className="w-full bg-white dark:bg-transparent shadow-sm ring-1 ring-gray-100 dark:ring-white/5 rounded-sm py-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hwp-content"
                    />
                  )}
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      {/* Dev mode indicator */}
      {!isFullscreen && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <div className="bg-black/80 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            MODE: {isTablet ? 'GALAXY TAB (Split)' : 'GALAXY PHONE (Single)'} {isExpanded && '| FULL'}
          </div>
        </div>
      )}
    </div>
  );
}
