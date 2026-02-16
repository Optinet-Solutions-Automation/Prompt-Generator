import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Loader2, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LikedImageCard } from './LikedImageCard';
import { LikedImageViewModal } from './LikedImageViewModal';

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

function getBrandName(record: AirtableRecord): string {
  return (getField(record.fields, 'brand_name', 'Brand', 'brand') || '');
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
  const [viewImage, setViewImage] = useState<{ imgUrl: string; recordId: string } | null>(null);

  const hasBrand = !!brand && brand !== 'Select a brand';

  const headerLabel = hasBrand
    ? `FAVORITES - ${brand.toUpperCase()}`
    : 'FAVORITES - SELECT BRAND';

  const fetchLikedImages = useCallback(async () => {
    if (!hasBrand) return;

    setLoading(true);
    setError(null);

    try {
      if (!airtableConfig.pat || !airtableConfig.baseId || !airtableConfig.tableName) {
        throw new Error('Missing Airtable configuration. Check environment variables.');
      }

      const filterFormula = encodeURIComponent(`{brand_name}="${brand}"`);
      const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${encodeURIComponent(airtableConfig.tableName)}?filterByFormula=${filterFormula}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${airtableConfig.pat}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching liked images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load liked images');
    } finally {
      setLoading(false);
    }
  }, [brand, hasBrand]);

  useEffect(() => {
    if (isOpen && hasBrand) fetchLikedImages();
    if (isOpen && !hasBrand) {
      setRecords([]);
      setError(null);
    }
  }, [isOpen, hasBrand, fetchLikedImages]);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !viewImage) onClose();
  }, [onClose, viewImage]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleEsc]);

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
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  const handleUnlike = async (recordId: string, imgUrl: string) => {
    // Optimistic update: Remove immediately from UI
    setRecords(prev => prev.filter(r => getRecordId(r) !== recordId));

    try {
      // Call the webhook to handle unliking in the backend
      await fetch('https://automateoptinet.app.n8n.cloud/webhook/unlike-img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id: recordId, img_url: imgUrl }),
      });
    } catch (err) {
      console.error('Error unliking image:', err);
      // Optionally handle error (e.g., show toast), but UI is already updated
    }
  };

  const validRecords = records.filter(r => getImgUrl(r));

  const handleDownloadAll = async () => {
    if (!validRecords.length) return;

    // Iterate through all valid records and trigger download
    // Using a small delay to prevent browser "multiple downloads" blocking issues
    for (const record of validRecords) {
      const imgUrl = getImgUrl(record);
      const recordId = getRecordId(record);
      if (imgUrl) {
        handleDownload(imgUrl, recordId);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        style={{ zIndex: 998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Favorites panel"
        className="fixed right-5 flex flex-col bg-card rounded-xl border border-border animate-slide-in-right
          max-sm:inset-0 max-sm:right-0 max-sm:rounded-none max-sm:w-full max-sm:h-full
          sm:w-[600px] md:w-[700px]"
        style={{
          zIndex: 999,
          top: 'max(5vh, 20px)',
          height: 'min(88vh, calc(100vh - 40px))',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card rounded-t-xl sticky top-0 z-10 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{headerLabel}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* No brand selected state */}
          {!hasBrand && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <Heart className="w-24 h-24 text-muted-foreground/20 stroke-1" />
              <p className="text-xl font-semibold text-foreground">Please select a brand</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a brand from the dropdown to view your favorites
              </p>
            </div>
          )}

          {/* Loading */}
          {hasBrand && loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Loading favorites...</p>
            </div>
          )}

          {/* Error */}
          {hasBrand && error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <AlertTriangle className="w-16 h-16 text-destructive/60" />
              <p className="text-sm font-medium text-foreground">Failed to load favorites</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchLikedImages}>
                Retry
              </Button>
            </div>
          )}

          {/* No favorites for this brand */}
          {hasBrand && !loading && !error && validRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <Heart className="w-24 h-24 text-muted-foreground/20 stroke-1" />
              <p className="text-xl font-semibold text-foreground">
                No {brand} favorites yet
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start generating {brand} images and like your favorites!
              </p>
            </div>
          )}

          {/* Content: Image Grid */}
          {hasBrand && !loading && !error && validRecords.length > 0 && (
            <div className="space-y-6">
              {/* Image grid */}
              <div className="grid grid-cols-3 gap-5 max-sm:grid-cols-2 justify-items-center">
                {validRecords.map((record) => {
                  const imgUrl = getImgUrl(record)!;
                  const recordId = getRecordId(record);
                  return (
                    <LikedImageCard
                      key={record.id}
                      imgUrl={imgUrl}
                      recordId={recordId}
                      onView={() => setViewImage({ imgUrl, recordId })}
                      onDownload={() => handleDownload(imgUrl, recordId)}
                      onUnlike={() => handleUnlike(recordId, imgUrl)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Download All Button */}
        {hasBrand && !loading && !error && validRecords.length > 0 && (
          <div className="p-4 border-t border-border bg-card flex justify-end shrink-0 rounded-b-xl">
            <Button 
              onClick={handleDownloadAll} 
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 text-foreground"
            >
              <Download className="w-4 h-4" />
              Download All ({validRecords.length})
            </Button>
          </div>
        )}
      </div>

      {/* Full-size view modal */}
      {viewImage && (
        <LikedImageViewModal
          isOpen={!!viewImage}
          onClose={() => setViewImage(null)}
          imgUrl={viewImage.imgUrl}
          recordId={viewImage.recordId}
        />
      )}
    </>
  );
}
