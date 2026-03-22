import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Loader2, AlertTriangle, Download, FileCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LikedImageCard } from './LikedImageCard';
import { HtmlConversionModal } from './HtmlConversionModal';

const airtableConfig = {
  pat: import.meta.env.VITE_AIRTABLE_PAT as string,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID as string,
  tableName: import.meta.env.VITE_AIRTABLE_TABLE_NAME as string,
};

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

function getField(fields: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    if (fields[key] && typeof fields[key] === 'string') return fields[key] as string;
  }
  return undefined;
}

function getImgUrl(record: AirtableRecord): string | undefined {
  return getField(record.fields, 'image_from_url', 'Direct Link', 'img_url', 'Image URL', 'url');
}

function getRecordId(record: AirtableRecord): string {
  return (getField(record.fields, 'record_id', 'Record_ID', 'name') || record.id);
}

interface LikedImagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brand: string;
}

export function LikedImagesPanel({ isOpen, onClose, brand }: LikedImagesPanelProps) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [showHtmlModal, setShowHtmlModal] = useState(false);

  const hasBrand = !!brand && brand !== 'Select a brand';
  const headerLabel = hasBrand ? `FAVORITES — ${brand.toUpperCase()}` : 'FAVORITES';
  const validRecords = records.filter(r => getImgUrl(r));

  const activeRecord = activeIdx !== null ? validRecords[activeIdx] : null;
  const activeImgUrl = activeRecord ? getImgUrl(activeRecord) : undefined;
  const activeRecordId = activeRecord ? getRecordId(activeRecord) : undefined;
  const previewOpen = activeIdx !== null && !!activeImgUrl;

  const fetchLikedImages = useCallback(async () => {
    if (!hasBrand) return;
    setLoading(true);
    setError(null);
    try {
      if (!airtableConfig.pat || !airtableConfig.baseId || !airtableConfig.tableName)
        throw new Error('Missing Airtable configuration.');
      const filterFormula = encodeURIComponent(`{brand_name}="${brand}"`);
      const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${encodeURIComponent(airtableConfig.tableName)}?filterByFormula=${filterFormula}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${airtableConfig.pat}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Airtable API error: ${response.status}`);
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load liked images');
    } finally {
      setLoading(false);
    }
  }, [brand, hasBrand]);

  useEffect(() => {
    if (isOpen && hasBrand) fetchLikedImages();
    if (isOpen && !hasBrand) { setRecords([]); setError(null); }
  }, [isOpen, hasBrand, fetchLikedImages]);

  useEffect(() => { if (!isOpen) setActiveIdx(null); }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (activeIdx !== null) { setActiveIdx(null); return; }
      onClose();
      return;
    }
    if (activeIdx === null) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i !== null && i < validRecords.length - 1 ? i + 1 : i));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i !== null && i > 0 ? i - 1 : i));
    }
  }, [activeIdx, validRecords.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleDownload = async (imgUrl: string, recordId: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = recordId || `liked-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch { window.open(imgUrl, '_blank'); }
  };

  const handleUnlike = async (recordId: string, imgUrl: string) => {
    setRecords(prev => prev.filter(r => getRecordId(r) !== recordId));
    if (activeIdx !== null) {
      const newLen = validRecords.length - 1;
      setActiveIdx(newLen === 0 ? null : Math.min(activeIdx, newLen - 1));
    }
    try {
      await fetch('https://automateoptinet.app.n8n.cloud/webhook/unlike-img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id: recordId, img_url: imgUrl }),
      });
    } catch { /* non-fatal */ }
  };

  const handleDownloadAll = async () => {
    for (const record of validRecords) {
      const imgUrl = getImgUrl(record);
      if (imgUrl) {
        handleDownload(imgUrl, getRecordId(record));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  if (!isOpen) return null;

  // ── Preview panel content (reused in both desktop and mobile layouts) ──
  const previewContent = previewOpen && activeImgUrl ? (
    <>
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Preview</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {activeIdx! + 1} / {validRecords.length}
          </span>
        </div>
        <button onClick={() => setActiveIdx(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20 min-h-0">
        <img
          key={activeImgUrl}
          src={activeImgUrl}
          alt={activeRecordId}
          className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
        />
      </div>

      {/* Nav + actions */}
      <div className="shrink-0 px-4 py-3 border-t border-border/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={activeIdx === 0}
            onClick={() => setActiveIdx(i => (i !== null && i > 0 ? i - 1 : i))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={activeIdx === validRecords.length - 1}
            onClick={() => setActiveIdx(i => (i !== null && i < validRecords.length - 1 ? i + 1 : i))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowHtmlModal(true)}>
            <FileCode className="w-3.5 h-3.5" />HTML
          </Button>
          <Button variant="outline" size="sm"
            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={() => activeRecordId && activeImgUrl && handleUnlike(activeRecordId, activeImgUrl)}>
            <Heart className="w-3.5 h-3.5 fill-current" />Unlike
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs gradient-primary"
            onClick={() => activeImgUrl && activeRecordId && handleDownload(activeImgUrl, activeRecordId)}>
            <Download className="w-3.5 h-3.5" />Download
          </Button>
        </div>
      </div>
    </>
  ) : null;

  // ── Favorites grid content ──
  const favoritesContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 bg-card/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">{headerLabel}</h2>
          {validRecords.length > 0 && (
            <span className="text-xs text-muted-foreground">{validRecords.length} images</span>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close panel">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Grid body */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasBrand && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <Heart className="w-16 h-16 text-muted-foreground/15 stroke-1" />
            <p className="text-base font-semibold text-foreground">Select a brand to view favorites</p>
          </div>
        )}
        {hasBrand && loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading favorites...</p>
          </div>
        )}
        {hasBrand && error && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <AlertTriangle className="w-12 h-12 text-destructive/50" />
            <p className="text-sm font-medium">Failed to load favorites</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLikedImages}>Retry</Button>
          </div>
        )}
        {hasBrand && !loading && !error && validRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <Heart className="w-16 h-16 text-muted-foreground/15 stroke-1" />
            <p className="text-base font-semibold">No {brand} favorites yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">Generate images and like your favorites!</p>
          </div>
        )}
        {hasBrand && !loading && !error && validRecords.length > 0 && (
          // 2 columns when preview is open (panel is narrower), 3 columns otherwise
          <div className={`grid gap-3 ${previewOpen ? 'grid-cols-2' : 'grid-cols-3 max-sm:grid-cols-2'}`}>
            {validRecords.map((record, i) => {
              const imgUrl = getImgUrl(record)!;
              const recordId = getRecordId(record);
              return (
                <LikedImageCard
                  key={record.id}
                  imgUrl={imgUrl}
                  recordId={recordId}
                  onView={() => setActiveIdx(i)}
                  onDownload={() => handleDownload(imgUrl, recordId)}
                  onUnlike={() => handleUnlike(recordId, imgUrl)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasBrand && !loading && !error && validRecords.length > 0 && (
        <div className="px-4 py-3 border-t border-border/40 bg-card flex justify-between items-center shrink-0">
          <span className="text-xs text-muted-foreground">{validRecords.length} image{validRecords.length !== 1 ? 's' : ''}</span>
          <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-2 h-8 text-xs">
            <Download className="w-3.5 h-3.5" />Download All
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Main overlay ── */}
      <div
        className="fixed inset-0 flex items-center justify-center p-3 sm:p-4"
        style={{ zIndex: 1001 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80"
          style={{ top: -100, left: -100, right: -100, bottom: -100 }}
          onClick={onClose}
        />

        {/*
          ── Responsive layout container ──
          - No preview open: favorites panel centered, full width up to 680px
          - Preview open on sm+: side-by-side (preview left, favorites right)
          - Preview open on mobile: favorites only (preview handled below as overlay)
        */}
        <div
          className="relative flex items-stretch gap-3 sm:gap-4"
          style={{
            maxHeight: '92vh',
            width: '100%',
            maxWidth: previewOpen ? 'min(96vw, 1160px)' : 'min(92vw, 680px)',
          }}
        >
          {/* ── LEFT: Preview panel — desktop/laptop only (hidden on mobile) ── */}
          {previewOpen && (
            <div
              className="hidden sm:flex flex-1 min-w-0 flex-col bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {previewContent}
            </div>
          )}

          {/* ── RIGHT: Favorites grid panel — always visible ── */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Favorites panel"
            className="flex flex-col bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
            style={{
              // Narrower when preview is open side-by-side, full width when no preview
              width: previewOpen ? 'min(38vw, 420px)' : '100%',
              minWidth: previewOpen ? 260 : undefined,
              flexShrink: 0,
            }}
            onClick={e => e.stopPropagation()}
          >
            {favoritesContent}
          </div>
        </div>
      </div>

      {/* ── MOBILE ONLY: Full-screen preview overlay when image is selected ── */}
      {previewOpen && (
        <div
          className="sm:hidden fixed inset-0 flex flex-col bg-card"
          style={{ zIndex: 1002 }}
          onClick={e => e.stopPropagation()}
        >
          {previewContent}
        </div>
      )}

      {showHtmlModal && activeImgUrl && (
        <HtmlConversionModal
          isOpen={showHtmlModal}
          onClose={() => setShowHtmlModal(false)}
          imageUrl={activeImgUrl}
        />
      )}
    </>
  );
}
